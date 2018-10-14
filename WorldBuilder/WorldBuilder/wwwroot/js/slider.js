var moveSlider = -1;

$(document).ready(function () {
    $(document).on('mousedown', '.slider .handle', function (e) {
        moveSlider = $(this);
    });
    $(document).on('mouseup', 'body', function (e) {
        moveSlider = -1;
    });
    $(document).on('mousemove', 'body', function (e) {
        moveSliderEvent(e, moveSlider);
    })
});

function moveSliderEvent(event, sliderHandle) {
    if (sliderHandle != -1) {
        let slider = $(sliderHandle).parent().closest('.slider');
        let mouseRelPos = event.clientX - $(slider).offset().left;
        let pos = mouseRelPos / slider.width();
        let min = Number(slider.find('input[type="range"]').attr('min'));
        let max = Number(slider.find('input[type="range"]').attr('max'));
        let range = max - min;
        let target = Math.round(pos * range + min);
        if (target > max)
            target = max;
        if (target < min)
            target = min;
        slider.find('input[type="range"]').attr('value', target);
        let value = slider.attr('data-target');
        if (value != undefined)
            $(value).text(target);
        target -= min;
        pos = 100 / range * target;
        $(sliderHandle).attr('style', 'left:' + pos + '%');
        if (layerIndex != -1) {
            updateLayer(target);
            updateView();
        }
    }
}