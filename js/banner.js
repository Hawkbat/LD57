import { PLAY_AREA_WIDTH } from "./constants.js";
import { Entity } from "./entity.js";
import { shop } from "./shop.js";
import { sub } from "./sub.js";
export class Banner extends Entity {
    get sortOrder() {
        return 120;
    }
    reset() {
    }
    update(dt) {
    }
    render(ctx) {
        ctx.font = '64px Arbutus';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.textRendering = 'optimizeSpeed';
        const bannerX = PLAY_AREA_WIDTH / 2;
        const bannerY = 96;
        let gameOver = false;
        if (sub.state === 'title') {
            ctx.fillStyle = '#FFF';
            ctx.fillText('Abyss Miner', bannerX, bannerY);
            gameOver = true;
        }
        else if (sub.state === 'drown') {
            ctx.fillStyle = '#0AF';
            ctx.fillText('You drowned!', bannerX, bannerY);
            ctx.fillStyle = '#FFF';
            gameOver = true;
        }
        else if (sub.state === 'explode') {
            ctx.fillStyle = '#FAA';
            ctx.fillText('You exploded!', bannerX, bannerY);
            ctx.fillStyle = '#FFF';
            gameOver = true;
        }
        else if (sub.state === 'victory') {
            ctx.fillStyle = '#FC0';
            ctx.fillText('You won!', bannerX, bannerY);
            ctx.fillStyle = '#FFF';
            gameOver = true;
        }
        if (gameOver) {
            ctx.font = '16px Arbutus';
            ctx.fillText(`Press E or Spacebar to ${sub.state === 'title' ? '' : 're'}start`, bannerX, bannerY + 80);
            if (sub.state !== 'title') {
                const summaryY = bannerY + 256;
                const seconds = Math.round(sub.playTime % 60 * 100) / 100;
                const minutes = Math.floor(sub.playTime / 60);
                ctx.fillText(`Play Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`, bannerX, summaryY);
                const totalMoney = shop.money + shop.purchases.map(p => p.price).reduce((a, b) => a + b, 0);
                ctx.fillText(`Money Acquired: ${totalMoney}`, bannerX, summaryY + 32);
            }
        }
    }
    renderLights(ctx) {
        // Dirty hack, technically gets colors wrong
        this.render(ctx);
    }
}
export const banner = new Banner();
//# sourceMappingURL=banner.js.map