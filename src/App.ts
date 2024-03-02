import {Module} from "./Module";



export type ModuleClass = typeof Module;
export type ModuleClassArray = ModuleClass[];


export type AppOptions = {
    modules: ModuleClassArray,
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
     * Instances of modules associated with HTML elements.
     * @private
     */
    private moduleInstances: Map<HTMLElement, Record<string, Module>>;

    static instance: App;


    /**
     * Creates an instance of the App class.
     *
     * @constructor
     * @param {AppOptions} options - The options for configuring the App instance.
     */
    constructor(options: AppOptions) {
        App.instance = this;

        this.modules = options.modules;

        this.moduleInstances = new Map();
    }



    /**
     * Initialize modules within a specified context or the entire document.
     *
     * @param {ParentNode} [context] - The context in which to initialize modules.
     */
    init(context?: ParentNode) {
        if (!context) {
            context = document.documentElement;
        }

        for (const module of this.modules) {
            const name = module.getName();
            const moduleAttribute = `data-module-${name}`;
            const elements = Array.from(context.querySelectorAll<HTMLElement>(`[${moduleAttribute}]`));

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
    destroy(context?: ParentNode) {
        for (const [element, instances] of this.moduleInstances.entries()) {
            if (context && context !== element && !context.contains(element)) continue;

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
    update(context?: ParentNode) {
        this.destroy(context);
        this.init(context);
    }



    private unregisterModuleInstance(element: HTMLElement, instance?: Module): void
    {
        let instances =  this.moduleInstances.get(element);
        if (!instances) return;

        if (instance) {
            delete instances[instance.name];
        } else {
            instances = {};
        }

        if (Object.keys(instances).length) {
            this.moduleInstances.set(element, instances);
            return;
        }

        this.moduleInstances.delete(element);
    }
}
