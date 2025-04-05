import { SpriteAsset } from "./assets.js";
import { Entity } from "./entity.js";
import { sub } from "./sub.js";
import { camera } from "./camera.js";
const SPEED = 300;
const DRAG_FACTOR = 0.95;
const DETECTION_RADIUS = 128;
const LOSE_CHASE_RADIUS = 384;
const ANIM_FRAME_RATE = 0.1;
const ATTACK_RADIUS = 48;
const ATTACK_DAMAGE = 1;
const anglerSprite = new SpriteAsset('images/Anglerfish.png', 64, 64);
export class Angler extends Entity {
    x = 0;
    y = 0;
    dx = 0;
    dy = 0;
    facing = 1; // 1 = right, -1 = left
    alerted = false;
    animTime = 0;
    reset() {
        this.x = 0;
        this.y = 0;
        this.dx = 0;
        this.dy = 0;
        this.facing = 1;
        this.alerted = false;
        this.animTime = 0;
    }
    update(dt) {
        let dirX = 0;
        let dirY = 0;
        const distX = Math.abs(sub.x - this.x);
        const distY = Math.abs(sub.y - this.y);
        const dist = Math.sqrt(distX ** 2 + distY ** 2);
        if (this.alerted) {
            if (dist > LOSE_CHASE_RADIUS) {
                this.alerted = false;
            }
            else {
                dirX = Math.sign(sub.x - this.x);
                dirY = Math.sign(sub.y - this.y);
            }
            if (dist < ATTACK_RADIUS) {
                sub.hit(ATTACK_DAMAGE);
            }
        }
        else {
            if (dist < DETECTION_RADIUS) {
                this.alerted = true;
            }
        }
        if (dirX !== 0 || dirY !== 0) {
            if (distX > 5) {
                this.facing = Math.sign(dirX);
            }
            this.dx += Math.cos(Math.atan2(dirY, dirX)) * dt * SPEED;
            this.dy += Math.sin(Math.atan2(dirY, dirX)) * dt * SPEED;
        }
        this.dx *= DRAG_FACTOR;
        this.dy *= DRAG_FACTOR;
        this.x += this.dx * dt;
        this.y += this.dy * dt;
        this.animTime += dt;
    }
    render(ctx) {
        const [anglerX, anglerY] = camera.fromWorld(this.x, this.y);
        ctx.save();
        ctx.translate(anglerX, anglerY);
        ctx.scale(this.facing, 1);
        let frame = 0;
        if (this.alerted) {
            frame = 1 + Math.floor(this.animTime / ANIM_FRAME_RATE) % 4;
        }
        anglerSprite.draw(ctx, 0, 0, frame);
        ctx.restore();
    }
    renderLights(ctx) {
        const [anglerX, anglerY] = camera.fromWorld(this.x, this.y);
        ctx.save();
        ctx.translate(anglerX, anglerY);
        ctx.scale(this.facing, 1);
        ctx.fillStyle = '#FFA';
        ctx.beginPath();
        ctx.arc(26, -14, 32, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
//# sourceMappingURL=angler.js.map