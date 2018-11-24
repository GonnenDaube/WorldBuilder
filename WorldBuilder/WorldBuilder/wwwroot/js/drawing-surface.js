var canvas = undefined;
var context = undefined;

var draw_data = [];
var record = false;

var awaitingGetMagicTypeResult = false;
var magicTypeMaxNumber = undefined;

var currentTrainMagic = undefined;

$(document).ready(function () {
    if (window.location.pathname.includes('/MagicBuilder')) {
        canvas = $('canvas');
        canvas.attr('width',(window.innerHeight * 0.5));
        canvas.attr('height', (window.innerHeight * 0.5));

        context = canvas[0].getContext("2d");

        getMagicTypes(0, 15, loadMagicTypesToAside);
        getMagicTypeNumber();
    }

    $(document).on('mousewheel', '.server-magic-type', function () {
        if ($(this).scrollTop() + $(this).height() == $(this).prop('scrollHeight')) {
            //if reached bottom of element, load more
            if ($(this).find('.magic-type').length < magicTypeMaxNumber)
                if (!awaitingGetMagicTypeResult) {
                    awaitingGetMagicTypeResult = true;
                    getMagicTypes($(this).find('.magic-type').length, 15, loadMagicTypesToAside);
                }
        }
    });

    $(document).on('click', '.server-magic-type[data-remove] .magic-type', function () {
        deleteMagicType($(this).attr('data-magic-id'));
    });

    $(document).on('mousedown', 'canvas', function (e) {
        record = true;
        let posX = e.clientX - canvas.offset().left;
        let posY = e.clientY - canvas.offset().top;
        draw_data = [
            {
                x: posX,
                y: posY
            }];
        context.clearRect(0, 0, canvas[0].width, canvas[0].height);
    });

    $(document).on('mouseup', 'canvas', function (e) {
        record = false;
    });

    $(document).on('mousemove', 'canvas', function (e) {
        if (record) {
            let posX = e.clientX - canvas.offset().left;
            let posY = e.clientY - canvas.offset().top;
            draw_data.push({
                x: posX,
                y: posY
            });
            context.beginPath();
            context.moveTo(draw_data[0].x, draw_data[0].y);
            for (let i = 1; i < draw_data.length; i++) {
                context.lineTo(draw_data[i].x, draw_data[i].y);
            }
            context.strokeStyle = '#00ff90';//active color
            context.stroke();
        }
    });

    $(document).on('click', '[data-target="submit-magic"]', function () {
        var image = canvas[0].toDataURL();
        var data = normalize(draw_data);
        var name = $('[data-target="magic-name"]').val();
        postMagic(data, image, name);
    });

    if (window.location.pathname.includes('/Train')) {
        //on Train page
        $('.backdrop').width(window.innerHeight * 0.5 + 'px');
        $('.backdrop').height(window.innerHeight * 0.5 + 'px');


        $(document).on('click', '.magic-type', function () {
            currentTrainMagic = $(this).attr('data-magic-id');
            let src = $(this).attr('style');
            src = src.substring(src.indexOf('url(') + 'url('.length, src.indexOf(')'));
            $('.backdrop').attr('src', src);
        });

        $(document).on('keypress', function (e) {
            let keycode = e.charCode;
            if (keycode === 32) {//space key
                if (currentTrainMagic != undefined && draw_data.length > 10) {
                    var data = normalize(draw_data);
                    postTrainData(data, currentTrainMagic);
                    context.clearRect(0, 0, canvas[0].width, canvas[0].height);
                    draw_data = [];
                }
            }
        });
    }
});

function normalize(raw_data) {
    let n = 30;
    let min = raw_data[0].x, max = raw_data[0].x;
    let out = [];

    for (let i = 0; i < raw_data.length; i++) {
        if (raw_data[i].x > max)
            max = raw_data[i].x;
        if (raw_data[i].x < min)
            min = raw_data[i].x;
        if (raw_data[i].y > max)
            max = raw_data[i].y;
        if (raw_data[i].y < min)
            min = raw_data[i].y;
    }

    let x, y;
    for (let i = 0; i < raw_data.length; i++) {
        x = (raw_data[i].x - min) / (max - min);
        y = (raw_data[i].y - min) / (max - min);
        out.push({
            x: x,
            y: y
        });
    }

    let i = 1;
    let index;
    while (out.length > n) {
        for (let j = 1; out.length > n && j < i + 1; j++) {
            index = Math.floor(j * out.length / (i + 1));
            out.splice(index, 1);
        }
        i++;
    }
    i = 1;
    while (out.length < n) {
        for (let j = 1; out.length < n && j < i + 1; j++) {
            index = Math.floor(j * out.length / (i + 1));
            out.splice(index + 1, 0, average(out[index], out[index + 1]));
        }
        i++;
    }
    return out;
}

function average(vec1, vec2) {
    return {
        x: (vec1.x + vec2.x) / 2.0,
        y: (vec1.y + vec2.y) / 2.0
    };
}

function loadMagicTypesToAside(response) {
    if (response != null) {
        let isDelete = $('.server-magic-type[data-remove]').length > 0;
        for (let i = 0; i < response.length; i++) {
            $('.server-magic-type').append(
                '<div class="magic-type" data-magic-id="'
                + response[i].item1 + '" style="background-image:url('
                + response[i].item3 + ')" data-image-name="'
                + response[i].item2 + '" data-baseline="'
                + response[i].item4 + '>' + (isDelete ? ' <div class= "cross"> <div></div> <div></div> </div>' : '<p class="count">('
                    + response[i].item5 + ')</p>') + '</div>');
        }
    }
}