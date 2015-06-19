var printPage = function() {
    var status = {
        focused: window.focused
    };
    console.log(status);

    // note that window.print might be overridden by p5.js
    var iframe = document.createElement("iframe");
    iframe.height = 0;
    iframe.width = 0;
    document.body.appendChild(iframe);
    iframe.contentWindow.print.call(window, "foo");

    // //workaround for Chrome bug - https://code.google.com/p/chromium/issues/detail?id=141633
    // if (window.stop) {
    //     window.location.reload(); //triggering unload (e.g. reloading the page) makes the print dialog appear
    //     window.stop(); //immediately stop reloading
    // }

    return false;
};

function setup() {
    createSVG(1000, 1000);
    fill(200);

    printPage();
}

function draw() {
    ellipse(500, 500, 500, 500);
    noLoop();
    // printPage();
}

function mouseClicked() {
    printPage();
}
