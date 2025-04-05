import { Entity } from "./entity.js";
export declare abstract class Monster extends Entity {
    x: number;
    y: number;
    abstract hit(damage: number): void;
}
