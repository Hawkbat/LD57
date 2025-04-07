export const GAME_WIDTH = 948;
export const GAME_HEIGHT = 533;
export const HUD_WIDTH = 128;
export const PLAY_AREA_WIDTH = GAME_WIDTH - HUD_WIDTH;
export const PLAY_AREA_HEIGHT = GAME_HEIGHT;
export const WORLD_LIMIT_X = 1600;
export const FILLMAP_WIDTH = 64;
export const OREMAP_WIDTH = FILLMAP_WIDTH - 1;
export const FILLMAP_HEIGHT = 96;
export const OREMAP_HEIGHT = FILLMAP_HEIGHT - 1;
export const DEBUG_TILE_POSITIONS = false;
export var OreType;
(function (OreType) {
    OreType[OreType["empty"] = 0] = "empty";
    OreType[OreType["fuel"] = 1] = "fuel";
    OreType[OreType["oxygen"] = 2] = "oxygen";
    OreType[OreType["bronze"] = 3] = "bronze";
    OreType[OreType["silver"] = 4] = "silver";
    OreType[OreType["gold"] = 5] = "gold";
    OreType[OreType["diamond"] = 6] = "diamond";
})(OreType || (OreType = {}));
export const ORE_SELL_PRICES = {
    [OreType.empty]: 0,
    [OreType.fuel]: 0,
    [OreType.oxygen]: 0,
    [OreType.bronze]: 5,
    [OreType.silver]: 15,
    [OreType.gold]: 40,
    [OreType.diamond]: 100,
};
//# sourceMappingURL=constants.js.map