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
        let range = Number(slider.find('input[type="range"]').attr('max')) - Number(slider.find('input[type="range"]').attr('min'));
        let target = Math.round(pos * range + Number(slider.find('input[type="range"]').attr('min')));
        if (target > Number(slider.find('input[type="range"]').attr('max')))
            target = Number(slider.find('input[type="range"]').attr('max'));
        if (target < Number(slider.find('input[type="range"]').attr('min')))
            target = Number(slider.find('input[type="range"]').attr('min'));
        slider.find('input[type="range"]').attr('value', target);
        pos = 100 / range * target;
        $(sliderHandle).attr('style', 'left:' + pos + '%');
        updateLayer(target);
        updateView();
    }
}