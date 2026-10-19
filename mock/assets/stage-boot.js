// Starts the 3D stage and tells main.js when it, and the product stills, are ready.
import { createStage } from './stage3d.js';

const host = document.querySelector('[data-three]');
const motion = document.documentElement.classList.contains('motion');

(async () => {
  try {
    const stage = host && (await createStage(host, { motion }));
    if (!stage) throw new Error('WebGL unavailable');
    window.dispatchEvent(new CustomEvent('mq:stage-ready', { detail: { stage } }));
    const later = window.requestIdleCallback || ((f) => setTimeout(f, 700));
    later(async () => {
      const shots = await stage.stills(['slim', 'yodetox', 'combo', 'label']);
      window.dispatchEvent(new CustomEvent('mq:stills', { detail: shots }));
    });
  } catch (e) {
    window.dispatchEvent(new Event('mq:no-webgl'));
  }
})();
