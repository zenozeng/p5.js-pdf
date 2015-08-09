/**
 * p5.pdf - Simple PDF module for p5.js using p5.svg and browser's print API
 * Copyright (c) 2015 Zeno Zeng<zenoofzeng@gmail.com>.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

 (function (root, factory) {
     if (typeof define === 'function' && define.amd) {
         define('p5.pdf', ['p5', 'p5.svg'], function (p5) {
             factory(p5);
         });
     }
     else if (typeof exports === 'object') {
         module.exports = factory;
     }
     else {
         factory(root['p5']);
     }
 }(this, function (p5) {

    "use strict";

     /**
      * Print given elements using iframe
      *
      * @private
      * @param {String} filename
      * @param {Array} elements Array of Elements
      * @param {Array} styles Array of style string
      */
     var print = function(filename, elements, styles) {
         var iframe = document.createElement("iframe");
         iframe.height = 0;
         iframe.width = 0;
         document.body.appendChild(iframe);
         var doc = iframe.contentDocument || iframe.contentWindow.documen;
         var win = iframe.contentWindow;

         var style = doc.createElement('style');
         styles = styles.join('\n');
         style.innerHTML = styles;
         doc.head.appendChild(style);

         elements.forEach(function(el) {
             doc.body.appendChild(el);
         });
         win.focus(); // required for IE

         // change the filename for print
         var _title = document.title;
         document.title = filename;
         doc.title = filename;

         win.print(); // note that window.print might be overridden by p5.js

         document.title = _title;
         iframe.remove();
     };

    /**
     * Create a new p5.PDF instance.
     *
     * @class p5.PDF
     * @return {p5.PDF} a p5.PDF instance
     */
     function PDF(p5Instance) {
         if (typeof p5.prototype.createSVG == "undefined") {
             throw new Error('Please include p5.svg before using p5.pdf.');
         }
         this.elements = [];
         this.width = p5Instance.width;
         this.height = p5Instance.height;
         this.graphics = p5Instance.createGraphics(p5Instance.width, p5Instance.height, p5Instance.SVG);
         this.p5Instance = p5Instance;
     }

     /**
      * Will return a clone of current SVG element
      */
     PDF.prototype.__snapshot = function() {
         var svgcanvas = this.graphics.elt;
         var svg = svgcanvas.svg;
         var snapshot = svg.cloneNode(true);
         snapshot.style.display = 'inline-block';
         return snapshot;
     };

     /**
      * Open new page.
      *
      * @instance
      * @function nextPage
      * @memberof p5.PDF
      */
     PDF.prototype.nextPage = function() {
         this.elements.push(this.__snapshot());
         var div = document.createElement('div');
         div.className = "page-break";
         this.elements.push(div);
     };

     PDF.prototype.nextColumn = function() {
         this.elements.push(this.__snapshot());
         var div = document.createElement('div');
         div.className = "column-gap";
         this.elements.push(div);
     };

     PDF.prototype.nextRow = function() {
         this.elements.push(this.__snapshot());
         var div = document.createElement('div');
         div.className = "row-gap";
         this.elements.push(div);
     };

     // this is very evil way to record
     PDF.prototype.beginRecord = function() {
         var p = this.p5Instance;
         var currentGraphics = p._graphics;
         var pdfGraphics = this.graphics;
         var _this = this;
         for (var k in currentGraphics) {
             console.log(k);
         }
     };

     PDF.prototype.endRecord = function() {
         var fns = this.backup;
         Object.keys(fns).forEach(function(k) {
             p5.prototype[k] = fns[k];
         });
     };

     PDF.styles = [
         ".page-break {page-break-after: always;}",
         ".column-gap {display: inline-block;}"
     ];

    /**
     * Save current PDF using window.print.
     *
     * @function save
     * @memberof p5.PDF
     * @param {Object} options - The options for generating pdf
     * @param {String} options.filename - Filename for your pdf file, defaults to untitled.pdf
     * @param {Object} options.margin - Margins for PDF Page {top, right, bottom, left}
     * @param {String} options.margin.top - marginTop (eg. '1mm', '10px'), defaults to 0
     * @param {String} options.margin.right - marginRight in mm, defaults to 0
     * @param {String} options.margin.bottom - marginBottom in mm, defaults to 0
     * @param {String} options.margin.left - marginLeft in mm, defaults to 0
     * @param {String} options.columnGap - Size of the gap between columns (eg. '1mm', '10px'), defaults to 0
     * @param {String} options.rowGap - Size of the gap between rows, defaults to 0
     */
     PDF.prototype.save = function(options) {
         options = options || {};

         var styles = PDF.styles.concat();

         var width = options.width || (this.width + 'px');
         var height = options.height || (this.height + 'px');
         styles.push('@page { size: ' + width + ' ' + height + '; }');

         if (typeof options.columnGap !== "undefined") {
             styles.push(".column-gap {padding-left: " + options.columnGap + "}");
         }

         if (typeof options.rowGap !== "undefined") {
             styles.push(".row-gap {padding-top: " + options.rowGap + "}");
         }

         var elements = this.elements.concat(this.__snapshot());
         print(options.filename, elements, styles);
     };

     p5.PDF = PDF;

     p5.prototype.createPDF = function() {
         return new PDF(this);
     };
 }));
