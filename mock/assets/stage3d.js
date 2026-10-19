// Mayqueen product stage: the Slim and Yodetox bottles and thirty capsules, rendered with three.js.
// The bottles are a stand-in for product photography; the labels are drawn on a canvas.
//
//   const stage = await createStage(hostElement, { motion: true });
//   stage.set('hero' | 'ritual' | 'month' | 'slim' | 'yodetox' | 'combo' | 'label' | 'quiz:<id>' | 'off')
//   const stills = await stage.stills(['slim', 'yodetox', 'combo'])   // data URLs for phones and the cart
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const C = {
  paper: '#F7F7F0', ink: '#26332B', leaf: '#8DC63F', leafPale: '#D6EBB0', leafMid: '#B4D97A', leafDeep: '#2F5D3A',
  mint: '#9ED9C8', mintPale: '#CDEBE2', mintMid: '#4FB39C', mintDeep: '#1F5C57',
};
const FONT = '"Archivo", "Segoe UI", Arial, sans-serif';

// ---------- the label, drawn once per product ----------
function wrapText(ctx, text, x, y, width, lineHeight) {
  const words = text.split(' ');
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > width && line) { ctx.fillText(line, x, y); line = w; y += lineHeight; } else line = test;
  }
  if (line) ctx.fillText(line, x, y);
  return y + lineHeight;
}

function labelTexture(product, renderer) {
  const W = 4096, H = 1288;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  const slim = product === 'slim';
  const tones = slim ? [C.leafPale, C.leafMid, C.leaf, C.leafDeep] : [C.mintPale, C.mint, C.mintMid, C.mintDeep];
  const ink = slim ? C.leafDeep : C.mintDeep;
  const accent = slim ? C.leaf : C.mintMid;
  ctx.fillStyle = C.paper;
  ctx.fillRect(0, 0, W, H);

  // waves: whole periods across the width, so the seam at the side matches
  const band = (base, amp, k, phase, color) => {
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 8) ctx.lineTo(x, base + amp * Math.sin((x / W) * Math.PI * 2 * k + phase));
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  };
  band(H * 0.62, 40, 3, 0.4, tones[0]);
  band(H * 0.71, 36, 3, 1.3, tones[1]);
  band(H * 0.8, 30, 4, 2.2, tones[2]);
  band(H * 0.895, 22, 4, 3.0, tones[3]);

  // front panel, centred at a quarter of the width
  const fx = W * 0.25;
  ctx.textAlign = 'center';
  ctx.save();
  ctx.translate(fx, 150);
  ctx.beginPath();
  ctx.moveTo(0, -52); ctx.bezierCurveTo(-46, -14, -46, 34, 0, 60); ctx.bezierCurveTo(46, 34, 46, -14, 0, -52);
  ctx.fillStyle = accent; ctx.fill();
  ctx.restore();
  ctx.fillStyle = ink;
  ctx.font = `600 84px ${FONT}`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = '22px';
  ctx.fillText('MAYQUEEN', fx + 11, 318);
  if ('letterSpacing' in ctx) ctx.letterSpacing = '-6px';
  ctx.font = `650 ${slim ? 330 : 270}px ${FONT}`;
  ctx.fillText(slim ? 'Slim' : 'Yodetox', fx, 600);
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  ctx.font = `400 56px ${FONT}`;
  ctx.fillText('Thực phẩm bảo vệ sức khỏe', fx, 690);
  // the 30 badge
  ctx.beginPath(); ctx.arc(fx + 420, 380, 96, 0, Math.PI * 2); ctx.fillStyle = accent; ctx.fill();
  ctx.fillStyle = slim ? C.ink : C.paper;
  ctx.font = `650 80px ${FONT}`; ctx.fillText('30', fx + 420, 392);
  ctx.font = `500 32px ${FONT}`; ctx.fillText('viên nang', fx + 420, 436);

  // back panel, centred at three quarters of the width
  const bx = W * 0.75 - 520;
  ctx.textAlign = 'left';
  ctx.fillStyle = C.ink;
  ctx.font = `650 60px ${FONT}`;
  ctx.fillText('Thành phần trong mỗi viên', bx, 140);
  ctx.font = `400 44px ${FONT}`;
  const lines = slim
    ? ['Chiết xuất lá trà xanh', 'Chiết xuất vỏ quả bứa', 'Bột củ khoai nưa (glucomannan)', 'Phụ liệu: vỏ nang gelatin']
    : ['Chiết xuất thân rễ gừng', 'Chiết xuất rễ bồ công anh', 'Chiết xuất lá sen', 'Phụ liệu: vỏ nang gelatin'];
  lines.forEach((l, i) => ctx.fillText(l, bx, 214 + i * 60));
  ctx.font = `650 44px ${FONT}`;
  ctx.fillText('Cách dùng', bx, 494);
  ctx.font = `400 42px ${FONT}`;
  wrapText(ctx, slim ? '1 viên mỗi sáng, trước bữa ăn 30 phút, uống với nước ấm.' : '1 viên mỗi tối, sau bữa ăn, uống với nước ấm.', bx, 552, 1040, 54);
  ctx.font = `500 38px ${FONT}`;
  ctx.fillText('Số tiếp nhận công bố: đang cập nhật', bx, 690);
  ctx.font = `600 38px ${FONT}`;
  ctx.fillStyle = C.paper;
  wrapText(ctx, 'Thực phẩm này không phải là thuốc, không có tác dụng thay thế thuốc chữa bệnh.', bx, 1196, 1080, 46);

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return tex;
}

