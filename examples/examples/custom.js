var pdf;

function setup() {
    createCanvas(600, 200, SVG);
    pdf = createPDF();
    pdf.beginRecord();
}

function draw() {
    background(240);
    fill('#ED225D');
    textSize(100);
    textAlign(CENTER);
    text(frameCount, width * 0.5, height * 0.5);

    if (frameCount == 100) {
        noLoop();
        pdf.save({
            filename: 'helloworld',
            margin: {
                top: '100px',
                left: '100px',
                right: '100px',
                bottom: '100px'
            },
            columnGap: '40px',
            rowGap: '20px',
            width: width * 4 + 40 * 3 + 100 * 2,
            height: height * 3 + 20 * 2 + 100 * 2
        });
    }

    // 4 columns * 3 rows per page
    if (frameCount % 12 == 0) {
        pdf.nextPage();
    } else {
        if (frameCount % 4 == 0) {
            pdf.nextRow(); // move to next row
        } else {
            pdf.nextColumn(); // move to next column
        }
    }
}
