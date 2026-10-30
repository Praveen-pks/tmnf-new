document.addEventListener("DOMContentLoaded", function () {
    const compareButtons = document.querySelectorAll("[data-compare-filter]");
    const compareRows = document.querySelectorAll("[data-compare-category]");
    const compareExpandRow = document.querySelector("[data-compare-expand-row]");
    const compareExpandButton = document.querySelector("[data-compare-expand]");
    const compareFeatureCount = document.querySelector("[data-compare-feature-count]");
    const compareExpandLabel = document.querySelector("[data-compare-expand-label]");
    const compareExpandIcon = document.querySelector("[data-compare-expand-icon]");
    const compareFeatureList = document.querySelector("#compareFeatures");
    const collapsedCompareRowCount = Number(compareFeatureList?.dataset.collapsedRows) || 11;
    let selectedCompareCategory = "all";
    let compareTableExpanded = false;

    function updateCompareTable() {
        const matchingRows = Array.from(compareRows).filter(function (row) {
            return selectedCompareCategory === "all" || row.dataset.compareCategory === selectedCompareCategory;
        });

        matchingRows.forEach(function (row, index) {
            row.hidden = !compareTableExpanded && index >= collapsedCompareRowCount;
        });
        compareRows.forEach(function (row) {
            if (!matchingRows.includes(row)) row.hidden = true;
        });

        if (compareFeatureCount) compareFeatureCount.textContent = String(matchingRows.length);
        if (compareExpandRow) compareExpandRow.hidden = matchingRows.length <= collapsedCompareRowCount;
        if (compareExpandButton) compareExpandButton.setAttribute("aria-expanded", String(compareTableExpanded));
        if (compareExpandLabel) compareExpandLabel.textContent = compareTableExpanded ? "Show fewer" : "Show all";
        if (compareExpandIcon) compareExpandIcon.textContent = compareTableExpanded ? "↑" : "↓";
    }

    compareButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            selectedCompareCategory = button.dataset.compareFilter;
            compareButtons.forEach(function (item) {
                const active = item === button;
                item.classList.toggle("is-active", active);
                item.setAttribute("aria-pressed", String(active));
            });
            updateCompareTable();
        });
    });
    if (compareExpandButton) {
        compareExpandButton.addEventListener("click", function () {
            compareTableExpanded = !compareTableExpanded;
            updateCompareTable();
        });
    }
    updateCompareTable();

    const guideToggle = document.querySelector("[data-guide-toggle]");
    const guideExtra = document.querySelector("[data-guide-extra]");
    const guidePreview = document.querySelector("[data-guide-preview]");
    const guideToggleLabel = document.querySelector("[data-guide-toggle-label]");
    if (guideToggle && guideExtra && guidePreview) {
        guideToggle.addEventListener("click", function () {
            const expanded = guideToggle.getAttribute("aria-expanded") === "true";
            guideToggle.setAttribute("aria-expanded", String(!expanded));
            guideExtra.hidden = expanded;
            guidePreview.classList.toggle("is-expanded", !expanded);
            if (guideToggleLabel) guideToggleLabel.textContent = expanded ? "Read the full guide" : "Show less";
        });
    }

    const filterButtons = document.querySelectorAll("[data-faq-filter]");
    const faqItems = document.querySelectorAll("[data-faq-category]");
    const faqList = document.querySelector(".car-faq__list");
    const faqColumns = faqList ? Array.from(faqList.querySelectorAll(".car-faq__column")) : [];
    let faqOpenTimeout = null;
    if (!filterButtons.length || !faqItems.length) return;

    function updateFaqLayout() {
        const visibleItems = Array.from(faqItems).filter(function (item) {
            return !item.hidden;
        });
        if (!faqList || faqColumns.length !== 2) return;

        faqList.classList.toggle("is-single-result", visibleItems.length === 1);
        faqColumns.forEach(function (column) {
            column.replaceChildren();
        });
        const splitIndex = Math.ceil(visibleItems.length / 2);
        visibleItems.forEach(function (item, index) {
            faqColumns[index < splitIndex ? 0 : 1].append(item);
        });
        Array.from(faqItems)
            .filter(function (item) {
                return item.hidden;
            })
            .forEach(function (item) {
                faqColumns[0].append(item);
            });
    }

    function animateFaqToggle(item) {
        const answer = item.querySelector("p");
        if (!answer) {
            item.open = !item.open;
            return;
        }
        if (item.dataset.animating === "true") return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            item.open = !item.open;
            return;
        }

        const computed = window.getComputedStyle(answer);
        const marginTop = computed.marginTop;
        const marginBottom = computed.marginBottom;
        const closing = item.open;
        item.dataset.animating = "true";
        answer.style.overflow = "hidden";
        answer.style.transition = "height 300ms ease, opacity 240ms ease, margin 300ms ease";

        function finish() {
            answer.removeEventListener("transitionend", item.faqTransitionEnd);
            answer.removeAttribute("style");
            delete item.faqTransitionEnd;
            delete item.dataset.animating;
        }
        function onTransitionEnd(event) {
            if (event.target !== answer || event.propertyName !== "height") return;
            if (closing) item.open = false;
            else answer.style.height = "auto";
            finish();
        }

        item.faqTransitionEnd = onTransitionEnd;
        answer.addEventListener("transitionend", item.faqTransitionEnd);
        if (item.open) {
            answer.style.height = answer.scrollHeight + "px";
            answer.style.opacity = "1";
            answer.offsetHeight;
            answer.style.height = "0px";
            answer.style.opacity = "0";
            answer.style.marginTop = "0px";
            answer.style.marginBottom = "0px";
        } else {
            item.open = true;
            answer.style.height = "0px";
            answer.style.opacity = "0";
            answer.style.marginTop = "0px";
            answer.style.marginBottom = "0px";
            answer.offsetHeight;
            requestAnimationFrame(function () {
                answer.style.height = answer.scrollHeight + "px";
                answer.style.opacity = "1";
                answer.style.marginTop = marginTop;
                answer.style.marginBottom = marginBottom;
            });
        }
    }

    faqItems.forEach(function (item) {
        const summary = item.querySelector("summary");
        if (summary) {
            summary.addEventListener("click", function (event) {
                event.preventDefault();
                if (
                    Array.from(faqItems).some(function (faqItem) {
                        return faqItem.dataset.animating === "true";
                    })
                )
                    return;

                if (!item.open) {
                    const openItems = Array.from(faqItems).filter(function (otherItem) {
                        return otherItem !== item && otherItem.open;
                    });
                    if (openItems.length) {
                        openItems.forEach(animateFaqToggle);
                        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                            animateFaqToggle(item);
                        } else {
                            clearTimeout(faqOpenTimeout);
                            faqOpenTimeout = setTimeout(function () {
                                if (!item.hidden) animateFaqToggle(item);
                            }, 320);
                        }
                        return;
                    }
                }
                animateFaqToggle(item);
            });
        }
    });

    filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            const category = button.dataset.faqFilter;
            clearTimeout(faqOpenTimeout);
            faqItems.forEach(function (item) {
                if (!item.open) return;
                const answer = item.querySelector("p");
                if (answer && item.faqTransitionEnd) {
                    answer.removeEventListener("transitionend", item.faqTransitionEnd);
                    answer.removeAttribute("style");
                    delete item.faqTransitionEnd;
                    delete item.dataset.animating;
                }
                item.open = false;
            });
            filterButtons.forEach(function (item) {
                const active = item === button;
                item.classList.toggle("is-active", active);
                item.setAttribute("aria-pressed", String(active));
            });
            faqItems.forEach(function (item) {
                item.hidden = category !== "all" && !item.dataset.faqCategory.split(/\s+/).includes(category);
            });
            updateFaqLayout();
        });
    });

    filterButtons.forEach(function (button) {
        button.setAttribute("aria-pressed", String(button.classList.contains("is-active")));
    });
    const initialFaqCategory = Array.from(filterButtons).find(function (button) {
        return button.classList.contains("is-active");
    })?.dataset.faqFilter || "all";
    faqItems.forEach(function (item) {
        item.hidden = initialFaqCategory !== "all" && !item.dataset.faqCategory.split(/\s+/).includes(initialFaqCategory);
    });
    updateFaqLayout();

    const pageNav = document.querySelector(".car-page-nav");
    const pageNavToggle = pageNav?.querySelector("span.blue_color");
    const mobilePageNav = window.matchMedia("(max-width: 767px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (pageNav && pageNavToggle) {
        let pageNavOpen = false;
        let pageNavTimer;
        function finishPageNavAnimation() {
            clearTimeout(pageNavTimer);
            pageNav.classList.remove("is-animating");
            pageNav.style.height = "";
            pageNav.classList.toggle("is-open", pageNavOpen);
        }
        function setPageNavOpen(open) {
            if (open === pageNavOpen) return;
            pageNavOpen = open;
            if (mobilePageNav.matches) pageNavToggle.setAttribute("aria-expanded", String(open));
            if (!mobilePageNav.matches || reducedMotion.matches) {
                finishPageNavAnimation();
                return;
            }
            // Animate the nav height between the collapsed title row and the full list.
            const startHeight = pageNav.getBoundingClientRect().height;
            let endHeight;
            if (open) {
                pageNav.classList.remove("is-animating");
                pageNav.style.height = "";
                pageNav.classList.add("is-open");
                endHeight = pageNav.getBoundingClientRect().height;
            } else {
                const navStyle = getComputedStyle(pageNav);
                endHeight =
                    pageNavToggle.getBoundingClientRect().height +
                    parseFloat(navStyle.paddingTop) +
                    parseFloat(navStyle.paddingBottom) +
                    parseFloat(navStyle.borderTopWidth) +
                    parseFloat(navStyle.borderBottomWidth);
            }
            clearTimeout(pageNavTimer);
            pageNav.style.height = startHeight + "px";
            pageNav.classList.add("is-animating");
            void pageNav.offsetHeight;
            pageNav.style.height = endHeight + "px";
            pageNavTimer = setTimeout(finishPageNavAnimation, 320);
        }
        function syncPageNavToggle() {
            if (mobilePageNav.matches) {
                pageNavToggle.setAttribute("role", "button");
                pageNavToggle.setAttribute("tabindex", "0");
                pageNavToggle.setAttribute("aria-expanded", String(pageNavOpen));
            } else {
                pageNavToggle.removeAttribute("role");
                pageNavToggle.removeAttribute("tabindex");
                pageNavToggle.removeAttribute("aria-expanded");
                pageNavOpen = false;
                finishPageNavAnimation();
            }
        }
        pageNavToggle.addEventListener("click", function () {
            if (mobilePageNav.matches) setPageNavOpen(!pageNavOpen);
        });
        pageNavToggle.addEventListener("keydown", function (event) {
            if (!mobilePageNav.matches || (event.key !== "Enter" && event.key !== " ")) return;
            event.preventDefault();
            setPageNavOpen(!pageNavOpen);
        });
        pageNav.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                setPageNavOpen(false);
            });
        });
        mobilePageNav.addEventListener("change", syncPageNavToggle);
        syncPageNavToggle();
    }
});
