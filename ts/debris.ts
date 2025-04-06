import { SpriteAsset } from "./assets.js"
import { camera } from "./camera.js"
import { Entity, removeEntity } from "./entity.js"

const FADE_TIME = 1 // seconds
const MOVE_SPEED = 16 // pixels per second

const debrisSprite = new SpriteAsset('images/Tiles.png', 32, 32)

export class Debris extends Entity {
    public x: number = 0
    public y: number = 0
    public dx : number = Math.random() * 2 - 1
    public dy : number = Math.random() * 2 - 1
    public fadeTime: number = 0
    public frameSeed: number = Math.random()

    constructor(x: number, y: number) {
        super()
        this.x = x
        this.y = y
        this.dx = Math.random() * 2 - 1
        this.dy = Math.random() * 2 - 1
        this.fadeTime = 0
        this.frameSeed = Math.random()
    }

    reset(): void {
        this.x = 0
        this.y = 0
        this.fadeTime = 0
        this.frameSeed = Math.random()
    }

    update(dt: number): void {
        this.x += this.dx * MOVE_SPEED * dt
        this.y += this.dy * MOVE_SPEED * dt
        this.fadeTime += dt
        if (this.fadeTime > FADE_TIME) {
            removeEntity(this)
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        const [debrisX, debrisY] = camera.fromWorld(this.x, this.y)
        const frame = 114 + Math.floor(this.frameSeed * 6)
        if (this.fadeTime > FADE_TIME * 0.5) {
            const alpha = 1 - (this.fadeTime - FADE_TIME * 0.5) / (FADE_TIME * 0.5)
            ctx.globalAlpha = alpha
            debrisSprite.draw(ctx, debrisX, debrisY, frame)
            ctx.globalAlpha = 1
        } else {
            debrisSprite.draw(ctx, debrisX, debrisY, frame)
        }
    }

}
