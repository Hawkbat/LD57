
const audioContext = new AudioContext({ latencyHint: 'interactive' })
const mainVolume = audioContext.createGain()
mainVolume.connect(audioContext.destination)

export function getVolume() {
    return mainVolume.gain.value
}

export function setVolume(value: number) {
    mainVolume.gain.setValueAtTime(value, audioContext.currentTime)
}

export class SoundAsset {
    public url: string
    public buffer: AudioBuffer | null = null

    static promiseCache = new Map<string, Promise<AudioBuffer>>()

    constructor(url: string) {
        this.url = url
        if (SoundAsset.promiseCache.has(url)) {
            SoundAsset.promiseCache.get(url)?.then(buffer => {
                this.buffer = buffer
            })
            return
        }
        SoundAsset.promiseCache.set(url, fetch(url)
            .then(response => response.arrayBuffer())
            .then(data => audioContext.decodeAudioData(data))
            .then(buffer => {
                this.buffer = buffer
                return buffer
            }))
    }

    public play(volume = 1, loop = false): () => void {
        if (this.buffer) {
            const source = audioContext.createBufferSource()
            source.buffer = this.buffer
            source.loop = loop
            const gainNode = audioContext.createGain()
            gainNode.gain.value = volume
            gainNode.connect(mainVolume)
            source.connect(gainNode)
            source.start()
            return () => {
                source.stop()
                source.disconnect()
                gainNode.disconnect()
            }
        } else {
            let shouldStop = false
            let cleanupFunc: (() => void) | null = null
            SoundAsset.promiseCache.get(this.url)?.then(buffer => {
                this.buffer = buffer
                if (shouldStop) return
                cleanupFunc = this.play(volume, loop)
            })
            return () => {
                shouldStop = true
                if (cleanupFunc) {
                    cleanupFunc()
                }
            }
        }
    }
}

export class SpriteAsset {
    public url: string
    public image: HTMLImageElement | null = null
    public tileWidth: number
    public tileHeight: number
    public width: number = 0
    public height: number = 0

    static promiseCache = new Map<string, Promise<HTMLImageElement>>()

    constructor(url: string, tileWidth: number, tileHeight: number) {
        this.url = url
        this.tileWidth = tileWidth
        this.tileHeight = tileHeight
        if (SpriteAsset.promiseCache.has(url)) {
            SpriteAsset.promiseCache.get(url)?.then(image => {
                this.image = image
                this.width = image.width
                this.height = image.height
            })
            return
        }

        SpriteAsset.promiseCache.set(url, new Promise<HTMLImageElement>((resolve) => {
            const image = new Image()
            image.onload = () => {
                this.image = image
                this.width = image.width
                this.height = image.height
                resolve(image)
            }
            image.src = url
        }))
    }

    public draw(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, x: number, y: number, frame: number) {
        if (this.image) {
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
