import { Entity } from "./entity.js";
export declare class Banner extends Entity {
    reset(): void;
    update(dt: number): void;
    render(ctx: CanvasRenderingContext2D): void;
}
export declare const banner: Banner;
