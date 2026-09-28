/* ==========================================================================
   Pomocné funkcie pre vzhľad: mince, hviezdičky, okná, konfety, horná lišta
   (rovnaký základ ako v aplikácii na angličtinu)
   ========================================================================== */

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));

function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function rand(a, b) { return a + Math.random() * (b - a); }
function randInt(a, b) { return Math.floor(rand(a, b + 1)); }
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function sample(arr, n) { return shuffle(arr).slice(0, n); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function uniqBy(arr, f) {
  const seen = new Set();
  return arr.filter(x => { const k = f(x); if (seen.has(k)) return false; seen.add(k); return true; });
}
function cap(s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); }

const _seg = (window.Intl && Intl.Segmenter) ? new Intl.Segmenter('sk', { granularity: 'grapheme' }) : null;
function glyphs(s) {
  if (!s) return 0;
  if (_seg) return Array.from(_seg.segment(s)).length;
  return Array.from(s).length > 3 ? 2 : 1;
}

/* Obrázok dieťaťa (avatar) s ozdobami z obchodu */
function avatarHTML(cls = '', opts = {}) {
  const p = Store.state.profile;
  const eq = opts.equip || p.equip || {};
  const it = id => (id && SHOP_BY_ID[id]) || null;
  const fr = it(eq.frame), hat = it(eq.hat), gl = it(eq.glasses), pet = it(eq.pet);
  const tag = opts.button ? 'button' : 'span';
  return `<${tag} class="avatar ${cls}" ${opts.id ? `id="${opts.id}"` : ''} ${fr ? `style="background:${fr.bg}"` : ''} ${opts.title ? `title="${esc(opts.title)}"` : ''}>
    <span class="av-base">${opts.base || p.avatar}</span>
    ${gl ? `<span class="av-glasses">${gl.emoji}</span>` : ''}
    ${hat ? `<span class="av-hat">${hat.emoji}</span>` : ''}
    ${pet ? `<span class="av-pet">${pet.emoji}</span>` : ''}
    ${fr && fr.sparkle ? '<span class="av-sparkle">✨</span>' : ''}
  </${tag}>`;
}

/* ---------- peniaze ---------- */
function fmtMoney(c) {
  const neg = c < 0;
  c = Math.abs(Math.round(c));
  return (neg ? '−' : '') + Math.floor(c / 100) + ',' + String(c % 100).padStart(2, '0') + ' €';
}
const DENOMS = [200, 100, 50, 20, 10, 5, 2, 1];
function coinBreakdown(c) {
  const out = [];
  for (const d of DENOMS) while (c >= d) { out.push(d); c -= d; }
  return out;
}
function coinHTML(d, extra = '') {
  const cls = d === 200 ? 'e2' : d === 100 ? 'e1' : d < 10 ? 'cu' : '';
  const lbl = d >= 100 ? (d / 100) + '€' : d + 'c';
  return `<span class="coin ${cls} ${extra}">${lbl}</span>`;
}
function coinsHTML(c, max = 10) {
  const list = coinBreakdown(c);
  return `<div class="coins-row">${list.slice(0, max).map(d => coinHTML(d)).join('')}${list.length > max ? '<span class="more">…</span>' : ''}</div>`;
}
function starsHTML(n, max = 3) {
  let s = '';
  for (let i = 1; i <= max; i++) s += `<span class="${i <= n ? 'on' : 'off'}">★</span>`;
  return `<span class="stars">${s}</span>`;
}

/* ---------- medaila (odznak) ---------- */
function medalHTML(b, opts = {}) {
  const locked = !!opts.locked;
  return `<div class="medal-wrap ${opts.big ? 'big' : ''} ${opts.anim ? 'spin-in' : ''}" style="--bc:${locked ? '#cfc8e0' : b.color}">
    <span class="ribbon l"></span><span class="ribbon r"></span>
    <div class="medal ${locked ? 'locked' : ''}"><span class="medal-pic">${locked ? emo('❔') : pic(b.e)}</span></div>
  </div>`;
}

/* ---------- toast ---------- */
function toast(msg, ms = 2300) {
  $$('.toast').forEach(t => t.remove());
  const t = el(`<div class="toast">${msg}</div>`);
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('out'), ms);
  setTimeout(() => t.remove(), ms + 500);
}

/* ---------- modálne okno ---------- */
const Modal = {
  open(html, opts = {}) {
    this.close();
    const back = el(`<div class="modal-back"><div class="modal ${opts.cls || ''}">${html}</div></div>`);
    $('#modal-root').appendChild(back);
    if (opts.dismiss) back.addEventListener('click', e => { if (e.target === back) this.close(); });
    return back.querySelector('.modal');
  },
  close() { $('#modal-root').innerHTML = ''; },
};

