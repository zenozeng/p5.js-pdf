var canvas, pdf, queue = [];

var width = 640,
    height = 640;

function setup() {
    // init frame
    canvas = createCanvas(width, height);
    frameRate(30);

    // init pdf recorder
    pdf = new p5.PDF(canvas);

    // init tree
    queue.push([{
        x: width / 2,
        y: height,
        length: height / 4,
        angle: Math.PI / 2
    }]);
}

function drawTree(tree) {
    var x = tree.x,
        y = tree.y,
        length = tree.length,
        angle = tree.angle;
}

function draw() {
    var tree = queue.shift();
    if(tree) {
        drawTree();
        pdf.capture();
    } else {
        console.log(pdf.toObjectURL());
    }
}
