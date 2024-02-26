# module-js

A framework designed to facilitate the management and initialization of visible components. It provides a foundation for creating modular components with event handling capabilities.

## Installation
```shell
yarn add @psc-44/module-js
```

## Why
- Modular application structure.
- Centralized module management system to easily initialize, update, and destroy modules within specified contexts.
- Encourages code reusability and extensibility.
- Set module-scoped events.
- Select module-scoped DOM elements.
- Efficient module destruction that automatically removes events.


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
        this.addEventListener("button", () => {
            console.log(this.getData("say")); // Output: "Hello world"
        });
    }
}
```
## Module options
Set these option in your module sub class.

| Option                   | Type          | Default | Description                                                   |
|--------------------------|---------------|---------|---------------------------------------------------------------|
| `this.autoQueryElements` | `boolean`     | `false` | Query all elements on `init()`                                |
| `this.autoBind`          | `boolean`     | `true`  | Bind `this` to all module methods on `init()`                 |
| `this.el`                | `HTMLElement` |         | The modules root element.                                     |
| `this.$elements`         | `object`      | `null`  | Object of html elements bound by the modules data attributes. |




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
| `Module.getModuleSelector()`                                                  | Returns the CSS selector of the module's data attribute.                                                                                                                                                                                                                                         | `MyModule.getModuleSelector()`                                                                                |
| `Module.create(element[, recreate = false])`                                  | Creates a new instance of the module with the provided options. If an instance already exists for the element, it returns the existing instance unless `recreate` is true.                                                                                                                       | `MyModule.create(element)`                                                                                    |
| `Module.findModuleInTree(element)`                                            | Finds and returns the module associated with the given HTML element within the module tree.                                                                                                                                                                                                      | `MyModule.findModuleInTree(element)`                                                                          |


## App Methods
| Method                    | Description                                                           | Example          |
|---------------------------|-----------------------------------------------------------------------|------------------|
| `this.init([context])`    | Initialize modules within a specified context or the entire document. | `this.init()`    |
| `this.destroy([context])` | Destroy modules within a specified context or the entire document.    | `this.destroy()` |
| `this.update([context])`  | Update modules within a specified context or the entire document.     | `this.update()`  |


## Credits
This code is inspired by [modularJS](https://github.com/modularorg/modularjs).
