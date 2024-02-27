import { Module } from "./Module";
export type ModuleClass = typeof Module;
export type ModuleClassArray = ModuleClass[];
export type AppOptions = {
    modules: ModuleClassArray;
};
/**
 * The main application class that manages modules.
 *
 * @class
 */
export declare class App {
    /**
     * The array of available module classes.
     * @private
     * @readonly
     */
    private readonly modules;
    private readonly mutationObserver;
    /**
     * Instances of modules associated with HTML elements.
     * @private
     */
    private moduleInstances;
    static instance: App;
    /**
     * Creates an instance of the App class.
     *
     * @constructor
     * @param {AppOptions} options - The options for configuring the App instance.
     */
    constructor(options: AppOptions);
    init(context?: ParentNode): void;
    destroy(context?: ParentNode): void;
    /**
     * Initializes and destroys modules within a specified context or the entire document.
     *
     * @param {ParentNode} [context] - The context in which to initialize modules.
     */
    update(context?: ParentNode): void;
    /**
     * Initialize modules within a specified context or the entire document.
     *
     * @param {ParentNode} [context] - The context in which to initialize modules.
     */
    private initModules;
    /**
     * Destroy modules within a specified context or the entire document.
     *
     * @param {ParentNode} [context] - The context in which to destroy modules.
     * @memberof App
     */
    private destroyModules;
    private mutationCallback;
    private unregisterModuleInstance;
}
