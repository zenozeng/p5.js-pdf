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

    // create 4 * 3
    if (frameCount % 12 == 0) {
        pdf.nextPage();
    } else {
        if (frameCount % 3 == 0) {
            pdf.nextRow();
        } else {
            pdf.nextColumn();
        }
    }
    if (frameCount == 100) {
        noLoop();
        pdf.save({width: width * 4, height: height * 4});
    }
}