// ---------- one bottle ----------
function makeBottle(product, renderer) {
  const slim = product === 'slim';
  const group = new THREE.Group();
  const spin = new THREE.Group();
  group.add(spin);

  const p = (r, y) => new THREE.Vector2(r, y);
  const profile = [p(0, 0), p(0.46, 0), p(0.52, 0.02), p(0.545, 0.07), p(0.555, 0.15), p(0.56, 0.22), p(0.56, 1.62), p(0.55, 1.72),
    p(0.51, 1.81), p(0.44, 1.88), p(0.38, 1.92), p(0.35, 1.95), p(0.34, 1.98), p(0.34, 2.12), p(0.32, 2.145), p(0, 2.145)];
  const plastic = new THREE.MeshPhysicalMaterial({ color: '#F3F2EA', roughness: 0.32, clearcoat: 0.75, clearcoatRoughness: 0.18, sheen: 0.2 });
  const body = new THREE.Mesh(new THREE.LatheGeometry(profile, 128), plastic);
  body.castShadow = true;
  spin.add(body);

  const label = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5675, 0.5675, 1.12, 160, 1, true, Math.PI * 1.5, Math.PI * 2),
    new THREE.MeshPhysicalMaterial({ map: labelTexture(product, renderer), roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.3 }),
  );
  label.position.y = 0.88;
  spin.add(label);

  // the mouth shows when the cap is off
  const mouth = new THREE.Mesh(new THREE.CircleGeometry(0.29, 64), new THREE.MeshStandardMaterial({ color: '#1A241E', roughness: 0.9 }));
  mouth.rotation.x = -Math.PI / 2;
  mouth.position.y = 2.147;
  spin.add(mouth);

  // the cap: ridged side, flat top, a soft rim
  const capColor = slim ? C.leafDeep : C.mintDeep;
  const capMat = new THREE.MeshPhysicalMaterial({ color: capColor, roughness: 0.5, clearcoat: 0.25 });
  const side = new THREE.CylinderGeometry(0.39, 0.39, 0.36, 192, 1, true);
  const pos = side.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const a = Math.atan2(x, z);
    const c = Math.cos(a * 48);
    const k = 1 + 0.018 * c * c * Math.sign(c);
    pos.setX(i, x * k); pos.setZ(i, z * k);
  }
  side.computeVertexNormals();
  const cap = new THREE.Group();
  const capSide = new THREE.Mesh(side, capMat.clone());
  capSide.material.side = THREE.DoubleSide;
  const capInside = new THREE.Mesh(new THREE.CircleGeometry(0.385, 64), new THREE.MeshStandardMaterial({ color: '#1B2A20', roughness: 0.8 }));
  capInside.rotation.x = Math.PI / 2;
  capInside.position.y = 0.17;
  capSide.castShadow = true;
  const capTop = new THREE.Mesh(new THREE.CircleGeometry(0.385, 96), capMat);
  capTop.rotation.x = -Math.PI / 2;
  capTop.position.y = 0.18;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.373, 0.02, 12, 120), capMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.175;
  cap.add(capSide, capTop, rim, capInside);
  cap.position.y = 2.06;
  spin.add(cap);

  return { group, spin, cap, product };
}

