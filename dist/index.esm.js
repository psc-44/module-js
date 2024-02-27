/**
 * Converts a string from PascalCase to kebab-case.
 *
 * @param {string} pascalString - The string to be converted.
 * @returns {string} The converted string in snake_case.
 */
function pascalToKebab(pascalString) {
    return pascalString.replace(/[A-Z]/g, (match, offset) => (offset ? '-' : '') + match.toLowerCase());
}
/**
 * Binds methods of an object to the object itself.
 *
 * @param {object} thisArg - The object whose methods are to be bound.
 * @param {...string} functionNames - Names of the methods to be bound.
 * @returns {void}
 */
function bind(thisArg, ...functionNames) {
    if (!functionNames?.length) {
        functionNames = getObjectProperties(thisArg, (o, prop) => {
            // Exclude Object.prototype properties and only include functions
            try {
                return !Object.prototype.hasOwnProperty(prop) && typeof thisArg[prop] === "function";
            }
            catch (error) {
                return false;
            }
        });
    }
    functionNames.forEach((fn) => {
        if (thisArg.hasOwnProperty(fn))
            return;
        thisArg[fn] = (thisArg[fn]).bind(thisArg);
    });
}
/**
 * Retrieves the properties of an object based on a given predicate.
 *
 * @param {object} obj - The object whose properties are to be retrieved.
 * @param {(obj: object, prop: string) => boolean} predicate - The predicate function to filter the properties.
 * @returns {string[]} An array containing the properties of the object that satisfy the predicate.
 */
function getObjectProperties(obj, predicate) {
    let properties = [];
    let currentObj = obj;
    // Iterate over the prototype chain
    while (currentObj) {
        let ownProps = Object.getOwnPropertyNames(currentObj);
        properties.push(...ownProps.filter(prop => predicate(currentObj, prop)));
        // Move up the prototype chain
        currentObj = Object.getPrototypeOf(currentObj);
    }
    return Array.from(new Set(properties));
}
/**
 * Finds the closest ancestor element of a given element that matches the specified selector, up to a specified limit.
 *
 * @template E - The type of the element.
 * @param {ParentNode} element - The element from which to start searching.
 * @param {string} selector - The CSS selector to match against ancestor elements.
 * @param {ParentNode} limit - The limit up to which the search should be conducted. Defaults to the document element.
 * @returns {E | null} The closest ancestor element matching the selector within the specified limit, or null if not found.
 */
function findParent(element, selector, limit) {
    const limitNode = limit || document.documentElement;
    let parentNode = element;
    while (parentNode && parentNode !== limitNode && parentNode instanceof HTMLElement) {
        if (parentNode.matches(selector)) {
            return parentNode;
        }
        parentNode = parentNode.parentNode;
    }
    return null;
}
/**
 * Checks if an element has a particular parent element.
 *
 * @param {ParentNode} element - The element to check for parentage.
 * @param {ParentNode} parent - The parent element to check against.
 * @returns {boolean} True if the element has the specified parent, otherwise false.
 */
function hasParent(element, parent) {
    if (!element || !parent)
        return false;
    if (element === parent)
        return true;
    if (element.parentElement) {
        return hasParent(element.parentElement, parent);
    }
    return false;
}
/**
 * Returns an event listener function that filters events based on the target element and its ancestors.
 *
 * @param {ParentNode} element - The element to delegate events to.
 * @param {EventListener} listener - The event listener function to be called when the event occurs.
 * @returns {EventListener} The filtered event listener function.
 */
function getEventFilteredEventListener(element, listener) {
    return (event) => {
        if (!(event.target instanceof Element))
            return;
        if (element === event.currentTarget || hasParent(element, event.target)) {
            listener({ ...event, currentTarget: element });
        }
    };
}
/**
 * Returns an event listener function that filters events based on a CSS selector.
 *
 * @param {string} selector - The CSS selector to match against elements.
 * @param {EventListener} listener - The event listener function to be called when the event occurs.
 * @returns {EventListener} The filtered event listener function.
 */
