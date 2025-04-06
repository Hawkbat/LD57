import { SpriteAsset } from "./assets.js"
import { GAME_HEIGHT, GAME_WIDTH, HUD_WIDTH } from "./constants.js"
import { getAverageFPS } from "./engine.js"
import { Entity } from "./entity.js"
import { sub } from "./sub.js"

const oxygenTankSprite = new SpriteAsset('images/Oxygen_Tank.png', 32, 64)
const fuelTankSprite = new SpriteAsset('images/Fuel_Tank.png', 32, 64)
const oreSprite = new SpriteAsset('images/Tiles.png', 32, 32)

export class HUD extends Entity {

    override get sortOrder(): number {
        return 100
    }

    reset(): void {
        
    }

    update(dt: number): void {
        
    }

    render(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = '#000'
        const hudX = ctx.canvas.width - HUD_WIDTH
        const hudY = 0
        const hudWidth = 128
        const hudHeight = ctx.canvas.height
        ctx.fillRect(hudX, hudY, hudWidth, hudHeight)
        
        const o2TankX = hudX
        const o2TankY = hudY
        const o2FillHeight = Math.round(42 * sub.oxygen)
        ctx.fillStyle = '#0FF'
        ctx.fillRect(o2TankX + 13, o2TankY + 11 + (42 - o2FillHeight), 4, o2FillHeight)
        oxygenTankSprite.draw(ctx, o2TankX + 16, o2TankY + 32, 0)

        const fuelTankX = hudX + 64
        const fuelTankY = hudY
        const fuelFillHeight = Math.round(42 * sub.fuel)
        ctx.fillStyle = '#FF0'
        ctx.fillRect(fuelTankX + 13, fuelTankY + 11 + (42 - fuelFillHeight), 4, fuelFillHeight)
        fuelTankSprite.draw(ctx, fuelTankX + 16, fuelTankY + 32, 0)

        ctx.font = '16px Arbutus'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.textRendering = 'optimizeSpeed'

        ctx.fillStyle = '#FFF'
        const depth = Math.round(sub.y)
        ctx.fillText(`${depth}m`, hudX + HUD_WIDTH / 2, hudY + 96)
        ctx.fillText('Depth', hudX + HUD_WIDTH / 2, hudY + 128)

        const longitude = Math.round(sub.x)
        ctx.fillText(`${longitude}m`, hudX + HUD_WIDTH / 2, hudY + 160)
        ctx.fillText('Longitude', hudX + HUD_WIDTH / 2, hudY + 192)
        
        if (sub.oxygen < 0.2) {
            ctx.fillStyle = '#F00'
            ctx.fillText('Oxygen Low!', hudX + HUD_WIDTH / 2, hudY + 224)
        }

        if (sub.fuel === 0) {
            ctx.fillStyle = '#F00'
            ctx.fillText('Fuel Empty!', hudX + HUD_WIDTH / 2, hudY + 256)
        }

        if (sub.inventory.length === sub.inventorySize) {
            ctx.fillStyle = '#F00'
            ctx.fillText('Cargo Full!', hudX + HUD_WIDTH / 2, hudY + 288)
        } else {
            ctx.fillStyle = '#FFF'
            ctx.fillText(`Cargo ${sub.inventory.length}/${sub.inventorySize}`, hudX + HUD_WIDTH / 2, hudY + 288)
        }

        for (let i = 0; i < sub.inventory.length; i++) {
            const oreType = sub.inventory[i]
            const x = hudX + 16 + (i % 4) * 32
            const y = hudY + 336 + Math.floor(i / 4) * 32
            const frame = 99 + oreType
            oreSprite.draw(ctx, x, y, frame)
        }

        ctx.fillStyle = '#FFF'
        ctx.textAlign = 'right'
        ctx.textBaseline = 'bottom'
        ctx.fillText(`${Math.round(getAverageFPS() * 10) / 10} FPS`, GAME_WIDTH, GAME_HEIGHT)
    }

    override renderLights(ctx: OffscreenCanvasRenderingContext2D): void {
        ctx.fillStyle = '#FFF'
        ctx.fillRect(ctx.canvas.width - HUD_WIDTH, 0, HUD_WIDTH, ctx.canvas.height)
    }
}

export const hud = new HUD()
