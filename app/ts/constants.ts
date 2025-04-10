export const GAME_WIDTH = 948
export const GAME_HEIGHT = 533
export const HUD_WIDTH = 128
export const PLAY_AREA_WIDTH = GAME_WIDTH - HUD_WIDTH
export const PLAY_AREA_HEIGHT = GAME_HEIGHT
export const WORLD_LIMIT_X = 1600

export const FILLMAP_WIDTH = 64
export const OREMAP_WIDTH = FILLMAP_WIDTH - 1
export const FILLMAP_HEIGHT = 96
export const OREMAP_HEIGHT = FILLMAP_HEIGHT - 1

export const DEBUG_TILE_POSITIONS = false

export enum OreType {
    empty = 0,
    fuel = 1,
    oxygen = 2,
    bronze = 3,
    silver = 4,
    gold = 5,
    diamond = 6,
}

export const ORE_SELL_PRICES: Record<OreType, number> = {
    [OreType.empty]: 0,
    [OreType.fuel]: 0,
    [OreType.oxygen]: 0,
    [OreType.bronze]: 5,
    [OreType.silver]: 15,
    [OreType.gold]: 40,
    [OreType.diamond]: 100,
}
