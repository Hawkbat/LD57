import { SpriteAsset } from "./assets.js";
import { camera } from "./camera.js";
import { OreType } from "./constants.js";
import { Entity } from "./entity.js";
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
    }
    render(ctx) {
        const [pickupX, pickupY] = camera.fromWorld(this.x, this.y);
        const frame = 99 + this.oreType;
        pickupSprite.draw(ctx, pickupX, pickupY, frame);
    }
}
//# sourceMappingURL=pickup.js.map