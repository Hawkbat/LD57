import { SoundAsset, SpriteAsset } from "./assets.js";
import { camera } from "./camera.js";
import { PLAY_AREA_HEIGHT, PLAY_AREA_WIDTH } from "./constants.js";
import { getEntitiesOfType, removeEntity } from "./entity.js";
import { distance } from "./math.js";
import { Monster } from "./monster.js";
import { sub } from "./sub.js";
import { tileMap } from "./tilemap.js";
const COLLISION_RADIUS = 48; // pixels
const EXPLOSION_TIME = 1; // seconds
const EXPLOSION_RADIUS = 96; // pixels
const EXPLOSION_DAMAGE = 1;
const UNTETHER_FLOAT_SPEED = 32;
const SPRITE_WIDTH = 64;
const SPRITE_HEIGHT = 64;
const mineSprite = new SpriteAsset('images/Mine.png', SPRITE_WIDTH, SPRITE_HEIGHT);
const explosionSprite = new SpriteAsset('images/Explosion.png', 64, 64);
const explosionSound = new SoundAsset('sounds/explosion.wav');
export class Mine extends Monster {
    exploded = false;
    explosionTime = 0;
    untethered = false;
    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
    }
    reset() {
        this.x = 0;
        this.y = 0;
        this.exploded = false;
        this.explosionTime = 0;
        this.untethered = false;
    }
    update(dt) {
        if (!this.exploded) {
            if (this.untethered) {
                this.y -= UNTETHER_FLOAT_SPEED * dt;
                const [fillX, fillY] = tileMap.worldToFillCoords(this.x, this.y);
                if (tileMap.getFilled(fillX, fillY) || this.y < 0) {
                    this.explode();
                }
            }
            else {
                const [belowX, belowY] = tileMap.worldToFillCoords(this.x, this.y + 64);
                if (!tileMap.getFilled(belowX, belowY)) {
                    this.untethered = true;
                }
            }
            const dist = distance(this.x, this.y, sub.x, sub.y);
            if (dist < COLLISION_RADIUS) {
                this.explode();
            }
            for (const monster of getEntitiesOfType(Monster)) {
                if (monster === this)
                    continue;
                const dist = distance(this.x, this.y, monster.x, monster.y);
                if (dist < COLLISION_RADIUS) {
                    this.explode();
                }
            }
        }
        else {
            this.explosionTime += dt;
            if (this.explosionTime > EXPLOSION_TIME) {
                removeEntity(this);
            }
        }
    }
    render(ctx) {
        const [mineX, mineY] = camera.fromWorld(this.x, this.y);
        if (this.exploded) {
            const frame = Math.floor(this.explosionTime / EXPLOSION_TIME * 8);
            explosionSprite.draw(ctx, mineX, mineY, frame);
        }
        else {
            if (mineX < -SPRITE_WIDTH * 0.5 || mineX > PLAY_AREA_WIDTH + SPRITE_WIDTH * 0.5 || mineY < -SPRITE_WIDTH * 0.5 || mineY > PLAY_AREA_HEIGHT + SPRITE_WIDTH * 0.5) {
                return;
            }
            mineSprite.draw(ctx, mineX, mineY, 0);
        }
    }
    renderLights(ctx) {
        if (this.exploded) {
            const [mineX, mineY] = camera.fromWorld(this.x, this.y);
            const brightness = 0xF - Math.floor(this.explosionTime / EXPLOSION_TIME * 0xF);
            const l = brightness.toString(16);
            ctx.fillStyle = `#${l}${l}${l}`;
            ctx.beginPath();
            ctx.arc(mineX, mineY, EXPLOSION_RADIUS, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    hit(damage) {
        if (!this.exploded) {
            this.explode();
        }
    }
    explode() {
        if (this.exploded)
            return;
        this.exploded = true;
        this.explosionTime = 0;
        const dist = distance(this.x, this.y, sub.x, sub.y);
        const volume = Math.max(0, 1 - dist / 512);
        if (volume > 0)
            explosionSound.play(volume);
        if (dist < EXPLOSION_RADIUS) {
            sub.hit(EXPLOSION_DAMAGE);
        }
        for (const monster of getEntitiesOfType(Monster)) {
            if (monster === this)
                continue;
            const dist = distance(this.x, this.y, monster.x, monster.y);
            if (dist < EXPLOSION_RADIUS) {
                monster.hit(EXPLOSION_DAMAGE);
            }
        }
    }
}
//# sourceMappingURL=mine.js.map