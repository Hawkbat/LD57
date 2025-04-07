import { Entity } from "./entity.js";
export declare class Banner extends Entity {
    get sortOrder(): number;
    reset(): void;
    update(dt: number): void;
    render(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D): void;
    renderLights(ctx: OffscreenCanvasRenderingContext2D): void;
}
export declare const banner: Banner;
