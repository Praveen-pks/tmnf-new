document.addEventListener('DOMContentLoaded', function () {
    const header = document.querySelector('.site-header');
    const carPageNav = document.querySelector('.car-page-nav');
    let headerReleaseTimer;
    document.querySelectorAll('.hero .product-card--interactive').forEach(card => {
        const popup = card.querySelector('.product-card__popover');
        let closeTimer;
        function positionProductPopup() {
            const cardBounds = card.getBoundingClientRect();
            const popupWidth = popup.getBoundingClientRect().width;
            const popupLeft = Math.max(24, Math.min(cardBounds.left, window.innerWidth - popupWidth - 24));
            const shift = popupLeft - cardBounds.left;
            card.style.setProperty('--popover-shift', shift + 'px');
            const arrow = shift === 0 ? 43 : Math.max(20, Math.min(popupWidth - 46, cardBounds.left + cardBounds.width / 2 - popupLeft - 13));
            card.style.setProperty('--popover-arrow', arrow + 'px');
        }
        function openProductPopup() {
            clearTimeout(closeTimer);
            if (card.classList.contains('is-dismissed')) return;
            positionProductPopup();
            card.classList.add('is-open');
            popup.setAttribute('aria-hidden', 'false');
        }
        function closeProductPopup() {
            card.classList.remove('is-open');
            popup.setAttribute('aria-hidden', 'true');
        }
        card.addEventListener('pointerenter', openProductPopup);
        card.addEventListener('pointerleave', () => {
            if (document.activeElement !== card) card.classList.remove('is-dismissed');
            clearTimeout(closeTimer);
            closeTimer = setTimeout(() => {
                if (document.activeElement !== card) closeProductPopup();
            }, 120);
        });
        card.addEventListener('focus', openProductPopup);
        card.addEventListener('blur', () => {
            card.classList.remove('is-dismissed');
            if (card.matches(':hover')) openProductPopup();
            else closeProductPopup();
        });
        card.addEventListener('keydown', event => {
            if (event.key !== 'Escape') return;
            clearTimeout(closeTimer);
            card.classList.add('is-dismissed');
            closeProductPopup();
        });
        window.addEventListener('resize', positionProductPopup, { passive: true });
    });
    const productsToggle = document.querySelector('[data-products-toggle]');
    const additionalProducts = document.getElementById('additional-products');
    const productsGrid = document.getElementById('products');
    const domesticProduct = productsGrid ? productsGrid.querySelector('.product-card--domestic') : null;
    const mobileProductsLayout = window.matchMedia('(max-width: 767px)');
    let additionalProductsAnimation;
    if (productsGrid && additionalProducts && domesticProduct) {
        function arrangeDomesticProduct() {
            const destination = mobileProductsLayout.matches ? additionalProducts : productsGrid;
            if (domesticProduct.parentElement !== destination) {
                if (mobileProductsLayout.matches) additionalProducts.prepend(domesticProduct);
                else productsGrid.append(domesticProduct);
            }
        }
        arrangeDomesticProduct();
        mobileProductsLayout.addEventListener('change', arrangeDomesticProduct);
    }
    function finishProductsAnimation(expanded) {
        additionalProductsAnimation = null;
        additionalProducts.style.overflow = '';
        if (!expanded) additionalProducts.hidden = true;
        // Re-enable scroll anchoring only after the final layout has been applied.
        requestAnimationFrame(() => requestAnimationFrame(() => {
            if (!additionalProductsAnimation) document.documentElement.style.overflowAnchor = '';
        }));
    }
    if (productsToggle && additionalProducts) {
        productsToggle.addEventListener('click', function () {
            const expanded = productsToggle.getAttribute('aria-expanded') !== 'true';
            const revealDuration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 360;
            // Stop scroll anchoring from shifting the page before any layout change happens.
            document.documentElement.style.overflowAnchor = 'none';
            // Start from wherever a running animation currently is, so quick repeat clicks reverse smoothly.
            const from = getComputedStyle(additionalProducts);
            const start = additionalProducts.hidden
                ? { height: '0px', marginTop: '0px', marginBottom: '0px' }
                : { height: from.height, marginTop: from.marginTop, marginBottom: from.marginBottom };
            if (additionalProductsAnimation) {
                additionalProductsAnimation.onfinish = null;
                additionalProductsAnimation.cancel();
            }
            additionalProducts.hidden = false;
            additionalProducts.inert = !expanded;
            additionalProducts.classList.toggle('is-expanded', expanded);
            if (!revealDuration || !additionalProducts.animate) {
                finishProductsAnimation(expanded);
            } else {
                const natural = getComputedStyle(additionalProducts);
                const end = expanded
                    ? { height: natural.height, marginTop: natural.marginTop, marginBottom: natural.marginBottom }
                    : { height: '0px', marginTop: '0px', marginBottom: '0px' };
                // Grow/shrink the row instead of snapping it.
                additionalProducts.style.overflow = 'hidden';
                additionalProductsAnimation = additionalProducts.animate([start, end], { duration: revealDuration, easing: 'cubic-bezier(.22,.61,.36,1)' });
                additionalProductsAnimation.onfinish = () => finishProductsAnimation(expanded);
            }
            productsToggle.setAttribute('aria-expanded', String(expanded));
            productsToggle.textContent = expanded ? 'Show Less' : 'Show All Products';
            productsToggle.classList.toggle('is-expanded', expanded);
        });
    }

    function updateFixedHeader() {
        if (!header) {
            return;
        }

        // The header is part of the page flow at the top of inner pages.
        // Always restore it when scrolling back to the top, even if a release
        // animation was still pending as the page reached the top.
        if (window.scrollY <= 40) {
            clearTimeout(headerReleaseTimer);
            header.classList.remove('is-header-fixed', 'is-header-releasing', 'is-header-released');
            return;
        }

        const navTop = carPageNav ? carPageNav.getBoundingClientRect().top : Number.POSITIVE_INFINITY;
        const navHasControlOfTop = carPageNav && (
            header.classList.contains('is-header-fixed')
                ? navTop <= 0
                : navTop <= header.offsetHeight
        );

        if (window.scrollY > 40 && !navHasControlOfTop) {
            clearTimeout(headerReleaseTimer);
            header.classList.add('is-header-fixed');
            header.classList.remove('is-header-releasing', 'is-header-released');
        } else if (header.classList.contains('is-header-fixed')) {
            if (!header.classList.contains('is-header-releasing')) {
                header.classList.add('is-header-releasing');
                const releaseDelay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 240;
                headerReleaseTimer = window.setTimeout(function () {
                    if (!header.classList.contains('is-header-releasing')) return;
                    header.classList.remove('is-header-fixed', 'is-header-releasing');
                    header.classList.add('is-header-released');
                }, releaseDelay);
            }
        } else if (carPageNav && navHasControlOfTop) {
            clearTimeout(headerReleaseTimer);
            header.classList.remove('is-header-releasing');
            header.classList.add('is-header-released');
        } else {
            clearTimeout(headerReleaseTimer);
            header.classList.remove('is-header-fixed', 'is-header-releasing', 'is-header-released');
        }
    }

    updateFixedHeader();
    window.addEventListener('scroll', updateFixedHeader, { passive: true });

    document.querySelectorAll('[data-customer-type]').forEach(link => link.addEventListener('click', function () {
        window.tmnfCover?.selectType(link.dataset.customerType);
        if (link.dataset.coverProduct !== undefined) window.tmnfCover?.selectProduct(Number(link.dataset.coverProduct));
    }));

    const portalButtons = Array.from(document.querySelectorAll('[data-portal]'));
    const portalPanel = document.querySelector('#portal-panel');
    const portalText = portalPanel ? Array.from(portalPanel.querySelectorAll('.portal__card-text')) : [];
    const portalMessages = {
        Motor: ['Access your motor policy dashboard online.', 'Renew your motor cover in a few clicks.', 'Get your insurance certificate instantly.', 'Start a motor claim through the portal.'],
        Home: ['Access your home policy dashboard online.', 'Renew your home cover in a few clicks.', 'Get your home insurance certificate instantly.', 'Start a home insurance claim through the portal.'],
        Travel: ['Access your travel policy dashboard online.', 'Renew your travel cover in a few clicks.', 'Get your travel insurance certificate instantly.', 'Start a travel insurance claim through the portal.']
    };
    let portalSwapTimer;
    function selectPortal(button, moveFocus = false) {
        if (!button) return;
        portalButtons.forEach(item => {
            const active = item === button;
            item.classList.toggle('is-active', active);
            item.setAttribute('aria-selected', String(active));
            item.tabIndex = active ? 0 : -1;
        });
        if (moveFocus) button.focus();
        if (!portalPanel) return;
        portalPanel.setAttribute('aria-labelledby', button.id);
        const messages = portalMessages[button.dataset.portal];
        if (!messages) return;
        clearTimeout(portalSwapTimer);
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reducedMotion) {
            portalText.forEach((text, i) => text.textContent = messages[i]);
            portalPanel.classList.remove('is-transitioning');
            return;
        }
        portalPanel.classList.add('is-transitioning');
        portalSwapTimer = setTimeout(() => {
            portalText.forEach((text, i) => text.textContent = messages[i]);
            requestAnimationFrame(() => portalPanel.classList.remove('is-transitioning'));
        }, 150);
    }
    portalButtons.forEach((button, index) => {
        button.addEventListener('click', () => selectPortal(button));
        button.addEventListener('keydown', event => {
            let next = index;
            if (event.key === 'ArrowRight') next = (index + 1) % portalButtons.length;
            else if (event.key === 'ArrowLeft') next = (index + portalButtons.length - 1) % portalButtons.length;
            else if (event.key === 'Home') next = 0;
            else if (event.key === 'End') next = portalButtons.length - 1;
            else return;
            event.preventDefault();
            selectPortal(portalButtons[next], true);
        });
    });

    const faqItems = document.querySelectorAll('.faq-item');
    function setFaqState(item, expanded) {
        const button = item.querySelector('.faq-item__btn');
        const answer = item.querySelector('.faq-item__answer');
        item.classList.toggle('is-open', expanded);
        button?.setAttribute('aria-expanded', String(expanded));
        if (answer) {
            answer.setAttribute('aria-hidden', String(!expanded));
            answer.inert = !expanded;
        }
    }
    faqItems.forEach(function (item, index) {
        const button = item.querySelector('.faq-item__btn');
        const body = item.querySelector('.faq-item__body');
        if (!button || !body) return;
        body.id = 'faq-answer-' + index;
        button.setAttribute('aria-controls', body.id);
        const answer = document.createElement('div');
        const clip = document.createElement('div');
        answer.className = 'faq-item__answer';
        clip.className = 'faq-item__clip';
        body.parentNode.insertBefore(answer, body);
        answer.appendChild(clip);
        clip.appendChild(body);
        const icon = item.querySelector('.faq-item__icon');
        if (icon) icon.textContent = '';
        setFaqState(item, item.classList.contains('is-open'));
        button.addEventListener('click', function () {
            const expanded = !item.classList.contains('is-open');
            faqItems.forEach(other => setFaqState(other, other === item && expanded));
        });
    });

});

