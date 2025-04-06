import { Entity } from "./entity.js";
export declare class Debris extends Entity {
    x: number;
    y: number;
    dx: number;
    dy: number;
    fadeTime: number;
    frameSeed: number;
    constructor(x: number, y: number);
    reset(): void;
    update(dt: number): void;
    render(ctx: CanvasRenderingContext2D): void;
}
