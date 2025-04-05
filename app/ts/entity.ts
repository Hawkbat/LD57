
export abstract class Entity {
    get sortOrder(): number {
        return 0
    }
    abstract reset(): void
    abstract update(dt: number): void
    abstract render(ctx: CanvasRenderingContext2D): void
    
    renderLights(ctx: OffscreenCanvasRenderingContext2D): void {

    }
}

const entities: Entity[] = []

export function clearEntities(): void {
    for (const entity of entities) {
        entity.reset()
    }
    entities.length = 0
}

export function resetEntities(): void {
    for (const entity of entities) {
        entity.reset()
    }
}

export function updateEntities(dt: number): void {
    for (const entity of entities) {
        entity.update(dt)
    }
}

export function renderEntities(ctx: CanvasRenderingContext2D): void {
    for (const entity of entities) {
        entity.render(ctx)
    }
}

export function renderEntityLights(ctx: OffscreenCanvasRenderingContext2D): void {
    for (const entity of entities) {
        entity.renderLights(ctx)
    }
}

export function addEntity(entity: Entity): void {
    entities.push(entity)
    entities.sort((a, b) => a.sortOrder - b.sortOrder)
}

export function removeEntity(entity: Entity): void {
    const index = entities.indexOf(entity)
    if (index !== -1) {
        entities.splice(index, 1)
    }
}

export function getEntitiesOfType<T>(type: Function & { prototype: T }): T[] {
    return entities.filter(entity => entity instanceof type) as T[]
}
