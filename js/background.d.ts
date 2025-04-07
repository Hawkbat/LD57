import { Entity } from "./entity.js";
export declare class Background extends Entity {
    lightPower: number;
    reset(): void;
    update(dt: number): void;
    render(ctx: CanvasRenderingContext2D): void;
    renderLights(ctx: OffscreenCanvasRenderingContext2D): void;
}
export declare const background: Background;
