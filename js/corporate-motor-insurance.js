document.addEventListener("DOMContentLoaded", function () {
    const fleetTypeButtons = Array.from(document.querySelectorAll("[data-fleet-type]"));
    const fleetCounter = document.querySelector("[data-fleet-counter]");
    const vehicleCount = document.querySelector("[data-fleet-count-value]");
    const vehicleCountInput = document.querySelector("[data-fleet-count-input]");

    function setFleetType(type) {
        const isFleet = type === "fleet";
        fleetTypeButtons.forEach(function (button) {
            const active = button.dataset.fleetType === type;
            button.classList.toggle("is-active", active);
            button.setAttribute("aria-pressed", String(active));
        });
        if (fleetCounter) fleetCounter.hidden = !isFleet;
        if (vehicleCountInput) vehicleCountInput.disabled = !isFleet;
    }

    fleetTypeButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            setFleetType(button.dataset.fleetType);
        });
    });

    if (vehicleCount && vehicleCountInput) {
        document.querySelectorAll("[data-fleet-count]").forEach(function (button) {
            button.addEventListener("click", function () {
                const current = Number(vehicleCountInput.value) || 1;
                const next = button.dataset.fleetCount === "increase" ? Math.min(current + 1, 999) : Math.max(current - 1, 1);
                vehicleCountInput.value = String(next);
                vehicleCount.textContent = String(next);
            });
        });
    }

    const carouselElement = document.querySelector("[data-corporate-audience-carousel]");
    if (!carouselElement || !window.jQuery || !window.jQuery.fn.owlCarousel) return;

    const $carousel = window.jQuery(carouselElement);
    const $slides = $carousel.children("article");
    const totalSlides = $slides.length;
    const status = document.querySelector("[data-audience-status]");

    $slides.each(function (index) {
        this.dataset.slideIndex = String(index);
    });

    function updateCarouselStatus(event) {
        const carousel = event.relatedTarget;
        const activeSlides = carouselElement.querySelectorAll(".owl-item.active");
        carouselElement.querySelectorAll(".owl-item").forEach(function (item) {
            item.setAttribute("aria-hidden", String(!item.classList.contains("active")));
        });

        if (!status || !activeSlides.length || !carousel) return;
        const firstSlide = activeSlides[0].querySelector("[data-slide-index]");
        const lastSlide = activeSlides[activeSlides.length - 1].querySelector("[data-slide-index]");
        if (!firstSlide || !lastSlide) return;
        const first = Number(firstSlide.dataset.slideIndex) + 1;
        const last = Number(lastSlide.dataset.slideIndex) + 1;
        status.textContent = first <= last ? first + "–" + last + " of " + totalSlides : first + " of " + totalSlides;
    }

    $carousel
        .on("initialized.owl.carousel translated.owl.carousel refreshed.owl.carousel", updateCarouselStatus)
        .owlCarousel({
            items: 1,
            margin: 16,
            rtl: document.documentElement.dir === "rtl",
            loop: true,
            rewind: false,
            slideBy: 1,
            dots: false,
            nav: false,
            autoplay: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
            autoplayTimeout: 4000,
            autoplayHoverPause: true,
            smartSpeed: 450,
            touchDrag: true,
            mouseDrag: true,
            responsive: {
                640: { items: 2, margin: 18 },
                992: { items: 3, margin: 20 },
                1400: { items: 4, margin: 24 }
            }
        });

    const previousButton = document.querySelector("[data-audience-prev]");
    const nextButton = document.querySelector("[data-audience-next]");
    if (previousButton) previousButton.addEventListener("click", function () { $carousel.trigger("prev.owl.carousel"); });
    if (nextButton) nextButton.addEventListener("click", function () { $carousel.trigger("next.owl.carousel"); });

    carouselElement.addEventListener("keydown", function (event) {
        if (event.target.matches("input, textarea, select, button, a")) return;
        if (event.key === "ArrowLeft") {
            event.preventDefault();
            $carousel.trigger("prev.owl.carousel");
        } else if (event.key === "ArrowRight") {
            event.preventDefault();
            $carousel.trigger("next.owl.carousel");
        }
    });
});
