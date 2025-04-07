import { SpriteAsset } from "./assets.js";
import { camera } from "./camera.js";
import { PLAY_AREA_WIDTH, PLAY_AREA_HEIGHT } from "./constants.js";
import { removeEntity } from "./entity.js";
import { distance } from "./math.js";
import { Monster } from "./monster.js";
import { sub } from "./sub.js";
import { tileMap } from "./tilemap.js";
const MOVE_SPEED = 100;
const COLLISION_RADIUS = 32; // pixels
const COLLISION_DAMAGE = 1;
const SPRITE_WIDTH = 64;
const SPRITE_HEIGHT = 64;
const squidSprite = new SpriteAsset('images/SquidMonster.png', SPRITE_WIDTH, SPRITE_HEIGHT);
export class Squid extends Monster {
    facing = Math.random() > 0.5 ? 1 : -1;
    animTime = 0;
    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
    }
    reset() {
        this.x = 0;
        this.y = 0;
        this.facing = Math.random() > 0.5 ? 1 : -1;
        this.animTime = 0;
    }
    update(dt) {
        const prevX = this.x;
        const dx = this.facing * MOVE_SPEED * dt;
        this.x += dx;
        const [fillX, fillY] = tileMap.worldToFillCoords(this.x, this.y);
        if (tileMap.getFilled(fillX, fillY)) {
            this.facing *= -1;
            this.x = prevX;
        }
        if (distance(this.x, this.y, sub.x, sub.y) < COLLISION_RADIUS) {
            sub.hit(COLLISION_DAMAGE);
        }
        this.animTime += dt;
    }
    render(ctx) {
        const [squidX, squidY] = camera.fromWorld(this.x, this.y);
        if (squidX < -SPRITE_WIDTH * 0.5 || squidX > PLAY_AREA_WIDTH + SPRITE_WIDTH * 0.5 || squidY < -SPRITE_HEIGHT * 0.5 || squidY > PLAY_AREA_HEIGHT + SPRITE_HEIGHT * 0.5) {
            return;
        }
        const frame = Math.floor(this.animTime * 5) % 4;
        ctx.save();
        ctx.translate(squidX, squidY);
        ctx.scale(this.facing, 1);
        squidSprite.draw(ctx, 0, 0, frame);
        ctx.restore();
    }
    renderLights(ctx) {
        const [anglerX, anglerY] = camera.fromWorld(this.x, this.y);
        ctx.save();
        ctx.translate(anglerX, anglerY);
        ctx.scale(this.facing, 1);
        ctx.fillStyle = '#FFA';
        ctx.beginPath();
        ctx.arc(16, 0, 32, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    hit(damage) {
        removeEntity(this);
    }
}
//# sourceMappingURL=squid.js.map