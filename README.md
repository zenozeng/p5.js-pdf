# p5.pdf

A simple PDF export module for p5.js based on browser's print to pdf function.

See the further discussion here: https://github.com/processing/p5.js/issues/373

## Examples (Please Use Google Chrome)

http://zenozeng.github.io/p5.js-pdf/examples/

- Basic PDF Exporting
- Vector PDF Exporting
- Multiple pages using nextPage()
- Pause and Resume
- 4 columns * 3 rows per page and custom page size
- Custom filename, page margin, columnGap and rowGap

## Browser Compatibility

Browser | Operating System | Print to PDF | Custom Size | Custom Filename
--------|------------------|--------------|---------------------------|----------------
Chrome 44 | Linux            | Yes          | Yes         | Yes
Firefox 39 | Linux            | Yes          | Not programmatically, Buggy due to [bug#851937](https://bugzilla.mozilla.org/show_bug.cgi?id=851937) | Not programmatically
IE9     | Windows          | Need Primo PDF | Not tested | Not tested
Safari  | OS X             | Not tested   | Not tested  | Not tested

## FAQ

### Vector Support?

You can use [p5.svg](https://github.com/zenozeng/p5.js-svg/).
Include p5.svg and `createCanvas(640, 480, SVG)`.
Then the pdf generated will be vector.

### Why not use jsPDF or pdfkit?

Seems that PDF doesn't support embed SVG difrectly. jsPDF's SVG support is buggy and very limited. I found that maybe using [pdfkit](https://github.com/devongovett/pdfkit/blob/86c94d2c19a455f8d48d65c0f72f74e6ec9f88ac/lib/mixins/vector.coffee) is somehow better. But this library is also limited and may need a lot of work to make it work.

Since in most cases, we only need to export PDF for ourselves, so I think it is acceptable to use [p5.SVG](https://github.com/zenozeng/p5.js-svg/) & window.print (print to pdf) to do this, since the browser's print function support vector by default and could work even the element was modified by third party library and this will avoid crashing due to creating large files in memory. BTW, browser's print support custom size (css3 @page) and filename (document.title) (test shows it works on chrome but buggy on firefox).

## Links

- [Processing PDF Export](https://processing.org/reference/libraries/pdf/)
