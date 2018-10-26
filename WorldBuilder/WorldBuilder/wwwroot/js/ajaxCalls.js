var siteURL = 'http://localhost:50411/';
var apiURL = 'http://localhost:50223/WorldApi/';


//   static variables   //
var colorMaxNumber;
var awaitingGetColorResult;

//

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

function getColors(offset, ammount) {
    $.ajax({
        url: siteURL + 'ColorPalette/_GetColors',
        type: 'GET',
        data: {
            offset: offset,
            ammount:ammount
        },
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
            awaitingGetColorResult = false;
        },
        error: function (response) {
            awaitingGetColorResult = false;
        }
    });
}

function getColorNum() {
    $.ajax({
        url: siteURL + 'ColorPalette/_GetColorNumber',
        type: 'GET',
        datatype: 'json',
        success: function (response) {
            colorMaxNumber = response;
        },
        error: function (response) {
            colorMaxNumber = 0;
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