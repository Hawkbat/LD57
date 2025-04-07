export class Action {
    name;
    keys;
    pressed = false;
    released = false;
    held = false;
    constructor(name, keys) {
        this.name = name;
        this.keys = keys;
    }
    changeState(down) {
        if (down) {
            this.pressed = true;
            this.held = true;
        }
        else {
            this.released = true;
            this.held = false;
        }
    }
    update() {
        if (this.pressed) {
            this.pressed = false;
        }
        if (this.released) {
            this.released = false;
        }
    }
    eat() {
        this.pressed = false;
        this.released = false;
    }
}
export const ACTIONS = {
    up: new Action('Move Up', ['KeyW', 'ArrowUp']),
    down: new Action('Move Down', ['KeyS', 'ArrowDown']),
    left: new Action('Move Left', ['KeyA', 'ArrowLeft']),
    right: new Action('Move Right', ['KeyD', 'ArrowRight']),
    interact: new Action('Interact', ['KeyE', 'Space']),
    cancel: new Action('Cancel', ['Escape']),
};
export const ACTION_LIST = Object.values(ACTIONS);
window.addEventListener('keydown', e => {
    for (const action of ACTION_LIST) {
        if (action.keys.includes(e.code)) {
            action.changeState(true);
        }
    }
});
window.addEventListener('keyup', e => {
    for (const action of ACTION_LIST) {
        if (action.keys.includes(e.code)) {
            action.changeState(false);
        }
    }
});
export function updateActions() {
    for (const a of ACTION_LIST)
        a.update();
}
//# sourceMappingURL=input.js.map