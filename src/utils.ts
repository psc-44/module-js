/**
 * Converts a string from PascalCase to kebab-case.
 *
 * @param {string} pascalString - The string to be converted.
 * @returns {string} The converted string in snake_case.
 */
export function pascalToKebab(pascalString: string): string
{
    return pascalString.replace(
        /[A-Z]/g,
        (match, offset) => (offset ? '-' : '') + match.toLowerCase()
    );
}


/**
 * Binds methods of an object to the object itself.
 *
 * @param {object} thisArg - The object whose methods are to be bound.
 * @param {...string} functionNames - Names of the methods to be bound.
 * @returns {void}
 */
export function bind(thisArg: object, ...functionNames: string[]): void
{
    if (!functionNames?.length) {
        functionNames = getObjectProperties(thisArg, (o, prop) => {
            // Exclude Object.prototype properties and only include functions
            try {
                return !Object.prototype.hasOwnProperty(prop) && typeof (thisArg as any)[prop] === "function";
            } catch (error) {
                return false;
            }
        });
    }


    functionNames.forEach((fn) => {
        if (thisArg.hasOwnProperty(fn)) return;

        (thisArg as any)[fn] = ((thisArg as any)[fn]).bind(thisArg);
    });
}

/**
 * Retrieves the properties of an object based on a given predicate.
 *
 * @param {object} obj - The object whose properties are to be retrieved.
 * @param {(obj: object, prop: string) => boolean} predicate - The predicate function to filter the properties.
 * @returns {string[]} An array containing the properties of the object that satisfy the predicate.
 */
function getObjectProperties(obj: object, predicate: (obj: object, prop: string) => boolean): string[]
{
    let properties: string[] = [];
    let currentObj = obj;

    // Iterate over the prototype chain
    while (currentObj) {
        let ownProps = Object.getOwnPropertyNames(currentObj);

        properties.push(...ownProps.filter(prop => predicate(currentObj, prop)));

        // Move up the prototype chain
        currentObj = Object.getPrototypeOf(currentObj);
    }

    return Array.from(new Set(properties));
}


/**
 * Finds the closest ancestor element of a given element that matches the specified selector, up to a specified limit.
 *
 * @template E - The type of the element.
 * @param {ParentNode} element - The element from which to start searching.
 * @param {string} selector - The CSS selector to match against ancestor elements.
 * @param {ParentNode} limit - The limit up to which the search should be conducted. Defaults to the document element.
 * @returns {E | null} The closest ancestor element matching the selector within the specified limit, or null if not found.
 */
export function findParent<E extends HTMLElement>(element: ParentNode, selector: string, limit?: ParentNode): E | null
{
    const limitNode: ParentNode = limit || document.documentElement;
    let parentNode: ParentNode | null = element;

    while (parentNode && parentNode !== limitNode && parentNode instanceof HTMLElement) {
        if (parentNode.matches(selector)) {
            return (parentNode as E);
        }

        parentNode = parentNode.parentNode;
    }

    return null;
}


/**
 * Checks if an element has a particular parent element.
 *
 * @param {ParentNode} element - The element to check for parentage.
 * @param {ParentNode} parent - The parent element to check against.
 * @returns {boolean} True if the element has the specified parent, otherwise false.
 */
export function hasParent(element: ParentNode, parent: ParentNode): boolean
{
    if (!element || !parent) return false;

    if (element === parent) return true;

    if (element.parentElement) {
        return hasParent(element.parentElement, parent);
    }

    return false;
}


/**
 * Returns an event listener function that filters events based on the target element and its ancestors.
 *
 * @param {ParentNode} element - The element to delegate events to.
 * @param {EventListener} listener - The event listener function to be called when the event occurs.
 * @returns {EventListener} The filtered event listener function.
 */
export function getEventFilteredEventListener(element: ParentNode, listener: EventListener): EventListener
{
    return (event) => {
        if (!(event.target instanceof Element)) return;

        if (element === event.currentTarget || hasParent(element, event.target))   {
            Object.defineProperty(event, "currentTarget", { value: element });
            listener(event);
        }
    };
}

/**
 * Returns an event listener function that filters events based on a CSS selector.
 *
 * @param {string} selector - The CSS selector to match against elements.
 * @param {EventListener} listener - The event listener function to be called when the event occurs.
 * @returns {EventListener} The filtered event listener function.
 */
export function getSelectorFilteredEventListener(selector: string, listener: EventListener): EventListener
{
    return (event) => {
        if (!(event.target instanceof Element)) return;

        const $parent = findParent(event.target, selector);
        if (!$parent) return;

        Object.defineProperty(event, "currentTarget", { value: $parent });

        return listener(event);
    };
}


/**
 * Checks if the first character of a string is uppercase.
 *
 * @param {string} string - The input string to be checked.
 * @returns {boolean} Returns true if the first character is uppercase, false otherwise.
 */
export function isFirstCharUppercase(string: string): boolean
{
    return /^[A-Z]/.test(string);
}
