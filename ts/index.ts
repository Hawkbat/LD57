import { Angler } from "./angler.js"
import { background } from "./background.js"
import { boat } from "./boat.js"
import { camera } from "./camera.js"
import { run } from "./engine.js"
import { addEntity } from "./entity.js"
import { hud } from "./hud.js"
import { sub } from "./sub.js"

addEntity(background)
addEntity(camera)
addEntity(boat)
addEntity(sub)
addEntity(hud)

const angler = new Angler()
angler.x = 500
angler.y = 500
addEntity(angler)

run()
