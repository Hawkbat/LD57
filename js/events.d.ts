export declare function emitEvent(name: string, payload?: any): void;
export declare function onEvent(name: string, callback: (event: CustomEvent) => void): void;
export declare function offEvent(name: string, callback: (event: CustomEvent) => void): void;
