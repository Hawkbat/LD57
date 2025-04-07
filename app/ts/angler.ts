import { SoundAsset, SpriteAsset } from "./assets.js"
import { sub } from "./sub.js"
import { camera } from "./camera.js"
import { Monster } from "./monster.js"
import { PLAY_AREA_WIDTH, PLAY_AREA_HEIGHT } from "./constants.js"

const SPEED = 350
const DRAG_FACTOR = 0.95
const DETECTION_RADIUS = 128
const LOSE_CHASE_RADIUS = 384
const ANIM_FRAME_RATE = 0.1
const ATTACK_RADIUS = 48
const ATTACK_DAMAGE = 1

const SPRITE_WIDTH = 64
const SPRITE_HEIGHT = 64

const anglerSprite = new SpriteAsset('images/Anglerfish.png', SPRITE_WIDTH, SPRITE_HEIGHT)

const alertSound = new SoundAsset('sounds/angler.wav')

export class Angler extends Monster {
    public dx: number = 0
    public dy: number = 0
    public facing: number = Math.random() > 0.5 ? 1 : -1 // 1 = right, -1 = left
    public alerted: boolean = false
    animTime: number = 0

    constructor(x: number, y: number) {
        super()
        this.x = x
        this.y = y
    }

    reset(): void {
        this.x = 0
        this.y = 0
        this.dx = 0
        this.dy = 0
        this.facing = Math.random() > 0.5 ? 1 : -1
        this.alerted = false
        this.animTime = 0
    }

    update(dt: number): void {
        let dirX = 0
        let dirY = 0

        const distX = Math.abs(sub.x - this.x)
        const distY = Math.abs(sub.y - this.y)
        const dist = Math.sqrt(distX ** 2 + distY ** 2)

        if (this.alerted) {
            if (dist > LOSE_CHASE_RADIUS) {
                this.alerted = false
            } else {
                dirX = Math.sign(sub.x - this.x)
                dirY = Math.sign(sub.y - this.y)
            }

            if (dist < ATTACK_RADIUS) {
                sub.hit(ATTACK_DAMAGE)
            }
        } else {
            if (dist < DETECTION_RADIUS) {
                this.alerted = true
                alertSound.play()
            }
        }

        if (dirX !== 0 || dirY !== 0) {
            if (distX > 5) {
                this.facing = Math.sign(dirX)
            }
            this.dx += Math.cos(Math.atan2(dirY, dirX)) * dt * SPEED
            this.dy += Math.sin(Math.atan2(dirY, dirX)) * dt * SPEED
        }

        this.dx *= DRAG_FACTOR
        this.dy *= DRAG_FACTOR

        this.x += this.dx * dt
        this.y += this.dy * dt

        this.animTime += dt
    }

    render(ctx: CanvasRenderingContext2D): void {
        const [anglerX, anglerY] = camera.fromWorld(this.x, this.y)

        if (anglerX < -SPRITE_WIDTH * 0.5 || anglerX > PLAY_AREA_WIDTH + SPRITE_WIDTH * 0.5 || anglerY < -SPRITE_HEIGHT * 0.5 || anglerY > PLAY_AREA_HEIGHT + SPRITE_HEIGHT * 0.5) {
            return
        }

        ctx.save()
        ctx.translate(anglerX, anglerY)
        ctx.scale(this.facing, 1)
        let frame = 0
        if (this.alerted) {
            frame = 1 + Math.floor(this.animTime / ANIM_FRAME_RATE) % 4
        }
        anglerSprite.draw(ctx, 0, 0, frame)
        ctx.restore()
    }

    override renderLights(ctx: OffscreenCanvasRenderingContext2D): void {
        const [anglerX, anglerY] = camera.fromWorld(this.x, this.y)
        ctx.save()
        ctx.translate(anglerX, anglerY)
        ctx.scale(this.facing, 1)
        ctx.fillStyle = '#FFA'
        ctx.beginPath()
        if (this.alerted) {
            ctx.arc(0, 0, 64, 0, Math.PI * 2)
        } else {
            ctx.arc(27, -16, 8, 0, Math.PI * 2)
        }
        ctx.fill()
        ctx.restore()
    }

    override hit(damage: number): void {
        
    }
}
