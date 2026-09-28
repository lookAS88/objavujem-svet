/* ==========================================================================
   Ukladanie postupu, pokladnička, obchod, odznaky, opakovanie chybičiek
   (rovnaký základ ako v aplikácii na angličtinu)
   Postup sa ukladá v prehliadači (localStorage). Keď je aplikácia spustená
   cez „Spustiť objavovanie.bat“, ukladá sa aj do súboru data/postup.json.
   Všetky sumy sú v CENTOCH (50 = 0,50 €).
   ========================================================================== */

const STORAGE_KEY = 'objavujem-svet-v1';

/* „Epocha“ dát: postup s inou epochou sa pri štarte ignoruje. Zvýšenie čísla = úplný reset. */
const DATA_EPOCH = 1;
function isCurrentEpoch(obj) { return !!obj && obj.epoch === DATA_EPOCH; }

/* Opakovanie v rozostupoch: po koľkých dňoch sa otázka znova zopakuje (podľa „škatuľky“ 0–5) */
const SRS_DAYS = [0, 1, 2, 4, 7, 14];

const DEFAULT_SETTINGS = {
  rewards: { star3: 50, star2: 20, star1: 10, learn: 10, lesson: 100, world: 200, daily: 10, practice: 10 },
  voiceSk: '', rate: 1,
  sfx: true, readInstr: true, readQ: true, unlockAll: false,
  shopEnabled: true,
};

function freshState() {
  return {
    v: 1, epoch: DATA_EPOCH, created: Date.now(), lastExport: 0,
    profile: { name: '', avatar: '🦄', equip: { hat: '', glasses: '', frame: '', pet: '' } },
    wallet: { balance: 0, total: 0, paid: 0, spent: 0, history: [] },
    shop: { owned: {} },
    progress: {}, badges: {}, known: {}, srs: {}, seenInstr: {},
    lastArea: '',
    stats: {
      correct: 0, wrong: 0, acts: 0, perfectMemory: 0, mapOk: 0, mathOk: 0, bigquiz3: 0,
      practiceDone: 0, practiceDay: '', practiceToday: 0,
      days: {}, streak: 0, bestStreak: 0, lastDay: '',
    },
    settings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS)),
    welcomed: false,
  };
}

function deepMerge(base, over) {
  for (const k in over) {
    const b = base[k], o = over[k];
    if (o && typeof o === 'object' && !Array.isArray(o) && b && typeof b === 'object' && !Array.isArray(b)) deepMerge(b, o);
    else base[k] = o;
  }
  return base;
}

function dayKey(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

/* postup uložený pod starším názvom aplikácie (kľúč „…-objavuje-v1“) – načíta sa raz a ďalej sa ukladá pod novým */
function legacyRaw() {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (/-objavuje-v1$/.test(k)) return localStorage.getItem(k);
    }
  } catch (e) { /* bez prístupu k úložisku */ }
  return null;
}

