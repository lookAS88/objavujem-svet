/* ==========================================================================
   Efekty pri ťuknutí: jemný krúžok s iskričkami pri každom ťuknutí,
   ohňostroj hviezdičiek pri správnej odpovedi a červený „bubliňák“ pri chybe.
   Napája sa na zvuky (Sfx.play), takže funguje vo všetkých hrách naraz.
   ========================================================================== */
const TapFx = {
  last: null,
  layerEl: null,
  reduced: false,
  TAP_SEL: 'button, [data-go], [data-locked], .rg, .pt, .ocean, .river.target, .mcard, .otile, .balloon, .dg-pt, .nl-svg, .sort-item, .chip, .card-chip, input[type=checkbox]',
  GOOD: ['#ffc83d', '#ff5fa2', '#7c5cff', '#2fc97a', '#3fa9f5', '#ff9d3d'],

  init() {
    this.reduced = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
    document.addEventListener('pointerdown', e => {
      this.last = { x: e.clientX, y: e.clientY, t: performance.now() };
      if (this.reduced) return;
      const t = e.target.closest(this.TAP_SEL);
      if (!t || t.disabled) return;
      this.ripple(e.clientX, e.clientY);
    }, { capture: true, passive: true });
    // napojenie na zvuky: dobre → ohňostroj, zle → červený krúžok
    const play = Sfx.play.bind(Sfx);
    Sfx.play = (name, ...rest) => {
      try { if (name === 'good') this.good(); else if (name === 'bad') this.bad(); } catch (e) { /* efekty nesmú pokaziť hru */ }
      return play(name, ...rest);
    };
  },

  layer() {
    if (!this.layerEl || !this.layerEl.isConnected) {
      this.layerEl = document.createElement('div');
      this.layerEl.className = 'fx-layer';
      document.body.appendChild(this.layerEl);
    }
    return this.layerEl;
  },
  /* miesto posledného ťuknutia (ak bolo pred chvíľou) */
  spot(maxAge = 1500) {
    const l = this.last;
    return l && performance.now() - l.t < maxAge ? l : null;
  },
  add(cls, x, y, html = '') {
    const d = document.createElement('div');
    d.className = cls;
    d.style.left = x + 'px';
    d.style.top = y + 'px';
    d.innerHTML = html;
    this.layer().appendChild(d);
    return d;
  },

  ripple(x, y) {
    const r = this.add('fx-ring', x, y);
    setTimeout(() => r.remove(), 520);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + Math.random() * .5, dist = 26 + Math.random() * 14;
      const s = this.add('fx-spark', x, y);
      s.style.background = this.GOOD[i % this.GOOD.length];
      s.animate([
        { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(a) * dist}px), calc(-50% + ${Math.sin(a) * dist}px)) scale(.2)`, opacity: 0 },
      ], { duration: 420, easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = () => s.remove();
    }
  },

  good() {
    const p = this.spot();
    if (!p || this.reduced) return;
    const glow = this.add('fx-glow', p.x, p.y);
    setTimeout(() => glow.remove(), 700);
    const shapes = ['★', '✦', '❤', '●', '★', '✿'];
    for (let i = 0; i < 16; i++) {
      const a = Math.random() * Math.PI * 2, v = 70 + Math.random() * 90;
      const dx = Math.cos(a) * v, dy = Math.sin(a) * v - 40;
      const el = this.add('fx-bit', p.x, p.y, shapes[i % shapes.length]);
      el.style.color = this.GOOD[i % this.GOOD.length];
      el.style.fontSize = (14 + Math.random() * 14) + 'px';
      const rot = (Math.random() - .5) * 540;
      el.animate([
        { transform: 'translate(-50%,-50%) scale(.3) rotate(0deg)', opacity: 1 },
        { transform: `translate(calc(-50% + ${dx * .7}px), calc(-50% + ${dy * .7}px)) scale(1.15) rotate(${rot * .6}deg)`, opacity: 1, offset: .55 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy + 70}px)) scale(.6) rotate(${rot}deg)`, opacity: 0 },
      ], { duration: 900 + Math.random() * 300, easing: 'cubic-bezier(.15,.8,.35,1)' }).onfinish = () => el.remove();
    }
  },

  bad() {
    const p = this.spot();
    if (!p || this.reduced) return;
    const r = this.add('fx-ring bad', p.x, p.y);
    setTimeout(() => r.remove(), 620);
    const x = this.add('fx-no', p.x, p.y, '✕');
    x.animate([
      { transform: 'translate(-50%,-50%) scale(.4)', opacity: 0 },
      { transform: 'translate(-50%,-70%) scale(1.1)', opacity: 1, offset: .3 },
      { transform: 'translate(-50%,-120%) scale(.9)', opacity: 0 },
    ], { duration: 700, easing: 'ease-out' }).onfinish = () => x.remove();
  },
};
