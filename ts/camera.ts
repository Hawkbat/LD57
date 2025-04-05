import { PLAY_AREA_HEIGHT, PLAY_AREA_WIDTH } from "./constants.js"
import { Entity } from "./entity.js"

export class Camera extends Entity {
    public x: number = 0
    public y: number = 0

    reset(): void {
        this.x = 0
        this.y = 0
    }

    update(dt: number): void {
        
    }

    render(ctx: CanvasRenderingContext2D): void {

    }

    toWorld(x: number, y: number): [number, number] {
        return [x + this.x - PLAY_AREA_WIDTH / 2, y + this.y - PLAY_AREA_HEIGHT / 2]
    }
    
    fromWorld(x: number, y: number): [number, number] {
        return [Math.round(x - this.x + PLAY_AREA_WIDTH / 2), Math.round(y - this.y + PLAY_AREA_HEIGHT / 2)]
    }
}

export const camera = new Camera()
