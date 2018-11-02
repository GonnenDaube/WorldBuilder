
var handleIndex = -1;
var layerIndex = window.location.pathname.includes('/WorldBuilder/Index') ? 0 : -1;

let numHandles;
let worldSize;

var sprite_id = undefined;

function clamp(num, min, max) {
    return num <= min ? min : num >= max ? max : num;
}

let layers = [
    {
        'x': [],
        'y': [],
        'size': undefined,
        'color': [255, 255, 255, 1],
        'color_id': undefined
    },
    {
        'x': [],
        'y': [],
        'size': undefined,
        'color': [200, 200, 200, 1],
        'color_id': undefined
    },
    {
        'x': [],
        'y': [],
        'size': undefined,
        'color': [150, 150, 150, 1],
        'color_id': undefined
    },
    {
        'x': [],
        'y': [],
        'size': undefined,
        'color': [100, 100, 100, 1],
        'color_id': undefined
    },
    {
        'x': [],
        'y': [],
        'size': undefined,
        'color': [50, 50, 50, 1],
        'color_id': undefined
    }
];

let curveSmoothness = 20;

let finalPX;
let finalPY;

$(document).ready(function () {
    //callValues();
    if (layerIndex != -1) {
        fillLayers();
        updateView();
    }

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
        sessionStorage.setItem("world-size", $('#world-size').text());
        sessionStorage.setItem("world-points", $('#world-points').text());

        window.location = "WorldBuilder/Index";
    });

    $(document).on('click', '#newWorldModal button[data-dismiss="modal"]', function (e) {
        $('#world-size').text('10');
        $('#world-points').text('11');
        $('.slider .handle').attr('style', 'left:0%');
    })

    if (window.location.pathname.includes('/ColorPalette') ||
        window.location.pathname.includes('/WorldBuilder')) {
        //Color Palette Index || World Builder Index
        getColors(0, 15, loadColorsToAside);
        getColorNum();
    }

    $(document).on('mousewheel', '.server-color', function () {
        if ($(this).scrollTop() + $(this).height() == $(this).prop('scrollHeight')) {
            //if reached bottom of element, load more
            if ($(this).find('.color').length < colorMaxNumber)
                if (!awaitingGetColorResult) {
                    awaitingGetColorResult = true;
                    getColors($(this).find('.color').length, 15, loadColorsToAside);
                }
        }
    });

    if (window.location.pathname.includes('/SpriteBuilder') ||
        window.location.pathname.includes('/WorldBuilder')) {
        //Sprite Builder Index || World Builder Index
        getSprites(0, 10, loadSpritesToAside);
        getSpriteNum();
    }

    $(document).on('mousewheel', '.server-image', function () {
        if ($(this).scrollTop() + $(this).height() == $(this).prop('scrollHeight')) {
            //if reached bottom of element, load more
            if ($(this).find('.image').length < spriteMaxNumber)
                if (!awaitingGetSpriteResult) {
                    awaitingGetSpriteResult = true;
                    getSprites($(this).find('.image').length, 10, loadSpritesToAside);
                }
        }
    });

    $(document).on('click', '.server-image[data-remove] .image', function () {
        let id = $(this).attr('data-image-id');
        deleteSprite(id);
    });

    $(document).on('click', '.layer-color .color', function () {
        if ($('#color-selector').hasClass("closed")) {
            $('#color-selector').removeClass('closed');
            $('#color-selector').addClass('open');

            $('[data-role="sidebar"]:not(#color-selector)').removeClass('open');
            $('[data-role="sidebar"]:not(#color-selector)').addClass('closed');
            $('.sprite-info-selector i').removeClass('active');
        }
        else {
            $('[data-role="sidebar"]').removeClass('open');
            $('[data-role="sidebar"]').addClass('closed');
        }
    });

    $(document).on('click', '.sprite-info-selector i', function () {
        if ($('#sprite-selector').hasClass("closed")) {
            $(this).addClass('active');
            $('#sprite-selector').removeClass('closed');
            $('#sprite-selector').addClass('open');

            $('[data-role="sidebar"]:not(#sprite-selector)').removeClass('open');
            $('[data-role="sidebar"]:not(#sprite-selector)').addClass('closed');
        }
        else {
            $(this).removeClass('active');
            $('[data-role="sidebar"]').removeClass('open');
            $('[data-role="sidebar"]').addClass('closed');
        }
    });

    $(document).on('mousedown', '#sprite-selector .image', function () {
        
    });
});

function reloadPage() {
    window.location = window.location;
}

