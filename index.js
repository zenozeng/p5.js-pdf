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
     * Create a new p5.PDF instance.
     *
     * @class p5.PDF
     * @param {Object} options - The options for p5.PDF instance
     * @param {Canvas} options.canvas - The canvas to capture, defaults to document.getElementById('defaultCanvas')
     * @param {Number} options.columns - Columns
     * @param {Number} options.rows - Rows
     * @param {String} options.imageType - Use which imageType, defaults to JPEG.
     * @return {p5.PDF} a p5.PDF instance
     */
    function PDF(options) {
        if(!options) {
            options = {};
        }

        this.pdf = new jsPDF();
        this.canvas = options.canvas || document.getElementById('defaultCanvas');
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this.imageType = options.imageType || 'JPEG';

        // init current offset at this page
        this.offset = {x: 0, y: 0};
    };


    /**
     * Add image to current pdf
     *
     * @instance
     * @private
     * @function _addImage
     * @memberof p5.PDF
     */
    PDF.prototype._addImage = function(image) {
        var width = this.width,
            height = this.height;

        // A4 Paper
        var paper = {
            width: 210,
            height: 297
        };

        var columns = this.columns,
            rows = this.rows;

        var maxImageWidth = paper.width / columns,
            maxImageHeight = paper.height / rows;

        var ratio = width / height;
        var imageSize = {};
        if(ratio > maxImageWidth / maxImageHeight) {
            imageSize = {width: maxImageWidth, height: maxImageWidth / ratio};
        } else {
            imageSize = {width: maxImageHeight * ratio, height: maxImageHeight};
        }

        var imagePadding = {
            top: (paper.height / rows - imageSize.height) / 2,
            right: (paper.width / columns - imageSize.width) / 2,
            left: (paper.width / columns - imageSize.width) / 2,
            bottom: (paper.height / rows - imageSize.height) / 2
        };

        // current row doesn't have enough room, go to next row
        if(this.offset.x + imageSize.width + imagePadding.left + imagePadding.right > paper.width) {
            this.offset.x = 0;
            this.offset.y += imageSize.height + imagePadding.top + imagePadding.bottom;
        }

        // current page doesn't have enough room
        if(this.offset.y + imageSize.height + imagePadding.top + imagePadding.bottom > paper.height) {
            this.nextPage();
        }

        this.pdf.addImage(image,
                          this.imageType,
                          this.offset.x + imagePadding.left,
                          this.offset.y + imagePadding.top,
                          this.imageSize.width,
                          this.imageSize.height);

        this.offset.x += imageSize.width + imagePadding.left + imagePadding.right;
    };

    /**
     * Capture current frame.
     *
     * Convert canvas to image and save it in pdf,
     * and will open new page automatically if necessary.
     *
     * @instance
     * @function capture
     * @memberof p5.PDF
     */
    PDF.prototype.capture = function() {
        var image = this.canvas.toDataURL('image/' + this.imageType, 0.95);
        this._addImage(image);
    };

    /**
     * Open new page.
     *
     * @instance
     * @function nextPage
     * @memberof p5.PDF
     */
    PDF.prototype.nextPage = function() {
        this.offset = {x: 0, y: 0};
        this.pdf.addPage();
    };

    /**
     * Save current PDF.
     *
     * Note that this method must be called on click event,
     * otherwise will be blocked by browser.
     *
     * @instance
     * @function save
     * @memberof p5.PDF
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
     * Generate a object url for current PDF.
     *
     * @instance
     * @function toObjectURL
     * @memberof p5.PDF
     * @return {String} objectURL
     */
    PDF.prototype.toObjectURL = function() {
        return this.pdf.output('bloburi');
    };

    /**
     * Generate a data url for current PDF.
     *
     * Note that you should always use toObjectURL if possible,
     * generating dataurl for large pdf is very expensive.
     *
     * @instance
     * @function toDataURL
     * @memberof p5.PDF
     * @return {String} dataurl
     */
    PDF.prototype.toDataURL = function() {
        return this.pdf.output('datauristring');
    };

    p5.PDF = PDF;

})(window.p5);
