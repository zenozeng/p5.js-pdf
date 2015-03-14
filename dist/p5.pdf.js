(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * p5.js-pdf
 * Copyright (c) 2015 Zeno Zeng<zenoofzeng@gmail.com>.
 * Licensed under the MIT License.
 *
 * Simple jsPDF API warpper for p5.js
 */

(function(p5) {

    "use strict";

    var jsPDF = require('./jspdf/index');

    var PDF = function(canvas, options) {
        this.pdf = new jsPDF();
        this.canvas = canvas && canvas.canvas;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    };

    // capture current canvas
    PDF.prototype.capture = function() {
        var jpg = this.canvas.toDataURL('image/png', 0.9);
        this.pdf.addImage(jpg, 'PNG', 0, 0, this.width, this.height);
        this.nextPage();
    };

    // go to nextpage
    PDF.prototype.nextPage = function() {
        this.pdf.addPage();
    };

    PDF.prototype.save = function(filename) {
        filename = filename || "untitled.pdf";
        // this.pdf.save(filename);
    };

    // Convert to Object URL using URL.createObjectURL
    // 适合用于在页面内直接显示 PDF
    PDF.prototype.toObjectURL = function() {
        return this.pdf.output('bloburi');
    };

    // convert to data url
    PDF.prototype.toDataURL = function() {
        return this.pdf.output('datauristring');
    };

    p5.PDF = PDF;

})(window.p5);

},{"./jspdf/index":2}],2:[function(require,module,exports){
var jsPDF = require('./jspdf');

// load addImage plugin and jsPDF API
require('./jspdf.plugin.addimage');

// load PNG plugin and update jsPDF API
require('./jspdf.plugin.png_support');

module.exports = jsPDF;

},{"./jspdf":3,"./jspdf.plugin.addimage":4,"./jspdf.plugin.png_support":5}],3:[function(require,module,exports){
/** @preserve
 * jsPDF - PDF Document creation from JavaScript
 * Version ${versionID}
 * CommitID ${commitID}
 *
 * Copyright (c) 2010-2014 James Hall, https://github.com/MrRio/jsPDF
 * 2010 Aaron Spike, https://github.com/acspike
 * 2012 Willow Systems Corporation, willow-systems.com
 * 2012 Pablo Hess, https://github.com/pablohess
 * 2012 Florian Jenett, https://github.com/fjenett
 * 2013 Warren Weckesser, https://github.com/warrenweckesser
 * 2013 Youssef Beddad, https://github.com/lifof
 * 2013 Lee Driscoll, https://github.com/lsdriscoll
 * 2013 Stefan Slonevskiy, https://github.com/stefslon
 * 2013 Jeremy Morel, https://github.com/jmorel
 * 2013 Christoph Hartmann, https://github.com/chris-rock
 * 2014 Juan Pablo Gaviria, https://github.com/juanpgaviria
 * 2014 James Makes, https://github.com/dollaruw
 * 2014 Diego Casorran, https://github.com/diegocr
 * 2014 Steven Spungin, https://github.com/Flamenco
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * Contributor(s):
 * siefkenj, ahwolf, rickygu, Midnith, saintclair, eaparango,
 * kim3er, mfo, alnorth, Flamenco
 */
/**
 * Creates new jsPDF document object instance.
 *
 * @class
 * @param orientation One of "portrait" or "landscape" (or shortcuts "p" (Default), "l")
 * @param unit Measurement unit to be used when coordinates are specified.
 * One of "pt" (points), "mm" (Default), "cm", "in"
 * @param format One of 'pageFormats' as shown below, default: a4
 * @returns {jsPDF}
 * @name jsPDF
 */
var jsPDF = (function(global) {
    'use strict';
    var pdfVersion = '1.3',
        pageFormats = { // Size in pt of various paper formats
            'a0' : [2383.94, 3370.39], 'a1' : [1683.78, 2383.94],
            'a2' : [1190.55, 1683.78], 'a3' : [ 841.89, 1190.55],
            'a4' : [ 595.28, 841.89], 'a5' : [ 419.53, 595.28],
            'a6' : [ 297.64, 419.53], 'a7' : [ 209.76, 297.64],
            'a8' : [ 147.40, 209.76], 'a9' : [ 104.88, 147.40],
            'a10' : [ 73.70, 104.88], 'b0' : [2834.65, 4008.19],
            'b1' : [2004.09, 2834.65], 'b2' : [1417.32, 2004.09],
            'b3' : [1000.63, 1417.32], 'b4' : [ 708.66, 1000.63],
            'b5' : [ 498.90, 708.66], 'b6' : [ 354.33, 498.90],
            'b7' : [ 249.45, 354.33], 'b8' : [ 175.75, 249.45],
            'b9' : [ 124.72, 175.75], 'b10' : [ 87.87, 124.72],
            'c0' : [2599.37, 3676.54], 'c1' : [1836.85, 2599.37],
            'c2' : [1298.27, 1836.85], 'c3' : [ 918.43, 1298.27],
            'c4' : [ 649.13, 918.43], 'c5' : [ 459.21, 649.13],
            'c6' : [ 323.15, 459.21], 'c7' : [ 229.61, 323.15],
            'c8' : [ 161.57, 229.61], 'c9' : [ 113.39, 161.57],
            'c10' : [ 79.37, 113.39], 'dl' : [ 311.81, 623.62],
            'letter' : [612, 792],
            'government-letter' : [576, 756],
            'legal' : [612, 1008],
            'junior-legal' : [576, 360],
            'ledger' : [1224, 792],
            'tabloid' : [792, 1224],
            'credit-card' : [153, 243]
        };
    /**
     * jsPDF's Internal PubSub Implementation.
     * See mrrio.github.io/jsPDF/doc/symbols/PubSub.html
     * Backward compatible rewritten on 2014 by
     * Diego Casorran, https://github.com/diegocr
     *
     * @class
     * @name PubSub
     */
    function PubSub(context) {
        var topics = {};
        this.subscribe = function(topic, callback, once) {
            if(typeof callback !== 'function') {
                return false;
            }
            if(!topics.hasOwnProperty(topic)) {
                topics[topic] = {};
            }
            var id = Math.random().toString(35);
            topics[topic][id] = [callback,!!once];
            return id;
        };
        this.unsubscribe = function(token) {
            for(var topic in topics) {
                if(topics[topic][token]) {
                    delete topics[topic][token];
                    return true;
                }
            }
            return false;
        };
        this.publish = function(topic) {
            if(topics.hasOwnProperty(topic)) {
                var args = Array.prototype.slice.call(arguments, 1), idr = [];
                for(var id in topics[topic]) {
                    var sub = topics[topic][id];
                    try {
                        sub[0].apply(context, args);
                    } catch(ex) {
                        if(global.console) {
                            console.error('jsPDF PubSub Error', ex.message, ex);
                        }
                    }
                    if(sub[1]) idr.push(id);
                }
                if(idr.length) idr.forEach(this.unsubscribe);
            }
        };
    }
    /**
     * @constructor
     * @private
     */
    function jsPDF(orientation, unit, format, compressPdf) {
        var options = {};
        if (typeof orientation === 'object') {
            options = orientation;
            orientation = options.orientation;
            unit = options.unit || unit;
            format = options.format || format;
            compressPdf = options.compress || options.compressPdf || compressPdf;
        }
        // Default options
        unit = unit || 'mm';
        format = format || 'a4';
        orientation = ('' + (orientation || 'P')).toLowerCase();
        var format_as_string = ('' + format).toLowerCase(),
            compress = !!compressPdf && typeof Uint8Array === 'function',
            textColor = options.textColor || '0 g',
            drawColor = options.drawColor || '0 G',
            activeFontSize = options.fontSize || 16,
            lineHeightProportion = options.lineHeight || 1.15,
            lineWidth = options.lineWidth || 0.200025, // 2mm
            objectNumber = 2, // 'n' Current object number
            outToPages = !1, // switches where out() prints. outToPages true = push to pages obj. outToPages false = doc builder content
            offsets = [], // List of offsets. Activated and reset by buildDocument(). Pupulated by various calls buildDocument makes.
            fonts = {}, // collection of font objects, where key is fontKey - a dynamically created label for a given font.
            fontmap = {}, // mapping structure fontName > fontStyle > font key - performance layer. See addFont()
            activeFontKey, // will be string representing the KEY of the font as combination of fontName + fontStyle
            k, // Scale factor
            tmp,
            page = 0,
            currentPage,
            pages = [],
            pagedim = {},
            content = [],
            lineCapID = 0,
            lineJoinID = 0,
            content_length = 0,
            pageWidth,
            pageHeight,
            pageMode,
            zoomMode,
            layoutMode,
            documentProperties = {
                'title' : '',
                'subject' : '',
                'author' : '',
                'keywords' : '',
                'creator' : ''
            },
            API = {},
            events = new PubSub(API),
            lastTextWasStroke = false,
            /////////////////////
            // Private functions
            /////////////////////
            f2 = function(number) {
                return number.toFixed(2); // Ie, %.2f
            },
            f3 = function(number) {
                return number.toFixed(3); // Ie, %.3f
            },
            padd2 = function(number) {
                return ('0' + parseInt(number)).slice(-2);
            },
            out = function(string) {
                if (outToPages) {
                    /* set by beginPage */
                    pages[currentPage].push(string);
                } else {
                    // +1 for '\n' that will be used to join 'content'
                    content_length += string.length + 1;
                    content.push(string);
                }
            },
            newObject = function() {
                // Begin a new object
                objectNumber++;
                offsets[objectNumber] = content_length;
                out(objectNumber + ' 0 obj');
                return objectNumber;
            },
            // Does not output the object. The caller must call newObjectDeferredBegin(oid) before outputing any data
            newObjectDeferred = function() {
                objectNumber++;
                offsets[objectNumber] = function(){
                    return content_length;
                };
                return objectNumber;
            },
            newObjectDeferredBegin = function(oid) {
                offsets[oid] = content_length;
            },
            putStream = function(str) {
                out('stream');
                out(str);
                out('endstream');
            },
            putPages = function() {
                var n,p,arr,i,deflater,adler32,adler32cs,wPt,hPt;
                adler32cs = global.adler32cs || jsPDF.adler32cs;
                if (compress && typeof adler32cs === 'undefined') {
                    compress = false;
                }
                // outToPages = false as set in endDocument(). out() writes to content.
                for (n = 1; n <= page; n++) {
                    newObject();
                    wPt = (pageWidth = pagedim[n].width) * k;
                    hPt = (pageHeight = pagedim[n].height) * k;
                    out('<</Type /Page');
                    out('/Parent 1 0 R');
                    out('/Resources 2 0 R');
                    out('/MediaBox [0 0 ' + f2(wPt) + ' ' + f2(hPt) + ']');
                    out('/Contents ' + (objectNumber + 1) + ' 0 R');
                    // Added for annotation plugin
                    events.publish('putPage', {pageNumber:n,page:pages[n]});
                    out('>>');
                    out('endobj');
                    // Page content
                    p = pages[n].join('\n');
                    newObject();
                    if (compress) {
                        arr = [];
                        i = p.length;
                        while(i--) {
                            arr[i] = p.charCodeAt(i);
                        }
                        adler32 = adler32cs.from(p);
                        deflater = new Deflater(6);
                        deflater.append(new Uint8Array(arr));
                        p = deflater.flush();
                        arr = new Uint8Array(p.length + 6);
                        arr.set(new Uint8Array([120, 156])),
                        arr.set(p, 2);
                        arr.set(new Uint8Array([adler32 & 0xFF, (adler32 >> 8) & 0xFF, (adler32 >> 16) & 0xFF, (adler32 >> 24) & 0xFF]), p.length+2);
                        p = String.fromCharCode.apply(null, arr);
                        out('<</Length ' + p.length + ' /Filter [/FlateDecode]>>');
                    } else {
                        out('<</Length ' + p.length + '>>');
                    }
                    putStream(p);
                    out('endobj');
                }
                offsets[1] = content_length;
                out('1 0 obj');
                out('<</Type /Pages');
                var kids = '/Kids [';
                for (i = 0; i < page; i++) {
                    kids += (3 + 2 * i) + ' 0 R ';
                }
                out(kids + ']');
                out('/Count ' + page);
                out('>>');
                out('endobj');
            },
            putFont = function(font) {
                font.objectNumber = newObject();
                out('<</BaseFont/' + font.PostScriptName + '/Type/Font');
                if (typeof font.encoding === 'string') {
                    out('/Encoding/' + font.encoding);
                }
                out('/Subtype/Type1>>');
                out('endobj');
            },
            putFonts = function() {
                for (var fontKey in fonts) {
                    if (fonts.hasOwnProperty(fontKey)) {
                        putFont(fonts[fontKey]);
                    }
                }
            },
            putXobjectDict = function() {
                // Loop through images, or other data objects
                events.publish('putXobjectDict');
            },
            putResourceDictionary = function() {
                out('/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]');
                out('/Font <<');
                // Do this for each font, the '1' bit is the index of the font
                for (var fontKey in fonts) {
                    if (fonts.hasOwnProperty(fontKey)) {
                        out('/' + fontKey + ' ' + fonts[fontKey].objectNumber + ' 0 R');
                    }
                }
                out('>>');
                out('/XObject <<');
                putXobjectDict();
                out('>>');
            },
            putResources = function() {
                putFonts();
                events.publish('putResources');
                // Resource dictionary
                offsets[2] = content_length;
                out('2 0 obj');
                out('<<');
                putResourceDictionary();
                out('>>');
                out('endobj');
                events.publish('postPutResources');
            },
            addToFontDictionary = function(fontKey, fontName, fontStyle) {
                // this is mapping structure for quick font key lookup.
                // returns the KEY of the font (ex: "F1") for a given
                // pair of font name and type (ex: "Arial". "Italic")
                if (!fontmap.hasOwnProperty(fontName)) {
                    fontmap[fontName] = {};
                }
                fontmap[fontName][fontStyle] = fontKey;
            },
            /**
             * FontObject describes a particular font as member of an instnace of jsPDF
             *
             * It's a collection of properties like 'id' (to be used in PDF stream),
             * 'fontName' (font's family name), 'fontStyle' (font's style variant label)
             *
             * @class
             * @public
             * @property id {String} PDF-document-instance-specific label assinged to the font.
             * @property PostScriptName {String} PDF specification full name for the font
             * @property encoding {Object} Encoding_name-to-Font_metrics_object mapping.
             * @name FontObject
             */
            addFont = function(PostScriptName, fontName, fontStyle, encoding) {
                var fontKey = 'F' + (Object.keys(fonts).length + 1).toString(10),
                    // This is FontObject
                    font = fonts[fontKey] = {
                        'id' : fontKey,
                        'PostScriptName' : PostScriptName,
                        'fontName' : fontName,
                        'fontStyle' : fontStyle,
                        'encoding' : encoding,
                        'metadata' : {}
                    };
                addToFontDictionary(fontKey, fontName, fontStyle);
                events.publish('addFont', font);
                return fontKey;
            },
            addFonts = function() {
                var HELVETICA = "helvetica",
                    TIMES = "times",
                    COURIER = "courier",
                    NORMAL = "normal",
                    BOLD = "bold",
                    ITALIC = "italic",
                    BOLD_ITALIC = "bolditalic",
                    encoding = 'StandardEncoding',
                    standardFonts = [
                        ['Helvetica', HELVETICA, NORMAL],
                        ['Helvetica-Bold', HELVETICA, BOLD],
                        ['Helvetica-Oblique', HELVETICA, ITALIC],
                        ['Helvetica-BoldOblique', HELVETICA, BOLD_ITALIC],
                        ['Courier', COURIER, NORMAL],
                        ['Courier-Bold', COURIER, BOLD],
                        ['Courier-Oblique', COURIER, ITALIC],
                        ['Courier-BoldOblique', COURIER, BOLD_ITALIC],
                        ['Times-Roman', TIMES, NORMAL],
                        ['Times-Bold', TIMES, BOLD],
                        ['Times-Italic', TIMES, ITALIC],
                        ['Times-BoldItalic', TIMES, BOLD_ITALIC]
                    ];
                for (var i = 0, l = standardFonts.length; i < l; i++) {
                    var fontKey = addFont(
                        standardFonts[i][0],
                        standardFonts[i][1],
                        standardFonts[i][2],
                        encoding);
                    // adding aliases for standard fonts, this time matching the capitalization
                    var parts = standardFonts[i][0].split('-');
                    addToFontDictionary(fontKey, parts[0], parts[1] || '');
                }
                events.publish('addFonts', { fonts : fonts, dictionary : fontmap });
            },
            SAFE = function __safeCall(fn) {
                fn.foo = function __safeCallWrapper() {
                    try {
                        return fn.apply(this, arguments);
                    } catch (e) {
                        var stack = e.stack || '';
                        if(~stack.indexOf(' at ')) stack = stack.split(" at ")[1];
                        var m = "Error in function " + stack.split("\n")[0].split('<')[0] + ": " + e.message;
                        if(global.console) {
                            global.console.error(m, e);
                            if(global.alert) alert(m);
                        } else {
                            throw new Error(m);
                        }
                    }
                };
                fn.foo.bar = fn;
                return fn.foo;
            },
            to8bitStream = function(text, flags) {
                /**
                 * PDF 1.3 spec:
                 * "For text strings encoded in Unicode, the first two bytes must be 254 followed by
                 * 255, representing the Unicode byte order marker, U+FEFF. (This sequence conflicts
                 * with the PDFDocEncoding character sequence thorn ydieresis, which is unlikely
                 * to be a meaningful beginning of a word or phrase.) The remainder of the
                 * string consists of Unicode character codes, according to the UTF-16 encoding
                 * specified in the Unicode standard, version 2.0. Commonly used Unicode values
                 * are represented as 2 bytes per character, with the high-order byte appearing first
                 * in the string."
                 *
                 * In other words, if there are chars in a string with char code above 255, we
                 * recode the string to UCS2 BE - string doubles in length and BOM is prepended.
                 *
                 * HOWEVER!
                 * Actual *content* (body) text (as opposed to strings used in document properties etc)
                 * does NOT expect BOM. There, it is treated as a literal GID (Glyph ID)
                 *
                 * Because of Adobe's focus on "you subset your fonts!" you are not supposed to have
                 * a font that maps directly Unicode (UCS2 / UTF16BE) code to font GID, but you could
                 * fudge it with "Identity-H" encoding and custom CIDtoGID map that mimics Unicode
                 * code page. There, however, all characters in the stream are treated as GIDs,
                 * including BOM, which is the reason we need to skip BOM in content text (i.e. that
                 * that is tied to a font).
                 *
                 * To signal this "special" PDFEscape / to8bitStream handling mode,
                 * API.text() function sets (unless you overwrite it with manual values
                 * given to API.text(.., flags) )
                 * flags.autoencode = true
                 * flags.noBOM = true
                 *
                 * ===================================================================================
                 * `flags` properties relied upon:
                 * .sourceEncoding = string with encoding label.
                 * "Unicode" by default. = encoding of the incoming text.
                 * pass some non-existing encoding name
                 * (ex: 'Do not touch my strings! I know what I am doing.')
                 * to make encoding code skip the encoding step.
                 * .outputEncoding = Either valid PDF encoding name
                 * (must be supported by jsPDF font metrics, otherwise no encoding)
                 * or a JS object, where key = sourceCharCode, value = outputCharCode
                 * missing keys will be treated as: sourceCharCode === outputCharCode
                 * .noBOM
                 * See comment higher above for explanation for why this is important
                 * .autoencode
                 * See comment higher above for explanation for why this is important
                 */
                var i,l,sourceEncoding,encodingBlock,outputEncoding,newtext,isUnicode,ch,bch;
                flags = flags || {};
                sourceEncoding = flags.sourceEncoding || 'Unicode';
                outputEncoding = flags.outputEncoding;
                // This 'encoding' section relies on font metrics format
                // attached to font objects by, among others,
                // "Willow Systems' standard_font_metrics plugin"
                // see jspdf.plugin.standard_font_metrics.js for format
                // of the font.metadata.encoding Object.
                // It should be something like
                // .encoding = {'codePages':['WinANSI....'], 'WinANSI...':{code:code, ...}}
                // .widths = {0:width, code:width, ..., 'fof':divisor}
                // .kerning = {code:{previous_char_code:shift, ..., 'fof':-divisor},...}
                if ((flags.autoencode || outputEncoding) &&
                    fonts[activeFontKey].metadata &&
                    fonts[activeFontKey].metadata[sourceEncoding] &&
                    fonts[activeFontKey].metadata[sourceEncoding].encoding) {
                    encodingBlock = fonts[activeFontKey].metadata[sourceEncoding].encoding;
                    // each font has default encoding. Some have it clearly defined.
                    if (!outputEncoding && fonts[activeFontKey].encoding) {
                        outputEncoding = fonts[activeFontKey].encoding;
                    }
                    // Hmmm, the above did not work? Let's try again, in different place.
                    if (!outputEncoding && encodingBlock.codePages) {
                        outputEncoding = encodingBlock.codePages[0]; // let's say, first one is the default
                    }
                    if (typeof outputEncoding === 'string') {
                        outputEncoding = encodingBlock[outputEncoding];
                    }
                    // we want output encoding to be a JS Object, where
                    // key = sourceEncoding's character code and
                    // value = outputEncoding's character code.
                    if (outputEncoding) {
                        isUnicode = false;
                        newtext = [];
                        for (i = 0, l = text.length; i < l; i++) {
                            ch = outputEncoding[text.charCodeAt(i)];
                            if (ch) {
                                newtext.push(
                                    String.fromCharCode(ch));
                            } else {
                                newtext.push(
                                    text[i]);
                            }
                            // since we are looping over chars anyway, might as well
                            // check for residual unicodeness
                            if (newtext[i].charCodeAt(0) >> 8) {
                                /* more than 255 */
                                isUnicode = true;
                            }
                        }
                        text = newtext.join('');
                    }
                }
                i = text.length;
                // isUnicode may be set to false above. Hence the triple-equal to undefined
                while (isUnicode === undefined && i !== 0) {
                    if (text.charCodeAt(i - 1) >> 8) {
                        /* more than 255 */
                        isUnicode = true;
                    }
                    i--;
                }
                if (!isUnicode) {
                    return text;
                }
                newtext = flags.noBOM ? [] : [254, 255];
                for (i = 0, l = text.length; i < l; i++) {
                    ch = text.charCodeAt(i);
                    bch = ch >> 8; // divide by 256
                    if (bch >> 8) {
                        /* something left after dividing by 256 second time */
                        throw new Error("Character at position " + i + " of string '"
                                        + text + "' exceeds 16bits. Cannot be encoded into UCS-2 BE");
                    }
                    newtext.push(bch);
                    newtext.push(ch - (bch << 8));
                }
                return String.fromCharCode.apply(undefined, newtext);
            },
            pdfEscape = function(text, flags) {
                /**
                 * Replace '/', '(', and ')' with pdf-safe versions
                 *
                 * Doing to8bitStream does NOT make this PDF display unicode text. For that
                 * we also need to reference a unicode font and embed it - royal pain in the rear.
                 *
                 * There is still a benefit to to8bitStream - PDF simply cannot handle 16bit chars,
                 * which JavaScript Strings are happy to provide. So, while we still cannot display
                 * 2-byte characters property, at least CONDITIONALLY converting (entire string containing)
                 * 16bit chars to (USC-2-BE) 2-bytes per char + BOM streams we ensure that entire PDF
                 * is still parseable.
                 * This will allow immediate support for unicode in document properties strings.
                 */
                return to8bitStream(text, flags).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
            },
            putInfo = function() {
                out('/Producer (jsPDF ' + jsPDF.version + ')');
                for(var key in documentProperties) {
                    if(documentProperties.hasOwnProperty(key) && documentProperties[key]) {
                        out('/'+key.substr(0,1).toUpperCase() + key.substr(1)
                            +' (' + pdfEscape(documentProperties[key]) + ')');
                    }
                }
                var created = new Date(),
                    tzoffset = created.getTimezoneOffset(),
                    tzsign = tzoffset < 0 ? '+' : '-',
                    tzhour = Math.floor(Math.abs(tzoffset / 60)),
                    tzmin = Math.abs(tzoffset % 60),
                    tzstr = [tzsign, padd2(tzhour), "'", padd2(tzmin), "'"].join('');
                out(['/CreationDate (D:',
                     created.getFullYear(),
                     padd2(created.getMonth() + 1),
                     padd2(created.getDate()),
                     padd2(created.getHours()),
                     padd2(created.getMinutes()),
                     padd2(created.getSeconds()), tzstr, ')'].join(''));
            },
            putCatalog = function() {
                out('/Type /Catalog');
                out('/Pages 1 0 R');
                // PDF13ref Section 7.2.1
                if (!zoomMode) zoomMode = 'fullwidth';
                switch(zoomMode) {
                    case 'fullwidth' : out('/OpenAction [3 0 R /FitH null]'); break;
                    case 'fullheight' : out('/OpenAction [3 0 R /FitV null]'); break;
                    case 'fullpage' : out('/OpenAction [3 0 R /Fit]'); break;
                    case 'original' : out('/OpenAction [3 0 R /XYZ null null 1]'); break;
                    default:
                        var pcn = '' + zoomMode;
                        if (pcn.substr(pcn.length-1) === '%')
                            zoomMode = parseInt(zoomMode) / 100;
                        if (typeof zoomMode === 'number') {
                            out('/OpenAction [3 0 R /XYZ null null '+f2(zoomMode)+']');
                        }
                }
                if (!layoutMode) layoutMode = 'continuous';
                switch(layoutMode) {
                    case 'continuous' : out('/PageLayout /OneColumn'); break;
                    case 'single' : out('/PageLayout /SinglePage'); break;
                    case 'two':
                    case 'twoleft' : out('/PageLayout /TwoColumnLeft'); break;
                    case 'tworight' : out('/PageLayout /TwoColumnRight'); break;
                }
                if (pageMode) {
                    /**
                     * A name object specifying how the document should be displayed when opened:
                     * UseNone : Neither document outline nor thumbnail images visible -- DEFAULT
                     * UseOutlines : Document outline visible
                     * UseThumbs : Thumbnail images visible
                     * FullScreen : Full-screen mode, with no menu bar, window controls, or any other window visible
                     */
                    out('/PageMode /' + pageMode);
                }
                events.publish('putCatalog');
            },
            putTrailer = function() {
                out('/Size ' + (objectNumber + 1));
                out('/Root ' + objectNumber + ' 0 R');
                out('/Info ' + (objectNumber - 1) + ' 0 R');
            },
            beginPage = function(width,height) {
                // Dimensions are stored as user units and converted to points on output
                var orientation = typeof height === 'string' && height.toLowerCase();
                if (typeof width === 'string') {
                    var format = width.toLowerCase();
                    if (pageFormats.hasOwnProperty(format)) {
                        width = pageFormats[format][0] / k;
                        height = pageFormats[format][1] / k;
                    }
                }
                if (Array.isArray(width)) {
                    height = width[1];
                    width = width[0];
                }
                if (orientation) {
                    switch(orientation.substr(0,1)) {
                        case 'l': if (height > width ) orientation = 's'; break;
                        case 'p': if (width > height ) orientation = 's'; break;
                    }
                    if (orientation === 's') { tmp = width; width = height; height = tmp; }
                }
                outToPages = true;
                pages[++page] = [];
                pagedim[page] = {
                    width : Number(width) || pageWidth,
                    height : Number(height) || pageHeight
                };
                _setPage(page);
            },
            _addPage = function() {
                beginPage.apply(this, arguments);
                // Set line width
                out(f2(lineWidth * k) + ' w');
                // Set draw color
                out(drawColor);
                // resurrecting non-default line caps, joins
                if (lineCapID !== 0) {
                    out(lineCapID + ' J');
                }
                if (lineJoinID !== 0) {
                    out(lineJoinID + ' j');
                }
                events.publish('addPage', { pageNumber : page });
            },
            _setPage = function(n) {
                if (n > 0 && n <= page) {
                    currentPage = n;
                    pageWidth = pagedim[n].width;
                    pageHeight = pagedim[n].height;
                }
            },
            /**
             * Returns a document-specific font key - a label assigned to a
             * font name + font type combination at the time the font was added
             * to the font inventory.
             *
             * Font key is used as label for the desired font for a block of text
             * to be added to the PDF document stream.
             * @private
             * @function
             * @param fontName {String} can be undefined on "falthy" to indicate "use current"
             * @param fontStyle {String} can be undefined on "falthy" to indicate "use current"
             * @returns {String} Font key.
             */
            getFont = function(fontName, fontStyle) {
                var key;
                fontName = fontName !== undefined ? fontName : fonts[activeFontKey].fontName;
                fontStyle = fontStyle !== undefined ? fontStyle : fonts[activeFontKey].fontStyle;
                try {
                    // get a string like 'F3' - the KEY corresponding tot he font + type combination.
                    key = fontmap[fontName][fontStyle];
                } catch (e) {}
                if (!key) {
                    throw new Error("Unable to look up font label for font '" + fontName + "', '"
                                    + fontStyle + "'. Refer to getFontList() for available fonts.");
                }
                return key;
            },
            buildDocument = function() {
                outToPages = false; // switches out() to content
                objectNumber = 2;
                content = [];
                offsets = [];
                // putHeader()
                out('%PDF-' + pdfVersion);
                putPages();
                putResources();
                // Info
                newObject();
                out('<<');
                putInfo();
                out('>>');
                out('endobj');
                // Catalog
                newObject();
                out('<<');
                putCatalog();
                out('>>');
                out('endobj');
                // Cross-ref
                var o = content_length, i, p = "0000000000";
                out('xref');
                out('0 ' + (objectNumber + 1));
                out(p+' 65535 f ');
                for (i = 1; i <= objectNumber; i++) {
                    var offset = offsets[i];
                    if (typeof offset === 'function'){
                        out((p + offsets[i]()).slice(-10) + ' 00000 n ');
                    }else{
                        out((p + offsets[i]).slice(-10) + ' 00000 n ');
                    }
                }
                // Trailer
                out('trailer');
                out('<<');
                putTrailer();
                out('>>');
                out('startxref');
                out(o);
                out('%%EOF');
                outToPages = true;
                return content.join('\n');
            },
            getStyle = function(style) {
                // see path-painting operators in PDF spec
                var op = 'S'; // stroke
                if (style === 'F') {
                    op = 'f'; // fill
                } else if (style === 'FD' || style === 'DF') {
                    op = 'B'; // both
                } else if (style === 'f' || style === 'f*' || style === 'B' || style === 'B*') {
                    /*
                     Allow direct use of these PDF path-painting operators:
                     - f fill using nonzero winding number rule
                     - f* fill using even-odd rule
                     - B fill then stroke with fill using non-zero winding number rule
                     - B* fill then stroke with fill using even-odd rule
                     */
                    op = style;
                }
                return op;
            },
            getArrayBuffer = function() {
                var data = buildDocument(), len = data.length,
                    ab = new ArrayBuffer(len), u8 = new Uint8Array(ab);
                while(len--) u8[len] = data.charCodeAt(len);
                return ab;
            },
            getBlob = function() {
                return new Blob([getArrayBuffer()], { type : "application/pdf" });
            },
            /**
             * Generates the PDF document.
             *
             * If `type` argument is undefined, output is raw body of resulting PDF returned as a string.
             *
             * @param {String} type A string identifying one of the possible output types.
             * @param {Object} options An object providing some additional signalling to PDF generator.
             * @function
             * @returns {jsPDF}
             * @methodOf jsPDF#
             * @name output
             */
            output = SAFE(function(type, options) {
                var datauri = ('' + type).substr(0,6) === 'dataur'
                        ? 'data:application/pdf;base64,'+btoa(buildDocument()):0;
                switch (type) {
                    case undefined:
                        return buildDocument();
                    case 'save':
                        if (navigator.getUserMedia) {
                            if (global.URL === undefined
                                || global.URL.createObjectURL === undefined) {
                                return API.output('dataurlnewwindow');
                            }
                        }
                        saveAs(getBlob(), options);
                        if(typeof saveAs.unload === 'function') {
                            if(global.setTimeout) {
                                setTimeout(saveAs.unload,911);
                            }
                        }
                        break;
                    case 'arraybuffer':
                        return getArrayBuffer();
                    case 'blob':
                        return getBlob();
                    case 'bloburi':
                    case 'bloburl':
                        // User is responsible of calling revokeObjectURL
                        return global.URL && global.URL.createObjectURL(getBlob()) || void 0;
                    case 'datauristring':
                    case 'dataurlstring':
                        return datauri;
                    case 'dataurlnewwindow':
                        var nW = global.open(datauri);
                        if (nW || typeof safari === "undefined") return nW;
                        /* pass through */
                    case 'datauri':
                    case 'dataurl':
                        return global.document.location.href = datauri;
                    default:
                        throw new Error('Output type "' + type + '" is not supported.');
                }
                // @TODO: Add different output options
            });
        switch (unit) {
            case 'pt': k = 1; break;
            case 'mm': k = 72 / 25.4000508; break;
            case 'cm': k = 72 / 2.54000508; break;
            case 'in': k = 72; break;
            case 'px': k = 96 / 72; break;
            case 'pc': k = 12; break;
            case 'em': k = 12; break;
            case 'ex': k = 6; break;
            default:
                throw ('Invalid unit: ' + unit);
        }
        //---------------------------------------
        // Public API
        /**
         * Object exposing internal API to plugins
         * @public
         */
        API.internal = {
            'pdfEscape' : pdfEscape,
            'getStyle' : getStyle,
            /**
             * Returns {FontObject} describing a particular font.
             * @public
             * @function
             * @param fontName {String} (Optional) Font's family name
             * @param fontStyle {String} (Optional) Font's style variation name (Example:"Italic")
             * @returns {FontObject}
             */
            'getFont' : function() {
                return fonts[getFont.apply(API, arguments)];
            },
            'getFontSize' : function() {
                return activeFontSize;
            },
            'getLineHeight' : function() {
                return activeFontSize * lineHeightProportion;
            },
            'write' : function(string1 /*, string2, string3, etc */) {
                out(arguments.length === 1 ? string1 : Array.prototype.join.call(arguments, ' '));
            },
            'getCoordinateString' : function(value) {
                return f2(value * k);
            },
            'getVerticalCoordinateString' : function(value) {
                return f2((pageHeight - value) * k);
            },
            'collections' : {},
            'newObject' : newObject,
            'newObjectDeferred' : newObjectDeferred,
            'newObjectDeferredBegin' : newObjectDeferredBegin,
            'putStream' : putStream,
            'events' : events,
            // ratio that you use in multiplication of a given "size" number to arrive to 'point'
            // units of measurement.
            // scaleFactor is set at initialization of the document and calculated against the stated
            // default measurement units for the document.
            // If default is "mm", k is the number that will turn number in 'mm' into 'points' number.
            // through multiplication.
            'scaleFactor' : k,
            'pageSize' : {
                get width() {
                    return pageWidth
                },
                get height() {
                    return pageHeight
                }
            },
            'output' : function(type, options) {
                return output(type, options);
            },
            'getNumberOfPages' : function() {
                return pages.length - 1;
            },
            'pages' : pages,
            'out' : out,
            'f2' : f2,
            'getPageInfo' : function(pageNumberOneBased){
                var objId = (pageNumberOneBased - 1) * 2 + 3;
                return {objId:objId, pageNumber:pageNumberOneBased};
            },
            'getCurrentPageInfo' : function(){
                var objId = (currentPage - 1) * 2 + 3;
                return {objId:objId, pageNumber:currentPage};
            }
        };
        /**
         * Adds (and transfers the focus to) new page to the PDF document.
         * @function
         * @returns {jsPDF}
         *
         * @methodOf jsPDF#
         * @name addPage
         */
        API.addPage = function() {
            _addPage.apply(this, arguments);
            return this;
        };
        API.setPage = function() {
            _setPage.apply(this, arguments);
            return this;
        };
        API.insertPage = function(beforePage) {
            this.addPage();
            this.movePage(currentPage, beforePage);
            return this;
        };
        API.movePage = function(targetPage, beforePage) {
            if (targetPage > beforePage){
                var tmpPages = pages[targetPage];
                var tmpPagedim = pagedim[targetPage];
                for (var i=targetPage; i>beforePage; i--){
                    pages[i] = pages[i-1];
                    pagedim[i] = pagedim[i-1];
                }
                pages[beforePage] = tmpPages;
                pagedim[beforePage] = tmpPagedim;
                this.setPage(beforePage);
            }else if (targetPage < beforePage){
                var tmpPages = pages[targetPage];
                var tmpPagedim = pagedim[targetPage];
                for (var i=targetPage; i<beforePage; i++){
                    pages[i] = pages[i+1];
                    pagedim[i] = pagedim[i+1];
                }
                pages[beforePage] = tmpPages;
                pagedim[beforePage] = tmpPagedim;
                this.setPage(beforePage);
            }
            return this;
        };
        API.deletePage = function(targetPage) {
            for (var i=targetPage; i< page; i++){
                pages[i] = pages[i+1];
                pagedim[i] = pagedim[i+1];
            }
            page--;
            if (currentPage > page){
                currentPage = page;
            }
            this.setPage(currentPage);
            return this;
        };
        API.setDisplayMode = function(zoom, layout, pmode) {
            zoomMode = zoom;
            layoutMode = layout;
            pageMode = pmode;
            return this;
        },
        /**
         * Adds text to page. Supports adding multiline text when 'text' argument is an Array of Strings.
         *
         * @function
         * @param {String|Array} text String or array of strings to be added to the page. Each line is shifted one line down per font, spacing settings declared before this call.
         * @param {Number} x Coordinate (in units declared at inception of PDF document) against left edge of the page
         * @param {Number} y Coordinate (in units declared at inception of PDF document) against upper edge of the page
         * @param {Object} flags Collection of settings signalling how the text must be encoded. Defaults are sane. If you think you want to pass some flags, you likely can read the source.
         * @returns {jsPDF}
         * @methodOf jsPDF#
         * @name text
         */
        API.text = function(text, x, y, flags, angle, align) {
            /**
             * Inserts something like this into PDF
             * BT
             * /F1 16 Tf % Font name + size
             * 16 TL % How many units down for next line in multiline text
             * 0 g % color
             * 28.35 813.54 Td % position
             * (line one) Tj
             * T* (line two) Tj
             * T* (line three) Tj
             * ET
             */
            function ESC(s) {
                s = s.split("\t").join(Array(options.TabLen||9).join(" "));
                return pdfEscape(s, flags);
            }
            // Pre-August-2012 the order of arguments was function(x, y, text, flags)
            // in effort to make all calls have similar signature like
            // function(data, coordinates... , miscellaneous)
            // this method had its args flipped.
            // code below allows backward compatibility with old arg order.
            if (typeof text === 'number') {
                tmp = y;
                y = x;
                x = text;
                text = tmp;
            }
            // If there are any newlines in text, we assume
            // the user wanted to print multiple lines, so break the
            // text up into an array. If the text is already an array,
            // we assume the user knows what they are doing.
            if (typeof text === 'string') {
                if(text.match(/[\n\r]/)) {
                    text = text.split( /\r\n|\r|\n/g);
                } else {
                    // Convert text into an array anyway
                    // to simplify later code.
                    text = [text];
                }
            }
            if (typeof angle === 'string') {
                align = angle;
                angle = null;
            }
            if (typeof flags === 'string') {
                align = flags;
                flags = null;
            }
            if (typeof flags === 'number') {
                angle = flags;
                flags = null;
            }
            var xtra = '',mode = 'Td', todo;
            if (angle) {
                angle *= (Math.PI / 180);
                var c = Math.cos(angle),
                    s = Math.sin(angle);
                xtra = [f2(c), f2(s), f2(s * -1), f2(c), ''].join(" ");
                mode = 'Tm';
            }
            flags = flags || {};
            if (!('noBOM' in flags))
                flags.noBOM = true;
            if (!('autoencode' in flags))
                flags.autoencode = true;
            //TODO this might not work after object block changes
            // It would be better to pass in a page context
            var strokeOption = '';
            if (true === flags.stroke){
                if (this.lastTextWasStroke !== true){
                    strokeOption = '1 Tr\n';
                    this.lastTextWasStroke = true;
                }
            }
            else{
                if (this.lastTextWasStroke){
                    strokeOption = '0 Tr\n';
                }
                this.lastTextWasStroke = false;
            }
            if (text instanceof Array) {
                // we don't want to destroy original text array, so cloning it
                var sa = text.concat(), da = [], i, len = sa.length;
                // we do array.join('text that must not be PDFescaped")
                // thus, pdfEscape each component separately
                while (len--) {
                    da.push(ESC(sa.shift()));
                }
                var linesLeft = Math.ceil((pageHeight - y) * k / (activeFontSize * lineHeightProportion));
                if (0 <= linesLeft && linesLeft < da.length + 1) {
                    todo = da.splice(linesLeft-1);
                }
                if( align ) {
                    var prevX,
                        leading = activeFontSize * lineHeightProportion,
                        lineWidths = text.map( function( v ) {
                            return this.getStringUnitWidth( v ) * activeFontSize / k;
                        }, this );
                    // The first line uses the "main" Td setting,
                    // and the subsequent lines are offset by the
                    // previous line's x coordinate.
                    if( align === "center" ) {
                        // The passed in x coordinate defines
                        // the center point.
                        x -= lineWidths[0] / 2;
                    } else if ( align === "right" ) {
                        // The passed in x coordinate defines the
                        // rightmost point of the text.
                        x -= lineWidths[0];
                    } else {
                        throw new Error('Unrecognized alignment option, use "center" or "right".');
                    }
                    prevX = x;
                    text = da[0];
                    for ( i = 1, len = da.length ; i < len; i++ ) {
                        var delta = lineWidths[i-1] - lineWidths[i];
                        if( align === "center" ) delta /= 2;
                        // T* = x-offset leading Td ( text )
                        // PDF Spec 1.3 p.288
                        text += ") Tj\n" + delta + " -" + leading + " Td (" + da[i];
                        prevX += delta;
                    }
                } else {
                    text = da.join(") Tj\nT* (");
                }
            } else {
                throw new Error('Type of text must be string or Array. "' + text + '" is not recognized.');
            }
            // Using "'" ("go next line and render text" mark) would save space but would complicate our rendering code, templates
            // BT .. ET does NOT have default settings for Tf. You must state that explicitely every time for BT .. ET
            // if you want text transformation matrix (+ multiline) to work reliably (which reads sizes of things from font declarations)
            // Thus, there is NO useful, *reliable* concept of "default" font for a page.
            // The fact that "default" (reuse font used before) font worked before in basic cases is an accident
            // - readers dealing smartly with brokenness of jsPDF's markup.
            out(
                'BT\n/' +
                    activeFontKey + ' ' + activeFontSize + ' Tf\n' + // font face, style, size
                    (activeFontSize * lineHeightProportion) + ' TL\n' + // line spacing
                    strokeOption +// stroke option
                textColor +
                    '\n' + xtra + f2(x * k) + ' ' + f2((pageHeight - y) * k) + ' ' + mode + '\n(' +
                    text +
                    ') Tj\nET');
            if (todo) {
                this.addPage();
                this.text( todo, x, activeFontSize * 1.7 / k);
            }
            return this;
        };
        API.lstext = function(text, x, y, spacing) {
            for (var i = 0, len = text.length ; i < len; i++, x += spacing) this.text(text[i], x, y);
        };
        API.line = function(x1, y1, x2, y2) {
            return this.lines([[x2 - x1, y2 - y1]], x1, y1);
        };
        API.clip = function() {
            // By patrick-roberts, github.com/MrRio/jsPDF/issues/328
            // Call .clip() after calling .rect() with a style argument of null
            out('W') // clip
            out('S') // stroke path; necessary for clip to work
        };
        /**
         * Adds series of curves (straight lines or cubic bezier curves) to canvas, starting at `x`, `y` coordinates.
         * All data points in `lines` are relative to last line origin.
         * `x`, `y` become x1,y1 for first line / curve in the set.
         * For lines you only need to specify [x2, y2] - (ending point) vector against x1, y1 starting point.
         * For bezier curves you need to specify [x2,y2,x3,y3,x4,y4] - vectors to control points 1, 2, ending point. All vectors are against the start of the curve - x1,y1.
         *
         * @example .lines([[2,2],[-2,2],[1,1,2,2,3,3],[2,1]], 212,110, 10) // line, line, bezier curve, line
         * @param {Array} lines Array of *vector* shifts as pairs (lines) or sextets (cubic bezier curves).
         * @param {Number} x Coordinate (in units declared at inception of PDF document) against left edge of the page
         * @param {Number} y Coordinate (in units declared at inception of PDF document) against upper edge of the page
         * @param {Number} scale (Defaults to [1.0,1.0]) x,y Scaling factor for all vectors. Elements can be any floating number Sub-one makes drawing smaller. Over-one grows the drawing. Negative flips the direction.
         * @param {String} style A string specifying the painting style or null. Valid styles include: 'S' [default] - stroke, 'F' - fill, and 'DF' (or 'FD') - fill then stroke. A null value postpones setting the style so that a shape may be composed using multiple method calls. The last drawing method call used to define the shape should not have a null style argument.
         * @param {Boolean} closed If true, the path is closed with a straight line from the end of the last curve to the starting point.
         * @function
         * @returns {jsPDF}
         * @methodOf jsPDF#
         * @name lines
         */
        API.lines = function(lines, x, y, scale, style, closed) {
            var scalex,scaley,i,l,leg,x2,y2,x3,y3,x4,y4;
            // Pre-August-2012 the order of arguments was function(x, y, lines, scale, style)
            // in effort to make all calls have similar signature like
            // function(content, coordinateX, coordinateY , miscellaneous)
            // this method had its args flipped.
            // code below allows backward compatibility with old arg order.
            if (typeof lines === 'number') {
                tmp = y;
                y = x;
                x = lines;
                lines = tmp;
            }
            scale = scale || [1, 1];
            // starting point
            out(f3(x * k) + ' ' + f3((pageHeight - y) * k) + ' m ');
            scalex = scale[0];
            scaley = scale[1];
            l = lines.length;
            //, x2, y2 // bezier only. In page default measurement "units", *after* scaling
            //, x3, y3 // bezier only. In page default measurement "units", *after* scaling
            // ending point for all, lines and bezier. . In page default measurement "units", *after* scaling
            x4 = x; // last / ending point = starting point for first item.
            y4 = y; // last / ending point = starting point for first item.
            for (i = 0; i < l; i++) {
                leg = lines[i];
                if (leg.length === 2) {
                    // simple line
                    x4 = leg[0] * scalex + x4; // here last x4 was prior ending point
                    y4 = leg[1] * scaley + y4; // here last y4 was prior ending point
                    out(f3(x4 * k) + ' ' + f3((pageHeight - y4) * k) + ' l');
                } else {
                    // bezier curve
                    x2 = leg[0] * scalex + x4; // here last x4 is prior ending point
                    y2 = leg[1] * scaley + y4; // here last y4 is prior ending point
                    x3 = leg[2] * scalex + x4; // here last x4 is prior ending point
                    y3 = leg[3] * scaley + y4; // here last y4 is prior ending point
                    x4 = leg[4] * scalex + x4; // here last x4 was prior ending point
                    y4 = leg[5] * scaley + y4; // here last y4 was prior ending point
                    out(
                        f3(x2 * k) + ' ' +
                            f3((pageHeight - y2) * k) + ' ' +
                            f3(x3 * k) + ' ' +
                            f3((pageHeight - y3) * k) + ' ' +
                            f3(x4 * k) + ' ' +
                            f3((pageHeight - y4) * k) + ' c');
                }
            }
            if (closed) {
                out(' h');
            }
            // stroking / filling / both the path
            if (style !== null) {
                out(getStyle(style));
            }
            return this;
        };
        /**
         * Adds a rectangle to PDF
         *
         * @param {Number} x Coordinate (in units declared at inception of PDF document) against left edge of the page
         * @param {Number} y Coordinate (in units declared at inception of PDF document) against upper edge of the page
         * @param {Number} w Width (in units declared at inception of PDF document)
         * @param {Number} h Height (in units declared at inception of PDF document)
         * @param {String} style A string specifying the painting style or null. Valid styles include: 'S' [default] - stroke, 'F' - fill, and 'DF' (or 'FD') - fill then stroke. A null value postpones setting the style so that a shape may be composed using multiple method calls. The last drawing method call used to define the shape should not have a null style argument.
         * @function
         * @returns {jsPDF}
         * @methodOf jsPDF#
         * @name rect
         */
        API.rect = function(x, y, w, h, style) {
            var op = getStyle(style);
            out([
                f2(x * k),
                f2((pageHeight - y) * k),
                f2(w * k),
                f2(-h * k),
                're'
            ].join(' '));
            if (style !== null) {
                out(getStyle(style));
            }
            return this;
        };
        /**
         * Adds a triangle to PDF
         *
         * @param {Number} x1 Coordinate (in units declared at inception of PDF document) against left edge of the page
         * @param {Number} y1 Coordinate (in units declared at inception of PDF document) against upper edge of the page
         * @param {Number} x2 Coordinate (in units declared at inception of PDF document) against left edge of the page
         * @param {Number} y2 Coordinate (in units declared at inception of PDF document) against upper edge of the page
         * @param {Number} x3 Coordinate (in units declared at inception of PDF document) against left edge of the page
         * @param {Number} y3 Coordinate (in units declared at inception of PDF document) against upper edge of the page
         * @param {String} style A string specifying the painting style or null. Valid styles include: 'S' [default] - stroke, 'F' - fill, and 'DF' (or 'FD') - fill then stroke. A null value postpones setting the style so that a shape may be composed using multiple method calls. The last drawing method call used to define the shape should not have a null style argument.
         * @function
         * @returns {jsPDF}
         * @methodOf jsPDF#
         * @name triangle
         */
        API.triangle = function(x1, y1, x2, y2, x3, y3, style) {
            this.lines(
                [
                    [x2 - x1, y2 - y1], // vector to point 2
                    [x3 - x2, y3 - y2], // vector to point 3
                    [x1 - x3, y1 - y3]// closing vector back to point 1
                ],
                x1,
                y1, // start of path
                [1, 1],
                style,
                true);
            return this;
        };
        /**
         * Adds a rectangle with rounded corners to PDF
         *
         * @param {Number} x Coordinate (in units declared at inception of PDF document) against left edge of the page
         * @param {Number} y Coordinate (in units declared at inception of PDF document) against upper edge of the page
         * @param {Number} w Width (in units declared at inception of PDF document)
         * @param {Number} h Height (in units declared at inception of PDF document)
         * @param {Number} rx Radius along x axis (in units declared at inception of PDF document)
         * @param {Number} rx Radius along y axis (in units declared at inception of PDF document)
         * @param {String} style A string specifying the painting style or null. Valid styles include: 'S' [default] - stroke, 'F' - fill, and 'DF' (or 'FD') - fill then stroke. A null value postpones setting the style so that a shape may be composed using multiple method calls. The last drawing method call used to define the shape should not have a null style argument.
         * @function
         * @returns {jsPDF}
         * @methodOf jsPDF#
         * @name roundedRect
         */
        API.roundedRect = function(x, y, w, h, rx, ry, style) {
            var MyArc = 4 / 3 * (Math.SQRT2 - 1);
            this.lines(
                [
                    [(w - 2 * rx), 0],
                    [(rx * MyArc), 0, rx, ry - (ry * MyArc), rx, ry],
                    [0, (h - 2 * ry)],
                    [0, (ry * MyArc), - (rx * MyArc), ry, -rx, ry],
                    [(-w + 2 * rx), 0],
                    [ - (rx * MyArc), 0, -rx, - (ry * MyArc), -rx, -ry],
                    [0, (-h + 2 * ry)],
                    [0, - (ry * MyArc), (rx * MyArc), -ry, rx, -ry]
                ],
                x + rx,
                y, // start of path
                [1, 1],
                style);
            return this;
        };
        /**
         * Adds an ellipse to PDF
         *
         * @param {Number} x Coordinate (in units declared at inception of PDF document) against left edge of the page
         * @param {Number} y Coordinate (in units declared at inception of PDF document) against upper edge of the page
         * @param {Number} rx Radius along x axis (in units declared at inception of PDF document)
         * @param {Number} rx Radius along y axis (in units declared at inception of PDF document)
         * @param {String} style A string specifying the painting style or null. Valid styles include: 'S' [default] - stroke, 'F' - fill, and 'DF' (or 'FD') - fill then stroke. A null value postpones setting the style so that a shape may be composed using multiple method calls. The last drawing method call used to define the shape should not have a null style argument.
         * @function
         * @returns {jsPDF}
         * @methodOf jsPDF#
         * @name ellipse
         */
        API.ellipse = function(x, y, rx, ry, style) {
            var lx = 4 / 3 * (Math.SQRT2 - 1) * rx,
                ly = 4 / 3 * (Math.SQRT2 - 1) * ry;
            out([
                f2((x + rx) * k),
                f2((pageHeight - y) * k),
                'm',
                f2((x + rx) * k),
                f2((pageHeight - (y - ly)) * k),
                f2((x + lx) * k),
                f2((pageHeight - (y - ry)) * k),
                f2(x * k),
                f2((pageHeight - (y - ry)) * k),
                'c'
            ].join(' '));
            out([
                f2((x - lx) * k),
                f2((pageHeight - (y - ry)) * k),
                f2((x - rx) * k),
                f2((pageHeight - (y - ly)) * k),
                f2((x - rx) * k),
                f2((pageHeight - y) * k),
                'c'
            ].join(' '));
            out([
                f2((x - rx) * k),
                f2((pageHeight - (y + ly)) * k),
                f2((x - lx) * k),
                f2((pageHeight - (y + ry)) * k),
                f2(x * k),
                f2((pageHeight - (y + ry)) * k),
                'c'
            ].join(' '));
            out([
                f2((x + lx) * k),
                f2((pageHeight - (y + ry)) * k),
                f2((x + rx) * k),
                f2((pageHeight - (y + ly)) * k),
                f2((x + rx) * k),
                f2((pageHeight - y) * k),
                'c'
            ].join(' '));
            if (style !== null) {
                out(getStyle(style));
            }
            return this;
        };
        /**
         * Adds an circle to PDF
         *
         * @param {Number} x Coordinate (in units declared at inception of PDF document) against left edge of the page
         * @param {Number} y Coordinate (in units declared at inception of PDF document) against upper edge of the page
         * @param {Number} r Radius (in units declared at inception of PDF document)
         * @param {String} style A string specifying the painting style or null. Valid styles include: 'S' [default] - stroke, 'F' - fill, and 'DF' (or 'FD') - fill then stroke. A null value postpones setting the style so that a shape may be composed using multiple method calls. The last drawing method call used to define the shape should not have a null style argument.
         * @function
         * @returns {jsPDF}
         * @methodOf jsPDF#
         * @name circle
         */
        API.circle = function(x, y, r, style) {
            return this.ellipse(x, y, r, r, style);
        };
        /**
         * Adds a properties to the PDF document
         *
         * @param {Object} A property_name-to-property_value object structure.
         * @function
         * @returns {jsPDF}
         * @methodOf jsPDF#
         * @name setProperties
         */
        API.setProperties = function(properties) {
            // copying only those properties we can render.
            for (var property in documentProperties) {
                if (documentProperties.hasOwnProperty(property) && properties[property]) {
                    documentProperties[property] = properties[property];
                }
            }
            return this;
        };
        /**
         * Sets font size for upcoming text elements.
         *
         * @param {Number} size Font size in points.
         * @function
         * @returns {jsPDF}
         * @methodOf jsPDF#
         * @name setFontSize
         */
        API.setFontSize = function(size) {
            activeFontSize = size;
            return this;
        };
        /**
         * Sets text font face, variant for upcoming text elements.
         * See output of jsPDF.getFontList() for possible font names, styles.
         *
         * @param {String} fontName Font name or family. Example: "times"
         * @param {String} fontStyle Font style or variant. Example: "italic"
         * @function
         * @returns {jsPDF}
         * @methodOf jsPDF#
         * @name setFont
         */
        API.setFont = function(fontName, fontStyle) {
            activeFontKey = getFont(fontName, fontStyle);
            // if font is not found, the above line blows up and we never go further
            return this;
        };
        /**
         * Switches font style or variant for upcoming text elements,
         * while keeping the font face or family same.
         * See output of jsPDF.getFontList() for possible font names, styles.
         *
         * @param {String} style Font style or variant. Example: "italic"
         * @function
         * @returns {jsPDF}
         * @methodOf jsPDF#
         * @name setFontStyle
         */
        API.setFontStyle = API.setFontType = function(style) {
            activeFontKey = getFont(undefined, style);
            // if font is not found, the above line blows up and we never go further
            return this;
        };
        /**
         * Returns an object - a tree of fontName to fontStyle relationships available to
         * active PDF document.
         *
         * @public
         * @function
         * @returns {Object} Like {'times':['normal', 'italic', ... ], 'arial':['normal', 'bold', ... ], ... }
         * @methodOf jsPDF#
         * @name getFontList
         */
        API.getFontList = function() {
            // TODO: iterate over fonts array or return copy of fontmap instead in case more are ever added.
            var list = {},fontName,fontStyle,tmp;
            for (fontName in fontmap) {
                if (fontmap.hasOwnProperty(fontName)) {
                    list[fontName] = tmp = [];
                    for (fontStyle in fontmap[fontName]) {
                        if (fontmap[fontName].hasOwnProperty(fontStyle)) {
                            tmp.push(fontStyle);
                        }
                    }
                }
            }
            return list;
        };
        /**
         * Sets line width for upcoming lines.
         *
         * @param {Number} width Line width (in units declared at inception of PDF document)
         * @function
         * @returns {jsPDF}
         * @methodOf jsPDF#
         * @name setLineWidth
         */
        API.setLineWidth = function(width) {
            out((width * k).toFixed(2) + ' w');
            return this;
        };
        /**
         * Sets the stroke color for upcoming elements.
         *
         * Depending on the number of arguments given, Gray, RGB, or CMYK
         * color space is implied.
         *
         * When only ch1 is given, "Gray" color space is implied and it
         * must be a value in the range from 0.00 (solid black) to to 1.00 (white)
         * if values are communicated as String types, or in range from 0 (black)
         * to 255 (white) if communicated as Number type.
         * The RGB-like 0-255 range is provided for backward compatibility.
         *
         * When only ch1,ch2,ch3 are given, "RGB" color space is implied and each
         * value must be in the range from 0.00 (minimum intensity) to to 1.00
         * (max intensity) if values are communicated as String types, or
         * from 0 (min intensity) to to 255 (max intensity) if values are communicated
         * as Number types.
         * The RGB-like 0-255 range is provided for backward compatibility.
         *
         * When ch1,ch2,ch3,ch4 are given, "CMYK" color space is implied and each
         * value must be a in the range from 0.00 (0% concentration) to to
         * 1.00 (100% concentration)
         *
         * Because JavaScript treats fixed point numbers badly (rounds to
         * floating point nearest to binary representation) it is highly advised to
         * communicate the fractional numbers as String types, not JavaScript Number type.
         *
         * @param {Number|String} ch1 Color channel value
         * @param {Number|String} ch2 Color channel value
         * @param {Number|String} ch3 Color channel value
         * @param {Number|String} ch4 Color channel value
         *
         * @function
         * @returns {jsPDF}
         * @methodOf jsPDF#
         * @name setDrawColor
         */
        API.setDrawColor = function(ch1, ch2, ch3, ch4) {
            var color;
            if (ch2 === undefined || (ch4 === undefined && ch1 === ch2 === ch3)) {
                // Gray color space.
                if (typeof ch1 === 'string') {
                    color = ch1 + ' G';
                } else {
                    color = f2(ch1 / 255) + ' G';
                }
            } else if (ch4 === undefined) {
                // RGB
                if (typeof ch1 === 'string') {
                    color = [ch1, ch2, ch3, 'RG'].join(' ');
                } else {
                    color = [f2(ch1 / 255), f2(ch2 / 255), f2(ch3 / 255), 'RG'].join(' ');
                }
            } else {
                // CMYK
                if (typeof ch1 === 'string') {
                    color = [ch1, ch2, ch3, ch4, 'K'].join(' ');
                } else {
                    color = [f2(ch1), f2(ch2), f2(ch3), f2(ch4), 'K'].join(' ');
                }
            }
            out(color);
            return this;
        };
        /**
         * Sets the fill color for upcoming elements.
         *
         * Depending on the number of arguments given, Gray, RGB, or CMYK
         * color space is implied.
         *
         * When only ch1 is given, "Gray" color space is implied and it
         * must be a value in the range from 0.00 (solid black) to to 1.00 (white)
         * if values are communicated as String types, or in range from 0 (black)
         * to 255 (white) if communicated as Number type.
         * The RGB-like 0-255 range is provided for backward compatibility.
         *
         * When only ch1,ch2,ch3 are given, "RGB" color space is implied and each
         * value must be in the range from 0.00 (minimum intensity) to to 1.00
         * (max intensity) if values are communicated as String types, or
         * from 0 (min intensity) to to 255 (max intensity) if values are communicated
         * as Number types.
         * The RGB-like 0-255 range is provided for backward compatibility.
         *
         * When ch1,ch2,ch3,ch4 are given, "CMYK" color space is implied and each
         * value must be a in the range from 0.00 (0% concentration) to to
         * 1.00 (100% concentration)
         *
         * Because JavaScript treats fixed point numbers badly (rounds to
         * floating point nearest to binary representation) it is highly advised to
         * communicate the fractional numbers as String types, not JavaScript Number type.
         *
         * @param {Number|String} ch1 Color channel value
         * @param {Number|String} ch2 Color channel value
         * @param {Number|String} ch3 Color channel value
         * @param {Number|String} ch4 Color channel value
         *
         * @function
         * @returns {jsPDF}
         * @methodOf jsPDF#
         * @name setFillColor
         */
        API.setFillColor = function(ch1, ch2, ch3, ch4) {
            var color;
            if (ch2 === undefined || (ch4 === undefined && ch1 === ch2 === ch3)) {
                // Gray color space.
                if (typeof ch1 === 'string') {
                    color = ch1 + ' g';
                } else {
                    color = f2(ch1 / 255) + ' g';
                }
            } else if (ch4 === undefined) {
                // RGB
                if (typeof ch1 === 'string') {
                    color = [ch1, ch2, ch3, 'rg'].join(' ');
                } else {
                    color = [f2(ch1 / 255), f2(ch2 / 255), f2(ch3 / 255), 'rg'].join(' ');
                }
            } else {
                // CMYK
                if (typeof ch1 === 'string') {
                    color = [ch1, ch2, ch3, ch4, 'k'].join(' ');
                } else {
                    color = [f2(ch1), f2(ch2), f2(ch3), f2(ch4), 'k'].join(' ');
                }
            }
            out(color);
            return this;
        };
        /**
         * Sets the text color for upcoming elements.
         * If only one, first argument is given,
         * treats the value as gray-scale color value.
         *
         * @param {Number} r Red channel color value in range 0-255 or {String} r color value in hexadecimal, example: '#FFFFFF'
         * @param {Number} g Green channel color value in range 0-255
         * @param {Number} b Blue channel color value in range 0-255
         * @function
         * @returns {jsPDF}
         * @methodOf jsPDF#
         * @name setTextColor
         */
        API.setTextColor = function(r, g, b) {
            if ((typeof r === 'string') && /^#[0-9A-Fa-f]{6}$/.test(r)) {
                var hex = parseInt(r.substr(1), 16);
                r = (hex >> 16) & 255;
                g = (hex >> 8) & 255;
                b = (hex & 255);
            }
            if ((r === 0 && g === 0 && b === 0) || (typeof g === 'undefined')) {
                textColor = f3(r / 255) + ' g';
            } else {
                textColor = [f3(r / 255), f3(g / 255), f3(b / 255), 'rg'].join(' ');
            }
            return this;
        };
        /**
         * Is an Object providing a mapping from human-readable to
         * integer flag values designating the varieties of line cap
         * and join styles.
         *
         * @returns {Object}
         * @fieldOf jsPDF#
         * @name CapJoinStyles
         */
        API.CapJoinStyles = {
            0 : 0,
            'butt' : 0,
            'but' : 0,
            'miter' : 0,
            1 : 1,
            'round' : 1,
            'rounded' : 1,
            'circle' : 1,
            2 : 2,
            'projecting' : 2,
            'project' : 2,
            'square' : 2,
            'bevel' : 2
        };
        /**
         * Sets the line cap styles
         * See {jsPDF.CapJoinStyles} for variants
         *
         * @param {String|Number} style A string or number identifying the type of line cap
         * @function
         * @returns {jsPDF}
         * @methodOf jsPDF#
         * @name setLineCap
         */
        API.setLineCap = function(style) {
            var id = this.CapJoinStyles[style];
            if (id === undefined) {
                throw new Error("Line cap style of '" + style + "' is not recognized. See or extend .CapJoinStyles property for valid styles");
            }
            lineCapID = id;
            out(id + ' J');
            return this;
        };
        /**
         * Sets the line join styles
         * See {jsPDF.CapJoinStyles} for variants
         *
         * @param {String|Number} style A string or number identifying the type of line join
         * @function
         * @returns {jsPDF}
         * @methodOf jsPDF#
         * @name setLineJoin
         */
        API.setLineJoin = function(style) {
            var id = this.CapJoinStyles[style];
            if (id === undefined) {
                throw new Error("Line join style of '" + style + "' is not recognized. See or extend .CapJoinStyles property for valid styles");
            }
            lineJoinID = id;
            out(id + ' j');
            return this;
        };
        // Output is both an internal (for plugins) and external function
        API.output = output;
        /**
         * Saves as PDF document. An alias of jsPDF.output('save', 'filename.pdf')
         * @param {String} filename The filename including extension.
         *
         * @function
         * @returns {jsPDF}
         * @methodOf jsPDF#
         * @name save
         */
        API.save = function(filename) {
            API.output('save', filename);
        };
        // applying plugins (more methods) ON TOP of built-in API.
        // this is intentional as we allow plugins to override
        // built-ins
        for (var plugin in jsPDF.API) {
            if (jsPDF.API.hasOwnProperty(plugin)) {
                if (plugin === 'events' && jsPDF.API.events.length) {
                    (function(events, newEvents) {
                        // jsPDF.API.events is a JS Array of Arrays
                        // where each Array is a pair of event name, handler
                        // Events were added by plugins to the jsPDF instantiator.
                        // These are always added to the new instance and some ran
                        // during instantiation.
                        var eventname,handler_and_args,i;
                        for (i = newEvents.length - 1; i !== -1; i--) {
                            // subscribe takes 3 args: 'topic', function, runonce_flag
                            // if undefined, runonce is false.
                            // users can attach callback directly,
                            // or they can attach an array with [callback, runonce_flag]
                            // that's what the "apply" magic is for below.
                            eventname = newEvents[i][0];
                            handler_and_args = newEvents[i][1];
                            events.subscribe.apply(
                                events,
                                [eventname].concat(
                                    typeof handler_and_args === 'function' ?
                                        [handler_and_args] : handler_and_args));
                        }
                    }(events, jsPDF.API.events));
                } else {
                    API[plugin] = jsPDF.API[plugin];
                }
            }
        }
        //////////////////////////////////////////////////////
        // continuing initialization of jsPDF Document object
        //////////////////////////////////////////////////////
        // Add the first page automatically
        addFonts();
        activeFontKey = 'F1';
        _addPage(format, orientation);
        events.publish('initialized');
        return API;
    }
    /**
     * jsPDF.API is a STATIC property of jsPDF class.
     * jsPDF.API is an object you can add methods and properties to.
     * The methods / properties you add will show up in new jsPDF objects.
     *
     * One property is prepopulated. It is the 'events' Object. Plugin authors can add topics,
     * callbacks to this object. These will be reassigned to all new instances of jsPDF.
     * Examples:
     * jsPDF.API.events['initialized'] = function(){ 'this' is API object }
     * jsPDF.API.events['addFont'] = function(added_font_object){ 'this' is API object }
     *
     * @static
     * @public
     * @memberOf jsPDF
     * @name API
     *
     * @example
     * jsPDF.API.mymethod = function(){
     * // 'this' will be ref to internal API object. see jsPDF source
     * // , so you can refer to built-in methods like so:
     * // this.line(....)
     * // this.text(....)
     * }
     * var pdfdoc = new jsPDF()
     * pdfdoc.mymethod() // <- !!!!!!
     */
    jsPDF.API = {events:[]};
    jsPDF.version = "1.0.0-trunk";

    module.exports = jsPDF;

}(typeof self !== "undefined" && self || typeof window !== "undefined" && window || this));

},{}],4:[function(require,module,exports){
/** @preserve
 * jsPDF addImage plugin
 * Copyright (c) 2012 Jason Siefken, https://github.com/siefkenj/
 * 2013 Chris Dowling, https://github.com/gingerchris
 * 2013 Trinh Ho, https://github.com/ineedfat
 * 2013 Edwin Alejandro Perez, https://github.com/eaparango
 * 2013 Norah Smith, https://github.com/burnburnrocket
 * 2014 Diego Casorran, https://github.com/diegocr
 * 2014 James Robb, https://github.com/jamesbrobb
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
var jsPDF = require('./jspdf');

;(function(jsPDFAPI) {
    'use strict'
    var namespace = 'addImage_',
        supported_image_types = ['jpeg', 'jpg', 'png'];
    // Image functionality ported from pdf.js
    var putImage = function(img) {
        var objectNumber = this.internal.newObject()
        , out = this.internal.write
        , putStream = this.internal.putStream
        img['n'] = objectNumber
        out('<</Type /XObject')
        out('/Subtype /Image')
        out('/Width ' + img['w'])
        out('/Height ' + img['h'])
        if (img['cs'] === this.color_spaces.INDEXED) {
            out('/ColorSpace [/Indexed /DeviceRGB '
                // if an indexed png defines more than one colour with transparency, we've created a smask
                + (img['pal'].length / 3 - 1) + ' ' + ('smask' in img ? objectNumber + 2 : objectNumber + 1)
                + ' 0 R]');
        } else {
            out('/ColorSpace /' + img['cs']);
            if (img['cs'] === this.color_spaces.DEVICE_CMYK) {
                out('/Decode [1 0 1 0 1 0 1 0]');
            }
        }
        out('/BitsPerComponent ' + img['bpc']);
        if ('f' in img) {
            out('/Filter /' + img['f']);
        }
        if ('dp' in img) {
            out('/DecodeParms <<' + img['dp'] + '>>');
        }
        if ('trns' in img && img['trns'].constructor == Array) {
            var trns = '',
                i = 0,
                len = img['trns'].length;
            for (; i < len; i++)
                trns += (img['trns'][i] + ' ' + img['trns'][i] + ' ');
            out('/Mask [' + trns + ']');
        }
        if ('smask' in img) {
            out('/SMask ' + (objectNumber + 1) + ' 0 R');
        }
        out('/Length ' + img['data'].length + '>>');
        putStream(img['data']);
        out('endobj');
        // Soft mask
        if ('smask' in img) {
            var dp = '/Predictor 15 /Colors 1 /BitsPerComponent ' + img['bpc'] + ' /Columns ' + img['w'];
            var smask = {'w': img['w'], 'h': img['h'], 'cs': 'DeviceGray', 'bpc': img['bpc'], 'dp': dp, 'data': img['smask']};
            if ('f' in img)
                smask.f = img['f'];
            putImage.call(this, smask);
        }
        //Palette
        if (img['cs'] === this.color_spaces.INDEXED) {
            this.internal.newObject();
            //out('<< /Filter / ' + img['f'] +' /Length ' + img['pal'].length + '>>');
            //putStream(zlib.compress(img['pal']));
            out('<< /Length ' + img['pal'].length + '>>');
            putStream(this.arrayBufferToBinaryString(new Uint8Array(img['pal'])));
            out('endobj');
        }
    }
    , putResourcesCallback = function() {
        var images = this.internal.collections[namespace + 'images']
        for ( var i in images ) {
            putImage.call(this, images[i])
        }
    }
    , putXObjectsDictCallback = function(){
        var images = this.internal.collections[namespace + 'images']
        , out = this.internal.write
        , image
        for (var i in images) {
            image = images[i]
            out(
                '/I' + image['i']
                , image['n']
                , '0'
                , 'R'
            )
        }
    }
    , checkCompressValue = function(value) {
        if(value && typeof value === 'string')
            value = value.toUpperCase();
        return value in jsPDFAPI.image_compression ? value : jsPDFAPI.image_compression.NONE;
    }
    , getImages = function() {
        var images = this.internal.collections[namespace + 'images'];
        //first run, so initialise stuff
        if(!images) {
            this.internal.collections[namespace + 'images'] = images = {};
            this.internal.events.subscribe('putResources', putResourcesCallback);
            this.internal.events.subscribe('putXobjectDict', putXObjectsDictCallback);
        }
        return images;
    }
    , getImageIndex = function(images) {
        var imageIndex = 0;
        if (images){
            // this is NOT the first time this method is ran on this instance of jsPDF object.
            imageIndex = Object.keys ?
                Object.keys(images).length :
                (function(o){
                    var i = 0
                    for (var e in o){if(o.hasOwnProperty(e)){ i++ }}
                    return i
                })(images)
        }
        return imageIndex;
    }
    , notDefined = function(value) {
        return typeof value === 'undefined' || value === null;
    }
    , generateAliasFromData = function(data) {
        return typeof data === 'string' && jsPDFAPI.sHashCode(data);
    }
    , doesNotSupportImageType = function(type) {
        return supported_image_types.indexOf(type) === -1;
    }
    , processMethodNotEnabled = function(type) {
        return typeof jsPDFAPI['process' + type.toUpperCase()] !== 'function';
    }
    , isDOMElement = function(object) {
        return typeof object === 'object' && object.nodeType === 1;
    }
    , createDataURIFromElement = function(element, format, angle) {
        //if element is an image which uses data url defintion, just return the dataurl
        if (element.nodeName === 'IMG' && element.hasAttribute('src')) {
            var src = ''+element.getAttribute('src');
            if (!angle && src.indexOf('data:image/') === 0) return src;
            // only if the user doesn't care about a format
            if (!format && /\.png(?:[?#].*)?$/i.test(src)) format = 'png';
        }
        if(element.nodeName === 'CANVAS') {
            var canvas = element;
        } else {
            var canvas = document.createElement('canvas');
            canvas.width = element.clientWidth || element.width;
            canvas.height = element.clientHeight || element.height;
            var ctx = canvas.getContext('2d');
            if (!ctx) {
                throw ('addImage requires canvas to be supported by browser.');
            }
            if (angle) {
                var x, y, b, c, s, w, h, to_radians = Math.PI/180, angleInRadians;
                if (typeof angle === 'object') {
                    x = angle.x;
                    y = angle.y;
                    b = angle.bg;
                    angle = angle.angle;
                }
                angleInRadians = angle*to_radians;
                c = Math.abs(Math.cos(angleInRadians));
                s = Math.abs(Math.sin(angleInRadians));
                w = canvas.width;
                h = canvas.height;
                canvas.width = h * s + w * c;
                canvas.height = h * c + w * s;
                if (isNaN(x)) x = canvas.width / 2;
                if (isNaN(y)) y = canvas.height / 2;
                ctx.clearRect(0,0,canvas.width, canvas.height);
                ctx.fillStyle = b || 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(angleInRadians);
                ctx.drawImage(element, -(w/2), -(h/2));
                ctx.rotate(-angleInRadians);
                ctx.translate(-x, -y);
                ctx.restore();
            } else {
                ctx.drawImage(element, 0, 0, canvas.width, canvas.height);
            }
        }
        return canvas.toDataURL((''+format).toLowerCase() == 'png' ? 'image/png' : 'image/jpeg');
    }
    ,checkImagesForAlias = function(alias, images) {
        var cached_info;
        if(images) {
            for(var e in images) {
                if(alias === images[e].alias) {
                    cached_info = images[e];
                    break;
                }
            }
        }
        return cached_info;
    }
    ,determineWidthAndHeight = function(w, h, info) {
        if (!w && !h) {
            w = -96;
            h = -96;
        }
        if (w < 0) {
            w = (-1) * info['w'] * 72 / w / this.internal.scaleFactor;
        }
        if (h < 0) {
            h = (-1) * info['h'] * 72 / h / this.internal.scaleFactor;
        }
        if (w === 0) {
            w = h * info['w'] / info['h'];
        }
        if (h === 0) {
            h = w * info['h'] / info['w'];
        }
        return [w, h];
    }
    , writeImageToPDF = function(x, y, w, h, info, index, images) {
        var dims = determineWidthAndHeight.call(this, w, h, info),
            coord = this.internal.getCoordinateString,
            vcoord = this.internal.getVerticalCoordinateString;
        w = dims[0];
        h = dims[1];
        images[index] = info;
        this.internal.write(
            'q'
            , coord(w)
            , '0 0'
            , coord(h) // TODO: check if this should be shifted by vcoord
            , coord(x)
            , vcoord(y + h)
            , 'cm /I'+info['i']
            , 'Do Q'
        )
    };
    /**
     * COLOR SPACES
     */
    jsPDFAPI.color_spaces = {
        DEVICE_RGB:'DeviceRGB',
        DEVICE_GRAY:'DeviceGray',
        DEVICE_CMYK:'DeviceCMYK',
        CAL_GREY:'CalGray',
        CAL_RGB:'CalRGB',
        LAB:'Lab',
        ICC_BASED:'ICCBased',
        INDEXED:'Indexed',
        PATTERN:'Pattern',
        SEPERATION:'Seperation',
        DEVICE_N:'DeviceN'
    };
    /**
     * DECODE METHODS
     */
    jsPDFAPI.decode = {
        DCT_DECODE:'DCTDecode',
        FLATE_DECODE:'FlateDecode',
        LZW_DECODE:'LZWDecode',
        JPX_DECODE:'JPXDecode',
        JBIG2_DECODE:'JBIG2Decode',
        ASCII85_DECODE:'ASCII85Decode',
        ASCII_HEX_DECODE:'ASCIIHexDecode',
        RUN_LENGTH_DECODE:'RunLengthDecode',
        CCITT_FAX_DECODE:'CCITTFaxDecode'
    };
    /**
     * IMAGE COMPRESSION TYPES
     */
    jsPDFAPI.image_compression = {
        NONE: 'NONE',
        FAST: 'FAST',
        MEDIUM: 'MEDIUM',
        SLOW: 'SLOW'
    };
    jsPDFAPI.sHashCode = function(str) {
        return Array.prototype.reduce && str.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
    };
    jsPDFAPI.isString = function(object) {
        return typeof object === 'string';
    };
    /**
     * Strips out and returns info from a valid base64 data URI
     * @param {String[dataURI]} a valid data URI of format 'data:[<MIME-type>][;base64],<data>'
     * @returns an Array containing the following
     * [0] the complete data URI
     * [1] <MIME-type>
     * [2] format - the second part of the mime-type i.e 'png' in 'image/png'
     * [4] <data>
     */
    jsPDFAPI.extractInfoFromBase64DataURI = function(dataURI) {
        return /^data:([\w]+?\/([\w]+?));base64,(.+?)$/g.exec(dataURI);
    };
    /**
     * Check to see if ArrayBuffer is supported
     */
    jsPDFAPI.supportsArrayBuffer = function() {
        return typeof ArrayBuffer !== 'undefined' && typeof Uint8Array !== 'undefined';
    };
    /**
     * Tests supplied object to determine if ArrayBuffer
     * @param {Object[object]}
     */
    jsPDFAPI.isArrayBuffer = function(object) {
        if(!this.supportsArrayBuffer())
            return false;
        return object instanceof ArrayBuffer;
    };
    /**
     * Tests supplied object to determine if it implements the ArrayBufferView (TypedArray) interface
     * @param {Object[object]}
     */
    jsPDFAPI.isArrayBufferView = function(object) {
        if(!this.supportsArrayBuffer())
            return false;
        if(typeof Uint32Array === 'undefined')
            return false;
        return (object instanceof Int8Array ||
                object instanceof Uint8Array ||
                (typeof Uint8ClampedArray !== 'undefined' && object instanceof Uint8ClampedArray) ||
                object instanceof Int16Array ||
                object instanceof Uint16Array ||
                object instanceof Int32Array ||
                object instanceof Uint32Array ||
                object instanceof Float32Array ||
                object instanceof Float64Array );
    };
    /**
     * Exactly what it says on the tin
     */
    jsPDFAPI.binaryStringToUint8Array = function(binary_string) {
        /*
         * not sure how efficient this will be will bigger files. Is there a native method?
         */
        var len = binary_string.length;
        var bytes = new Uint8Array( len );
        for (var i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes;
    };
    /**
     * @see this discussion
     * http://stackoverflow.com/questions/6965107/converting-between-strings-and-arraybuffers
     *
     * As stated, i imagine the method below is highly inefficent for large files.
     *
     * Also of note from Mozilla,
     *
     * "However, this is slow and error-prone, due to the need for multiple conversions (especially if the binary data is not actually byte-format data, but, for example, 32-bit integers or floats)."
     *
     * https://developer.mozilla.org/en-US/Add-ons/Code_snippets/StringView
     *
     * Although i'm strugglig to see how StringView solves this issue? Doesn't appear to be a direct method for conversion?
     *
     * Async method using Blob and FileReader could be best, but i'm not sure how to fit it into the flow?
     */
    jsPDFAPI.arrayBufferToBinaryString = function(buffer) {
        if(this.isArrayBuffer(buffer))
            buffer = new Uint8Array(buffer);
        var binary_string = '';
        var len = buffer.byteLength;
        for (var i = 0; i < len; i++) {
            binary_string += String.fromCharCode(buffer[i]);
        }
        return binary_string;
        /*
         * Another solution is the method below - convert array buffer straight to base64 and then use atob
         */
        //return atob(this.arrayBufferToBase64(buffer));
    };
    /**
     * Converts an ArrayBuffer directly to base64
     *
     * Taken from here
     *
     * http://jsperf.com/encoding-xhr-image-data/31
     *
     * Need to test if this is a better solution for larger files
     *
     */
    jsPDFAPI.arrayBufferToBase64 = function(arrayBuffer) {
        var base64 = ''
        var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
        var bytes = new Uint8Array(arrayBuffer)
        var byteLength = bytes.byteLength
        var byteRemainder = byteLength % 3
        var mainLength = byteLength - byteRemainder
        var a, b, c, d
        var chunk
        // Main loop deals with bytes in chunks of 3
        for (var i = 0; i < mainLength; i = i + 3) {
            // Combine the three bytes into a single integer
            chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]
            // Use bitmasks to extract 6-bit segments from the triplet
            a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
            b = (chunk & 258048) >> 12 // 258048 = (2^6 - 1) << 12
            c = (chunk & 4032) >> 6 // 4032 = (2^6 - 1) << 6
            d = chunk & 63 // 63 = 2^6 - 1
            // Convert the raw binary segments to the appropriate ASCII encoding
            base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
        }
        // Deal with the remaining bytes and padding
        if (byteRemainder == 1) {
            chunk = bytes[mainLength]
            a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2
            // Set the 4 least significant bits to zero
            b = (chunk & 3) << 4 // 3 = 2^2 - 1
            base64 += encodings[a] + encodings[b] + '=='
        } else if (byteRemainder == 2) {
            chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]
            a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
            b = (chunk & 1008) >> 4 // 1008 = (2^6 - 1) << 4
            // Set the 2 least significant bits to zero
            c = (chunk & 15) << 2 // 15 = 2^4 - 1
            base64 += encodings[a] + encodings[b] + encodings[c] + '='
        }
        return base64
    };
    jsPDFAPI.createImageInfo = function(data, wd, ht, cs, bpc, f, imageIndex, alias, dp, trns, pal, smask) {
        var info = {
            alias:alias,
            w : wd,
            h : ht,
            cs : cs,
            bpc : bpc,
            i : imageIndex,
            data : data
            // n: objectNumber will be added by putImage code
        };
        if(f) info.f = f;
        if(dp) info.dp = dp;
        if(trns) info.trns = trns;
        if(pal) info.pal = pal;
        if(smask) info.smask = smask;
        return info;
    };
    jsPDFAPI.addImage = function(imageData, format, x, y, w, h, alias, compression, rotation) {
        'use strict'
        if(typeof format !== 'string') {
            var tmp = h;
            h = w;
            w = y;
            y = x;
            x = format;
            format = tmp;
        }
        if (typeof imageData === 'object' && !isDOMElement(imageData) && "imageData" in imageData) {
            var options = imageData;
            imageData = options.imageData;
            format = options.format || format;
            x = options.x || x || 0;
            y = options.y || y || 0;
            w = options.w || w;
            h = options.h || h;
            alias = options.alias || alias;
            compression = options.compression || compression;
            rotation = options.rotation || options.angle || rotation;
        }
        if (isNaN(x) || isNaN(y))
        {
            console.error('jsPDF.addImage: Invalid coordinates', arguments);
            throw new Error('Invalid coordinates passed to jsPDF.addImage');
        }
        var images = getImages.call(this), info;
        if (!(info = checkImagesForAlias(imageData, images))) {
            var dataAsBinaryString;
            if(isDOMElement(imageData))
                imageData = createDataURIFromElement(imageData, format, rotation);
            if(notDefined(alias))
                alias = generateAliasFromData(imageData);
            if (!(info = checkImagesForAlias(alias, images))) {
                if(this.isString(imageData)) {
                    var base64Info = this.extractInfoFromBase64DataURI(imageData);
                    if(base64Info) {
                        format = base64Info[2];
                        imageData = atob(base64Info[3]);//convert to binary string
                    } else {
                        if (imageData.charCodeAt(0) === 0x89 &&
                            imageData.charCodeAt(1) === 0x50 &&
                            imageData.charCodeAt(2) === 0x4e &&
                            imageData.charCodeAt(3) === 0x47 ) format = 'png';
                    }
                }
                format = (format || 'JPEG').toLowerCase();
                if(doesNotSupportImageType(format))
                    throw new Error('addImage currently only supports formats ' + supported_image_types + ', not \''+format+'\'');
                if(processMethodNotEnabled(format))
                    throw new Error('please ensure that the plugin for \''+format+'\' support is added');
                /**
                 * need to test if it's more efficent to convert all binary strings
                 * to TypedArray - or should we just leave and process as string?
                 */
                if(this.supportsArrayBuffer()) {
                    dataAsBinaryString = imageData;
                    imageData = this.binaryStringToUint8Array(imageData);
                }
                info = this['process' + format.toUpperCase()](
                    imageData,
                    getImageIndex(images),
                    alias,
                    checkCompressValue(compression),
                    dataAsBinaryString
                );
                if(!info)
                    throw new Error('An unkwown error occurred whilst processing the image');
            }
        }
        writeImageToPDF.call(this, x, y, w, h, info, info.i, images);
        return this
    };
    /**
     * JPEG SUPPORT
     **/
    //takes a string imgData containing the raw bytes of
    //a jpeg image and returns [width, height]
    //Algorithm from: http://www.64lines.com/jpeg-width-height
    var getJpegSize = function(imgData) {
        'use strict'
        var width, height, numcomponents;
        // Verify we have a valid jpeg header 0xff,0xd8,0xff,0xe0,?,?,'J','F','I','F',0x00
        if (!imgData.charCodeAt(0) === 0xff ||
            !imgData.charCodeAt(1) === 0xd8 ||
            !imgData.charCodeAt(2) === 0xff ||
            !imgData.charCodeAt(3) === 0xe0 ||
            !imgData.charCodeAt(6) === 'J'.charCodeAt(0) ||
            !imgData.charCodeAt(7) === 'F'.charCodeAt(0) ||
            !imgData.charCodeAt(8) === 'I'.charCodeAt(0) ||
            !imgData.charCodeAt(9) === 'F'.charCodeAt(0) ||
            !imgData.charCodeAt(10) === 0x00) {
            throw new Error('getJpegSize requires a binary string jpeg file')
        }
        var blockLength = imgData.charCodeAt(4)*256 + imgData.charCodeAt(5);
        var i = 4, len = imgData.length;
        while ( i < len ) {
            i += blockLength;
            if (imgData.charCodeAt(i) !== 0xff) {
                throw new Error('getJpegSize could not find the size of the image');
            }
            if (imgData.charCodeAt(i+1) === 0xc0 || //(SOF) Huffman - Baseline DCT
                imgData.charCodeAt(i+1) === 0xc1 || //(SOF) Huffman - Extended sequential DCT
                imgData.charCodeAt(i+1) === 0xc2 || // Progressive DCT (SOF2)
                imgData.charCodeAt(i+1) === 0xc3 || // Spatial (sequential) lossless (SOF3)
                imgData.charCodeAt(i+1) === 0xc4 || // Differential sequential DCT (SOF5)
                imgData.charCodeAt(i+1) === 0xc5 || // Differential progressive DCT (SOF6)
                imgData.charCodeAt(i+1) === 0xc6 || // Differential spatial (SOF7)
                imgData.charCodeAt(i+1) === 0xc7) {
                height = imgData.charCodeAt(i+5)*256 + imgData.charCodeAt(i+6);
                width = imgData.charCodeAt(i+7)*256 + imgData.charCodeAt(i+8);
                numcomponents = imgData.charCodeAt(i+9);
                return [width, height, numcomponents];
            } else {
                i += 2;
                blockLength = imgData.charCodeAt(i)*256 + imgData.charCodeAt(i+1)
            }
        }
    }
    , getJpegSizeFromBytes = function(data) {
        var hdr = (data[0] << 8) | data[1];
        if(hdr !== 0xFFD8)
            throw new Error('Supplied data is not a JPEG');
        var len = data.length,
            block = (data[4] << 8) + data[5],
            pos = 4,
            bytes, width, height, numcomponents;
        while(pos < len) {
            pos += block;
            bytes = readBytes(data, pos);
            block = (bytes[2] << 8) + bytes[3];
            if((bytes[1] === 0xC0 || bytes[1] === 0xC2) && bytes[0] === 0xFF && block > 7) {
                bytes = readBytes(data, pos + 5);
                width = (bytes[2] << 8) + bytes[3];
                height = (bytes[0] << 8) + bytes[1];
                numcomponents = bytes[4];
                return {width:width, height:height, numcomponents: numcomponents};
            }
            pos+=2;
        }
        throw new Error('getJpegSizeFromBytes could not find the size of the image');
    }
    , readBytes = function(data, offset) {
        return data.subarray(offset, offset+ 5);
    };
    jsPDFAPI.processJPEG = function(data, index, alias, compression, dataAsBinaryString) {
        'use strict'
        var colorSpace = this.color_spaces.DEVICE_RGB,
            filter = this.decode.DCT_DECODE,
            bpc = 8,
            dims;
        if(this.isString(data)) {
            dims = getJpegSize(data);
            return this.createImageInfo(data, dims[0], dims[1], dims[3] == 1 ? this.color_spaces.DEVICE_GRAY:colorSpace, bpc, filter, index, alias);
        }
        if(this.isArrayBuffer(data))
            data = new Uint8Array(data);
        if(this.isArrayBufferView(data)) {
            dims = getJpegSizeFromBytes(data);
            // if we already have a stored binary string rep use that
            data = dataAsBinaryString || this.arrayBufferToBinaryString(data);
            return this.createImageInfo(data, dims.width, dims.height, dims.numcomponents == 1 ? this.color_spaces.DEVICE_GRAY:colorSpace, bpc, filter, index, alias);
        }
        return null;
    };
    jsPDFAPI.processJPG = function(/*data, index, alias, compression, dataAsBinaryString*/) {
        return this.processJPEG.apply(this, arguments);
    }
})(jsPDF.API);

},{"./jspdf":3}],5:[function(require,module,exports){
/**@preserve
 *  ==================================================================== 
 * jsPDF PNG PlugIn
 * Copyright (c) 2014 James Robb, https://github.com/jamesbrobb
 * 
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * ====================================================================
 */

var jsPDF = require('./jspdf');
var zlib = require('zlib-browserify');
console.log(zlib);
var FlateStream = zlib.FlateStream;
var Deflater = zlib.Deflater;
var PNG = require('./png');


(function(jsPDFAPI) {
'use strict'
	
	/*
	 * @see http://www.w3.org/TR/PNG-Chunks.html
	 * 
	 Color    Allowed      Interpretation
	 Type     Bit Depths
	   
	   0       1,2,4,8,16  Each pixel is a grayscale sample.
	   
	   2       8,16        Each pixel is an R,G,B triple.
	   
	   3       1,2,4,8     Each pixel is a palette index;
	                       a PLTE chunk must appear.
	   
	   4       8,16        Each pixel is a grayscale sample,
	                       followed by an alpha sample.
	   
	   6       8,16        Each pixel is an R,G,B triple,
	                       followed by an alpha sample.
	*/
	
	/*
	 * PNG filter method types
	 * 
	 * @see http://www.w3.org/TR/PNG-Filters.html
	 * @see http://www.libpng.org/pub/png/book/chapter09.html
	 * 
	 * This is what the value 'Predictor' in decode params relates to
	 * 
	 * 15 is "optimal prediction", which means the prediction algorithm can change from line to line.
	 * In that case, you actually have to read the first byte off each line for the prediction algorthim (which should be 0-4, corresponding to PDF 10-14) and select the appropriate unprediction algorithm based on that byte.
	 *
	   0       None
	   1       Sub
	   2       Up
	   3       Average
	   4       Paeth
	 */
	
	var doesNotHavePngJS = function() {
		return typeof PNG !== 'function' || typeof FlateStream !== 'function';
	}
	, canCompress = function(value) {
		return value !== jsPDFAPI.image_compression.NONE && hasCompressionJS();
	}
	, hasCompressionJS = function() {
		var inst = typeof Deflater === 'function';
		if(!inst)
			throw new Error("requires deflate.js for compression")
		return inst;
	}
	, compressBytes = function(bytes, lineLength, colorsPerPixel, compression) {
		
		var level = 5,
			filter_method = filterUp;
		
		switch(compression) {
		
			case jsPDFAPI.image_compression.FAST:
				
				level = 3;
				filter_method = filterSub;
				break;
				
			case jsPDFAPI.image_compression.MEDIUM:
				
				level = 6;
				filter_method = filterAverage;
				break;
				
			case jsPDFAPI.image_compression.SLOW:
				
				level = 9;
				filter_method = filterPaeth;//uses to sum to choose best filter for each line
				break;
		}
		
		bytes = applyPngFilterMethod(bytes, lineLength, colorsPerPixel, filter_method);
		
		var header = new Uint8Array(createZlibHeader(level));
		var checksum = adler32(bytes);
		
		var deflate = new Deflater(level);
		var a = deflate.append(bytes);
		var cBytes = deflate.flush();
		
		var len = header.length + a.length + cBytes.length;
		
		var cmpd = new Uint8Array(len + 4);
		cmpd.set(header);
		cmpd.set(a, header.length);
		cmpd.set(cBytes, header.length + a.length);
		
		cmpd[len++] = (checksum >>> 24) & 0xff;
		cmpd[len++] = (checksum >>> 16) & 0xff;
		cmpd[len++] = (checksum >>> 8) & 0xff;
		cmpd[len++] = checksum & 0xff;
		
		return jsPDFAPI.arrayBufferToBinaryString(cmpd);
	}
	, createZlibHeader = function(bytes, level){
		/*
		 * @see http://www.ietf.org/rfc/rfc1950.txt for zlib header 
		 */
		var cm = 8;
        var cinfo = Math.LOG2E * Math.log(0x8000) - 8;
        var cmf = (cinfo << 4) | cm;
        
        var hdr = cmf << 8;
        var flevel = Math.min(3, ((level - 1) & 0xff) >> 1);
        
        hdr |= (flevel << 6);
        hdr |= 0;//FDICT
        hdr += 31 - (hdr % 31);
        
        return [cmf, (hdr & 0xff) & 0xff];
	}
	, adler32 = function(array, param) {
		var adler = 1;
	    var s1 = adler & 0xffff,
	        s2 = (adler >>> 16) & 0xffff;
	    var len = array.length;
	    var tlen;
	    var i = 0;

	    while (len > 0) {
	      tlen = len > param ? param : len;
	      len -= tlen;
	      do {
	        s1 += array[i++];
	        s2 += s1;
	      } while (--tlen);

	      s1 %= 65521;
	      s2 %= 65521;
	    }

	    return ((s2 << 16) | s1) >>> 0;
	}
	, applyPngFilterMethod = function(bytes, lineLength, colorsPerPixel, filter_method) {
		var lines = bytes.length / lineLength,
			result = new Uint8Array(bytes.length + lines),
			filter_methods = getFilterMethods(),
			i = 0, line, prevLine, offset;
		
		for(; i < lines; i++) {
			offset = i * lineLength;
			line = bytes.subarray(offset, offset + lineLength);
			
			if(filter_method) {
				result.set(filter_method(line, colorsPerPixel, prevLine), offset + i);
				
			}else{
			
				var j = 0,
					len = filter_methods.length,
					results = [];
				
				for(; j < len; j++)
					results[j] = filter_methods[j](line, colorsPerPixel, prevLine);
				
				var ind = getIndexOfSmallestSum(results.concat());
				
				result.set(results[ind], offset + i);
			}
			
			prevLine = line;
		}
		
		return result;
	}
	, filterNone = function(line, colorsPerPixel, prevLine) {
		/*var result = new Uint8Array(line.length + 1);
		result[0] = 0;
		result.set(line, 1);*/
		
		var result = Array.apply([], line);
		result.unshift(0);

		return result;
	}
	, filterSub = function(line, colorsPerPixel, prevLine) {
		var result = [],
			i = 0,
			len = line.length,
			left;
		
		result[0] = 1;
		
		for(; i < len; i++) {
			left = line[i - colorsPerPixel] || 0;
			result[i + 1] = (line[i] - left + 0x0100) & 0xff;
		}
		
		return result;
	}
	, filterUp = function(line, colorsPerPixel, prevLine) {
		var result = [],
			i = 0,
			len = line.length,
			up;
		
		result[0] = 2;
		
		for(; i < len; i++) {
			up = prevLine && prevLine[i] || 0;
			result[i + 1] = (line[i] - up + 0x0100) & 0xff;
		}
		
		return result;
	}
	, filterAverage = function(line, colorsPerPixel, prevLine) {
		var result = [],
			i = 0,
			len = line.length,
			left,
			up;
	
		result[0] = 3;
		
		for(; i < len; i++) {
			left = line[i - colorsPerPixel] || 0;
			up = prevLine && prevLine[i] || 0;
			result[i + 1] = (line[i] + 0x0100 - ((left + up) >>> 1)) & 0xff;
		}
		
		return result;
	}
	, filterPaeth = function(line, colorsPerPixel, prevLine) {
		var result = [],
			i = 0,
			len = line.length,
			left,
			up,
			upLeft,
			paeth;
		
		result[0] = 4;
		
		for(; i < len; i++) {
			left = line[i - colorsPerPixel] || 0;
			up = prevLine && prevLine[i] || 0;
			upLeft = prevLine && prevLine[i - colorsPerPixel] || 0;
			paeth = paethPredictor(left, up, upLeft);
			result[i + 1] = (line[i] - paeth + 0x0100) & 0xff;
		}
		
		return result;
	}
	,paethPredictor = function(left, up, upLeft) {

		var p = left + up - upLeft,
	        pLeft = Math.abs(p - left),
	        pUp = Math.abs(p - up),
	        pUpLeft = Math.abs(p - upLeft);
		
		return (pLeft <= pUp && pLeft <= pUpLeft) ? left : (pUp <= pUpLeft) ? up : upLeft;
	}
	, getFilterMethods = function() {
		return [filterNone, filterSub, filterUp, filterAverage, filterPaeth];
	}
	,getIndexOfSmallestSum = function(arrays) {
		var i = 0,
			len = arrays.length,
			sum, min, ind;
		
		while(i < len) {
			sum = absSum(arrays[i].slice(1));
			
			if(sum < min || !min) {
				min = sum;
				ind = i;
			}
			
			i++;
		}
		
		return ind;
	}
	, absSum = function(array) {
		var i = 0,
			len = array.length,
			sum = 0;
	
		while(i < len)
			sum += Math.abs(array[i++]);
			
		return sum;
	}
	, logImg = function(img) {
		console.log("width: " + img.width);
		console.log("height: " + img.height);
		console.log("bits: " + img.bits);
		console.log("colorType: " + img.colorType);
		console.log("transparency:");
		console.log(img.transparency);
		console.log("text:");
		console.log(img.text);
		console.log("compressionMethod: " + img.compressionMethod);
		console.log("filterMethod: " + img.filterMethod);
		console.log("interlaceMethod: " + img.interlaceMethod);
		console.log("imgData:");
		console.log(img.imgData);
		console.log("palette:");
		console.log(img.palette);
		console.log("colors: " + img.colors);
		console.log("colorSpace: " + img.colorSpace);
		console.log("pixelBitlength: " + img.pixelBitlength);
		console.log("hasAlphaChannel: " + img.hasAlphaChannel);
	};
	
	
	
	
	jsPDFAPI.processPNG = function(imageData, imageIndex, alias, compression, dataAsBinaryString) {
		'use strict'
		
		var colorSpace = this.color_spaces.DEVICE_RGB,
			decode = this.decode.FLATE_DECODE,
			bpc = 8,
			img, dp, trns,
			colors, pal, smask;
		
	/*	if(this.isString(imageData)) {
			
		}*/
		
		if(this.isArrayBuffer(imageData))
			imageData = new Uint8Array(imageData);
		
		if(this.isArrayBufferView(imageData)) {
			
			if(doesNotHavePngJS())
				throw new Error("PNG support requires png.js and zlib.js");
				
			img = new PNG(imageData);
			imageData = img.imgData;
			bpc = img.bits;
			colorSpace = img.colorSpace;
			colors = img.colors;
			
			//logImg(img);
			
			/*
			 * colorType 6 - Each pixel is an R,G,B triple, followed by an alpha sample.
			 * 
			 * colorType 4 - Each pixel is a grayscale sample, followed by an alpha sample.
			 * 
			 * Extract alpha to create two separate images, using the alpha as a sMask
			 */
			if([4,6].indexOf(img.colorType) !== -1) {
				
				/*
				 * processes 8 bit RGBA and grayscale + alpha images
				 */
				if(img.bits === 8) {
				
  				        var pixels = img.pixelBitlength == 32 ? new Uint32Array(img.decodePixels().buffer) : img.pixelBitlength == 16 ? new Uint16Array(img.decodePixels().buffer) : new Uint8Array(img.decodePixels().buffer),
						len = pixels.length,
						imgData = new Uint8Array(len * img.colors),
						alphaData = new Uint8Array(len),
						pDiff = img.pixelBitlength - img.bits,
						i = 0, n = 0, pixel, pbl;
				
					for(; i < len; i++) {
						pixel = pixels[i];
						pbl = 0;
						
						while(pbl < pDiff) {
							
							imgData[n++] = ( pixel >>> pbl ) & 0xff;
							pbl = pbl + img.bits;
						}
						
						alphaData[i] = ( pixel >>> pbl ) & 0xff;
					}
				}
				
				/*
				 * processes 16 bit RGBA and grayscale + alpha images
				 */
				if(img.bits === 16) {
					
					var pixels = new Uint32Array(img.decodePixels().buffer),
						len = pixels.length,
						imgData = new Uint8Array((len * (32 / img.pixelBitlength) ) * img.colors),
						alphaData = new Uint8Array(len * (32 / img.pixelBitlength) ),
						hasColors = img.colors > 1,
						i = 0, n = 0, a = 0, pixel;
					
					while(i < len) {
						pixel = pixels[i++];
						
						imgData[n++] = (pixel >>> 0) & 0xFF;
						
						if(hasColors) {
							imgData[n++] = (pixel >>> 16) & 0xFF;
							
							pixel = pixels[i++];
							imgData[n++] = (pixel >>> 0) & 0xFF;
						}
						
						alphaData[a++] = (pixel >>> 16) & 0xFF;
					}
					
					bpc = 8;
				}
				
				if(canCompress(compression)) {
										
					imageData = compressBytes(imgData, img.width * img.colors, img.colors, compression);
					smask = compressBytes(alphaData, img.width, 1, compression);
					
				}else{
					
					imageData = imgData;
					smask = alphaData;
					decode = null;
				}
			}
			
			/*
			 * Indexed png. Each pixel is a palette index.
			 */
			if(img.colorType === 3) {
				
				colorSpace = this.color_spaces.INDEXED;
				pal = img.palette;
				
				if(img.transparency.indexed) {
					
					var trans = img.transparency.indexed;
					
					var total = 0,
						i = 0,
						len = trans.length;

					for(; i<len; ++i)
					    total += trans[i];
					
					total = total / 255;
					
					/*
					 * a single color is specified as 100% transparent (0),
					 * so we set trns to use a /Mask with that index
					 */
					if(total === len - 1 && trans.indexOf(0) !== -1) {
						trns = [trans.indexOf(0)];
					
					/*
					 * there's more than one colour within the palette that specifies
					 * a transparency value less than 255, so we unroll the pixels to create an image sMask
					 */
					}else if(total !== len){
						
						var pixels = img.decodePixels(),
							alphaData = new Uint8Array(pixels.length),
							i = 0,
							len = pixels.length;
						
						for(; i < len; i++)
							alphaData[i] = trans[pixels[i]];
						
						smask = compressBytes(alphaData, img.width, 1);
					}
				}
			}
			
			if(decode === this.decode.FLATE_DECODE)
				dp = '/Predictor 15 /Colors '+ colors +' /BitsPerComponent '+ bpc +' /Columns '+ img.width;
			else
				//remove 'Predictor' as it applies to the type of png filter applied to its IDAT - we only apply with compression
				dp = '/Colors '+ colors +' /BitsPerComponent '+ bpc +' /Columns '+ img.width;
			
			if(this.isArrayBuffer(imageData) || this.isArrayBufferView(imageData))
				imageData = this.arrayBufferToBinaryString(imageData);
			
			if(smask && this.isArrayBuffer(smask) || this.isArrayBufferView(smask))
				smask = this.arrayBufferToBinaryString(smask);
			
			return this.createImageInfo(imageData, img.width, img.height, colorSpace,
										bpc, decode, imageIndex, alias, dp, trns, pal, smask);
		}
		
		throw new Error("Unsupported PNG image data, try using JPEG instead.");
	}

})(jsPDF.API)

},{"./jspdf":3,"./png":6,"zlib-browserify":7}],6:[function(require,module,exports){
// Generated by CoffeeScript 1.4.0
/*
 # MIT LICENSE
 # Copyright (c) 2011 Devon Govett
 #
 # Permission is hereby granted, free of charge, to any person obtaining a copy of this
 # software and associated documentation files (the "Software"), to deal in the Software
 # without restriction, including without limitation the rights to use, copy, modify, merge,
 # publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons
 # to whom the Software is furnished to do so, subject to the following conditions:
 #
 # The above copyright notice and this permission notice shall be included in all copies or
 # substantial portions of the Software.
 #
 # THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
 # BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 # NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 # DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 # OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
(function() {
    var PNG;
    PNG = (function() {
        var APNG_BLEND_OP_OVER, APNG_BLEND_OP_SOURCE, APNG_DISPOSE_OP_BACKGROUND, APNG_DISPOSE_OP_NONE, APNG_DISPOSE_OP_PREVIOUS, makeImage, scratchCanvas, scratchCtx;
        PNG.load = function(url, canvas, callback) {
            var xhr,
                _this = this;
            if (typeof canvas === 'function') {
                callback = canvas;
            }
            xhr = new XMLHttpRequest;
            xhr.open("GET", url, true);
            xhr.responseType = "arraybuffer";
            xhr.onload = function() {
                var data, png;
                data = new Uint8Array(xhr.response || xhr.mozResponseArrayBuffer);
                png = new PNG(data);
                if (typeof (canvas != null ? canvas.getContext : void 0) === 'function') {
                    png.render(canvas);
                }
                return typeof callback === "function" ? callback(png) : void 0;
            };
            return xhr.send(null);
        };
        APNG_DISPOSE_OP_NONE = 0;
        APNG_DISPOSE_OP_BACKGROUND = 1;
        APNG_DISPOSE_OP_PREVIOUS = 2;
        APNG_BLEND_OP_SOURCE = 0;
        APNG_BLEND_OP_OVER = 1;
        function PNG(data) {
            var chunkSize, colors, delayDen, delayNum, frame, i, index, key, section, short, text, _i, _j, _ref;
            this.data = data;
            this.pos = 8;
            this.palette = [];
            this.imgData = [];
            this.transparency = {};
            this.animation = null;
            this.text = {};
            frame = null;
            while (true) {
                chunkSize = this.readUInt32();
                section = ((function() {
                    var _i, _results;
                    _results = [];
                    for (i = _i = 0; _i < 4; i = ++_i) {
                        _results.push(String.fromCharCode(this.data[this.pos++]));
                    }
                    return _results;
                }).call(this)).join('');
                switch (section) {
                    case 'IHDR':
                        this.width = this.readUInt32();
                        this.height = this.readUInt32();
                        this.bits = this.data[this.pos++];
                        this.colorType = this.data[this.pos++];
                        this.compressionMethod = this.data[this.pos++];
                        this.filterMethod = this.data[this.pos++];
                        this.interlaceMethod = this.data[this.pos++];
                        break;
                    case 'acTL':
                        this.animation = {
                            numFrames: this.readUInt32(),
                            numPlays: this.readUInt32() || Infinity,
                            frames: []
                        };
                        break;
                    case 'PLTE':
                        this.palette = this.read(chunkSize);
                        break;
                    case 'fcTL':
                        if (frame) {
                            this.animation.frames.push(frame);
                        }
                        this.pos += 4;
                        frame = {
                            width: this.readUInt32(),
                            height: this.readUInt32(),
                            xOffset: this.readUInt32(),
                            yOffset: this.readUInt32()
                        };
                        delayNum = this.readUInt16();
                        delayDen = this.readUInt16() || 100;
                        frame.delay = 1000 * delayNum / delayDen;
                        frame.disposeOp = this.data[this.pos++];
                        frame.blendOp = this.data[this.pos++];
                        frame.data = [];
                        break;
                    case 'IDAT':
                    case 'fdAT':
                        if (section === 'fdAT') {
                            this.pos += 4;
                            chunkSize -= 4;
                        }
                        data = (frame != null ? frame.data : void 0) || this.imgData;
                        for (i = _i = 0; 0 <= chunkSize ? _i < chunkSize : _i > chunkSize; i = 0 <= chunkSize ? ++_i : --_i) {
                            data.push(this.data[this.pos++]);
                        }
                        break;
                    case 'tRNS':
                        this.transparency = {};
                        switch (this.colorType) {
                            case 3:
                                this.transparency.indexed = this.read(chunkSize);
                                short = 255 - this.transparency.indexed.length;
                                if (short > 0) {
                                    for (i = _j = 0; 0 <= short ? _j < short : _j > short; i = 0 <= short ? ++_j : --_j) {
                                        this.transparency.indexed.push(255);
                                    }
                                }
                                break;
                            case 0:
                                this.transparency.grayscale = this.read(chunkSize)[0];
                                break;
                            case 2:
                                this.transparency.rgb = this.read(chunkSize);
                        }
                        break;
                    case 'tEXt':
                        text = this.read(chunkSize);
                        index = text.indexOf(0);
                        key = String.fromCharCode.apply(String, text.slice(0, index));
                        this.text[key] = String.fromCharCode.apply(String, text.slice(index + 1));
                        break;
                    case 'IEND':
                        if (frame) {
                            this.animation.frames.push(frame);
                        }
                        this.colors = (function() {
                            switch (this.colorType) {
                                case 0:
                                case 3:
                                case 4:
                                    return 1;
                                case 2:
                                case 6:
                                    return 3;
                            }
                        }).call(this);
                        this.hasAlphaChannel = (_ref = this.colorType) === 4 || _ref === 6;
                        colors = this.colors + (this.hasAlphaChannel ? 1 : 0);
                        this.pixelBitlength = this.bits * colors;
                        this.colorSpace = (function() {
                            switch (this.colors) {
                                case 1:
                                    return 'DeviceGray';
                                case 3:
                                    return 'DeviceRGB';
                            }
                        }).call(this);
                        this.imgData = new Uint8Array(this.imgData);
                        return;
                    default:
                        this.pos += chunkSize;
                }
                this.pos += 4;
                if (this.pos > this.data.length) {
                    throw new Error("Incomplete or corrupt PNG file");
                }
            }
            return;
        }
        PNG.prototype.read = function(bytes) {
            var i, _i, _results;
            _results = [];
            for (i = _i = 0; 0 <= bytes ? _i < bytes : _i > bytes; i = 0 <= bytes ? ++_i : --_i) {
                _results.push(this.data[this.pos++]);
            }
            return _results;
        };
        PNG.prototype.readUInt32 = function() {
            var b1, b2, b3, b4;
            b1 = this.data[this.pos++] << 24;
            b2 = this.data[this.pos++] << 16;
            b3 = this.data[this.pos++] << 8;
            b4 = this.data[this.pos++];
            return b1 | b2 | b3 | b4;
        };
        PNG.prototype.readUInt16 = function() {
            var b1, b2;
            b1 = this.data[this.pos++] << 8;
            b2 = this.data[this.pos++];
            return b1 | b2;
        };
        PNG.prototype.decodePixels = function(data) {
            var byte, c, col, i, left, length, p, pa, paeth, pb, pc, pixelBytes, pixels, pos, row, scanlineLength, upper, upperLeft, _i, _j, _k, _l, _m;
            if (data == null) {
                data = this.imgData;
            }
            if (data.length === 0) {
                return new Uint8Array(0);
            }
            data = new FlateStream(data);
            data = data.getBytes();
            pixelBytes = this.pixelBitlength / 8;
            scanlineLength = pixelBytes * this.width;
            pixels = new Uint8Array(scanlineLength * this.height);
            length = data.length;
            row = 0;
            pos = 0;
            c = 0;
            while (pos < length) {
                switch (data[pos++]) {
                    case 0:
                        for (i = _i = 0; _i < scanlineLength; i = _i += 1) {
                            pixels[c++] = data[pos++];
                        }
                        break;
                    case 1:
                        for (i = _j = 0; _j < scanlineLength; i = _j += 1) {
                            byte = data[pos++];
                            left = i < pixelBytes ? 0 : pixels[c - pixelBytes];
                            pixels[c++] = (byte + left) % 256;
                        }
                        break;
                    case 2:
                        for (i = _k = 0; _k < scanlineLength; i = _k += 1) {
                            byte = data[pos++];
                            col = (i - (i % pixelBytes)) / pixelBytes;
                            upper = row && pixels[(row - 1) * scanlineLength + col * pixelBytes + (i % pixelBytes)];
                            pixels[c++] = (upper + byte) % 256;
                        }
                        break;
                    case 3:
                        for (i = _l = 0; _l < scanlineLength; i = _l += 1) {
                            byte = data[pos++];
                            col = (i - (i % pixelBytes)) / pixelBytes;
                            left = i < pixelBytes ? 0 : pixels[c - pixelBytes];
                            upper = row && pixels[(row - 1) * scanlineLength + col * pixelBytes + (i % pixelBytes)];
                            pixels[c++] = (byte + Math.floor((left + upper) / 2)) % 256;
                        }
                        break;
                    case 4:
                        for (i = _m = 0; _m < scanlineLength; i = _m += 1) {
                            byte = data[pos++];
                            col = (i - (i % pixelBytes)) / pixelBytes;
                            left = i < pixelBytes ? 0 : pixels[c - pixelBytes];
                            if (row === 0) {
                                upper = upperLeft = 0;
                            } else {
                                upper = pixels[(row - 1) * scanlineLength + col * pixelBytes + (i % pixelBytes)];
                                upperLeft = col && pixels[(row - 1) * scanlineLength + (col - 1) * pixelBytes + (i % pixelBytes)];
                            }
                            p = left + upper - upperLeft;
                            pa = Math.abs(p - left);
                            pb = Math.abs(p - upper);
                            pc = Math.abs(p - upperLeft);
                            if (pa <= pb && pa <= pc) {
                                paeth = left;
                            } else if (pb <= pc) {
                                paeth = upper;
                            } else {
                                paeth = upperLeft;
                            }
                            pixels[c++] = (byte + paeth) % 256;
                        }
                        break;
                    default:
                        throw new Error("Invalid filter algorithm: " + data[pos - 1]);
                }
                row++;
            }
            return pixels;
        };
        PNG.prototype.decodePalette = function() {
            var c, i, length, palette, pos, ret, transparency, _i, _ref, _ref1;
            palette = this.palette;
            transparency = this.transparency.indexed || [];
            ret = new Uint8Array((transparency.length || 0) + palette.length);
            pos = 0;
            length = palette.length;
            c = 0;
            for (i = _i = 0, _ref = palette.length; _i < _ref; i = _i += 3) {
                ret[pos++] = palette[i];
                ret[pos++] = palette[i + 1];
                ret[pos++] = palette[i + 2];
                ret[pos++] = (_ref1 = transparency[c++]) != null ? _ref1 : 255;
            }
            return ret;
        };
        PNG.prototype.copyToImageData = function(imageData, pixels) {
            var alpha, colors, data, i, input, j, k, length, palette, v, _ref;
            colors = this.colors;
            palette = null;
            alpha = this.hasAlphaChannel;
            if (this.palette.length) {
                palette = (_ref = this._decodedPalette) != null ? _ref : this._decodedPalette = this.decodePalette();
                colors = 4;
                alpha = true;
            }
            data = imageData.data || imageData;
            length = data.length;
            input = palette || pixels;
            i = j = 0;
            if (colors === 1) {
                while (i < length) {
                    k = palette ? pixels[i / 4] * 4 : j;
                    v = input[k++];
                    data[i++] = v;
                    data[i++] = v;
                    data[i++] = v;
                    data[i++] = alpha ? input[k++] : 255;
                    j = k;
                }
            } else {
                while (i < length) {
                    k = palette ? pixels[i / 4] * 4 : j;
                    data[i++] = input[k++];
                    data[i++] = input[k++];
                    data[i++] = input[k++];
                    data[i++] = alpha ? input[k++] : 255;
                    j = k;
                }
            }
        };
        PNG.prototype.decode = function() {
            var ret;
            ret = new Uint8Array(this.width * this.height * 4);
            this.copyToImageData(ret, this.decodePixels());
            return ret;
        };
        scratchCanvas = document.createElement('canvas');
        scratchCtx = scratchCanvas.getContext('2d');
        makeImage = function(imageData) {
            var img;
            scratchCtx.width = imageData.width;
            scratchCtx.height = imageData.height;
            scratchCtx.clearRect(0, 0, imageData.width, imageData.height);
            scratchCtx.putImageData(imageData, 0, 0);
            img = new Image;
            img.src = scratchCanvas.toDataURL();
            return img;
        };
        PNG.prototype.decodeFrames = function(ctx) {
            var frame, i, imageData, pixels, _i, _len, _ref, _results;
            if (!this.animation) {
                return;
            }
            _ref = this.animation.frames;
            _results = [];
            for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
                frame = _ref[i];
                imageData = ctx.createImageData(frame.width, frame.height);
                pixels = this.decodePixels(new Uint8Array(frame.data));
                this.copyToImageData(imageData, pixels);
                frame.imageData = imageData;
                _results.push(frame.image = makeImage(imageData));
            }
            return _results;
        };
        PNG.prototype.renderFrame = function(ctx, number) {
            var frame, frames, prev;
            frames = this.animation.frames;
            frame = frames[number];
            prev = frames[number - 1];
            if (number === 0) {
                ctx.clearRect(0, 0, this.width, this.height);
            }
            if ((prev != null ? prev.disposeOp : void 0) === APNG_DISPOSE_OP_BACKGROUND) {
                ctx.clearRect(prev.xOffset, prev.yOffset, prev.width, prev.height);
            } else if ((prev != null ? prev.disposeOp : void 0) === APNG_DISPOSE_OP_PREVIOUS) {
                ctx.putImageData(prev.imageData, prev.xOffset, prev.yOffset);
            }
            if (frame.blendOp === APNG_BLEND_OP_SOURCE) {
                ctx.clearRect(frame.xOffset, frame.yOffset, frame.width, frame.height);
            }
            return ctx.drawImage(frame.image, frame.xOffset, frame.yOffset);
        };
        PNG.prototype.animate = function(ctx) {
            var doFrame, frameNumber, frames, numFrames, numPlays, _ref,
                _this = this;
            frameNumber = 0;
            _ref = this.animation, numFrames = _ref.numFrames, frames = _ref.frames, numPlays = _ref.numPlays;
            return (doFrame = function() {
                var f, frame;
                f = frameNumber++ % numFrames;
                frame = frames[f];
                _this.renderFrame(ctx, f);
                if (numFrames > 1 && frameNumber / numFrames < numPlays) {
                    return _this.animation._timeout = setTimeout(doFrame, frame.delay);
                }
            })();
        };
        PNG.prototype.stopAnimation = function() {
            var _ref;
            return clearTimeout((_ref = this.animation) != null ? _ref._timeout : void 0);
        };
        PNG.prototype.render = function(canvas) {
            var ctx, data;
            if (canvas._png) {
                canvas._png.stopAnimation();
            }
            canvas._png = this;
            canvas.width = this.width;
            canvas.height = this.height;
            ctx = canvas.getContext("2d");
            if (this.animation) {
                this.decodeFrames(ctx);
                return this.animate(ctx);
            } else {
                data = ctx.createImageData(this.width, this.height);
                this.copyToImageData(data, this.decodePixels());
                return ctx.putImageData(data, 0, 0);
            }
        };
        module.exports = PNG;
    })();
}).call(this);

},{}],7:[function(require,module,exports){
(function (Buffer){
var Zlib = module.exports = require('./zlib');

// the least I can do is make error messages for the rest of the node.js/zlib api.
// (thanks, dominictarr)
function error () {
  var m = [].slice.call(arguments).join(' ')
  throw new Error([
    m,
    'we accept pull requests',
    'http://github.com/brianloveswords/zlib-browserify'
    ].join('\n'))
}

;['createGzip'
, 'createGunzip'
, 'createDeflate'
, 'createDeflateRaw'
, 'createInflate'
, 'createInflateRaw'
, 'createUnzip'
, 'Gzip'
, 'Gunzip'
, 'Inflate'
, 'InflateRaw'
, 'Deflate'
, 'DeflateRaw'
, 'Unzip'
, 'inflateRaw'
, 'deflateRaw'].forEach(function (name) {
  Zlib[name] = function () {
    error('sorry,', name, 'is not implemented yet')
  }
});

var _deflate = Zlib.deflate;
var _gzip = Zlib.gzip;

Zlib.deflate = function deflate(stringOrBuffer, callback) {
  return _deflate(Buffer(stringOrBuffer), callback);
};
Zlib.gzip = function gzip(stringOrBuffer, callback) {
  return _gzip(Buffer(stringOrBuffer), callback);
};

}).call(this,require("buffer").Buffer)
},{"./zlib":8,"buffer":9}],8:[function(require,module,exports){
(function (process,Buffer){
/** @license zlib.js 0.1.7 2012 - imaya [ https://github.com/imaya/zlib.js ] The MIT License */(function() {'use strict';function q(b){throw b;}var t=void 0,u=!0;var A="undefined"!==typeof Uint8Array&&"undefined"!==typeof Uint16Array&&"undefined"!==typeof Uint32Array;function E(b,a){this.index="number"===typeof a?a:0;this.m=0;this.buffer=b instanceof(A?Uint8Array:Array)?b:new (A?Uint8Array:Array)(32768);2*this.buffer.length<=this.index&&q(Error("invalid index"));this.buffer.length<=this.index&&this.f()}E.prototype.f=function(){var b=this.buffer,a,c=b.length,d=new (A?Uint8Array:Array)(c<<1);if(A)d.set(b);else for(a=0;a<c;++a)d[a]=b[a];return this.buffer=d};
E.prototype.d=function(b,a,c){var d=this.buffer,f=this.index,e=this.m,g=d[f],k;c&&1<a&&(b=8<a?(G[b&255]<<24|G[b>>>8&255]<<16|G[b>>>16&255]<<8|G[b>>>24&255])>>32-a:G[b]>>8-a);if(8>a+e)g=g<<a|b,e+=a;else for(k=0;k<a;++k)g=g<<1|b>>a-k-1&1,8===++e&&(e=0,d[f++]=G[g],g=0,f===d.length&&(d=this.f()));d[f]=g;this.buffer=d;this.m=e;this.index=f};E.prototype.finish=function(){var b=this.buffer,a=this.index,c;0<this.m&&(b[a]<<=8-this.m,b[a]=G[b[a]],a++);A?c=b.subarray(0,a):(b.length=a,c=b);return c};
var aa=new (A?Uint8Array:Array)(256),J;for(J=0;256>J;++J){for(var N=J,Q=N,ba=7,N=N>>>1;N;N>>>=1)Q<<=1,Q|=N&1,--ba;aa[J]=(Q<<ba&255)>>>0}var G=aa;function R(b,a,c){var d,f="number"===typeof a?a:a=0,e="number"===typeof c?c:b.length;d=-1;for(f=e&7;f--;++a)d=d>>>8^S[(d^b[a])&255];for(f=e>>3;f--;a+=8)d=d>>>8^S[(d^b[a])&255],d=d>>>8^S[(d^b[a+1])&255],d=d>>>8^S[(d^b[a+2])&255],d=d>>>8^S[(d^b[a+3])&255],d=d>>>8^S[(d^b[a+4])&255],d=d>>>8^S[(d^b[a+5])&255],d=d>>>8^S[(d^b[a+6])&255],d=d>>>8^S[(d^b[a+7])&255];return(d^4294967295)>>>0}
var ga=[0,1996959894,3993919788,2567524794,124634137,1886057615,3915621685,2657392035,249268274,2044508324,3772115230,2547177864,162941995,2125561021,3887607047,2428444049,498536548,1789927666,4089016648,2227061214,450548861,1843258603,4107580753,2211677639,325883990,1684777152,4251122042,2321926636,335633487,1661365465,4195302755,2366115317,997073096,1281953886,3579855332,2724688242,1006888145,1258607687,3524101629,2768942443,901097722,1119000684,3686517206,2898065728,853044451,1172266101,3705015759,
2882616665,651767980,1373503546,3369554304,3218104598,565507253,1454621731,3485111705,3099436303,671266974,1594198024,3322730930,2970347812,795835527,1483230225,3244367275,3060149565,1994146192,31158534,2563907772,4023717930,1907459465,112637215,2680153253,3904427059,2013776290,251722036,2517215374,3775830040,2137656763,141376813,2439277719,3865271297,1802195444,476864866,2238001368,4066508878,1812370925,453092731,2181625025,4111451223,1706088902,314042704,2344532202,4240017532,1658658271,366619977,
2362670323,4224994405,1303535960,984961486,2747007092,3569037538,1256170817,1037604311,2765210733,3554079995,1131014506,879679996,2909243462,3663771856,1141124467,855842277,2852801631,3708648649,1342533948,654459306,3188396048,3373015174,1466479909,544179635,3110523913,3462522015,1591671054,702138776,2966460450,3352799412,1504918807,783551873,3082640443,3233442989,3988292384,2596254646,62317068,1957810842,3939845945,2647816111,81470997,1943803523,3814918930,2489596804,225274430,2053790376,3826175755,
2466906013,167816743,2097651377,4027552580,2265490386,503444072,1762050814,4150417245,2154129355,426522225,1852507879,4275313526,2312317920,282753626,1742555852,4189708143,2394877945,397917763,1622183637,3604390888,2714866558,953729732,1340076626,3518719985,2797360999,1068828381,1219638859,3624741850,2936675148,906185462,1090812512,3747672003,2825379669,829329135,1181335161,3412177804,3160834842,628085408,1382605366,3423369109,3138078467,570562233,1426400815,3317316542,2998733608,733239954,1555261956,
3268935591,3050360625,752459403,1541320221,2607071920,3965973030,1969922972,40735498,2617837225,3943577151,1913087877,83908371,2512341634,3803740692,2075208622,213261112,2463272603,3855990285,2094854071,198958881,2262029012,4057260610,1759359992,534414190,2176718541,4139329115,1873836001,414664567,2282248934,4279200368,1711684554,285281116,2405801727,4167216745,1634467795,376229701,2685067896,3608007406,1308918612,956543938,2808555105,3495958263,1231636301,1047427035,2932959818,3654703836,1088359270,
936918E3,2847714899,3736837829,1202900863,817233897,3183342108,3401237130,1404277552,615818150,3134207493,3453421203,1423857449,601450431,3009837614,3294710456,1567103746,711928724,3020668471,3272380065,1510334235,755167117],S=A?new Uint32Array(ga):ga;function ha(){};function ia(b){this.buffer=new (A?Uint16Array:Array)(2*b);this.length=0}ia.prototype.getParent=function(b){return 2*((b-2)/4|0)};ia.prototype.push=function(b,a){var c,d,f=this.buffer,e;c=this.length;f[this.length++]=a;for(f[this.length++]=b;0<c;)if(d=this.getParent(c),f[c]>f[d])e=f[c],f[c]=f[d],f[d]=e,e=f[c+1],f[c+1]=f[d+1],f[d+1]=e,c=d;else break;return this.length};
ia.prototype.pop=function(){var b,a,c=this.buffer,d,f,e;a=c[0];b=c[1];this.length-=2;c[0]=c[this.length];c[1]=c[this.length+1];for(e=0;;){f=2*e+2;if(f>=this.length)break;f+2<this.length&&c[f+2]>c[f]&&(f+=2);if(c[f]>c[e])d=c[e],c[e]=c[f],c[f]=d,d=c[e+1],c[e+1]=c[f+1],c[f+1]=d;else break;e=f}return{index:b,value:a,length:this.length}};function ja(b){var a=b.length,c=0,d=Number.POSITIVE_INFINITY,f,e,g,k,h,l,s,n,m;for(n=0;n<a;++n)b[n]>c&&(c=b[n]),b[n]<d&&(d=b[n]);f=1<<c;e=new (A?Uint32Array:Array)(f);g=1;k=0;for(h=2;g<=c;){for(n=0;n<a;++n)if(b[n]===g){l=0;s=k;for(m=0;m<g;++m)l=l<<1|s&1,s>>=1;for(m=l;m<f;m+=h)e[m]=g<<16|n;++k}++g;k<<=1;h<<=1}return[e,c,d]};function ma(b,a){this.k=na;this.F=0;this.input=A&&b instanceof Array?new Uint8Array(b):b;this.b=0;a&&(a.lazy&&(this.F=a.lazy),"number"===typeof a.compressionType&&(this.k=a.compressionType),a.outputBuffer&&(this.a=A&&a.outputBuffer instanceof Array?new Uint8Array(a.outputBuffer):a.outputBuffer),"number"===typeof a.outputIndex&&(this.b=a.outputIndex));this.a||(this.a=new (A?Uint8Array:Array)(32768))}var na=2,oa={NONE:0,L:1,t:na,X:3},pa=[],T;
for(T=0;288>T;T++)switch(u){case 143>=T:pa.push([T+48,8]);break;case 255>=T:pa.push([T-144+400,9]);break;case 279>=T:pa.push([T-256+0,7]);break;case 287>=T:pa.push([T-280+192,8]);break;default:q("invalid literal: "+T)}
ma.prototype.h=function(){var b,a,c,d,f=this.input;switch(this.k){case 0:c=0;for(d=f.length;c<d;){a=A?f.subarray(c,c+65535):f.slice(c,c+65535);c+=a.length;var e=a,g=c===d,k=t,h=t,l=t,s=t,n=t,m=this.a,p=this.b;if(A){for(m=new Uint8Array(this.a.buffer);m.length<=p+e.length+5;)m=new Uint8Array(m.length<<1);m.set(this.a)}k=g?1:0;m[p++]=k|0;h=e.length;l=~h+65536&65535;m[p++]=h&255;m[p++]=h>>>8&255;m[p++]=l&255;m[p++]=l>>>8&255;if(A)m.set(e,p),p+=e.length,m=m.subarray(0,p);else{s=0;for(n=e.length;s<n;++s)m[p++]=
e[s];m.length=p}this.b=p;this.a=m}break;case 1:var r=new E(A?new Uint8Array(this.a.buffer):this.a,this.b);r.d(1,1,u);r.d(1,2,u);var v=qa(this,f),x,O,y;x=0;for(O=v.length;x<O;x++)if(y=v[x],E.prototype.d.apply(r,pa[y]),256<y)r.d(v[++x],v[++x],u),r.d(v[++x],5),r.d(v[++x],v[++x],u);else if(256===y)break;this.a=r.finish();this.b=this.a.length;break;case na:var D=new E(A?new Uint8Array(this.a.buffer):this.a,this.b),Da,P,U,V,W,qb=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],ca,Ea,da,Fa,ka,sa=Array(19),
Ga,X,la,B,Ha;Da=na;D.d(1,1,u);D.d(Da,2,u);P=qa(this,f);ca=ra(this.U,15);Ea=ta(ca);da=ra(this.T,7);Fa=ta(da);for(U=286;257<U&&0===ca[U-1];U--);for(V=30;1<V&&0===da[V-1];V--);var Ia=U,Ja=V,I=new (A?Uint32Array:Array)(Ia+Ja),w,K,z,ea,H=new (A?Uint32Array:Array)(316),F,C,L=new (A?Uint8Array:Array)(19);for(w=K=0;w<Ia;w++)I[K++]=ca[w];for(w=0;w<Ja;w++)I[K++]=da[w];if(!A){w=0;for(ea=L.length;w<ea;++w)L[w]=0}w=F=0;for(ea=I.length;w<ea;w+=K){for(K=1;w+K<ea&&I[w+K]===I[w];++K);z=K;if(0===I[w])if(3>z)for(;0<
z--;)H[F++]=0,L[0]++;else for(;0<z;)C=138>z?z:138,C>z-3&&C<z&&(C=z-3),10>=C?(H[F++]=17,H[F++]=C-3,L[17]++):(H[F++]=18,H[F++]=C-11,L[18]++),z-=C;else if(H[F++]=I[w],L[I[w]]++,z--,3>z)for(;0<z--;)H[F++]=I[w],L[I[w]]++;else for(;0<z;)C=6>z?z:6,C>z-3&&C<z&&(C=z-3),H[F++]=16,H[F++]=C-3,L[16]++,z-=C}b=A?H.subarray(0,F):H.slice(0,F);ka=ra(L,7);for(B=0;19>B;B++)sa[B]=ka[qb[B]];for(W=19;4<W&&0===sa[W-1];W--);Ga=ta(ka);D.d(U-257,5,u);D.d(V-1,5,u);D.d(W-4,4,u);for(B=0;B<W;B++)D.d(sa[B],3,u);B=0;for(Ha=b.length;B<
Ha;B++)if(X=b[B],D.d(Ga[X],ka[X],u),16<=X){B++;switch(X){case 16:la=2;break;case 17:la=3;break;case 18:la=7;break;default:q("invalid code: "+X)}D.d(b[B],la,u)}var Ka=[Ea,ca],La=[Fa,da],M,Ma,fa,va,Na,Oa,Pa,Qa;Na=Ka[0];Oa=Ka[1];Pa=La[0];Qa=La[1];M=0;for(Ma=P.length;M<Ma;++M)if(fa=P[M],D.d(Na[fa],Oa[fa],u),256<fa)D.d(P[++M],P[++M],u),va=P[++M],D.d(Pa[va],Qa[va],u),D.d(P[++M],P[++M],u);else if(256===fa)break;this.a=D.finish();this.b=this.a.length;break;default:q("invalid compression type")}return this.a};
function ua(b,a){this.length=b;this.N=a}
var wa=function(){function b(a){switch(u){case 3===a:return[257,a-3,0];case 4===a:return[258,a-4,0];case 5===a:return[259,a-5,0];case 6===a:return[260,a-6,0];case 7===a:return[261,a-7,0];case 8===a:return[262,a-8,0];case 9===a:return[263,a-9,0];case 10===a:return[264,a-10,0];case 12>=a:return[265,a-11,1];case 14>=a:return[266,a-13,1];case 16>=a:return[267,a-15,1];case 18>=a:return[268,a-17,1];case 22>=a:return[269,a-19,2];case 26>=a:return[270,a-23,2];case 30>=a:return[271,a-27,2];case 34>=a:return[272,
a-31,2];case 42>=a:return[273,a-35,3];case 50>=a:return[274,a-43,3];case 58>=a:return[275,a-51,3];case 66>=a:return[276,a-59,3];case 82>=a:return[277,a-67,4];case 98>=a:return[278,a-83,4];case 114>=a:return[279,a-99,4];case 130>=a:return[280,a-115,4];case 162>=a:return[281,a-131,5];case 194>=a:return[282,a-163,5];case 226>=a:return[283,a-195,5];case 257>=a:return[284,a-227,5];case 258===a:return[285,a-258,0];default:q("invalid length: "+a)}}var a=[],c,d;for(c=3;258>=c;c++)d=b(c),a[c]=d[2]<<24|d[1]<<
16|d[0];return a}(),xa=A?new Uint32Array(wa):wa;
function qa(b,a){function c(a,c){var b=a.N,d=[],e=0,f;f=xa[a.length];d[e++]=f&65535;d[e++]=f>>16&255;d[e++]=f>>24;var g;switch(u){case 1===b:g=[0,b-1,0];break;case 2===b:g=[1,b-2,0];break;case 3===b:g=[2,b-3,0];break;case 4===b:g=[3,b-4,0];break;case 6>=b:g=[4,b-5,1];break;case 8>=b:g=[5,b-7,1];break;case 12>=b:g=[6,b-9,2];break;case 16>=b:g=[7,b-13,2];break;case 24>=b:g=[8,b-17,3];break;case 32>=b:g=[9,b-25,3];break;case 48>=b:g=[10,b-33,4];break;case 64>=b:g=[11,b-49,4];break;case 96>=b:g=[12,b-
65,5];break;case 128>=b:g=[13,b-97,5];break;case 192>=b:g=[14,b-129,6];break;case 256>=b:g=[15,b-193,6];break;case 384>=b:g=[16,b-257,7];break;case 512>=b:g=[17,b-385,7];break;case 768>=b:g=[18,b-513,8];break;case 1024>=b:g=[19,b-769,8];break;case 1536>=b:g=[20,b-1025,9];break;case 2048>=b:g=[21,b-1537,9];break;case 3072>=b:g=[22,b-2049,10];break;case 4096>=b:g=[23,b-3073,10];break;case 6144>=b:g=[24,b-4097,11];break;case 8192>=b:g=[25,b-6145,11];break;case 12288>=b:g=[26,b-8193,12];break;case 16384>=
b:g=[27,b-12289,12];break;case 24576>=b:g=[28,b-16385,13];break;case 32768>=b:g=[29,b-24577,13];break;default:q("invalid distance")}f=g;d[e++]=f[0];d[e++]=f[1];d[e++]=f[2];var h,k;h=0;for(k=d.length;h<k;++h)m[p++]=d[h];v[d[0]]++;x[d[3]]++;r=a.length+c-1;n=null}var d,f,e,g,k,h={},l,s,n,m=A?new Uint16Array(2*a.length):[],p=0,r=0,v=new (A?Uint32Array:Array)(286),x=new (A?Uint32Array:Array)(30),O=b.F,y;if(!A){for(e=0;285>=e;)v[e++]=0;for(e=0;29>=e;)x[e++]=0}v[256]=1;d=0;for(f=a.length;d<f;++d){e=k=0;
for(g=3;e<g&&d+e!==f;++e)k=k<<8|a[d+e];h[k]===t&&(h[k]=[]);l=h[k];if(!(0<r--)){for(;0<l.length&&32768<d-l[0];)l.shift();if(d+3>=f){n&&c(n,-1);e=0;for(g=f-d;e<g;++e)y=a[d+e],m[p++]=y,++v[y];break}0<l.length?(s=ya(a,d,l),n?n.length<s.length?(y=a[d-1],m[p++]=y,++v[y],c(s,0)):c(n,-1):s.length<O?n=s:c(s,0)):n?c(n,-1):(y=a[d],m[p++]=y,++v[y])}l.push(d)}m[p++]=256;v[256]++;b.U=v;b.T=x;return A?m.subarray(0,p):m}
function ya(b,a,c){var d,f,e=0,g,k,h,l,s=b.length;k=0;l=c.length;a:for(;k<l;k++){d=c[l-k-1];g=3;if(3<e){for(h=e;3<h;h--)if(b[d+h-1]!==b[a+h-1])continue a;g=e}for(;258>g&&a+g<s&&b[d+g]===b[a+g];)++g;g>e&&(f=d,e=g);if(258===g)break}return new ua(e,a-f)}
function ra(b,a){var c=b.length,d=new ia(572),f=new (A?Uint8Array:Array)(c),e,g,k,h,l;if(!A)for(h=0;h<c;h++)f[h]=0;for(h=0;h<c;++h)0<b[h]&&d.push(h,b[h]);e=Array(d.length/2);g=new (A?Uint32Array:Array)(d.length/2);if(1===e.length)return f[d.pop().index]=1,f;h=0;for(l=d.length/2;h<l;++h)e[h]=d.pop(),g[h]=e[h].value;k=za(g,g.length,a);h=0;for(l=e.length;h<l;++h)f[e[h].index]=k[h];return f}
function za(b,a,c){function d(b){var c=h[b][l[b]];c===a?(d(b+1),d(b+1)):--g[c];++l[b]}var f=new (A?Uint16Array:Array)(c),e=new (A?Uint8Array:Array)(c),g=new (A?Uint8Array:Array)(a),k=Array(c),h=Array(c),l=Array(c),s=(1<<c)-a,n=1<<c-1,m,p,r,v,x;f[c-1]=a;for(p=0;p<c;++p)s<n?e[p]=0:(e[p]=1,s-=n),s<<=1,f[c-2-p]=(f[c-1-p]/2|0)+a;f[0]=e[0];k[0]=Array(f[0]);h[0]=Array(f[0]);for(p=1;p<c;++p)f[p]>2*f[p-1]+e[p]&&(f[p]=2*f[p-1]+e[p]),k[p]=Array(f[p]),h[p]=Array(f[p]);for(m=0;m<a;++m)g[m]=c;for(r=0;r<f[c-1];++r)k[c-
1][r]=b[r],h[c-1][r]=r;for(m=0;m<c;++m)l[m]=0;1===e[c-1]&&(--g[0],++l[c-1]);for(p=c-2;0<=p;--p){v=m=0;x=l[p+1];for(r=0;r<f[p];r++)v=k[p+1][x]+k[p+1][x+1],v>b[m]?(k[p][r]=v,h[p][r]=a,x+=2):(k[p][r]=b[m],h[p][r]=m,++m);l[p]=0;1===e[p]&&d(p)}return g}
function ta(b){var a=new (A?Uint16Array:Array)(b.length),c=[],d=[],f=0,e,g,k,h;e=0;for(g=b.length;e<g;e++)c[b[e]]=(c[b[e]]|0)+1;e=1;for(g=16;e<=g;e++)d[e]=f,f+=c[e]|0,f<<=1;e=0;for(g=b.length;e<g;e++){f=d[b[e]];d[b[e]]+=1;k=a[e]=0;for(h=b[e];k<h;k++)a[e]=a[e]<<1|f&1,f>>>=1}return a};function Aa(b,a){this.input=b;this.b=this.c=0;this.g={};a&&(a.flags&&(this.g=a.flags),"string"===typeof a.filename&&(this.filename=a.filename),"string"===typeof a.comment&&(this.w=a.comment),a.deflateOptions&&(this.l=a.deflateOptions));this.l||(this.l={})}
Aa.prototype.h=function(){var b,a,c,d,f,e,g,k,h=new (A?Uint8Array:Array)(32768),l=0,s=this.input,n=this.c,m=this.filename,p=this.w;h[l++]=31;h[l++]=139;h[l++]=8;b=0;this.g.fname&&(b|=Ba);this.g.fcomment&&(b|=Ca);this.g.fhcrc&&(b|=Ra);h[l++]=b;a=(Date.now?Date.now():+new Date)/1E3|0;h[l++]=a&255;h[l++]=a>>>8&255;h[l++]=a>>>16&255;h[l++]=a>>>24&255;h[l++]=0;h[l++]=Sa;if(this.g.fname!==t){g=0;for(k=m.length;g<k;++g)e=m.charCodeAt(g),255<e&&(h[l++]=e>>>8&255),h[l++]=e&255;h[l++]=0}if(this.g.comment){g=
0;for(k=p.length;g<k;++g)e=p.charCodeAt(g),255<e&&(h[l++]=e>>>8&255),h[l++]=e&255;h[l++]=0}this.g.fhcrc&&(c=R(h,0,l)&65535,h[l++]=c&255,h[l++]=c>>>8&255);this.l.outputBuffer=h;this.l.outputIndex=l;f=new ma(s,this.l);h=f.h();l=f.b;A&&(l+8>h.buffer.byteLength?(this.a=new Uint8Array(l+8),this.a.set(new Uint8Array(h.buffer)),h=this.a):h=new Uint8Array(h.buffer));d=R(s,t,t);h[l++]=d&255;h[l++]=d>>>8&255;h[l++]=d>>>16&255;h[l++]=d>>>24&255;k=s.length;h[l++]=k&255;h[l++]=k>>>8&255;h[l++]=k>>>16&255;h[l++]=
k>>>24&255;this.c=n;A&&l<h.length&&(this.a=h=h.subarray(0,l));return h};var Sa=255,Ra=2,Ba=8,Ca=16;function Y(b,a){this.o=[];this.p=32768;this.e=this.j=this.c=this.s=0;this.input=A?new Uint8Array(b):b;this.u=!1;this.q=Ta;this.K=!1;if(a||!(a={}))a.index&&(this.c=a.index),a.bufferSize&&(this.p=a.bufferSize),a.bufferType&&(this.q=a.bufferType),a.resize&&(this.K=a.resize);switch(this.q){case Ua:this.b=32768;this.a=new (A?Uint8Array:Array)(32768+this.p+258);break;case Ta:this.b=0;this.a=new (A?Uint8Array:Array)(this.p);this.f=this.S;this.z=this.O;this.r=this.Q;break;default:q(Error("invalid inflate mode"))}}
var Ua=0,Ta=1;
Y.prototype.i=function(){for(;!this.u;){var b=Z(this,3);b&1&&(this.u=u);b>>>=1;switch(b){case 0:var a=this.input,c=this.c,d=this.a,f=this.b,e=t,g=t,k=t,h=d.length,l=t;this.e=this.j=0;e=a[c++];e===t&&q(Error("invalid uncompressed block header: LEN (first byte)"));g=e;e=a[c++];e===t&&q(Error("invalid uncompressed block header: LEN (second byte)"));g|=e<<8;e=a[c++];e===t&&q(Error("invalid uncompressed block header: NLEN (first byte)"));k=e;e=a[c++];e===t&&q(Error("invalid uncompressed block header: NLEN (second byte)"));k|=
e<<8;g===~k&&q(Error("invalid uncompressed block header: length verify"));c+g>a.length&&q(Error("input buffer is broken"));switch(this.q){case Ua:for(;f+g>d.length;){l=h-f;g-=l;if(A)d.set(a.subarray(c,c+l),f),f+=l,c+=l;else for(;l--;)d[f++]=a[c++];this.b=f;d=this.f();f=this.b}break;case Ta:for(;f+g>d.length;)d=this.f({B:2});break;default:q(Error("invalid inflate mode"))}if(A)d.set(a.subarray(c,c+g),f),f+=g,c+=g;else for(;g--;)d[f++]=a[c++];this.c=c;this.b=f;this.a=d;break;case 1:this.r(Va,Wa);break;
case 2:Xa(this);break;default:q(Error("unknown BTYPE: "+b))}}return this.z()};
var Ya=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],Za=A?new Uint16Array(Ya):Ya,$a=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,258,258],ab=A?new Uint16Array($a):$a,bb=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0],cb=A?new Uint8Array(bb):bb,db=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577],eb=A?new Uint16Array(db):db,fb=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,
10,11,11,12,12,13,13],gb=A?new Uint8Array(fb):fb,hb=new (A?Uint8Array:Array)(288),$,ib;$=0;for(ib=hb.length;$<ib;++$)hb[$]=143>=$?8:255>=$?9:279>=$?7:8;var Va=ja(hb),jb=new (A?Uint8Array:Array)(30),kb,lb;kb=0;for(lb=jb.length;kb<lb;++kb)jb[kb]=5;var Wa=ja(jb);function Z(b,a){for(var c=b.j,d=b.e,f=b.input,e=b.c,g;d<a;)g=f[e++],g===t&&q(Error("input buffer is broken")),c|=g<<d,d+=8;g=c&(1<<a)-1;b.j=c>>>a;b.e=d-a;b.c=e;return g}
function mb(b,a){for(var c=b.j,d=b.e,f=b.input,e=b.c,g=a[0],k=a[1],h,l,s;d<k;){h=f[e++];if(h===t)break;c|=h<<d;d+=8}l=g[c&(1<<k)-1];s=l>>>16;b.j=c>>s;b.e=d-s;b.c=e;return l&65535}
function Xa(b){function a(a,b,c){var d,e,f,g;for(g=0;g<a;)switch(d=mb(this,b),d){case 16:for(f=3+Z(this,2);f--;)c[g++]=e;break;case 17:for(f=3+Z(this,3);f--;)c[g++]=0;e=0;break;case 18:for(f=11+Z(this,7);f--;)c[g++]=0;e=0;break;default:e=c[g++]=d}return c}var c=Z(b,5)+257,d=Z(b,5)+1,f=Z(b,4)+4,e=new (A?Uint8Array:Array)(Za.length),g,k,h,l;for(l=0;l<f;++l)e[Za[l]]=Z(b,3);g=ja(e);k=new (A?Uint8Array:Array)(c);h=new (A?Uint8Array:Array)(d);b.r(ja(a.call(b,c,g,k)),ja(a.call(b,d,g,h)))}
Y.prototype.r=function(b,a){var c=this.a,d=this.b;this.A=b;for(var f=c.length-258,e,g,k,h;256!==(e=mb(this,b));)if(256>e)d>=f&&(this.b=d,c=this.f(),d=this.b),c[d++]=e;else{g=e-257;h=ab[g];0<cb[g]&&(h+=Z(this,cb[g]));e=mb(this,a);k=eb[e];0<gb[e]&&(k+=Z(this,gb[e]));d>=f&&(this.b=d,c=this.f(),d=this.b);for(;h--;)c[d]=c[d++-k]}for(;8<=this.e;)this.e-=8,this.c--;this.b=d};
Y.prototype.Q=function(b,a){var c=this.a,d=this.b;this.A=b;for(var f=c.length,e,g,k,h;256!==(e=mb(this,b));)if(256>e)d>=f&&(c=this.f(),f=c.length),c[d++]=e;else{g=e-257;h=ab[g];0<cb[g]&&(h+=Z(this,cb[g]));e=mb(this,a);k=eb[e];0<gb[e]&&(k+=Z(this,gb[e]));d+h>f&&(c=this.f(),f=c.length);for(;h--;)c[d]=c[d++-k]}for(;8<=this.e;)this.e-=8,this.c--;this.b=d};
Y.prototype.f=function(){var b=new (A?Uint8Array:Array)(this.b-32768),a=this.b-32768,c,d,f=this.a;if(A)b.set(f.subarray(32768,b.length));else{c=0;for(d=b.length;c<d;++c)b[c]=f[c+32768]}this.o.push(b);this.s+=b.length;if(A)f.set(f.subarray(a,a+32768));else for(c=0;32768>c;++c)f[c]=f[a+c];this.b=32768;return f};
Y.prototype.S=function(b){var a,c=this.input.length/this.c+1|0,d,f,e,g=this.input,k=this.a;b&&("number"===typeof b.B&&(c=b.B),"number"===typeof b.M&&(c+=b.M));2>c?(d=(g.length-this.c)/this.A[2],e=258*(d/2)|0,f=e<k.length?k.length+e:k.length<<1):f=k.length*c;A?(a=new Uint8Array(f),a.set(k)):a=k;return this.a=a};
Y.prototype.z=function(){var b=0,a=this.a,c=this.o,d,f=new (A?Uint8Array:Array)(this.s+(this.b-32768)),e,g,k,h;if(0===c.length)return A?this.a.subarray(32768,this.b):this.a.slice(32768,this.b);e=0;for(g=c.length;e<g;++e){d=c[e];k=0;for(h=d.length;k<h;++k)f[b++]=d[k]}e=32768;for(g=this.b;e<g;++e)f[b++]=a[e];this.o=[];return this.buffer=f};
Y.prototype.O=function(){var b,a=this.b;A?this.K?(b=new Uint8Array(a),b.set(this.a.subarray(0,a))):b=this.a.subarray(0,a):(this.a.length>a&&(this.a.length=a),b=this.a);return this.buffer=b};function nb(b){this.input=b;this.c=0;this.G=[];this.R=!1}
nb.prototype.i=function(){for(var b=this.input.length;this.c<b;){var a=new ha,c=t,d=t,f=t,e=t,g=t,k=t,h=t,l=t,s=t,n=this.input,m=this.c;a.C=n[m++];a.D=n[m++];(31!==a.C||139!==a.D)&&q(Error("invalid file signature:"+a.C+","+a.D));a.v=n[m++];switch(a.v){case 8:break;default:q(Error("unknown compression method: "+a.v))}a.n=n[m++];l=n[m++]|n[m++]<<8|n[m++]<<16|n[m++]<<24;a.$=new Date(1E3*l);a.ba=n[m++];a.aa=n[m++];0<(a.n&4)&&(a.W=n[m++]|n[m++]<<8,m+=a.W);if(0<(a.n&Ba)){h=[];for(k=0;0<(g=n[m++]);)h[k++]=
String.fromCharCode(g);a.name=h.join("")}if(0<(a.n&Ca)){h=[];for(k=0;0<(g=n[m++]);)h[k++]=String.fromCharCode(g);a.w=h.join("")}0<(a.n&Ra)&&(a.P=R(n,0,m)&65535,a.P!==(n[m++]|n[m++]<<8)&&q(Error("invalid header crc16")));c=n[n.length-4]|n[n.length-3]<<8|n[n.length-2]<<16|n[n.length-1]<<24;n.length-m-4-4<512*c&&(e=c);d=new Y(n,{index:m,bufferSize:e});a.data=f=d.i();m=d.c;a.Y=s=(n[m++]|n[m++]<<8|n[m++]<<16|n[m++]<<24)>>>0;R(f,t,t)!==s&&q(Error("invalid CRC-32 checksum: 0x"+R(f,t,t).toString(16)+" / 0x"+
s.toString(16)));a.Z=c=(n[m++]|n[m++]<<8|n[m++]<<16|n[m++]<<24)>>>0;(f.length&4294967295)!==c&&q(Error("invalid input size: "+(f.length&4294967295)+" / "+c));this.G.push(a);this.c=m}this.R=u;var p=this.G,r,v,x=0,O=0,y;r=0;for(v=p.length;r<v;++r)O+=p[r].data.length;if(A){y=new Uint8Array(O);for(r=0;r<v;++r)y.set(p[r].data,x),x+=p[r].data.length}else{y=[];for(r=0;r<v;++r)y[r]=p[r].data;y=Array.prototype.concat.apply([],y)}return y};function ob(b){if("string"===typeof b){var a=b.split(""),c,d;c=0;for(d=a.length;c<d;c++)a[c]=(a[c].charCodeAt(0)&255)>>>0;b=a}for(var f=1,e=0,g=b.length,k,h=0;0<g;){k=1024<g?1024:g;g-=k;do f+=b[h++],e+=f;while(--k);f%=65521;e%=65521}return(e<<16|f)>>>0};function pb(b,a){var c,d;this.input=b;this.c=0;if(a||!(a={}))a.index&&(this.c=a.index),a.verify&&(this.V=a.verify);c=b[this.c++];d=b[this.c++];switch(c&15){case rb:this.method=rb;break;default:q(Error("unsupported compression method"))}0!==((c<<8)+d)%31&&q(Error("invalid fcheck flag:"+((c<<8)+d)%31));d&32&&q(Error("fdict flag is not supported"));this.J=new Y(b,{index:this.c,bufferSize:a.bufferSize,bufferType:a.bufferType,resize:a.resize})}
pb.prototype.i=function(){var b=this.input,a,c;a=this.J.i();this.c=this.J.c;this.V&&(c=(b[this.c++]<<24|b[this.c++]<<16|b[this.c++]<<8|b[this.c++])>>>0,c!==ob(a)&&q(Error("invalid adler-32 checksum")));return a};var rb=8;function sb(b,a){this.input=b;this.a=new (A?Uint8Array:Array)(32768);this.k=tb.t;var c={},d;if((a||!(a={}))&&"number"===typeof a.compressionType)this.k=a.compressionType;for(d in a)c[d]=a[d];c.outputBuffer=this.a;this.I=new ma(this.input,c)}var tb=oa;
sb.prototype.h=function(){var b,a,c,d,f,e,g,k=0;g=this.a;b=rb;switch(b){case rb:a=Math.LOG2E*Math.log(32768)-8;break;default:q(Error("invalid compression method"))}c=a<<4|b;g[k++]=c;switch(b){case rb:switch(this.k){case tb.NONE:f=0;break;case tb.L:f=1;break;case tb.t:f=2;break;default:q(Error("unsupported compression type"))}break;default:q(Error("invalid compression method"))}d=f<<6|0;g[k++]=d|31-(256*c+d)%31;e=ob(this.input);this.I.b=k;g=this.I.h();k=g.length;A&&(g=new Uint8Array(g.buffer),g.length<=
k+4&&(this.a=new Uint8Array(g.length+4),this.a.set(g),g=this.a),g=g.subarray(0,k+4));g[k++]=e>>24&255;g[k++]=e>>16&255;g[k++]=e>>8&255;g[k++]=e&255;return g};exports.deflate=ub;exports.deflateSync=vb;exports.inflate=wb;exports.inflateSync=xb;exports.gzip=yb;exports.gzipSync=zb;exports.gunzip=Ab;exports.gunzipSync=Bb;function ub(b,a,c){process.nextTick(function(){var d,f;try{f=vb(b,c)}catch(e){d=e}a(d,f)})}function vb(b,a){var c;c=(new sb(b)).h();a||(a={});return a.H?c:Cb(c)}function wb(b,a,c){process.nextTick(function(){var d,f;try{f=xb(b,c)}catch(e){d=e}a(d,f)})}
function xb(b,a){var c;b.subarray=b.slice;c=(new pb(b)).i();a||(a={});return a.noBuffer?c:Cb(c)}function yb(b,a,c){process.nextTick(function(){var d,f;try{f=zb(b,c)}catch(e){d=e}a(d,f)})}function zb(b,a){var c;b.subarray=b.slice;c=(new Aa(b)).h();a||(a={});return a.H?c:Cb(c)}function Ab(b,a,c){process.nextTick(function(){var d,f;try{f=Bb(b,c)}catch(e){d=e}a(d,f)})}function Bb(b,a){var c;b.subarray=b.slice;c=(new nb(b)).i();a||(a={});return a.H?c:Cb(c)}
function Cb(b){var a=new Buffer(b.length),c,d;c=0;for(d=b.length;c<d;++c)a[c]=b[c];return a};}).call(this); //@ sourceMappingURL=node-zlib.js.map

}).call(this,require('_process'),require("buffer").Buffer)
},{"_process":13,"buffer":9}],9:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('is-array')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var kMaxLength = 0x3fffffff
var rootParent = {}

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Note:
 *
 * - Implementation must support adding new properties to `Uint8Array` instances.
 *   Firefox 4-29 lacked support, fixed in Firefox 30+.
 *   See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *  - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *  - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *    incorrect length in some situations.
 *
 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they will
 * get the Object implementation, which is slower but will work correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = (function () {
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        new Uint8Array(1).subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Find the length
  var length
  if (type === 'number')
    length = subject > 0 ? subject >>> 0 : 0
  else if (type === 'string') {
    length = Buffer.byteLength(subject, encoding)
  } else if (type === 'object' && subject !== null) { // assume object is array-like
    if (subject.type === 'Buffer' && isArray(subject.data))
      subject = subject.data
    length = +subject.length > 0 ? Math.floor(+subject.length) : 0
  } else
    throw new TypeError('must start with number, buffer, array or string')

  if (length > kMaxLength)
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
      'size: 0x' + kMaxLength.toString(16) + ' bytes')

  var buf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer.TYPED_ARRAY_SUPPORT && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    if (Buffer.isBuffer(subject)) {
      for (i = 0; i < length; i++)
        buf[i] = subject.readUInt8(i)
    } else {
      for (i = 0; i < length; i++)
        buf[i] = ((subject[i] % 256) + 256) % 256
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer.TYPED_ARRAY_SUPPORT && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  if (length > 0 && length <= Buffer.poolSize)
    buf.parent = rootParent

  return buf
}

function SlowBuffer(subject, encoding, noZero) {
  if (!(this instanceof SlowBuffer))
    return new SlowBuffer(subject, encoding, noZero)

  var buf = new Buffer(subject, encoding, noZero)
  delete buf.parent
  return buf
}

Buffer.isBuffer = function (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b))
    throw new TypeError('Arguments must be Buffers')

  var x = a.length
  var y = b.length
  for (var i = 0, len = Math.min(x, y); i < len && a[i] === b[i]; i++) {}
  if (i !== len) {
    x = a[i]
    y = b[i]
  }
  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function (list, totalLength) {
  if (!isArray(list)) throw new TypeError('Usage: Buffer.concat(list[, length])')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (totalLength === undefined) {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    case 'hex':
      ret = str.length >>> 1
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    default:
      ret = str.length
  }
  return ret
}

