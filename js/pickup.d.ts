import { OreType } from "./constants.js";
import { Entity } from "./entity.js";
export declare class Pickup extends Entity {
    x: number;
    y: number;
    oreType: OreType;
    pickingUp: boolean;
    pickupTime: number;
    constructor(x: number, y: number, oreType: OreType);
    reset(): void;
    update(dt: number): void;
    render(ctx: CanvasRenderingContext2D): void;
}
