$(document).ready(function () {
    $(document).on('click', '.color-picker .satlum-mat', function (e) {
        let pointer = $(this).find('div');
        let posX = e.clientX;
        let posY = e.clientY;
        let offsetX = posX - $(this).offset().left;
        let offsetY = posY - $(this).offset().top;
        offsetX /= $(this).width();
        offsetY /= $(this).height();
        pointer.attr('style', 'top:' + offsetY * 100 + '%; left:' + offsetX * 100 + '%');

        //calculate color from offsetX,offsetY weights using known hue
    });
});