document.addEventListener("DOMContentLoaded", function () {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Brand video: muted autoplay while on screen, with a pause/play control (WCAG 2.2.2).
    const video = document.querySelector("[data-about-video]");
    const videoToggle = document.querySelector("[data-about-video-toggle]");
    if (video && videoToggle) {
        let pausedByUser = reducedMotion.matches;

        function syncVideoToggle() {
            const paused = video.paused;
            videoToggle.classList.toggle("is-paused", paused);
            videoToggle.setAttribute("aria-label", paused ? "Play video" : "Pause video");
        }

        function playVideo() {
            const attempt = video.play();
            if (attempt && attempt.catch) attempt.catch(syncVideoToggle);
        }

        video.addEventListener("play", syncVideoToggle);
        video.addEventListener("pause", syncVideoToggle);
        videoToggle.addEventListener("click", function () {
            pausedByUser = !video.paused;
            if (pausedByUser) video.pause();
            else playVideo();
        });

        if ("IntersectionObserver" in window) {
            new IntersectionObserver(function (entries) {
                if (entries[0].isIntersecting && !pausedByUser) playVideo();
                else if (!entries[0].isIntersecting) video.pause();
            }, { threshold: 0.25 }).observe(video);
        } else if (!pausedByUser) {
            playVideo();
        }
        syncVideoToggle();
    }

    // "144 years in the making" timeline: auto-sliding, the centred milestone is the active one.
    const timeline = document.querySelector("[data-about-timeline]");
    if (!timeline || !window.jQuery || !window.jQuery.fn.owlCarousel) return;

    const $timeline = window.jQuery(timeline);
    const $milestones = $timeline.children("article");
    const startIndex = Math.max(0, $milestones.index($milestones.filter("[data-timeline-start]")));

    $milestones.each(function (index) {
        this.dataset.slideIndex = String(index);
    });

    function updateTimelineState() {
        timeline.querySelectorAll(".owl-item").forEach(function (item) {
            const isClone = item.classList.contains("cloned");
            const trigger = item.querySelector(".about-timeline__trigger");
            item.setAttribute("aria-hidden", String(isClone));
            if (!trigger) return;
            trigger.tabIndex = isClone ? -1 : 0;
            if (item.classList.contains("center")) trigger.setAttribute("aria-current", "step");
            else trigger.removeAttribute("aria-current");
        });
    }

    $timeline
        .on("initialized.owl.carousel translated.owl.carousel refreshed.owl.carousel", updateTimelineState)
        .owlCarousel({
            items: 2,
            center: true,
            loop: true,
            startPosition: startIndex,
            rtl: document.documentElement.dir === "rtl",
            dots: false,
            nav: false,
            autoplay: !reducedMotion.matches,
            autoplayTimeout: 4000,
            autoplayHoverPause: true,
            smartSpeed: 700,
            touchDrag: true,
            mouseDrag: true,
            responsive: {
                768: { items: 3 },
                1200: { items: 4 }
            }
        });

    // Selecting a year (click / Enter / Space) brings that milestone to the centre.
    timeline.addEventListener("click", function (event) {
        const trigger = event.target.closest(".about-timeline__trigger");
        if (!trigger) return;
        const milestone = trigger.closest("[data-slide-index]");
        if (milestone) $timeline.trigger("to.owl.carousel", [Number(milestone.dataset.slideIndex), 700]);
    });

    // Hold the autoplay while keyboard users are inside the carousel.
    timeline.addEventListener("focusin", function () {
        $timeline.trigger("stop.owl.autoplay");
    });
    timeline.addEventListener("focusout", function (event) {
        if (!reducedMotion.matches && !timeline.contains(event.relatedTarget)) $timeline.trigger("play.owl.autoplay");
    });

    timeline.addEventListener("keydown", function (event) {
        if (event.key === "ArrowLeft") {
            event.preventDefault();
            $timeline.trigger("prev.owl.carousel");
        } else if (event.key === "ArrowRight") {
            event.preventDefault();
            $timeline.trigger("next.owl.carousel");
        }
    });

    reducedMotion.addEventListener("change", function (event) {
        $timeline.trigger(event.matches ? "stop.owl.autoplay" : "play.owl.autoplay");
    });
});
