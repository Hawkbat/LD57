import { SpriteAsset } from "./assets.js";
import { camera } from "./camera.js";
import { Entity, removeEntity } from "./entity.js";
import { distance, moveVectorTowards } from "./math.js";
import { sub } from "./sub.js";
import { OreType } from "./tilemap.js";
const PICKUP_RADIUS = 64; // pixels
const OXYGEN_REFILL_AMOUNT = 0.2; // 20% per pickup
const FUEL_REFILL_AMOUNT = 0.2; // 20% per pickup
const pickupSprite = new SpriteAsset('images/Tiles.png', 32, 32);
export class Pickup extends Entity {
    x = 0;
    y = 0;
    oreType = OreType.empty;
    pickingUp = false;
    pickupTime = 0;
    constructor(x, y, oreType) {
        super();
        this.x = x;
        this.y = y;
        this.oreType = oreType;
    }
    reset() {
        this.x = 0;
        this.y = 0;
        this.oreType = OreType.empty;
        this.pickingUp = false;
        this.pickupTime = 0;
    }
    update(dt) {
        if (!this.pickingUp) {
            const hasRoom = sub.inventory.length + sub.inventoryPickups.length < sub.inventorySize;
            if (hasRoom || this.oreType === OreType.fuel || this.oreType === OreType.oxygen) {
                const dist = distance(this.x, this.y, sub.x, sub.y);
                if (dist < PICKUP_RADIUS) {
                    this.pickingUp = true;
                    this.pickupTime = 0;
                    sub.inventoryPickups.push(this);
                }
            }
        }
        if (this.pickingUp) {
            [this.x, this.y] = moveVectorTowards(this.x, this.y, sub.x, sub.y, 100 * dt);
            this.pickupTime += dt;
            const dist = distance(this.x, this.y, sub.x, sub.y);
            if (this.pickupTime > 1 || dist < 8) {
                sub.inventoryPickups.splice(sub.inventoryPickups.indexOf(this), 1);
                if (this.oreType === OreType.fuel) {
                    sub.fuel += FUEL_REFILL_AMOUNT;
                    if (sub.fuel > sub.fuelTanks) {
                        sub.fuel = sub.fuelTanks;
                    }
                }
                else if (this.oreType === OreType.oxygen) {
                    sub.oxygen += OXYGEN_REFILL_AMOUNT;
                    if (sub.oxygen > sub.oxygenTanks) {
                        sub.oxygen = sub.oxygenTanks;
                    }
                }
                else {
                    sub.inventory.push(this.oreType);
                }
                removeEntity(this);
            }
        }
    }
    render(ctx) {
        const [pickupX, pickupY] = camera.fromWorld(this.x, this.y);
        const frame = 99 + this.oreType;
        pickupSprite.draw(ctx, pickupX, pickupY, frame);
    }
}
//# sourceMappingURL=pickup.js.map