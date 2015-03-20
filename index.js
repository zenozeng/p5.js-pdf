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
     * @param {String} options.imageType - Use which imageType, defaults to JPEG.
     * @return {p5.PDF} a p5.PDF instance
     */
    function PDF(options) {
        if(!options) {
            options = {};
        }

        this.pdf = new jsPDF();
        this.canvas = options.canvas || document.getElementById('defaultCanvas');

        this.imageType = options.imageType || 'JPEG';

        this.elements = []; // captured images and page breaks
    };


    /**
     * Capture current frame.
     *
     * Convert canvas to image and save it in this.elements
     *
     * @instance
     * @function capture
     * @memberof p5.PDF
     */
    PDF.prototype.capture = function() {
        var image = this.canvas.toDataURL('image/' + this.imageType, 0.95);
        this.elements.push(image);
    };

    /**
     * Open new page.
     *
     * @instance
     * @function nextPage
     * @memberof p5.PDF
     */
    PDF.prototype.nextPage = function() {
        this.elements.push('NEW_PAGE');
    };

    /**
     * Generate PDF
     *
     * @instance
     * @private
     * @function _generate
     * @memberof p5.PDF
     * @param {Object} options - The options for generating pdf
     * @param {Bool} options.landscape - Whether set PDF as landscape (defaults to false)
     * @param {Number} options.columns - Columns (defaults to 3)
     * @param {Number} options.rows - Rows (defaults to 3)
     * @param {String} options.layout - Special Layout {"single-page": display all images in one page}
     * @param {Object} option.margin - Margins for PDF in mm {top, right, bottom, left}, all defaults to 20
     * @param {Object} option.imageMargin - Margin for images in mm {top, right, bottom, left}
     * @return jsPDF Object
     */
    PDF.prototype._generate = function(options) {

        options = options || {};

        // init jsPDF Object
        var pdf = new jsPDF(options.landscape ? 'landscape' : undefined);

        // determine paper size & margin
        var paper = options.landscape ? {width: 297, height: 210} : {width: 210, height: 297}; // A4
        paper.margin = options.margin || {top: 20, right: 20, bottom: 20, left: 20};
        paper.width -= paper.margin.right + paper.margin.left;
        paper.height -= paper.margin.top + paper.margin.bottom;

        // determine rows and columns
        var rows = options.rows || 3;
        var columns = options.columns || 3;

        if(options.layout === "single-page") {
            // calculate max elements per page
            var maxElementsPerPage = 0;
            var count = 0;
            for(var i = 0; i < this.elements.length; i++) {
                if(this.elements[i] === 'NEW_PAGE') {
                    if(count > maxElementsPerPage) {
                        maxElementsPerPage = count;
                    }
                    count = 0;
                } else {
                    count++;
                }
            }
            if(maxElementsPerPage === 0) {
                maxElementsPerPage = this.elements.length;
            }
            // determine rows and columns
            // k = rows / column = canvasRatio / paperRatio
            // rows * columns >= maxElementsPerPage
            var k = (this.canvas.width / this.canvas.height) / (paper.width / paper.height);
            rows = 0;
            columns = 0;
            while(rows * columns < maxElementsPerPage) {
                columns = parseInt(columns + 1);
                rows = parseInt(columns * k);
            }

            // FIXME: options.imageMargin is ignored
            options.imageMargin = null;
        }

        // determine image size
        var imageSize = {};

        var maxImageWidth = paper.width / columns,
            maxImageHeight = paper.height / rows;

        var canvasRatio = this.canvas.width / this.canvas.height;
        if(canvasRatio > maxImageWidth / maxImageHeight) {
            imageSize = {width: maxImageWidth, height: maxImageWidth / canvasRatio};
        } else {
            imageSize = {width: maxImageHeight * canvasRatio, height: maxImageHeight};
        }

        // determine image margin
        var imageMargin = options.imageMargin || {
            top: (paper.height / rows - imageSize.height) / 2,
            right: (paper.width / columns - imageSize.width) / 2,
            left: (paper.width / columns - imageSize.width) / 2,
            bottom: (paper.height / rows - imageSize.height) / 2
        };

        // init current offset at this page
        var offset = {x: 0, y: 0};

        // add images & pages
        var _this = this;
        var nextPage = function() {
            offset = {x: 0, y: 0};
            pdf.addPage();
        };
        this.elements.forEach(function(elem) {
            if(elem === 'NEW_PAGE') {
                nextPage();
                return;
            }

            // current row doesn't have enough room, go to next row
            if(offset.x + imageSize.width + imageMargin.left + imageMargin.right > paper.width ) {
                offset.x = 0;
                offset.y += imageSize.height + imageMargin.top + imageMargin.bottom;
            }

            // current page doesn't have enough room
            if(offset.y + imageSize.height + imageMargin.top + imageMargin.bottom > paper.height) {
                nextPage();
            }

            // add image
            pdf.addImage(elem,
                         _this.imageType,
                         offset.x + imageMargin.left + paper.margin.left,
                         offset.y + imageMargin.top + paper.margin.top,
                         imageSize.width,
                         imageSize.height);

            // update offset
            offset.x += imageSize.width + imageMargin.left + imageMargin.right;
        });

        return pdf;
    };

    /**
     * Generate a object url for current PDF.
     *
     * @instance
     * @function toObjectURL
     * @memberof p5.PDF
     * @param {Object} options - The options for generating pdf
     * @param {Bool} options.landscape - Whether set PDF as landscape (defaults to false)
     * @param {Number} options.columns - Columns (defaults to 3)
     * @param {Number} options.rows - Rows (defaults to 3)
     * @param {String} options.layout - Special Layout {"single-page": display all images in one page}
     * @param {Object} option.margin - Margins for PDF in mm {top, right, bottom, left}, all defaults to 20
     * @param {Object} option.imageMargin - Margin for images in mm {top, right, bottom, left}
     * @return {String} objectURL
     */
    PDF.prototype.toObjectURL = function(options) {
        var pdf = this._generate(options);
        return pdf.output('bloburi');
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
     * @param {Object} options - The options for generating pdf
     * @param {Bool} options.landscape - Whether set PDF as landscape (defaults to false)
     * @param {Number} options.columns - Columns (defaults to 3)
     * @param {Number} options.rows - Rows (defaults to 3)
     * @param {String} options.layout - Special Layout {"single-page": display all images in one page}
     * @param {Object} option.margin - Margins for PDF in mm {top, right, bottom, left}, all defaults to 20
     * @param {Object} option.imageMargin - Margin for images in mm {top, right, bottom, left}
     * @return {String} dataurl
     */
    PDF.prototype.toDataURL = function(options) {
        var pdf = this._generate(options);
        return pdf.output('datauristring');
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
     * @param {Object} options - The options for generating pdf
     * @param {String} options.filename - Filename for your pdf file, defaults to untitled.pdf
     * @param {Bool} options.landscape - Whether set PDF as landscape (defaults to false)
     * @param {Number} options.columns - Columns (defaults to 3)
     * @param {Number} options.rows - Rows (defaults to 3)
     * @param {String} options.layout - Special Layout {"single-page": display all images in one page}
     * @param {Object} option.margin - Margins for PDF in mm {top, right, bottom, left}, all defaults to 20
     * @param {Object} option.imageMargin - Margin for images in mm {top, right, bottom, left}
     */
    PDF.prototype.save = function(options) {
        options = options || {};
        var filename = options.filename || "untitled.pdf";
        var a = document.createElement('a');
        a.download = filename;
        a.href = this.toObjectURL(options);
        document.body.appendChild(a);
        setTimeout(function() {
            a.click();
            a.remove();
        }, 0);
    };

    p5.PDF = PDF;

})(window.p5);
