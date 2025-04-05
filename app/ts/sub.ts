import { SpriteAsset } from "./assets.js"
import { camera } from "./camera.js"
import { WORLD_LIMIT_X } from "./constants.js"
import { Entity } from "./entity.js"
import { ACTIONS } from "./input.js"
import { moveAngleTowards } from "./math.js"
import { tileMap } from "./tilemap.js"

const THRUST_SPEED = 300
const RESURFACE_SPEED_BONUS = 150
const DRAG_FACTOR = 0.95
const OXYGEN_DRAIN_RATE = 1 / 60 // 1 minute
const OXYGEN_REFILL_RATE = 1 / 5 // 5 seconds
const HURT_INVULN_TIME = 1.0
const TURN_SPEED = Math.PI // radians per second
const DRILL_FUEL_COST = 0.025 // cost of breaking one tile
const REFUEL_MAX_DIST = 64
const REFUEL_RATE = 0.1 // 10 seconds to refuel

const subSprite = new SpriteAsset('images/Drillship_01.png', 64, 64)
const subLightSprite = new SpriteAsset('images/Drillship_Light.png', 256, 256)

export class Sub extends Entity {
    public x: number = 0
    public y: number = 0
    public dx: number = 0
    public dy: number = 0
    public facing: number = 1 // 1 = right, -1 = left
    public rotation: number = 0 // In radians

    public oxygen: number = 1 // 0-100%
    public fuel: number = 1 // 0-100%
    public invulnerable: boolean = false
    public invulnerableTime: number = 0

    reset(): void {
        this.x = 0
        this.y = 0
        this.dx = 0
        this.dy = 0
        this.facing = 1
        this.rotation = 0
        this.oxygen = 1
        this.fuel = 1
        this.invulnerable = false
        this.invulnerableTime = 0
    }

    update(dt: number): void {
        let dirX = 0
        let dirY = 0
        if (ACTIONS.up.held) {
            dirY += -1
        }
        if (ACTIONS.down.held) {
            dirY += 1
        }
        if (ACTIONS.right.held) {
            dirX += 1
            if (this.facing < 0) {
                this.rotation = Math.atan2(dirY, dirX)
            }
            this.facing = 1
        }
        if (ACTIONS.left.held) {
            dirX += -1
            if (this.facing > 0) {
                this.rotation = Math.atan2(dirY, dirX)
            }
            this.facing = -1
        }

        let targetRotation = this.rotation

        if (dirX !== 0 || dirY !== 0) {
            targetRotation = Math.atan2(dirY, dirX)
            let resurfaceSpeedBoost = 0
            if (ACTIONS.up.held && dirY < 0) {
                resurfaceSpeedBoost = RESURFACE_SPEED_BONUS
            }
            this.dx += Math.cos(targetRotation) * dt * THRUST_SPEED
            this.dy += Math.sin(targetRotation) * dt * (THRUST_SPEED + resurfaceSpeedBoost)
        }

        this.dx *= DRAG_FACTOR
        this.dy *= DRAG_FACTOR

        let previousX = this.x
        let previousY = this.y

        this.x += this.dx * dt
        this.y += this.dy * dt

        this.y = Math.max(this.y, 0)

        const [fillX, fillY] = tileMap.worldToFillCoords(this.x, this.y)
        if (tileMap.getFilled(fillX, fillY)) {
            if (this.fuel > 0) {
                this.fuel -= DRILL_FUEL_COST
                if (this.fuel < 0) {
                    this.fuel = 0
                }
                tileMap.setFilled(fillX, fillY, false)

                // TODO: Handle ore collection
            } else {
                this.x = previousX
                this.y = previousY
                this.dx = 0
                this.dy = 0
            }
        }

        if (this.y <= 0) {
            this.oxygen += OXYGEN_REFILL_RATE * dt
            if (this.oxygen > 1) {
                this.oxygen = 1
            }
            targetRotation = this.facing < 0 ? Math.PI : 0

            if (Math.abs(this.x) < REFUEL_MAX_DIST) {
                this.fuel += REFUEL_RATE * dt
                if (this.fuel > 1) {
                    this.fuel = 1
                }
            }
        } else {
            this.oxygen -= OXYGEN_DRAIN_RATE * dt
            if (this.oxygen < 0) {
                this.oxygen = 0
                // TODO: Handle game over or respawn
            }
        }

        this.rotation = moveAngleTowards(this.rotation, targetRotation, dt * TURN_SPEED)

        if (this.invulnerable) {
            this.invulnerableTime -= dt
            if (this.invulnerableTime <= 0) {
                this.invulnerable = false
                this.invulnerableTime = 0
            }
        }

        camera.x = Math.min(WORLD_LIMIT_X, Math.max(-WORLD_LIMIT_X, this.x))
        camera.y = Math.min(this.y + 128, Math.max(this.y - 128, camera.y))
        if (camera.y !== this.y) {
            camera.y += (this.y - camera.y) * dt
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        const [subX, subY] = camera.fromWorld(this.x, this.y)

        if (subSprite.loaded) {
            ctx.save()
            if (this.invulnerable && this.invulnerableTime > 0) {
                if (this.invulnerableTime % 0.1 < 0.05) {
                    ctx.globalAlpha = 0.5
                }
            }
            ctx.translate(subX, subY)
            ctx.rotate(this.rotation + (this.facing < 0 ? Math.PI : 0)) // Rotate the sub based on direction
            ctx.scale(-this.facing, 1) // Flip the sprite based on facing direction
            subSprite.draw(ctx, 0, 0, 0)
            ctx.restore()
        }
    }

    override renderLights(ctx: OffscreenCanvasRenderingContext2D): void {
        const [subX, subY] = camera.fromWorld(this.x, this.y)

        ctx.save()
        ctx.translate(subX, subY)
        ctx.rotate(this.rotation + (this.facing < 0 ? Math.PI : 0)) // Rotate the sub based on direction
        ctx.scale(-this.facing, 1) // Flip the sprite based on facing direction
        subLightSprite.draw(ctx, -96, 0, 0)
        ctx.restore()
    }

    hit(dmg: number): void {
        if (this.invulnerable) return
        this.invulnerable = true
        this.invulnerableTime = HURT_INVULN_TIME
        // TODO: Handle damage to sub
    }
}

export const sub = new Sub()
