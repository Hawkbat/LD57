import { SpriteAsset } from "./assets.js"
import { camera } from "./camera.js"
import { PLAY_AREA_WIDTH, PLAY_AREA_HEIGHT } from "./constants.js"
import { Entity } from "./entity.js"

const BOB_VERTICAL_SPEED = 0.3
const BOB_HORIZONTAL_SPEED = 0.7
const BOB_VERTICAL_DISTANCE = 32
const BOB_HORIZONTAL_DISTANCE = 64

const SPRITE_WIDTH = 64
const SPRITE_HEIGHT = 64
const ANIM_SPEED = 10

const fishSprite = new SpriteAsset('images/FishSchool.png', SPRITE_WIDTH, SPRITE_HEIGHT)

export class Fish extends Entity {
    public x: number = 0
    public y: number = 0
    public initialX: number = 0
    public initialY: number = 0
    public facing: number = Math.random() > 0.5 ? 1 : -1
    public animTime: number = Math.random() * 10

    constructor(x: number, y: number) {
        super()
        this.x = x
        this.y = y
        this.initialX = x
        this.initialY = y
    }

    override reset(): void {
        this.x = 0
        this.y = 0
        this.initialX = 0
        this.initialY = 0
        this.facing = Math.random() > 0.5 ? 1 : -1
        this.animTime = Math.random() * 10
    }

    override update(dt: number): void {
        const bobX = Math.cos(this.animTime * BOB_HORIZONTAL_SPEED) * BOB_HORIZONTAL_DISTANCE
        const bobY = Math.sin(this.animTime * BOB_VERTICAL_SPEED) * BOB_VERTICAL_DISTANCE

        if (this.initialX + bobX > this.x) this.facing = 1
        else if (this.initialX + bobX < this.x) this.facing = -1

        this.x = this.initialX + bobX
        this.y = this.initialY + bobY

        this.animTime += dt
    }

    override render(ctx: CanvasRenderingContext2D): void {
        const [fishX, fishY] = camera.fromWorld(this.x, this.y)

        if (fishX < -SPRITE_WIDTH * 0.5 || fishX > PLAY_AREA_WIDTH + SPRITE_WIDTH * 0.5 || fishY < -SPRITE_HEIGHT * 0.5 || fishY > PLAY_AREA_HEIGHT + SPRITE_HEIGHT * 0.5) {
            return
        }

        const frame = Math.floor(this.animTime * ANIM_SPEED) % 4

        ctx.save()
        ctx.translate(fishX, fishY)
        ctx.scale(this.facing, 1)
        fishSprite.draw(ctx, 0, 0, frame)
        ctx.restore()
    }
}