document.addEventListener('DOMContentLoaded', function () {
    const section = document.querySelector('.stats, [data-stats]');
    const counters = Array.from(document.querySelectorAll('[data-stat-count]'));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!section || !counters.length || reducedMotion.matches || !('IntersectionObserver' in window)) return;
    let frame;
    let observer;
    let started = false;
    const duration = 1500;
    function showFinalValues() {
        cancelAnimationFrame(frame);
        counters.forEach(counter => {
            counter.textContent = counter.dataset.statCount + counter.dataset.statSuffix;
        });
        observer?.disconnect();
    }
    counters.forEach(counter => counter.textContent = '0' + counter.dataset.statSuffix);
    observer = new IntersectionObserver(entries => {
        if (started || !entries.some(entry => entry.isIntersecting)) return;
        started = true;
        observer.disconnect();
        let start;
        function tick(timestamp) {
            if (start === undefined) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            counters.forEach(counter => {
                counter.textContent = Math.round(Number(counter.dataset.statCount) * eased) + counter.dataset.statSuffix;
            });
            if (progress < 1 && !reducedMotion.matches) frame = requestAnimationFrame(tick);
            else showFinalValues();
        }
        frame = requestAnimationFrame(tick);
    }, { threshold: 0.25 });
    observer.observe(section);
    reducedMotion.addEventListener('change', event => { if (event.matches) showFinalValues(); });
});

document.addEventListener('DOMContentLoaded', function () {
    const backToTop = document.querySelector('[data-back-to-top]');
    const hero = document.querySelector('.hero, .car-hero');
    if (!backToTop) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (hero) {
        new IntersectionObserver(entries => {
            const heroOutOfView = !entries[0].isIntersecting && entries[0].boundingClientRect.top < 0;
            backToTop.classList.toggle('is-visible', heroOutOfView);
        }).observe(hero);
    } else {
        const toggleBackToTop = () => backToTop.classList.toggle('is-visible', window.scrollY > window.innerHeight);
        window.addEventListener('scroll', toggleBackToTop, { passive: true });
        toggleBackToTop();
    }
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    });
});
