var i = 1;
var canvas, pdf;

function setup() {
    canvas = createCanvas(640, 640);
    pdf = new p5.PDF(canvas);
}

function draw() {
    i++;
    i %= 100;
    ellipse(100, 100, 100, i);
}

var interval = setInterval(function() {
    pdf.capture();
}, 1000);

setTimeout(function() {
    clearInterval(interval);
    var url = pdf.toObjectURL();
    window.location.href = url;
}, 6000);
