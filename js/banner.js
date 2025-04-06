import { Entity } from "./entity.js";
export class Banner extends Entity {
    reset() {
    }
    update(dt) {
    }
    render(ctx) {
        ctx.fillStyle = "#FFF";
        ctx.font = "20px Arial";
        ctx.fillText("Welcome to the Game!", 10, 30);
    }
}
export const banner = new Banner();
//# sourceMappingURL=banner.js.map