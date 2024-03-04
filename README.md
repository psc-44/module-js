# module-js

A framework designed to facilitate the management and initialization of visible components. It provides a foundation for creating modular components with event handling capabilities.


## Table of contents
* [Why](#why)
* [Installation](#installation)
* [Usage](#usage)
* [Module Options](#module-options)
* [Module Methods](#module-methods)
* [App Methods](#app-methods)
* [Examples](#examples)
* [Good to know](#good-to-know)
* [Credits](#credits)


## Why
- Modular application structure.
- Centralized module management system to easily initialize, update, and destroy modules within specified contexts.
- Encourages code reusability and extensibility.
- Set module-scoped events.
- Select module-scoped DOM elements.
- Efficient module destruction that automatically removes events.


## Installation
```shell
yarn add @psc-44/module-js
```


## Usage
### Main file
```js
import {App} from "@psc-44/module-js";
import {MyModule} from "./modules/MyModule.js";

const app = new App({
    modules: [
        MyModule,
    ],
});

app.init();
```


### Module example
```html
<div data-module-my-module data-my-module-say="Hello world">
    <h1>
        MyModule
    </h1>
    
    <button data-my-module="button">
        Click here
    </button>
</div>
```
```js
import { Module } from "@psc-44/module-js";

export class MyModule extends Module {
    
    constructor(options) {
        super(options);
    }
	
    init() {
        this.addEventListener("button", "click", () => {
            console.log(this.getData("say")); // Output: "Hello world"
        });
    }
}
```
## Module options
Set these option in your module sub class.

| Option                   | Type          | Default | Description                                                                                                                                                |
|--------------------------|---------------|---------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `this.autoQueryElements` | `boolean`     | `false` | Query all module-scoped elements on `init()`                                                                                                               |
| `this.autoBind`          | `boolean`     | `true`  | Bind `this` to all module methods on `init()`                                                                                                              |
| `this.el`                | `HTMLElement` |         | The modules root element. This is set automatically when the module is created.                                                                            |
| `this.$elements`         | `object`      | `null`  | Object of html elements bound by the modules data attributes.<br>This is set automatically on `init()` when the `this.autoQueryElements` is set to `true`. |




## Module Methods
| Method                                                                        | Description                                                                                                                                                                                                                                                                                      | Example                                                                                                       |
|-------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|
| `this.init()`                                                                 | Automatically called on app init.<br>Override this method in subclasses instead of using the `constructor`.                                                                                                                                                                                      | `this.init()`                                                                                                 |
| `this.destroy()`                                                              | Automatically called on app destroy.<br>Override this method if you need to destroy anything specific.<br>The events bound by the `EventEmitter`, `this.addEventListener()` or `this.addFilteredEventListener()` are automatically destroyed by the `Module` class.                              | `this.destroy()`                                                                                              |
| `this.addEventListener(targets, type, listener[, options])`                   | Adds an event listener to one or more DOM elements.<br>`targets` can be one or more DOM elements, module scoped selector (as shown in the previous example with the say hello button) or a CSS selector. Note that selectors such as "input" or "button" are considered module-scoped selectors. | `this.addEventListener("button", "click", (event) => console.log("onClickButton", event))`                    |
| `this.addFilteredEventListener(targets, type, listener, selector[, options])` | Adds a filtered event listener to one or more DOM elements.<br>See the note on `targets` and `selector` in `this.addEventListener`.                                                                                                                                                              | `this.addFilteredEventListener(this.el, "click", (event) => console.log("onClickPost", event), "postAnchor")` |
| `this.removeEventListener(targets, type[, options])`                          | Removes an event listener to one or more DOM elements.<br>See the note on `targets` in `this.addEventListener`. Note that all events bound by the modules container or `EventEmitter` functions are removed automatically on `this.destroy`.                                                     | `this.removeEventListener("button", "click")`                                                                 |
| `this.dispatchDomEvent(type[, detail])`                                       | Dispatches a custom DOM event from the current element with the specified type and optional details. The module is automatically set in the detail object.                                                                                                                                       | `this.dispatchDomEvent("updated", { value: 3 })`                                                              |
| `this.$(selector[, context, useModuleSelector])`                              | Finds the first element matching the selector within the module's or specified context. You can also use basic CSS selectors like `.`, `#`, or `[]`. Note that selectors such as `"input"` or `"button"` are considered module-scoped selectors unless you set `useModuleSelector` to `false`.   | `this.$("button")`                                                                                            |
| `this.$all("selector"[, context, useModuleSelector])`                         | Finds all elements matching the selector within the module's or specified context.<br>See the note on `selector` in `this.$`.                                                                                                                                                                    | `this.$all("item")`                                                                                           |
| `this.$parent("selector"[, context, useModuleSelector])`                      | Finds the first parent element matching the selector within the module's or specified context. <br>See the note on `selector` in `this.$`.                                                                                                                                                       | `this.$parent("wrapper")`                                                                                     |
| `this.getData(name[, context])`                                               | Retrieves data attribute value from the module's or context element.                                                                                                                                                                                                                             | `this.getData("repeat-animation")`                                                                            |
| `this.setData(name, value[, context])`                                        | Sets the data attribute value on the module's or context element.                                                                                                                                                                                                                                | `this.setData("count", "5")`                                                                                  |
| `static` `getModuleSelector()`                                                | Returns the CSS selector of the module's data attribute.                                                                                                                                                                                                                                         | `MyModule.getModuleSelector()`                                                                                |
| `static` `create(element[, recreate = false])`                                | Creates a new instance of the module with the provided options. If an instance already exists for the element, it returns the existing instance unless `recreate` is true.                                                                                                                       | `MyModule.create(element)`                                                                                    |
| `static` `findModuleInTree(element)`                                          | Finds and returns the module associated with the given HTML element within the module tree.                                                                                                                                                                                                      | `MyModule.findModuleInTree(element)`                                                                          |


## App Methods
You can call these functions from everywhere using the static `instance` property on the `App` class.

| Method                    | Description                                                           | Example                                |
|---------------------------|-----------------------------------------------------------------------|----------------------------------------|
| `this.init([context])`    | Initialize modules within a specified context or the entire document. | `this.init()` or `App.instance.init()` |
| `this.destroy([context])` | Destroy modules within a specified context or the entire document.    | `this.destroy()`                       |
| `this.update([context])`  | Update modules within a specified context or the entire document.     | `this.update()`                        |


## Examples
### Dialog example
```html
<dialog class="data-module-dialog">
    <h2 data-dialog="label">
        Dialog
    </h2>
    
    <button data-dialog="accept">
        Accept
    </button>
    <button data-dialog="decline">
        Decline
    </button>
</dialog>
```
```js
import { Module } from "@psc-44/module-js";

export class Dialog extends Module {

    constructor(options) {
        super(options);
    }

    init() {
        this.addEventListener("accept", "click", this.accept);
        this.addEventListener("decline", "click", this.close);
        
        this.open();
    }
    
    open() {
        this.el.classList.add("is-open");
    }
    
    accept() {
        this.$("label").textContent = "Thank you!";
        this.$("accept").style.display = "none";
        this.$("decline").textContent = "Close";
    }
    
    close() {
        this.el.classList.remove("is-open");
    }
}
```

### Accordion example
```html
<div data-module-accordion data-accordion-open="true">
    <section data-accordion="section">
        <header data-accordion="header">
            <h2>
                Title
            </h2>
        </header>
        <div data-accordion="main">
            <p>
                Content
            </p>
        </div>
    </section>
    <section data-accordion="section">
        <header data-accordion="header">
            <h2>
                Title
            </h2>
        </header>
        <div data-accordion="main">
            <p>
                Content
            </p>
        </div>
    </section>
</div>
```
```js
import { Module } from "@psc-44/module-js";

export class Accordion extends Module {

    constructor(options) {
        super(options);
    }

    init() {
        this.addEventListener("header", "click", this.toggleSection);
        
        if (this.getData("open")) {
            this.$("section").classList.add("is-open");
        }
    }

    toggleSection(event) {
        const target = event.currentTarget;
        const section = this.$parent("section", target);

        if (section.classList.contains("is-open")) {
            section.classList.remove("is-open");
        } else {
            this.$("section.is-open").classList.remove("is-open");
            section.classList.add("is-open");
            Scroll.instance.scrollTo(this.el); // Add your scroll to logic here
        }
    }
}
```

### Advanced accordion example
```html
<div data-module-accordion-group>
    <section data-module-accordion class="is-open">
        <header data-accordion="header">
            <h2>
                Title
            </h2>
        </header>
        <div data-accordion="main">
            <p>
                Content
            </p>
        </div>
    </section>
    <section data-module-accordion>
        <header data-accordion="header">
            <h2>
                Title
            </h2>
        </header>
        <div data-accordion="main">
            <p>
                Content
            </p>
        </div>
    </section>
</div>
```
```js
import { Module } from "@psc-44/module-js";

export class Accordion extends Module {

    constructor(options) {
        super(options);
    }

    init() {
        this.addEventListener(this.el, "click", this.toggle);
    }
    
    open() {
        this.el.classList.add("is-open");
        this.dispatchDomEvent("open");
        Scroll.instance.scrollTo(this.el);
    }
    
    close() {
        this.el.classList.remove("is-open");
    }
    
    isOpen() {
        return this.el.classList.contains("is-open");
    }
    
    toggle() {
        if (this.isOpen()) {
            this.close();
            return;
        }
        
        this.open();
    }
}
```
```js
import { Module } from "@psc-44/module-js";

export class AccordionGroup extends Module {

    constructor(options) {
        super(options);
    }

    init() {
        this.$items = this.$all(Accordion.getModuleSelector());
        
        this.accordions = this.$items.map(($item) => {
            const instance = Accorion.create($item);
            this.addEventListener(instance.el, "open", this.onAccordionOpen);
            return instance;
        });
    }
    
    destroy() {
        this.accordions.forEach((accordion) => accordion.destroy());
    }
    
    onAccordionOpen(event) {
        this.accordions.forEach((accordion) => {
            if (accordion === event.detail.module) return;
            
            accordion.close();
        });
    }
}
```


## Good to know
Since modules are identified by the class name, problems may arise with long names or when using minification tools that alter class names. To address this issue, a static property `name` can be set in classes that extend from the `Module` class. Note that this name should be specified in either kebab-case or PascalCase.<br>Here are a few examples:
```js
// Long name

class ExampleModuleWithARaellyLongFuckingNameThatNoOneWillEverHave extends Module {
    static name = "Example"; // Elements with "data-module-example" are associated with this class.
}

class CookieConsentDialog extends Module {
    static name = "cc-dialog"; // Elements with "data-module-cc-dialog" are associated with this class.
}


// Minify

class YourModule extends Module {
    static name = "YourModule"; // Elements with "data-module-your-module" are associated with this class.
}

class YourModule extends Module {
    static name = "your-module"; // Elements with "data-module-your-module" are associated with this class.
}
```

## Credits
This code is inspired by [modularJS](https://github.com/modularorg/modularjs).