function updateView() {
    positionHandles(layerIndex);
    $('.handle:not(.layer' + layerIndex + '):not(.slider .handle)').hide();
    for (let i = 0; i < layers.length; i++) {
        let curved = cruveLines(layers[i]);
        finalPX = curved.x;
        finalPY = curved.y;
        let polygon = convertToPolygon(finalPX, finalPY);
        let color = layers[i].color;
        $('#layer' + i).attr('style', 'clip-path: ' + polygon + '; background-color:rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + color[3] + ')');
    }

    let color = layers[layerIndex].color;
    $('.layer-color .color').attr('style', 'background-color:rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + color[3] + ')');
    $('.layer-color .color').attr('data-color-id', layers[layerIndex].color_id);
}

function updateLayer(target) {
    layerIndex = target;
}

function fillLayers() {
    numHandles = sessionStorage.getItem("world-points");
    worldSize = sessionStorage.getItem("world-size");

    let width = 100 * (10 / worldSize);
    $('.scroll-handle').attr('style', 'left:' + width / 2 + '%; width:' + width + '%');

    let q = Math.pow(worldSize / 10, 1 / (layers.length - 1));

    for (let i = 0; i < layers.length; i++) {
        let num = Math.round(numHandles * Math.pow(q, 1 - layers.length + i));
        if (num % 2 == 0)
            num++;
        for (let j = 0; j < num; j++) {
            $('#handles').append('<div class="handle layer' + i + '"></div>');
        }
    }

    let min = 100;

    for (let i = 0; i < layers.length; i++) {
        let size = min * Math.pow(q, i);
        layers[i].x.push(0);
        layers[i].y.push(100);
        let num = Math.round(numHandles * Math.pow(q, 1 - layers.length + i));
        if (num % 2 == 0)
            num++;
        for (let j = 0; j < num; j++) {
            layers[i].x.push(j * size / (num - 1));
            layers[i].y.push(i * 100 / layers.length);
        }
        layers[i].x.push(size);
        layers[i].y.push(100);
        layers[i].size = size;
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
        if (perY < 0)
            perY = 0;
        if (perY > 100)
            perY = 100;
        if (perX < 0)
            perX = 0;
        if (perX > 100)
            perX = 100;
        $('.handle.layer' + layerIndex + ':eq(' + index + ')').attr('style', 'left: ' + perX + '%; top: ' + perY + '%; ');

        updatePointsArray(index, perX, perY);
    }
}

function updatePointsArray(index, x, y) {
    if (layerIndex != -1) {
        let style = $('.scroll-handle').attr('style');
        let width = Number(style.substring(style.indexOf('width:') + 'width:'.length, style.lastIndexOf('%')));
        let left = Number(style.substring(style.indexOf('left:') + 'left:'.length, style.indexOf('%'))) - width / 2;
        left = 100 * left / (100 - width);
        layers[layerIndex].x[index + 1] = x + (layers[layerIndex].size - 100) * left / 100;
        layers[layerIndex].y[index + 1] = y;
        let curved = cruveLines(layers[layerIndex]);
        finalPX = curved.x;
        finalPY = curved.y;
        let polygon = convertToPolygon(finalPX, finalPY);
        let color = layers[layerIndex].color;
        $('#layer' + layerIndex).attr('style', 'clip-path: ' + polygon + '; background-color:rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + color[3] + ')');
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
    let style = $('.scroll-handle').attr('style');
    let width = Number(style.substring(style.indexOf('width:') + 'width:'.length, style.lastIndexOf('%')));
    let left = Number(style.substring(style.indexOf('left:') + 'left:'.length, style.indexOf('%'))) - width / 2;
    left = 100 * left / (100 - width);
    let pX = p.x;
    let pY = p.y;
    let x = [];
    x.push(pX[0] - (p.size - 100) * left / 100);
    x.push(pX[1] - (p.size - 100) * left / 100);
    let y = [];
    y.push(pY[0]);
    y.push(pY[1]);
    let segment;
    
    for (let i = 1; i < pX.length - 3; i += 2) {
        segment = getCurveSegment(pX[i] - (p.size - 100) * left / 100, pX[i + 1] - (p.size - 100) * left / 100, pX[i + 2] - (p.size - 100) * left / 100, pY[i], pY[i + 1], pY[i + 2]);
        x = x.concat(segment.x);
        y = y.concat(segment.y);
    }

    x.push(pX[pX.length - 1] - (p.size - 100) * left / 100);
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
        let style = $('.scroll-handle').attr('style');
        let width = Number(style.substring(style.indexOf('width:') + 'width:'.length, style.lastIndexOf('%')));
        let left = Number(style.substring(style.indexOf('left:') + 'left:'.length, style.indexOf('%'))) - width / 2;
        left = 100 * left / (100 - width);//map left between 0% and 100%
        let disp = (layers[layerIndex].size - 100) * left / 100;
        for (let i = 1; i < layers[layerIndex].x.length - 1; i++) {
            $('.handle.layer' + layerIndex + ':eq(' + (i - 1) + ')').attr('style', 'left: ' + (layers[layerIndex].x[i] - disp) + '%; top: ' + layers[layerIndex].y[i] + '%; ');
        }
    }
}