// Write your JavaScript code.


$(document).ready(function () {
    let pX = [0, 0, 20, 40, 49, 66, 86, 100, 100];
    let pY = [100, 37, 20, 31, 19, 23, 18, 35, 100];
    let polygon = convertToPolygon(pX, pY);
    $('#layer0').attr('style', $('#layer0').attr('style') + 'clip-path: ' + polygon);
});

function convertToPolygon(pX, pY) {
    let p = 'polygon(';
    for (let i = 0; i < pX.length - 1; i++) {
        p += pX[i] + '% ' + pY[i] + '%, ';
    }
    p += pX[pX.length - 1] + '% ' + pY[pY.length - 1] + '%);';
    return p;
}