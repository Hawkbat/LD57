import { Entity } from "./entity.js";
export declare class Fish extends Entity {
    x: number;
    y: number;
    initialX: number;
    initialY: number;
    facing: number;
    animTime: number;
    constructor(x: number, y: number);
    reset(): void;
    update(dt: number): void;
    render(ctx: CanvasRenderingContext2D): void;
}
