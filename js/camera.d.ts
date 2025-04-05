import { Entity } from "./entity.js";
export declare class Camera extends Entity {
    x: number;
    y: number;
    reset(): void;
    update(dt: number): void;
    render(ctx: CanvasRenderingContext2D): void;
    toWorld(x: number, y: number): [number, number];
    fromWorld(x: number, y: number): [number, number];
}
export declare const camera: Camera;
