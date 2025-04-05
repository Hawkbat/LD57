export class SpriteAsset {
    image;
    loaded = false;
    tileWidth;
    tileHeight;
    constructor(url, tileWidth, tileHeight) {
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.image = new Image();
        this.image.onload = () => {
            this.loaded = true;
        };
        this.image.src = url;
    }
    draw(ctx, x, y, frame) {
        if (this.loaded) {
            const cols = Math.floor(this.image.width / this.tileWidth);
            const rows = Math.floor(this.image.height / this.tileHeight);
            const col = frame % cols;
            const row = Math.floor(frame / cols) % rows;
            ctx.drawImage(this.image, col * this.tileWidth, row * this.tileHeight, this.tileWidth, this.tileHeight, x - this.tileWidth / 2, y - this.tileHeight / 2, this.tileWidth, this.tileHeight);
        }
    }
}
//# sourceMappingURL=assets.js.map