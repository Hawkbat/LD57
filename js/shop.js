import { GAME_HEIGHT, PLAY_AREA_HEIGHT, PLAY_AREA_WIDTH } from "./constants.js";
import { Entity } from "./entity.js";
import { ACTIONS } from "./input.js";
import { distance } from "./math.js";
import { sub } from "./sub.js";
import { OreType } from "./tilemap.js";
const SHOP_OPEN_DISTANCE = 64; // pixels
const ORE_SELL_PRICES = {
    [OreType.empty]: 0,
    [OreType.fuel]: 0,
    [OreType.oxygen]: 0,
    [OreType.bronze]: 5,
    [OreType.silver]: 20,
    [OreType.gold]: 50,
    [OreType.diamond]: 100,
};
const SHOP_ITEMS = [
    { name: "Extra Oxygen Tank", price: 50, onPurchase: () => sub.oxygenTanks++, stock: 1 },
    { name: "Extra Fuel Tank", price: 30, onPurchase: () => sub.fuelTanks++, stock: 1 },
    { name: "Expand Cargo (+4)", price: 40, onPurchase: () => sub.inventorySize += 4, stock: 2 },
    { name: "Improve Drill Speed (+20%)", price: 25, onPurchase: () => sub.miningSpeed += 0.2, stock: 5 },
    { name: "Pay Quota", price: 1000, onPurchase: () => { }, stock: 1 },
];
export class Shop extends Entity {
    cursorIndex = 0;
    purchases = [];
    money = 0;
    reset() {
        this.cursorIndex = 0;
        this.purchases = [];
        this.money = 0;
    }
    update(dt) {
        if (sub.menu !== 'shop' && ACTIONS.interact.pressed) {
            const dist = distance(0, 0, sub.x, sub.y);
            if (dist < SHOP_OPEN_DISTANCE) {
                sub.menu = 'shop';
                this.cursorIndex = 0;
            }
        }
        else if (sub.menu === 'shop') {
            let menuItemCount = 0;
            menuItemCount++; // Sell
            menuItemCount += SHOP_ITEMS.length;
            menuItemCount++; // Exit
            if (ACTIONS.up.pressed) {
                this.cursorIndex = (this.cursorIndex - 1 + menuItemCount) % menuItemCount;
            }
            if (ACTIONS.down.pressed) {
                this.cursorIndex = (this.cursorIndex + 1) % menuItemCount;
            }
            if (ACTIONS.interact.pressed) {
                if (this.cursorIndex === 0) {
                    for (const oreType of sub.inventory) {
                        const price = ORE_SELL_PRICES[oreType];
                        this.money += price;
                    }
                    sub.inventory.length = 0;
                }
                else if (this.cursorIndex === menuItemCount - 1) {
                    sub.menu = 'none';
                }
                else {
                    const item = SHOP_ITEMS[this.cursorIndex - 1];
                    const remainingStock = item.stock - this.purchases.filter(p => p === item).length;
                    if (remainingStock && item.price <= this.money) {
                        this.money -= item.price;
                        item.onPurchase();
                        this.purchases.push(item);
                    }
                }
            }
            if (ACTIONS.cancel.pressed) {
                sub.menu = 'none';
            }
        }
    }
    render(ctx) {
        ctx.font = '16px Arbutus';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.textRendering = 'optimizeSpeed';
        if (sub.menu !== 'shop') {
            if (distance(0, 0, sub.x, sub.y) < SHOP_OPEN_DISTANCE) {
                ctx.fillStyle = '#FFF';
                ctx.fillText('Press E or Spacebar to open shop', 0, GAME_HEIGHT - 32);
            }
            return;
        }
        const menuWidth = 512;
        const menuHeight = 32 * (SHOP_ITEMS.length + 5);
        const menuX = PLAY_AREA_WIDTH / 2 - menuWidth / 2;
        const menuY = PLAY_AREA_HEIGHT / 2 - menuHeight / 2;
        ctx.fillStyle = '#000';
        ctx.globalAlpha = 0.8;
        ctx.fillRect(menuX, menuY, menuWidth, menuHeight);
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#FFF';
        ctx.fillText('Shop', menuX + 8, menuY + 8);
        ctx.fillText(`Money: $${this.money}`, menuX + 8, menuY + 32);
        const totalSellPrice = sub.inventory.reduce((total, oreType) => total + ORE_SELL_PRICES[oreType], 0);
        ctx.fillText(`Sell Cargo ($${totalSellPrice})`, menuX + 32, menuY + 64);
        for (let i = 0; i < SHOP_ITEMS.length; i++) {
            const item = SHOP_ITEMS[i];
            const y = menuY + 96 + i * 32;
            const purchasedStock = this.purchases.filter(p => p === item).length;
            const remainingStock = item.stock - purchasedStock;
            if (remainingStock === 0) {
                ctx.fillStyle = '#F00';
            }
            ctx.fillText(`${item.name} - $${item.price} (${remainingStock}/${item.stock})`, menuX + 32, y);
            ctx.fillStyle = '#FFF';
        }
        ctx.fillText('Exit', menuX + 32, menuY + 96 + SHOP_ITEMS.length * 32);
        ctx.fillText('>', menuX + 8, menuY + 64 + this.cursorIndex * 32);
        ctx.fillStyle = '#CCC';
        ctx.fillText('Press E or Spacebar to buy', menuX + 8, menuY + menuHeight - 32);
    }
}
export const shop = new Shop();
//# sourceMappingURL=shop.js.map