jQuery(document).ready((function(e){e(".hamburger-menu").click((function(){e(this).toggleClass("open"),e(this).parent().toggleClass("nav-open")})),e(".image-slider--container").slick({speed:800,accessibility:!1,appendArrows:".image-slider--arrows",arrows:!0,prevArrow:'<button type="button" class="slick-prev"><span class="screen-reader-text">Previous</span><img src="/wp-content/themes/xrg-el-torito-theme/img/slick-arrow-prev-white.svg" alt="" /></button>',nextArrow:'<button type="button" class="slick-next"><span class="screen-reader-text">Next</span><img src="/wp-content/themes/xrg-el-torito-theme/img/slick-arrow-next-white.svg" alt="" /></button>',infinite:!1}),e(".slick-hero").slick({arrows:!1,dots:!0,infinite:!0,autoplay:!0,fade:!0,speed:1200,autoplaySpeed:4200,slidesToShow:1,slidesToScroll:1,draggable:!1}),e("body").hasClass("single-specials")&&e(".menu-item-676").addClass("current-menu-parent"),e("body").hasClass("tax-menu_categories")&&e(".menu-item-602").addClass("current-menu-parent"),e(window).scroll((function(){e(document).scrollTop()>45?(e("#header, #sticky-footer").addClass("sticky"),e("body").addClass("has-sticky-nav")):(e("#header, #sticky-footer").removeClass("sticky"),e("body").removeClass("has-sticky-nav"))})),e("#menu-categories").selectmenu({position:{at:"left bottom--5",of:".menu-categories-dropdown"},appendTo:".menu-categories-dropdown",icons:{button:"ns-arrow-down"},change:function(e,t){var o=t.item.value;window.location.href="/menu-categories/"+o}});var o=e("#reservation-modal"),n=e(".menu-buttons li:last-child a"),i=e("#reservation-modal .close");n.click((function(e){e.preventDefault(),o.css("display","block")})),i.click((function(){o.css("display","none")}));var r=!1;e(window).scroll((function(e){r||window.requestAnimationFrame((function(){l(),r=!1})),r=!0}));var c=e(".ns-fade").data("target");function l(){!function(e){for(var t,o,s,n,a=jQuery(".ns-fade "+e),i=0;i<a.length;i++){var r=jQuery(a[i]);t=void 0,o=void 0,s=void 0,n=void 0,o=(t=r[0].getBoundingClientRect()).top,s=t.bottom,o+(n=t.height)>=0&&n+window.innerHeight>=s?(r.removeClass("fade-deactive"),r.addClass("fade-active")):(r.removeClass("fade-active"),r.addClass("fade-deactive"))}}(c)}e().ready(l),e(".location-popup .close").click((function(){e(".location-popup").fadeOut()})),e("body").removeClass("loading-js"),setTimeout((function(){e("body").css("overflow","auto"),e(".loading-screen").css("visibility","hidden")}),2e3)}));

/*
    XRG Utilities
    by Alex Szeto
*/
function getParameterByName(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

jQuery(function() {

    // Client Side Time Gate
    //
    // Usage: set element class to xrg-client-timegate, use show-before or show-after attribute to control timed visibility. 
    //        Can use CSS display:none or hidden attribute to do the initial hiding
    // Test: set query param xrgtestdate to test date
    // Note: content is viewable via source, do not use this method for sensitive content
    var currentTime = getParameterByName("xrgtestdate");
    currentTime = currentTime ? new Date(currentTime).getTime() : new Date().getTime();
    jQuery('.xrg-client-timegate').each(function(index) {
        var timeGatedObject = jQuery(this);
        var showBefore = new Date(timeGatedObject.attr('show-before')).getTime();
        var showAfter = new Date(timeGatedObject.attr('show-after')).getTime();
        if((isNaN(showBefore) || currentTime < showBefore) && (isNaN(showAfter) || currentTime >= showAfter)) {
            if(timeGatedObject.attr('hidden')) {
                timeGatedObject.removeAttr('hidden');
            } else {
                timeGatedObject.show();
            }
        }
    });
});

/* Holidays POPUPs
jQuery(document).ready(function(){
    jQuery("a:contains(Order Now)").click(function(e){
        e.preventDefault();
        jQuery('#holiday-special-modal').css('display', 'block');
    });

    jQuery("a:contains(Order Online)").click(function(e){
        e.preventDefault();
        jQuery('#holiday-special-modal').css('display', 'block');
    });

    jQuery("a:contains(Order Catering)").click(function(e){
        e.preventDefault();
        jQuery('#holiday-special-modal').css('display', 'block');
    });

    jQuery("#holiday-special-modal .close").click(function () {
        jQuery('#holiday-special-modal').css('display', 'none');
    });
});  */