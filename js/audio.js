/* ==========================================================================
   Zvuk: čítanie po slovensky (hlasy z Windows / prehliadača), zvukové efekty
   a jednoduché „hudobné nástroje“ generované priamo v prehliadači.
   ========================================================================== */

const Speech = {
  supported: 'speechSynthesis' in window,
  voices: [],
  bad: new Set(),
  current: null,
  onvoices: null,

  init() {
    if (!this.supported) return;
    const load = () => {
      this.voices = speechSynthesis.getVoices() || [];
      if (this.onvoices) this.onvoices();
    };
    load();
    if (speechSynthesis.addEventListener) speechSynthesis.addEventListener('voiceschanged', load);
    else speechSynthesis.onvoiceschanged = load;
  },

  usable(v) {
    if (this.bad.has(v.voiceURI)) return false;
    if (navigator.onLine === false && !v.localService) return false;
    return true;
  },
  scoreSk(v) {
    let s = /^sk/i.test(v.lang) ? 40 : /^cs/i.test(v.lang) ? 10 : 0;
    if (/natural/i.test(v.name)) s += 20;
    if (/viktoria/i.test(v.name)) s += 4;
    if (v.localService) s += 5;
    return s;
  },
  skVoices() { return this.voices.filter(v => /^(sk|cs)/i.test(v.lang)).sort((a, b) => this.scoreSk(b) - this.scoreSk(a)); },
  skVoice() {
    const list = this.voices.filter(v => /^(sk|cs)/i.test(v.lang) && this.usable(v));
    const pref = Store.state.settings.voiceSk;
    const p = pref && list.find(v => v.voiceURI === pref);
    if (p) return p;
    return list.sort((a, b) => this.scoreSk(b) - this.scoreSk(a))[0] || null;
  },
  hasSk() { return this.supported && !!this.skVoice(); },

  stop() { if (this.supported) speechSynthesis.cancel(); },

  /* Prečíta text po slovensky. Vráti Promise, ktorý sa splní po dočítaní. */
  say(text, opts = {}) {
    if (!this.supported || !text) return Promise.resolve();
    const v = this.skVoice();
    if (!v) return Promise.resolve();      // bez slovenského (českého) hlasu radšej ticho
    text = String(text).replace(/[\p{Extended_Pictographic}️‍]/gu, ' ').replace(/\s+/g, ' ').trim();
    if (!text) return Promise.resolve();
    return new Promise(resolve => {
      const u = new SpeechSynthesisUtterance(text);
      u.voice = v; u.lang = v.lang;
      u.rate = (opts.slow ? 0.7 : 1) * (Store.state.settings.rate || 1);
      let finished = false;
      const done = () => { if (!finished) { finished = true; resolve(); } };
      u.onend = done;
      u.onerror = (e) => {
        const err = (e && e.error) || '';
        if (!/interrupted|canceled/.test(err) && !opts._retry) {
          this.bad.add(v.voiceURI);
          finished = true;
          this.say(text, Object.assign({}, opts, { _retry: true })).then(resolve);
        } else done();
      };
      this.current = u;
      const go = () => speechSynthesis.speak(u);
      if (speechSynthesis.speaking || speechSynthesis.pending) {
        speechSynthesis.cancel();
        setTimeout(go, 70);
      } else go();
      setTimeout(done, 2000 + text.length * 90);
    });
  },
};

