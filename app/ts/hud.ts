import { SpriteAsset } from "./assets.js"
import { GAME_HEIGHT, GAME_WIDTH, HUD_WIDTH } from "./constants.js"
import { getAverageFPS } from "./engine.js"
import { Entity } from "./entity.js"
import { shop } from "./shop.js"
import { sub } from "./sub.js"

const healthIconSprite = new SpriteAsset('images/HealthSub.png', 32, 32)
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

        let rowY = hudY

        for (let i = 0; i < sub.maxHealth; i++) {
            const healthX = hudX + 16 + (i % 4) * 32
            const healthY = rowY + 16 + Math.floor(i / 4) * 32
            if (sub.health >= i + 1) {
                ctx.globalAlpha = 1
            } else {
                ctx.globalAlpha = 0.2
            }
            healthIconSprite.draw(ctx, healthX, healthY, 0)
        }
        ctx.globalAlpha = 1
        rowY += 64
        
        for (let i = 0; i < sub.oxygenTanks; i++) {
            const o2TankX = hudX + i * 32
            const o2TankY = rowY
            const oxygenInTank = sub.oxygen >= i + 1 ? 1 : sub.oxygen < i ? 0 : sub.oxygen - i
            const o2FillHeight = Math.round(42 * oxygenInTank)
            ctx.fillStyle = '#0FF'
            ctx.fillRect(o2TankX + 13, o2TankY + 11 + (42 - o2FillHeight), 4, o2FillHeight)
            oxygenTankSprite.draw(ctx, o2TankX + 16, o2TankY + 32, 0)
        }

        for (let i = 0; i < sub.fuelTanks; i++) {
            const fuelTankX = hudX + 64 + i * 32
            const fuelTankY = rowY
            const fuelInTank = sub.fuel >= i + 1 ? 1 : sub.fuel < i ? 0 : sub.fuel - i
            const fuelFillHeight = Math.round(42 * fuelInTank)
            ctx.fillStyle = '#FF0'
            ctx.fillRect(fuelTankX + 13, fuelTankY + 11 + (42 - fuelFillHeight), 4, fuelFillHeight)
            fuelTankSprite.draw(ctx, fuelTankX + 16, fuelTankY + 32, 0)
        }

        rowY += 64
        rowY += 16

        ctx.font = '16px Arbutus'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.textRendering = 'optimizeSpeed'

        ctx.fillStyle = '#FFF'
        const depth = Math.round(sub.y)
        ctx.fillText(`${depth}m`, hudX + HUD_WIDTH / 2, rowY)
        rowY += 16
        ctx.font = '12px Arbutus'
        ctx.fillText('DEPTH', hudX + HUD_WIDTH / 2, rowY)
        ctx.font = '16px Arbutus'
        rowY += 32

        const longitude = Math.round(sub.x)
        ctx.fillText(`${longitude}m`, hudX + HUD_WIDTH / 2, rowY)
        rowY += 16
        ctx.font = '12px Arbutus'
        ctx.fillText('LONGITUDE', hudX + HUD_WIDTH / 2, rowY)
        ctx.font = '16px Arbutus'
        rowY += 32

        ctx.fillText(`Money: $${shop.money}`, hudX + HUD_WIDTH / 2, rowY)
        rowY += 32

        if (sub.inventory.length === sub.inventorySize) {
            ctx.fillStyle = '#F00'
            ctx.fillText('Cargo Full!', hudX + HUD_WIDTH / 2, rowY)
            rowY += 32
        } else {
            ctx.fillStyle = '#FFF'
            ctx.fillText(`Cargo ${sub.inventory.length}/${sub.inventorySize}`, hudX + HUD_WIDTH / 2, rowY)
            rowY += 32
        }

        for (let i = 0; i < sub.inventory.length; i++) {
            const oreType = sub.inventory[i]
            const x = hudX + 16 + (i % 4) * 32
            const y = rowY + Math.floor(i / 4) * 32
            const frame = 99 + oreType
            oreSprite.draw(ctx, x, y, frame)
        }
        rowY += Math.ceil(sub.inventorySize / 4) * 32
        
        if (sub.oxygen < 1 / 3) {
            ctx.fillStyle = '#F00'
            ctx.fillText('Oxygen Low!', hudX + HUD_WIDTH / 2, rowY)
            rowY += 32
        }

        if (sub.fuel === 0) {
            ctx.fillStyle = '#F00'
            ctx.fillText('Fuel Empty!', hudX + HUD_WIDTH / 2, rowY)
            rowY += 32
        }

        ctx.fillStyle = '#FFF'
        ctx.textAlign = 'right'
        ctx.textBaseline = 'bottom'
        ctx.fillText(`${Math.round(getAverageFPS() * 10) / 10} FPS`, GAME_WIDTH, GAME_HEIGHT)

        
        ctx.font = '16px Arbutus'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        let msgY = 0
        for (const msg of sub.pickupMessages) {
            ctx.fillStyle = '#FFF'
            ctx.fillText(msg.message, 0, msgY)
            msgY += 16
        }
    }

    override renderLights(ctx: OffscreenCanvasRenderingContext2D): void {
        ctx.fillStyle = '#FFF'
        ctx.fillRect(ctx.canvas.width - HUD_WIDTH, 0, HUD_WIDTH, ctx.canvas.height)

        ctx.font = '16px Arbutus'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        let msgY = 0
        for (const msg of sub.pickupMessages) {
            ctx.fillStyle = '#FFF'
            ctx.fillText(msg.message, 0, msgY)
            msgY += 16
        }
    }
}

export const hud = new HUD()
