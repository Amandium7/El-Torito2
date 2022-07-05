function getCookie(name) {
    var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return v ? v[2] : null;
}
function setCookie(cookiename, cookievalue, hours) {
    var date = new Date();
    date.setTime(date.getTime() + Number(hours) * 3600 * 1000);
    document.cookie = cookiename + "=" + cookievalue + "; path=/;expires = " + date.toGMTString();
}

jQuery(document).ready(function($) {
    var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };

    if(!getCookie('xrg_location')) {
        $('.location-popup').show();
    }

    function setGPS() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(setGPSCookie, error, options);
        }
        else {
            console.log("NO GPS");
        }
    }

    function error(err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);

        if ($('body').hasClass('tax-menu_categories')) {
            var location = window.location;
            var newURL = location.protocol + "//" + location.hostname + "/locations/";
            // console.log(newURL);
            window.location = newURL;
        }
    }

    function setGPSCookie(position) {
        var crd = position.coords;

        // console.log('Your current position is:');
        // console.log(`Latitude : ${crd.latitude}`);
        // console.log(`Longitude: ${crd.longitude}`);
        // console.log(`More or less ${crd.accuracy} meters.`);

        document.cookie = "latitude=" + crd.latitude;
        document.cookie = "longitude=" + crd.longitude;

        var locations = $.ajax({
            type: "post",
            dataType: "json",
            url: myAjax.ajaxurl,
            data: { action: "get_locations"},
            error: function (jqXHR, textStatus, errorThrown) {
                // console.log(jqXHR);
                // console.log(textStatus);
                // console.log(errorThrown);
            }
        });

        locations.done(function(data){
            var origin = {lat: getCookie('latitude'), lng: getCookie('longitude')};
            var destinations = [];
            var distances = [];

            function getCrowsFlightDistance(lat1, lng1, lat2, lng2) {
                if ((lat1 == lat2) && (lng1 == lng2)) {
                    return 0;
                }
                else {
                    var radlat1 = Math.PI * lat1/180;
                    var radlat2 = Math.PI * lat2/180;
                    var theta = lng1-lng2;
                    var radtheta = Math.PI * theta/180;
                    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
                    if (dist > 1) {
                        dist = 1;
                    }
                    dist = Math.acos(dist);
                    dist = dist * 180/Math.PI;
                    dist = dist * 60 * 1.1515;
                    return dist;
                }
            }

            // create crows flight distance matrix
            for(var location in data) {
                distances.push(
                    [
                        location,
                        getCrowsFlightDistance(origin.lat, origin.lng, data[location].lat, data[location].lng)
                    ]
                );
            }

            // sort locations by numberic distances first
            function sortDistance(a, b) {
                return a[1] - b[1];
            }
            sortedLocations = distances.sort(sortDistance);

            // format distances into string
            function formatDistance(loc) {
                return [loc[0], loc[1].toFixed(1) + " mi"];
            }
            sortedLocations = sortedLocations.map(formatDistance);

            // reusing original code - should flow normally
            var closestLocation = getClosestLocation(sortedLocations);
            setCookie('sorted_locations', JSON.stringify(sortedLocations), 1);

            // changed behavior - if a location is saved, it will not get overwritten            
            var userFavorite = getCookie('xrg_location');
            //if(!userFavorite) {
                setCookie('closest_location', JSON.stringify(closestLocation), 1);
                userFavorite = closestLocation[0];
            //}

            $.ajax({
                type: "post",
                dataType: "json",
                url: myAjax.ajaxurl,
                data: { action: "set_location", location_id: parseInt(userFavorite)},
                success: function (response) {
                    // console.log(response);
                    $('#location-top-bar a').text(response.address.address);
                    $('#location-top-bar a').attr('href', response.url);
                    $('#location-top-bar a').fadeIn();
                    $('#order-now-btn').attr('href', 'https://locations.eltorito.com/order-now/' + response.title.replace(/\s+/g, '-').toLowerCase());
                    $('#order-catering-btn').attr('href', 'https://locations.eltorito.com/order-catering/' + response.title.replace(/\s+/g, '-').toLowerCase());
                    $('.location-popup').hide();

                    if($('body').hasClass('template-locations')) {
                        reorderLocations(sortedLocations);
                    }                                        

                    if ($('body').hasClass('tax-menu_categories')) {
                        var locationID = userFavorite;
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
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    $('#location-top-bar a').fadeIn();
                    console.log(jqXHR);
                    console.log(textStatus);
                    console.log(errorThrown);
                }
            });
        });
    }    

    function getClosestLocation(distances) {
        return distances[0];
    }

    function reorderLocations(distances) {
        var distanceIDs = distances.map(x => parseInt(x[0]));
        var distanceMiles = distances.map(x => x[1]);
        $.ajax({
            type: "post",
            dataType: "json",
            url: myAjax.ajaxurl,
            data: { action: "reorder_locations", ids: distanceIDs, miles: distanceMiles},
            success: function (response) {
                // console.log(response);
                $('.locations').html(response);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                $('#location-top-bar a').fadeIn();
                console.log(jqXHR);
                console.log(textStatus);
                console.log(errorThrown);
            }
        });
    }

    if ($('body').hasClass('home') || $('body').hasClass('template-locations')){
        setGPS();
    }

    if( $('body').hasClass('template-locations') && getCookie('sorted_locations')) {
        var sortedLocations = JSON.parse(getCookie('sorted_locations'));
        reorderLocations(sortedLocations);
    }
    $('#find-your-location').click(function(e){
        e.preventDefault();
        setGPS();
    });

});