// ---------- thirty capsules ----------
function makeCapsules(count) {
  const geo = new THREE.CapsuleGeometry(0.075, 0.17, 10, 28);
  const colors = [];
  const pos = geo.attributes.position;
  const a = new THREE.Color('#A9D66B'), b = new THREE.Color('#6FA84A'), s = new THREE.Color('#8DC63F');
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const c = Math.abs(y) < 0.008 ? s : y > 0 ? a : b;
    colors.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const mat = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.06 });
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.castShadow = true;
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const items = Array.from({ length: count }, (_, i) => ({
    x: 0, y: 2.1, z: 0, rx: 0, ry: 0, rz: 0, s: 0, w: 1,
    phase: Math.random() * Math.PI * 2, speed: 0.3 + Math.random() * 0.35, i,
  }));
  return { mesh, items };
}

// a loose cloud around the bottle, a few in front for depth
function floatSlots(n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const ang = t * Math.PI * 2 * 1.618 * 3;
    const r = 1.05 + (i % 5) * 0.2;
    out.push({ x: Math.cos(ang) * r, y: 0.25 + ((i * 7) % 11) / 11 * 2.5, z: Math.sin(ang) * r * 0.75 + 0.2, rx: ang, ry: ang * 0.5, rz: 0.6 + ang, s: i < 14 ? 1 : 0, w: 1 });
  }
  return out;
}
// a month: six across, five down, beside the bottle
function gridSlots(n, cx, cy) {
  return Array.from({ length: n }, (_, i) => ({ x: cx + ((i % 6) - 2.5) * 0.31, y: cy - (Math.floor(i / 6) - 2) * 0.36, z: 0.3, rx: 0.35, ry: 0, rz: -0.75, s: 1, w: 0 }));
}

