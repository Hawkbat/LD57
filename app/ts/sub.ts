import { SpriteAsset } from "./assets.js"
import { camera } from "./camera.js"
import { WORLD_LIMIT_X } from "./constants.js"
import { Debris } from "./debris.js"
import { addEntity, Entity } from "./entity.js"
import { ACTIONS } from "./input.js"
import { moveAngleTowards } from "./math.js"
import { Pickup } from "./pickup.js"
import { OreType, tileMap } from "./tilemap.js"

const THRUST_SPEED = 400
const RESURFACE_SPEED_BONUS = 200
const DRAG_FACTOR = 0.95
const OXYGEN_DRAIN_RATE = 1 / 60 // 2 minutes
const OXYGEN_REFILL_RATE = 1 / 5 // 5 seconds
const HURT_INVULN_TIME = 1.0
const TURN_SPEED = Math.PI // radians per second
const MINING_FUEL_DRAIN_RATE = 1 / 15 // 15 seconds
const REFUEL_MAX_DIST = 64
const REFUEL_RATE = 1 / 10 // 10 seconds to refuel
const INITIAL_INVENTORY_SIZE = 12

const MINING_ANIM_RATE = 0.05 // seconds per frame

const ORE_MINING_TIMES: Record<OreType, number> = {
    [OreType.empty]: 0.25,
    [OreType.fuel]: 0.4,
    [OreType.oxygen]: 0.4,
    [OreType.bronze]: 0.6,
    [OreType.silver]: 1,
    [OreType.gold]: 2,
    [OreType.diamond]: 3,
}

const subSprite = new SpriteAsset('images/Drillship_01.png', 64, 64)
const subLightSprite = new SpriteAsset('images/Drillship_Light.png', 256, 256)

export class Sub extends Entity {
    public x: number = 0
    public y: number = 0
    public dx: number = 0
    public dy: number = 0
    public facing: number = 1 // 1 = right, -1 = left
    public rotation: number = 0 // In radians

    public oxygen: number = 1 // 0-100%, goes higher with multiple tanks
    public oxygenTanks: number = 1
    public fuel: number = 1 // 0-100%, goes higher with multiple tanks
    public fuelTanks: number = 1
    public invulnerable: boolean = false
    public invulnerableTime: number = 0

    public mining: boolean = false
    public miningTime: number = 0
    public miningFillX: number = 0
    public miningFillY: number = 0
    public miningSpeed: number = 1 // 0-100%, goes higher with upgrades

    public inventory: OreType[] = []
    public inventorySize: number = INITIAL_INVENTORY_SIZE
    public inventoryPickups: Pickup[] = []

    public menu: 'none' | 'shop' | 'pause' = 'none'

    reset(): void {
        this.x = 0
        this.y = 0
        this.dx = 0
        this.dy = 0
        this.facing = 1
        this.rotation = 0
        this.oxygen = 1
        this.oxygenTanks = 1
        this.fuel = 1
        this.fuelTanks = 1
        this.invulnerable = false
        this.invulnerableTime = 0
        this.mining = false
        this.miningTime = 0
        this.miningFillX = 0
        this.miningFillY = 0
        this.miningSpeed = 1
        this.inventory = []
        this.inventorySize = INITIAL_INVENTORY_SIZE
        this.inventoryPickups = []
        this.menu = 'none'
    }

    update(dt: number): void {
        let dirX = 0
        let dirY = 0
        if (this.menu === 'none') {
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
        }

        let targetRotation = this.rotation

        if (dirX !== 0 || dirY !== 0) {
            targetRotation = Math.atan2(dirY, dirX)
            let resurfaceSpeedBoost = 0
            if (dirY < 0) {
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
            this.x = previousX
            this.y = previousY
            this.dx = 0
            this.dy = 0

            if (!this.mining || this.miningFillX !== fillX || this.miningFillY !== fillY) {
                this.mining = true
                this.miningTime = 0
                this.miningFillX = fillX
                this.miningFillY = fillY
            }
            
            if (this.fuel > 0) {
                this.fuel -= MINING_FUEL_DRAIN_RATE * dt
                if (this.fuel < 0) {
                    this.fuel = 0
                }
                this.miningTime += dt
            }

            if (this.mining) {
                const oreType = Math.max(
                    tileMap.getOre(fillX - 1, fillY - 1),
                    tileMap.getOre(fillX, fillY - 1),
                    tileMap.getOre(fillX - 1, fillY),
                    tileMap.getOre(fillX, fillY),
                )
                const oreMiningTime = ORE_MINING_TIMES[Number(oreType) as OreType] ?? 0
                if (this.miningTime * this.miningSpeed >= oreMiningTime) {

                    const debrisCount = 8 + Math.floor(Math.random() * 3)
                    for (let i = 0; i < debrisCount; i++) {
                        const [debrisX, debrisY] = tileMap.fillToWorldCoords(fillX, fillY)
                        addEntity(new Debris(debrisX + Math.random() * 64 - 32, debrisY + Math.random() * 64 - 32))
                    }

                    for (let oreX = fillX - 1; oreX <= fillX; oreX++) {
                        for (let oreY = fillY - 1; oreY <= fillY; oreY++) {
                            const oreType = tileMap.getOre(oreX, oreY)
                            if (oreType === OreType.empty) continue
                            let [pickupX, pickupY] = tileMap.oreToWorldCoords(oreX, oreY)
                            pickupX += Math.random() * 16 - 8
                            pickupY += Math.random() * 16 - 8
                            const pickup = new Pickup(pickupX, pickupY, oreType)
                            addEntity(pickup)
                            tileMap.setOre(oreX, oreY, OreType.empty)
                        }
                    }
                    tileMap.setFilled(fillX, fillY, false)
                    this.mining = false
                }
            }
        } else {
            this.mining = false
            this.miningTime = 0
        }

        if (this.y <= 0) {
            this.oxygen += OXYGEN_REFILL_RATE * dt
            if (this.oxygen > this.oxygenTanks) {
                this.oxygen = this.oxygenTanks
            }
            targetRotation = this.facing < 0 ? Math.PI : 0

            if (Math.abs(this.x) < REFUEL_MAX_DIST) {
                this.fuel += REFUEL_RATE * dt
                if (this.fuel > this.fuelTanks) {
                    this.fuel = this.fuelTanks
                }
            }
        } else {
            this.oxygen -= OXYGEN_DRAIN_RATE * dt
            if (this.oxygen < 0) {
                this.oxygen = 0
                // TODO: Handle game over
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

            const frame = this.mining ? 1 + Math.floor(this.miningTime / MINING_ANIM_RATE) % 2 : 0

            subSprite.draw(ctx, 0, 0, frame)
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
