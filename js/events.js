const eventDispatcher = new EventTarget();
export function emitEvent(name, payload) {
    const event = new CustomEvent(name, { detail: payload });
    eventDispatcher.dispatchEvent(event);
}
export function onEvent(name, callback) {
    eventDispatcher.addEventListener(name, callback);
}
export function offEvent(name, callback) {
    eventDispatcher.removeEventListener(name, callback);
}
//# sourceMappingURL=events.js.map