export declare class Action {
    name: string;
    keys: string[];
    pressed: boolean;
    released: boolean;
    held: boolean;
    constructor(name: string, keys: string[]);
    changeState(down: boolean): void;
    update(): void;
}
export declare const ACTIONS: {
    up: Action;
    down: Action;
    left: Action;
    right: Action;
    interact: Action;
    cancel: Action;
};
export declare const ACTION_LIST: Action[];
export declare function updateActions(): void;
