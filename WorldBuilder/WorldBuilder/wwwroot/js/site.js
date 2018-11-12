
var handleIndex = -1;
var layerIndex = window.location.pathname.includes('/WorldBuilder') ? 0 : -1;

let numHandles;
let worldSize;

var sprite_id = undefined;

var movingImg = undefined;
var start = undefined;

var editedImg = undefined;
var editSize = false;
var editRotation = false;

function clamp(num, min, max) {
    return num <= min ? min : num >= max ? max : num;
}

let layers = [
    {
        x: [],
        y: [],
        size: undefined,
        color: [255, 255, 255, 1],
        color_id: undefined,
        sprites: []
    },
    {
        x: [],
        y: [],
        size: undefined,
        color: [200, 200, 200, 1],
        color_id: undefined,
        sprites: []
    },
    {
        x: [],
        y: [],
        size: undefined,
        color: [150, 150, 150, 1],
        color_id: undefined,
        sprites: []
    },
    {
        x: [],
        y: [],
        size: undefined,
        color: [100, 100, 100, 1],
        color_id: undefined,
        sprites: []
    },
    {
        x: [],
        y: [],
        size: undefined,
        color: [50, 50, 50, 1],
        color_id: undefined,
        sprites: []
    },
    {
        x: [],
        y: [],
        size: undefined,
        color: [0, 0, 0, 1],
        color_id: undefined,
        sprites: []
    }
];

let curveSmoothness = 20;

let finalPX;
let finalPY;

