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
            if (response == 1)
                alert("Successful");
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
            for (let i = 0; i < response.length; i++) {
                $('ul[data-target="colors"]').append('<li style="background-color:rgba(' + response[i].item1 + ',' + response[i].item2 + ',' + response[i].item3 + ',' + Number(response[i].item4) + ')"></li>');
            }
        },
        error: function (response) {

        }
    });
}