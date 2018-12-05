var siteURL = 'http://localhost:50411/';
var apiURL = 'http://localhost:50223/api/';


//   static variables   //
var colorMaxNumber;
var awaitingGetColorResult;
var spriteMaxNumber;
var worldMaxNumber;
var awaitingGetSpriteResult;
var awaitingGetWorldsResult;
//

function login(username, password) {
    $.ajax({
        url: siteURL + 'Login/_Login',
        type: 'POST',
        data: {
            username: username,
            password: password
        },
        datatype: 'json',
        success: function (response) {
            if (response)
                window.location = siteURL + 'Home';
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
            else
                window.location = siteURL + "Login";
        },
        error: function (response) {
            window.location = siteURL + "Login";
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
            else
                window.location = siteURL + "Login";
        },
        error: function (response) {

            window.location = siteURL + "Login";
        }
    });
}

function postImage(file, name, hasScript, onsuccess) {
    $.ajax({
        url: siteURL + 'SpriteBuilder/_PostSprite',
        type: 'POST',
        data: {
            file: file,
            name: name,
            script: hasScript
        },
        datatype: 'json',
        success: function (response) {
            if (response) {
                onsuccess(response);
            }
            else
                window.location = siteURL + "Login";
        },
        error: function (response) {

            window.location = siteURL + "Login";
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
            else
                window.location = siteURL + "Login";
        },
        error: function (response) {

            window.location = siteURL + "Login";
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

function getSpritesSources(ids, onsuccess) {
    let jsonData = JSON.stringify(ids);
    $.ajax({
        url: siteURL + 'SpriteBuilder/_GetSpriteSources',
        type: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        data: jsonData,
        datatype: 'json',
        success: function (response) {
            onsuccess(response);
        },
        error: function (response) {
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

function getWorlds(offset, ammount, onsuccess) {
    $.ajax({
        url: siteURL + 'Worlds/_GetWorlds',
        type: 'GET',
        data: {
            offset: offset,
            ammount: ammount
        },
        datatype: 'json',
        success: function (response) {
            awaitingGetWorldsResult = false;
            onsuccess(response);
        },
        error: function (response) {
            awaitingGetWorldsResult = false;
        }
    });
}

function getWorld(id, onsuccess, onerror) {
    $.ajax({
        url: siteURL + 'WorldBuilder/_GetWorld',
        type: 'GET',
        data: {
            id: id
        },
        datatype: 'json',
        success: function (response) {
            if (response !== null || response !== undefined)
                onsuccess(response);
            else {
                onerror();
            }
        },
        error: function (response) {
            onerror();
        }
    });
}

function deleteWorld(id) {
    $.ajax({
        url: siteURL + 'Worlds/_DeleteWorld',
        type: 'DELETE',
        data: {
            id: id
        },
        datatype: 'json',
        success: function (response) {
            if (response)
                window.location = window.location;
            else
                window.location = siteURL + "Login";
        },
        error: function (response) {
            window.location = siteURL + "Login";
        }
    });
}

function getWorldNum() {
    $.ajax({
        url: siteURL + 'Worlds/_GetWorldNumber',
        type: 'GET',
        datatype: 'json',
        success: function (response) {
            worldMaxNumber = response;
        },
        error: function (response) {
            worldMaxNumber = 0;
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
            else
                window.location = siteURL + "Login";
        },
        error: function (response) {
            window.location = siteURL + "Login";
        }
    });
}

function postWorld(world) {
    let jsonData = JSON.stringify(world);
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
                window.location = siteURL + 'Worlds';
            }
            else
                window.location = siteURL + "Login";
        },
        error: function (response) {

            window.location = siteURL + "Login";
        }
    });
}

function updateWorld(world) {
    let jsonData = JSON.stringify(world);
    $.ajax({
        url: siteURL + 'WorldBuilder/_UpdateWorld',
        type: 'PUT',
        data: {
            id: $('[data-world-id]').attr('data-world-id'),
            world: jsonData
        },
        datatype: 'json',
        success: function (response) {
            if (response) {
                window.location = window.location;
            }
            else
                window.location = siteURL + "Login";
        },
        error: function (response) {

            window.location = siteURL + "Login";
        }
    })
}

function postMagic(data, image, name) {
    let jsonData = JSON.stringify(data);
    $.ajax({
        url: siteURL + 'MagicBuilder/_PostMagicType',
        type: 'POST',
        data: {
            name: name,
            image: image,
            data: jsonData
        },
        datatype: 'json',
        success: function (response) {
            if (response) {
                window.location = window.location;
            }
            else
                window.location = siteURL + "Login";
        },
        error: function (response) {

            window.location = siteURL + "Login";
        }
    });
}

function postTrainData(data, m_id) {
    let jsonData = JSON.stringify(data);
    $.ajax({
        url: siteURL + 'MagicBuilder/_PostTrainData',
        type: 'POST',
        data: {
            data: jsonData,
            magic_id: m_id
        },
        datatype: 'json',
        success: function (response) {
            if (response) {
                let count = $('[data-magic-id="' + m_id + '"] .count').text();
                count = Number(count.substring(1, count.indexOf(')')));
                $('[data-magic-id="' + m_id + '"] .count').text('(' + (count + 1) + ')');
                $('[data-target="success"]').show(500);
                setTimeout(function () {
                    $('[data-target="success"]').hide(500);
                }, 500);
            }
            else
                window.location = siteURL + "Login";
        },
        error: function (response) {

            window.location = siteURL + "Login";
        }
    });
}

function getMagicTypes(offset, ammount, onsuccess) {
    $.ajax({
        url: siteURL + 'MagicBuilder/_GetMagicTypes',
        type: 'GET',
        data: {
            offset: offset,
            ammount: ammount
        },
        datatype: 'json',
        success: function (response) {
            awaitingGetMagicTypeResult = false;
            onsuccess(response);
        },
        error: function (response) {
            awaitingGetMagicTypeResult = false;
        }
    });
}

function getMagicTypeNumber() {
    $.ajax({
        url: siteURL + 'MagicBuilder/_GetMagicTypeNumber',
        type: 'GET',
        datatype: 'json',
        success: function (response) {
            magicTypeMaxNumber = response;
        },
        error: function (response) {
            magicTypeMaxNumber = 0;
        }
    });
}

function deleteMagicType(id) {
    $.ajax({
        url: siteURL + 'MagicBuilder/_DeleteMagicType',
        type: 'DELETE',
        data: {
            id: id
        },
        datatype: 'json',
        success: function (response) {
            if (response)
                window.location = window.location;
            else
                window.location = siteURL + "Login";
        },
        error: function (response) {

            window.location = siteURL + "Login";
        }
    });
}

function postNetwork(name, hiddenC, hiddenL) {
    $.ajax({
        url: siteURL + 'Networks/_PostNetwork',
        type: 'POST',
        data: {
            name: name,
            hidden_count: hiddenC,
            hidden_length: hiddenL
        },
        datatype: 'json',
        success: function (response) {
            if (response) {
                window.location = window.location;
            }
            else
                window.location = siteURL + "Login";
        },
        error: function (response) {

            window.location = siteURL + "Login";
        }
    });
}

function getNetworks(offset, ammount, onsuccess) {
    $.ajax({
        url: siteURL + 'Networks/_GetNetworks',
        type: 'GET',
        data: {
            offset: offset,
            ammount: ammount
        },
        datatype: 'json',
        success: function (response) {
            awaitingGetNetworksResult = false;
            onsuccess(response);
        },
        error: function (response) {
            awaitingGetNetworksResult = false;
        }
    });
}


function deleteNetwork(id) {
    $.ajax({
        url: siteURL + 'Networks/_DeleteNetwork',
        type: 'DELETE',
        data: {
            id: id
        },
        datatype: 'json',
        success: function (response) {
            if (response)
                window.location = window.location;
            else
                window.location = siteURL + "Login";
        },
        error: function (response) {
            window.location = siteURL + "Login";
        }
    });
}

function getNetworkNumber() {
    $.ajax({
        url: siteURL + 'Networks/_GetNetworkNumber',
        type: 'GET',
        datatype: 'json',
        success: function (response) {
            networkMaxNumber = response;
        },
        error: function (response) {
            networkMaxNumber = 0;
        }
    });
}

function trainNetwork(id) {
    $.ajax({
        url: siteURL + 'NetworkTrainer/_TrainNetwork',
        type: 'PUT',
        data: {
            id: id
        },
        datatype: 'json',
        success: function (response) {
            if (response) {
                window.location = window.location;
            }
            else
                window.location = siteURL + "Login";
        },
        error: function (response) {
            window.location = siteURL + "Login";
        }
    });
}

function getWorldsByName(name) {
    $.ajax({
        url: siteURL + 'Worlds/_GetWorldsByName',
        type: 'GET',
        data: {
            start: name
        },
        datatype: 'json',
        success: function (response) {
            if (response) {
                $('#world-target option').remove();
                $('[data-target="#world-target"] .search-result').remove();
                for (let i = 0; i < response.length; i++) {
                    $('#world-target').append('<option value="' + response[i].item1 + '">' + response[i].item2 + '</option>');
                    $('[data-target="#world-target"] .search-result-group').append('<button tabindex="0" class="search-result col-lg-12 col-md-12">' + response[i].item2 + '</button');
                }
                if (response.length > 0) {
                    $('#world-target').val(response[0].item1);
                    getPortalsByName(response[0].item1, "");
                }
            }
        },
        error: function (response) {
        }
    });
}

function getPortalsByName(id, name, onsuccess, portal_id) {
    $.ajax({
        url: siteURL + 'Worlds/_GetPortals',
        type: 'GET',
        data: {
            id: id,
            start: name
        },
        datatype: 'json',
        success: function (response) {
            if (response) {
                $('#portal-target option').remove();
                $('[data-target="#portal-target"] .search-result').remove();
                for (let i = 0; i < response.length; i++) {
                    $('#portal-target').append('<option value="' + response[i].item1 + '">' + response[i].item2 + '</option>');
                    $('[data-target="#portal-target"] .search-result-group').append('<button tabindex="0" class="search-result col-lg-12 col-md-12">' + response[i].item2 + '</button');
                }
                if (response.length > 0) {
                    $('#portal-target').val(response[0].item1);
                }
                if (onsuccess !== undefined)
                    onsuccess(portal_id);
            }
        },
        error: function (response) {
        }
    });
}