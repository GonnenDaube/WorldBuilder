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
            fileUploader.find('#submit-image').fadeIn(300);
            let img = fileUploader.find('img');
            if (window.location.pathname.includes('/SpriteBuilder/Normal')) {
                //generate film grain normal map
                img[0].onload = function () {
                    let width = img[0].naturalWidth;
                    let height = img[0].naturalHeight;

                    let canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    let context = canvas.getContext('2d');
                    image = new Image();
                    image.onload = function () {
                        context.drawImage(image, 0, 0, canvas.width, canvas.height);
                        imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                        //film grain image;
                        let colorIndices, color = [];
                        let change;
                        for (let i = 0; i < imageData.width; i++) {
                            for (let j = 0; j < imageData.height; j++) {
                                colorIndices = getColorIndicesForCoord(i, j, imageData.width);
                                color[0] = imageData.data[colorIndices[0]];
                                color[1] = imageData.data[colorIndices[1]];
                                color[2] = imageData.data[colorIndices[2]];
                                change = Math.random();
                                color[0] *= change;
                                color[1] *= change;
                                color[2] *= change;
                                color[0] = clamp(color[0], 0, 255);
                                color[1] = clamp(color[1], 0, 255);
                                color[2] = clamp(color[2], 0, 255);
                                imageData.data[colorIndices[0]] = color[0];
                                imageData.data[colorIndices[1]] = color[1];
                                imageData.data[colorIndices[2]] = color[2];
                            }
                        }
                        context.putImageData(imageData, 0, 0);
                        let data = canvas.toDataURL(undefined, 1);
                        $('.film-grain').attr('src', data);
                    }
                    image.src = event.target.result;
                }
            }
            img.attr('src', event.target.result);
        }

        reader.readAsDataURL(file);
    });

    $(document).on('click', 'button[data-target="dismiss-image"]', function () {
        var fileUploader = $(this).parent().closest('.fileUploader');
        fileUploader.find('.finalzone').hide();
        fileUploader.find('.dropzone').show();
        fileUploader.find('#submit-image').hide();
        fileUploader.find('input[type="file"]').val(null);
    });

    $(document).on('click', 'button[data-target="submit-image"]', function () {
        var fileUploader = $(this).parent().closest('.fileUploader');
        var file = fileUploader.find('input[type="file"]')[0].files[0],
            reader = new FileReader();
        reader.onload = function (event) {
            postImage(event.target.result, fileUploader.find('input[type="file"]').val().substring(fileUploader.find('input[type="file"]').val().lastIndexOf('\\') + 1));
        }
        reader.readAsBinaryString(file);
    });
});

function BsToBlob(binaryString) {
    var i, l, array;
    l = binaryString.length;
    array = new Uint8Array(l);
    for (var i = 0; i < l; i++) {
        array[i] = binaryString.charCodeAt(i);
    }
    return new Blob([array], { type: 'application/octet-stream' });
}

function getColorIndicesForCoord(x, y, width) {
    var red = y * (width * 4) + x * 4;
    return [red, red + 1, red + 2, red + 3];
}