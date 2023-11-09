export class Module {

    static name;

    public readonly el: HTMLElement;

    constructor(el) {
        this.el = el;
    }


    static getModuleSelector() {
        return `[]`
    }
}