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
            for (const element of context.querySelectorAll(`[data-module-${moduleClass.name}]`)) {
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
            if (context && !context.contains(element))
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
