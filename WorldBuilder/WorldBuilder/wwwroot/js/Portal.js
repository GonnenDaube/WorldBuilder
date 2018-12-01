var portal_start = undefined;
var moving_portal = undefined;

$(document).ready(function () {
    $(document).on('click', '[data-role="isLink"] label', function () {
        $('.link-selector').fadeToggle(250);
    });

    $(document).on('click', '.portal-highlighter', function () {
        if ($(this).is('.active')) {
            $(this).removeClass('active');
            $('body').removeClass('portal-highlight');
        }
        else {
            $(this).addClass('active');
            $('body').addClass('portal-highlight');
        }
    });

    $(document).on('mousedown', '.portal-adder', function () {
        $('body').append('<div data-role="drag-surface" class="full-size" style="z-index:999"></div>');
        $('div[data-role="drag-surface"]').append('<img draggable="false" data-portal class="center image pos-absolute" src="/images/portal_icon.png" style="left: ' + event.clientX + 'px; top: ' + event.clientY + 'px;"/>');
    });

    $(document).on('mousemove', 'div[data-role="drag-surface"]', function (e) {
        $(this).find('img').attr('style', 'left: ' + event.clientX + 'px; top: ' + event.clientY + 'px;');
    });

    $(document).on('mouseup', 'div[data-role="drag-surface"]', function (e) {
        if ($(this).find('[data-portal]').length > 0) {
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

            let name = $('[data-role="portal-name"]').val();

            if ((posX > zoneX && posX < zoneX + width) &&
                (posY > zoneY && posY < zoneY + height)) {
                //in range
                let portal = {
                    name: name,
                    x: 100 * (posX - zoneX) / width + offset,
                    y: 100 * (posY - zoneY) / height
                };

                if ($('[data-role="isLink"] input').is(':checked')) {
                    portal['link'] = {
                        world_target: $('#world-target').val(),
                        portal_target: $('#portal-target').val()
                    };
                }
                layers[4].portals.push(portal);
                $('.layer' + 4 + ':not(.handle)').append('<div draggable="false" class="portal pos-absolute" style="left: ' + (portal.x - offset) + '%; top: ' + portal.y
                    + '%; width: 10%; padding-top:10%; transform: translateX(-50%) translateY(-50%); z-index:999"/>');
            }

            $(this).remove();
        }
    });

    $(document).on('click', '.portal', function (e) {
        $('.portal').removeClass('active');
        $(this).addClass('active');
        let edit_portal = $('.portal').index($(this));
        $('[data-role="portal-name"]').val(layers[4].portals[edit_portal].name);
        if (layers[4].portals[edit_portal].link != undefined) {
            let world_target = layers[4].portals[edit_portal].link.world_target;
            let portal_target = layers[4].portals[edit_portal].link.portal_target;
            $('#world-target').val(world_target);
            $('#portal-target').val(portal_target);
            $('[data-target="#world-target"] input').val($('#world-target option:selected').text());
            getPortalsByName(world_target, "", setPortal, portal_target);
        }
        else {
            if($('[data-role="isLink"] input:checked').length)
                $('[data-role="isLink"] label').trigger('click');
        }
        e.stopImmediatePropagation();
    });

    $(document).on('click', ':not(.portal)', function (e) {
        if ($('.portal').hasClass('active')) {//TODO: fix issue with select
            if ($(this).is('aside') || $(this).parents('aside').length) {
            }
            else
                $('.portal').removeClass('active');
        }
        e.stopPropagation();
    });

    $(document).on('mousedown', '.portal', function (e) {
        moving_portal = $('.portal').index($(this));
        let left = layers[4].portals[moving_portal].x;
        let top = layers[4].portals[moving_portal].y;
        $('#sprite-editor-zone').find('*').remove();
        start = {
            x: e.clientX,
            y: e.clientY,
            ix: left,
            iy: top
        };
    });

    $(document).on('mousemove', 'body', function (e) {
        if (moving_portal != undefined) {
            movePortal(e);
        }
    });

    $(document).on('mouseup', 'body', function () {
        moving_portal = undefined;
        portal_start = undefined;
    });

    $(document).on('change', '[data-role="portal-name"]', function () {
        if ($('.portal.active').length > 0) {
            let edit_portal = $('.portal').index($('.portal.active'));
            layers[4].portals[edit_portal].name = $(this).val();
        }
    });

    $(document).on('click', '[data-role="isLink"] label', function () {
        if ($('.portal.active').length > 0) {
            let edit_portal = $('.portal').index($('.portal.active'));
            if ($('[data-role="isLink"] input').is(':checked')) {
                delete layers[4].portals[edit_portal]['link'];
            }
            else {
                if (layers[4].portals[edit_portal].link == undefined) {
                    let world_target = $('#world-target').val();
                    let portal_target = $('#portal-target').val();
                    layers[4].portals[edit_portal]['link'] = {
                        world_target: world_target,
                        portal_target: portal_target
                    };
                }
            }
        }
    });

    $(document).on('keydown', '[data-target="#world-target"] input', function () {
        getWorldsByName($(this).val());
    });

    $(document).on('click', '[data-target="#world-target"] input', function () {
        getWorldsByName($(this).val());
    });

    $(document).on('keydown', '[data-target="#portal-target"] input', function () {
        getPortalsByName($('#world-target').val(), $(this).val());
    });

    $(document).on('click', '[data-target="#portal-target"] input', function () {
        getPortalsByName($('#world-target').val(), $(this).val());
    });

    $(document).on('click', '[data-target="#world-target"] button', function () {
        let index = $(this).index();
        let value = $('#world-target option')[index].value;
        $('#world-target').val(value);
        let text = $(this).text();
        $('[data-target="#world-target"] input').val(text);
        $(this).blur();
        $('#world-target').trigger('change');
    });

    $(document).on('click', '[data-target="#portal-target"] button', function () {
        let index = $(this).index();
        let value = $('#portal-target option')[index].value;
        $('#portal-target').val(value);
        let text = $(this).text();
        $('[data-target="#portal-target"] input').val(text);
        $(this).blur();
        $('#portal-target').trigger('change');
    });

    $(document).on('change', '#world-target', function () {
        if ($('.portal.active').length > 0) {
            let edit_portal = $('.portal').index($('.portal.active'));
            layers[4].portals[edit_portal].link.world_target = $(this).val();
        }
        $('[data-target="#world-target"] input').val($(this).find('option[value="' + $(this).val() + '"]').text());
    });

    $(document).on('change', '#portal-target', function () {
        if ($('.portal.active').length > 0) {
            let edit_portal = $('.portal').index($('.portal.active'));
            layers[4].portals[edit_portal].link.portal_target = $(this).val();
        }
    });
});

function movePortal(e) {
    let left = getScrollLeft();
    let offset = (layers[4].size - 100) * left / 100;
    let posX = e.clientX - start.x;//calculate the distance the mouse moved from mousedown event to current position
    let posY = e.clientY - start.y;
    posX *= 100 / $('#background').width();
    posY *= 100 / $('#background').height();
    layers[4].portals[moving_portal].x = start.ix + posX;//set the image pos as the initial pos + the distance the mouse moved
    layers[4].portals[moving_portal].y = start.iy + posY;
    updatePortal(layers[4].portals[moving_portal], $($('.layer.layer' + 4 + ' .portal')[moving_portal]), offset);
}

function updatePortal(portalObject, portalElement, offset) {
    portalElement.attr('style', 'left: '
        + (portalObject.x - offset) + '%; top: '
        + portalObject.y + '%; width: 10%; padding-top: 10%; transform: translateX(-50%) translateY(-50%); z-index: 999');
}

function setPortal(id) {
    $('#portal-target').val(id);
    $('[data-target="#portal-target"] input').val($('#portal-target option:selected').text());
    if ($('[data-role="isLink"] input:not(:checked)').length)
        $('[data-role="isLink"] label').trigger('click');
}