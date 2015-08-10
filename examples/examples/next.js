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

    if (frameCount == 100) {
        noLoop();
        pdf.save({width: width * 4, height: height * 3});
    }

    // 4 columns * 3 rows per page
    if (frameCount % 12 == 0) {
        pdf.nextPage();
    } else {
        if (frameCount % 4 == 0) {
            pdf.nextRow();
        } else {
            pdf.nextColumn();
        }
    }
}
