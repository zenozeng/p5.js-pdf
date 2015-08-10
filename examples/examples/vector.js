var pdf;

function setup() {
    // If we use SVG Renderer, then the PDF generated will be vector
    // Note that to use SVG Renderer, you must include p5.svg library
    createCanvas(600, 200, SVG);
    pdf = createPDF();
    pdf.beginRecord();
}

function draw() {
    background(255);
    fill('#ED225D');
    textSize(50);
    textAlign(CENTER);
    text(frameCount, width / 2, height / 2);
    if (frameCount == 100) {
        noLoop();
        pdf.save();
    }
}
