// Write your JavaScript code.
var handleIndex = -1;
var layerIndex = window.location.pathname.includes('WorldBuilder/Index"') -1;

let numHandles = 11;

let layers = [
    {
        'x': [],
        'y': []
    },
    {
        'x': [],
        'y': []
    },
    {
        'x': [],
        'y': []
    },
    {
        'x': [],
        'y': []
    },
    {
        'x': [],
        'y': []
    }
];

let curveSmoothness = 20;

let finalPX;
let finalPY;

$(document).ready(function () {
    fillLayers();

    updateView();

    $(document).on('mousedown', '.handle:not(.slider .handle)', function (e) {
        handleIndex = $(this).index('.handle.layer' + layerIndex);
    });
    $(document).on('mouseup', 'body', function () {
        handleIndex = -1;
    });
    $(document).on('mousemove', 'body', function (e) {
        moveHandleEvent(e, handleIndex);
    });

    $(document).on('click', 'button[data-trigger="create-new-world"]', function (e) {
        sessionStorage.setItem("world-size", $('world-size').text());
        sessionStorage.setItem("world-points", $('world-points').text());

        window.location = "WorldBuilder/Index";
    });

    $(document).on('click', '#newWorldModal button[data-dismiss="modal"]', function (e) {
        $('#world-size').text('10');
        $('#world-points').text('10');
        $('.slider .handle').attr('style', 'left:0%');
    })
});

function updateView() {
    positionHandles(layerIndex);
    $('.handle:not(.layer' + layerIndex + '):not(.slider .handle)').hide();
    for (let i = 0; i < layers.length; i++) {
        let curved = cruveLines(layers[i]);
        finalPX = curved.x;
        finalPY = curved.y;
        let polygon = convertToPolygon(finalPX, finalPY);
        $('#layer' + i).attr('style', 'clip-path: ' + polygon);
    }
}

function updateLayer(target) {
    layerIndex = target;
}

function fillLayers() {
    for (let i = 0; i < layers.length; i++) {
        layers[i].x.push(0);
        layers[i].y.push(100);
        for (let j = 0; j < numHandles; j++) {
            layers[i].x.push(j * 100 / (numHandles - 1));
            layers[i].y.push((i + 1) * 100 / layers.length);
        }
        layers[i].x.push(100);
        layers[i].y.push(100);
    }
}

function moveHandleEvent(event, index) {
    if (index != -1 && layerIndex != -1) {
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
        if (index == $('.handle.layer' + layerIndex).size() - 1)
            perX = 100;
        $('.handle.layer' + layerIndex + ':eq(' + index + ')').attr('style', 'left: ' + perX + '%; top: ' + perY + '%; ');

        updatePointsArray(index, perX, perY);
    }
}

function updatePointsArray(index, x, y) {
    if (layerIndex != -1) {
        layers[layerIndex].x[index + 1] = x;
        layers[layerIndex].y[index + 1] = y;
        let curved = cruveLines(layers[layerIndex]);
        finalPX = curved.x;
        finalPY = curved.y;
        let polygon = convertToPolygon(finalPX, finalPY);
        $('#layer' + layerIndex).attr('style', 'clip-path: ' + polygon);
    }
}

function convertToPolygon(pX, pY) {
    let p = 'polygon(';
    for (let i = 0; i < pX.length - 1; i++) {
        p += pX[i] + '% ' + pY[i] + '%, ';
    }
    p += pX[pX.length - 1] + '% ' + pY[pY.length - 1] + '%);';
    return p;
}

function cruveLines(p) {
    let pX = p.x;
    let pY = p.y;
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

function positionHandles(layerIndex) {
    if (layerIndex != -1) {
        for (let i = 1; i < layers[layerIndex].x.length - 1; i++) {
            $('.handle.layer' + layerIndex + ':eq(' + (i - 1) + ')').attr('style', 'left: ' + layers[layerIndex].x[i] + '%; top: ' + layers[layerIndex].y[i] + '%; ');
        }
    }
}