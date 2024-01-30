/**
 * The main application class that manages modules.
 *
 * @class
 */
class App {
    /**
     * The array of available module classes.
     * @private
     * @readonly
     */
    modules;
    /**
     * Instances of modules associated with HTML elements.
     * @private
     */
    moduleInstances;
    /**
     * Creates an instance of the App class.
     *
     * @constructor
     * @param {AppOptions} options - The options for configuring the App instance.
     */
    constructor(options) {
        this.modules = options.modules;
        this.moduleInstances = new Map();
    }
    /**
     * Initialize modules within a specified context or the entire document.
     *
     * @param {HTMLElement} [context] - The context in which to initialize modules.
     * @memberof App
     */
    init(context) {
        if (!context) {
            context = document.documentElement;
        }
        this.modules.forEach((moduleClass) => {
            const moduleAttribute = `data-module-${moduleClass.name}`;
            const $targets = Array.from(context.querySelectorAll(`[${moduleAttribute}]`));
            if (context?.hasAttribute(moduleAttribute)) {
                $targets.push(context);
            }
            for (const element of $targets) {
                if (element.dataset.dependsOn) {
                    continue;
                }
                const module = moduleClass.create({ el: element }, true);
                module.init();
                this.moduleInstances.set(element, {
                    ...this.moduleInstances.get(element) || {},
                    [moduleClass.name]: module,
                });
            }
        });
    }
    /**
     * Destroy modules within a specified context or the entire document.
     *
     * @param {HTMLElement} [context] - The context in which to destroy modules.
     * @memberof App
     */
    destroy(context) {
        for (const [element, instances] of this.moduleInstances.entries()) {
            if (context && context !== element && !context.contains(element))
                continue;
            Object.values(instances).forEach((instance) => {
                instance.destroy();
            });
            this.moduleInstances.delete(element);
        }
    }
    /**
     * Update modules within a specified context or the entire document.
     *
     * @param {HTMLElement} [context] - The context in which to update modules.
     * @memberof App
     */
    update(context) {
        this.destroy(context);
        this.init(context);
    }
}

class EventEmitter {
    constructor() {
        this._events = {};
    }
    /**
     * Returns the number of registered events.
     *
     * @return {number}
     */
    get eventsCount() {
        return Object.keys(this._events).length;
    }
    /**
     * Deletes all events.
     */
    clearEvents() {
        this._events = {};
    }
    /**
     * Adds the event callback function to the event.
     *
     * @param eventName {string} - The eventName of the event.
     * @param callback {Listener} - The event callback function.
     */
    on(eventName, callback) {
        if (!this.eventExists(eventName)) {
            this._events[eventName] = new Set();
        }
        this._events[eventName].add(callback);
        return () => this.off(eventName, callback);
    }
    /**
     * Removes the event callback function from the event.
     *
     * @param eventName {string} - The eventName of the event.
     * @param callback {Listener} - The event callback function.
     */
    off(eventName, callback) {
        if (!this.eventExists(eventName)) {
            return;
        }
        this._events[eventName].delete(callback);
    }
    /**
     * Calls all callbacks for the event.
     *
     * @param eventName {string} - The eventName of the event.
     * @param data {object | null} - The data passed on to the callbacks.
     */
    emit(eventName, data = null) {
        if (!this.eventExists(eventName)) {
            return;
        }
        this._events[eventName].forEach((callback) => {
            callback.call(null, data);
        });
    }
    /**
     * Returns whether the event exists.
     *
     * @param eventName {string} - The eventName of the event.
     * @return {boolean}
     */
    eventExists(eventName) {
        return !!this._events[eventName];
    }
}

/**
 * Base class for creating modular components with event handling.
 */
