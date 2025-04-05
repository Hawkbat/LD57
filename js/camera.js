import { PLAY_AREA_HEIGHT, PLAY_AREA_WIDTH } from "./constants.js";
import { Entity } from "./entity.js";
export class Camera extends Entity {
    x = 0;
    y = 0;
    reset() {
        this.x = 0;
        this.y = 0;
    }
    update(dt) {
    }
    render(ctx) {
    }
    toWorld(x, y) {
        return [x + this.x - PLAY_AREA_WIDTH / 2, y + this.y - PLAY_AREA_HEIGHT / 2];
    }
    fromWorld(x, y) {
        return [Math.round(x - this.x + PLAY_AREA_WIDTH / 2), Math.round(y - this.y + PLAY_AREA_HEIGHT / 2)];
    }
}
export const camera = new Camera();
//# sourceMappingURL=camera.js.map