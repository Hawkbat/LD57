import { Entity } from "./entity.js"

export class Banner extends Entity {

    reset(): void {
        
    }

    update(dt: number): void {

    }

    render(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = "#FFF"
        ctx.font = "20px Arial"
        ctx.fillText("Welcome to the Game!", 10, 30)
    }
}

export const banner = new Banner()