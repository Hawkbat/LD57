import { SpriteAsset } from "./assets.js"
import { camera } from "./camera.js"
import { PLAY_AREA_HEIGHT, PLAY_AREA_WIDTH } from "./constants.js"
import { getEntitiesOfType, removeEntity } from "./entity.js"
import { distance } from "./math.js"
import { Monster } from "./monster.js"
import { sub } from "./sub.js"

const COLLISION_RADIUS = 64 // pixels
const EXPLOSION_TIME = 1 // seconds
const EXPLOSION_RADIUS = 128 // pixels
const EXPLOSION_DAMAGE = 1

const SPRITE_WIDTH = 64
const SPRITE_HEIGHT = 64

const mineSprite = new SpriteAsset('images/Mine.png', SPRITE_WIDTH, SPRITE_HEIGHT)
const explosionSprite = new SpriteAsset('images/Explosion.png', 64, 64)

export class Mine extends Monster {
    public exploded: boolean = false
    public explosionTime: number = 0

    constructor(x: number, y: number) {
        super()
        this.x = x
        this.y = y
    }

    reset(): void {
        this.exploded = false
        this.explosionTime = 0
    }

    update(dt: number): void {
        if (!this.exploded) {
            const dist = distance(this.x, this.y, sub.x, sub.y)
            if (dist < COLLISION_RADIUS) {
                this.explode()
            }
            for (const monster of getEntitiesOfType(Monster)) {
                if (monster === this) continue
                const dist = distance(this.x, this.y, monster.x, monster.y)
                if (dist < COLLISION_RADIUS) {
                    this.explode()
                }
            }
        } else {
            this.explosionTime += dt
            if (this.explosionTime > EXPLOSION_TIME) {
                removeEntity(this)
            }
        }
    }

    override render(ctx: CanvasRenderingContext2D): void {
        const [mineX, mineY] = camera.fromWorld(this.x, this.y)
        if (this.exploded) {
            const frame = Math.floor(this.explosionTime / EXPLOSION_TIME * 8)
            explosionSprite.draw(ctx, mineX, mineY, frame)
        } else {
            if (mineX < -SPRITE_WIDTH * 0.5 || mineX > PLAY_AREA_WIDTH + SPRITE_WIDTH * 0.5 || mineY < -SPRITE_WIDTH * 0.5 || mineY > PLAY_AREA_HEIGHT + SPRITE_WIDTH * 0.5) {
                return
            }
            mineSprite.draw(ctx, mineX, mineY, 0)
        }
    }

    override renderLights(ctx: OffscreenCanvasRenderingContext2D): void {
        if (this.exploded) {
            const [mineX, mineY] = camera.fromWorld(this.x, this.y)
            const brightness = 0xF - Math.floor(this.explosionTime / EXPLOSION_TIME * 0xF)
            const l = brightness.toString(16)
            ctx.fillStyle = `#${l}${l}${l}`
            ctx.beginPath()
            ctx.arc(mineX, mineY, EXPLOSION_RADIUS, 0, Math.PI * 2)
            ctx.fill()
        }
    }

    override hit(damage: number): void {
        if (!this.exploded) {
            this.explode()
        }
    }

    private explode() {
        if (this.exploded) return
        this.exploded = true
        this.explosionTime = 0

        const dist = distance(this.x, this.y, sub.x, sub.y)
        if (dist < EXPLOSION_RADIUS) {
            sub.hit(EXPLOSION_DAMAGE)
        }

        for (const monster of getEntitiesOfType(Monster)) {
            if (monster === this) continue
            const dist = distance(this.x, this.y, monster.x, monster.y)
            if (dist < EXPLOSION_RADIUS) {
                monster.hit(EXPLOSION_DAMAGE)
            }
        }
    }
}
