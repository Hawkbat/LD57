import { Entity } from "./entity.js";
export declare enum OreType {
    empty = 0,
    fuel = 1,
    oxygen = 2,
    bronze = 3,
    silver = 4,
    gold = 5,
    diamond = 6
}
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
