import { Entity } from "./entity.js";
interface Bubble {
    x: number;
    y: number;
    liveTime: number;
}
export declare class Bubbles extends Entity {
    bubbles: Bubble[];
    spawnTime: number;
    reset(): void;
    update(dt: number): void;
    render(ctx: CanvasRenderingContext2D): void;
}
export declare const bubbles: Bubbles;
export {};
