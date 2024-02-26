import { Module } from "./Module";
import { pascalToSnake } from "./utils";
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
    modules;
    mutationObserver;
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
        this.mutationObserver = new MutationObserver(this.mutationCallback.bind(this));
    }
    init(context) {
        this.initModules(context);
        this.mutationObserver.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }
    destroy(context) {
        this.mutationObserver.disconnect();
        this.destroyModules(context);
    }
    /**
     * Initializes and destroys modules within a specified context or the entire document.
     *
     * @param {ParentNode} [context] - The context in which to initialize modules.
     */
    update(context) {
        this.destroyModules(context);
        this.initModules(context);
    }
    /**
     * Initialize modules within a specified context or the entire document.
     *
     * @param {ParentNode} [context] - The context in which to initialize modules.
     */
    initModules(context) {
        if (!context) {
            context = document.documentElement;
        }
        for (const module of this.modules) {
            const name = pascalToSnake(module.name);
            const moduleAttribute = `data-module-${name}`;
            const elements = Array.from(context.querySelectorAll(`[${moduleAttribute}]`));
            if (context instanceof HTMLElement && context.hasAttribute(moduleAttribute)) {
                elements.push(context);
            }
            for (const element of elements) {
                if (element.dataset.ignoreModule)
                    continue;
                if (this.getRegisteredModuleInstance(element, name))
                    continue;
                const moduleInstance = module.create(element, true);
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
    destroyModules(context) {
        for (const [element, instances] of this.moduleInstances.entries()) {
            if (context && context !== element && !context.contains(element))
                continue;
            Object.values(instances).forEach((instance) => {
                instance.destroy();
                this.unregisterModuleInstance(element, instance);
            });
        }
    }
    mutationCallback(mutations) {
        mutations.forEach((mutation) => {
            for (const node of mutation.removedNodes) {
                if (node.nodeType !== Node.ELEMENT_NODE)
                    continue;
                if (!(node instanceof HTMLElement))
                    continue;
                this.destroyModules(node);
            }
            if (!(mutation.target instanceof HTMLElement))
                return;
            this.initModules(mutation.target);
        });
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
    getRegisteredModuleInstance(element, name) {
        const instances = this.moduleInstances.get(element);
        if (!instances)
            return null;
        if (name && instances.hasOwnProperty(name) && instances[name] instanceof Module)
            return instances[name];
        return null;
    }
}
