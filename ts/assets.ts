
export class SpriteAsset {
    public image: HTMLImageElement
    public loaded: boolean = false
    public tileWidth: number
    public tileHeight: number
    public width: number = 0
    public height: number = 0

    constructor(url: string, tileWidth: number, tileHeight: number) {
        this.tileWidth = tileWidth
        this.tileHeight = tileHeight
        this.image = new Image()
        this.image.onload = () => {
            this.loaded = true
            this.width = this.image.width
            this.height = this.image.height
        }
        this.image.src = url
    }

    public draw(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, x: number, y: number, frame: number) {
        if (this.loaded) {
            const cols = Math.floor(this.width / this.tileWidth)
            const rows = Math.floor(this.height / this.tileHeight)
            const col = frame % cols
            const row = Math.floor(frame / cols) % rows
            ctx.drawImage(
                this.image,
                col * this.tileWidth,
                row * this.tileHeight,
                this.tileWidth,
                this.tileHeight,
                x - this.tileWidth / 2,
                y - this.tileHeight / 2,
                this.tileWidth,
                this.tileHeight
            )
        }
    }
}
