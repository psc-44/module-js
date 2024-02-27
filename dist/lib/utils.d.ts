/**
 * Converts a string from PascalCase to kebab-case.
 *
 * @param {string} pascalString - The string to be converted.
 * @returns {string} The converted string in snake_case.
 */
export declare function pascalToKebab(pascalString: string): string;
/**
 * Binds methods of an object to the object itself.
 *
 * @param {object} thisArg - The object whose methods are to be bound.
 * @param {...string} functionNames - Names of the methods to be bound.
 * @returns {void}
 */
export declare function bind(thisArg: object, ...functionNames: string[]): void;
/**
 * Finds the closest ancestor element of a given element that matches the specified selector, up to a specified limit.
 *
 * @template E - The type of the element.
 * @param {ParentNode} element - The element from which to start searching.
 * @param {string} selector - The CSS selector to match against ancestor elements.
 * @param {ParentNode} limit - The limit up to which the search should be conducted. Defaults to the document element.
 * @returns {E | null} The closest ancestor element matching the selector within the specified limit, or null if not found.
 */
export declare function findParent<E extends HTMLElement>(element: ParentNode, selector: string, limit?: ParentNode): E | null;
/**
 * Checks if an element has a particular parent element.
 *
 * @param {ParentNode} element - The element to check for parentage.
 * @param {ParentNode} parent - The parent element to check against.
 * @returns {boolean} True if the element has the specified parent, otherwise false.
 */
export declare function hasParent(element: ParentNode, parent: ParentNode): boolean;
/**
 * Returns an event listener function that filters events based on the target element and its ancestors.
 *
 * @param {ParentNode} element - The element to delegate events to.
 * @param {EventListener} listener - The event listener function to be called when the event occurs.
 * @returns {EventListener} The filtered event listener function.
 */
export declare function getEventFilteredEventListener(element: ParentNode, listener: EventListener): EventListener;
/**
 * Returns an event listener function that filters events based on a CSS selector.
 *
 * @param {string} selector - The CSS selector to match against elements.
 * @param {EventListener} listener - The event listener function to be called when the event occurs.
 * @returns {EventListener} The filtered event listener function.
 */
export declare function getSelectorFilteredEventListener(selector: string, listener: EventListener): EventListener;
