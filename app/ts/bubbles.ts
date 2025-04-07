import { SpriteAsset } from "./assets.js"
import { camera } from "./camera.js"
import { Entity } from "./entity.js"
import { PLAY_AREA_WIDTH, PLAY_AREA_HEIGHT } from "./constants.js"

const BUBBLE_VERTICAL_SPEED = 20
const BUBBLE_LIFETIME = 1.5

const TIME_PER_SPAWN = 0.2

const SPRITE_WIDTH = 32
const SPRITE_HEIGHT = 32

const bubbleSprite = new SpriteAsset('images/Bubbles.png', SPRITE_WIDTH, SPRITE_HEIGHT)

interface Bubble {
    x: number
    y: number
    liveTime: number
}

export class Bubbles extends Entity {
    public bubbles: Bubble[] = []
    public spawnTime: number = 0

    override reset(): void {
        this.bubbles = []
        this.spawnTime = 0
    }

    override update(dt: number): void {
        this.spawnTime += dt
        while (this.spawnTime > TIME_PER_SPAWN) {
            this.spawnTime -= TIME_PER_SPAWN
            const [x, y] = camera.toWorld(Math.random() * PLAY_AREA_WIDTH, Math.random() * PLAY_AREA_HEIGHT)
            if (y < BUBBLE_VERTICAL_SPEED * BUBBLE_LIFETIME + 20) continue
            this.bubbles.push({ x, y, liveTime: 0 })
        }

        let anyExpired = false

        for (const bubble of this.bubbles) {
            bubble.liveTime += dt
            bubble.y -= BUBBLE_VERTICAL_SPEED * dt
            if (bubble.liveTime >= BUBBLE_LIFETIME) {
                anyExpired = true
            }
        }

        if (anyExpired) {
            this.bubbles = this.bubbles.filter(bubble => bubble.liveTime < BUBBLE_LIFETIME)
        }
    }

    override render(ctx: CanvasRenderingContext2D): void {
        for (const bubble of this.bubbles) {
            const [bubbleX, bubbleY] = camera.fromWorld(bubble.x, bubble.y)

            if (bubbleX < -SPRITE_WIDTH * 0.5 || bubbleX > PLAY_AREA_WIDTH + SPRITE_WIDTH * 0.5 || bubbleY < -SPRITE_HEIGHT * 0.5 || bubbleY > PLAY_AREA_HEIGHT + SPRITE_HEIGHT * 0.5) {
                continue
            }

            const frame = Math.floor(bubble.liveTime / BUBBLE_LIFETIME * 4)
            bubbleSprite.draw(ctx, bubbleX, bubbleY, frame)
        }
    }
}

export const bubbles = new Bubbles()