$(document).ready(function () {
    //callValues();
    if (layerIndex != -1) {
        if (window.location.pathname.includes('/WorldBuilder/Edit'))
            getWorld($('[data-world-id]').attr('data-world-id'), fillFromServer, fillLayers);
        else
            fillLayers();
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

    if (window.location.pathname.includes('/Worlds')) {
        getWorlds(0, 10, loadWorldsToContent);
        getWorldNum();
    }

    $(document).on('mousewheel', 'content[data-target="worlds"]', function () {
        if ($(this).scrollTop() + $(this).height() == $(this).prop('scrollHeight')) {
            //if reached bottom of element, load more
            if ($(this).find('[data-world-id]').length < worldMaxNumber)
                if (!awaitingGetWorldsResult) {
                    awaitingGetWorldsResult = true;
                    getWorlds($(this).find('[data-world-id]').length, 10, loadWorldsToContent);
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

    $(document).on('mousedown', '#sprite-selector .image', function (event) {
        let image = $(this).attr('style');
        sprite_id = $(this).attr('data-image-id');
        image = image.substring(image.indexOf('url(') + 'url('.length, image.indexOf(')'));
        $('body').append('<div data-role="drag-surface" class="full-size" style="z-index:999"></div>');
        $('div[data-role="drag-surface"]').append('<img draggable="false" class="center image pos-absolute" src="'
            + image + '" style="left: ' + event.clientX + 'px; top: ' + event.clientY + 'px;"/>');
    });

    $(document).on('mousemove', 'div[data-role="drag-surface"]', function (event) {
        $(this).find('img').attr('style', 'left: ' + event.clientX + 'px; top: ' + event.clientY + 'px;');
    });

    $(document).on('mouseup', 'div[data-role="drag-surface"]', function (event) {
        let image = $(this).find('img');
        let s = image.attr('style');
        let posX = Number(s.substring(s.indexOf('left: ') + 'left: '.length, s.indexOf('px')));
        let posY = Number(s.substring(s.indexOf('top: ') + 'top: '.length, s.lastIndexOf('px')));
        let zoneX = $('#background').offset().left;
        let zoneY = $('#background').offset().top;
        let width = $('#background').width();
        let height = $('#background').height();

        let scroll_left = getScrollLeft();
        let offset = (layers[layerIndex].size - 100) * scroll_left / 100;

        if ((posX > zoneX && posX < zoneX + width) &&
            (posY > zoneY && posY < zoneY + height)) {
            //in range
            let zIndex = maxZIndex(layers[layerIndex].sprites) + 1;
            let sprite = {
                id: sprite_id,
                x: 100 * (posX - zoneX) / width + offset,
                y: 100 * (posY - zoneY) / height,
                size: 10,
                rotation: 0,
                zIndex: zIndex
            };
            layers[layerIndex].sprites.push(sprite);
            $('.layer' + layerIndex + ':not(.handle)').append('<img draggable="false" class="image pos-absolute" src="' + image.attr('src')
                + '" style="left: ' + (sprite.x - offset) + '%; top: ' + sprite.y
                + '%; width: ' + sprite.size + '%; height: auto; transform: translateX(-50%) translateY(-50%) rotate(' + sprite.rotation + 'deg); z-index:' + sprite.zIndex + '"/>');
        }
        $(this).remove();
        sprite_id = undefined;
    });

    $(document).on('mousedown', '.layer img', function (e) {
        if ($(this).parent().closest('.layer').hasClass('layer' + layerIndex)) {
            movingImg = $(this).index() - 1;
            let s = $(this).attr('style');
            let left = layers[layerIndex].sprites[movingImg].x;
            let top = layers[layerIndex].sprites[movingImg].y;
            $('#sprite-editor-zone').find('*').remove();
            start = {
                x: e.clientX,
                y: e.clientY,
                ix: left,
                iy: top
            };
        }
    });

    $(document).on('mousemove', 'body', function (e) {
        if (movingImg != undefined) {
            moveImage(e);
        }
    });

    $(document).on('mouseup', 'body', function () {
        movingImg = undefined;
        start = undefined;
    });

    $(document).on('click', '.layer img', function (e) {
        if ($(this).parent().closest('.layer').hasClass('layer' + layerIndex)) {
            let index = $(this).index() - 1;
            let ratio = $(this)[0].naturalHeight / $(this)[0].naturalWidth;
            let size = layers[layerIndex].sprites[index].size;
            let width = size;
            let rotation = layers[layerIndex].sprites[index].rotation;
            let height = size * ratio;
            let left = getScrollLeft();
            let offset = (layers[layerIndex].size - 100) * left / 100;
            let x = layers[layerIndex].sprites[index].x - offset;
            let y = layers[layerIndex].sprites[index].y;

            let editor = '<div draggable="false" class="sprite-editor" style="left:' + x + '%; top:' + y + '%; width:' + width + '%; padding-top:' + height + '%; transform: translateX(-50%) translateY(-50%) rotate(' + rotation + 'deg)">'
                + '<div draggable="false" class="sprite-handle pos-absolute circle-10 active-color top-left pivot-center"></div>'
                + '<div draggable="false" class="sprite-handle pos-absolute circle-10 active-color top-right pivot-center"></div>'
                + '<div draggable="false" class="sprite-handle pos-absolute circle-10 active-color bottom-right pivot-center"></div>'
                + '<div draggable="false" class="sprite-handle pos-absolute circle-10 active-color bottom-left pivot-center"></div>'
                + '<div draggable="false" class="sprite-rotator pos-absolute circle-10 active-color pivot-center pos-title"></div>'
                + '</div>';

            $('#sprite-editor-zone').append(editor);
            editedImg = index;
            e.stopImmediatePropagation();
        }
    });

    $(document).on('click', '*:not(.layer img):not(.sprite-editor .sprite-handle)', function () {
        $('#sprite-editor-zone').find('*').remove();
    });

    $(document).on('mousedown', '.sprite-editor .sprite-handle', function () {
        editSize = true;
    });

    $(document).on('mousemove', 'body', function (e) {
        if (editSize) {
            let editor = $('.sprite-editor');
            let curX = e.clientX;
            let curY = e.clientY;
            let image = $($('.layer.layer' + layerIndex + ' img')[editedImg]);
            let ratio = image[0].naturalHeight / image[0].naturalWidth;
            let angle = toRadians(layers[layerIndex].sprites[editedImg].rotation);
            let boundingbox = editor[0].getBoundingClientRect();
            let w = boundingbox.width / 2;
            let h = boundingbox.height / 2;
            let posX = boundingbox.left + w;//will always return center x
            let posY = boundingbox.top + h;// will always return center y
            let diffX = curX - posX;
            let diffY = curY - posY;
            let rX = Math.abs(diffX * Math.cos(-angle) - diffY * Math.sin(-angle));
            let rY = Math.abs(diffX * Math.sin(-angle) + diffY * Math.cos(-angle));
            let left = getScrollLeft();
            let offset = (layers[layerIndex].size - 100) * left / 100;
            let size = 2 * Math.max(rY / ratio, rX);
            size *= 100 / $('#background').width();
            layers[layerIndex].sprites[editedImg].size = size;
            updateSprite(layers[layerIndex].sprites[editedImg], $($('.layer.layer' + layerIndex + ' img')[editedImg]), offset);
            let x = layers[layerIndex].sprites[editedImg].x - offset;
            let y = layers[layerIndex].sprites[editedImg].y;
            let rotation = layers[layerIndex].sprites[editedImg].rotation;
            editor.attr('style', 'left: ' + x + '%; top:' + y + '%; width:' + size + '%; padding-top:' + size * ratio + '%; transform: translateX(-50%) translateY(-50%) rotate(' + rotation + 'deg)');
        }
    });

    $(document).on('mouseup', 'body', function () {
        editSize = false;
        editRotation = false;
    });

    $(document).on('mousedown', '.sprite-editor .sprite-rotator', function () {
        editRotation = true;
    });

    $(document).on('mousemove', 'body', function (e) {
        if (editRotation) {
            let editor = $('.sprite-editor');
            let curX = e.clientX;
            let curY = e.clientY;
            let image = $($('.layer.layer' + layerIndex + ' img')[editedImg]);
            let ratio = image[0].naturalHeight / image[0].naturalWidth;
            let s = image.attr('style');
            let left = getScrollLeft();
            let offset = (layers[layerIndex].size - 100) * left / 100;
            let x = Number(s.substring(s.indexOf('left:') + 'left:'.length, s.indexOf('%')));
            let y = Number(s.substring(s.indexOf('top:') + 'top:'.length, s.indexOf('%', s.indexOf('%') + 1)));
            x /= 100 / $('#background').width();
            y /= 100 / $('#background').height();
            curX -= $('#background').offset().left;
            curY -= $('#background').offset().top;
            let diffX = curX - x;
            let diffY = curY - y;
            let alpha = Math.atan2(diffY, diffX);
            alpha = toDegrees(alpha);
            alpha += 90;
            let size = layers[layerIndex].sprites[editedImg].size;
            layers[layerIndex].sprites[editedImg].rotation = alpha;
            updateSprite(layers[layerIndex].sprites[editedImg], $($('.layer.layer' + layerIndex + ' img')[editedImg]), offset);
            x = layers[layerIndex].sprites[editedImg].x - offset;
            y = layers[layerIndex].sprites[editedImg].y;
            editor.attr('style', 'left: ' + x + '%; top:' + y + '%; width:' + size + '%; padding-top:' + size * ratio + '%; transform: translateX(-50%) translateY(-50%) rotate(' + alpha + 'deg)');
        }
    });

    $(document).on('keyup', 'body', function (e) {
        let keycode = e.keyCode ? e.keyCode : e.which;
        if (keycode == 46) {//delete key
            if (editedImg != undefined) {
                layers[layerIndex].sprites.splice(editedImg, 1);//remove sprite from metadata
                $($('.layer.layer' + layerIndex + ' img')[editedImg]).remove();//remove sprite from DOM
                $('.sprite-editor').remove();//remove editor from DOM
                editedImg = undefined;
            }
        }
    });

    $(document).on('keyup', 'body', function (e){
        let keycode = e.keyCode ? e.keyCode : e.which;
        if (keycode == 38) {//arrow up
            if (editedImg != undefined) {//move forward
                layers[layerIndex].sprites[editedImg].zIndex++;
                let left = getScrollLeft();
                let offset = (layers[layerIndex].size - 100) * left / 100;
                updateSprite(layers[layerIndex].sprites[editedImg], $($('.layer.layer' + layerIndex + ' img')[editedImg]), offset);
            }
        }
        if (keycode == 40) {//arrow down
            if (editedImg != undefined) {//move backward
                layers[layerIndex].sprites[editedImg].zIndex--;
                let left = getScrollLeft();
                let offset = (layers[layerIndex].size - 100) * left / 100;
                updateSprite(layers[layerIndex].sprites[editedImg], $($('.layer.layer' + layerIndex + ' img')[editedImg]), offset);
            }
        }
    });

    $(document).on('click', '[data-target="submit-world"]', function () {
        let valid = true;
        for (let i = 0; i < layers.length; i++) {
            if (layers[i].color_id == undefined)
                valid = false;
        }
        if (valid) {
            //submit world
            let world = {
                layers: layers,
                portals: [],//TODO: implement portals
                name: $('[data-role="world-name"]').val(),
                planet_id: '68cef04fb45a4074804769e1ead3fdfb'
            }
            postWorld(world);
        }
    });
});

function loadWorldsToContent(response) {
    if (response != null) {
        for (let i = 0; i < response.length; i++) {
            $('content[data-target="worlds"]').append(
                '<div class="card" data-world-id="'
                + response[i].item1 + '"><label class="col-lg-6 col-md-6">'
                + response[i].item2 + '</label><div class="options col-lg-6 col-md-6 float-right"><a href="'
                + ("WorldBuilder/Edit/" + response[i].item1) + '"><i class="font-24 far fa-edit"></i></a>'
                + '<a data-remove="world" class="danger" href="javascript:void(0)"><i class="font-24 fas fa-trash"></i></a></div></div>');//TODO: implement remove world
        }
    }
}

function maxZIndex(sprites) {
    let max = 0;
    for (let i = 0; i < sprites.length; i++) {
        if (sprites[max].zIndex < sprites[i].zIndex)
            max = i;
    }
    if (sprites.length > 0)
        return sprites[max].zIndex;
    return -1;
}

function toDegrees(angle) {
    return angle * (180 / Math.PI);
}

function toRadians(angle) {
    return angle * (Math.PI / 180);
}

function moveImage(e) {
    let left = getScrollLeft();
    let offset = (layers[layerIndex].size - 100) * left / 100;
    let posX = e.clientX - start.x;//calculate the distance the mouse moved from mousedown event to current position
    let posY = e.clientY - start.y;
    posX *= 100 / $('#background').width();
    posY *= 100 / $('#background').height();
    layers[layerIndex].sprites[movingImg].x = start.ix + posX;//set the image pos as the initial pos + the distance the mouse moved
    layers[layerIndex].sprites[movingImg].y = start.iy + posY;
    updateSprite(layers[layerIndex].sprites[movingImg], $($('.layer.layer' + layerIndex + ' img')[movingImg]), offset);
}

function reloadPage() {
    window.location = window.location;
}

function updateView() {
    let left = getScrollLeft();
    positionHandles(layerIndex);
    $('.handle:not(.layer' + layerIndex + '):not(.slider .handle)').hide();
    for (let i = 0; i < layers.length; i++) {
        let curved = cruveLines(layers[i]);
        finalPX = curved.x;
        finalPY = curved.y;
        let polygon = convertToPolygon(finalPX, finalPY);
        let color = layers[i].color;
        $('#layer' + i).attr('style', 'clip-path: ' + polygon + '; background-color:rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + color[3] + ')');
        
        let offset = (layers[i].size - 100) * left / 100;

        for (let j = 0; j < layers[i].sprites.length; j++) {
            let selector = '.layer.layer' + i + ' img';
            let sprite = $($(selector)[j]);
            updateSprite(layers[i].sprites[j], sprite, offset);
        }
    }

    let color = layers[layerIndex].color;
    $('.layer-color .color').attr('style', 'background-color:rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + color[3] + ')');
    $('.layer-color .color').attr('data-color-id', layers[layerIndex].color_id);
    $('#sprite-editor-zone').find('*').remove();
    $('.layer:not(.layer' + layerIndex + ') img').css('pointer-events', 'none');
    $('.layer.layer' + layerIndex + ' img').css('pointer-events', 'all');
}

function updateSprite(spriteObject, spriteElement, offset) {
    spriteElement.attr('style', 'left: '
        + (spriteObject.x - offset) + '%; top: '
        + spriteObject.y + '%; width: ' + spriteObject.size + '%; height: auto; transform: translateX(-50%) translateY(-50%) rotate(' + spriteObject.rotation + 'deg); z-index:' + spriteObject.zIndex);
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
            layers[i].y.push(i * 100 / (layers.length - 1));
        }
        layers[i].x.push(size);
        layers[i].y.push(100);
        layers[i].size = size;
    }
    updateView();
}

function fillFromServer(world) {
    layers = world.layers;
    worldSize =  layers[5].size / 10;
    numHandles = layers[5].x.length;
    let width = 100 * (10 / worldSize);
    $('.scroll-handle').attr('style', 'left:' + width / 2 + '%; width:' + width + '%');
    let sprite_ids = [];

    for (let i = 0; i < layers.length; i++) {
        for (let j = 0; j < layers[i].x - 2; j++) {
            $('#handles').append('<div class="handle layer' + i + '"></div>');
        }

        for (let j = 0; j < layers[i].sprites.length; j++)
            sprite_ids.push(layers[i].sprites[j].id);
    }

    getSpritesSources(sprite_ids, genSprites);
    $('[data-role="world-name"]').val(world.name);
    updateView();
}

function genSprites(response) {
    let scroll_left = getScrollLeft();
    let offset;
    for (let i = 0; i < response.length; i++) {
        console.log(response.keys[0]);
    }
    for (let i = 0; i < layers.length; i++) {
        offset = (layers[i].size - 100) * scroll_left / 100;
        for (let j = 0; j < layers[i].sprites.length; j++) {
            let sprite = layers[i].sprites[j];
            $('.layer' + i + ':not(.handle)').append('<img draggable="false" class="image pos-absolute" src="' + response[sprite.id]
                + '" style="left: ' + (sprite.x - offset) + '%; top: ' + sprite.y
                + '%; width: ' + sprite.size + '%; height: auto; transform: translateX(-50%) translateY(-50%) rotate(' + sprite.rotation + 'deg); z-index:' + sprite.zIndex + '"/>');
        }
    }
    updateView();
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

function getScrollLeft() {
    let style = $('.scroll-handle').attr('style');
    let width = Number(style.substring(style.indexOf('width:') + 'width:'.length, style.lastIndexOf('%')));
    let left = Number(style.substring(style.indexOf('left:') + 'left:'.length, style.indexOf('%'))) - width / 2;
    left = 100 * left / (100 - width);
    return left;
}

function updatePointsArray(index, x, y) {
    if (layerIndex != -1) {
        let left = getScrollLeft();
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
    let left = getScrollLeft();
    let pX = p.x;
    let pY = p.y;
    let x = [];
    let offset = (p.size - 100) * left / 100;
    x.push(pX[0] - offset);
    x.push(pX[1] - offset);
    let y = [];
    y.push(pY[0]);
    y.push(pY[1]);
    let segment;
    
    for (let i = 1; i < pX.length - 3; i += 2) {
        segment = getCurveSegment(pX[i] - offset, pX[i + 1] - offset, pX[i + 2] - offset, pY[i], pY[i + 1], pY[i + 2]);
        x = x.concat(segment.x);
        y = y.concat(segment.y);
    }

    x.push(pX[pX.length - 1] - offset);
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