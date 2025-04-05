import { SpriteAsset } from "./assets.js";
import { camera } from "./camera.js";
import { Entity } from "./entity.js";
const boatSprite = new SpriteAsset('images/Boat.png', 128, 128);
export class Boat extends Entity {
    reset() {
    }
    update(dt) {
    }
    render(ctx) {
        const [boatX, boatY] = camera.fromWorld(0, -48);
        boatSprite.draw(ctx, boatX, boatY, 0);
    }
}
export const boat = new Boat();
//# sourceMappingURL=boat.js.map