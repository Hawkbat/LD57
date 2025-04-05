export class SpriteAsset {
    image;
    loaded = false;
    tileWidth;
    tileHeight;
    width = 0;
    height = 0;
    constructor(url, tileWidth, tileHeight) {
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.image = new Image();
        this.image.onload = () => {
            this.loaded = true;
            this.width = this.image.width;
            this.height = this.image.height;
        };
        this.image.src = url;
    }
    draw(ctx, x, y, frame) {
        if (this.loaded) {
            const cols = Math.floor(this.width / this.tileWidth);
            const rows = Math.floor(this.height / this.tileHeight);
            const col = frame % cols;
            const row = Math.floor(frame / cols) % rows;
            ctx.drawImage(this.image, col * this.tileWidth, row * this.tileHeight, this.tileWidth, this.tileHeight, x - this.tileWidth / 2, y - this.tileHeight / 2, this.tileWidth, this.tileHeight);
        }
    }
}
//# sourceMappingURL=assets.js.map