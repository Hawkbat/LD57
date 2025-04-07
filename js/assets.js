const audioContext = new AudioContext({ latencyHint: 'interactive' });
const mainVolume = audioContext.createGain();
mainVolume.connect(audioContext.destination);
export function getVolume() {
    return mainVolume.gain.value;
}
export function setVolume(value) {
    mainVolume.gain.setValueAtTime(value, audioContext.currentTime);
}
export class SoundAsset {
    url;
    buffer = null;
    static promiseCache = new Map();
    constructor(url) {
        this.url = url;
        if (SoundAsset.promiseCache.has(url)) {
            SoundAsset.promiseCache.get(url)?.then(buffer => {
                this.buffer = buffer;
            });
            return;
        }
        SoundAsset.promiseCache.set(url, fetch(url)
            .then(response => response.arrayBuffer())
            .then(data => audioContext.decodeAudioData(data))
            .then(buffer => {
            this.buffer = buffer;
            return buffer;
        }));
    }
    play(volume = 1, loop = false) {
        if (this.buffer) {
            const source = audioContext.createBufferSource();
            source.buffer = this.buffer;
            source.loop = loop;
            const gainNode = audioContext.createGain();
            gainNode.gain.value = volume;
            gainNode.connect(mainVolume);
            source.connect(gainNode);
            source.start();
            return () => {
                source.stop();
                source.disconnect();
                gainNode.disconnect();
            };
        }
        else {
            let shouldStop = false;
            let cleanupFunc = null;
            SoundAsset.promiseCache.get(this.url)?.then(buffer => {
                this.buffer = buffer;
                if (shouldStop)
                    return;
                cleanupFunc = this.play(volume, loop);
            });
            return () => {
                shouldStop = true;
                if (cleanupFunc) {
                    cleanupFunc();
                }
            };
        }
    }
}
export class SpriteAsset {
    url;
    image = null;
    tileWidth;
    tileHeight;
    width = 0;
    height = 0;
    static promiseCache = new Map();
    constructor(url, tileWidth, tileHeight) {
        this.url = url;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        if (SpriteAsset.promiseCache.has(url)) {
            SpriteAsset.promiseCache.get(url)?.then(image => {
                this.image = image;
                this.width = image.width;
                this.height = image.height;
            });
            return;
        }
        SpriteAsset.promiseCache.set(url, new Promise((resolve) => {
            const image = new Image();
            image.onload = () => {
                this.image = image;
                this.width = image.width;
                this.height = image.height;
                resolve(image);
            };
            image.src = url;
        }));
    }
    draw(ctx, x, y, frame) {
        if (this.image) {
            const cols = Math.floor(this.width / this.tileWidth);
            const rows = Math.floor(this.height / this.tileHeight);
            const col = frame % cols;
            const row = Math.floor(frame / cols) % rows;
            ctx.drawImage(this.image, col * this.tileWidth, row * this.tileHeight, this.tileWidth, this.tileHeight, x - this.tileWidth / 2, y - this.tileHeight / 2, this.tileWidth, this.tileHeight);
        }
    }
}
//# sourceMappingURL=assets.js.map