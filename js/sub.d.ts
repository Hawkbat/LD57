import { Entity } from "./entity.js";
export declare class Sub extends Entity {
    x: number;
    y: number;
    dx: number;
    dy: number;
    facing: number;
    rotation: number;
    oxygen: number;
    fuel: number;
    invulnerable: boolean;
    invulnerableTime: number;
    reset(): void;
    update(dt: number): void;
    render(ctx: CanvasRenderingContext2D): void;
    renderLights(ctx: OffscreenCanvasRenderingContext2D): void;
    hit(dmg: number): void;
}
export declare const sub: Sub;
