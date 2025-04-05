import { camera } from "./camera.js";
import { PLAY_AREA_HEIGHT, PLAY_AREA_WIDTH } from "./constants.js";
import { Entity } from "./entity.js";
const LIGHT_FALLOFF_DISTANCE = 256;
export class Background extends Entity {
    reset() {
    }
    update(dt) {
    }
    render(ctx) {
        ctx.fillStyle = "#246";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        const [, bgY] = camera.fromWorld(0, 0);
        if (bgY > 0) {
            ctx.fillStyle = "#7CF";
            ctx.fillRect(0, 0, ctx.canvas.width, bgY);
        }
    }
    renderLights(ctx) {
        const baseBrightness = 0xF - Math.min(0xF, Math.floor(camera.y / LIGHT_FALLOFF_DISTANCE));
        const l = baseBrightness.toString(16);
        ctx.fillStyle = `#${l}${l}${l}`;
        ctx.fillRect(0, 0, PLAY_AREA_WIDTH, PLAY_AREA_HEIGHT);
    }
}
export const background = new Background();
//# sourceMappingURL=background.js.map