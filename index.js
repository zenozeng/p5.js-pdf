/**
 * p5.js-pdf - Simple PDF module for p5.js using jsPDF API
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

(function(p5) {

    "use strict";

    var jsPDF = require('./jspdf/index');

    /**
     * Constructor
     *
     * @param {Object} options - The options for p5.PDF instance
     * @param {Canvas} options.canvas - The <canvas> to capture, defaults to document.getElementById('defaultCanvas')
     * @param {Number} options.ppi - The ppi for frames
     * @param {String} options.imageType - Use which imageType, defaults to JPEG.
     * @return {p5.PDF} a p5.PDF instance
     */
    var PDF = function(options) {
        if(!options) {
            options = {};
        }

        this.pdf = new jsPDF();
        this.canvas = options.canvas || document.getElementById('defaultCanvas');
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this.ppi = options.ppi || 72;

        this.imageType = options.imageType || 'JPEG';

        // current y offset at this page
        this.yOffset = 0;
    };

    /**
     * Capture current frame
     *
     * Convert canvas to image and save it in pdf,
     * and will open new page automatically if necessary.
     */
    PDF.prototype.capture = function() {
        var img = this.canvas.toDataURL('image/' + this.imageType, 0.95);

        var width = this.width,
            height = this.height;

        // apply options.ppi
        var pixelsPerMM = this.ppi * 0.03937;
        width /= pixelsPerMM;
        height /= pixelsPerMM;

        // scale if necessary
        var A4 = {
            width: 210,
            height: 297
        };
        if(width > A4.width) {
            width = A4.width;
            height = this.height / this.width * width;
        }

        // current page doesn't have enough room
        if(this.yOffset + height > A4.height) {
            this.nextPage();
        }

        this.pdf.addImage(img, this.imageType, 0, this.yOffset, width, height);
        this.yOffset += height;
    };

    /**
     * Open new page
     *
     */
    PDF.prototype.nextPage = function() {
        this.yOffset = 0;
        this.pdf.addPage();
    };

    // must be called onclick otherwise will be prevented by browser

    /**
     * Save current PDF
     *
     * @param {String} filename - Filename for your pdf file, defaults to untitled.pdf
     */
    PDF.prototype.save = function(filename) {
        filename = filename || "untitled.pdf";
        var a = document.createElement('a');
        a.download = filename;
        a.href = this.toObjectURL();
        document.body.appendChild(a);
        setTimeout(function() {
            a.click();
            a.remove();
        }, 0);
    };

    /**
     * Generate a object url for current PDF
     *
     * @return {String} objectURL
     */
    PDF.prototype.toObjectURL = function() {
        return this.pdf.output('bloburi');
    };

    /**
     * Generate a data url for current PDF
     *
     * Note that you should always use toObjectURL if possible,
     * generating dataurl for large pdf is very expensive.
     *
     * @return {String} dataurl
     */
    PDF.prototype.toDataURL = function() {
        return this.pdf.output('datauristring');
    };

    p5.PDF = PDF;

})(window.p5);
