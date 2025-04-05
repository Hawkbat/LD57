export class Entity {
    get sortOrder() {
        return 0;
    }
    renderLights(ctx) {
    }
}
const entities = [];
export function clearEntities() {
    for (const entity of entities) {
        entity.reset();
    }
    entities.length = 0;
}
export function resetEntities() {
    for (const entity of entities) {
        entity.reset();
    }
}
export function updateEntities(dt) {
    for (const entity of entities) {
        entity.update(dt);
    }
}
export function renderEntities(ctx) {
    for (const entity of entities) {
        entity.render(ctx);
    }
}
export function renderEntityLights(ctx) {
    for (const entity of entities) {
        entity.renderLights(ctx);
    }
}
export function addEntity(entity) {
    entities.push(entity);
    entities.sort((a, b) => a.sortOrder - b.sortOrder);
}
export function removeEntity(entity) {
    const index = entities.indexOf(entity);
    if (index !== -1) {
        entities.splice(index, 1);
    }
}
export function getEntitiesOfType(type) {
    return entities.filter(entity => entity instanceof type);
}
//# sourceMappingURL=entity.js.map