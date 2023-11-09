import {Module} from "./Module";



export type Newable<T> = { new (...args: any[]): T; };
export type ModuleClassArray = Newable<Module>[];

export type AppOptions = {
    modules: ModuleClassArray,
    moduleDataName?: string;
}


/**
 * The main application class that manages modules.
 *
 * @class
 */
export class App {

    /**
     * The array of available module classes.
     * @private
     * @readonly
     */
    private readonly modules: ModuleClassArray;

    /**
     * The name used to store module data in HTML elements.
     * @private
     * @readonly
     */
    private readonly moduleDataName: string;

    /**
     * Instances of modules associated with HTML elements.
     * @private
     */
    private moduleInstances: Record<HTMLElement, Module>;



    /**
     * Creates an instance of the App class.
     *
     * @constructor
     * @param {AppOptions} options - The options for configuring the App instance.
     */
    constructor(options: AppOptions) {
        this.modules = options.modules;
        this.moduleDataName = "data-" + (options.moduleDataName ?? "module");

        this.moduleInstances = new Map();
    }



    /**
     * Initialize modules within a specified context or the entire document.
     *
     * @param {HTMLElement} [context] - The context in which to initialize modules.
     * @memberof App
     */
    init(context?: HTMLElement) {
        if (!context) {
            context = document.documentElement;
        }

        this.modules.forEach((moduleClass) => {
            (context as ParentNode).querySelectorAll<HTMLElement>(`[${this.moduleDataName}=${moduleClass.name}]`)
                .forEach((element) => {
                    this.moduleInstances.set(element, {
                        ...this.moduleInstances.get(element) || {},
                        [moduleClass.name]: moduleClass.create(element, true),
                    });
                });
        });
    }

    /**
     * Destroy modules within a specified context or the entire document.
     *
     * @param {HTMLElement} [context] - The context in which to destroy modules.
     * @memberof App
     */
    destroy(context?: HTMLElement) {
        for (const [element, instances] of this.moduleInstances.entries()) {
            if (context && !context.contains(element)) continue;

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
    update(context?: HTMLElement) {
        this.destroy(context);
        this.init(context);
    }
}