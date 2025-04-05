import { Entity } from "./entity.js";
export declare class Boat extends Entity {
    reset(): void;
    update(dt: number): void;
    render(ctx: CanvasRenderingContext2D): void;
}
export declare const boat: Boat;
