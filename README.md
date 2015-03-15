# p5.js-pdf

A simple module for export pdf with p5.js.

## Status

Still working.

## Usage

```javascript
var pdf;

function setup() {
    createCanvas(640, 640);

    pdf = new p5.PDF(); // should be called after #defaultCanvas is ready
    pdf.beginRecord();
}

function draw() {
    // draw something here

    // tell PDF to go to the next page
    // pdf.nextPage();
}

setTimeout(function() {
    pdf.endRecord();
    window.location.href = pdf.toObjectURL();
}, 5000);
```

## FAQ

### Browser Compatibility

Basically, it should work in the latest versions of evergreen browsers and IE10+.
Note that even in IE11, due to the lack of support to download attrbute,
`pdf.save(filename)` may simply open PDF directly instead.

### Why not use PNG by default?

Chrome may crash when there are too many PNG in jsPDF.

See also:

- https://github.com/MrRio/jsPDF/issues/359

- https://github.com/MrRio/jsPDF/issues/300

However, if you must, you can use `new p5.PDF({imageType: 'PNG'})`.

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
npm run build
```

## Links

- [jsPDF Doc](http://mrrio.github.io/jsPDF/doc/symbols/jsPDF.html)

- [Processing PDF Export](https://processing.org/reference/libraries/pdf/)
