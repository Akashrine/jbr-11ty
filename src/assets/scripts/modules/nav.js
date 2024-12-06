import debounce from 'lodash/debounce.js';
import { createFocusTrap } from 'focus-trap/index.js';
import { getWindowDimensions } from './utils.js';

const SELECTORS = {
    nav: '.js-nav',
    menu: '.js-nav-menu',
    toggleBtn: '.js-nav-toggle',
};

const CLASSES = {
    noScroll: 'no-scroll',
    navOpen: 'nav--open',
    navMenuVisible: 'nav__menu--visible',
};

class Navigation {
    constructor() {
        this.isOpen = false;

        this.nav = document.querySelector(SELECTORS.nav);
        if (!this.nav) return;

        this.menu = this.nav.querySelector(SELECTORS.menu);
        this.toggleBtn = this.nav.querySelector(SELECTORS.toggleBtn);

        this.focusTrap = createFocusTrap(this.nav, {
            onDeactivate: () => this.toggleMenu(false),
        });

        this.bindEvents();
    }

    bindEvents() {
        this.toggleBtn.addEventListener('click', () => this.toggleMenu());
        window.addEventListener(
            'resize',
            debounce(Navigation.setScreenDiameter, 200)
        );

        Navigation.setScreenDiameter();
    }

    toggleMenu(force) {
        this.isOpen = typeof force === 'boolean' ? force : !this.isOpen;

        document.body.classList.toggle(CLASSES.noScroll, this.isOpen);
        this.nav.classList.toggle(CLASSES.navOpen, this.isOpen);
        this.toggleBtn.setAttribute('aria-expanded', String(this.isOpen));

        window.setTimeout(() => {
            this.menu.classList.toggle(CLASSES.navMenuVisible, this.isOpen);
        }, 50);

        if (this.isOpen) {
            this.focusTrap.activate();
        } else {
            this.focusTrap.deactivate();
        }
    }

    static setScreenDiameter() {
        const screen = getWindowDimensions();
        const diameter = Math.sqrt(screen.height ** 2 + screen.width ** 2);
        document.documentElement.style.setProperty(
            '--diameter',
            `${diameter}px`
        );
    }
}

// Automatically initialize the navigation if the selector exists
export default function initializeNavigation() {
    if (document.querySelector(SELECTORS.nav)) {
        new Navigation();
    }
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initializeNavigation);
