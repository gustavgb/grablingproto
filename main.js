const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d')
document.body.appendChild(canvas);

const cW = 800, cH = 600;
const modifier = 1/60;

canvas.width = 800;
canvas.height = 600;

let currentModule;

const setModule = (nextModule) => {
  currentModule = nextModule();
};

let keys = {};
window.addEventListener('keydown', (e) => {
  keys[e.keyCode] = true;
}, false);
window.addEventListener('keyup', (e) => {
  delete keys[e.keyCode];
}, false);

window.addEventListener('mousedown', (e) => {
  if (currentModule) {
    const x = e.clientX;
    const y = e.clientY;
    currentModule.mouseDown(x, y);
  }
}, false);

window.addEventListener('mousemove', (e) => {
  if (currentModule) {
    const x = e.clientX;
    const y = e.clientY;
    currentModule.mouseMove(x, y);
  }
}, false);

const loop = () => {
  requestAnimationFrame(loop);
  
  if (currentModule) {
    currentModule.loop(keys);
  }
};

setModule(game);

window.onload = loop;

