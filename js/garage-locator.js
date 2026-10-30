document.addEventListener("DOMContentLoaded", function () {
    // "Select Area": show one region card, or all of them.
    const filter = document.querySelector("[data-garage-filter]");
    const regions = Array.from(document.querySelectorAll("[data-garage-region]"));
    const status = document.querySelector("[data-garage-status]");
    if (!filter || !regions.length) return;

    function applyFilter() {
        const area = filter.value;
        let shown = 0;
        regions.forEach(function (region) {
            const visible = area === "all" || region.dataset.garageRegion === area;
            region.hidden = !visible;
            if (visible) shown += region.querySelectorAll(".garage-card").length;
        });
        if (status) {
            const label = filter.options[filter.selectedIndex].text;
            status.textContent = shown + " garages shown" + (area === "all" ? "" : " in " + label);
        }
    }

    filter.addEventListener("change", applyFilter);
    // Restore a selection kept by the browser on back/forward navigation.
    if (filter.value !== "all") applyFilter();
});
