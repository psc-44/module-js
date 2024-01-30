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
- Set module scoped events with delegation.
- Select module scoped DOM elements.
- Efficient module destruction witch automatically removes custom and scoped events.


## Usage
### Main file
```js
import {App} from "@psc-44/module-js";
import {YourModule} from "./modules/YourModule.js";

const app = new App({
    modules: [
        YourModule,
    ],
});

app.init();
```


### Module example
```html
<div data-module-my-module>
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
    static name = "my-module";

    get name() {
        return MyModule.name;
    }
	
    constructor(options) {
        super(options);
		
		this.onButtonClick = this.onButtonClick.bind(this);
    }
	
	init() {
		this.addEventListener(this.$("button"), this.onButtonClick);
    }

    onButtonClick() {
        console.log("Hello world");
    }
}
```

## Module Methods
| Method                                                              | Description                                                                                                                                                                                                                 | Example                                                                                                                                      |
|---------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| `this.init()`                                                       | Automatically called on app init. Override this method in subclasses instead of using the `constructor`.                                                                                                                    | `this.init()`                                                                                                                                |
| `this.destroy()`                                                    | Automatically called on app destroy. Override this method if you need to destroy anything specific. The events bound by the `EventEmitter` and `this.addEventListener()` are automatically destroyed by the `Module` class. | `this.destroy()`                                                                                                                             |
| `this.addEventListener(elements, "eventName", listener[, options])` | Adds an event listener to one or more elements.                                                                                                                                                                             | `this.addEventListener(document.getElementById("scroll-container"), "scroll", (event) => console.log("onScroll", event), { passive: true })` |
| `this.$("selector"[, contextElement])`                              | Finds the first element matching the selector within the module's or specified context. You can also use basic CSS selectors like `.`, `#`, or `[]`.                                                                        | `this.$("button")`                                                                                                                           |
| `this.$all("selector"[, contextElement])`                           | Finds all elements matching the selector within the module's or specified context. You can also use basic CSS selectors like `.`, `#`, or `[]`.                                                                             | `this.$all("item")`                                                                                                                          |
| `this.$parent("selector"[, contextElement])`                        | Finds the first parent element matching the selector within the module's or specified context. You can also use basic CSS selectors like `.`, `#`, or `[]`.                                                                 | `this.$parent("wrapper")`                                                                                                                    |
| `this.getData("name"[, contextElement])`                            | Retrieves data attribute value from the module's or context element.                                                                                                                                                        | `this.getData("repeat-animation")`                                                                                                           |
| `this.setData("name", "value"[, contextElement])`                   | Sets data attribute value on the module's or context element.                                                                                                                                                               | `this.setData("count", "5")`                                                                                                                 |
| `this.getAttributeName(["name"])`                                   | Generates a custom attribute name based on the module's name and an optional suffix.                                                                                                                                        | `this.getAttributeName("repeat-animation")`                                                                                                  |
| `MyModule.create(options[, recreate = false])`                      | Creates a new instance of the module with the provided options. If an instance already exists for the element, it returns the existing instance unless `recreate` is true.                                                  | `this.create({ el: moduleElement })`                                                                                                  |
| `MyModule.getModuleSelector()`                                      | Gets the CSS selector for finding elements with the module's data attribute.                                                                                                                                                | `this.getModuleSelector()`                                                                                                         |


## App Methods
| Method                    | Description                                                           | Example                                             |
|---------------------------|-----------------------------------------------------------------------|-----------------------------------------------------|
| `this.init([context])`    | Initialize modules within a specified context or the entire document. | `this.init(document.getElementById("container")`    |
| `this.destroy([context])` | Destroy modules within a specified context or the entire document.    | `this.destroy(document.getElementById("container")` |
| `this.update([context])`  | Update modules within a specified context or the entire document.     | `this.update(document.getElementById("container")`  |
