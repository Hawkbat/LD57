
const eventDispatcher = new EventTarget()

export function emitEvent(name: string, payload?: any) {
    const event = new CustomEvent(name, { detail: payload })
    eventDispatcher.dispatchEvent(event)
}

export function onEvent(name: string, callback: (event: CustomEvent) => void) {
    eventDispatcher.addEventListener(name, callback as EventListener)
}

export function offEvent(name: string, callback: (event: CustomEvent) => void) {
    eventDispatcher.removeEventListener(name, callback as EventListener)
}
