export type ModuleElements = Record<string, (HTMLElement | HTMLElement[])>;
/**
 * Base class for creating modular components with event handling.
 */
export declare class Module {
    static name: string;
    private readonly _name;
    private readonly _moduleAttribute;
    private readonly _eventListeners;
    readonly el: HTMLElement;
    $elements: null | ModuleElements;
    autoQueryElements: boolean;
    autoBind: boolean;
    get name(): string;
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
    constructor(el: HTMLElement);
    /**
     * Initialization method for the module. Override this method in subclasses.
     *
     * @note Perform operations such as value extraction and other setup that are intended
     * to occur once during the initialization phase. Keep in mind that modules may undergo
     * updates (destroy and init) without necessitating the creation of a new instance.
     */
    init(): void;
    /**
     * Destructor method for the module. Removes all event listeners.
     */
    destroy(): void;
    /**
     * Adds an event listener to one or more DOM elements.
     *
     * @param {string | EventTarget | EventTarget[]} targets - The target element(s) or module scoped element(s) to attach the event listener to. Can be a string selector, a single DOM element, or an array of DOM elements.
     * @param {string} type - A string representing the event type to listen for, e.g., "click" or "mouseover".
     * @param {EventListenerOrEventListenerObject} listener - The function or object that receives a notification when an event of the specified type occurs.
     * @param {null | boolean | AddEventListenerOptions} options - An optional parameter that specifies characteristics about the event listener.
     * @returns {void}
     */
    addEventListener(targets: string | EventTarget | EventTarget[], type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    /**
     * Removes an event listener from one or more DOM elements or targets.
     *
     * @param {string | EventTarget | EventTarget[]} targets - The target element(s) or module scoped element(s) from which to remove the event listener. Can be a string selector, a single DOM element, or an array of DOM elements.
     * @param {string} type - A string representing the event type for which to remove the listener, e.g., "click" or "mouseover".
     * @param {null | boolean | EventListenerOptions} options - An optional parameter that specifies characteristics about the event listener.
     * @returns {void}
     */
    removeEventListener(targets: string | EventTarget | EventTarget[], type: string, options?: boolean | EventListenerOptions): void;
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
    addFilteredEventListener(targets: string | EventTarget | EventTarget[], type: string, listener: EventListener, selector: string, options?: boolean | AddEventListenerOptions): void;
    /**
     * Dispatches a custom DOM event from the current element with the specified type and optional details.
     *
     * @param {string} type - The type of the custom event to dispatch.
     * @param {object=} detail - An optional object containing additional data to include with the event. Defaults to an empty object if not provided.
     * @returns {void}
     */
    dispatchDomEvent(type: string, detail?: object): void;
    /**
     * Returns a filtered event listener function that listens to events delegated to elements matching the specified selector within the module.
     *
     * @param {string} selector - A CSS selector string representing the elements to which the event listener will be attached. @see {getSelectorQuery}
     * @param {EventListener} listener - The event listener function to be called when the event occurs.
     * @returns {EventListener} The filtered event listener function for the specified selector within the module.
     */
    getModuleSelectorFilteredEventListener(selector: string, listener: EventListener): EventListener;
    /**
     * Finds the first element matching the selector within the module's context or the specified context.
     *
     * @template E - The type of the element.
     * @param {string} selector - The CSS selector for the element.
     * @param {ParentNode} [context] - The context element to search within.
     * @param {boolean} useModuleSelector - An optional parameter indicating whether to use module-specific selectors. Default is true.
     * @returns {E | null} The first matching element, or null if not found.
     */
    $<E extends HTMLElement = HTMLElement>(selector: string, context?: ParentNode, useModuleSelector?: boolean): E | null;
    /**
     * Finds all elements matching the selector within the module's context.
     *
     * @template E - The type of the elements.
     * @param {string} selector - The CSS selector for the elements.
     * @param {ParentNode} [context] - The context element to search within.
     * @param {boolean} useModuleSelector - An optional parameter indicating whether to use module-specific selectors. Default is true.
     * @returns {E[]} An array of matching elements.
     */
    $all<E extends HTMLElement = HTMLElement>(selector: string, context?: ParentNode, useModuleSelector?: boolean): E[];
    /**
     * Finds the first parent element matching the selector within the module's context.
     *
     * @template E - The type of the element.
     * @param {string} selector - The CSS selector for the parent element.
     * @param {ParentNode} [context] - The context element to search within.
     * @param {boolean} useModuleSelector - An optional parameter indicating whether to use module-specific selectors. Default is true.
     * @returns {E | null} The first matching parent element, or null if not found.
     */
    $parent<E extends HTMLElement>(selector: string, context?: ParentNode, useModuleSelector?: boolean): E | null;
    private queryModuleElements;
    /**
     * Retrieves data attribute value from the module's element.
     *
     * @param {string} name - The name of the data attribute.
     * @param {HTMLElement} [context] - The context element to retrieve data from.
     * @returns {string | null} The value of the data attribute, or null if not found.
     */
    getData(name: string, context?: HTMLElement): string | null;
    /**
     * Sets data attribute value on the module's element.
     *
     * @param {string} name - The name of the data attribute.
     * @param {string | null} value - The value to set. Use null to remove the attribute.
     * @param {HTMLElement} [context] - The context element to set data on.
     */
    setData(name: string, value: string | null, context?: HTMLElement): void;
    /**
     * Returns the module attribute with an optional value appended.
     *
     * @param {string | null} value - An optional value to append to the module attribute. If not provided, only the attribute itself is returned.
     * @returns {string} The module attribute with an optional value appended, or just the attribute if no value is provided.
     */
    getModuleAttribute(value?: string): string;
    /**
     * Generates a custom attribute name based on the module's name and an optional suffix.
     *
     * @param suffix - An optional string to append to the attribute name.
     * @returns The custom attribute name, formatted as "data-{name}" or "data-{name}-{suffix}".
     */
    getModuleAttributeName(suffix?: string): string;
    /**
     * Returns the selector query based on the provided selector.
     *
     * @param {string} selector - The original CSS selector.
     * @returns {string} The modified selector query.
     * @private
     */
    getSelectorQuery(selector: string): string;
    /**
     * Returns the name of the class in snake_case format.
     *
     * @returns {string}
     */
    static getName(): string;
    /**
     * Returns the CSS selector of the module's data attribute.
     *
     * @returns {string}
     */
    static getModuleSelector(): string;
    private static getInstance;
    /**
     * Creates a new instance of a module associated with the given HTML element or retrieves an existing instance if available.
     *
     * @template M - The type of module to be created or retrieved.
     * @param {HTMLElement} element - The HTML element to associate with the module instance.
     * @param {boolean} recreate - Optional. Indicates whether to recreate the module instance if it already exists. Defaults to false.
     * @returns {M} The newly created or existing module instance associated with the given HTML element.
     */
    static create<M extends Module>(element: HTMLElement, recreate?: boolean): M;
    /**
     * Finds and returns the module element associated with the given HTML element within the module tree.
     *
     * @param {HTMLElement} element - The HTML element to search for within the module tree.
     * @returns {null | HTMLElement} The module element associated with the given HTML element if found, or null if not found.
     */
    private static findModuleElementInTree;
    /**
     * Finds and returns the module associated with the given HTML element within the module tree.
     *
     * @param {HTMLElement} element - The HTML element to search for within the module tree.
     * @returns {null | M} The module associated with the given HTML element if found, or null if not found.
     * @template M - The type of module to be returned.
     */
    static findModuleInTree<M extends Module>(element: HTMLElement): null | M;
}
