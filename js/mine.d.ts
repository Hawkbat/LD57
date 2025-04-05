import { Monster } from "./monster.js";
export declare class Mine extends Monster {
    exploded: boolean;
    explosionTime: number;
    constructor(x: number, y: number);
    reset(): void;
    update(dt: number): void;
    render(ctx: CanvasRenderingContext2D): void;
    renderLights(ctx: OffscreenCanvasRenderingContext2D): void;
    hit(damage: number): void;
    private explode;
}
