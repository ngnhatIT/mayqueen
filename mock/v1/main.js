// Mayqueen homepage mock: cart, consultation slip, herbs row, reveals, drawers, scenes.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const calm = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const money = (n) => n.toLocaleString('vi-VN') + ' đ';
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode: keep it in memory */ } },
  };

  // ---------- products (sample prices, to be confirmed by the client) ----------
  const P = {
    'slim-1': { name: 'Mayqueen Slim', unit: 'Một hộp, 30 viên', price: 390000, art: 'box-slim' },
    'slim-3': { name: 'Mayqueen Slim', unit: 'Liệu trình ba hộp', price: 1050000, art: 'box-slim' },
    'yodetox-1': { name: 'Yodetox', unit: 'Một hộp, 30 viên', price: 320000, art: 'box-yodetox' },
    'yodetox-3': { name: 'Yodetox', unit: 'Liệu trình ba hộp', price: 870000, art: 'box-yodetox' },
    'combo-1': { name: 'Combo Slim và Yodetox', unit: 'Một tháng, mỗi loại một hộp', price: 640000, art: 'box-slim' },
    'combo-3': { name: 'Combo Slim và Yodetox', unit: 'Ba tháng, mỗi loại ba hộp', price: 1790000, art: 'box-slim' },
  };
  const FREESHIP = 500000;

  // ---------- drawers ----------
  const scrim = $('[data-scrim]');
  let openDrawer = null;
  let returnFocus = null;
  const lockScroll = (on) => {
    document.documentElement.style.overflow = on ? 'hidden' : '';
    const lenis = window.Stage && window.Stage.lenis;
    if (lenis) on ? lenis.stop() : lenis.start();
  };
  const open = (drawer, trigger) => {
    if (!drawer) return;
    if (openDrawer && openDrawer !== drawer) close(true);
    returnFocus = trigger || document.activeElement;
    drawer.hidden = false;
    scrim.hidden = false;
    drawer.classList.remove('is-closing');
    requestAnimationFrame(() => { drawer.classList.add('is-open'); scrim.classList.add('is-open'); });
    openDrawer = drawer;
    lockScroll(true);
    zalo(false);
    $$('[aria-controls="' + drawer.id + '"]').forEach((b) => b.setAttribute('aria-expanded', 'true'));
    const first = drawer.querySelector('input, button, a[href]');
    setTimeout(() => first && first.focus({ preventScroll: true }), 60);
  };
  function close(quick) {
    const drawer = openDrawer;
    if (!drawer) return;
    openDrawer = null;
    drawer.classList.add('is-closing');
    drawer.classList.remove('is-open');
    scrim.classList.remove('is-open');
    const done = () => { if (!drawer.classList.contains('is-open')) { drawer.hidden = true; scrim.hidden = true; drawer.classList.remove('is-closing'); } };
    if (quick || calm.matches) done(); else setTimeout(done, 280);
    lockScroll(false);
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
  const cartList = $('[data-cart-items]');
  const lineTotal = () => Object.entries(cart).reduce((s, [id, q]) => s + (P[id] ? P[id].price * q : 0), 0);
  const itemCount = () => Object.values(cart).reduce((s, q) => s + q, 0);
  let lastCount = itemCount();

  const renderCount = () => {
    const n = itemCount();
    $$('[data-cart-count]').forEach((el) => {
      el.innerHTML = '<span>' + n + '</span>';
      if (n !== lastCount) { el.classList.remove('is-bumped'); void el.offsetWidth; el.classList.add('is-bumped'); }
    });
    lastCount = n;
  };

  const renderCart = () => {
    const total = lineTotal();
    cartList.innerHTML = '';
    const ids = Object.keys(cart).filter((id) => P[id] && cart[id] > 0);
    if (!ids.length) {
      cartList.innerHTML = '<li class="cart__empty">Giỏ hàng đang trống. <a class="link-plain" href="#san-pham" data-close-link>Xem bảng giá</a></li>';
    }
    ids.forEach((id) => {
      const p = P[id];
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML = `
        <svg viewBox="0 0 300 380" aria-hidden="true"><use href="#${p.art}"/></svg>
        <div>
          <p class="cart-item__name">${p.name}</p>
          <p class="cart-item__unit">${p.unit}</p>
          <div class="stepper" role="group" aria-label="Số lượng ${p.name}">
            <button type="button" data-step="-1" data-id="${id}" aria-label="Bớt một">−</button>
            <span aria-live="polite">${cart[id]}</span>
            <button type="button" data-step="1" data-id="${id}" aria-label="Thêm một">+</button>
          </div>
          <button class="cart-item__remove" type="button" data-remove="${id}">Xóa</button>
        </div>
        <p class="cart-item__price">${money(p.price * cart[id])}</p>`;
      cartList.append(li);
    });
    $('[data-cart-total]').textContent = money(total);
    const left = FREESHIP - total;
    $('[data-ship-text]').textContent = left > 0 ? `Thêm ${money(left)} để được miễn phí giao hàng.` : 'Đơn của bạn được miễn phí giao hàng.';
    $('[data-ship-bar]').style.setProperty('--k', clamp(total / FREESHIP, 0, 1));

    const upsell = $('[data-upsell]');
    const hasSlim = cart['slim-1'] > 0;
    const hasDetox = Object.keys(cart).some((id) => (id.startsWith('yodetox') || id.startsWith('combo')) && cart[id] > 0);
    if (hasSlim && !hasDetox) {
      upsell.hidden = false;
      upsell.innerHTML = 'Thêm Yodetox thành combo một tháng, rẻ hơn mua lẻ 70.000&nbsp;đ.<br><button type="button" data-swap="combo-1">Đổi sang combo</button>';
    } else { upsell.hidden = true; upsell.innerHTML = ''; }

    renderCount();
    store.set('mq-cart', cart);
  };

  const add = (id, button) => {
    if (!P[id]) return;
    cart[id] = (cart[id] || 0) + 1;
    renderCart();
    if (button) {
      const label = button.textContent;
      button.classList.add('is-added');
      button.textContent = 'Đã thêm vào giỏ';
      setTimeout(() => { button.textContent = label; button.classList.remove('is-added'); }, 1600);
    }
    open($('[data-cart]'), button);
  };

  document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('[data-add]');
    if (addBtn) { e.preventDefault(); add(addBtn.dataset.add, addBtn); return; }
    const step = e.target.closest('[data-step]');
    if (step) { const id = step.dataset.id; cart[id] = Math.max(0, (cart[id] || 0) + Number(step.dataset.step)); if (!cart[id]) delete cart[id]; renderCart(); return; }
    const rm = e.target.closest('[data-remove]');
    if (rm) { delete cart[rm.dataset.remove]; renderCart(); return; }
    const swap = e.target.closest('[data-swap]');
    if (swap) { cart['slim-1'] -= 1; if (cart['slim-1'] <= 0) delete cart['slim-1']; cart['combo-1'] = (cart['combo-1'] || 0) + 1; renderCart(); return; }
    if (e.target.closest('[data-close-link]')) close(true);
  });
  renderCart();

  // ---------- the consultation slip ----------
  const slip = $('#slip');
  if (slip) {
    const names = ['goal', 'meal', 'move', 'safety', 'length'];
    const out = $('[data-result]');
    const answered = $('[data-answered]');
    const bar = $('[data-answered-bar]');
    let shownKey = '';
    const why = {
      slim: 'Bạn ưu tiên giữ vóc dáng, nên một viên Mayqueen Slim mỗi sáng là cách bắt đầu gọn nhất.',
      detox: 'Bạn muốn bụng nhẹ và tiêu hóa êm hơn, nên Yodetox sau bữa tối hợp với bạn hơn cả.',
      combo: 'Bạn cần cả hai: Slim vào buổi sáng, Yodetox sau bữa tối. Mua combo rẻ hơn mua lẻ.',
      fat: 'Bạn hay ăn ngoài và nhiều dầu mỡ, nên kết hợp Slim buổi sáng với Yodetox sau bữa tối. Mua combo rẻ hơn mua lẻ.',
    };
    const tip = {
      none: 'Thêm hai mươi phút đi bộ sau bữa tối, ba lần mỗi tuần: bước dễ nhất để bắt đầu.',
      some: 'Giữ một đến hai buổi tập mỗi tuần, thêm một buổi đi bộ ngắn nếu được.',
      often: 'Bạn đã vận động đều. Giữ nhịp đó và uống đủ nước mỗi ngày.',
    };
    const update = () => {
      const a = Object.fromEntries(new FormData(slip));
      const n = names.filter((k) => a[k]).length;
      answered.textContent = n;
      bar.style.setProperty('--k', n / 5);

      let key = 'empty';
      if (a.safety === 'yes') key = 'stop';
      else if (n === 5) {
        const base = a.goal === 'both' || (a.goal === 'slim' && a.meal === 'fat') ? 'combo' : a.goal === 'detox' ? 'yodetox' : 'slim';
        key = [base, a.length, a.goal, a.meal, a.move].join('|');
      }
      if (key === shownKey) return;
      shownKey = key;

      if (key === 'empty') {
        out.innerHTML = `<p class="stub__empty">${n ? `Còn ${5 - n} câu nữa, gợi ý và giá sẽ hiện ở đây.` : 'Trả lời đủ năm câu, gợi ý và giá sẽ hiện ở đây.'}</p>`;
        return;
      }
      if (key === 'stop') {
        out.innerHTML = `
          <p class="result__name">Hãy hỏi bác sĩ trước khi dùng</p>
          <p class="result__why">Phụ nữ mang thai, cho con bú và người đang điều trị bệnh nên hỏi ý kiến bác sĩ trước khi dùng bất kỳ thực phẩm bảo vệ sức khỏe nào.</p>
          <p class="result__tip">Dược sĩ của Mayqueen có thể giúp bạn chuẩn bị câu hỏi cho bác sĩ.</p>
          <a class="button button--ink result__add" href="https://zalo.me/" data-zalo>Hỏi dược sĩ qua Zalo</a>`;
        return;
      }
      const [base, len] = key.split('|');
      const id = `${base}-${len}`;
      const p = P[id];
      const reason = base === 'combo' && a.goal === 'slim' ? why.fat : why[base === 'yodetox' ? 'detox' : base];
      out.innerHTML = `
        <p class="result__name">${p.name}, ${p.unit.charAt(0).toLowerCase() + p.unit.slice(1)}</p>
        <p class="result__price">${money(p.price)} <small>cho ${len === '3' ? 'ba tháng' : 'một tháng'}</small></p>
        <p class="result__why">${reason}</p>
        <p class="result__tip">${tip[a.move]}</p>
        <button class="button result__add" type="button" data-add="${id}">Thêm liệu trình vào giỏ</button>`;
    };
    const stub = $('.stub');
    slip.addEventListener('change', () => {
      const before = shownKey;
      update();
      // on a phone the result sits under the slip: bring it up once the slip is complete
      if (before !== shownKey && shownKey !== 'empty' && matchMedia('(max-width: 47.99em)').matches) {
        const r = stub.getBoundingClientRect();
        if (r.top > innerHeight * 0.6) stub.scrollIntoView({ behavior: calm.matches ? 'auto' : 'smooth', block: 'center' });
      }
    });
    slip.addEventListener('submit', (e) => { e.preventDefault(); update(); });
    update();
  }

  // ---------- coupon ----------
  const coupon = $('[data-coupon]');
  if (coupon) {
    coupon.addEventListener('submit', (e) => {
      e.preventDefault();
      const contact = coupon.querySelector('[name="contact"]');
      if (!contact.value.trim()) { contact.focus(); contact.setAttribute('aria-invalid', 'true'); contact.placeholder = 'Cần số điện thoại hoặc email'; return; }
      const body = $('[data-coupon-body]');
      const notches = $$('.coupon__notch', body);
      body.innerHTML = '';
      notches.forEach((n) => body.append(n));
      body.insertAdjacentHTML('beforeend', `
        <p class="is-new">Mã của bạn</p>
        <p class="coupon__done is-new">CHAOMAY10</p>
        <p class="is-new">Giảm 10% cho đơn đầu tiên, dùng trong 30 ngày. Mã cũng đã được gửi tới ${contact.value.trim().replace(/[<>&"]/g, '')}.</p>
        <a class="button button--ink coupon__submit is-new" href="#san-pham">Chọn sản phẩm</a>`);
    });
  }

  // ---------- reveals, once ----------
  $$('[data-stagger]').forEach((el) => [...el.children].forEach((c, k) => c.style.setProperty('--k', Math.min(k, 8))));
  const revealEls = $$('[data-reveal], [data-stagger]');
  if ('IntersectionObserver' in window && !calm.matches) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    revealEls.forEach((el) => io.observe(el));
  } else revealEls.forEach((el) => el.classList.add('is-in'));

  // ---------- headings whose lines rise ----------
  (() => {
    const els = $$('[data-lines]');
    if (!els.length || !('IntersectionObserver' in window) || calm.matches) return;
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

  // ---------- six herbs: drag row, buttons, bar, held on wide screens ----------
  const herbs = $('.herbs');
  if (herbs) {
    const track = $('[data-herbs-track]', herbs);
    const fill = $('[data-herbs-bar]', herbs);
    const prev = $('[data-herbs-prev]', herbs);
    const next = $('[data-herbs-next]', herbs);
    const wide = matchMedia('(min-width: 900px) and (prefers-reduced-motion: no-preference)');
    let dx = 0, pinned = false, queued = false;
    const itemW = () => { const it = track.children[0]; return it ? it.getBoundingClientRect().width + 32 : 300; };
    const progress = () => pinned ? clamp(-herbs.getBoundingClientRect().top / dx, 0, 1) : (track.scrollWidth - track.clientWidth > 0 ? track.scrollLeft / (track.scrollWidth - track.clientWidth) : 0);
    const paint = () => {
      queued = false;
      const p = progress();
      if (pinned) track.style.transform = `translate3d(${(-p * dx).toFixed(1)}px,0,0)`;
      const vis = clamp(track.clientWidth / (track.scrollWidth || 1), 0.12, 1);
      fill.style.setProperty('--p', (vis + (1 - vis) * p).toFixed(4));
      prev.disabled = p <= 0.005;
      next.disabled = p >= 0.995;
    };
    const measure = () => {
      herbs.classList.add('is-pinned');
      track.style.transform = '';
      dx = track.scrollWidth - track.clientWidth;
      pinned = wide.matches && dx > 0 && dx < innerHeight * 3;
      herbs.classList.toggle('is-pinned', pinned);
      herbs.style.height = pinned ? `${innerHeight + dx}px` : '';
      if (!pinned) track.style.transform = '';
      paint();
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    };
    const go = (dir) => {
      if (pinned) {
        const top = herbs.getBoundingClientRect().top + scrollY;
        const target = clamp(progress() * dx + dir * itemW(), 0, dx);
        const y = top + target;
        if (window.Stage && window.Stage.lenis) window.Stage.lenis.scrollTo(y, { duration: 0.8 });
        else scrollTo({ top: y, behavior: calm.matches ? 'auto' : 'smooth' });
      } else track.scrollBy({ left: dir * itemW(), behavior: calm.matches ? 'auto' : 'smooth' });
    };
    prev.addEventListener('click', () => go(-1));
    next.addEventListener('click', () => go(1));
    track.addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(paint); } }, { passive: true });
    addEventListener('scroll', () => { if (pinned && !queued) { queued = true; requestAnimationFrame(paint); } }, { passive: true });
    track.addEventListener('focusin', (e) => {
      if (!pinned) return;
      const item = e.target.closest('.herb');
      const x = clamp(item.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft), 0, dx);
      scrollTo({ top: herbs.getBoundingClientRect().top + scrollY + x, behavior: 'instant' });
    });
    // drag with a mouse when the row scrolls on its own
    let drag = null;
    track.addEventListener('pointerdown', (e) => {
      if (pinned || e.pointerType !== 'mouse') return;
      drag = { x: e.clientX, left: track.scrollLeft, moved: false };
      track.classList.add('is-dragging');
    });
    addEventListener('pointermove', (e) => {
      if (!drag) return;
      const d = e.clientX - drag.x;
      if (Math.abs(d) > 4) drag.moved = true;
      track.scrollLeft = drag.left - d;
    });
    addEventListener('pointerup', () => {
      if (!drag) return;
      track.classList.remove('is-dragging');
      const moved = drag.moved;
      drag = null;
      if (moved) track.addEventListener('click', (e) => e.preventDefault(), { capture: true, once: true });
    });
    addEventListener('resize', measure);
    addEventListener('load', measure);
    wide.addEventListener('change', measure);
    measure();
  }

  // ---------- the bar that returns, Zalo, the footer film ----------
  const topbar = $('[data-topbar]');
  const hero = $('.hero');
  const floatZalo = $('[data-zalo-float]');
  const film = $('.footer video');
  const footer = $('.footer');
  let lastY = scrollY;
  let ticking = false;
  function zalo(show) { if (floatZalo) floatZalo.classList.toggle('is-away', !show); }
  function onScroll() {
    ticking = false;
    const y = scrollY;
    const past = y > hero.offsetHeight * 0.8;
    topbar.classList.toggle('is-shown', past && y < lastY - 2 && !openDrawer);
    if (y > lastY + 2 || !past) topbar.classList.remove('is-shown');
    lastY = y;
    const nearEnd = y + innerHeight > document.documentElement.scrollHeight - footer.offsetHeight * 0.6;
    footer.classList.toggle('is-under', getComputedStyle(footer).position === 'sticky' && $('main').getBoundingClientRect().bottom >= innerHeight - 1);
    zalo(!openDrawer && !nearEnd);
    if (film) {
      if (calm.matches) { film.pause(); }
      else if (nearEnd) film.play().catch(() => {});
      else film.pause();
    }
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  if (film) {
    film.removeAttribute('autoplay');
    film.pause();
    calm.addEventListener('change', () => { if (calm.matches) { film.pause(); film.load(); } });
  }
  onScroll();

  // ---------- scenes ----------
  if (window.Stage) { window.Stage.smooth(); window.Stage.init(); }
})();
