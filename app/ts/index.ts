import { Angler } from "./angler.js"
import { background } from "./background.js"
import { boat } from "./boat.js"
import { camera } from "./camera.js"
import { FILLMAP_HEIGHT, FILLMAP_WIDTH, OREMAP_HEIGHT, OREMAP_WIDTH } from "./constants.js"
import { runEngine } from "./engine.js"
import { addEntity, clearEntities } from "./entity.js"
import { hud } from "./hud.js"
import { sub } from "./sub.js"
import { tileMap } from "./tilemap.js"

function startGame() {
    clearEntities()
    addEntity(background)
    addEntity(camera)
    addEntity(tileMap)
    addEntity(boat)
    addEntity(sub)
    addEntity(hud)
    const angler = new Angler()
    angler.x = 500
    angler.y = 500
    addEntity(angler)

    for (let x = 0; x < FILLMAP_WIDTH; x++) {
        for (let y = 0; y < FILLMAP_HEIGHT; y++) {
            tileMap.setFilled(x, y, Math.random() < 0.7)
        }
    }
    for (let x = 0; x < OREMAP_WIDTH; x++) {
        for (let y = 0; y < OREMAP_HEIGHT; y++) {
            tileMap.setOre(x, y, Math.floor(Math.random() * 7))
        }
    }
}

runEngine()
startGame()