class Module extends EventEmitter {
    static name;
    get name() {
        throw "Error! You need to override the 'name' getter in your class that extends from the Module class.";
    }
    el;
    _eventListeners;
    /**
     * Creates an instance of the Module class.
     *
     * @param {ModuleOptions} options - Options for configuring the module.
     * @constructor
     * @note Handle tasks in the constructor that are essential for initializing the module
     * but should have no adverse effects if the module undergoes updates (destroy and init)
     * without creating a new instance. The constructor is suitable for code that ensures
     * the module's basic structure and functionality, facilitating smooth reinitialization when necessary.
     */
    constructor(options) {
        super();
        this.el = options.el;
        this._eventListeners = new Map();
        this.el[this.name] = this;
    }
    /**
     * Initialization method for the module. Override this method in subclasses.
     *
     * @note Perform operations such as value extraction and other setup that are intended
     * to occur once during the initialization phase. Keep in mind that modules may undergo
     * updates (destroy and init) without necessitating the creation of a new instance.
     */
    init() {
        // Override this method in subclasses.
    }
    /**
     * Destructor method for the module. Removes all event listeners.
     */
    destroy() {
        this.clearEvents();
        this._eventListeners.forEach((listeners, element) => {
            listeners.forEach((listener, eventName) => {
                element.removeEventListener(eventName, listener);
            });
        });
    }
    /**
     * Adds an event listener to one or more elements.
     *
     * @param {HTMLElement[] | HTMLElement} elements - The target element(s) to attach the event listener to.
     * @param {string} eventName - The name of the event to listen for.
     * @param {ModuleEventListener} listener - The event listener function.
     * @param {ModuleEventListenerOptions} [options] - Optional options for the event listener.
     */
    addEventListener(elements, eventName, listener, options) {
        if (!Array.isArray(elements)) {
            elements = [elements];
        }
        if (!this._eventListeners) {
            this._eventListeners = new Map();
        }
        elements.forEach((element) => {
            if (!this._eventListeners.has(element)) {
                this._eventListeners.set(element, new Map());
            }
            element.addEventListener(eventName, listener, options);
            this._eventListeners.get(element)?.set(eventName, listener);
        });
    }
    /**
     * Finds the first element matching the selector within the module's context or the specified context.
     *
     * @template E - The type of the element.
     * @param {string} selector - The CSS selector for the element.
     * @param {HTMLElement} [contextElement] - The context element to search within.
     * @returns {E | null} The first matching element, or null if not found.
     */
    $(selector, contextElement) {
        const parentElement = contextElement || this.el;
        return parentElement.querySelector(this.getSelectorQuery(selector));
    }
    /**
     * Finds all elements matching the selector within the module's context.
     *
     * @template E - The type of the elements.
     * @param {string} selectors - The CSS selector for the elements.
     * @param {HTMLElement} [contextElement] - The context element to search within.
     * @returns {E[]} An array of matching elements.
     */
    $all(selectors, contextElement) {
        const parentElement = contextElement || this.el;
        return Array.from(parentElement.querySelectorAll(this.getSelectorQuery(selectors)));
    }
    /**
     * Finds the first parent element matching the selector within the module's context.
     *
     * @param {string} selector - The CSS selector for the parent element.
     * @param {HTMLElement} [contextElement] - The context element to search within.
     * @returns {Element | null} The first matching parent element, or null if not found.
     */
    $parent(selector, contextElement) {
        const query = this.getSelectorQuery(selector);
        let parentElement = contextElement ? contextElement : this.el;
        while (parentElement && parentElement !== document.documentElement && (parentElement instanceof Element)) {
            if (parentElement.matches(query)) {
                return parentElement;
            }
            parentElement = parentElement.parentNode;
        }
        return null;
    }
    /**
     * Retrieves data attribute value from the module's element.
     *
     * @param {string} name - The name of the data attribute.
     * @param {HTMLElement} [contextElement] - The context element to retrieve data from.
     * @returns {string | null} The value of the data attribute, or null if not found.
     */
    getData(name, contextElement) {
        const targetElement = contextElement || this.el;
        return targetElement.getAttribute(this.getAttributeName(name));
    }
    /**
     * Sets data attribute value on the module's element.
     *
     * @param {string} name - The name of the data attribute.
     * @param {string | null} value - The value to set. Use null to remove the attribute.
     * @param {HTMLElement} [contextElement] - The context element to set data on.
     */
    setData(name, value, contextElement) {
        const targetElement = contextElement || this.el;
        if (value === null) {
            targetElement.removeAttribute(this.getAttributeName(name));
            return;
        }
        targetElement.setAttribute(this.getAttributeName(name), value);
    }
    /**
     * Generates a custom attribute name based on the module's name and an optional suffix.
     *
     * @param suffix - An optional string to append to the attribute name.
     * @returns The custom attribute name, formatted as "data-{name}" or "data-{name}-{suffix}".
     */
    getAttributeName(suffix) {
        const result = `data-${this.name}`;
        if (suffix) {
            return `${result}-${suffix}`;
        }
        return result;
    }
    /**
     * Gets the selector query based on the provided selector.
     *
     * @param {string} selector - The original CSS selector.
     * @returns {string} The modified selector query.
     * @private
     */
    getSelectorQuery(selector) {
        const classIndex = selector.indexOf(".");
        const idIndex = selector.indexOf("#");
        const attrIndex = selector.indexOf("[");
        const indexes = [classIndex, idIndex, attrIndex].filter((index) => index !== -1);
        return indexes.length ? selector : `[${this.getAttributeName()}="${selector}"]`;
    }
    /**
     * Creates a new instance of the module with the provided options.
     * If an instance already exists for the element, it returns the existing instance unless `recreate` is true.
     *
     * @template M - The type of the Module.
     * @param {ModuleOptions} options - Options for configuring the new instance.
     * @param {boolean} [recreate=false] - If true, recreates the instance even if it already exists.
     * @returns {M} The module instance.
     */
    static create(options, recreate = false) {
        let instance;
        if (options.el.hasOwnProperty(this.name)) {
            instance = options.el[this.name];
            if (instance instanceof Module) {
                if (recreate) {
                    instance.destroy();
                }
                else {
                    return instance;
                }
            }
        }
        return new this(options);
    }
    /**
     * Gets the CSS selector for finding elements with the module's data attribute.
     *
     * @returns {string} The CSS selector.
     */
    static getModuleSelector() {
        return `[data-module-${this.name}]`;
    }
}

export { App, Module };
