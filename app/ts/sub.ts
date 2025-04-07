import { SoundAsset, SpriteAsset } from "./assets.js"
import { camera } from "./camera.js"
import { WORLD_LIMIT_X } from "./constants.js"
import { Debris } from "./debris.js"
import { addEntity, Entity, getEntitiesOfType, removeEntity } from "./entity.js"
import { emitEvent } from "./events.js"
import { Fish } from "./fish.js"
import { ACTIONS } from "./input.js"
import { distance, moveAngleTowards, moveVectorTowards } from "./math.js"
import { Pickup } from "./pickup.js"
import { OreType, tileMap } from "./tilemap.js"

const RESURFACE_SPEED_BONUS = 200
const DRAG_FACTOR = 0.95
const COLLISION_SIZE = 24
const DRILL_SIZE = 28
const OXYGEN_DRAIN_RATE = 1 / 60 // 2 minutes
const OXYGEN_REFILL_RATE = 1 / 1 // 1 second
const HURT_INVULN_TIME = 1.0
const EXPLOSION_TIME = 1 // seconds
const EXPLOSION_RADIUS = 128 // pixels
const TURN_SPEED = Math.PI // radians per second
const MINING_FUEL_DRAIN_RATE = 1 / 15 // 15 seconds
const REFUEL_MAX_DIST = 64
const REFUEL_RATE = 1 / 1 // 1 second
const INITIAL_SPEED = 300
const INITIAL_INVENTORY_SIZE = 8
const INITIAL_MAX_HEALTH = 3

const PICKUP_RADIUS = 64 // pixels
const PICKUP_OXYGEN_AMOUNT = 0.2 // 20% per pickup
const PICKUP_FUEL_AMOUNT = 0.2 // 20% per pickup

const MINING_ANIM_RATE = 0.05 // seconds per frame
const LOW_OXYGEN_THRESHOLD = 0.3 // 30% oxygen

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
const explosionSprite = new SpriteAsset('images/Explosion.png', 64, 64)

const damagedSound = new SoundAsset('sounds/shipdamage.wav')
const moveSound = new SoundAsset('sounds/shipmove.wav')
const mineStartSound = new SoundAsset('sounds/DrillPowered.wav')
const mineLoopSound = new SoundAsset('sounds/rock break.wav')
const outOfFuelSound = new SoundAsset('sounds/DrillUnpowered.wav')
const pickupOreSound = new SoundAsset('sounds/collect.wav')
const lowOxygenSound = new SoundAsset('sounds/alarm.wav')
const explosionSound = new SoundAsset('sounds/explosion.wav')

const playMusic = new SoundAsset('music/Treasure of the depths.mp3')
const victoryMusic = new SoundAsset('music/Victory Jingle.mp3')

export class Sub extends Entity {
    public x: number = 0
    public y: number = 0
    public dx: number = 0
    public dy: number = 0
    public facing: number = 1 // 1 = right, -1 = left
    public rotation: number = 0 // In radians

    public speed: number = INITIAL_SPEED
    public health: number = INITIAL_MAX_HEALTH
    public maxHealth: number = INITIAL_MAX_HEALTH
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

    public state: 'play' | 'shop' | 'drown' | 'explode' | 'victory' | 'title' = 'play'
    public playTime: number = 0
    public deathTime: number = 0

    moveSoundCallback: (() => void) | null = null
    miningSoundCallback: (() => void) | null = null
    playMusicCallback: (() => void) | null = null
    victoryMusicCallback: (() => void) | null = null

    reset(): void {
        this.x = 0
        this.y = 0
        this.dx = 0
        this.dy = 0
        this.facing = 1
        this.rotation = 0
        this.speed = INITIAL_SPEED
        this.health = INITIAL_MAX_HEALTH
        this.maxHealth = INITIAL_MAX_HEALTH
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
        this.state = 'title'
        this.playTime = 0
        this.deathTime = 0
        this.moveSoundCallback = null
        this.miningSoundCallback = null
        this.playMusicCallback = null
        this.victoryMusicCallback = null
    }

