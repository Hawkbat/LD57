import { GAME_WIDTH, GAME_HEIGHT } from "./constants.js";
import { updateEntities, renderEntities, renderEntityLights } from "./entity.js";
import { updateActions } from "./input.js";
const FPS_SAMPLE_COUNT = 120;
const fpsValues = [];
export function getAverageFPS() {
    return fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length;
}
export function runEngine() {
    try {
        const mainCanvas = document.createElement('canvas');
        mainCanvas.width = GAME_WIDTH;
        mainCanvas.height = GAME_HEIGHT;
        const mainCtx = mainCanvas.getContext('2d');
        const lightCanvas = new OffscreenCanvas(GAME_WIDTH, GAME_HEIGHT);
        const lightCtx = lightCanvas.getContext('2d');
        if (!mainCtx || !lightCtx) {
            document.body.innerHTML = 'Canvas not supported; game cannot run.';
            return;
        }
        document.body.appendChild(mainCanvas);
        mainCtx.imageSmoothingEnabled = false;
        const update = (dt) => {
            updateEntities(dt);
            updateActions();
        };
        const render = () => {
            const scale = Math.max(1, Math.floor(Math.min(window.innerWidth / GAME_WIDTH, window.innerHeight / GAME_HEIGHT)));
            mainCanvas.style.width = `${GAME_WIDTH * scale}px`;
            mainCanvas.style.height = `${GAME_HEIGHT * scale}px`;
            renderEntities(mainCtx);
            lightCtx.globalCompositeOperation = 'source-over';
            lightCtx.fillStyle = '#000';
            lightCtx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
            lightCtx.globalCompositeOperation = 'lighter';
            renderEntityLights(lightCtx);
            mainCtx.globalCompositeOperation = 'multiply';
            mainCtx.drawImage(lightCanvas, 0, 0);
            mainCtx.globalCompositeOperation = 'source-over';
        };
        let lastTime = -1;
        const tick = (time) => {
            if (lastTime === -1)
                lastTime = time;
            const deltaTime = Math.min((time - lastTime) / 1000, 0.5);
            lastTime = time;
            const fps = 1 / deltaTime;
            fpsValues.push(fps);
            if (fpsValues.length > FPS_SAMPLE_COUNT) {
                fpsValues.shift();
            }
            update(deltaTime);
            render();
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }
    catch (err) {
        console.error(err);
        document.body.innerHTML = `An error occurred; game cannot run.\n\n${err}`;
        return;
    }
}
//# sourceMappingURL=engine.js.map