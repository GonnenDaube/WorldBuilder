
var networkMaxNumber;
var awaitingGetNetworksResult = false;

$(document).ready(function () {
    if (window.location.pathname.includes('/Networks')) {
        getNetworks(0, 10, loadNetworksToContent);
        getNetworkNumber();
    }

    $(document).on('click', '[data-trigger="create-new-network"]', function () {
        var name = $('[data-target="net-name"]').val();
        var hidden_count = Number($('#hidden-layer-count').text());
        var hidden_length = Number($('#hidden-layer-length').text());
        postNetwork(name, hidden_count, hidden_length);
    });

    $(document).on('click', '[data-remove="network"]', function () {
        let card = $(this).parent().closest('.card');
        let id = card.attr('data-network-id');
        deleteNetwork(id);
    });

    $(document).on('click', '#newNetworkModal [data-dismiss="modal"]', function () {
        $('[data-target="net-name"]').val('');
        $('#hidden-layer-count').text(0);
        $('#hidden-layer-length').text(0);
        $('.slider .handle').attr('style', 'left:0%');
    });

    $(document).on('mousewheel', 'content[data-target="networks"]', function () {
        if ($(this).scrollTop() + $(this).height() == $(this).prop('scrollHeight')) {
            //if reached bottom of element, load more
            if ($(this).find('[data-world-id]').length < networkMaxNumber)
                if (!awaitingGetNetworksResult) {
                    awaitingGetNetworksResult = true;
                    getNetworks($(this).find('[data-world-id]').length, 10, loadNetworksToContent);
                }
        }
    });
});

function loadNetworksToContent(response) {
    if (response != null) {
        for (let i = 0; i < response.length; i++) {
            $('content[data-target="networks"]').append(
                '<div class="card" data-network-id="'
                + response[i].item1 + '"><label class="col-lg-6 col-md-6">'
                + response[i].item2 + '</label><div class="options col-lg-6 col-md-6 float-right"><a href="'
                + ("NetworkTrainer/Train/" + response[i].item1) + '"><i class="font-24 fas fa-dumbbell"></i></a>'
                + '<a data-remove="network" class="danger" href="javascript:void(0)"><i class="font-24 fas fa-trash"></i></a></div></div>');//TODO: implement remove network
        }
    }
}