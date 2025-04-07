export declare const GAME_WIDTH = 948;
export declare const GAME_HEIGHT = 533;
export declare const HUD_WIDTH = 128;
export declare const PLAY_AREA_WIDTH: number;
export declare const PLAY_AREA_HEIGHT = 533;
export declare const WORLD_LIMIT_X = 1600;
export declare const FILLMAP_WIDTH = 64;
export declare const OREMAP_WIDTH: number;
export declare const FILLMAP_HEIGHT = 96;
export declare const OREMAP_HEIGHT: number;
export declare const DEBUG_TILE_POSITIONS = false;
export declare enum OreType {
    empty = 0,
    fuel = 1,
    oxygen = 2,
    bronze = 3,
    silver = 4,
    gold = 5,
    diamond = 6
}
export declare const ORE_SELL_PRICES: Record<OreType, number>;
