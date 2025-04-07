import { SoundAsset, SpriteAsset } from "./assets.js"
import { GAME_HEIGHT, PLAY_AREA_HEIGHT, PLAY_AREA_WIDTH } from "./constants.js"
import { Entity } from "./entity.js"
import { ACTIONS } from "./input.js"
import { distance } from "./math.js"
import { sub } from "./sub.js"
import { OreType } from "./tilemap.js"

const SHOP_OPEN_DISTANCE = 64 // pixels

const REPAIR_COST = 5
const UPGRADES_PER_ROW = 3

const ORE_SELL_PRICES: Record<OreType, number> = {
    [OreType.empty]: 0,
    [OreType.fuel]: 0,
    [OreType.oxygen]: 0,
    [OreType.bronze]: 5,
    [OreType.silver]: 20,
    [OreType.gold]: 50,
    [OreType.diamond]: 100,
}

interface ShopItem {
    name: string
    price: number
    onPurchase: () => void
    stock: number
    frame: number
}

const SHOP_ITEMS: ShopItem[] = [
    { name: "Increase Hull Durability", price: 40, onPurchase: () => (sub.maxHealth++, sub.health++), stock: 5, frame: 0 },
    { name: "Improve Drill Speed (+20%)", price: 25, onPurchase: () => sub.miningSpeed += 0.2, stock: 5, frame: 1 },
    { name: "Extra Oxygen Tank", price: 50, onPurchase: () => (sub.oxygenTanks++, sub.oxygen++), stock: 1, frame: 2 },
    { name: "Extra Fuel Tank", price: 30, onPurchase: () => (sub.fuelTanks++, sub.fuel++), stock: 1, frame: 3 },
    { name: "Expand Cargo (+4)", price: 40, onPurchase: () => sub.inventorySize += 4, stock: 3, frame: 4 },
    { name: "Pay Quota", price: 1000, onPurchase: () => sub.state = 'victory', stock: 1, frame: 5 },
]

const buySound = new SoundAsset('sounds/Buy.wav')
const moveCursorSound = new SoundAsset('sounds/hover item.wav')

const upgradesSprite = new SpriteAsset('images/Upgrades.png', 64, 64)

export class Shop extends Entity {
    public menuCursorIndex: number = 0
    public upgradeCursorIndex: number = 0
    public inUpgradeMenu: boolean = false
    public purchases: ShopItem[] = []
    public money: number = 0

    override get sortOrder(): number {
        return 110
    }

    override reset(): void {
        this.menuCursorIndex = 0
        this.upgradeCursorIndex = 0
        this.inUpgradeMenu = false
        this.purchases = []
        this.money = 0
    }

    override update(dt: number): void {
        if (sub.state === 'play' && ACTIONS.interact.pressed) {
            const dist = distance(0, 0, sub.x, sub.y)
            if (dist < SHOP_OPEN_DISTANCE) {
                sub.state = 'shop'
                this.menuCursorIndex = 0
                this.inUpgradeMenu = false
            }
        } else if (sub.state === 'shop') {
            if (this.inUpgradeMenu) {
                if (ACTIONS.up.pressed) {
                    this.upgradeCursorIndex = (this.upgradeCursorIndex - UPGRADES_PER_ROW + SHOP_ITEMS.length) % SHOP_ITEMS.length
                    moveCursorSound.play()
                }
                if (ACTIONS.down.pressed) {
                    this.upgradeCursorIndex = (this.upgradeCursorIndex + UPGRADES_PER_ROW) % SHOP_ITEMS.length
                    moveCursorSound.play()
                }
                if (ACTIONS.left.pressed) {
                    this.upgradeCursorIndex = (this.upgradeCursorIndex - 1 + SHOP_ITEMS.length) % SHOP_ITEMS.length
                    moveCursorSound.play()
                }
                if (ACTIONS.right.pressed) {
                    this.upgradeCursorIndex = (this.upgradeCursorIndex + 1) % SHOP_ITEMS.length
                    moveCursorSound.play()
                }
                if (ACTIONS.interact.pressed) {
                    ACTIONS.interact.eat()
                    
                    const item = SHOP_ITEMS[this.upgradeCursorIndex]
                    const remainingStock = item.stock - this.purchases.filter(p => p === item).length
                    if (remainingStock > 0 && item.price <= this.money) {
                        this.money -= item.price
                        item.onPurchase()
                        this.purchases.push(item)
                        buySound.play()
                    }
                }
                if (ACTIONS.cancel.pressed) {
                    this.inUpgradeMenu = false
                    this.menuCursorIndex = 0
                }
            } else {
                let menuItemCount = 4 // Buy, Sell, Repair, Exit
                if (ACTIONS.up.pressed) {
                    this.menuCursorIndex = (this.menuCursorIndex - 1 + menuItemCount) % menuItemCount
                    moveCursorSound.play()
                }
                if (ACTIONS.down.pressed) {
                    this.menuCursorIndex = (this.menuCursorIndex + 1) % menuItemCount
                    moveCursorSound.play()
                }
                if (ACTIONS.interact.pressed) {
                    ACTIONS.interact.eat()
                    
                    if (this.menuCursorIndex === 0) {
                        this.inUpgradeMenu = true
                        this.upgradeCursorIndex = 0
                    } else if (this.menuCursorIndex === 1) {
                        if (sub.inventory.length > 0) {
                            for (const oreType of sub.inventory) {
                                const price = ORE_SELL_PRICES[oreType]
                                this.money += price
                            }
                            sub.inventory.length = 0
                            buySound.play()
                        }
                    } else if (this.menuCursorIndex === 2) {
                        if (sub.health < sub.maxHealth && this.money >= REPAIR_COST) {
                            this.money -= REPAIR_COST
                            sub.health++
                            buySound.play()
                        }
                    } else if (this.menuCursorIndex === 3) {
                        sub.state = 'play'
                    }
                }
                if (ACTIONS.cancel.pressed) {
                    sub.state = 'play'
                }
            }
        }
    }

