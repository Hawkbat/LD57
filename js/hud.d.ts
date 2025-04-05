import { Entity } from "./entity.js";
export declare class HUD extends Entity {
    get sortOrder(): number;
    reset(): void;
    update(dt: number): void;
    render(ctx: CanvasRenderingContext2D): void;
    renderLights(ctx: OffscreenCanvasRenderingContext2D): void;
}
export declare const hud: HUD;
