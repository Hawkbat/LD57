import { SpriteAsset } from "./assets.js"
import { camera } from "./camera.js"
import { FILLMAP_WIDTH, FILLMAP_HEIGHT, OREMAP_WIDTH, OREMAP_HEIGHT, PLAY_AREA_WIDTH, PLAY_AREA_HEIGHT, DEBUG_TILE_POSITIONS } from "./constants.js"
import { Entity } from "./entity.js"

/*

Tile indices:

0 = 0 0
    0 0

1 = 1 0
    1 1

2 = 0 1
    1 1

3 = 1 1
    1 0

4 = 1 1
    0 1

5 = 1 0
    0 1

6 = 0 1
    1 0

7 = 0 1
    0 1

8 = 1 1
    0 0

9 = 1 0
    1 0

10 = 0 0
     1 1

11 = 1 0
     0 0

12 = 0 1
     0 0

13 = 0 0
     0 1

14 = 0 0
     1 0

15-20 = solid, no drops
21 = fuel
22 = oxygen
23 = bronze
24 = silver
25 = gold
26 = diamond

*/

// Converts the simple 4-bit tile neighbor flags into an actual index on the tileset image
const TILE_INDEX_REMAP = [
    0,
    11,
    12,
    8,
    14,
    9,
    6,
    3,
    13,
    5,
    7,
    4,
    10,
    1,
    2,
    15
]

const TILE_WIDTH = 64
const TILE_HEIGHT = 64

const tilesetSprite = new SpriteAsset('images/Tiles.png', 64, 64)

export enum OreType {
    empty = 0,
    fuel = 1,
    oxygen = 2,
    bronze = 3,
    silver = 4,
    gold = 5,
    diamond = 6,
}

export class TileMap extends Entity {
    public filled: boolean[] = new Array(FILLMAP_WIDTH * FILLMAP_HEIGHT).fill(true)
    public ores: OreType[] = new Array(OREMAP_WIDTH * OREMAP_HEIGHT).fill(OreType.empty)

    override reset(): void {
        this.filled = new Array(FILLMAP_WIDTH * FILLMAP_HEIGHT).fill(true)
        this.ores = new Array(OREMAP_WIDTH * OREMAP_HEIGHT).fill(OreType.empty)
    }

    override update(dt: number): void {
        
    }

    override render(ctx: CanvasRenderingContext2D): void {
        const [baseX, baseY] = camera.fromWorld((-FILLMAP_WIDTH * 0.5 + 0.5) * TILE_WIDTH, 0)

        for (let tx = 0; tx < OREMAP_WIDTH; tx++) {
            for (let ty = 0; ty < OREMAP_HEIGHT; ty++) {
                const tileX = baseX + (tx + 0.5) * TILE_WIDTH
                const tileY = baseY + (ty + 0.5) * TILE_HEIGHT

                if (tileX < -TILE_WIDTH * 0.5 || tileX > PLAY_AREA_WIDTH + TILE_WIDTH * 0.5 || tileY < -TILE_HEIGHT * 0.5 || tileY > PLAY_AREA_HEIGHT + TILE_HEIGHT * 0.5) {
                    continue
                }

                let tileIndex = 0
                if (this.getFilled(tx + 0, ty + 0)) tileIndex += 1
                if (this.getFilled(tx + 1, ty + 0)) tileIndex += 2
                if (this.getFilled(tx + 0, ty + 1)) tileIndex += 4
                if (this.getFilled(tx + 1, ty + 1)) tileIndex += 8

                if (tileIndex === 15) {
                    const oreType = this.getOre(tx, ty)
                    if (oreType !== OreType.empty) {
                        tileIndex = 19 + oreType
                    } else {
                        tileIndex = 15 + (tx + ty) % 5
                    }
                } else if (tileIndex > 0) {
                    tileIndex = TILE_INDEX_REMAP[tileIndex]
                } else {
                    continue
                }

                tilesetSprite.draw(ctx, tileX, tileY, tileIndex)

                if (DEBUG_TILE_POSITIONS) {
                    ctx.strokeStyle = '#000'
                    ctx.lineWidth = 2
                    ctx.strokeRect(baseX + tx * TILE_WIDTH, baseY + ty * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT)
                }
            }
        }
        if (DEBUG_TILE_POSITIONS) {
            for (let x = 0; x < FILLMAP_WIDTH; x++) {
                for (let y = 0; y < FILLMAP_HEIGHT; y++) {
                    ctx.fillStyle = this.getFilled(x, y) ? '#000' : '#FFF'
                    ctx.beginPath()
                    ctx.arc(baseX + x * TILE_WIDTH, baseY + y * TILE_HEIGHT, 5, 0, Math.PI * 2)
                    ctx.fill()
                }
            }
        }
    }

    worldToFillCoords(x: number, y: number): [number, number] {
        const fillWorldOffsetX = (-FILLMAP_WIDTH * 0.5 + 0.5) * TILE_WIDTH
        const fillWorldOffsetY = 0
        const fillX = Math.round((x - fillWorldOffsetX) / TILE_WIDTH)
        const fillY = Math.round((y - fillWorldOffsetY) / TILE_HEIGHT)
        return [fillX, fillY]
    }

    fillToWorldCoords(x: number, y: number): [number, number] {
        const fillWorldOffsetX = (-FILLMAP_WIDTH * 0.5 + 0.5) * TILE_WIDTH
        const fillWorldOffsetY = 0
        const worldX = Math.round(x * TILE_WIDTH + fillWorldOffsetX)
        const worldY = Math.round(y * TILE_HEIGHT + fillWorldOffsetY)
        return [worldX, worldY]
    }

    worldToOreCoords(x: number, y: number): [number, number] {
        const oreWorldOffsetX = (-OREMAP_WIDTH * 0.5 + 0.5) * TILE_WIDTH
        const oreWorldOffsetY = 0.5 * TILE_HEIGHT
        const oreX = Math.round((x - oreWorldOffsetX) / TILE_WIDTH)
        const oreY = Math.round((y - oreWorldOffsetY) / TILE_HEIGHT)
        return [oreX, oreY]
    }

    oreToWorldCoords(x: number, y: number): [number, number] {
        const oreWorldOffsetX = (-OREMAP_WIDTH * 0.5 + 0.5) * TILE_WIDTH
        const oreWorldOffsetY = 0.5 * TILE_HEIGHT
        const worldX = Math.round(x * TILE_WIDTH + oreWorldOffsetX)
        const worldY = Math.round(y * TILE_HEIGHT + oreWorldOffsetY)
        return [worldX, worldY]
    }

    setFilled(x: number, y: number, value: boolean): void {
        if (x < 0 || x >= FILLMAP_WIDTH || y < 0 || y >= FILLMAP_HEIGHT) {
            return
        }
        this.filled[y * FILLMAP_WIDTH + x] = value
    }

    getFilled(x: number, y: number): boolean {
        if (x < 0 || x >= FILLMAP_WIDTH || y < 0 || y >= FILLMAP_HEIGHT) {
            return false
        }
        return this.filled[y * FILLMAP_WIDTH + x]
    }

    setOre(x: number, y: number, value: OreType): void {
        if (x < 0 || x >= OREMAP_WIDTH || y < 0 || y >= OREMAP_HEIGHT) {
            return
        }
        this.ores[y * OREMAP_WIDTH + x] = value
    }

    getOre(x: number, y: number): OreType {
        if (x < 0 || x >= OREMAP_WIDTH || y < 0 || y >= OREMAP_HEIGHT) {
            return OreType.empty
        }
        return this.ores[y * OREMAP_WIDTH + x]
    }
}

export const tileMap = new TileMap()
