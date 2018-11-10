var siteURL = 'http://localhost:50411/';
var apiURL = 'http://localhost:50223/WorldApi/';


//   static variables   //
var colorMaxNumber;
var awaitingGetColorResult;
var spriteMaxNumber;
var awaitingGetSpriteResult;
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

function getColors(offset, ammount, onsuccess) {
    $.ajax({
        url: siteURL + 'ColorPalette/_GetColors',
        type: 'GET',
        data: {
            offset: offset,
            ammount:ammount
        },
        datatype: 'json',
        success: function (response) {
            awaitingGetColorResult = false;
            onsuccess(response);
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

function postImage(file, name, onsuccess) {
    $.ajax({
        url: siteURL + 'SpriteBuilder/_PostSprite',
        type: 'POST',
        data: {
            file: file,
            name: name
        },
        datatype: 'json',
        success: function (response) {
            if (response) {
                onsuccess(response);
            }
        },
        error: function (response) {

        }
    });
}

function setSpriteNormalMap(spriteId, normalId, onsuccess) {
    $.ajax({
        url: siteURL + 'SpriteBuilder/_SetSpriteNormal',
        type: 'PUT',
        data: {
            sprite: spriteId,
            normal: normalId
        },
        datatype: 'json',
        success: function (response) {
            if (response) {
                onsuccess(response);
            }
        },
        error: function (response) {

        }
    });
}

function getSprites(offset, ammount, onsuccess) {
    $.ajax({
        url: siteURL + 'SpriteBuilder/_GetSprites',
        type: 'GET',
        data: {
            offset: offset,
            ammount: ammount
        },
        datatype: 'json',
        success: function (response) {
            awaitingGetSpriteResult = false;
            onsuccess(response);
        },
        error: function (response) {
            awaitingGetSpriteResult = false;
        }
    });
}

function getSpriteNum() {
    $.ajax({
        url: siteURL + 'SpriteBuilder/_GetSpriteNumber',
        type: 'GET',
        datatype: 'json',
        success: function (response) {
            spriteMaxNumber = response;
        },
        error: function (response) {
            spriteMaxNumber = 0;
        }
    });
}

function deleteSprite(id) {
    $.ajax({
        url: siteURL + 'SpriteBuilder/_DeleteSprite',
        type: 'DELETE',
        data: {
            id: id
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

function postWorld(layers) {
    let jsonData = JSON.stringify(layers);
    $.ajax({
        url: siteURL + 'WorldBuilder/_PostWorld',
        type: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type':'application/json'
        },
        data: jsonData,
        datatype: 'json',
        success: function (response) {
            if (response) {
                //window.location = siteURL + 'Worlds';
            }
        },
        error: function (response) {

        }
    });
}