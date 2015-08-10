var pdf;

function setup() {
    createCanvas(600, 200, SVG);
    pdf = createPDF();
    pdf.beginRecord();
}

function draw() {
    background(255);
    fill('#ED225D');
    textSize(100);
    textAlign(CENTER);
    text(frameCount, width * 0.5, height * 0.5);
    if (frameCount == 10) {
        noLoop();
        pdf.save();
    }
    pdf.nextPage(); // Save current canvas and open a new page.
}