function getSelectorFilteredEventListener(selector, listener) {
    return (event) => {
        if (!(event.target instanceof Element))
            return;
        if (!findParent(event.target, selector))
            return;
        return listener({ ...event, currentTarget: event.target });
    };
}

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
    static instance;
    /**
     * Creates an instance of the App class.
     *
     * @constructor
     * @param {AppOptions} options - The options for configuring the App instance.
     */
    constructor(options) {
        App.instance = this;
        this.modules = options.modules;
        this.moduleInstances = new Map();
    }
    /**
     * Initialize modules within a specified context or the entire document.
     *
     * @param {ParentNode} [context] - The context in which to initialize modules.
     */
    init(context) {
        if (!context) {
            context = document.documentElement;
        }
        for (const module of this.modules) {
            const name = pascalToKebab(module.name);
            const moduleAttribute = `data-module-${name}`;
            const elements = Array.from(context.querySelectorAll(`[${moduleAttribute}]`));
            if (context instanceof HTMLElement && context.hasAttribute(moduleAttribute)) {
                elements.push(context);
            }
            for (const element of elements) {
                const moduleInstance = module.create(element);
                moduleInstance.init();
                this.moduleInstances.set(element, {
                    ...this.moduleInstances.get(element) || {},
                    [name]: moduleInstance,
                });
            }
        }
    }
    /**
     * Destroy modules within a specified context or the entire document.
     *
     * @param {ParentNode} [context] - The context in which to destroy modules.
     * @memberof App
     */
    destroy(context) {
        for (const [element, instances] of this.moduleInstances.entries()) {
            if (context && context !== element && !context.contains(element))
                continue;
            Object.values(instances).forEach((instance) => {
                instance.destroy();
                this.unregisterModuleInstance(element, instance);
            });
        }
    }
    /**
     * Initializes and destroys modules within a specified context or the entire document.
     *
     * @param {ParentNode} [context] - The context in which to initialize modules.
     */
    update(context) {
        this.destroy(context);
        this.init(context);
    }
    unregisterModuleInstance(element, instance) {
        let instances = this.moduleInstances.get(element);
        if (!instances)
            return;
        if (instance) {
            delete instances[instance.name];
        }
        else {
            instances = {};
        }
        if (Object.keys(instances).length) {
            this.moduleInstances.set(element, instances);
            return;
        }
        this.moduleInstances.delete(element);
    }
}

/**
 * Base class for creating modular components with event handling.
 */
