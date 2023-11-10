# Event Emitter

Simple event emitter to create custom class events.

## Installation
```shell
yarn add @psc-44/event-emitter
```

## Usage
### Class example
```ts
import {EventEmitter} from "@psc-44/event-emitter";

class Modal extends EventEmitter {
    
    open() {
        this.emit("open", {
            // custom data
        });
    }
    
}
```
### Parent example
```ts
const modal = new Modal();
const callback = (data) => console.log("Modal opened", data);

modal.on("open", callback);
modal.open();
// output: Modal opened
// output: {}

modal.off("open", callback);
modal.open();
// output:
```


## Methods
| Method                               | Description                          | Example                                          |
|--------------------------------------|--------------------------------------|--------------------------------------------------|
| `this.on("name", "cb")`              | Listen to an event.                  | `this.on("open", () => console.log("opened"))`   |
| `this.off("name", "cb")`             | Stop listen to an event.             | `this.off("open", () => console.log("opened"))`  |
| `this.emit("name"[, "data"])`        | Emit an event.                       | `this.emit("open", { trigger: triggerElement })` |
| `this.eventExists("name"): boolean`  | Checks if an event exists.           | `this.eventExists("open")`                       |
| `this.clearEvents()`                 | Clear all events.                    | `this.clearEvents()`                             |
| `this.eventsCount(): number`         | Get the number of registered events. | `this.eventsCount`                               |