const Store = {
  state: null,
  storageOK: true,
  // lokálny server (server.ps1) beží len na tomto počítači; na webe (GitHub Pages) sa ukladá iba v prehliadači
  server: /^https?:$/.test(location.protocol) && /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname),
  web: location.protocol === 'https:',
  serverOK: false,
  _pushTimer: null,

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || legacyRaw();
      const saved = raw ? JSON.parse(raw) : null;
      if (isCurrentEpoch(saved)) this.state = deepMerge(freshState(), saved);
    } catch (e) {
      console.warn('Nepodarilo sa načítať postup', e);
    }
    if (!this.state) this.state = freshState();
  },

  _writeLocal() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      this.storageOK = true;
    } catch (e) {
      this.storageOK = false;
      console.warn('Nepodarilo sa uložiť postup', e);
    }
  },

  save() {
    this.state.savedAt = Date.now();
    this._writeLocal();
    if (this.server) {
      clearTimeout(this._pushTimer);
      this._pushTimer = setTimeout(() => this.pushServer(), 400);
    }
  },

  /* ---------- súbor v priečinku aplikácie (len cez server) ---------- */
  pushServer() {
    clearTimeout(this._pushTimer);
    this._pushTimer = null;
    return fetch('api/state', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(this.state) })
      .then(r => { this.serverOK = r.ok; })
      .catch(() => { this.serverOK = false; });
  },
  flushServer() {
    if (!this.server || !this._pushTimer) return;
    clearTimeout(this._pushTimer);
    this._pushTimer = null;
    const body = JSON.stringify(this.state);
    if (navigator.sendBeacon && body.length < 60000) navigator.sendBeacon('api/state', new Blob([body], { type: 'application/json' }));
    else this.pushServer();
  },
  async syncWithServer() {
    if (!this.server) return;
    try {
      const r = await fetch('api/state', { cache: 'no-store' });
      if (r.ok) {
        this.serverOK = true;
        const remote = await r.json();
        if (isCurrentEpoch(remote) && remote.profile && remote.wallet && (remote.savedAt || 0) > (this.state.savedAt || 0)) {
          this.state = deepMerge(freshState(), remote);
          this._writeLocal();
          return;
        }
      } else if (r.status === 404) {
        this.serverOK = true;
      } else return;
      if (this.state.savedAt) await this.pushServer();
    } catch (e) {
      this.serverOK = false;
    }
  },

  replace(obj) {
    this.state = deepMerge(freshState(), obj);
    this.state.epoch = DATA_EPOCH;
    this.save();
  },

  reset() {
    const keepSettings = this.state.settings;
    const keep = { name: this.state.profile.name, avatar: this.state.profile.avatar };
    this.state = freshState();
    this.state.settings = keepSettings;
    Object.assign(this.state.profile, keep);
    this.save();
  },

  /* ---------- lekcie ---------- */
  prog(id) { return this.state.progress[id] || null; },
  lp(id) { return this.state.progress[id] || (this.state.progress[id] = { acts: {}, done: false }); },
  isDone(id) { const p = this.state.progress[id]; return !!(p && p.done); },
  isUnlocked(L) {
    if (!L) return false;
    if (L.practice || L.index === 0 || this.state.settings.unlockAll) return true;
    return this.isDone(L.id) || (L.prev && this.isDone(L.prev.id));
  },
  actStars(L, idx) { const p = this.state.progress[L.id]; return p ? (p.acts[idx] || 0) : 0; },

  /* ---------- peniažky ---------- */
  addMoney(c, note) {
    if (!c) return;
    const w = this.state.wallet;
    w.balance += c;
    w.total += c;
    w.history.unshift({ t: Date.now(), a: c, n: note });
    if (w.history.length > 300) w.history.length = 300;
  },
  payout(c, note) {
    const w = this.state.wallet;
    c = Math.min(c, w.balance);
    if (c <= 0) return 0;
    w.balance -= c;
    w.paid += c;
    w.history.unshift({ t: Date.now(), a: -c, n: note || 'Vyplatené rodičom 💶' });
    this.save();
    return c;
  },

  /* ---------- obchod ---------- */
  owns(id) { return !!this.state.shop.owned[id]; },
  buy(item) {
    const w = this.state.wallet;
    if (this.owns(item.id) || w.balance < item.price) return null;
    w.balance -= item.price;
    w.spent += item.price;
    w.history.unshift({ t: Date.now(), a: -item.price, n: `Obchod: ${item.name} ${item.emoji || '🖼️'}` });
    this.state.shop.owned[item.id] = Date.now();
    this.state.profile.equip[item.cat] = item.id;
    const badges = [];
    if (this.award('shop1')) badges.push(getBadge('shop1'));
    this.save();
    return badges;
  },
  toggleEquip(item) {
    const eq = this.state.profile.equip;
    eq[item.cat] = eq[item.cat] === item.id ? '' : item.id;
    this.save();
  },

  /* ---------- odznaky & štatistiky ---------- */
  award(id) {
    if (this.state.badges[id]) return false;
    this.state.badges[id] = Date.now();
    return true;
  },
  badgeCount() { return Object.keys(this.state.badges).length; },
  markKnown(key) {
    if (!key) return;
    this.state.known[key] = (this.state.known[key] || 0) + 1;
  },
  knownCount() { return Object.keys(this.state.known).length; },
  totalStars() {
    let s = 0;
    for (const id in this.state.progress) {
      const L = LESSON_BY_ID[id];
      if (!L) continue;
      L.acts.forEach((a, i) => { if (a.type !== 'learn') s += (this.state.progress[id].acts[i] || 0); });
    }
    return s;
  },
  currentStreak() {
    const st = this.state.stats;
    return (st.lastDay === dayKey() || st.lastDay === dayKey(-1)) ? st.streak : 0;
  },
  todayCount() { return this.state.stats.days[dayKey()] || 0; },

  /* ---------- opakovanie chybičiek (spaced repetition) – kľúč = otázka ---------- */
  srsHit(key, ok, promote = true) {
    if (!key || !QREG[key]) return;
    const today = dayKey();
    const srs = this.state.srs;
    const e = srs[key] || (srs[key] = { b: 0, c: 0, w: 0, due: today });
    if (ok) {
      e.c++;
      if (promote && e.lp !== today) {
        e.b = Math.min(SRS_DAYS.length - 1, e.b + 1);
        e.lp = today;
        e.due = dayKey(SRS_DAYS[e.b]);
      }
    } else {
      e.w++;
      e.b = 0;
      e.due = today;
      e.lp = '';
      e.lw = Date.now();
    }
  },
  dueEntries() {
    const today = dayKey(), out = [];
    for (const key in this.state.srs) {
      const e = this.state.srs[key];
      if (e.due > today || !(e.w > 0)) continue;
      const q = QREG[key];
      if (!q || !this.isUnlocked(q.L)) continue;
      out.push({ key, e });
    }
    return out.sort((a, b) => (a.e.b - b.e.b) || (b.e.w - a.e.w) || (a.e.due < b.e.due ? -1 : 1));
  },
  practiceKeys(max = 8) { return this.dueEntries().slice(0, max).map(x => x.key); },
  dueCount() { return this.dueEntries().length; },
  isWeak(key) { const e = this.state.srs[key]; return !!(e && e.b === 0 && e.w > 0); },
  weakList(max = 15) {
    return Object.keys(this.state.srs)
      .map(key => ({ key, e: this.state.srs[key] }))
      .filter(x => x.e.w > 0 && QREG[x.key])
      .sort((a, b) => (b.e.w - b.e.c / 3) - (a.e.w - a.e.c / 3))
      .slice(0, max);
  },

  /* ---------- vyhodnotenie úlohy ---------- */
  _daily(out) {
    const s = this.state, R = s.settings.rewards, today = dayKey();
    if (s.stats.lastDay !== today) {
      s.stats.streak = (s.stats.lastDay === dayKey(-1)) ? s.stats.streak + 1 : 1;
      s.stats.lastDay = today;
      s.stats.bestStreak = Math.max(s.stats.bestStreak, s.stats.streak);
      if (R.daily > 0) {
        this.addMoney(R.daily, 'Denný bonus 🌞');
        out.earned.push({ a: R.daily, n: 'Denný bonus 🌞' });
      }
    }
    s.stats.days[today] = (s.stats.days[today] || 0) + 1;
  },
  _specials(out) {
    const s = this.state, st = s.stats, k = this.knownCount();
    const allAreas = AREAS.every(A => areaLessons(A.id).some(L => this.isDone(L.id)));
    [
      ['first', st.acts >= 1],
      ['streak3', st.streak >= 3],
      ['streak7', st.streak >= 7],
      ['allareas', allAreas],
      ['memory5', st.perfectMemory >= 5],
      ['map25', st.mapOk >= 25],
      ['math100', st.mathOk >= 100],
      ['quiz3', st.bigquiz3 >= 1],
      ['trainer5', st.practiceDone >= 5],
      ['know50', k >= 50],
      ['know100', k >= 100],
      ['know200', k >= 200],
      ['know400', k >= 400],
      ['know600', k >= 600],
      ['money5', s.wallet.total >= 500],
      ['money20', s.wallet.total >= 2000],
      ['money50', s.wallet.total >= 5000],
    ].forEach(([id, ok]) => { if (ok && this.award(id)) out.badges.push(getBadge(id)); });
  },

  recordActivity(L, idx, stars, meta = {}) {
    if (L.practice) return this.recordPractice(L, idx, stars);
    const s = this.state, R = s.settings.rewards;
    const act = L.acts[idx];
    const isLearn = act.type === 'learn';
    const p = this.lp(L.id);
    const prev = p.acts[idx] || 0;
    const val = n => isLearn ? (n ? R.learn : 0) : (n >= 3 ? R.star3 : n === 2 ? R.star2 : n === 1 ? R.star1 : 0);
    const earnedTask = Math.max(0, val(stars) - val(prev));
    p.acts[idx] = Math.max(prev, stars);
    s.lastArea = L.area;

    const out = { earned: [], badges: [], prev, stars, task: earnedTask, lessonDone: false };
    const gName = actName(act);

    if (earnedTask > 0) {
      this.addMoney(earnedTask, `${L.title}: ${gName} ${isLearn ? '' : '★'.repeat(stars)}`.trim());
      out.earned.push({ a: earnedTask, n: isLearn ? 'Za nové kartičky 📖' : `Za úlohu ${'★'.repeat(stars)}` });
    }

    s.stats.acts++;
    if (meta.memory && stars === 3) s.stats.perfectMemory++;
    if (meta.bigquiz && stars === 3) s.stats.bigquiz3++;
    this._daily(out);

    const req = reqIdx(L);
    if (!p.done && req.every(i => (p.acts[i] || 0) > 0)) {
      p.done = true;
      p.doneAt = Date.now();
      const bonus = L.review ? R.world : R.lesson;
      if (bonus > 0) {
        this.addMoney(bonus, `${L.title}: ${L.review ? 'celá oblasť hotová 🏆' : 'lekcia hotová 🎉'}`);
        out.earned.push({ a: bonus, n: L.review ? 'Bonus za celú oblasť 🏆' : 'Bonus za celú lekciu 🎉' });
      }
      out.lessonDone = true;
      if (this.award('L-' + L.id)) out.badges.push(lessonBadge(L));
    }
    if (p.done && !p.perfect && req.every(i => p.acts[i] === 3)) {
      p.perfect = true;
      if (this.award('perfect')) out.badges.push(getBadge('perfect'));
    }

    this._specials(out);
    this.save();
    return out;
  },

  /* tréning chybičiek: malá odmena, najviac 3× za deň */
  recordPractice(L, idx, stars) {
    const s = this.state, R = s.settings.rewards, st = s.stats;
    const out = { earned: [], badges: [], prev: 0, stars, task: 0, lessonDone: false, practice: true, limit: false };
    st.acts++;
    const today = dayKey();
    if (st.practiceDay !== today) { st.practiceDay = today; st.practiceToday = 0; }
    if (stars >= 2 && R.practice > 0) {
      if (st.practiceToday < 3) {
        st.practiceToday++;
        this.addMoney(R.practice, 'Tréning chybičiek 💪');
        out.earned.push({ a: R.practice, n: 'Za tréning 💪' });
        out.task = R.practice;
      } else out.limit = true;
    }
    if (idx === L.acts.length - 1) { st.practiceDone++; out.practiceDone = true; }
    this._daily(out);
    this._specials(out);
    this.save();
    return out;
  },
};
