/* ==========================================================================
   Zväčšenie obrázka: ťuknutím na fotku (s 🔍) sa otvorí na celú obrazovku.
   Priblíženie: ➕ ➖, dvojité ťuknutie, dva prsty alebo koliesko myši; posun ťahaním.
   Najprv sa ukáže bežná fotka (hneď), potom sa vymení za ostrú veľkú verziu (img/foto/velke).
   ========================================================================== */

/* ktorú časť obrázka zväčšiť: fotka, planéta alebo „mapa“ tela; z dvojice/radu prvú fotku */
function zoomSpec(spec) {
  if (!spec) return null;
  spec = String(spec);
  const m = /^(pair|row):(.*)$/.exec(spec);
  if (m) { for (const part of m[2].split('|')) { const z = zoomSpec(part); if (z) return z; } return null; }
  if (/^foto:/.test(spec)) return fotoOf(spec.slice(5)) ? spec : null;
  if (/^flag:[a-z]{2}$/.test(spec)) return spec;
  if (/^planet:/.test(spec)) return fotoOf(PLANET_FOTO[spec.slice(7)]) ? spec : null;
  if (/^board:/.test(spec)) { const [, b] = spec.split(':'); return CUSTOM_BOARDS[b] && CUSTOM_BOARDS[b].photo ? spec : null; }
  return null;
}
/* obrázok, na ktorý sa dá ťuknúť a zväčšiť ho; title = čo sa ukáže nad fotkou (v hrách prázdne, aby neprezradilo odpoveď) */
function zoomable(spec, html, title = '') {
  const z = zoomSpec(spec);
  if (!z) return html;
  return `<span class="zoomable" data-zoom="${esc(z)}" data-title="${esc(title)}" role="button" tabindex="0" aria-label="Zväčšiť obrázok">${html}<span class="zoom-badge" aria-hidden="true">🔍</span></span>`;
}

