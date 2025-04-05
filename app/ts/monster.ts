import { Entity } from "./entity.js"

export abstract class Monster extends Entity {
    public x: number = 0
    public y: number = 0

    abstract hit(damage: number): void
}
