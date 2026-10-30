
document.addEventListener('DOMContentLoaded', function () {
    const nav = document.querySelector('.site-header .navbar');
    if (!nav) return;
    const triggers = Array.from(nav.querySelectorAll('[data-menu-trigger]'));
    const desktop = window.matchMedia('(min-width:1200px) and (hover:hover)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion:reduce)');
    const panelTimers = new WeakMap();
    let activeTrigger = null;
    let closeTimer;
    function hidePanel(panel) {
        clearTimeout(panelTimers.get(panel));
        panel.classList.remove('is-open');
        panel.inert = true;
        if (panel.hidden) return;
        const duration = reducedMotion.matches ? 0 : 300;
        if (!duration) {
            panel.hidden = true;
            return;
        }
        panelTimers.set(panel, setTimeout(() => {
            panel.hidden = true;
            panelTimers.delete(panel);
        }, duration));
    }
    function closeMenu(restoreFocus = false) {
        clearTimeout(closeTimer);
        const previous = activeTrigger;
        triggers.forEach(trigger => {
            trigger.setAttribute('aria-expanded', 'false');
            hidePanel(document.getElementById(trigger.getAttribute('aria-controls')));
        });
        activeTrigger = null;
        if (restoreFocus && previous) previous.focus();
    }
    function openMenu(trigger) {
        clearTimeout(closeTimer);
        if (activeTrigger !== trigger) closeMenu();
        const panel = document.getElementById(trigger.getAttribute('aria-controls'));
        clearTimeout(panelTimers.get(panel));
        panelTimers.delete(panel);
        panel.hidden = false;
        panel.inert = false;
        trigger.setAttribute('aria-expanded', 'true');
        activeTrigger = trigger;
        const triggerBox = trigger.getBoundingClientRect();
        const panelBox = panel.getBoundingClientRect();
        panel.style.setProperty('--pointer-left', Math.max(30, Math.min(panelBox.width - 30, triggerBox.left + triggerBox.width / 2 - panelBox.left)) + 'px');
        // Measure the visible closed state before fading in; reopening cancels its hide timer.
        panel.classList.add('is-open');
    }
    function scheduleClose(trigger) {
        clearTimeout(closeTimer);
        closeTimer = setTimeout(() => {
            if (activeTrigger !== trigger) return;
            const panel = document.getElementById(trigger.getAttribute('aria-controls'));
            if (!panel.contains(document.activeElement)) closeMenu();
        }, 150);
    }
    triggers.forEach(trigger => {
        // The trigger's parent holds both the trigger and its panel, so it is the hover zone for that menu.
        const zone = trigger.parentElement;
        zone.addEventListener('pointerenter', () => { if (desktop.matches) openMenu(trigger); });
        zone.addEventListener('pointerleave', () => { if (desktop.matches && activeTrigger === trigger) scheduleClose(trigger); });
        trigger.addEventListener('click', () => { activeTrigger === trigger ? closeMenu() : openMenu(trigger); });
        trigger.addEventListener('keydown', event => {
            if (event.key === 'ArrowDown') {
                event.preventDefault(); openMenu(trigger);
                document.getElementById(trigger.getAttribute('aria-controls')).querySelector('a')?.focus();
            }
        });
    });
    nav.addEventListener('keydown', event => {
        if (event.key === 'Escape' && activeTrigger) { event.preventDefault(); event.stopPropagation(); closeMenu(true); }
    });
    nav.addEventListener('focusout', () => setTimeout(() => { if (!nav.contains(document.activeElement)) closeMenu(); }, 0));
    document.addEventListener('pointerdown', event => { if (!nav.contains(event.target)) closeMenu(); });
    window.addEventListener('resize', () => closeMenu());
    nav.querySelector('#mainNavbar')?.addEventListener('hidden.bs.collapse', () => closeMenu());
    nav.querySelectorAll('.mega-menu a, .header-call-panel a').forEach(link => link.addEventListener('click', () => {
        if (link.dataset.menuProduct !== undefined) {
            const tab = document.querySelectorAll('[data-cover-tab]')[Number(link.dataset.menuProduct)];
            tab?.click();
        }
        closeMenu();
        const collapse = nav.querySelector('#mainNavbar');
        if (!window.matchMedia('(min-width:1200px)').matches && window.bootstrap && collapse?.classList.contains('show')) {
            window.bootstrap.Collapse.getOrCreateInstance(collapse).hide();
        }
    }));
});
