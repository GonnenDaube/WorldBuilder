var dragTimer;

$(document).ready(function () {

    $(document).on('drag', function (e) {
        dragTimer = window.setTimeout(function () {
            //drag file leave
            $('.dropzone').removeClass('dragover');
        }, 25);

        $(this).parent().closest('.fileUploader').find('input[type="file"]').files = e.dataTransfer.files;
    });

    $(document).on('dragover', function (e) {
        var dt = e.originalEvent.dataTransfer;
        if (dt.types && (dt.types.indexOf ? dt.types.indexOf('Files') != -1 : dt.types.contains('Files'))) {
            //drag file enter
            $('.dropzone').addClass('dragover');
        }
    });

    $(document).on('dragleave', function (e) {
        dragTimer = window.setTimeout(function () {
            //drag file leave
            $('.dropzone').removeClass('dragover');
        }, 25);
    });

    $(document).on('click', '.fileUploader .dropzone', function () {
        $(this).parent().closest('.fileUploader').find('input[type="file"]').trigger('click');
    });

    $(document).on('change', '.fileUploader input[type="file"]', function () {
        var fileUploader = $(this).parent().closest('.fileUploader');
        var file = $(this)[0].files[0],
            reader = new FileReader();
        reader.onload = function (event) {
            fileUploader.find('.finalzone').show();
            fileUploader.find('.dropzone').hide();
            let img = fileUploader.find('img');
            img.attr('src', event.target.result);
        }

        reader.readAsDataURL(file);
    });
});