class Module {
    _name;
    _moduleAttribute;
    _eventListeners;
    el;
    $elements;
    autoQueryElements;
    autoBind;
    get name() {
        return this._name;
    }
    /**
     * Creates an instance of the Module class.
     *
     * @param {HTMLElement} el - Options for configuring the module.
     * @constructor
     * @note Handle tasks in the constructor that are essential for initializing the module
     * but should have no adverse effects if the module undergoes updates (destroy and init)
     * without creating a new instance. The constructor is suitable for code that ensures
     * the module's basic structure and functionality, facilitating smooth reinitialization when necessary.
     */
    constructor(el) {
        this._name = pascalToKebab(this.constructor.name);
        this._moduleAttribute = `data-${this._name}`;
        this._eventListeners = new Map();
        this.el = el;
        this.$elements = null;
        this.autoQueryElements = false;
        this.autoBind = true;
    }
    /**
     * Initialization method for the module. Override this method in subclasses.
     *
     * @note Perform operations such as value extraction and other setup that are intended
     * to occur once during the initialization phase. Keep in mind that modules may undergo
     * updates (destroy and init) without necessitating the creation of a new instance.
     */
    init() {
        this.$elements = this.autoQueryElements ? this.queryModuleElements() : null;
        this.autoBind && bind(this);
    }
    /**
     * Destructor method for the module. Removes all event listeners.
     */
    destroy() {
        this._eventListeners.forEach((listeners, element) => {
            listeners.forEach((listener, eventName) => {
                element.removeEventListener(eventName, listener);
            });
        });
    }
    /**
     * Adds an event listener to one or more DOM elements.
     *
     * @param {string | EventTarget | EventTarget[]} targets - The target element(s) or module scoped element(s) to attach the event listener to. Can be a string selector, a single DOM element, or an array of DOM elements.
     * @param {string} type - A string representing the event type to listen for, e.g., "click" or "mouseover".
     * @param {EventListenerOrEventListenerObject} listener - The function or object that receives a notification when an event of the specified type occurs.
     * @param {null | boolean | AddEventListenerOptions} options - An optional parameter that specifies characteristics about the event listener.
     * @returns {void}
     */
    addEventListener(targets, type, listener, options) {
        let $targets;
        if (typeof targets === "string") {
            $targets = this.$all(targets);
        }
        else if (!Array.isArray(targets)) {
            $targets = [targets];
        }
        else {
            $targets = targets;
        }
        $targets.forEach(($target) => {
            if (!this._eventListeners.has($target)) {
                this._eventListeners.set($target, new Map());
            }
            $target.addEventListener(type, listener, options);
            this._eventListeners.get($target)?.set(type, listener);
        });
    }
    /**
     * Removes an event listener from one or more DOM elements or targets.
     *
     * @param {string | EventTarget | EventTarget[]} targets - The target element(s) or module scoped element(s) from which to remove the event listener. Can be a string selector, a single DOM element, or an array of DOM elements.
     * @param {string} type - A string representing the event type for which to remove the listener, e.g., "click" or "mouseover".
     * @param {null | boolean | EventListenerOptions} options - An optional parameter that specifies characteristics about the event listener.
     * @returns {void}
     */
    removeEventListener(targets, type, options) {
        let $targets;
        if (typeof targets === "string") {
            $targets = this.$all(targets);
        }
        else if (!Array.isArray(targets)) {
            $targets = [targets];
        }
        else {
            $targets = targets;
        }
        for (const $target of $targets) {
            if (!this._eventListeners.has($target)) {
                continue;
            }
            const listener = this._eventListeners.get($target).get(type);
            if (!listener) {
                continue;
            }
            $target.removeEventListener(type, listener, options);
            this._eventListeners.get($target).delete(type);
        }
    }
    /**
     * Adds a filtered event listener to one or more DOM elements or targets.
     * The listener will only be invoked when events of the specified type occur on elements matching the given selector.
     *
     * @param {string | EventTarget | EventTarget[]} targets - The target element(s) to attach the event listener to. Can be a string selector, a single DOM element, or an array of DOM elements.
     * @param {string} type - A string representing the event type to listen for, e.g., "click" or "mouseover".
     * @param {EventListener} listener - The event listener function to be called when the event occurs.
     * @param {string} selector - A CSS selector string representing the elements to which the event listener will be attached.
     * @param {null | boolean | AddEventListenerOptions} options - An optional parameter that specifies characteristics about the event listener.
     * @returns {void}
     */
    addFilteredEventListener(targets, type, listener, selector, options) {
        this.addEventListener(targets, type, this.getModuleSelectorFilteredEventListener(selector, listener), options);
    }
    /**
     * Dispatches a custom DOM event from the current element with the specified type and optional details.
     *
     * @param {string} type - The type of the custom event to dispatch.
     * @param {object=} detail - An optional object containing additional data to include with the event. Defaults to an empty object if not provided.
     * @returns {void}
     */
    dispatchDomEvent(type, detail = {}) {
        this.el.dispatchEvent(new CustomEvent(type, {
            detail: {
                ...detail,
                module: this,
            },
            bubbles: true,
            cancelable: false,
        }));
    }
    /**
     * Returns a filtered event listener function that listens to events delegated to elements matching the specified selector within the module.
     *
     * @param {string} selector - A CSS selector string representing the elements to which the event listener will be attached. @see {getSelectorQuery}
     * @param {EventListener} listener - The event listener function to be called when the event occurs.
     * @returns {EventListener} The filtered event listener function for the specified selector within the module.
     */
    getModuleSelectorFilteredEventListener(selector, listener) {
        return getSelectorFilteredEventListener(this.getSelectorQuery(selector), listener);
    }
    /**
     * Finds the first element matching the selector within the module's context or the specified context.
     *
     * @template E - The type of the element.
     * @param {string} selector - The CSS selector for the element.
     * @param {ParentNode} [context] - The context element to search within.
     * @param {boolean} useModuleSelector - An optional parameter indicating whether to use module-specific selectors. Default is true.
     * @returns {E | null} The first matching element, or null if not found.
     */
    $(selector, context, useModuleSelector = true) {
        const parentNode = context || this.el;
        return parentNode.querySelector(useModuleSelector ? this.getSelectorQuery(selector) : selector);
    }
    /**
     * Finds all elements matching the selector within the module's context.
     *
     * @template E - The type of the elements.
     * @param {string} selector - The CSS selector for the elements.
     * @param {ParentNode} [context] - The context element to search within.
     * @param {boolean} useModuleSelector - An optional parameter indicating whether to use module-specific selectors. Default is true.
     * @returns {E[]} An array of matching elements.
     */
    $all(selector, context, useModuleSelector = true) {
        const parentNode = context || this.el;
        return Array.from(parentNode.querySelectorAll(useModuleSelector ? this.getSelectorQuery(selector) : selector));
    }
    /**
     * Finds the first parent element matching the selector within the module's context.
     *
     * @template E - The type of the element.
     * @param {string} selector - The CSS selector for the parent element.
     * @param {ParentNode} [context] - The context element to search within.
     * @param {boolean} useModuleSelector - An optional parameter indicating whether to use module-specific selectors. Default is true.
     * @returns {E | null} The first matching parent element, or null if not found.
     */
    $parent(selector, context, useModuleSelector = true) {
        const query = useModuleSelector ? this.getSelectorQuery(selector) : selector;
        return findParent(context ? context : this.el, query);
        // let parentNode: ParentNode | null = context ? context : this.el;
        //
        // while (parentNode && parentNode !== document.documentElement && parentNode instanceof Element) {
        //     if (parentNode.matches(query)) {
        //         return parentNode;
        //     }
        //
        //     parentNode = parentNode.parentNode;
        // }
        //
        // return null;
    }
    queryModuleElements() {
        return this.$all(`[${this._moduleAttribute}]`).reduce((carry, $el) => {
            const name = $el.getAttribute(this._moduleAttribute);
            if (!name)
                return carry;
            if (!carry.hasOwnProperty(name)) {
                carry[name] = $el;
                return carry;
            }
            if (!Array.isArray(carry[name])) {
                carry[name] = [carry[name]];
            }
            carry[name].push($el);
            return carry;
        }, {});
    }
    /**
     * Retrieves data attribute value from the module's element.
     *
     * @param {string} name - The name of the data attribute.
     * @param {HTMLElement} [context] - The context element to retrieve data from.
     * @returns {string | null} The value of the data attribute, or null if not found.
     */
    getData(name, context) {
        const $target = context || this.el;
        return $target.getAttribute(this.getModuleAttributeName(name));
    }
    /**
     * Sets data attribute value on the module's element.
     *
     * @param {string} name - The name of the data attribute.
     * @param {string | null} value - The value to set. Use null to remove the attribute.
     * @param {HTMLElement} [context] - The context element to set data on.
     */
    setData(name, value, context) {
        const targetElement = context || this.el;
        if (value === null) {
            targetElement.removeAttribute(this.getModuleAttributeName(name));
            return;
        }
        targetElement.setAttribute(this.getModuleAttributeName(name), value);
    }
    /**
     * Returns the module attribute with an optional value appended.
     *
     * @param {string | null} value - An optional value to append to the module attribute. If not provided, only the attribute itself is returned.
     * @returns {string} The module attribute with an optional value appended, or just the attribute if no value is provided.
     */
    getModuleAttribute(value) {
        const result = this._moduleAttribute;
        if (value) {
            return `${result}="${value}"`;
        }
        return result;
    }
    /**
     * Generates a custom attribute name based on the module's name and an optional suffix.
     *
     * @param suffix - An optional string to append to the attribute name.
     * @returns The custom attribute name, formatted as "data-{name}" or "data-{name}-{suffix}".
     */
    getModuleAttributeName(suffix) {
        const result = this._moduleAttribute;
        if (suffix) {
            return `${result}-${suffix}`;
        }
        return result;
    }
    /**
     * Returns the selector query based on the provided selector.
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
        return indexes.length ? selector : `[${this._moduleAttribute}="${selector}"]`;
    }
    /**
     * Returns the name of the class in snake_case format.
     *
     * @returns {string}
     */
    static getName() {
        return pascalToKebab(this.name);
    }
    /**
     * Returns the CSS selector of the module's data attribute.
     *
     * @returns {string}
     */
    static getModuleSelector() {
        return `[data-module-${this.getName()}]`;
    }
    static getInstance(element) {
        const name = this.getName();
        return element.hasOwnProperty(name) ? element[name] : null;
    }
    /**
     * Creates a new instance of the module with the provided options.
     * If an instance already exists for the element, it returns the existing instance unless `recreate` is true.
     *
     * @template M - The type of the Module.
     * @param {HTMLElement} element - Options for configuring the new instance.
     * @param {boolean} [recreate=false] - If true, recreates the instance even if it already exists.
     * @returns {M} The module instance.
     */
    static create(element, recreate = false) {
        const instance = this.getInstance(element);
        if (instance) {
            if (recreate) {
                instance.destroy();
            }
            else {
                return instance;
            }
        }
        const name = this.getName();
        element[name] = new this(element);
        return element[name];
    }
    /**
     * Finds and returns the module element associated with the given HTML element within the module tree.
     *
     * @param {HTMLElement} element - The HTML element to search for within the module tree.
     * @returns {null | HTMLElement} The module element associated with the given HTML element if found, or null if not found.
     */
    static findModuleElementInTree(element) {
        const selector = this.getModuleSelector();
        const foundElement = findParent(element, selector);
        if (!foundElement)
            return null;
        if (!(foundElement instanceof HTMLElement))
            return null;
        return foundElement;
    }
    /**
     * Finds and returns the module associated with the given HTML element within the module tree.
     *
     * @param {HTMLElement} element - The HTML element to search for within the module tree.
     * @returns {null | M} The module associated with the given HTML element if found, or null if not found.
     * @template M - The type of module to be returned.
     */
    static findModuleInTree(element) {
        const moduleElement = this.findModuleElementInTree(element);
        if (!moduleElement)
            return null;
        return this.getInstance(moduleElement);
    }
}

export { App, Module, bind, findParent, getEventFilteredEventListener, getSelectorFilteredEventListener, hasParent, pascalToKebab };
