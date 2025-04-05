import { Entity } from "./entity.js";
export declare class Angler extends Entity {
    x: number;
    y: number;
    dx: number;
    dy: number;
    facing: number;
    alerted: boolean;
    animTime: number;
    reset(): void;
    update(dt: number): void;
    render(ctx: CanvasRenderingContext2D): void;
    renderLights(ctx: OffscreenCanvasRenderingContext2D): void;
}
