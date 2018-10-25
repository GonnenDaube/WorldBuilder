var siteURL = 'http://localhost:50411/';
var apiURL = 'http://localhost:50223/WorldApi/';

function callValues() {
    $.ajax({
        url: siteURL + 'WorldBuilder/_GetValues',
        type: 'GET',
        data: {
            attr1: 5,
            attr2: 6
        },
        datatype: 'json',
        success: function (response) {
            for (let i = 0; i < response.length; i++) {
                alert(response[i]);
            }
        },
        error: function (response) {

        }
    });
}

function postColor(r, g, b, a) {
    $.ajax({
        url: siteURL + 'ColorPalette/_PostColor',
        type: 'POST',
        data: {
            r: r,
            g: g,
            b: b,
            a: a/100
        },
        datatype: 'json',
        success: function (response) {
            if (response)
                window.location = window.location;
        },
        error: function (response) {
        }
    });
}

function getColors() {
    $.ajax({
        url: siteURL + 'ColorPalette/_GetColors',
        type: 'GET',
        datatype: 'json',
        success: function (response) {
            if(response != null)
            for (let i = 0; i < response.length; i++) {
                $('div[data-target="colors"]').append(
                    '<div class="color" data-color-id="'
                    + response[i].item1 + '" style="background-color:rgba('
                    + response[i].item2 + ','
                    + response[i].item3 + ','
                    + response[i].item4 + ','
                    + Number(response[i].item5) + ')"><div class="cross"><div></div><div></div></div></li>');
            }
        },
        error: function (response) {

        }
    });
}

function deleteColor(id) {
    $.ajax({
        url: siteURL + 'ColorPalette/_DeleteColor',
        type: 'DELETE',
        data: {
            id:id
        },
        datatype: 'json',
        success: function (response) {
            if(response)
                window.location = window.location;
        },
        error: function (response) {

        }
    });
}