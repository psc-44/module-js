import {Module} from "./Module";
import {pascalToSnake} from "./utils";



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
    private readonly mutationObserver: MutationObserver;

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

        this.mutationObserver = new MutationObserver(this.mutationCallback.bind(this));
    }



    init(context?: ParentNode) {
        this.initModules(context);

        this.mutationObserver.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }

    destroy(context?: ParentNode) {
        this.mutationObserver.disconnect();

        this.destroyModules(context);
    }

    /**
     * Initializes and destroys modules within a specified context or the entire document.
     *
     * @param {ParentNode} [context] - The context in which to initialize modules.
     */
    update(context?: ParentNode) {
        this.destroyModules(context);
        this.initModules(context);
    }



    /**
     * Initialize modules within a specified context or the entire document.
     *
     * @param {ParentNode} [context] - The context in which to initialize modules.
     */
    private initModules(context?: ParentNode) {
        if (!context) {
            context = document.documentElement;
        }

        for (const module of this.modules) {
            const name = pascalToSnake(module.name);
            const moduleAttribute = `data-module-${name}`;
            const elements = Array.from(context.querySelectorAll<HTMLElement>(`[${moduleAttribute}]`));

            if (context instanceof HTMLElement && context.hasAttribute(moduleAttribute)) {
                elements.push(context);
            }

            for (const element of elements) {
                if (element.dataset.ignoreModule) continue;

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
    private destroyModules(context?: ParentNode) {
        for (const [element, instances] of this.moduleInstances.entries()) {
            if (context && context !== element && !context.contains(element)) continue;

            Object.values(instances).forEach((instance) => {
                instance.destroy();
                this.unregisterModuleInstance(element, instance);
            });
        }
    }



    private mutationCallback(mutations: MutationRecord[]): void
    {
        mutations.forEach((mutation) => {
            for (const node of mutation.removedNodes) {
                if (node.nodeType !== Node.ELEMENT_NODE) continue;

                if (!(node instanceof HTMLElement)) continue;

                this.destroyModules(node);
            }

            if (!(mutation.target instanceof HTMLElement)) return;

            this.initModules(mutation.target);
        });
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
