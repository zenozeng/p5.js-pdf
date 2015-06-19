(function() {
    // string html
    // string styles
    var print = function(filename, html, styles) {
        // note that window.print might be overridden by p5.js
        var iframe = document.createElement("iframe");
        iframe.height = 0;
        iframe.width = 0;
        document.body.appendChild(iframe);
        var doc = iframe.contentDocument || iframe.contentWindow.documen;
        var win = iframe.contentWindow;


        var style = doc.createElement('style');
        style.innerHTML = styles;
        doc.head.appendChild(style);
        var div = doc.createElement('div');
        div.innerHTML = html;
        doc.body.appendChild(div);
        win.focus(); // required for IE

        // change the filename for print
        var _title = document.title;
        document.title = filename;
        doc.title = filename;

        win.print();

        document.title = _title;
        iframe.remove();
    };

    window.setup = function() {
        createSVG(1000, 1000);
        fill(200);
    };

    window.draw = function() {
        ellipse(500, 500, 500, 500);
        noLoop();
        window.mouseClicked();
    };

    window.mouseClicked = function() {
        var svg = document.querySelector('svg');
        svg = (new XMLSerializer()).serializeToString(svg);
        print('filename', svg, '@page { size: 100mm 100mm; }');
    };
})();
