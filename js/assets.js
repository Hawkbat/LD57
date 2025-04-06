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
    buffer = null;
    loaded = false;
    constructor(url) {
        fetch(url)
            .then(response => response.arrayBuffer())
            .then(data => audioContext.decodeAudioData(data))
            .then(buffer => {
            this.buffer = buffer;
            this.loaded = true;
        })
            .catch(error => console.error('Error loading sound:', error));
    }
    play(volume = 1, loop = false) {
        if (this.loaded && this.buffer) {
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
        return () => { }; // No-op function if not loaded
    }
}
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