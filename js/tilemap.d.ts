import { OreType } from "./constants.js";
import { Entity } from "./entity.js";
export declare class TileMap extends Entity {
    filled: boolean[];
    ores: OreType[];
    reset(): void;
    update(dt: number): void;
    render(ctx: CanvasRenderingContext2D): void;
    worldToFillCoords(x: number, y: number): [number, number];
    fillToWorldCoords(x: number, y: number): [number, number];
    worldToOreCoords(x: number, y: number): [number, number];
    oreToWorldCoords(x: number, y: number): [number, number];
    setFilled(x: number, y: number, value: boolean): void;
    getFilled(x: number, y: number): boolean;
    setOre(x: number, y: number, value: OreType): void;
    getOre(x: number, y: number): OreType;
}
export declare const tileMap: TileMap;
