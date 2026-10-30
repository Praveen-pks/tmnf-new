// AOS
if (window.AOS) {
    AOS.init({ duration: 700, easing: "ease-out-cubic", once: true, offset: 60 });
    window.addEventListener("load", function () { AOS.refresh(); });
    // Recalculate trigger points when the page height changes (FAQ filters, guide/compare toggles).
    if ("ResizeObserver" in window) {
        var aosRefreshTimer;
        new ResizeObserver(function () {
            clearTimeout(aosRefreshTimer);
            aosRefreshTimer = setTimeout(function () { AOS.refresh(); }, 150);
        }).observe(document.body);
    }
}

// Telemarketing
// Scope to the form the toggle belongs to, so pages with several forms only open one panel.
function setTelemarketing(el, open) {
    var scope = el.closest(".corporate-quote, .callback-panel") || document;
    scope.querySelectorAll(".telemarketing, .telemarketing-ovarlay").forEach(function (item) {
        item.classList.toggle("active", open);
    });
}

document.addEventListener("click", function (e) {
    var toggle = e.target.closest(".telemarketing-toggle");
    if (toggle) {
        var scope = toggle.closest(".corporate-quote, .callback-panel") || document;
        var panel = scope.querySelector(".telemarketing");
        setTelemarketing(toggle, !(panel && panel.classList.contains("active")));
        return;
    }
    var close = e.target.closest(".telemarketing-close");
    if (close) {
        setTelemarketing(close, false);
    }
});

// Request a callback panel
(function () {
    var panel = document.querySelector(".callback-panel");
    var overlay = document.querySelector(".callback-overlay");
    var toggle = document.querySelector(".callback-toggle");
    if (!panel || !toggle) return;

    function setCallbackPanel(open) {
        panel.classList.toggle("active", open);
        panel.setAttribute("aria-hidden", !open);
        toggle.setAttribute("aria-expanded", open);
        document.body.style.overflow = open ? "hidden" : "";
        if (overlay) overlay.classList.toggle("active", open);
        if (open) {
            setTimeout(function () {
                var first = panel.querySelector("input, select, textarea");
                if (first) first.focus();
            }, 300);
        } else {
            setTelemarketing(panel, false);
        }
    }

    toggle.addEventListener("click", function () {
        setCallbackPanel(!panel.classList.contains("active"));
    });

    toggle.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setCallbackPanel(!panel.classList.contains("active"));
        }
    });

    panel.querySelector(".callback-panel__close").addEventListener("click", function () {
        setCallbackPanel(false);
    });

    if (overlay) {
        overlay.addEventListener("click", function () { setCallbackPanel(false); });
    }

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && panel.classList.contains("active")) {
            setCallbackPanel(false);
        }
    });
})();
