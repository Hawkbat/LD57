export declare function getVolume(): number;
export declare function setVolume(value: number): void;
export declare class SoundAsset {
    buffer: AudioBuffer | null;
    loaded: boolean;
    constructor(url: string);
    play(volume?: number, loop?: boolean): () => void;
}
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
