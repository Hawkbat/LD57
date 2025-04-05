import { camera } from "./camera.js"
import { PLAY_AREA_HEIGHT, PLAY_AREA_WIDTH } from "./constants.js"
import { Entity } from "./entity.js"

const LIGHT_FALLOFF_DISTANCE = 256

export class Background extends Entity {

    reset(): void {

    }

    update(dt: number): void {
        
    }

    render(ctx: CanvasRenderingContext2D): void {
        const depth = camera.y

        // TODO: use depth to determine the background color

        ctx.fillStyle = "#246"
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

        const [, bgY] = camera.fromWorld(0, 0)
        if (bgY > 0) {
            ctx.fillStyle = "#7CF"
            ctx.fillRect(0, 0, ctx.canvas.width, bgY)
        }
    }

    override renderLights(ctx: OffscreenCanvasRenderingContext2D): void {
        const baseBrightness = 0xF - Math.min(0xF, Math.floor(camera.y / LIGHT_FALLOFF_DISTANCE))
        const l = baseBrightness.toString(16)

        ctx.fillStyle = `#${l}${l}${l}`
        ctx.fillRect(0, 0, PLAY_AREA_WIDTH, PLAY_AREA_HEIGHT)
    }
}

export const background = new Background()
