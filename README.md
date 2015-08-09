# p5.pdf

A simple PDF export module for p5.js.

Online Demo: https://zenozeng.github.io/p5.js-pdf/demo/

See the further discussion here: https://github.com/processing/p5.js/issues/373

## FAQ

### Why not use jsPDF or pdfkit?

Seems that PDF doesn't support embed SVG difrectly. jsPDF's SVG support is buggy and very limited. I found that maybe using [pdfkit](https://github.com/devongovett/pdfkit/blob/86c94d2c19a455f8d48d65c0f72f74e6ec9f88ac/lib/mixins/vector.coffee) is somehow better. But this library is also limited and may need a lot of work to make it work.

Since in most cases, we only need to export PDF for ourselves, so I think it is acceptable to use [p5.SVG](https://github.com/zenozeng/p5.js-svg/) & window.print (print to pdf) to do this, since the browser's print function support vector by default and could work even the element was modified by third party library and this will avoid crashing due to creating large files in memory. BTW, browser's print support custom size (css3 @page) and filename (document.title) (test shows it works on chrome but buggy on firefox).


## Browser Compatibility

Browser | Operating System | Print to PDF | Custom Size | Custom Filename
--------|------------------|--------------|---------------------------|----------------
Chrome 44 | Linux            | Yes          | Yes         | Yes
Firefox 39 | Linux            | Yes          | Not programmatically, Buggy due to [bug#851937](https://bugzilla.mozilla.org/show_bug.cgi?id=851937) | Not programmatically
IE9     | Windows          | Need Primo PDF | Not tested | Not tested
Safari  | OS X             | Not tested   | Not tested  | Not tested

## Usage

```javascript
var pdf;

function setup() {
    createCanvas(640, 640);

    pdf = new p5.PDF(); // should be called after #defaultCanvas is ready
}

function draw() {
    // draw something here

    // manually add new page
    // pdf.nextPage();

    // capture current frame
    pdf.capture();
}

setTimeout(function() {
    noLoop();
    window.location.href = pdf.toObjectURL();
}, 5000);
```

## License (MIT)

Copyright (c) 2015 Zeno Zeng.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

This program incorporates work covered by the following copyright and permission notices:

- jsPDF (MIT)

    ```
    Copyright (c) 2010-2014 James Hall, https://github.com/MrRio/jsPDF
    ```

- jspdf.plugin.addimage.js (MIT)

    jsPDF addImage plugin

    ```
    Copyright (c) 2012 Jason Siefken, https://github.com/siefkenj/
                  2013 Chris Dowling, https://github.com/gingerchris
                  2013 Trinh Ho, https://github.com/ineedfat
                  2013 Edwin Alejandro Perez, https://github.com/eaparango
                  2013 Norah Smith, https://github.com/burnburnrocket
                  2014 Diego Casorran, https://github.com/diegocr
                  2014 James Robb, https://github.com/jamesbrobb
    ```

- jspdf.plugin.png_support.js (MIT)

    jsPDF PNG PlugIn

    ```
    Copyright (c) 2014 James Robb, https://github.com/jamesbrobb
    ```

- zlib.js (from pdf.js) (MIT)

    ```
    Copyright (c) 2011 Mozilla Foundation

    Contributors: Andreas Gal <gal@mozilla.com>
                  Chris G Jones <cjones@mozilla.com>
                  Shaon Barman <shaon.barman@gmail.com>
                  Vivien Nicolas <21@vingtetun.org>
                  Justin D'Arcangelo <justindarc@gmail.com>
                  Yury Delendik
    ```

- PNG.js (MIT)

    ```
    Copyright (c) 2011 Devon Govett
    ```

## Build

```bash
sudo npm install -g browserify
sudo npm install -g jsdoc
npm run build
```

## Links

- [Processing PDF Export](https://processing.org/reference/libraries/pdf/)