const Sfx = {
  ctx: null,

  ac() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try { this.ctx = new AC(); } catch (e) { return null; }
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },

  tone(f, t, d, type = 'sine', vol = 0.18, f2) {
    const c = this.ctx;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + d + 0.05);
  },

  noise(t, d, vol = 0.25, freq = 1800, type = 'bandpass') {
    const c = this.ctx;
    const len = Math.floor(c.sampleRate * d);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = c.createBufferSource(), g = c.createGain(), f = c.createBiquadFilter();
    f.type = type; f.frequency.value = freq;
    src.buffer = buf; g.gain.value = vol;
    src.connect(f); f.connect(g); g.connect(c.destination);
    src.start(t);
  },

  play(name, force = false) {
    if (!Store.state.settings.sfx && !force) return;
    const c = this.ac();
    if (!c) return;
    const t = c.currentTime + 0.01;
    switch (name) {
      case 'good':  this.tone(784, t, 0.12, 'triangle', 0.2); this.tone(1175, t + 0.09, 0.22, 'triangle', 0.2); break;
      case 'bad':   this.tone(330, t, 0.16, 'triangle', 0.18, 250); this.tone(250, t + 0.14, 0.22, 'triangle', 0.18, 180); break;
      case 'coin':  this.tone(988, t, 0.07, 'square', 0.05); this.tone(1319, t + 0.06, 0.22, 'square', 0.05); break;
      case 'pop':   this.noise(t, 0.12, 0.35); this.tone(500, t, 0.08, 'sine', 0.15, 1100); break;
      case 'flip':  this.tone(520, t, 0.06, 'triangle', 0.08, 760); break;
      case 'click': this.tone(660, t, 0.05, 'triangle', 0.1); break;
      case 'drop':  this.tone(440, t, 0.08, 'sine', 0.16, 880); this.tone(880, t + 0.07, 0.12, 'triangle', 0.1); break;
      case 'star':  this.tone(1319, t, 0.18, 'triangle', 0.14); this.tone(1760, t + 0.06, 0.2, 'sine', 0.08); break;
      case 'ring':  for (let i = 0; i < 4; i++) { this.tone(440, t + i * 0.5, 0.35, 'sine', 0.12); this.tone(480, t + i * 0.5, 0.35, 'sine', 0.1); } break;
      case 'win':
        [523, 659, 784, 1047].forEach((f, i) => this.tone(f, t + i * 0.11, 0.28, 'triangle', 0.17));
        this.tone(1319, t + 0.48, 0.5, 'triangle', 0.14);
        break;
      case 'badge':
        [784, 988, 1175, 1568, 1976].forEach((f, i) => this.tone(f, t + i * 0.09, 0.35, 'triangle', 0.14));
        [2349, 2637, 3136].forEach((f, i) => this.tone(f, t + 0.55 + i * 0.07, 0.25, 'sine', 0.05));
        break;
      case 'buy':
        [1047, 1319, 1568].forEach((f, i) => this.tone(f, t + i * 0.08, 0.2, 'square', 0.05));
        break;
    }
  },

  /* ---------- hudobné nástroje (krátka melódia) ---------- */
  instrument(name) {
    const c = this.ac();
    if (!c) return;
    const t0 = c.currentTime + 0.05;
    const mel = [523, 659, 784, 1047];                               // C E G C
    const env = (g, t, a, d, vol, sus = 0.0001) => {
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + a);
      g.gain.exponentialRampToValueAtTime(Math.max(sus, 0.0001), t + a + d);
    };
    const voice = (f, t, dur, o) => {
      const osc = c.createOscillator(), g = c.createGain(), flt = c.createBiquadFilter();
      osc.type = o.type || 'sine';
      osc.frequency.setValueAtTime(f, t);
      if (o.vib) {
        const lfo = c.createOscillator(), lg = c.createGain();
        lfo.frequency.value = o.vib; lg.gain.value = f * 0.012;
        lfo.connect(lg); lg.connect(osc.frequency); lfo.start(t); lfo.stop(t + dur + 0.3);
      }
      flt.type = 'lowpass'; flt.frequency.value = o.cut || 4000; flt.Q.value = o.q || 0.7;
      osc.connect(flt); flt.connect(g); g.connect(c.destination);
      if (o.pluck) env(g, t, 0.005, dur, o.vol || 0.3);
      else {
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(o.vol || 0.2, t + (o.att || 0.05));
        g.gain.setValueAtTime(o.vol || 0.2, t + dur - 0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur + (o.rel || 0.12));
      }
      osc.start(t); osc.stop(t + dur + 0.4);
    };
    switch (name) {
      case 'violin':   mel.forEach((f, i) => voice(f, t0 + i * 0.42, 0.4, { type: 'sawtooth', vib: 5.5, cut: 2600, att: 0.12, vol: 0.12 })); break;
      case 'flute':    mel.forEach((f, i) => { voice(f * 2, t0 + i * 0.4, 0.36, { type: 'sine', vib: 4.5, att: 0.08, vol: 0.2 }); this.noise(t0 + i * 0.4, 0.3, 0.03, 3000); }); break;
      case 'fujara':   [392, 523, 659, 784, 659].forEach((f, i) => { voice(f / 2, t0 + i * 0.5, 0.46, { type: 'triangle', vib: 4, att: 0.15, vol: 0.22, cut: 1400 }); this.noise(t0 + i * 0.5, 0.4, 0.05, 900); }); break;
      case 'trumpet':  [523, 523, 659, 784].forEach((f, i) => voice(f, t0 + i * 0.3, i === 3 ? 0.6 : 0.24, { type: 'sawtooth', cut: 3200, q: 3, att: 0.03, vol: 0.13 })); break;
      case 'accordion':[523, 659, 784].forEach((f, i) => { voice(f, t0 + i * 0.45, 0.42, { type: 'square', vib: 6, cut: 2200, vol: 0.07 }); voice(f * 1.005, t0 + i * 0.45, 0.42, { type: 'square', cut: 2200, vol: 0.06 }); }); break;
      case 'piano':    mel.forEach((f, i) => { voice(f, t0 + i * 0.35, 1.0, { type: 'triangle', pluck: true, vol: 0.3 }); voice(f * 2, t0 + i * 0.35, 0.5, { type: 'sine', pluck: true, vol: 0.08 }); }); break;
      case 'guitar':   [262, 330, 392, 523, 392, 330].forEach((f, i) => this.pluck(f, t0 + i * 0.22)); break;
      case 'xylo':     [1047, 1175, 1319, 1568, 1319].forEach((f, i) => { voice(f, t0 + i * 0.22, 0.3, { type: 'sine', pluck: true, vol: 0.35 }); voice(f * 3.9, t0 + i * 0.22, 0.06, { type: 'sine', pluck: true, vol: 0.05 }); }); break;
      case 'triangle': [0, 0.6, 1.2].forEach(d => [2637, 3951, 5274].forEach((f, k) => voice(f, t0 + d, 1.1, { type: 'sine', pluck: true, vol: [0.12, 0.05, 0.03][k] }))); break;
      case 'drum':
        [0, 0.3, 0.6, 0.75, 0.9].forEach((d, i) => {
          const o = c.createOscillator(), g = c.createGain();
          o.frequency.setValueAtTime(i % 2 ? 180 : 120, t0 + d);
          o.frequency.exponentialRampToValueAtTime(45, t0 + d + 0.25);
          env(g, t0 + d, 0.005, 0.3, 0.6);
          o.connect(g); g.connect(c.destination); o.start(t0 + d); o.stop(t0 + d + 0.4);
          this.noise(t0 + d, 0.08, 0.15, 800, 'lowpass');
        });
        break;
    }
  },
  /* Karplus–Strong: brnknutie struny */
  pluck(f, t) {
    const c = this.ctx, sr = c.sampleRate, N = Math.round(sr / f), len = Math.floor(sr * 1.2);
    const buf = c.createBuffer(1, len, sr), d = buf.getChannelData(0);
    for (let i = 0; i < N; i++) d[i] = Math.random() * 2 - 1;
    for (let i = N; i < len; i++) d[i] = 0.996 * 0.5 * (d[i - N] + d[i - N + 1 < i ? i - N + 1 : i - N]);
    const src = c.createBufferSource(), g = c.createGain();
    src.buffer = buf; g.gain.value = 0.35;
    src.connect(g); g.connect(c.destination);
    src.start(t);
  },
};
