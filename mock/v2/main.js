// Mayqueen homepage mock, v2: the stage director, cart, consultation, product tabs, reveals, drawers.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const html = document.documentElement;
  const moving = html.classList.contains('motion');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const money = (n) => n.toLocaleString('vi-VN') + ' đ';
  const phone = () => matchMedia('(max-width: 63.99em)').matches;
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode: memory only */ } },
  };

  // ---------- products (sample prices, to be confirmed by the client) ----------
  const P = {
    'slim-1': { name: 'Mayqueen Slim', unit: 'Một lọ, 30 viên', price: 390000, art: 'slim' },
    'slim-3': { name: 'Mayqueen Slim', unit: 'Ba lọ, 90 viên', price: 1050000, art: 'slim' },
    'yodetox-1': { name: 'Yodetox', unit: 'Một lọ, 30 viên', price: 320000, art: 'yodetox' },
    'yodetox-3': { name: 'Yodetox', unit: 'Ba lọ, 90 viên', price: 870000, art: 'yodetox' },
    'combo-1': { name: 'Combo Slim và Yodetox', unit: 'Một tháng, mỗi loại một lọ', price: 640000, art: 'combo' },
    'combo-3': { name: 'Combo Slim và Yodetox', unit: 'Ba tháng, mỗi loại ba lọ', price: 1790000, art: 'combo' },
  };
  const SHOP = {
    slim: { name: 'Mayqueen Slim', desc: 'Trà xanh, bứa và khoai nưa. Một viên mỗi sáng, trước bữa ăn 30 phút.', facts: ['Lọ 30 viên nang, dùng một tháng', 'Uống buổi sáng, với nước ấm', 'Thực phẩm bảo vệ sức khỏe'], v: ['Một lọ', 'Ba lọ, tiết kiệm hơn'], save: 'Tiết kiệm 120.000 đ' },
    yodetox: { name: 'Yodetox', desc: 'Gừng, bồ công anh và lá sen. Một viên mỗi tối, sau bữa ăn.', facts: ['Lọ 30 viên nang, dùng một tháng', 'Uống buổi tối, sau bữa ăn', 'Thực phẩm bảo vệ sức khỏe'], v: ['Một lọ', 'Ba lọ, tiết kiệm hơn'], save: 'Tiết kiệm 90.000 đ' },
    combo: { name: 'Combo Slim và Yodetox', desc: 'Slim buổi sáng, Yodetox buổi tối. Mua cùng nhau rẻ hơn mua lẻ.', facts: ['Mỗi loại một lọ cho một tháng', 'Rẻ hơn mua lẻ 70.000 đ', 'Miễn phí giao hàng'], v: ['Một tháng', 'Ba tháng'], save: 'Rẻ hơn mua lẻ 340.000 đ' },
  };
  const FREESHIP = 500000;
  const stills = { slim: 'assets/bottle-slim.svg', yodetox: 'assets/bottle-yodetox.svg', combo: 'assets/bottle-slim.svg' };

  // ---------- smooth scroll (wheel only; touch and calm keep the browser's) ----------
  let lenis = null;
  if (moving && window.Lenis && !matchMedia('(pointer: coarse)').matches) {
    lenis = new Lenis({ lerp: 0.12, smoothWheel: true, anchors: true });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  // ---------- the stage director ----------
  const stage = $('[data-stage]');
  const caption = $('[data-stage-caption]');
  const LOOK = {
    hero: { bg: '#D6EBB0', cap: 'Mayqueen Slim, lọ 30 viên nang', product: 'slim' },
    ritual: { bg: '#CFE3B4', cap: 'Mở nắp, một viên mỗi sáng', product: 'slim' },
    month: { bg: '#E6F0D6', cap: '30 viên, 30 buổi sáng', product: 'slim' },
    slim: { bg: '#D6EBB0', cap: 'Mayqueen Slim, lọ 30 viên', product: 'slim' },
    yodetox: { bg: '#CDEBE2', cap: 'Yodetox, lọ 30 viên', product: 'yodetox' },
    combo: { bg: '#E6F0D6', cap: 'Combo Slim và Yodetox', product: 'combo' },
    label: { bg: '#EAEEE0', cap: 'Mặt sau lọ Mayqueen Slim', product: 'slim' },
    quiz: { bg: '#DDEEC4', cap: 'Lọ đổi theo gợi ý dành cho bạn', product: 'slim' },
  };
  let three = null;
  let current = '';
  function setStage(state, captionText) {
    if (!stage || state === current) return;
    current = state;
    const media = state.startsWith('photo:') ? state.slice(6) : state === 'film' ? 'film' : '';
    stage.classList.toggle('is-media', !!media);
    $$('.stage__media > *', stage).forEach((m) => {
      const on = m.dataset.media === media;
      m.classList.toggle('is-on', on);
      if (m.tagName === 'VIDEO') { if (on && moving) m.play().catch(() => {}); else m.pause(); }
    });
    const look = LOOK[state] || {};
    if (look.bg) stage.style.setProperty('--stage', look.bg);
    if (look.product) stage.dataset.product = look.product;
    const text = captionText || look.cap;
    if (text && caption.textContent !== text) {
      caption.classList.add('is-changing');
      setTimeout(() => { caption.textContent = text; caption.classList.remove('is-changing'); }, moving ? 240 : 0);
    }
    if (three && !media) three.set(state);
  }
  const stateEls = $$('[data-state]');
  const activeHerb = (el) => $$('.herb').forEach((h) => h.classList.toggle('is-active', h === el));
  if ('IntersectionObserver' in window && stage) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target;
        // a herb wins over its section; the section wins otherwise
        if (el.classList.contains('herb')) activeHerb(el); else if (!el.querySelector('.herb')) activeHerb(null);
        setStage(el.dataset.state, el.dataset.caption);
      }
    }, { rootMargin: '-48% 0px -48% 0px' });
    stateEls.forEach((el) => io.observe(el));
  }
  window.addEventListener('mq:stage-ready', (e) => {
    three = e.detail.stage;
    const s = current || 'hero';
    current = '';
    setStage(s);
  });
  window.addEventListener('mq:stills', (e) => {
    Object.assign(stills, e.detail);
    $$('img[data-still]').forEach((img) => { const k = img.dataset.still; if (stills[k]) img.src = stills[k]; });
    renderCart();
  });
  window.addEventListener('mq:no-webgl', () => html.classList.add('no-webgl'));
  setTimeout(() => { if (!three) html.classList.add('no-webgl'); }, 9000);

  // ---------- drawers ----------
  const scrim = $('[data-scrim]');
  let openDrawer = null;
  let returnFocus = null;
  const lock = (on) => { html.style.overflow = on ? 'hidden' : ''; if (lenis) on ? lenis.stop() : lenis.start(); };
  function open(drawer, trigger) {
    if (!drawer) return;
    if (openDrawer && openDrawer !== drawer) close(true);
    returnFocus = trigger || document.activeElement;
    drawer.hidden = false; scrim.hidden = false;
    drawer.classList.remove('is-closing');
    requestAnimationFrame(() => { drawer.classList.add('is-open'); scrim.classList.add('is-open'); });
    openDrawer = drawer;
    lock(true);
    $$('[aria-controls="' + drawer.id + '"]').forEach((b) => b.setAttribute('aria-expanded', 'true'));
    const first = drawer.querySelector('input, button, a[href]');
    setTimeout(() => first && first.focus({ preventScroll: true }), 60);
    onScroll();
  }
  function close(quick) {
    const drawer = openDrawer;
    if (!drawer) return;
    openDrawer = null;
    drawer.classList.add('is-closing');
    drawer.classList.remove('is-open');
    scrim.classList.remove('is-open');
    const done = () => { if (!drawer.classList.contains('is-open')) { drawer.hidden = true; scrim.hidden = true; drawer.classList.remove('is-closing'); } };
    if (quick || !moving) done(); else setTimeout(done, 280);
    lock(false);
    $$('[aria-controls="' + drawer.id + '"]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
    if (returnFocus && returnFocus.focus) returnFocus.focus({ preventScroll: true });
    onScroll();
  }
  scrim.addEventListener('click', () => close());
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  $$('[data-close]').forEach((b) => b.addEventListener('click', () => close()));
  $$('[data-open-cart]').forEach((b) => b.addEventListener('click', () => open($('[data-cart]'), b)));
  $$('[data-open-menu]').forEach((b) => b.addEventListener('click', () => open($('[data-menu]'), b)));
  $$('[data-open-search]').forEach((b) => b.addEventListener('click', () => open($('[data-search]'), b)));
  $$('[data-menu] a, [data-search] a').forEach((a) => a.addEventListener('click', () => close(true)));

  // ---------- cart ----------
  let cart = store.get('mq-cart') || {};
  const list = $('[data-cart-items]');
  const total = () => Object.entries(cart).reduce((s, [id, q]) => s + (P[id] ? P[id].price * q : 0), 0);
  const count = () => Object.values(cart).reduce((s, q) => s + q, 0);
  let lastCount = count();
  function renderCount() {
    const n = count();
    $$('[data-cart-count]').forEach((el) => {
      el.innerHTML = '<span>' + n + '</span>';
      if (n !== lastCount) { el.classList.remove('is-bumped'); void el.offsetWidth; el.classList.add('is-bumped'); }
    });
    lastCount = n;
  }
  function renderCart() {
    const sum = total();
    list.innerHTML = '';
    const ids = Object.keys(cart).filter((id) => P[id] && cart[id] > 0);
    if (!ids.length) list.innerHTML = '<li class="cart__empty">Giỏ hàng đang trống. <a class="link-plain" href="#san-pham" data-close-link>Chọn sản phẩm</a></li>';
    ids.forEach((id) => {
      const p = P[id];
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML = `<img src="${stills[p.art]}" alt="" width="76" height="95">
        <div><p class="cart-item__name">${p.name}</p><p class="cart-item__unit">${p.unit}</p>
          <div class="stepper" role="group" aria-label="Số lượng ${p.name}"><button type="button" data-step="-1" data-id="${id}" aria-label="Bớt một">−</button><span aria-live="polite">${cart[id]}</span><button type="button" data-step="1" data-id="${id}" aria-label="Thêm một">+</button></div>
          <button class="cart-item__remove" type="button" data-remove="${id}">Xóa</button></div>
        <p class="cart-item__price">${money(p.price * cart[id])}</p>`;
      list.append(li);
    });
    $('[data-cart-total]').textContent = money(sum);
    const left = FREESHIP - sum;
    $('[data-ship-text]').textContent = left > 0 ? `Thêm ${money(left)} để được miễn phí giao hàng.` : 'Đơn của bạn được miễn phí giao hàng.';
    $('[data-ship-bar]').style.setProperty('--k', clamp(sum / FREESHIP, 0, 1));
    const up = $('[data-upsell]');
    const hasSlim = cart['slim-1'] > 0;
    const hasOther = Object.keys(cart).some((id) => (id.startsWith('yodetox') || id.startsWith('combo')) && cart[id] > 0);
    if (hasSlim && !hasOther) { up.hidden = false; up.innerHTML = 'Thêm Yodetox thành combo một tháng, rẻ hơn mua lẻ 70.000&nbsp;đ.<br><button type="button" data-swap="combo-1">Đổi sang combo</button>'; }
    else { up.hidden = true; up.innerHTML = ''; }
    renderCount();
    store.set('mq-cart', cart);
  }

  // the product flies from the button into the cart
  function fly(from, art, done) {
    const target = [...$$('[data-open-cart]')].find((b) => { const r = b.getBoundingClientRect(); return r.width && r.bottom > 0 && r.top < innerHeight; });
    if (!moving || !window.gsap || !target) { done(); return; }
    const a = from.getBoundingClientRect(), b = target.getBoundingClientRect();
    const img = document.createElement('img');
    img.className = 'fly'; img.alt = ''; img.src = stills[art];
    $('[data-fly-layer]').append(img);
    const x0 = a.left + a.width / 2 - 42, y0 = a.top + a.height / 2 - 52;
    const x1 = b.left + b.width / 2 - 42, y1 = b.top + b.height / 2 - 52;
    gsap.set(img, { x: x0, y: y0, scale: 0.6, opacity: 0 });
    const tl = gsap.timeline({ onComplete: () => { img.remove(); done(); } });
    tl.to(img, { opacity: 1, scale: 1, y: y0 - 60, duration: 0.28, ease: 'power3.out' })
      .to(img, { x: x1, duration: 0.62, ease: 'power2.inOut' }, '>-0.02')
      .to(img, { y: y1, scale: 0.28, rotation: 12, duration: 0.62, ease: 'power3.in' }, '<')
      .to(img, { opacity: 0, duration: 0.12 }, '>-0.1');
  }
  function add(id, button) {
    if (!P[id]) return;
    cart[id] = (cart[id] || 0) + 1;
    if (button && button.tagName === 'BUTTON') {
      const target = button.querySelector('.pt__cta') || button;
      const label = target.textContent;
      button.classList.add('is-added');
      target.textContent = 'Đã thêm vào giỏ';
      setTimeout(() => { target.textContent = label; button.classList.remove('is-added'); }, 1600);
    }
    fly(button || document.body, P[id].art, () => { renderCart(); open($('[data-cart]'), button); });
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-add]');
    if (a) { e.preventDefault(); add(a.dataset.add, a); return; }
    const buy = e.target.closest('[data-buy-now]');
    if (buy) { e.preventDefault(); add($('[data-p-add]').dataset.add, buy); return; }
    const st = e.target.closest('[data-step]');
    if (st) { const id = st.dataset.id; cart[id] = Math.max(0, (cart[id] || 0) + Number(st.dataset.step)); if (!cart[id]) delete cart[id]; renderCart(); return; }
    const rm = e.target.closest('[data-remove]');
    if (rm) { delete cart[rm.dataset.remove]; renderCart(); return; }
    const sw = e.target.closest('[data-swap]');
    if (sw && sw.tagName === 'BUTTON') { cart['slim-1'] -= 1; if (cart['slim-1'] <= 0) delete cart['slim-1']; cart['combo-1'] = (cart['combo-1'] || 0) + 1; renderCart(); return; }
    if (e.target.closest('[data-close-link]')) close(true);
  });
  renderCart();

  // ---------- product tabs and variants ----------
  const shop = $('#san-pham');
  if (shop) {
    const tabs = $$('[role="tab"]', shop);
    const swap = $('[data-swap]', shop);
    const variants = $$('[data-variant]', shop);
    let tab = 'slim', variant = '1';
    const paint = () => {
      const s = SHOP[tab];
      const id = `${tab}-${variant}`;
      $('[data-p="name"]', shop).textContent = s.name;
      $('[data-p="desc"]', shop).textContent = s.desc;
      $('[data-p="facts"]', shop).innerHTML = s.facts.map((f) => `<li>${f}</li>`).join('');
      variants.forEach((b, i) => { b.textContent = s.v[i]; b.setAttribute('aria-checked', String(b.dataset.variant === variant)); });
      $('[data-p="price"]', shop).textContent = money(P[id].price);
      $('[data-p="save"]', shop).textContent = variant === '3' || tab === 'combo' ? (variant === '3' ? s.save : 'Rẻ hơn mua lẻ 70.000 đ') : '';
      $('[data-p-add]', shop).dataset.add = id;
      const still = $('[data-product-still]', shop);
      if (still) { still.src = stills[tab]; still.dataset.still = tab; still.alt = `${s.name}, hình dựng 3D`; }
    };
    const choose = (t) => {
      if (t === tab) return;
      tab = t;
      tabs.forEach((b) => { const on = b.dataset.tab === t; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
      $('[role="tabpanel"]', shop).setAttribute('aria-labelledby', 'tab-' + t);
      shop.dataset.state = t;
      if (moving) { swap.classList.add('is-swapping'); setTimeout(() => { paint(); swap.classList.remove('is-swapping'); }, 220); } else paint();
      setStage(t);
    };
    tabs.forEach((b, i) => {
      b.addEventListener('click', () => choose(b.dataset.tab));
      b.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        n.focus(); choose(n.dataset.tab);
      });
    });
    variants.forEach((b) => b.addEventListener('click', () => { variant = b.dataset.variant; paint(); }));
    paint();
  }

  // ---------- the offers: one month or three ----------
  const WAS = { 'slim-3': 1170000, 'yodetox-3': 960000, 'combo-1': 710000, 'combo-3': 2130000 };
  $$('[data-offer]').forEach((card) => {
    const kind = card.dataset.offer;
    const paint = (len) => {
      const id = `${kind}-${len}`;
      $$('[data-len]', card).forEach((b) => b.setAttribute('aria-checked', String(b.dataset.len === len)));
      const price = $('[data-o="price"]', card);
      price.textContent = money(P[id].price);
      if (moving) { price.classList.remove('is-ticking'); void price.offsetWidth; price.classList.add('is-ticking'); }
      const was = $('[data-o="was"]', card);
      was.hidden = !WAS[id];
      was.textContent = WAS[id] ? money(WAS[id]) : '';
      $('[data-o="save"]', card).textContent = WAS[id] ? `Tiết kiệm ${money(WAS[id] - P[id].price)}` : '\u00a0';
      $('.offer__buy', card).dataset.add = id;
    };
    $$('[data-len]', card).forEach((b) => b.addEventListener('click', () => paint(b.dataset.len)));
  });

  // ---------- the consultation, one question at a time ----------
  const quiz = $('#quiz');
  if (quiz) {
    const steps = $$('.q', quiz);
    const result = $('[data-result]', quiz);
    const now = $('[data-step-now]', quiz);
    const bar = $('[data-quiz-bar]', quiz);
    const back = $('[data-quiz-back]', quiz);
    const section = $('#phieu-tu-van');
    let at = 0;
    quiz.classList.add('is-stepper');
    const show = (i, backwards) => {
      at = i;
      steps.forEach((f, k) => { f.classList.toggle('is-current', k === i); f.classList.toggle('is-back', k === i && !!backwards); });
      $('[data-steps]', quiz).hidden = false;
      result.hidden = true;
      now.textContent = i + 1;
      bar.style.setProperty('--k', (i + 1) / 5);
      back.hidden = i === 0;
    };
    const why = {
      slim: 'Bạn ưu tiên giữ vóc dáng, nên một viên Mayqueen Slim mỗi sáng là cách bắt đầu gọn nhất.',
      yodetox: 'Bạn muốn bụng nhẹ và tiêu hóa êm hơn, nên Yodetox sau bữa tối hợp với bạn hơn cả.',
      combo: 'Bạn cần cả hai: Slim vào buổi sáng, Yodetox sau bữa tối. Mua combo rẻ hơn mua lẻ.',
      fat: 'Bạn hay ăn ngoài và nhiều dầu mỡ, nên kết hợp Slim buổi sáng với Yodetox sau bữa tối. Mua combo rẻ hơn mua lẻ.',
    };
    const tip = {
      none: 'Thêm hai mươi phút đi bộ sau bữa tối, ba lần mỗi tuần: bước dễ nhất để bắt đầu.',
      some: 'Giữ một đến hai buổi tập mỗi tuần, thêm một buổi đi bộ ngắn nếu được.',
      often: 'Bạn đã vận động đều. Giữ nhịp đó và uống đủ nước mỗi ngày.',
    };
    const finish = () => {
      const a = Object.fromEntries(new FormData(quiz));
      $('[data-steps]', quiz).hidden = true;
      result.hidden = false;
      now.textContent = 5;
      bar.style.setProperty('--k', 1);
      back.hidden = false;
      if (a.safety === 'yes') {
        result.innerHTML = `<p class="result__name">Hãy hỏi bác sĩ trước khi dùng</p>
          <p class="result__why">Phụ nữ mang thai, cho con bú và người đang điều trị bệnh nên hỏi ý kiến bác sĩ trước khi dùng bất kỳ thực phẩm bảo vệ sức khỏe nào.</p>
          <p class="result__tip">Dược sĩ của Mayqueen có thể giúp bạn chuẩn bị câu hỏi cho bác sĩ.</p>
          <div class="result__actions"><a class="pill pill--ink pill--big" href="https://zalo.me/" data-zalo>Hỏi dược sĩ qua Zalo</a><button class="link-plain" type="button" data-quiz-again>Làm lại</button></div>`;
        section.dataset.state = 'label';
        setStage('label', 'Đọc kỹ mặt sau trước khi dùng');
        return;
      }
      const base = a.goal === 'both' || (a.goal === 'slim' && a.meal === 'fat') ? 'combo' : a.goal === 'detox' ? 'yodetox' : 'slim';
      const id = `${base}-${a.length || '1'}`;
      const p = P[id];
      const reason = base === 'combo' && a.goal === 'slim' ? why.fat : why[base];
      result.innerHTML = `<p class="result__name">${p.name}, ${p.unit.charAt(0).toLowerCase() + p.unit.slice(1)}</p>
        <p class="result__price">${money(p.price)} <small>cho ${a.length === '3' ? 'ba tháng' : 'một tháng'}</small></p>
        <p class="result__why">${reason}</p>
        <p class="result__tip">${tip[a.move] || ''}</p>
        <div class="result__actions"><button class="pill pill--leaf pill--big" type="button" data-add="${id}">Thêm liệu trình vào giỏ</button><button class="link-plain" type="button" data-quiz-again>Làm lại</button></div>`;
      section.dataset.state = base;
      current = '';
      setStage(base, `Gợi ý cho bạn: ${p.name}`);
    };
    quiz.addEventListener('change', (e) => {
      const f = e.target.closest('.q');
      const i = steps.indexOf(f);
      if (i !== at) return;
      if (e.target.name === 'safety' && e.target.value === 'yes') { setTimeout(finish, moving ? 320 : 0); return; }
      setTimeout(() => { if (i < steps.length - 1) { show(i + 1); steps[i + 1].querySelector('input').focus({ preventScroll: true }); } else finish(); }, moving ? 320 : 0);
    });
    back.addEventListener('click', () => { if (!result.hidden) show(steps.length - 1, true); else if (at > 0) show(at - 1, true); });
    quiz.addEventListener('click', (e) => { if (e.target.closest('[data-quiz-again]')) { quiz.reset(); section.dataset.state = 'quiz'; show(0); } });
    quiz.addEventListener('submit', (e) => { e.preventDefault(); finish(); });
    show(0);
  }

  // ---------- coupon ----------
  const coupon = $('[data-coupon]');
  if (coupon) {
    coupon.addEventListener('submit', (e) => {
      e.preventDefault();
      const c = coupon.querySelector('[name="contact"]');
      if (!c.value.trim()) { c.focus(); c.setAttribute('aria-invalid', 'true'); c.placeholder = 'Cần số điện thoại hoặc email'; return; }
      const who = c.value.trim().replace(/[<>&"]/g, '');
      const done = document.createElement('div');
      done.className = 'coupon__done';
      done.innerHTML = `<p>Mã của bạn</p><p class="coupon__code">CHAOMAY10</p><a class="cell cell--submit" href="#san-pham" style="display:grid;place-items:center;text-decoration:none">Chọn sản phẩm</a>`;
      coupon.replaceWith(done);
      $('[data-coupon-fine]').textContent = `Giảm 10% cho đơn đầu tiên, dùng trong 30 ngày. Mã cũng đã gửi tới ${who}.`;
    });
  }

  // ---------- the notice line ----------
  const notes = $$('[data-notice] span');
  if (moving && notes.length > 1) {
    let k = 0;
    setInterval(() => {
      if (document.hidden) return;
      const prev = notes[k];
      k = (k + 1) % notes.length;
      prev.classList.remove('is-on'); prev.classList.add('is-off');
      notes[k].classList.remove('is-off'); notes[k].classList.add('is-on');
      setTimeout(() => prev.classList.remove('is-off'), 700);
    }, 4200);
  }

  // ---------- reveals, once ----------
  $$('[data-stagger]').forEach((el) => [...el.children].forEach((c, k) => c.style.setProperty('--k', Math.min(k, 8))));
  const reveal = $$('[data-reveal], [data-stagger]');
  if (moving && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    reveal.forEach((el) => io.observe(el));
  } else reveal.forEach((el) => el.classList.add('is-in'));

  // ---------- headings whose lines rise ----------
  (() => {
    const els = $$('[data-lines]');
    if (!moving || !els.length || !('IntersectionObserver' in window)) return;
    const restore = (el) => { el.textContent = el.dataset.text; el.classList.remove('is-split', 'is-in'); };
    const split = (el) => {
      const text = el.textContent.trim().replace(/\s+/g, ' ');
      el.dataset.text = text;
      el.textContent = '';
      const words = text.split(' ').map((w) => { const s = document.createElement('span'); s.style.display = 'inline-block'; s.textContent = w; el.append(s, ' '); return s; });
      const lines = [];
      for (const w of words) { const last = lines.at(-1); if (last && Math.abs(last.top - w.offsetTop) < 4) last.words.push(w.textContent); else lines.push({ top: w.offsetTop, words: [w.textContent] }); }
      el.textContent = '';
      lines.forEach((line, i) => { const m = document.createElement('span'); const s = document.createElement('span'); m.className = 'line'; s.style.setProperty('--i', i); s.textContent = line.words.join(' '); m.append(s); el.append(m, ' '); });
      el.classList.add('is-split');
    };
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        e.target.classList.add('is-in');
        const last = e.target.querySelector('.line:last-of-type > span');
        if (last) last.addEventListener('transitionend', () => restore(e.target), { once: true }); else restore(e.target);
      }
    }, { rootMargin: '0px 0px -10% 0px' });
    document.fonts.ready.then(() => els.forEach((el) => { split(el); io.observe(el); }));
  })();

  // ---------- figures that count up once ----------
  (() => {
    const els = $$('[data-roll]');
    if (!els.length || !moving || !('IntersectionObserver' in window)) return;
    els.forEach((el) => { el.dataset.to = el.textContent.trim(); el.textContent = '0'; });
    const run = (el) => {
      const to = Number(el.dataset.to), t0 = performance.now(), dur = 1300;
      const step = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        el.textContent = Math.round(to * (1 - Math.pow(2, -10 * k)));
        if (k < 1) requestAnimationFrame(step); else el.textContent = el.dataset.to;
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
    }, { rootMargin: '0px 0px -15% 0px' });
    els.forEach((el) => io.observe(el));
  })();

  // ---------- the drag row ----------
  $$('[data-drag]').forEach((row) => {
    let drag = null;
    row.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      drag = { x: e.clientX, left: row.scrollLeft, moved: false };
    });
    addEventListener('pointermove', (e) => {
      if (!drag) return;
      const d = e.clientX - drag.x;
      if (Math.abs(d) > 5 && !drag.moved) { drag.moved = true; row.classList.add('is-dragging'); }
      if (drag.moved) row.scrollLeft = drag.left - d;
    });
    addEventListener('pointerup', () => {
      if (!drag) return;
      const moved = drag.moved;
      drag = null;
      row.classList.remove('is-dragging');
      if (moved) row.addEventListener('click', (ev) => ev.preventDefault(), { capture: true, once: true });
    });
  });

  // ---------- the strip of pictures: a slow marquee, paused out of view ----------
  $$('[data-marquee]').forEach((track) => {
    if (!moving) return;
    track.append(...[...track.children].map((n) => { const c = n.cloneNode(true); c.alt = ''; return c; }));
    const w = () => track.scrollWidth / 2;
    let x = 0, last = performance.now(), on = false, hover = false;
    const tick = (t) => {
      const dt = Math.min(64, t - last); last = t;
      if (!hover) { x -= dt * 0.03; if (-x >= w()) x += w(); track.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`; }
      if (on) requestAnimationFrame(tick);
    };
    track.addEventListener('pointerenter', () => { hover = true; });
    track.addEventListener('pointerleave', () => { hover = false; });
    new IntersectionObserver((es) => { const was = on; on = es[0].isIntersecting; if (on && !was) { last = performance.now(); requestAnimationFrame(tick); } }).observe(track);
  });

  // ---------- the bar that returns, Zalo, the curtain ----------
  const topbar = $('[data-topbar]');
  const floatZalo = $('[data-zalo-float]');
  const footer = $('.footer');
  const main = $('main');
  const hero = $('.hero');
  let lastY = scrollY, ticking = false;
  function onScroll() {
    ticking = false;
    const y = scrollY;
    const past = y > hero.offsetTop + hero.offsetHeight * 0.8;
    if (y < lastY - 2 && past && !openDrawer) topbar.classList.add('is-shown');
    if (y > lastY + 2 || !past || openDrawer) topbar.classList.remove('is-shown');
    lastY = y;
    const nearEnd = y + innerHeight > document.documentElement.scrollHeight - footer.offsetHeight * 0.6;
    floatZalo.classList.toggle('is-away', !!openDrawer || nearEnd);
    footer.classList.toggle('is-under', getComputedStyle(footer).position === 'sticky' && main.getBoundingClientRect().bottom >= innerHeight - 1);
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  // ---------- the motion switch in the footer ----------
  const toggle = $('[data-motion-toggle]');
  if (toggle) {
    const forced = html.classList.contains('force-motion');
    const sys = matchMedia('(prefers-reduced-motion: reduce)').matches;
    $('[data-motion-state]', toggle).textContent = forced ? 'bật (bấm để theo máy)' : sys ? 'tắt theo máy (bấm để bật)' : 'bật theo máy';
    toggle.addEventListener('click', () => {
      try { if (forced) localStorage.removeItem('mq-motion'); else localStorage.setItem('mq-motion', 'on'); } catch { /* ignore */ }
      location.reload();
    });
  }

  // ---------- the note for devices that ask for reduced motion ----------
  const note = $('[data-motion-note]');
  if (note && !moving) {
    let dismissed = false;
    try { dismissed = sessionStorage.getItem('mq-motion-note') === 'off'; } catch { /* ignore */ }
    note.hidden = dismissed;
    $('[data-motion-on]', note).addEventListener('click', () => { try { localStorage.setItem('mq-motion', 'on'); } catch { /* ignore */ } location.reload(); });
    $('[data-motion-dismiss]', note).addEventListener('click', () => { note.hidden = true; try { sessionStorage.setItem('mq-motion-note', 'off'); } catch { /* ignore */ } });
  }

  window.mq = { setStage, moving };
})();
