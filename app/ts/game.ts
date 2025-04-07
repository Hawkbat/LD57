import { Angler } from "./angler.js"
import { background } from "./background.js"
import { banner } from "./banner.js"
import { boat } from "./boat.js"
import { camera } from "./camera.js"
import { FILLMAP_HEIGHT, FILLMAP_WIDTH } from "./constants.js"
import { addEntity, clearEntities, resetEntities } from "./entity.js"
import { onEvent } from "./events.js"
import { hud } from "./hud.js"
import { distance } from "./math.js"
import { Mine } from "./mine.js"
import { shop } from "./shop.js"
import { sub } from "./sub.js"
import { OreType, tileMap } from "./tilemap.js"

const PROC_LAYERS = 8
const LAYER_WIDTH = FILLMAP_WIDTH
const LAYER_HEIGHT = FILLMAP_HEIGHT / PROC_LAYERS
const ROOMS_PER_LAYER = 20

const ORE_CHANCES_BY_LAYER: Partial<Record<OreType, number>>[] = [
    { [OreType.empty]: 2, [OreType.fuel]: 0.05, [OreType.oxygen]: 0.05, [OreType.bronze]: 0.05 }, // Layer 0 (Seabed)
    { [OreType.empty]: 2, [OreType.fuel]: 0.05, [OreType.oxygen]: 0.05, [OreType.bronze]: 0.1, [OreType.silver]: 0.02 }, // Layer 1
    { [OreType.empty]: 2, [OreType.fuel]: 0.1, [OreType.oxygen]: 0.1, [OreType.bronze]: 0.2, [OreType.silver]: 0.1, [OreType.gold]: 0.02 }, // Layer 2
    { [OreType.empty]: 2, [OreType.fuel]: 0.1, [OreType.oxygen]: 0.1, [OreType.bronze]: 0.1, [OreType.silver]: 0.2, [OreType.gold]: 0.1 }, // Layer 3
    { [OreType.empty]: 2, [OreType.fuel]: 0.1, [OreType.oxygen]: 0.1, [OreType.silver]: 0.2, [OreType.gold]: 0.15, [OreType.diamond]: 0.02 }, // Layer 4
    { [OreType.empty]: 2, [OreType.fuel]: 0.15, [OreType.oxygen]: 0.15, [OreType.silver]: 0.2, [OreType.gold]: 0.2, [OreType.diamond]: 0.05 }, // Layer 5
    { [OreType.empty]: 2, [OreType.fuel]: 0.15, [OreType.oxygen]: 0.15, [OreType.gold]: 0.25, [OreType.diamond]: 0.1 }, // Layer 6
    { [OreType.empty]: 2, [OreType.fuel]: 0.15, [OreType.oxygen]: 0.15, [OreType.diamond]: 0.2 }, // Layer 7
]

function randomOre(layer: number): OreType {
    const oreChances = ORE_CHANCES_BY_LAYER[layer]
    const totalChance = Object.values(oreChances).reduce((sum, chance) => sum + chance, 0)
    const randomValue = Math.random() * totalChance
    let cumulativeChance = 0

    for (const oreType in oreChances) {
        cumulativeChance += oreChances[Number(oreType) as OreType] ?? 0
        if (randomValue < cumulativeChance) {
            return Number(oreType)
        }
    }

    return OreType.empty
}

function generate() {
    for (let layer = 0; layer < PROC_LAYERS; layer++) {
        if (layer === 0) {
            // Open water and seabed
            let seabedHeight = 4
            for (let x = 0; x < LAYER_WIDTH; x++) {
                seabedHeight = Math.max(1, Math.min(LAYER_HEIGHT - 3, seabedHeight + Math.floor(Math.random() * 3) - 1))

                for (let y = 0; y < LAYER_HEIGHT; y++) {
                    if (y < LAYER_HEIGHT - seabedHeight) {
                        tileMap.setFilled(x, y, false)
                    }
                }

                if (Math.random() < 0.1) {
                    const [mineX, mineY] = tileMap.fillToWorldCoords(x, LAYER_HEIGHT - seabedHeight - 1)
                    addEntity(new Mine(mineX, mineY))
                }
            }
        } else {
            for (let i = 0; i < ROOMS_PER_LAYER; i++) {
                const roomWidth = Math.floor(Math.random() * 6) + 2
                const roomHeight = Math.floor(Math.random() * 6) + 2
                const roomX = Math.floor(Math.random() * (LAYER_WIDTH - roomWidth))
                const roomY = Math.floor(Math.random() * (LAYER_HEIGHT - roomHeight))

                for (let x = 0; x < roomWidth; x++) {
                    for (let y = 0; y < roomHeight; y++) {
                        let filled = false
                        const distToCorner = Math.min(distance(x, y, 0, 0), distance(x, y, roomWidth - 1, 0), distance(x, y, 0, roomHeight - 1), distance(x, y, roomWidth - 1, roomHeight - 1))
                        if (distToCorner < 2) {
                            filled = Math.random() < 0.6
                        } else {
                            filled = Math.random() < 0.1
                        }
                        tileMap.setFilled(roomX + x, roomY + y + layer * LAYER_HEIGHT, filled)
                    }
                }
            }

            // Spawn monsters
            for (let x = 0; x < LAYER_WIDTH; x++) {
                for (let y = 0; y < LAYER_HEIGHT; y++) {
                    if (tileMap.getFilled(x, y + layer * LAYER_HEIGHT)) continue
                    if (Math.random() < 0.05 && tileMap.getFilled(x, y + 1 + layer * LAYER_HEIGHT)) {
                        const [mineX, mineY] = tileMap.fillToWorldCoords(x, y + layer * LAYER_HEIGHT)
                        addEntity(new Mine(mineX, mineY))
                    } else if (Math.random() < 0.05 && layer > 2) {
                        const [anglerX, anglerY] = tileMap.fillToWorldCoords(x, y + layer * LAYER_HEIGHT)
                        addEntity(new Angler(anglerX, anglerY))
                    }
                }
            }
        }

        // Spawn ores
        for (let x = 0; x < LAYER_WIDTH - 1; x++) {
            for (let y = 0; y < LAYER_HEIGHT - 1; y++) {
                tileMap.setOre(x, y + layer * LAYER_HEIGHT, OreType.empty)
                if (!tileMap.getFilled(x + 0, y + 0 + layer * LAYER_HEIGHT)) continue
                if (!tileMap.getFilled(x + 1, y + 0 + layer * LAYER_HEIGHT)) continue
                if (!tileMap.getFilled(x + 0, y + 1 + layer * LAYER_HEIGHT)) continue
                if (!tileMap.getFilled(x + 1, y + 1 + layer * LAYER_HEIGHT)) continue
                tileMap.setOre(x, y + layer * LAYER_HEIGHT, randomOre(layer))
            }
        }
    }
}

export function startGame() {
    clearEntities()
    addEntity(background)
    addEntity(camera)
    addEntity(tileMap)
    addEntity(boat)
    addEntity(sub)
    addEntity(hud)
    addEntity(shop)
    addEntity(banner)
    resetEntities()
    generate()
}

onEvent('restart-game', () => {
    startGame()
})
