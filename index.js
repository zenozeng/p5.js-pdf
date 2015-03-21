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
        if (!options) {
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
     * Calculate rows and columns (for single-page layout)
     *
     * The rows and columns calculated will meet the following conditions:
     *     (1) rows * columns >= imageCount
     *     (2) the occupancy rate will be as higher as possible
     *
     * @static
     * @private
     * @function _calculateRowsAndColumns
     * @memberof p5.PDF
     * @param {Number} areaWidth - Width of area (in mm)
     * @param {Number} areaHeight - Height of area (in mm)
     * @param {Number} imageCount - Count of images per page
     * @param {Number} imageRatio - image.width / image.height
     * @param {Object} imageMargin - Margins for each image (in mm), {top, right, bottom, left}
     * @return {Object} {rows, columns}
     */
    PDF.prototype._calculateRowsAndColumns = function(areaWidth, areaHeight, imageCount, imageRatio, imageMargin) {
        var result = {rows: 0, columns: 0, occupancy: 0};
        for (var rows = 1; rows < imageCount; rows++) {
            for (var columns = 1; columns < imageCount; columns++) {
                if (rows * columns < imageCount) {
                    continue;
                }

                //  area available
                var width = areaWidth - columns * (imageMargin.left + imageMargin.right);
                var height = areaHeight - rows * (imageMargin.top + imageMargin.bottom);
                if ((width < 0) || (height < 0)) {
                    continue;
                }

                // area for images
                var imageArea;
                var imageAreaRatio = imageRatio * columns / rows;
                if (imageAreaRatio > width / height) {
                    imageArea = {width: width, height: width / imageAreaRatio};
                } else {
                    imageArea = {width: height * imageAreaRatio, height: height};
                }

                // area for images and their margins
                var occupiedWidth = imageArea.width + columns * (imageMargin.left + imageMargin.right);
                var occupiedHeight = imageArea.height + rows * (imageMargin.top + imageMargin.bottom);

                // calculate occupancy
                var occupancy = ((occupiedWidth * occupiedHeight) / (areaWidth * areaHeight)) * (imageCount / (rows * columns));
                if (occupancy > result.occupancy) {
                    result = {rows: rows, columns: columns, occupancy: occupancy};
                }
            }
        }
        return result;
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
     * @param {Object} options.margin - Margins for PDF in mm {top, right, bottom, left}
     * @param {Number} options.margin.top - marginTop in mm, defaults to 20
     * @param {Number} options.margin.right - marginRight in mm, by default will put images in the middle
     * @param {Number} options.margin.bottom - marginBottom in mm, defaults to 20
     * @param {Number} options.margin.left - marginLeft in mm, by default will put images in the middle
     * @param {Object} options.imageMargin - Margin for images in mm {top, right, bottom, left}, all defaults to 1mm
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

        // determine image margin
        var imageMargin = options.imageMargin || {top: 1, right: 1, left: 1, bottom: 1};

        // determine rows and columns
        var rows = options.rows || 3;
        var columns = options.columns || 3;

        if (options.layout === "single-page") {
            // calculate max elements per page
            var maxElementsPerPage = 0;
            var count = 0;
            for (var i = 0; i < this.elements.length; i++) {
                if (this.elements[i] === 'NEW_PAGE') {
                    if (count > maxElementsPerPage) {
                        maxElementsPerPage = count;
                    }
                    count = 0;
                } else {
                    count++;
                }
            }
            if (maxElementsPerPage === 0) {
                maxElementsPerPage = this.elements.length;
            }
            var result = this._calculateRowsAndColumns(paper.width,
                                                       paper.height,
                                                       maxElementsPerPage,
                                                       this.canvas.width / this.canvas.height,
                                                       imageMargin);
            rows = result.rows;
            columns = result.columns;
        }

        // determine image size
        var imageSize = {};

        var maxImageWidth = paper.width / columns - imageMargin.left - imageMargin.right,
            maxImageHeight = paper.height / rows - imageMargin.top - imageMargin.bottom;

        var imageRatio = this.canvas.width / this.canvas.height;
        if (imageRatio > maxImageWidth / maxImageHeight) {
            imageSize = {width: maxImageWidth, height: maxImageWidth / imageRatio};
        } else {
            imageSize = {width: maxImageHeight * imageRatio, height: maxImageHeight};
        }

        // reset margin.left and margin.right unless options.imageMargin to make all images in the middle
        if (!options.margin) {
            var offset = paper.width - (imageSize.width + imageMargin.left + imageMargin.right)* columns;
            paper.margin.right += offset / 2;
            paper.margin.left += offset / 2;
        }

        // init current offset at this page
        var pos = {row: 1, column: 1};

        // add images & pages
        var _this = this;
        var nextPage = function() {
            pos = {row: 1, column: 1};
            pdf.addPage();
        };
        this.elements.forEach(function(elem) {
            if (elem === 'NEW_PAGE') {
                nextPage();
                return;
            }

            // current row doesn't have enough room, go to next row
            if (pos.column > columns) {
                pos.column = 1;
                pos.row++;
            }

            // current page doesn't have enough room
            if (pos.row > rows) {
                nextPage();
            }

            // add image
            var offset = {
                x: paper.margin.left
                    + (pos.column - 1) * (imageMargin.left + imageSize.width + imageMargin.right)
                    + imageMargin.left,
                y: paper.margin.top
                    + (pos.row - 1) * (imageMargin.top + imageSize.height + imageMargin.bottom)
                    + imageMargin.top
            };
            pdf.addImage(elem,
                         _this.imageType,
                         offset.x,
                         offset.y,
                         imageSize.width,
                         imageSize.height);

            // update offset
            pos.column++;
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
     * @param {Object} options.margin - Margins for PDF in mm {top, right, bottom, left}
     * @param {Number} options.margin.top - marginTop in mm, defaults to 20
     * @param {Number} options.margin.right - marginRight in mm, by default will put images in the middle
     * @param {Number} options.margin.bottom - marginBottom in mm, defaults to 20
     * @param {Number} options.margin.left - marginLeft in mm, by default will put images in the middle
     * @param {Object} options.imageMargin - Margin for images in mm {top, right, bottom, left}, all defaults to 1mm
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
     * @param {Object} options.margin - Margins for PDF in mm {top, right, bottom, left}
     * @param {Number} options.margin.top - marginTop in mm, defaults to 20
     * @param {Number} options.margin.right - marginRight in mm, by default will put images in the middle
     * @param {Number} options.margin.bottom - marginBottom in mm, defaults to 20
     * @param {Number} options.margin.left - marginLeft in mm, by default will put images in the middle
     * @param {Object} options.imageMargin - Margin for images in mm {top, right, bottom, left}, all defaults to 1mm
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
     * @param {Object} options.margin - Margins for PDF in mm {top, right, bottom, left}
     * @param {Number} options.margin.top - marginTop in mm, defaults to 20
     * @param {Number} options.margin.right - marginRight in mm, by default will put images in the middle
     * @param {Number} options.margin.bottom - marginBottom in mm, defaults to 20
     * @param {Number} options.margin.left - marginLeft in mm, by default will put images in the middle
     * @param {Object} options.imageMargin - Margin for images in mm {top, right, bottom, left}, all defaults to 1mm
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