// pre-set for values that may exist in the future
Buffer.prototype.length = undefined
Buffer.prototype.parent = undefined

// toString(encoding, start=0, end=buffer.length)
Buffer.prototype.toString = function (encoding, start, end) {
  var loweredCase = false

  start = start >>> 0
  end = end === undefined || end === Infinity ? this.length : end >>> 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase)
          throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.equals = function (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max)
      str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  return Buffer.compare(this, b)
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(byte)) throw new Error('Invalid hex string')
    buf[offset + i] = byte
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
  return charsWritten
}

function asciiWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function utf16leWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length, 2)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0

  if (length < 0 || offset < 0 || offset > this.length)
    throw new RangeError('attempt to write outside buffer bounds');

  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = utf16leWrite(this, string, offset, length)
      break
    default:
      throw new TypeError('Unknown encoding: ' + encoding)
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function binarySlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len;
    if (start < 0)
      start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0)
      end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start)
    end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
  }

  if (newBuf.length)
    newBuf.parent = this.parent || this

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0)
    throw new RangeError('offset is not uint')
  if (offset + ext > length)
    throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert)
    checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100))
    val += this[offset + i] * mul

  return val
}

Buffer.prototype.readUIntBE = function (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert)
    checkOffset(offset, byteLength, this.length)

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100))
    val += this[offset + --byteLength] * mul;

  return val
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
      ((this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      this[offset + 3])
}

