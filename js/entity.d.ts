export declare abstract class Entity {
    get sortOrder(): number;
    abstract reset(): void;
    abstract update(dt: number): void;
    abstract render(ctx: CanvasRenderingContext2D): void;
    renderLights(ctx: OffscreenCanvasRenderingContext2D): void;
}
export declare function clearEntities(): void;
export declare function resetEntities(): void;
export declare function updateEntities(dt: number): void;
export declare function renderEntities(ctx: CanvasRenderingContext2D): void;
export declare function renderEntityLights(ctx: OffscreenCanvasRenderingContext2D): void;
export declare function addEntity(entity: Entity): void;
export declare function removeEntity(entity: Entity): void;
export declare function getEntitiesOfType<T>(type: Function & {
    prototype: T;
}): T[];
