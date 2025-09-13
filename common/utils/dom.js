/**
 * DOM manipulation utilities
 * Common patterns for working with DOM elements
 */

/**
 * Create an element with properties and children
 * @param {string} tag - HTML tag name
 * @param {Object} props - Properties/attributes
 * @param {...(string|HTMLElement)} children - Child elements or text
 * @returns {HTMLElement} Created element
 */
export function createElement(tag, props = {}, ...children) {
    const element = document.createElement(tag);

    // Set properties
    Object.entries(props).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'style' && typeof value === 'object') {
            Object.assign(element.style, value);
        } else if (key.startsWith('on') && typeof value === 'function') {
            const eventName = key.substring(2).toLowerCase();
            element.addEventListener(eventName, value);
        } else if (key === 'dataset') {
            Object.entries(value).forEach(([dataKey, dataValue]) => {
                element.dataset[dataKey] = dataValue;
            });
        } else {
            element[key] = value;
        }
    });

    // Add children
    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else if (child instanceof HTMLElement) {
            element.appendChild(child);
        }
    });

    return element;
}

/**
 * Query selector with null check
 * @param {string} selector - CSS selector
 * @param {HTMLElement} parent - Parent element (default: document)
 * @returns {HTMLElement|null} Found element or null
 */
export function $(selector, parent = document) {
    return parent.querySelector(selector);
}

/**
 * Query selector all as array
 * @param {string} selector - CSS selector
 * @param {HTMLElement} parent - Parent element (default: document)
 * @returns {HTMLElement[]} Array of found elements
 */
export function $$(selector, parent = document) {
    return Array.from(parent.querySelectorAll(selector));
}

/**
 * Add event listener with automatic cleanup
 * @param {HTMLElement} element - Target element
 * @param {string} event - Event name
 * @param {Function} handler - Event handler
 * @returns {Function} Cleanup function
 */
export function on(element, event, handler) {
    element.addEventListener(event, handler);
    return () => element.removeEventListener(event, handler);
}

/**
 * Add delegated event listener
 * @param {HTMLElement} parent - Parent element
 * @param {string} event - Event name
 * @param {string} selector - Child selector
 * @param {Function} handler - Event handler
 * @returns {Function} Cleanup function
 */
export function delegate(parent, event, selector, handler) {
    const delegatedHandler = (e) => {
        const target = e.target.closest(selector);
        if (target && parent.contains(target)) {
            handler.call(target, e);
        }
    };

    parent.addEventListener(event, delegatedHandler);
    return () => parent.removeEventListener(event, delegatedHandler);
}

/**
 * Show element(s)
 * @param {...HTMLElement} elements - Elements to show
 */
export function show(...elements) {
    elements.forEach(el => {
        if (el) el.style.display = '';
    });
}

/**
 * Hide element(s)
 * @param {...HTMLElement} elements - Elements to hide
 */
export function hide(...elements) {
    elements.forEach(el => {
        if (el) el.style.display = 'none';
    });
}

/**
 * Toggle element visibility
 * @param {HTMLElement} element - Element to toggle
 * @param {boolean} force - Force show/hide
 */
export function toggle(element, force) {
    if (!element) return;

    if (force !== undefined) {
        element.style.display = force ? '' : 'none';
    } else {
        element.style.display = element.style.display === 'none' ? '' : 'none';
    }
}

/**
 * Add class to element(s)
 * @param {HTMLElement|HTMLElement[]} elements - Element(s)
 * @param {...string} classes - Classes to add
 */
export function addClass(elements, ...classes) {
    const els = Array.isArray(elements) ? elements : [elements];
    els.forEach(el => {
        if (el) el.classList.add(...classes);
    });
}

/**
 * Remove class from element(s)
 * @param {HTMLElement|HTMLElement[]} elements - Element(s)
 * @param {...string} classes - Classes to remove
 */
export function removeClass(elements, ...classes) {
    const els = Array.isArray(elements) ? elements : [elements];
    els.forEach(el => {
        if (el) el.classList.remove(...classes);
    });
}

/**
 * Toggle class on element(s)
 * @param {HTMLElement|HTMLElement[]} elements - Element(s)
 * @param {string} className - Class to toggle
 * @param {boolean} force - Force add/remove
 */
export function toggleClass(elements, className, force) {
    const els = Array.isArray(elements) ? elements : [elements];
    els.forEach(el => {
        if (el) el.classList.toggle(className, force);
    });
}

/**
 * Empty element (remove all children)
 * @param {HTMLElement} element - Element to empty
 */
export function empty(element) {
    if (!element) return;
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

/**
 * Replace element's children
 * @param {HTMLElement} parent - Parent element
 * @param {...(string|HTMLElement)} children - New children
 */
export function setChildren(parent, ...children) {
    empty(parent);
    children.forEach(child => {
        if (typeof child === 'string') {
            parent.appendChild(document.createTextNode(child));
        } else if (child instanceof HTMLElement) {
            parent.appendChild(child);
        }
    });
}

/**
 * Animate element with CSS animation
 * @param {HTMLElement} element - Element to animate
 * @param {string} animationClass - CSS animation class
 * @param {number} duration - Animation duration (ms)
 * @returns {Promise} Resolves when animation ends
 */
export function animate(element, animationClass, duration = 1000) {
    return new Promise(resolve => {
        element.classList.add(animationClass);
        setTimeout(() => {
            element.classList.remove(animationClass);
            resolve();
        }, duration);
    });
}

/**
 * Wait for element to appear in DOM
 * @param {string} selector - CSS selector
 * @param {number} timeout - Maximum wait time (ms)
 * @returns {Promise<HTMLElement>} Resolves with element
 */
export function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const element = $(selector);
        if (element) {
            return resolve(element);
        }

        const observer = new MutationObserver(() => {
            const element = $(selector);
            if (element) {
                observer.disconnect();
                resolve(element);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        }, timeout);
    });
}

/**
 * Check if element is visible in viewport
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} Is visible
 */
export function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}