const Zoom = {
  el: null,
  st: null,

  /* údaje o obrázku: { html, big, w, h, credit } */
  source(spec) {
    const [kind, a, b] = spec.split(':');
    const fotoData = slug => {
      const F = fotoOf(slug);
      const src = F.b ? `img/foto/velke/${F.f.replace(/\.png$/, '.jpg')}` : null;
      const w = F.b ? F.b[0] : F.w, h = F.b ? F.b[1] : F.h;
      return { html: `<img class="zoom-img" src="img/foto/${F.f}" alt="" draggable="false">`, big: src, w, h, credit: [F.a, F.l].filter(Boolean).join(', '), dark: slug.startsWith('planeta-') || slug === 'mesiac' };
    };
    if (kind === 'foto') return fotoData(a);
    if (kind === 'flag') return { html: `<img class="zoom-img zoom-flag" src="img/flags/${a}.svg" alt="" draggable="false">`, big: null, vector: true, w: 960, h: 720, credit: 'flag-icons (MIT)' };
    if (kind === 'planet') return fotoData(PLANET_FOTO[a]);
    if (kind === 'board') {
      const C = CUSTOM_BOARDS[a];
      const shapes = (C.shapes[b] || []).map(sh => shapeSVG(sh, 'hl')).join('');
      return {
        html: `<svg class="zoom-img zoom-svg" viewBox="0 0 ${C.w} ${C.h}" width="${C.w}" height="${C.h}"><image href="img/foto/${C.photo}" x="0" y="0" width="${C.w}" height="${C.h}"/><g class="hl-g" style="stroke-width:${(C.w / 120).toFixed(1)}">${shapes}</g></svg>`,
        big: C.big ? `img/foto/velke/${C.photo}` : null, w: C.w, h: C.h, credit: C.credit ? [C.credit.author, C.credit.license].filter(Boolean).join(', ') : '',
      };
    }
    return null;
  },

  open(spec, title = '') {
    const S = this.source(spec);
    if (!S) return;
    this.close();
    Sfx.play('flip');
    const el = document.createElement('div');
    el.className = 'zoom-ov' + (S.dark ? ' dark' : '');
    el.innerHTML = `
      <div class="zoom-stage"><div class="zoom-move">${S.html}</div></div>
      <div class="zoom-top">
        ${title ? `<div class="zoom-title">${esc(cap(title))}${Speech.supported ? ` <button class="zoom-say" data-sk="${esc(cap(title))}" title="Prečítať">🔊</button>` : ''}</div>` : '<div></div>'}
        <button class="zoom-x" title="Zavrieť">✕</button>
      </div>
      <div class="zoom-tools">
        <button class="zoom-b" data-z="-1" title="Oddialiť">➖</button>
        <button class="zoom-b" data-z="0" title="Celý obrázok">⤢</button>
        <button class="zoom-b" data-z="1" title="Priblížiť">➕</button>
      </div>
      ${S.credit ? `<div class="zoom-credit">Foto: ${esc(S.credit)}</div>` : ''}`;
    document.body.appendChild(el);
    this.el = el;
    const stage = $('.zoom-stage', el), mover = $('.zoom-move', el), img = $('.zoom-img', el);
    const st = this.st = { s: 1, x: 0, y: 0, base: 1, w: S.w, h: S.h, lowres: !S.big && !S.vector, stage, mover, img, pointers: new Map(), moved: 0 };
    // základná veľkosť: celý obrázok na obrazovku (malé obrázky sa nezväčšia viac než 2×, aby neboli rozmazané)
    const fit = () => {
      const r = stage.getBoundingClientRect();
      st.base = Math.min(r.width / st.w, r.height / st.h, 2.2);
      this.set(st.s, st.x, st.y);
    };
    fit();
    st.onResize = fit;
    window.addEventListener('resize', fit);
    // ostrá veľká verzia
    if (S.big) {
      const big = new Image();
      big.onload = () => {
        if (this.el !== el) return;
        if (img.tagName === 'IMG') img.src = S.big; else $('image', img).setAttribute('href', S.big);   // SVG: rovnaké súradnice, len ostrejšia fotka
      };
      big.src = S.big;
    }
    void el.offsetWidth;                                               // prechod (fade-in) aj bez čakania na ďalší snímok
    el.classList.add('on');

    $('.zoom-x', el).onclick = () => this.close();
    $$('.zoom-b', el).forEach(b => b.onclick = () => {
      const z = +b.dataset.z;
      if (z === 0) this.set(1, 0, 0, true);
      else this.zoomAt(z > 0 ? 1.6 : 1 / 1.6);
    });
    // ťuknutie vedľa obrázka zavrie; dvojité ťuknutie na obrázok priblíži / vráti späť (myš aj prst)
    const onTap = e => {
      const ir = img.getBoundingClientRect();                         // podľa súradníc (pri „pointer capture“ je cieľom vždy plocha)
      const onImg = e.clientX >= ir.left && e.clientX <= ir.right && e.clientY >= ir.top && e.clientY <= ir.bottom;
      if (!onImg) { if (st.s <= 1.01) this.close(); return; }
      const now = performance.now();
      if (st.lastTap && now - st.lastTap.t < 330 && Math.hypot(e.clientX - st.lastTap.x, e.clientY - st.lastTap.y) < 40) {
        st.lastTap = null;
        if (st.s > 1.3) this.set(1, 0, 0, true); else this.zoomAt(2.5, e.clientX, e.clientY, true);
      } else st.lastTap = { t: now, x: e.clientX, y: e.clientY };
    };
    stage.addEventListener('wheel', e => { e.preventDefault(); this.zoomAt(e.deltaY < 0 ? 1.18 : 1 / 1.18, e.clientX, e.clientY); }, { passive: false });
    stage.addEventListener('pointerdown', e => {
      stage.setPointerCapture(e.pointerId);
      st.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (st.pointers.size === 1) st.moved = 0;
      st.last = this.gesture();
    });
    stage.addEventListener('pointermove', e => {
      if (!st.pointers.has(e.pointerId)) return;
      st.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const g = this.gesture(), l = st.last;
      if (!l || g.n !== l.n) { st.last = g; return; }
      st.moved += Math.abs(g.x - l.x) + Math.abs(g.y - l.y);
      if (g.n === 2 && l.d > 0) this.zoomAt(g.d / l.d, g.x, g.y);             // dva prsty: priblíženie
      if (st.s > 1.01 || g.n === 2) this.set(st.s, st.x + g.x - l.x, st.y + g.y - l.y);   // posun
      st.last = g;
    });
    const up = e => {
      const was = st.pointers.size;
      st.pointers.delete(e.pointerId); st.last = this.gesture();
      if (e.type === 'pointerup' && was === 1 && st.moved < 8) onTap(e);
    };
    stage.addEventListener('pointerup', up);
    stage.addEventListener('pointercancel', up);
    this.onKey = e => {
      if (e.key === 'Escape') { e.stopPropagation(); this.close(); }
      else if (e.key === '+' || e.key === '=') this.zoomAt(1.4);
      else if (e.key === '-') this.zoomAt(1 / 1.4);
    };
    document.addEventListener('keydown', this.onKey, true);
  },

  gesture() {
    const p = [...this.st.pointers.values()];
    if (!p.length) return null;
    const x = p.reduce((s, q) => s + q.x, 0) / p.length, y = p.reduce((s, q) => s + q.y, 0) / p.length;
    const d = p.length > 1 ? Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) : 0;
    return { n: p.length, x, y, d };
  },

  /* priblíženie okolo bodu (štandardne stred obrazovky) */
  zoomAt(k, cx, cy, anim) {
    const st = this.st;
    if (!st) return;
    const r = st.stage.getBoundingClientRect();
    if (cx == null) { cx = r.left + r.width / 2; cy = r.top + r.height / 2; }
    const s = Math.min(Math.max(st.s * k, 1), this.maxScale());
    const f = s / st.s;
    const ox = cx - (r.left + r.width / 2), oy = cy - (r.top + r.height / 2);
    this.set(s, ox - (ox - st.x) * f, oy - (oy - st.y) * f, anim);
  },
  /* najviac toľko, aby sa veľká fotka zobrazovala zhruba 1:1,5 (ostrá), ale aspoň 3×;
     fotka bez veľkej verzie len do 1:2, aby sa nerozpadla na štvorčeky */
  maxScale() { const st = this.st; return st.lowres ? Math.max(1.5, 2 / st.base) : Math.max(3, 1.5 / st.base); },

  set(s, x, y, anim) {
    const st = this.st;
    const r = st.stage.getBoundingClientRect();
    const w = st.w * st.base * s, h = st.h * st.base * s;
    const mx = Math.max(0, (w - r.width) / 2 + r.width * .15), my = Math.max(0, (h - r.height) / 2 + r.height * .15);
    st.s = s;
    st.x = s <= 1.001 ? 0 : Math.min(mx, Math.max(-mx, x));
    st.y = s <= 1.001 ? 0 : Math.min(my, Math.max(-my, y));
    this.apply(anim);
  },
  /* obrázok sa naozaj vykreslí v priblíženej veľkosti (nie roztiahnutím cez scale) – preto je ostrý */
  apply(anim) {
    const st = this.st;
    const tr = anim ? '.25s ease' : '';
    st.mover.style.transition = tr ? 'transform ' + tr : 'none';
    st.img.style.transition = tr ? `width ${tr}, height ${tr}` : 'none';
    st.img.style.width = (st.w * st.base * st.s) + 'px';
    st.img.style.height = (st.h * st.base * st.s) + 'px';
    st.mover.style.transform = `translate(${st.x}px, ${st.y}px)`;
    this.el.classList.toggle('zoomed', st.s > 1.01);
  },

  close() {
    if (!this.el) return;
    const el = this.el;
    this.el = null;
    if (this.st && this.st.onResize) window.removeEventListener('resize', this.st.onResize);
    document.removeEventListener('keydown', this.onKey, true);
    this.st = null;
    el.classList.remove('on');
    setTimeout(() => el.remove(), 200);
  },
};

/* ťuknutie na zväčšiteľný obrázok kdekoľvek v aplikácii */
document.addEventListener('click', e => {
  const z = e.target.closest('.zoomable');
  if (!z || !z.dataset.zoom) return;
  e.stopPropagation();
  Zoom.open(z.dataset.zoom, z.dataset.title || '');
});
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('zoomable')) { e.preventDefault(); Zoom.open(e.target.dataset.zoom, e.target.dataset.title || ''); }
});