// ---------- the stage ----------
export async function createStage(host, { motion = true } = {}) {
  const canvas = host.querySelector('canvas');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { return null; }
  if (document.fonts && document.fonts.load) {
    await Promise.all([document.fonts.load(`600 64px ${FONT}`), document.fonts.load(`400 34px ${FONT}`)]).catch(() => {});
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  const cam = { x: 0, y: 1.2, z: 7.2, tx: 0, ty: 1.05 };

  const key = new THREE.DirectionalLight('#ffffff', 1.5);
  key.position.set(2.5, 5, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -3; key.shadow.camera.right = 3; key.shadow.camera.top = 3; key.shadow.camera.bottom = -3;
  key.shadow.radius = 12;
  key.shadow.bias = -0.0005;
  scene.add(key);
  const rimLight = new THREE.DirectionalLight('#F4FFE6', 0.8);
  rimLight.position.set(-4, 3, -3);
  scene.add(rimLight);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({ opacity: 0.08 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const root = new THREE.Group();
  scene.add(root);
  const slim = makeBottle('slim', renderer);
  const detox = makeBottle('yodetox', renderer);
  root.add(slim.group, detox.group);
  const caps = makeCapsules(30);
  root.add(caps.mesh);

  // the state of everything that moves
  const S = {
    slim: { x: 0, y: 0, z: 0, s: 1, ry: 0, spin: 0.25, cap: 0, capTilt: 0, capX: 0 },
    detox: { x: 2.6, y: 0, z: -1, s: 0, ry: 0, spin: 0, cap: 0, capTilt: 0, capX: 0 },
    groundOpacity: 0.14,
  };
  let capsState = floatSlots(30);
  caps.items.forEach((it, i) => Object.assign(it, capsState[i]));

  const closed = { cap: 0, capTilt: 0, capX: 0 };
  const open = { cap: 0.9, capTilt: -0.1, capX: 0.72 };
  const PRESETS = {
    hero: { slim: { x: 0, y: 0, z: 0, s: 1, ry: -0.22, spin: 0.22, ...closed }, detox: { x: 2.6, s: 0, z: -1, ...closed }, caps: 'float', cam: { x: 0, y: 1.3, z: 7.4, tx: 0, ty: 1.15 } },
    ritual: { slim: { x: -0.25, y: 0, z: 0, s: 1, ry: 0.15, spin: 0, ...open }, detox: { s: 0, x: 2.6 }, caps: 'one', cam: { x: 0, y: 1.65, z: 7.2, tx: 0, ty: 1.45 } },
    month: { slim: { x: -1.3, y: 0, z: -0.2, s: 0.74, ry: 0.35, spin: 0, ...closed }, detox: { s: 0, x: 2.6 }, caps: 'grid', cam: { x: 0, y: 1.25, z: 7.6, tx: 0, ty: 1.12 } },
    slim: { slim: { x: 0, y: 0, z: 0, s: 1.05, ry: 0, spin: 0, ...closed }, detox: { x: 2.8, s: 0, z: -1 }, caps: 'few', cam: { x: 0, y: 1.25, z: 6.9, tx: 0, ty: 1.12 } },
    yodetox: { slim: { x: -2.8, s: 0, z: -1, ...closed }, detox: { x: 0, y: 0, z: 0, s: 1.05, ry: 0, spin: 0, ...closed }, caps: 'none', cam: { x: 0, y: 1.25, z: 6.9, tx: 0, ty: 1.12 } },
    combo: { slim: { x: -0.68, y: 0, z: 0.15, s: 0.95, ry: 0.3, spin: 0, ...closed }, detox: { x: 0.72, y: 0, z: -0.2, s: 0.95, ry: -0.3, spin: 0, ...closed }, caps: 'few', cam: { x: 0, y: 1.3, z: 7.6, tx: 0, ty: 1.12 } },
    label: { slim: { x: 0, y: 0, z: 0, s: 1.15, ry: Math.PI, spin: 0, ...closed }, detox: { x: 2.8, s: 0, z: -1 }, caps: 'none', cam: { x: 0, y: 1.05, z: 4.8, tx: 0, ty: 1.02 } },
    off: { slim: { s: 1 }, caps: 'none' },
  };

  const slotsFor = (kind) => {
    if (kind === 'float') return floatSlots(30);
    if (kind === 'grid') return gridSlots(30, 0.6, 1.15);
    if (kind === 'few') {
      const spots = [[-1.75, 1.95, 0.3], [1.85, 1.65, 0.25], [-1.6, 0.5, 0.55], [1.72, 0.42, 0.6], [0.1, 2.85, -0.5], [1.05, 0.28, 1.2]];
      return caps.items.map((_, i) => (i < spots.length ? { x: spots[i][0], y: spots[i][1], z: spots[i][2], rx: i, ry: i * 0.7, rz: 0.5 + i, s: 1, w: 1 } : { x: 0, y: 2.1, z: 0, rx: 0, ry: 0, rz: 0, s: 0, w: 0 }));
    }
    if (kind === 'one') return caps.items.map((_, i) => (i === 0 ? { x: -0.25, y: 2.62, z: 0.25, rx: 0.2, ry: 0, rz: 0.25, s: 1.7, w: 0.35 } : { x: -0.25, y: 2.1, z: 0, rx: 0, ry: 0, rz: 0, s: 0, w: 0 }));
    return caps.items.map(() => ({ x: 0, y: 2.1, z: 0, rx: 0, ry: 0, rz: 0, s: 0, w: 0 }));
  };

  const tweens = [];
  const kill = () => { while (tweens.length) tweens.pop().kill(); };
  const gs = window.gsap;
  const go = (target, to, opts = {}) => {
    if (!motion || !gs) { Object.assign(target, to); return; }
    tweens.push(gs.to(target, { ...to, duration: opts.duration ?? 1.1, ease: opts.ease ?? 'expo.out', delay: opts.delay ?? 0, overwrite: 'auto' }));
  };

  let current = '';
  function set(name, product) {
    if (name === current && !product) return;
    current = name;
    let preset = PRESETS[name] || PRESETS.hero;
    if (name.startsWith('quiz')) preset = PRESETS[product || 'slim'] || PRESETS.slim;
    kill();
    go(S.slim, preset.slim || {}, { duration: 1.2 });
    go(S.detox, preset.detox || {}, { duration: 1.2 });
    if (preset.cam) go(cam, preset.cam, { duration: 1.4, ease: 'power3.inOut' });
    const slots = slotsFor(preset.caps || 'none');
    caps.items.forEach((it, i) => {
      const to = slots[i];
      const delay = preset.caps === 'grid' ? 0.15 + i * 0.035 : preset.caps === 'one' ? 0.35 : i * 0.012;
      go(it, to, { duration: preset.caps === 'grid' ? 0.9 : 1.2, ease: 'expo.out', delay });
    });
    if (!motion) render();
  }

  // pointer: the object leans a little towards the hand
  const lean = { x: 0, y: 0, tx: 0, ty: 0 };
  host.addEventListener('pointermove', (e) => {
    const r = host.getBoundingClientRect();
    lean.tx = ((e.clientX - r.left) / r.width - 0.5) * 0.35;
    lean.ty = ((e.clientY - r.top) / r.height - 0.5) * 0.18;
  });
  host.addEventListener('pointerleave', () => { lean.tx = 0; lean.ty = 0; });

  // drag sideways to turn the bottle; it keeps a little momentum, then settles
  const drag = { on: false, x: 0, vel: 0 };
  host.addEventListener('pointerdown', (e) => { drag.on = true; drag.x = e.clientX; drag.vel = 0; host.setPointerCapture(e.pointerId); wake(); });
  host.addEventListener('pointermove', (e) => {
    if (!drag.on) return;
    const d = (e.clientX - drag.x) * 0.012;
    drag.x = e.clientX;
    drag.vel = d;
    spinA += d; spinB += d;
    if (!motion) render();
  });
  const release = () => { drag.on = false; };
  host.addEventListener('pointerup', release);
  host.addEventListener('pointercancel', release);

  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e3 = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3();
  let t0 = performance.now(), spinA = 0, spinB = 0;

  function apply(t, dt) {
    const bob = motion ? Math.sin(t * 1.1) * 0.035 : 0;
    const place = (b, st, spinVar) => {
      b.group.position.set(st.x, st.y + bob * st.s, st.z);
      b.group.scale.setScalar(Math.max(0.0001, st.s));
      b.group.visible = st.s > 0.01;
      b.group.rotation.y = st.ry;
      b.spin.rotation.y = spinVar;
      b.cap.position.y = 2.06 + st.cap;
      b.cap.rotation.z = st.capTilt;
      b.cap.position.x = st.capX;
    };
    if (motion) { spinA += S.slim.spin * dt; spinB += S.detox.spin * dt; }
    if (!drag.on && Math.abs(drag.vel) > 0.0005) { spinA += drag.vel; spinB += drag.vel; drag.vel *= 0.92; }
    // ease the idle spin back to the front when a state stops spinning
    const settle = !drag.on && Math.abs(drag.vel) < 0.01;
    if (settle && !S.slim.spin) spinA += (Math.round(spinA / (Math.PI * 2)) * Math.PI * 2 - spinA) * Math.min(1, dt * 2.5);
    if (settle && !S.detox.spin) spinB += (Math.round(spinB / (Math.PI * 2)) * Math.PI * 2 - spinB) * Math.min(1, dt * 2.5);
    place(slim, S.slim, spinA);
    place(detox, S.detox, spinB);

    caps.items.forEach((it) => {
      const wob = motion && it.s > 0 ? Math.sin(t * it.speed + it.phase) : 0;
      v.set(it.x, it.y + wob * 0.06 * it.w, it.z);
      e3.set(it.rx + wob * 0.15 * it.w, it.ry + (motion ? t * 0.2 * it.speed * it.w : 0), it.rz);
      q.setFromEuler(e3);
      sc.setScalar(Math.max(0.0001, it.s));
      m4.compose(v, q, sc);
      caps.mesh.setMatrixAt(it.i, m4);
    });
    caps.mesh.instanceMatrix.needsUpdate = true;

    lean.x += (lean.tx - lean.x) * Math.min(1, dt * 4);
    lean.y += (lean.ty - lean.y) * Math.min(1, dt * 4);
    root.rotation.y = lean.x;
    root.rotation.x = lean.y * 0.4;
    camera.position.set(cam.x, cam.y, cam.z);
    camera.lookAt(cam.tx, cam.ty, 0);
  }

  function resize() {
    const r = host.getBoundingClientRect();
    const w = Math.max(1, r.width), h = Math.max(1, r.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep the bottle the same size on tall and wide stages
    camera.zoom = Math.min(1, (w / h) / 0.82);
    camera.updateProjectionMatrix();
  }
  function render() {
    const t = performance.now() / 1000;
    apply(t, 0);
    renderer.render(scene, camera);
  }

  let visible = true, raf = 0, last = performance.now();
  function loop(now) {
    raf = 0;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    apply(now / 1000, dt);
    renderer.render(scene, camera);
    if (visible && motion && !document.hidden) raf = requestAnimationFrame(loop);
  }
  function wake() { if (!raf && motion) { last = performance.now(); raf = requestAnimationFrame(loop); } }
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) wake(); }).observe(host);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) wake(); });
  new ResizeObserver(() => { resize(); if (!motion) render(); }).observe(host);

  resize();
  if (motion) Object.assign(S.slim, { y: 1.6, s: 0.55, ry: -1.6 });
  set('hero');
  render();
  wake();

  // stills of single states, for phones and the cart
  async function stills(names, w = 720, h = 900) {
    const plain = (o) => Object.fromEntries(Object.entries(o).filter(([k]) => k !== '_gsap'));
    const keep = { slim: plain(S.slim), detox: plain(S.detox), cam: plain(cam) };
    const keepCaps = caps.items.map(plain);
    const keepLean = { ...lean };
    const prevMotion = motion;
    const size = renderer.getSize(new THREE.Vector2());
    const ratio = renderer.getPixelRatio();
    const shot = document.createElement('canvas');
    shot.width = w; shot.height = h;
    const ctx = shot.getContext('2d');
    const out = {};
    motion = false;
    lean.x = lean.y = 0;
    renderer.setPixelRatio(1);
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.zoom = 1; camera.updateProjectionMatrix();
    for (const name of names) {
      const p = PRESETS[name];
      Object.assign(S.slim, p.slim || {}); Object.assign(S.detox, p.detox || {}); Object.assign(cam, p.cam || {});
      slotsFor(p.caps || 'none').forEach((sl, i) => Object.assign(caps.items[i], sl));
      apply(0, 0);
      renderer.render(scene, camera);
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(renderer.domElement, 0, 0, w, h);
      out[name] = shot.toDataURL('image/webp', 0.9);
    }
    motion = prevMotion;
    Object.assign(S.slim, keep.slim); Object.assign(S.detox, keep.detox); Object.assign(cam, keep.cam);
    keepCaps.forEach((k, i) => Object.assign(caps.items[i], k));
    Object.assign(lean, keepLean);
    renderer.setPixelRatio(ratio);
    renderer.setSize(size.x, size.y, false);
    resize();
    render();
    return out;
  }

  return { set, stills, render, get state() { return current; } };
}
