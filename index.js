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

    // must be called onclick otherwise will be prevented by browser
    PDF.prototype.download = function(filename) {
        filename = filename || "untitled.pdf";
        var a = document.createElement('a');
        a.href = this.toObjectURL();
        document.body.appendChild(a);
        a.click();
        a.remove();
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
