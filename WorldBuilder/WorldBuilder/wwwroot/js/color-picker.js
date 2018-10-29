$(document).ready(function () {
    $(document).on('click', '.color-picker .satlum-mat', function (e) {
        let pointer = $(this).find('div');
        let posX = e.clientX;
        let posY = e.clientY;
        let offsetX = posX - $(this).offset().left;
        let offsetY = posY - $(this).offset().top;
        offsetX /= $(this).width();
        offsetY /= $(this).height();
        if (offsetX < 0)
            offsetX = 0;
        if (offsetX > 1)
            offsetX = 1;
        if (offsetY < 0)
            offsetY = 0;
        if (offsetY > 1)
            offsetY = 1;
        pointer.attr('style', 'top:' + offsetY * 100 + '%; left:' + offsetX * 100 + '%');

        updateFinalColor();
    });

    $(document).on('click', '.color-picker .hue', function (e) {
        let pointer = $(this).find('div');
        let posY = e.clientY;
        let offset = posY - $(this).offset().top;
        offset /= $(this).height();
        if (offset < 0)
            offset = 0;
        if (offset > 1)
            offset = 1;
        let r, g, b;
        if (offset < 0.16) {
            r = 255;
            g = 255 * offset / 0.16;
            b = 0;
        }
        else if (offset < 0.33) {
            r = 255 * (0.33 - offset) / 0.16;
            g = 255;
            b = 0;
        }
        else if (offset < 0.5) {
            r = 0;
            g = 255;
            b = 255 * (offset - 0.33) / 0.16;
        }
        else if (offset < 0.66) {
            r = 0;
            g = 255 * (0.66 - offset) / 0.16;
            b = 255;
        }
        else if (offset < 0.84) {
            r = 255 * (offset - 0.66) / 0.16;
            g = 0;
            b = 255;
        }
        else {
            r = 255;
            g = 0;
            b = 255 * (1 - offset) / 0.16;
        }

        pointer.attr('style', 'background-color:rgb(' + r + ', ' + g + ', ' + b + '); top:' + offset * 100 + '%;');
        let satlummat = $(this).parent().closest('.color-picker').find('.satlum-mat');
        satlummat.attr('style', 'background: linear-gradient(0deg, #000, rgb(255,255,255,0.0)), linear-gradient(270deg, rgb(' + r + ', ' + g + ', ' + b + '), #fff)');

        updateFinalColor();
    });

    $(document).on('click', '.color-picker .opacity', function (e) {
        let pointer = $(this).find('div');
        let posX = e.clientX;
        let offsetX = posX - $(this).offset().left;
        offsetX /= $(this).width();
        if (offsetX < 0)
            offsetX = 0;
        if (offsetX > 1)
            offsetX = 1;
        pointer.attr('style', 'left:' + offsetX * 100 + '%');

        updateFinalColor();
    });

    $(document).on('click', '.color-picker button[data-target="submit-color"]', function(){
        let picker = $(this).parent().closest('.color-picker');
        let r = picker.find('input[data-target="r"]').val();
        let g = picker.find('input[data-target="g"]').val();
        let b = picker.find('input[data-target="b"]').val();
        let a = picker.find('input[data-target="a"]').val();

        postColor(r, g, b, a);
    });

    $(document).on('click', '.server-color .color', function () {
        let id = $(this).attr('data-color-id');
        deleteColor(id);
    });
});

function updateFinalColor() {
    let r, g, b, a;
    let h;
    let hue = $('.color-picker .hue div').attr('style');
    let s, e;
    s = hue.indexOf('(') + 1;
    e = hue.indexOf(',');
    r = Number(hue.substring(s, e));
    hue = hue.substring(e + 1);
    e = hue.lastIndexOf(',');
    g = Number(hue.substring(0, e));
    hue = hue.substring(e + 1);
    e = hue.indexOf(')');
    b = Number(hue.substring(0, e));
    h = Number(hue.substring(hue.indexOf('top:') + 'top:'.length, hue.indexOf('%'))) / 100;

    let satlum = $('.color-picker .satlum-mat div').attr('style');
    let sat, lum;
    lum = 100 - Number(satlum.substring(satlum.indexOf('top:') + 'top:'.length, satlum.indexOf('%')));
    sat = Number(satlum.substring(satlum.indexOf('left:') + 'left:'.length, satlum.lastIndexOf('%')));
    lum /= 100;
    sat /= 100;

    r = r * sat + 255 * (1 - sat);
    g = g * sat + 255 * (1 - sat);
    b = b * sat + 255 * (1 - sat);

    r = r * lum;
    g = g * lum;
    b = b * lum;

    let alpha = $('.color-picker .opacity div').attr('style');
    a = Number(alpha.substring(alpha.indexOf('left:') + 'left:'.length, alpha.indexOf('%'))) / 100;

    $('input[data-target="r"]').val(Math.round(r));
    $('input[data-target="g"]').val(Math.round(g));
    $('input[data-target="b"]').val(Math.round(b));
    $('input[data-target="h"]').val(Math.round(h * 36000) / 100);
    $('input[data-target="s"]').val(Math.round(sat * 10000) / 100);
    $('input[data-target="l"]').val(Math.round(lum * 10000) / 100);
    $('input[data-target="a"]').val(Math.round(a * 10000) / 100);

    $('.color-picker .final .color').attr('style', 'background-color:rgba(' + r + ',' + g + ',' + b + ',' + a + ');');
}

function loadColorsToAside(response) {
    if (response != null)
        for (let i = 0; i < response.length; i++) {
            $('div[data-target="colors"]').append(
                '<div class="color" data-color-id="'
                + response[i].item1 + '" style="background-color:rgba('
                + response[i].item2 + ','
                + response[i].item3 + ','
                + response[i].item4 + ','
                + Number(response[i].item5) + ')"><div class="cross"><div></div><div></div></div></li>');
        }
}