// Scene "thirty": one bottle, thirty capsules, thirty mornings (references/scenes.md §8, built on the stage).
//
// Markup:
//   <section class="scene thirty" data-scene="thirty" data-options='{"hold": 2}'>
//     <div class="scene-stage"> … .thirty__bottle … <ol class="days"> 30 × <li class="day"> with
//       .day__fill and .day__pill </ol> … <span data-count> … </div>
//   </section>
// As the stage is held, each capsule leaves the bottle's mouth and lands in its day, the day turns green,
// and the count follows. On a phone there is no bottle: the capsules drop in from above the month.
// The finished composition is the full month.
(() => {
  window.Scenes = window.Scenes || {};

  const START = 0.06;   // the first capsule leaves here
  const STEP = 0.028;   // one morning of scroll
  const FLIGHT = 0.07;  // how long one capsule is in the air

  const build = (tl, { root, q, phone }) => {
    const pills = q('.day__pill');
    const fills = q('.day__fill');
    const bottle = root.querySelector('.thirty__bottle');
    const count = root.querySelector('[data-count]');

    // where a capsule starts, relative to where it lands; measured on boxes the scene never transforms
    const wrap = root.querySelector('.thirty__bottle-wrap');
    const origin = (pill) => {
      const to = pill.parentElement.getBoundingClientRect();
      const tx = to.left + to.width / 2;
      const ty = to.top + to.height / 2;
      if (!phone && wrap && wrap.offsetWidth) {
        const b = wrap.getBoundingClientRect();
        return { x: b.left + b.width / 2 - tx, y: b.top + b.height * 0.1 - ty };
      }
      const grid = root.querySelector('.days').getBoundingClientRect();
      return { x: grid.left + grid.width / 2 - tx, y: grid.top - 200 - ty };
    };

    if (bottle && !phone) {
      tl.fromTo(bottle, { rotation: 0 }, { rotation: -16, duration: 0.08, ease: 'power2.out' }, 0)
        .to(bottle, { rotation: 0, duration: 0.08, ease: 'power2.inOut' }, START + STEP * 29 + FLIGHT * 0.5);
    }

    pills.forEach((pill, i) => {
      const at = START + i * STEP;
      tl.fromTo(pill,
        { x: () => origin(pill).x, y: () => origin(pill).y, rotation: i % 2 ? 140 : -120, scale: 0.55, autoAlpha: 0 },
        { x: 0, y: 0, rotation: 0, scale: 1, autoAlpha: 1, duration: FLIGHT, ease: 'power3.out', immediateRender: true },
        at);
      tl.fromTo(fills[i], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.02, ease: 'none', immediateRender: true }, at + FLIGHT * 0.7);
    });

    let shown = -1;
    tl.eventCallback('onUpdate', () => {
      const t = tl.time();
      const n = Math.max(0, Math.min(30, Math.floor((t - START - FLIGHT * 0.7) / STEP) + 1));
      if (n !== shown) { shown = n; count.textContent = n; }
    });
  };

  window.Scenes.thirty = (root, opts = {}) => window.Stage.scene(root, {
    hold: opts.hold ?? 2,
    scrub: opts.scrub ?? true,
    phone: { hold: 1, build },
    build,
    rest: ({ root: r }) => { const c = r.querySelector('[data-count]'); if (c) c.textContent = '30'; },
  });
})();
