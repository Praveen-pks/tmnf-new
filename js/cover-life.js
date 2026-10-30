document.addEventListener('DOMContentLoaded', function () {
    const panel = document.querySelector('.cover-life__panel');
    if (!panel) return;
    const tabs = Array.from(panel.querySelectorAll('[data-cover-tab]'));
    const toggles = Array.from(panel.querySelectorAll('[data-cover-toggle]'));
    const backgrounds = Array.from(panel.querySelectorAll('[data-cover-background]'));
    const copy = panel.querySelector('[data-cover-copy]');
    const outgoingCopy = panel.querySelector('.cover-life__copy--outgoing');
    const title = panel.querySelector('[data-cover-subtitle]');
    const description = panel.querySelector('[data-cover-text]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    // The live prototype visibly crossfades; exact export timing is unavailable under its seat limit.
    const transition = { duration: 300, easing: 'ease-in-out', fill: 'forwards' };
    const products = {
        Personal: [
            { id:'motor', label:'Motor', title:'Motor Insurance', text:'Comprehensive & third-party cover with fast digital claims & a premium garage network.', image:'images/figma/cover-life.png', icon:'images/icons/motor.svg' },
            { id:'home', label:'Home', title:'Home Insurance', text:'Protection for owned or rented homes, and everything you keep inside them.', image:'images/cover/home.jpg', icon:'images/icons/home-tab.svg' },
            { id:'travel', label:'Travel', title:'Travel Insurance', text:'Worldwide medical, baggage and trip cover, instant policy in a few clicks.', image:'images/cover/travel.png', icon:'images/icons/travel-tab.svg' },
            { id:'helper', label:'Domestic Helper', title:'Domestic Helper', text:'Extensive Domestic Helper plans for individuals and families.', image:'images/cover/domestic-helper.jpg', icon:'images/icons/helper-tab.svg' },
            { id:'accident', label:'Personal Accident', title:'Personal Accident Insurance', text:'Financial protection for you and your family against life’s accidents.', image:'images/cover/personal-accident.jpg', icon:'images/icons/accident-tab.svg' }
        ],
        Business: [
            { id:'fleet', label:'Fleet', title:'Fleet Insurance', text:"Safeguard your fleet with Tokio Marine's Motor Fleet Insurance", image:'images/cover/fleet.png', icon:'images/icons/motor.svg' },
            { id:'property', label:'Commercial Property', title:'Commercial Property', text:'Safeguard business assets and premises with tailored property cover.', image:'images/cover/commercial-property.jpg', icon:'images/figma/commercial-property.svg' },
            { id:'cargo', label:'Marine Cargo', title:'Marine Cargo', text:'Cover for ocean, air and land transit — spot or annual open cover.', image:'images/cover/marine-cargo.jpg', icon:'images/figma/marine-cargo.svg' },
            { id:'liability', label:'Business Liability', title:'Business Package (SME)', text:'Bundled cover designed for small and mid-sized businesses.', image:'images/cover/business-package.jpg', icon:'images/figma/business-liability.svg' },
            { id:'workmen', label:'Workmen Compensation', title:'Workmen Compensation', text:'Protect your workforce with statutory and extended compensation cover.', image:'images/cover/workmen-compensation.jpg', icon:'images/figma/workmen-compensation.svg' }
        ]
    };
    let customerType = 'Personal';
    let selected = 0;
    let currentLayer = 0;
    let requestId = 0;
    let animations = [];
    const autoplayInterval = 5000;
    let autoplayTimer;
    let inView = false;
    let pointerInside = false;
    function scheduleAutoplay() {
        clearTimeout(autoplayTimer);
        if (!inView || pointerInside || panel.contains(document.activeElement) || document.hidden || reducedMotion.matches) return;
        autoplayTimer = setTimeout(() => selectProduct((selected + 1) % tabs.length), autoplayInterval);
    }
    const decodedImages = new Map();
    function loadImage(src) {
        if (!decodedImages.has(src)) {
            const image = new Image(); image.src = src;
            decodedImages.set(src, image.decode().then(() => true).catch(() => false));
        }
        return decodedImages.get(src);
    }
    function stopAnimations() { animations.forEach(animation => animation.cancel()); animations = []; }
    function finishTransition() {
        stopAnimations();
        backgrounds.forEach((layer, i) => layer.style.opacity = i === currentLayer ? '1' : '0');
        copy.style.opacity = '1'; outgoingCopy.style.opacity = '0';
    }
    function updateTabs() {
        tabs.forEach((tab, i) => {
            const product = products[customerType][i];
            tab.dataset.title = product.title; tab.dataset.text = product.text;
            tab.querySelector('.cover-life__tab-label').textContent = product.label;
            const icon = tab.querySelector('img'); icon.src = product.icon;
            tab.querySelector('.cover-life__tab-icon').classList.toggle('is-business-icon', customerType === 'Business' && i > 0);
            tab.classList.toggle('is-active', i === selected);
            tab.setAttribute('aria-selected', String(i === selected));
            tab.setAttribute('tabindex', i === selected ? '0' : '-1');
        });
        panel.querySelector('.cover-life__tabs').setAttribute('aria-label', customerType + ' insurance products');
        copy.setAttribute('aria-labelledby', tabs[selected].id);
    }
    async function selectProduct(index, animate = true) {
        const product = products[customerType][index];
        if (!product) return;
        clearTimeout(autoplayTimer);
        selected = index; updateTabs();
        const ownRequest = ++requestId;
        const loaded = await loadImage(product.image);
        if (ownRequest !== requestId) return;
        finishTransition();
        outgoingCopy.querySelector('h3').textContent = title.textContent;
        outgoingCopy.querySelector('p').textContent = description.textContent;
        title.textContent = product.title; description.textContent = product.text;
        const nextLayer = 1 - currentLayer;
        const target = backgrounds[nextLayer];
        target.style.backgroundImage = 'url("' + (loaded ? product.image : 'images/figma/cover-life.png') + '")';
        target.dataset.product = product.id;
        const oldLayer = backgrounds[currentLayer];
        currentLayer = nextLayer;
        scheduleAutoplay();
        loadImage(products[customerType][(selected + 1) % tabs.length].image);
        if (!animate || reducedMotion.matches || !copy.animate) { finishTransition(); return; }
        animations = [
            target.animate([{opacity:0},{opacity:1}], transition),
            oldLayer.animate([{opacity:1},{opacity:0}], transition),
            copy.animate([{opacity:0},{opacity:1}], transition),
            outgoingCopy.animate([{opacity:1},{opacity:0}], transition)
        ];
        Promise.all(animations.map(animation => animation.finished.catch(() => {}))).then(() => { if (ownRequest === requestId) finishTransition(); });
    }
    function selectType(type) {
        if (!products[type]) return;
        const changed = customerType !== type;
        customerType = type; panel.dataset.coverType = type;
        toggles.forEach(button => {
            const active = button.textContent.trim() === type;
            button.classList.toggle('is-active', active); button.setAttribute('aria-pressed', String(active));
        });
        if (changed) selectProduct(0); else { updateTabs(); scheduleAutoplay(); }
    }
    toggles.forEach(button => button.addEventListener('click', () => selectType(button.textContent.trim())));
    tabs.forEach((tab, i) => {
        tab.addEventListener('click', () => { if (i !== selected) selectProduct(i); else scheduleAutoplay(); });
        tab.addEventListener('pointerenter', () => loadImage(products[customerType][i].image));
        tab.addEventListener('focus', () => loadImage(products[customerType][i].image));
        tab.addEventListener('keydown', event => {
            let index;
            if (event.key === 'ArrowRight') index = (i + 1) % tabs.length;
            if (event.key === 'ArrowLeft') index = (i + tabs.length - 1) % tabs.length;
            if (event.key === 'Home') index = 0;
            if (event.key === 'End') index = tabs.length - 1;
            if (index !== undefined) { event.preventDefault(); tabs[index].focus(); selectProduct(index); }
        });
    });
    panel.addEventListener('pointerenter', event => {
        if (event.pointerType === 'touch') return;
        pointerInside = true; scheduleAutoplay();
    });
    panel.addEventListener('pointerleave', () => { pointerInside = false; scheduleAutoplay(); });
    panel.addEventListener('focusin', scheduleAutoplay);
    panel.addEventListener('focusout', () => setTimeout(scheduleAutoplay, 0));
    document.addEventListener('visibilitychange', scheduleAutoplay);
    new IntersectionObserver(entries => {
        inView = entries[0].isIntersecting;
        scheduleAutoplay();
    }, { threshold: 0.25 }).observe(panel);
    reducedMotion.addEventListener('change', event => {
        if (event.matches) finishTransition();
        scheduleAutoplay();
    });
    toggles.forEach(button => button.setAttribute('aria-pressed', String(button.classList.contains('is-active'))));
    updateTabs();
    loadImage(products.Personal[0].image);
    window.tmnfCover = { selectType, selectProduct };
});