Buffer.prototype.readIntLE = function (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert)
    checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100))
    val += this[offset + i] * mul
  mul *= 0x80

  if (val >= mul)
    val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert)
    checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100))
    val += this[offset + --i] * mul
  mul *= 0x80

  if (val >= mul)
    val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80))
    return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16) |
      (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
      (this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      (this[offset + 3])
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
}

Buffer.prototype.writeUIntLE = function (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert)
    checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100))
    this[offset + i] = (value / mul) >>> 0 & 0xFF

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert)
    checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100))
    this[offset + i] = (value / mul) >>> 0 & 0xFF

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = value
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else objectWriteUInt16(this, value, offset, true)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else objectWriteUInt16(this, value, offset, false)
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = value
  } else objectWriteUInt32(this, value, offset, true)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else objectWriteUInt32(this, value, offset, false)
  return offset + 4
}

Buffer.prototype.writeIntLE = function (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkInt(this,
             value,
             offset,
             byteLength,
             Math.pow(2, 8 * byteLength - 1) - 1,
             -Math.pow(2, 8 * byteLength - 1))
  }

  var i = 0
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100))
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkInt(this,
             value,
             offset,
             byteLength,
             Math.pow(2, 8 * byteLength - 1) - 1,
             -Math.pow(2, 8 * byteLength - 1))
  }

  var i = byteLength - 1
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100))
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = value
  return offset + 1
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else objectWriteUInt16(this, value, offset, true)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else objectWriteUInt16(this, value, offset, false)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else objectWriteUInt32(this, value, offset, true)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else objectWriteUInt32(this, value, offset, false)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
  if (offset < 0) throw new RangeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert)
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert)
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (target_start >= target.length) target_start = target.length
  if (!target_start) target_start = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || source.length === 0) return 0

  // Fatal error conditions
  if (target_start < 0)
    throw new RangeError('targetStart out of bounds')
  if (start < 0 || start >= source.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < len; i++) {
      target[i + target_start] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }

  return len
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new RangeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr.constructor = Buffer
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUIntLE = BP.readUIntLE
  arr.readUIntBE = BP.readUIntBE
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readIntLE = BP.readIntLE
  arr.readIntBE = BP.readIntBE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUIntLE = BP.writeUIntLE
  arr.writeUIntBE = BP.writeUIntBE
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeIntLE = BP.writeIntLE
  arr.writeIntBE = BP.writeIntBE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-z\-]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes(string, units) {
  var codePoint, length = string.length
  var leadSurrogate = null
  units = units || Infinity
  var bytes = []
  var i = 0

  for (; i<length; i++) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {

      // last char was a lead
      if (leadSurrogate) {

        // 2 leads in a row
        if (codePoint < 0xDC00) {
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          leadSurrogate = codePoint
          continue
        }

        // valid surrogate pair
        else {
          codePoint = leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00 | 0x10000
          leadSurrogate = null
        }
      }

      // no lead yet
      else {

        // unexpected trail
        if (codePoint > 0xDBFF) {
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // unpaired lead
        else if (i + 1 === length) {
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        else {
          leadSurrogate = codePoint
          continue
        }
      }
    }

    // valid bmp char, but last char was a lead
    else if (leadSurrogate) {
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
      leadSurrogate = null
    }

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    }
    else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      );
    }
    else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      );
    }
    else if (codePoint < 0x200000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      );
    }
    else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {

    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length, unitSize) {
  if (unitSize) length -= length % unitSize;
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

},{"base64-js":10,"ieee754":11,"is-array":12}],10:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],11:[function(require,module,exports){
exports.read = function(buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],12:[function(require,module,exports){

/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Whether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

module.exports = isArray || function (val) {
  return !! val && '[object Array]' == str.call(val);
};

},{}],13:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[1]);