    override render(ctx: CanvasRenderingContext2D): void {
        ctx.font = '16px Arbutus'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        ctx.textRendering = 'optimizeSpeed'

        if (sub.state !== 'shop') {
            if (sub.state === 'play' && distance(0, 0, sub.x, sub.y) < SHOP_OPEN_DISTANCE) {
                ctx.fillStyle = '#FFF'
                ctx.fillText('Press E or Spacebar to open shop', 0, GAME_HEIGHT - 32)
            }
            return
        }

        const menuWidth = 512
        const menuHeight = 32 * (SHOP_ITEMS.length + 5)
        const menuX = PLAY_AREA_WIDTH / 2 - menuWidth / 2
        const menuY = PLAY_AREA_HEIGHT / 2 - menuHeight / 2

        ctx.fillStyle = '#000'
        ctx.globalAlpha = 0.8
        ctx.fillRect(menuX, menuY, menuWidth, menuHeight)
        ctx.globalAlpha = 1

        let rowY = menuY + 8

        ctx.fillStyle = '#FFF'
        ctx.fillText('Shop', menuX + 8, rowY)
        rowY += 32
        ctx.fillText(`Money: $${this.money}`, menuX + 8, rowY)
        rowY += 32
        ctx.fillText('Buy Upgrades', menuX + 32, rowY)
        rowY += 32
        const totalSellPrice = sub.inventory.reduce((total, oreType) => total + ORE_SELL_PRICES[oreType], 0)
        if (totalSellPrice === 0) ctx.fillStyle = '#AAA'
        ctx.fillText(`Sell Cargo (+$${totalSellPrice})`, menuX + 32, rowY)
        rowY += 32
        ctx.fillStyle = '#FFF'
        if (sub.health >= sub.maxHealth) ctx.fillStyle = '#AAA'
        ctx.fillText('Repair Hull ($5)', menuX + 32, rowY)
        rowY += 32
        ctx.fillStyle = '#FFF'
        ctx.fillText('Exit', menuX + 32, rowY)
        rowY += 32
        
        if (!this.inUpgradeMenu) {
            ctx.fillText('>', menuX + 8, menuY + 72 + this.menuCursorIndex * 32)
        }

        ctx.fillStyle = '#FFF'
        ctx.font = '12px Arbutus'
        for (let i = 0; i < SHOP_ITEMS.length; i++) {
            const item = SHOP_ITEMS[i]
            const purchasedStock = this.purchases.filter(p => p === item).length
            const remainingStock = item.stock - purchasedStock

            const x = menuX + 256 + (i % UPGRADES_PER_ROW) * 64
            const y = menuY + 64 + Math.floor(i / UPGRADES_PER_ROW) * 72
            
            upgradesSprite.draw(ctx, x, y, item.frame)
            
            if (remainingStock === 0) ctx.fillStyle = '#AAA'

            ctx.textAlign = 'center'
            ctx.fillText(`$${item.price}`, x, y + 28)
            ctx.textAlign = 'right'
            ctx.fillText(`${remainingStock}/${item.stock}`, x + 24, y - 24)
            
            ctx.fillStyle = '#FFF'

            if (this.inUpgradeMenu && this.upgradeCursorIndex === i) {
                ctx.textAlign = 'center'
                ctx.fillText('>', x - 28, y - 4)
                ctx.fillText('<', x + 28, y - 4)
            }
        }

        ctx.font = '16px Arbutus'
        ctx.textAlign = 'left'

        if (this.inUpgradeMenu) {
            const item = SHOP_ITEMS[this.upgradeCursorIndex]
            ctx.fillText(item.name, menuX + 224, menuY + 192)
        }
        
        ctx.fillStyle = '#CCC'
        ctx.fillText('E or Spacebar: Select', menuX + 8, menuY + menuHeight - 64)
        ctx.fillText('Escape: Exit', menuX + 8, menuY + menuHeight - 32)
    }

}

export const shop = new Shop()