    update(dt: number): void {
        let dirX = 0
        let dirY = 0
        if (this.state === 'play') {
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

            let speed = this.speed

            getEntitiesOfType(Fish).forEach(fish => {
                if (distance(fish.x, fish.y, this.x, this.y) < 32) {
                    speed /= 2
                }
            })

            this.dx += Math.cos(targetRotation) * dt * speed
            this.dy += Math.sin(targetRotation) * dt * (speed + resurfaceSpeedBoost)
            
            if (this.moveSoundCallback == null) {
                this.moveSoundCallback = moveSound.play(0.5, true)
            }
        } else {
            if (this.moveSoundCallback != null) {
                this.moveSoundCallback()
                this.moveSoundCallback = null
            }
        }

        this.dx *= DRAG_FACTOR
        this.dy *= DRAG_FACTOR

        let previousX = this.x
        let previousY = this.y

        this.x += this.dx * dt
        this.y += this.dy * dt

        this.y = Math.max(this.y, 0)
        
        for (let y = this.y - COLLISION_SIZE; y <= this.y + COLLISION_SIZE; y += COLLISION_SIZE) {
            const [fillX, fillY] = tileMap.worldToFillCoords(this.x + COLLISION_SIZE * Math.sign(this.dx), y)
            if (tileMap.getFilled(fillX, fillY)) {
                this.x = previousX
                this.dx = 0
            }
        }

        for (let x = this.x - COLLISION_SIZE; x <= this.x + COLLISION_SIZE; x += COLLISION_SIZE) {
            const [fillX, fillY] = tileMap.worldToFillCoords(x, this.y + COLLISION_SIZE * Math.sign(this.dy))
            if (tileMap.getFilled(fillX, fillY)) {
                this.y = previousY
                this.dy = 0
            }
        }

        if (this.state === 'title') {
            if (ACTIONS.interact.pressed) {
                ACTIONS.interact.eat()

                this.state = 'play'
                this.playMusicCallback = playMusic.play(1, true)
            }
        } else if (this.state === 'drown' || this.state === 'explode') {
            this.deathTime += dt
            if (this.playMusicCallback !== null) {
                this.playMusicCallback()
                this.playMusicCallback = null
            }
            if (this.moveSoundCallback !== null) {
                this.moveSoundCallback()
                this.moveSoundCallback = null
            }
            if (this.miningSoundCallback !== null) {
                this.miningSoundCallback()
                this.miningSoundCallback = null
            }
            
            if (ACTIONS.interact.pressed) {
                ACTIONS.interact.eat()

                emitEvent('restart-game')
            }
        } else if (this.state === 'victory') {
            if (this.victoryMusicCallback === null) {
                this.victoryMusicCallback = victoryMusic.play()
            }
            if (this.playMusicCallback !== null) {
                this.playMusicCallback()
                this.playMusicCallback = null
            }
            if (this.moveSoundCallback !== null) {
                this.moveSoundCallback()
                this.moveSoundCallback = null
            }
            if (this.miningSoundCallback !== null) {
                this.miningSoundCallback()
                this.miningSoundCallback = null
            }

            if (ACTIONS.interact.pressed) {
                ACTIONS.interact.eat()

                this.victoryMusicCallback()
                this.victoryMusicCallback = null

                emitEvent('restart-game')
            }
        } else if (this.state === 'play') {
            this.playTime += dt

            const drillX = this.x + dirX * DRILL_SIZE
            const drillY = this.y + dirY * DRILL_SIZE
    
            const [fillX, fillY] = tileMap.worldToFillCoords(drillX, drillY)
            if (tileMap.getFilled(fillX, fillY)) {
                if (!this.mining || this.miningFillX !== fillX || this.miningFillY !== fillY) {
                    this.mining = true
                    this.miningTime = 0
                    this.miningFillX = fillX
                    this.miningFillY = fillY
                    if (this.fuel > 0) {
                        mineStartSound.play(0.5)
                        if (this.miningSoundCallback !== null) {
                            this.miningSoundCallback()
                        }
                        this.miningSoundCallback = mineLoopSound.play(1, true)
                    } else {
                        outOfFuelSound.play()
                    }
                }
                
                if (this.fuel > 0) {
                    this.fuel -= MINING_FUEL_DRAIN_RATE * dt
                    if (this.fuel < 0) {
                        this.fuel = 0
                        outOfFuelSound.play()
                        if (this.miningSoundCallback !== null) {
                            this.miningSoundCallback()
                            this.miningSoundCallback = null
                        }
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
                        if (this.miningSoundCallback !== null) {
                            this.miningSoundCallback()
                            this.miningSoundCallback = null
                        }
                    }
                }
            } else {
                this.mining = false
                this.miningTime = 0
                if (this.miningSoundCallback !== null) {
                    this.miningSoundCallback()
                    this.miningSoundCallback = null
                }
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
                const prevOxygen = this.oxygen
                this.oxygen -= OXYGEN_DRAIN_RATE * dt
                if (this.oxygen < LOW_OXYGEN_THRESHOLD && prevOxygen >= LOW_OXYGEN_THRESHOLD) {
                    lowOxygenSound.play()
                }
                if (this.oxygen < 0) {
                    this.oxygen = 0
                    this.state = 'drown'
                    this.deathTime = 0
                }
            }
    
            for (const pickup of getEntitiesOfType(Pickup)) {
                if (!pickup.pickingUp) {
                    const hasRoom = this.inventory.length + this.inventoryPickups.length < this.inventorySize
                    if (hasRoom || pickup.oreType === OreType.fuel || pickup.oreType === OreType.oxygen) {
                        const dist = distance(pickup.x, pickup.y, this.x, this.y)
                        if (dist < PICKUP_RADIUS) {
                            pickup.pickingUp = true
                            pickup.pickupTime = 0
                            this.inventoryPickups.push(pickup)
                        }
                    }
                }
                if (pickup.pickingUp) {
                    [pickup.x, pickup.y] = moveVectorTowards(pickup.x, pickup.y, this.x, this.y, 100 * dt)
                    pickup.pickupTime += dt
                    const dist = distance(pickup.x, pickup.y, this.x, this.y)
                    if (pickup.pickupTime > 1 || dist < 8) {
                        this.inventoryPickups.splice(this.inventoryPickups.indexOf(pickup), 1)
                        if (pickup.oreType === OreType.fuel) {
                            this.fuel += PICKUP_FUEL_AMOUNT
                            if (this.fuel > this.fuelTanks) {
                                this.fuel = this.fuelTanks
                            }
                        } else if (pickup.oreType === OreType.oxygen) {
                            this.oxygen += PICKUP_OXYGEN_AMOUNT
                            if (this.oxygen > this.oxygenTanks) {
                                this.oxygen = this.oxygenTanks
                            }
                        } else {
                            this.inventory.push(pickup.oreType)
                        }
                        removeEntity(pickup)
                        pickupOreSound.play()
                    }
                }
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

        if (this.state === 'explode' && this.deathTime < EXPLOSION_TIME) {
            const frame = Math.floor(this.deathTime / EXPLOSION_TIME * 8)
            explosionSprite.draw(ctx, subX, subY, frame)
        }

        if (subSprite.image && this.state !== 'explode') {
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

        if (this.state === 'explode' && this.deathTime < EXPLOSION_TIME) {
            const [mineX, mineY] = camera.fromWorld(this.x, this.y)
            const brightness = 0xF - Math.floor(this.deathTime / EXPLOSION_TIME * 0xF)
            const l = brightness.toString(16)
            ctx.fillStyle = `#${l}${l}${l}`
            ctx.beginPath()
            ctx.arc(mineX, mineY, EXPLOSION_RADIUS, 0, Math.PI * 2)
            ctx.fill()
        } else if (this.state !== 'explode') {
            ctx.save()
            ctx.translate(subX, subY)
            ctx.rotate(this.rotation + (this.facing < 0 ? Math.PI : 0)) // Rotate the sub based on direction
            ctx.scale(-this.facing, 1) // Flip the sprite based on facing direction
            subLightSprite.draw(ctx, -96, 0, 0)
            ctx.restore()
        }

    }

    hit(dmg: number): void {
        if (this.invulnerable) return
        this.invulnerable = true
        this.invulnerableTime = HURT_INVULN_TIME
        damagedSound.play()
        this.health -= dmg
        if (this.health <= 0) {
            this.health = 0
            this.state = 'explode'
            this.deathTime = 0
            explosionSound.play()
            this.invulnerableTime = Infinity
        }
    }
}

export const sub = new Sub()
