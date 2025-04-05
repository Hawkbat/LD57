import { Monster } from "./monster.js";
export declare class Angler extends Monster {
    dx: number;
    dy: number;
    facing: number;
    alerted: boolean;
    animTime: number;
    constructor(x: number, y: number);
    reset(): void;
    update(dt: number): void;
    render(ctx: CanvasRenderingContext2D): void;
    renderLights(ctx: OffscreenCanvasRenderingContext2D): void;
    hit(damage: number): void;
}
