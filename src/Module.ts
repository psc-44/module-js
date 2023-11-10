import {EventEmitter} from "@psc-44/event-emitter";



export type ModuleOptions = {
    el: HTMLElement;
};

export type ModuleEventListener = EventListener;
export type ModuleEventListenerOptions = boolean | EventListenerOptions;



/**
 * Base class for creating modular components with event handling.
 */
export class Module extends EventEmitter {

    static name: string;

    public readonly el: HTMLElement;
    private _eventListeners: Map<HTMLElement, Map<string, ModuleEventListener>>;



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
    constructor(options: ModuleOptions)
    {
        super();

        this.el = options.el;

        this._eventListeners = new Map();

        (this.el as any)[Module.name] = this;
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
    destroy()
    {
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
    addEventListener(elements: HTMLElement[] | HTMLElement, eventName: string, listener: ModuleEventListener, options?: ModuleEventListenerOptions)
    {
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
     * Finds the first element matching the selector within the module's context.
     *
     * @template E - The type of the element.
     * @param {string} selector - The CSS selector for the element.
     * @param {HTMLElement} [contextElement] - The context element to search within.
     * @returns {E | null} The first matching element, or null if not found.
     */
    $<E extends Element = Element>(selector: string, contextElement?: HTMLElement): E | null
    {
        const parentElement = contextElement || this.el;

        return parentElement.querySelector<E>(this.getSelectorQuery(selector));
    }

    /**
     * Finds all elements matching the selector within the module's context.
     *
     * @template E - The type of the elements.
     * @param {string} selectors - The CSS selector for the elements.
     * @param {HTMLElement} [contextElement] - The context element to search within.
     * @returns {E[]} An array of matching elements.
     */
    $all<E extends Element = Element>(selectors: string, contextElement?: HTMLElement): E[]
    {
        const parentElement = contextElement || this.el;

        return Array.from(parentElement.querySelectorAll<E>(this.getSelectorQuery(selectors)));
    }

    /**
     * Finds the first parent element matching the selector within the module's context.
     *
     * @param {string} selector - The CSS selector for the parent element.
     * @param {HTMLElement} [contextElement] - The context element to search within.
     * @returns {Element | null} The first matching parent element, or null if not found.
     */
    $parent(selector: string, contextElement?: HTMLElement): Element | null
    {
        const query = this.getSelectorQuery(selector);
        let parentElement: ParentNode | null = contextElement ? contextElement : this.el;

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
    getData(name: string, contextElement?: HTMLElement): string | null
    {
        const targetElement = contextElement || this.el;
        return targetElement.getAttribute(`${this.attributeName}-${name}`);
    }

    /**
     * Sets data attribute value on the module's element.
     *
     * @param {string} name - The name of the data attribute.
     * @param {string | null} value - The value to set. Use null to remove the attribute.
     * @param {HTMLElement} [contextElement] - The context element to set data on.
     */
    setData(name: string, value: string | null, contextElement?: HTMLElement)
    {
        const targetElement = contextElement || this.el;

        if (value === null) {
            targetElement.removeAttribute(`${this.attributeName}-${name}`);
            return;
        }

        targetElement.setAttribute(`${this.attributeName}-${name}`, value);
    }


    /**
     * Gets the attribute name for the module's custom data attributes.
     *
     * @private
     */
    private get attributeName(): string
    {
        return `data-${Module.name}`;
    }

    /**
     * Gets the selector query based on the provided selector.
     *
     * @param {string} selector - The original CSS selector.
     * @returns {string} The modified selector query.
     * @private
     */
    private getSelectorQuery(selector: string): string
    {
        const classIndex = selector.indexOf(".");
        const idIndex = selector.indexOf("#");
        const attrIndex = selector.indexOf("[");
        const indexes = [classIndex, idIndex, attrIndex].filter((index) => index !== -1);

        return indexes.length ? selector : `[${this.attributeName}-${selector}]`;
    }



    /**
     * Creates a new instance of the module with the provided options.
     * If an instance already exists for the element, it returns the existing instance unless `recreate` is true.
     *
     * @param {ModuleOptions} options - Options for configuring the new instance.
     * @param {boolean} [recreate=false] - If true, recreates the instance even if it already exists.
     * @returns {Module} The module instance.
     */
    static create(options: ModuleOptions, recreate = false)
    {
        let instance;

        if (options.el.hasOwnProperty(this.name)) {
            instance = (options.el as any)[this.name];

            if (instance instanceof Module) {
                if (recreate) {
                    instance.destroy();
                } else {
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
    static getModuleSelector()
    {
        return `[data-module-${this.name}]`;
    }
}
