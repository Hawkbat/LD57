import { SpriteAsset } from "./assets.js"
import { camera } from "./camera.js"
import { OreType } from "./constants.js"
import { Entity } from "./entity.js"

const pickupSprite = new SpriteAsset('images/Tiles.png', 32, 32)

export class Pickup extends Entity {
    public x: number = 0
    public y: number = 0
    public oreType: OreType = OreType.empty
    public pickingUp: boolean = false
    public pickupTime: number = 0

    constructor(x: number, y: number, oreType: OreType) {
        super()
        this.x = x
        this.y = y
        this.oreType = oreType
    }

    reset(): void {
        this.x = 0
        this.y = 0
        this.oreType = OreType.empty
        this.pickingUp = false
        this.pickupTime = 0
    }

    update(dt: number): void {

    }

    render(ctx: CanvasRenderingContext2D): void {
        const [pickupX, pickupY] = camera.fromWorld(this.x, this.y)
        const frame = 99 + this.oreType
        pickupSprite.draw(ctx, pickupX, pickupY, frame)
    }

}
