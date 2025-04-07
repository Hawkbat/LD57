export declare function getVolume(): number;
export declare function setVolume(value: number): void;
export declare class SoundAsset {
    url: string;
    buffer: AudioBuffer | null;
    static promiseCache: Map<string, Promise<AudioBuffer>>;
    constructor(url: string);
    play(volume?: number, loop?: boolean): () => void;
}
export declare class SpriteAsset {
    url: string;
    image: HTMLImageElement | null;
    tileWidth: number;
    tileHeight: number;
    width: number;
    height: number;
    static promiseCache: Map<string, Promise<HTMLImageElement>>;
    constructor(url: string, tileWidth: number, tileHeight: number);
    draw(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, x: number, y: number, frame: number): void;
}
