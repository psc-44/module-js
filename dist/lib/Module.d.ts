import { EventEmitter } from "@psc-44/event-emitter";
export type ModuleOptions = {
    el: HTMLElement;
};
export type ModuleEventListener = EventListener;
export type ModuleEventListenerOptions = boolean | EventListenerOptions;
/**
 * Base class for creating modular components with event handling.
 */
export declare class Module extends EventEmitter {
    static name: string;
    get name(): string;
    readonly el: HTMLElement;
    private _eventListeners;
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
    constructor(options: ModuleOptions);
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
     * Adds an event listener to one or more elements.
     *
     * @param {HTMLElement[] | HTMLElement} elements - The target element(s) to attach the event listener to.
     * @param {string} eventName - The name of the event to listen for.
     * @param {ModuleEventListener} listener - The event listener function.
     * @param {ModuleEventListenerOptions} [options] - Optional options for the event listener.
     */
    addEventListener(elements: string | HTMLElement[] | HTMLElement, eventName: string, listener: ModuleEventListener, options?: ModuleEventListenerOptions): void;
    /**
     * Finds the first element matching the selector within the module's context or the specified context.
     *
     * @template E - The type of the element.
     * @param {string} selector - The CSS selector for the element.
     * @param {HTMLElement} [contextElement] - The context element to search within.
     * @returns {E | null} The first matching element, or null if not found.
     */
    $<E extends Element = Element>(selector: string, contextElement?: HTMLElement): E | null;
    /**
     * Finds all elements matching the selector within the module's context.
     *
     * @template E - The type of the elements.
     * @param {string} selectors - The CSS selector for the elements.
     * @param {HTMLElement} [contextElement] - The context element to search within.
     * @returns {E[]} An array of matching elements.
     */
    $all<E extends Element = Element>(selectors: string, contextElement?: HTMLElement): E[];
    /**
     * Finds the first parent element matching the selector within the module's context.
     *
     * @param {string} selector - The CSS selector for the parent element.
     * @param {HTMLElement} [contextElement] - The context element to search within.
     * @returns {Element | null} The first matching parent element, or null if not found.
     */
    $parent(selector: string, contextElement?: HTMLElement): Element | null;
    /**
     * Retrieves data attribute value from the module's element.
     *
     * @param {string} name - The name of the data attribute.
     * @param {HTMLElement} [contextElement] - The context element to retrieve data from.
     * @returns {string | null} The value of the data attribute, or null if not found.
     */
    getData(name: string, contextElement?: HTMLElement): string | null;
    /**
     * Sets data attribute value on the module's element.
     *
     * @param {string} name - The name of the data attribute.
     * @param {string | null} value - The value to set. Use null to remove the attribute.
     * @param {HTMLElement} [contextElement] - The context element to set data on.
     */
    setData(name: string, value: string | null, contextElement?: HTMLElement): void;
    /**
     * Generates a custom attribute name based on the module's name and an optional suffix.
     *
     * @param suffix - An optional string to append to the attribute name.
     * @returns The custom attribute name, formatted as "data-{name}" or "data-{name}-{suffix}".
     */
    getAttributeName(suffix?: string): string;
    /**
     * Gets the selector query based on the provided selector.
     *
     * @param {string} selector - The original CSS selector.
     * @returns {string} The modified selector query.
     * @private
     */
    private getSelectorQuery;
    /**
     * Creates a new instance of the module with the provided options.
     * If an instance already exists for the element, it returns the existing instance unless `recreate` is true.
     *
     * @template M - The type of the Module.
     * @param {ModuleOptions} options - Options for configuring the new instance.
     * @param {boolean} [recreate=false] - If true, recreates the instance even if it already exists.
     * @returns {M} The module instance.
     */
    static create<M extends Module>(options: ModuleOptions, recreate?: boolean): M;
    /**
     * Gets the CSS selector for finding elements with the module's data attribute.
     *
     * @returns {string} The CSS selector.
     */
    static getModuleSelector(): string;
}
