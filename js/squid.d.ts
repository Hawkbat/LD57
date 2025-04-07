import { Monster } from "./monster.js";
export declare class Squid extends Monster {
    facing: number;
    animTime: number;
    constructor(x: number, y: number);
    reset(): void;
    update(dt: number): void;
    render(ctx: CanvasRenderingContext2D): void;
    renderLights(ctx: OffscreenCanvasRenderingContext2D): void;
    hit(damage: number): void;
}