/* ---------- konfety ---------- */
const Confetti = {
  _id: 0,
  run(count = 150) {
    const cv = $('#confetti'), c = cv.getContext('2d');
    const dpr = window.devicePixelRatio || 1, W = innerWidth, H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cols = ['#ff5fa2', '#7c5cff', '#3fa9f5', '#2fc97a', '#ffc83d', '#ff9d3d', '#ff5d5d'];
    const ps = Array.from({ length: count }, () => ({
      x: W / 2 + rand(-80, 80), y: H * 0.38,
      vx: rand(-10, 10), vy: rand(-17, -6), g: rand(0.28, 0.42),
      s: rand(7, 12), r: rand(0, 6.28), vr: rand(-0.3, 0.3),
      col: cols[randInt(0, cols.length - 1)], sq: Math.random() < 0.6,
    }));
    const id = ++this._id, t0 = performance.now();
    const frame = (t) => {
      if (id !== this._id) return;
      c.clearRect(0, 0, W, H);
      let alive = false;
      for (const p of ps) {
        p.vy = Math.min(p.vy + p.g, 4.5);
        p.vx *= 0.985;
        p.x += p.vx + Math.sin((t + p.s * 100) / 300) * 0.6;
        p.y += p.vy;
        p.r += p.vr;
        if (p.y < H + 20) alive = true;
        c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.fillStyle = p.col;
        if (p.sq) c.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * 0.6);
        else { c.beginPath(); c.arc(0, 0, p.s / 2.3, 0, 6.28); c.fill(); }
        c.restore();
      }
      if (alive && t - t0 < 6000) requestAnimationFrame(frame);
      else c.clearRect(0, 0, W, H);
    };
    requestAnimationFrame(frame);
  },
};

/* ---------- horná lišta ---------- */
const Topbar = {
  shown: null,
  render() {
    const s = Store.state;
    if (this.shown == null) this.shown = s.wallet.balance;
    const onHome = ['', 'home'].includes(location.hash.replace(/^#\/?/, '').split('/')[0]);
    $('#topbar').innerHTML = `
      <button class="me" data-go="#/profile" title="Môj profil">
        ${avatarHTML()}<span class="me-name">${esc(s.profile.name)}</span>
      </button>
      <button class="map-btn${onHome ? ' on' : ''}" data-go="#/home" title="Domov – hlavná obrazovka"><span class="ic">🏠</span><span class="mb-txt">Domov</span></button>
      <div class="chips">
        <button class="chip chip-opt" data-go="#/profile" title="Koľko dní po sebe sa učíš"><span class="ic">🔥</span><b>${Store.currentStreak()}</b></button>
        <button class="chip chip-opt" data-go="#/profile/badges" title="Odznaky"><span class="ic">🏅</span><b>${Store.badgeCount()}</b></button>
        <button class="chip wallet" id="wallet-chip" data-go="#/profile/piggy" title="Pokladnička"><span class="ic">🐷</span><b id="wallet-val">${fmtMoney(this.shown)}</b></button>
        ${s.settings.shopEnabled ? '<button class="icon-btn shop-btn" data-go="#/shop" title="Obchod">🛍️</button>' : ''}
        <button class="icon-btn" id="fs-btn" title="Celá obrazovka">⛶</button>
        <button class="icon-btn" data-go="#/parent" title="Pre rodičov">⚙️</button>
      </div>`;
  },
  sync() {
    this.shown = Store.state.wallet.balance;
    const v = $('#wallet-val');
    if (v) v.textContent = fmtMoney(this.shown);
  },
  animate() {
    const target = Store.state.wallet.balance, start = this.shown == null ? target : this.shown;
    const t0 = performance.now(), dur = 900;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      this.shown = Math.round(start + (target - start) * k);
      const v = $('#wallet-val');
      if (v) v.textContent = fmtMoney(this.shown);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  },
  bump() {
    const w = $('#wallet-chip');
    if (!w) return;
    w.classList.remove('bump'); void w.offsetWidth; w.classList.add('bump');
  },
};

/* Mince preletia z miesta `fromEl` do pokladničky v hornej lište */
function flyCoins(fromEl, cents) {
  const target = $('#wallet-chip');
  if (!target || !fromEl || cents <= 0) { Topbar.sync(); return; }
  const fr = fromEl.getBoundingClientRect(), tr = target.getBoundingClientRect();
  const coins = coinBreakdown(cents).slice(0, 8);
  coins.forEach((d, i) => {
    const c = el(coinHTML(d, 'fly'));
    const x0 = fr.left + fr.width / 2 - 24 + rand(-40, 40), y0 = fr.top + fr.height / 2 - 24 + rand(-10, 10);
    c.style.left = x0 + 'px';
    c.style.top = y0 + 'px';
    document.body.appendChild(c);
    setTimeout(() => {
      c.style.transform = `translate(${tr.left + tr.width / 2 - 24 - x0}px, ${tr.top + tr.height / 2 - 24 - y0}px) scale(.45) rotate(360deg)`;
      c.style.opacity = '0.7';
    }, 60 + i * 150);
    setTimeout(() => { c.remove(); Sfx.play('coin'); Topbar.bump(); }, 930 + i * 150);
  });
  setTimeout(() => Topbar.animate(), 930);
}
