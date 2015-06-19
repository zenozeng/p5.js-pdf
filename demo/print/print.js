(function() {
    // string html
    // string styles
    var print = function(html, styles) {
        // note that window.print might be overridden by p5.js
        var iframe = document.createElement("iframe");
        iframe.height = 0;
        iframe.width = 0;
        document.body.appendChild(iframe);
        var doc = iframe.contentDocument || iframe.contentWindow.documen;
        var win = iframe.contentWindow;
        var style = doc.createElement('style');
        style.innerHTML = styles;
        doc.body.appendChild(style);
        var div = doc.createElement('div');
        div.innerHTML = html;
        doc.body.appendChild(div);
        iframe.contentWindow.print.call(win);
    };

    window.setup = function() {
        createSVG(1000, 1000);
        fill(200);
    };

    window.draw = function() {
        ellipse(500, 500, 500, 500);
        noLoop();
    };

    window.mouseClicked = function() {
        var svg = document.querySelector('svg');
        svg = (new XMLSerializer()).serializeToString(svg);
        print(svg, '@page { size: 100mm 100mm; }');
    };
})();
