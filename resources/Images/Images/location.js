function getCookie(name) {
    var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return v ? v[2] : null;
}

jQuery(document).ready(function($){
    $('#make-my-location').click(function (e) {
        e.preventDefault();
        var locationID = $(this).data('location-id');
        $('#location-top-bar a').fadeOut();

        $.ajax({
            type: "post",
            dataType: "json",
            url: myAjax.ajaxurl,
            data: { action: "set_location", location_id: locationID},
            success: function (response) {
                // console.log(response);
                $('#location-top-bar a').text(response.address.address);
                $('#location-top-bar a').attr('href', response.url);
                $('#location-top-bar a').fadeIn();
                $('#order-now-btn').attr('href', 'https://locations.eltorito.com/order-now/' + response.title.replace(/\s+/g, '-').toLowerCase());
                $('#order-catering-btn').attr('href', 'https://locations.eltorito.com/order-catering/' + response.title.replace(/\s+/g, '-').toLowerCase());
            },
            error: function (jqXHR, textStatus, errorThrown) {
                $('#location-top-bar a').fadeIn();
                console.log(jqXHR);
                console.log(textStatus);
                console.log(errorThrown);
            }
        });
    });

    var hasLocation = (getCookie('xrg_location') ? true : false);
    if (hasLocation) {
        var address = decodeURIComponent(getCookie('xrg_address'));
        var title = decodeURIComponent(getCookie('xrg_location_name'));
        var url = decodeURIComponent(getCookie('xrg_location_url'));
        $('#location-top-bar a').text(address.replace(/\+/g, ' '));
        $('#location-top-bar a').attr('href', url);
        $('#order-now-btn').attr('href', 'https://locations.eltorito.com/order-now/' + title.replace(/\s+/g, '-').toLowerCase());
        $('#order-catering-btn').attr('href', 'https://locations.eltorito.com/order-catering/' + title.replace(/\s+/g, '-').toLowerCase());
    } else {
        $('#location-top-bar a').text("Find a nearby El Torito");
        $('#location-top-bar a').attr('href', '/locations/');
        $('#order-now-btn').attr('href', 'https://locations.eltorito.com/order-now/');
        $('#order-catering-btn').attr('href', 'https://locations.eltorito.com/order-catering/');
    }

    if ($('body').hasClass('tax-menu_categories')) {
        var locationID = (getCookie('xrg_location') ? getCookie('xrg_location') : false );
        var items = [];

        $('.post-grid .menu-item').each(function() {
            items.push( $(this).attr('data-item') );
        });
        if(locationID){
            $.ajax({
                type: "post",
                dataType: "json",
                url: myAjax.ajaxurl,
                data: { 
                    action: "get_menu_prices", 
                    location_id: locationID,
                    menu_items: items
                },
                success: function(response){
                    var items = response.items;
                    for(var property in items) {
                        $('.menu-item[data-item="'+property+'"]').each(function(){
                            $(this).append(items[property]);
                        })
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log(jqXHR);
                    console.log(textStatus);
                    console.log(errorThrown);
                }
            });
        }
    }
});