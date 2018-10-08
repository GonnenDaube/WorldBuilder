// Write your JavaScript code.
var handleIndex = -1;

let pointsX = [0, 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 100];
let pointsY = [100, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 100];

let curveSmoothness = 20;

let finalPX;
let finalPY;

$(document).ready(function () {
    positionHandles(pointsX, pointsY);
    let curved = cruveLines(pointsX, pointsY);
    finalPX = curved.x;
    finalPY = curved.y;
    let polygon = convertToPolygon(finalPX, finalPY);
    $('#layer0').attr('style', 'background-color:dodgerblue; clip-path: ' + polygon);

    $(document).on('mousedown', '.handle', function (e) {
        handleIndex = $(this).index('.handle');
    });
    $(document).on('mouseup', 'body', function () {
        handleIndex = -1;
    });
    $(document).on('mousemove', 'body', function (e) {
        moveHandleEvent(event, handleIndex);
    });
});

function moveHandleEvent(event, index) {
    if (index != -1) {
        let mX = event.clientX;
        let mY = event.clientY;
        let pX = $('#handles').offset().left;
        let pY = $('#handles').offset().top;
        let posX = mX - pX;
        let posY = mY - pY;
        let perX = 100 * posX / $('#handles').width();
        let perY = 100 * posY / $('#handles').height();
        if (index == 0)
            perX = 0;
        if (index == $('.handle').size() - 1)
            perX = 100;
        $('.handle:eq(' + index + ')').attr('style', 'left: ' + perX + '%; top: ' + perY + '%;');

        updatePointsArray();
    }
}

function updatePointsArray() {
    let x, y;
    for (let i = 1; i < pointsX.length - 1; i++) {
        [x, y] = analyseStyle($('.handle:eq(' + (i - 1) + ')').attr('style'));
        pointsX[i] = Number(x);
        pointsY[i] = Number(y);
    }
    let curved = cruveLines(pointsX, pointsY);
    finalPX = curved.x;
    finalPY = curved.y;
    let polygon = convertToPolygon(finalPX, finalPY);
    $('#layer0').attr('style', 'background-color:dodgerblue; clip-path: ' + polygon);
}

function analyseStyle(style) {
    let start = style.indexOf('left: ') + 'left: '.length;
    let end = style.indexOf('%');
    let x = (style.substring(start, end));
    start = style.indexOf('top: ') + 'top: '.length;
    end = style.lastIndexOf('%');
    let y = (style.substring(start, end));
    return [x, y];
}

function convertToPolygon(pX, pY) {
    let p = 'polygon(';
    for (let i = 0; i < pX.length - 1; i++) {
        p += pX[i] + '% ' + pY[i] + '%, ';
    }
    p += pX[pX.length - 1] + '% ' + pY[pY.length - 1] + '%);';
    return p;
}

function cruveLines(pX, pY) {
    let x = [];
    x.push(pX[0]);
    x.push(pX[1]);
    let y = [];
    y.push(pY[0]);
    y.push(pY[1]);
    let segment;
    
    for (let i = 1; i < pX.length - 3; i += 2) {
        segment = getCurveSegment(pX[i], pX[i + 1], pX[i + 2], pY[i], pY[i + 1], pY[i + 2]);
        x = x.concat(segment.x);
        y = y.concat(segment.y);
    }

    x.push(pX[pX.length - 1]);
    y.push(pY[pY.length - 1]);
    return { 'x': x, 'y': y };
}

function getCurveSegment(x1, x2, x3, y1, y2, y3) {
    //y = ax^2 + bx + c
    let a = ((y1 - y2) * (x2 - x3) - (y2 - y3) * (x1 - x2)) / ((x1 * x1 - x2 * x2) * (x2 - x3) - (x2 * x2 - x3 * x3) * (x1 - x2));
    let b = ((y1 - y2) * (x2 - x3) - a * (x1 * x1 - x2 * x2) * (x2 - x3)) / ((x1 - x2) * (x2 - x3));
    let c = y1 - a * x1 * x1 - b * x1;

    let diff = x3 - x1;
    let step = diff / curveSmoothness;
    let x = [];
    let y = [];
    for (let i = 1; i <= curveSmoothness; i++) {
        x.push(x1 + i * step);
        y.push(a * x[i - 1] * x[i - 1] + b * x[i - 1] + c);
    }
    return { 'x': x, 'y': y };
}

function positionHandles(pX, pY) {
    for (let i = 1; i < pX.length - 1; i++) {
        $('.handle:eq(' + (i - 1) + ')').attr('style', 'left: '+ pX[i] + '%; top: '+ pY[i] +'%;');
    }
}