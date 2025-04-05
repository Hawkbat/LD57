export declare class SpriteAsset {
    image: HTMLImageElement;
    loaded: boolean;
    tileWidth: number;
    tileHeight: number;
    width: number;
    height: number;
    constructor(url: string, tileWidth: number, tileHeight: number);
    draw(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, x: number, y: number, frame: number): void;
}
