document.addEventListener("DOMContentLoaded", function () {
    const grids = document.querySelectorAll("[data-testimonials-carousel] .testimonials__grid");
    if (!grids.length || !window.jQuery || !window.jQuery.fn.owlCarousel) return;

    window.jQuery(grids)
        .addClass("owl-carousel")
        .owlCarousel({
            loop: true,
            margin: 24,
            rtl: document.documentElement.dir === "rtl",
            dots: true,
            dotsEach: 1,
            nav: false,
            autoplay: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
            autoplayTimeout: 5000,
            autoplayHoverPause: true,
            smartSpeed: 650,
            responsive: {
                0: {
                    items: 1,
                    margin: 16,
                },
                576: {
                    items: 2,
                },
                992: {
                    items: 3,
                },
                 1200: {
                    items: 4,
                },
            },
        });
});
