/* ==========================================================================
   Aplikácia: obrazovky, navigácia, vyhodnotenie úloh, obchod, tréning,
   diplomy, encyklopédia a rodičovská zóna
   ========================================================================== */

const AVATARS = ['🦄', '🐱', '🐰', '🦊', '🐼', '🐨', '🐸', '🦋', '🐬', '🐯', '👸', '🧚‍♀️', '🐹', '🦁', '🐧', '🌸'];
const MONTHS = ['januára', 'februára', 'marca', 'apríla', 'mája', 'júna', 'júla', 'augusta', 'septembra', 'októbra', 'novembra', 'decembra'];
const FOX = '🦊';

function areaOf(L) { return AREA_BY_ID[L.area]; }
function areaVars(A) { return `--wc:${A.color};--wd:${A.dark};--wb:${A.bg}`; }
function plural(n, one, few, many) { return n === 1 ? one : (n >= 2 && n <= 4) ? few : many; }
function fmtDate(t) { const d = new Date(t); return `${d.getDate()}. ${d.getMonth() + 1}.`; }
function fmtDateLong(t) { const d = new Date(t); return `${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; }
function fmtDateTime(t) { const d = new Date(t); return `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`; }
function stripEmoji(s) { return String(s).replace(/\p{Extended_Pictographic}|️|‍/gu, '').replace(/\s+/g, ' ').trim(); }

function actsDone(L) {
  const p = Store.prog(L.id);
  return p ? reqIdx(L).filter(i => (p.acts[i] || 0) > 0).length : 0;
}
function firstUndone(L) {
  const i = L.acts.findIndex((a, k) => !Store.actStars(L, k));
  return i < 0 ? null : i;
}
function nextActIdx(L, idx) {
  if (L.practice) return idx + 1 < L.acts.length ? idx + 1 : null;
  const n = L.acts.length;
  for (let k = 1; k < n; k++) {
    const j = (idx + k) % n;
    if (!Store.actStars(L, j)) return j;
  }
  return idx + 1 < n ? idx + 1 : null;
}
function lessonStars(L) {
  const v = reqIdx(L).map(i => Store.actStars(L, i));
  if (!v.every(x => x > 0)) return 0;
  if (v.every(x => x === 3)) return 3;
  return v.reduce((a, b) => a + b, 0) / v.length >= 2 ? 2 : 1;
}
function lessonStarSum(L) {
  return L.acts.reduce((a, act, i) => a + (act.type === 'learn' ? 0 : Store.actStars(L, i)), 0);
}
function areaDone(aid) { const R = areaReview(aid); return !!R && Store.isDone(R.id); }
function areaCurrent(aid) {
  const ls = areaLessons(aid);
  return ls.find(L => Store.isUnlocked(L) && !Store.isDone(L.id)) || null;
}
function currentLesson() {
  const s = Store.state;
  const order = [s.lastArea].concat(AREAS.map(A => A.id)).filter(Boolean);
  for (const a of order) { const L = areaCurrent(a); if (L) return L; }
  return LESSONS[0];
}
function calcStars(m, t) {
  if (m <= Math.max(1, Math.round(t * 0.15))) return 3;
  if (m <= Math.max(2, Math.round(t * 0.45))) return 2;
  return 1;
}
function rankTitle() {
  const d = LESSONS.filter(L => Store.isDone(L.id)).length;
  if (d >= LESSONS.length) return '👑 Kráľovná vedomostí';
  if (d >= 35) return '💎 Pani profesorka';
  if (d >= 20) return '🌟 Veľká objaviteľka';
  if (d >= 10) return '⭐ Múdra hlavička';
  if (d >= 3) return '🌱 Zvedavá žiačka';
  return '🐣 Malá objaviteľka';
}
/* zaujímavosť dňa – každý deň iná */
function factOfDay(offset = 0) {
  const all = LESSONS.flatMap(L => (L.items || []).filter(it => it.f && it.f.length > 30).map(it => ({ it, L })));
  let h = 7;
  for (const ch of dayKey()) h = (h * 31 + ch.charCodeAt(0)) % 100003;
  return all[(h + offset * 17) % all.length];
}

/* ======================================================================== */
const App = {
  cleanup: () => {},
  parentOK: false,
  practice: null,
  shopCat: 'hat',
  factShift: 0,

  route() {
    try { this.cleanup(); } catch (e) { console.warn(e); }
    this.cleanup = () => {};
    Speech.onvoices = null;
    Modal.close();
    Zoom.close();
    Speech.stop();
    const parts = (location.hash.replace(/^#\/?/, '') || 'home').split('/');
    Topbar.shown = Store.state.wallet.balance;
    Topbar.render();
    window.scrollTo(0, 0);
    switch (parts[0]) {
      case 'area':     renderArea(parts[1]); break;
      case 'lesson':   renderLesson(LESSON_BY_ID[parts[1]]); break;
      case 'play': {
        const L = parts[1] === 'practice' ? (App.practice || (App.practice = buildPractice())) : LESSON_BY_ID[parts[1]];
        runActivity(L, parseInt(parts[2], 10));
        break;
      }
      case 'practice': renderPractice(); break;
      case 'shop':     renderShop(); break;
      case 'diploma':  renderDiploma(parts[1]); break;
      case 'profile':  renderProfile(parts[1]); break;
      case 'book':     renderBook(parts[1]); break;
      case 'parent':   renderParent(); break;
      default:         renderHome();
    }
  },
};

/* ============================== DOMOV ============================== */
function renderHome() {
  const s = Store.state, cur = currentLesson();
  const today = Store.todayCount();
  const due = Store.dueCount();
  const sub = today
    ? `Dnes si už zvládla ${today} ${plural(today, 'úlohu', 'úlohy', 'úloh')}. Si super! 💪`
    : 'Čo dnes objavíme? Vyber si oblasť!';
  const fd = factOfDay(App.factShift);
  $('#app').innerHTML = `
    <div class="screen-in">
      <section class="hello-card card">
        <div class="owl bob">${FOX}</div>
        <div class="hello-text">
          <div class="hello-title">Ahoj${s.profile.name ? ', ' + esc(s.profile.name) : ''}! 👋</div>
          <div class="hello-sub">${sub}</div>
        </div>
        <button class="btn pink big" data-go="#/lesson/${cur.id}">▶ ${esc(cur.title)}</button>
      </section>
      ${due ? `
        <section class="practice-card card">
          <span class="pc-ic emo">💪</span>
          <div class="pc-text">
            <div class="pc-title">Tréning chybičiek</div>
            <div class="pc-sub">${Math.min(due, 8)} ${plural(Math.min(due, 8), 'otázka čaká', 'otázky čakajú', 'otázok čaká')} na zopakovanie</div>
          </div>
          <button class="btn orange" data-go="#/practice">Trénovať</button>
        </section>` : ''}
      ${fd ? `
        <section class="fact-card card">
          <div class="fc-pic">${zoomable(fd.it.p, pic(fd.it.p), fd.it.n)}</div>
          <div class="fc-text">
            <div class="fc-title">💡 Vedela si, že…?</div>
            <div class="fc-fact"><b>${esc(cap(fd.it.n))}:</b> ${esc(fd.it.f)}</div>
          </div>
          <div class="fc-btns">${sayBtn(cap(fd.it.n) + '. ' + fd.it.f, 'round-btn')}<button class="round-btn fc-more" title="Ďalšia zaujímavosť">🔄</button></div>
        </section>` : ''}
      <h2 class="section-title">🗺️ Kam sa vyberieme?</h2>
      <div class="areas">${AREAS.map(areaCardHTML).join('')}</div>
      <div class="home-foot">
        <button class="btn ghost" data-go="#/book">📚 Moja encyklopédia</button>
        <button class="btn ghost" data-go="#/profile">🏅 Moje odznaky</button>
        ${s.settings.shopEnabled ? '<button class="btn ghost" data-go="#/shop">🛍️ Obchod</button>' : ''}
      </div>
    </div>`;
  const more = $('.fc-more');
  if (more) more.onclick = () => { App.factShift++; Sfx.play('flip'); renderHome(); };
}

function areaCardHTML(A) {
  const ls = areaLessons(A.id);
  const done = ls.filter(L => Store.isDone(L.id)).length;
  const cur = areaCurrent(A.id);
  return `
    <button class="area-card" style="${areaVars(A)}" data-go="#/area/${A.id}">
      <span class="ac-top"><span class="ac-icon emo">${A.icon}</span>${areaDone(A.id) ? '<span class="ac-dip">📜</span>' : ''}</span>
      <span class="ac-name">${esc(A.name)}</span>
      <span class="ac-sub">${esc(A.sub)}</span>
      <span class="ac-prog"><span style="width:${Math.round(done / ls.length * 100)}%"></span></span>
      <span class="ac-count">${done} / ${ls.length} ${cur ? `· ďalej: ${esc(cur.title)}` : done === ls.length ? '· hotovo! 🏆' : ''}</span>
    </button>`;
}

/* ============================== OBLASŤ ============================== */
function renderArea(aid) {
  const A = AREA_BY_ID[aid];
  if (!A || aid === 'wp') { location.hash = '#/home'; return; }
  const ls = areaLessons(aid), cur = areaCurrent(aid);
  const done = ls.filter(L => Store.isDone(L.id)).length;
  $('#app').innerHTML = `
    <div class="screen-in" style="${areaVars(A)}">
      <section class="world">
        <div class="world-head">
          <button class="back" data-go="#/home" title="Späť">◀</button>
          <span class="wh-ic emo">${A.icon}</span>
          <div class="wh-text">
            <div class="wh-title">${esc(A.name)}</div>
            <div class="wh-sub">${esc(A.sub)} · ${done} / ${ls.length} hotovo</div>
          </div>
          ${areaDone(aid)
            ? `<button class="btn small yellow" data-go="#/diploma/${aid}">📜 Diplom</button>`
            : `<div class="wh-prog"><div style="width:${Math.round(done / ls.length * 100)}%"></div></div>`}
        </div>
        <div class="path">${ls.map((L, k) => nodeHTML(L, k, cur)).join('')}</div>
      </section>
      <div class="home-foot"><button class="btn ghost" data-go="#/book/${aid}">📚 Encyklopédia: ${esc(A.name)}</button><button class="btn" data-go="#/home">🗺️ Všetky oblasti</button></div>
    </div>`;
  const node = $('.node.current');
  if (node) setTimeout(() => {
    const r = node.getBoundingClientRect();
    if (r.bottom > innerHeight - 40) node.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 250);
}

function nodeHTML(L, k, cur) {
  const unlocked = Store.isUnlocked(L), done = Store.isDone(L.id), isCur = L === cur && !done;
  const x = Math.sin(k * 1.3).toFixed(2);
  const cls = ['node', L.review ? 'review' : '', done ? 'done' : '', isCur ? 'current' : '', unlocked ? '' : 'locked'].join(' ');
  const ad = actsDone(L);
  const below = done ? starsHTML(lessonStars(L)) : (unlocked && ad ? `<span class="node-prog">${ad} / ${reqIdx(L).length}</span>` : '');
  return `
    <div class="node-wrap" style="--x:${x}">
      ${isCur ? '<div class="start-bubble">ŠTART!</div>' : ''}
      <button class="${cls}" ${unlocked ? `data-go="#/lesson/${L.id}"` : 'data-locked="1"'}>
        <span class="node-pic">${pic(L.icon)}</span>${unlocked ? '' : '<span class="lock emo">🔒</span>'}
      </button>
      <div class="node-label">${esc(L.title)}</div>
      <div class="node-sub">${esc(L.sub)}</div>
      <div class="node-stars">${below}</div>
    </div>`;
}

/* ============================== LEKCIA ============================== */
function renderLesson(L) {
  if (!L) { location.hash = '#/home'; return; }
  if (!Store.isUnlocked(L)) { toast('🔒 Najprv dokonči predchádzajúcu lekciu'); location.hash = '#/area/' + L.area; return; }
  const A = areaOf(L), R = Store.state.settings.rewards;
  const nextIdx = firstUndone(L), done = Store.isDone(L.id);
  const chips = (L.items || []).filter(it => it.p);
  $('#app').innerHTML = `
    <div class="screen-in" style="${areaVars(A)}">
      <div class="lesson-head">
        <button class="back" data-go="#/area/${L.area}" title="Späť">◀</button>
        <div class="lh-ic">${pic(L.icon)}</div>
        <div class="lh-text">
          <div class="lh-title">${esc(L.title)}</div>
          <div class="lh-sub">${esc(L.sub)} · ${actsDone(L)} / ${reqIdx(L).length} úloh</div>
        </div>
        <div class="lh-badge" title="${done ? esc(L.badge.name) : 'Odznak získaš za celú lekciu'}">${medalHTML(lessonBadge(L), { locked: !done })}</div>
      </div>
      ${L.review
        ? `<div class="review-note card">🏆 <b>Veľké opakovanie</b> – otázky z celej oblasti <b>${esc(A.name)}</b>. Za dokončenie získaš <b>${fmtMoney(R.world)}</b>, trofej a <b>diplom na vytlačenie</b> 📜!</div>`
        : chips.length ? `<div class="word-chips">${chips.map((it, i) => `
            <button class="wchip" data-card="${i}" title="${esc(it.n)}">
              <span class="pic">${pic(it.p)}</span><span class="wc-en">${esc(cap(it.n))}</span>
            </button>`).join('')}</div>` : ''}
      <div class="act-list">${L.acts.map((a, i) => actCardHTML(L, a, i, nextIdx)).join('')}</div>
      <div class="lesson-foot">
        <button class="btn green big" data-go="#/play/${L.id}/${nextIdx == null ? 0 : nextIdx}">${nextIdx == null ? '🔁 Hrať znova' : '▶ Pokračovať'}</button>
      </div>
    </div>`;
  $$('[data-card]').forEach(b => b.onclick = () => showCard(L, chips[+b.dataset.card]));
}

function showCard(L, it) {
  const where = locPic(L, it);
  const text = cap(it.n) + (it.f ? '. ' + it.f : '');
  const m = Modal.open(`
    <div class="card-modal" style="${areaVars(areaOf(L))}">
      <div class="cm-pic ${where ? 'has-map' : ''}">${zoomable(it.p, pic(it.p), it.n)}</div>
      <h2>${esc(cap(it.n))}</h2>
      ${it.f ? `<p class="cm-fact">${esc(it.f)}</p>` : ''}
      ${where ? `<div class="cm-map">${where}</div>` : ''}
      <div class="res-actions">${sayBtn(text, 'btn blue say-big')}${it.snd ? '<button class="btn orange snd">🎵 Zahraj</button>' : ''}<button class="btn ghost ok">Zavrieť</button></div>
    </div>`, { dismiss: true });
  $('.ok', m).onclick = () => { Speech.stop(); Modal.close(); };
  const sb = $('.snd', m);
  if (sb) sb.onclick = () => Sfx.instrument(it.snd);
  Speech.say(text);
}

function actCardHTML(L, a, i, nextIdx) {
  const st = Store.actStars(L, i);
  const status = a.type === 'learn'
    ? (st ? '<span class="ac-done">✓ hotovo</span>' : '<span class="ac-new">nové kartičky</span>')
    : starsHTML(st);
  return `
    <button class="act-card ${i === nextIdx ? 'next' : ''} ${st ? 'done' : ''}" data-go="#/play/${L.id}/${i}">
      <span class="ac-ic emo">${actIcon(a)}</span>
      <span class="ac-text"><span class="ac-name">${esc(actName(a))}</span><span class="ac-stars">${status}</span></span>
      ${i === nextIdx ? '<span class="ac-go">▶</span>' : ''}
    </button>`;
}

/* ============================== ÚLOHA ============================== */
function runActivity(L, idx) {
  if (!L || !L.acts[idx]) { location.hash = L && L.practice ? '#/practice' : '#/home'; return; }
  if (!Store.isUnlocked(L)) { location.hash = '#/home'; return; }
  const act = L.acts[idx], G = Games[act.type], A = areaOf(L);
  if (!G) { location.hash = '#/lesson/' + L.id; return; }
  const instr = typeof G.instr === 'function' ? G.instr(act) : G.instr;
  $('#app').innerHTML = `
    <div class="act-screen screen-in" style="${areaVars(A)}">
      <div class="act-top">
        <button class="x-btn" title="Späť">✕</button>
        <div class="pbar"><div></div></div>
        <div class="act-step">${L.practice ? '💪 ' : ''}${idx + 1} / ${L.acts.length}</div>
      </div>
      <div class="instr">
        <div class="owl">${FOX}</div>
        <div class="bubble"><b>${actIcon(act)} ${esc(actName(act))}</b><br>${esc(instr)}${Speech.supported ? ` <button class="mini-spk" data-sk="${esc(stripEmoji(instr))}" title="Prečítať nahlas">🔊</button>` : ''}</div>
      </div>
      <div class="game-wrap"><div class="game"></div></div>
    </div>`;
  const gameEl = $('.game'), wrap = $('.game-wrap'), bar = $('.pbar > div');
  const timers = [];
  const missed = new Set();
  const st = () => Store.state.stats;   // vždy aktuálny postup (po načítaní z iného okna je Store.state nový objekt)
  let finished = false;
  const stop = () => { timers.forEach(f => { try { f(); } catch (e) { /* nič */ } }); timers.length = 0; };

  const ctx = {
    L, act,
    el: gameEl,
    say: (t) => (Store.state.settings.readQ && t ? Speech.say(t) : Promise.resolve()),
    correct(key, first = true) {
      st().correct++;
      if (key) {
        if (first && !missed.has(key)) Store.markKnown(key);
        Store.srsHit(key, true, first && !missed.has(key));
      }
    },
    wrong(key) {
      st().wrong++;
      if (key) { missed.add(key); Store.srsHit(key, false); }
    },
    praise() {
      const p = el(`<div class="float-praise">${pick(PRAISE)}</div>`);
      wrap.appendChild(p);
      setTimeout(() => p.remove(), 1200);
    },
    progress(d, t) { bar.style.width = Math.round(d / t * 100) + '%'; },
    timeout(fn, ms) { const id = setTimeout(() => { if (!finished) fn(); }, ms); timers.push(() => clearTimeout(id)); return id; },
    interval(fn, ms) { const id = setInterval(fn, ms); timers.push(() => clearInterval(id)); return id; },
    onCleanup(fn) { timers.push(fn); },
    finish(res) {
      if (finished) return;
      finished = true;
      stop();
      bar.style.width = '100%';
      showResult(L, idx, res);
    },
  };
  App.cleanup = () => { finished = true; stop(); Store.save(); };

  $('.x-btn').onclick = () => { location.hash = L.practice ? '#/practice' : '#/lesson/' + L.id; };

  // pri prvej hre daného typu prečítaj pokyny nahlas
  const s = Store.state, key = act.type + (act.mode || '') + (act.type === 'map' && boardKind(act) ? act.board : '');
  const start = () => { if (!finished) { try { G.run(ctx); } catch (e) { console.error(e); gameEl.innerHTML = '<div class="empty">Ups, niečo sa pokazilo 🙈</div>'; } } };
  if (s.settings.readInstr && Speech.hasSk() && !s.seenInstr[key]) {
    s.seenInstr[key] = 1;
    Store.save();
    gameEl.innerHTML = `<div class="loading-owl bob">${FOX}💬</div>`;
    Speech.say(stripEmoji(`${actName(act)}. ${instr}`)).then(start);
  } else start();
}

/* ============================== VÝSLEDOK ============================== */
function showResult(L, idx, res) {
  const stars = res.learn ? 3 : (res.stars || calcStars(res.mistakes || 0, res.total || 1));
  const out = Store.recordActivity(L, idx, stars, res);
  const total = out.earned.reduce((a, e) => a + e.a, 0);
  const name = Store.state.profile.name;
  const nextIdx = nextActIdx(L, idx);
  const titles = { 3: `Výborne${name ? ', ' + esc(name) : ''}!`, 2: 'Dobrá práca!', 1: 'Zvládla si to!' };

  let msg = '';
  if (L.practice) {
    if (!out.task) msg = out.limit
      ? 'Odmeny za tréning si dnes už vyčerpala – tréning ti ale aj tak veľmi pomáha! 💪'
      : 'Za tréning na ★★ a viac dostaneš odmenu. Skús to ešte raz!';
  } else if (!out.task) {
    if (res.learn) msg = 'Odmenu za tieto kartičky si už dostala. Opakovanie je ale super! 👍';
    else if (out.prev >= 3) msg = 'Túto úlohu už máš na ★★★ – super opakovanie! 💪';
    else msg = `Minule si mala ${'★'.repeat(out.prev)}. Peniažky dostaneš, keď získaš viac hviezdičiek!`;
  }
  let sub = '';
  if (res.learn) sub = 'Kartičky máš prejdené ✓';
  else if (res.memory) sub = 'Našla si všetky dvojice! 🧠';
  else sub = res.mistakes ? `Chybičky: ${Math.round(res.mistakes * 10) / 10}` : 'Bez jedinej chybičky! 🌟';

  const nextLabel = out.lessonDone ? 'Hurá! 🎉' : (nextIdx != null ? 'Ďalšia úloha ➜' : (L.practice ? 'Hotovo 💪' : 'Hotovo ➜'));
  const m = Modal.open(`
    <div class="result">
      <div class="res-owl bob">${FOX}</div>
      <div class="res-title">${titles[stars]}</div>
      ${res.learn ? '' : `<div class="res-stars">${[1, 2, 3].map(i => `<span class="${i <= stars ? 'on' : ''}" style="animation-delay:${0.2 + i * 0.25}s">★</span>`).join('')}</div>`}
      <div class="res-sub">${sub}</div>
      ${total ? `<div class="res-coins">${coinsHTML(total)}</div>` : ''}
      <div class="earn-lines">${out.earned.map(e => `<div class="earn-line"><span>${e.n}</span><b>+${fmtMoney(e.a)}</b></div>`).join('')}</div>
      ${msg ? `<div class="res-msg">${msg}</div>` : ''}
      <div class="res-actions">
        <button class="btn ghost again">🔁 Znova</button>
        <button class="btn green big next">${nextLabel}</button>
      </div>
    </div>`, { cls: 'result-modal' });

  Sfx.play('win');
  if (!res.learn) for (let i = 1; i <= stars; i++) setTimeout(() => Sfx.play('star'), 450 + i * 250);
  if (stars === 3) setTimeout(() => Confetti.run(110), 300);
  setTimeout(() => Speech.say(stars === 3 ? `Výborne, ${name}!` : stars === 2 ? 'Dobrá práca!' : 'Zvládla si to!'), 400);
  if (total) setTimeout(() => flyCoins($('.res-coins', m), total), 1200);

  $('.again', m).onclick = () => { Topbar.sync(); Modal.close(); App.route(); };
  $('.next', m).onclick = async () => {
    Topbar.sync();
    Modal.close();
    let goDiploma = null;
    for (const b of out.badges) {
      const action = await showBadgeModal(b, L);
      if (action === 'diploma') goDiploma = L.area;
    }
    if (goDiploma) location.hash = '#/diploma/' + goDiploma;
    else if (out.lessonDone) location.hash = '#/area/' + L.area;
    else if (nextIdx != null) location.hash = `#/play/${L.id}/${nextIdx}`;
    else if (L.practice) { App.practice = null; location.hash = '#/home'; toast('Tréning hotový! Si šikulka 💪'); }
    else location.hash = `#/lesson/${L.id}`;
  };
}

function showBadgeModal(b, L) {
  return new Promise(resolve => {
    const isLesson = b.id.startsWith('L-');
    const areaBadge = isLesson && L && L.review && b.id === 'L-' + L.id;
    const heading = isLesson ? (areaBadge ? 'Celá oblasť hotová! 🏆' : 'Lekcia hotová! 🎉') : 'Nový odznak! ✨';
    const m = Modal.open(`
      <div class="badge-reveal">
        <div class="rays"></div>
        <h2>${heading}</h2>
        ${medalHTML(b, { big: true, anim: true })}
        <div class="br-name">${esc(b.name)}</div>
        <div class="br-desc">${esc(b.desc)}</div>
        <div class="res-actions">
          ${areaBadge ? '<button class="btn blue big dip">📜 Môj diplom</button>' : ''}
          <button class="btn yellow big ok">Juchú! 🎉</button>
        </div>
      </div>`, { cls: 'celebrate' });
    Sfx.play('badge');
    Confetti.run(170);
    Speech.say(areaBadge ? 'Úžasné! Zvládla si celú oblasť!' : isLesson ? 'Super! Máš nový odznak!' : 'Wow! Nový odznak!');
    $('.ok', m).onclick = () => { Modal.close(); resolve('ok'); };
    const dip = $('.dip', m);
    if (dip) dip.onclick = () => { Modal.close(); resolve('diploma'); };
  });
}

/* ============================== TRÉNING CHYBIČIEK ============================== */
function buildPractice() {
  const keys = Store.practiceKeys(8).filter(k => questionFor(k));
  if (!keys.length) return null;
  const half = Math.ceil(keys.length / 2);
  const acts = keys.length >= 6
    ? [{ type: 'mix', keys: keys.slice(0, half), title: 'Tréning 1' }, { type: 'mix', keys: keys.slice(half), title: 'Tréning 2' }]
    : [{ type: 'mix', keys, title: 'Tréning' }];
  return { id: 'practice', practice: true, area: 'wp', title: 'Tréning', sub: 'Opakovanie chybičiek', icon: '💪', items: [], acts, keys };
}
function keyLabel(key) {
  const E = QREG[key];
  if (!E) return { p: '❓', t: key };
  const x = E.ref;
  switch (E.kind) {
    case 'item': return { p: x.p, t: cap(x.n) };
    case 'quiz': return { p: x.p || '❓', t: x.q };
    case 'tf':   return { p: '✅', t: x.s };
    case 'sort': return { p: x.p, t: cap(x.n) };
    case 'gap':  return { p: x.p || '🧩', t: x.w.replace('_', '…') };
  }
  return { p: '❓', t: key };
}

function renderPractice() {
  const P = App.practice = buildPractice();
  const st = Store.state.stats, R = Store.state.settings.rewards;
  const usedToday = st.practiceDay === dayKey() ? st.practiceToday : 0;
  $('#app').innerHTML = `
    <div class="screen-in" style="${areaVars(PRACTICE_AREA)}">
      <div class="lesson-head">
        <button class="back" data-go="#/home" title="Späť">◀</button>
        <div class="lh-ic emo">💪</div>
        <div class="lh-text">
          <div class="lh-title">Tréning chybičiek</div>
          <div class="lh-sub">Otázky, ktoré je dobré zopakovať</div>
        </div>
      </div>
      ${P ? `
        <div class="word-chips">${P.keys.map(k => { const l = keyLabel(k); return `
          <span class="wchip"><span class="pic">${pic(l.p)}</span><span class="wc-en">${esc(l.t.length > 26 ? l.t.slice(0, 24) + '…' : l.t)}</span></span>`; }).join('')}</div>
        <div class="card practice-info">
          <p>${FOX} Líška Bystrulka si pamätá, s čím si mala ťažkosti, a po pár dňoch ti to pripomenie – tak si to zapamätáš navždy!</p>
          <p>Tréning má <b>${P.acts.length} ${plural(P.acts.length, 'krátku úlohu', 'krátke úlohy', 'krátkych úloh')}</b>. Za každú na ★★ a viac dostaneš <b>${fmtMoney(R.practice)}</b> (najviac 3× za deň, dnes: ${usedToday}/3).</p>
        </div>
        <div class="lesson-foot"><button class="btn orange big" data-go="#/play/practice/0">▶ Začať tréning</button></div>`
      : `
        <div class="card practice-info empty-train">
          <div class="emo big-emo">🎉</div>
          <p><b>Všetko máš zopakované!</b></p>
          <p class="muted">Hraj lekcie a keď bude čas niečo zopakovať, objaví sa to tu.</p>
          <button class="btn" data-go="#/home">🗺️ Domov</button>
        </div>`}
    </div>`;
}

/* ============================== OBCHOD ============================== */
function renderShop() {
  const s = Store.state;
  if (!s.settings.shopEnabled) { location.hash = '#/home'; return; }
  const cat = App.shopCat || 'hat';
  $('#app').innerHTML = `
    <div class="screen-in">
      <div class="page-head"><button class="back" data-go="#/home" title="Späť">◀</button><h1>🛍️ Obchod</h1></div>
      <div class="shop-top card">
        ${avatarHTML('xxl')}
        <div class="shop-info">
          <div class="ph-name">${esc(s.profile.name)}</div>
          <div class="shop-bal">🐷 ${fmtMoney(s.wallet.balance)}</div>
          <div class="muted">Za peniažky si môžeš kúpiť ozdoby pre svoj obrázok. Čo minieš, odpočíta sa z pokladničky – alebo môžeš šetriť. Rozhodni sa sama! 😉</div>
        </div>
      </div>
      <div class="shop-tabs">${SHOP_CATS.map(c => `<button class="shop-tab ${c.id === cat ? 'on' : ''}" data-cat="${c.id}"><span class="emo">${c.icon}</span> ${esc(c.name)}</button>`).join('')}</div>
      <div class="shop-grid">${SHOP_ITEMS.filter(i => i.cat === cat).map(shopItemHTML).join('')}</div>
    </div>`;
  $$('.shop-tab').forEach(b => b.onclick = () => { App.shopCat = b.dataset.cat; Sfx.play('click'); renderShop(); });
  $$('[data-equip]').forEach(b => b.onclick = () => {
    Store.toggleEquip(SHOP_BY_ID[b.dataset.equip]);
    Sfx.play('flip');
    Topbar.render();
    renderShop();
  });
  $$('[data-buy]').forEach(b => b.onclick = () => confirmBuy(SHOP_BY_ID[b.dataset.buy]));
}

function shopItemHTML(it) {
  const s = Store.state, owned = Store.owns(it.id), worn = s.profile.equip[it.cat] === it.id;
  const bal = s.wallet.balance, can = bal >= it.price;
  const preview = it.bg ? `<span class="frame-sw" style="background:${it.bg}"></span>` : `<span class="emo">${it.emoji}</span>`;
  const action = owned
    ? `<button class="btn small ${worn ? 'ghost' : 'green'}" data-equip="${it.id}">${worn ? 'Dať dole' : 'Obliecť'}</button>`
    : `<button class="btn small ${can ? 'yellow' : 'ghost'}" data-buy="${it.id}" ${can ? '' : 'disabled'}>${fmtMoney(it.price)}</button>
       ${can ? '' : `<div class="si-miss">chýba ${fmtMoney(it.price - bal)}</div>`}`;
  return `
    <div class="shop-item ${owned ? 'owned' : ''} ${worn ? 'worn' : ''}">
      ${worn ? '<span class="si-tag">mám to</span>' : owned ? '<span class="si-tag own">moje</span>' : ''}
      <div class="si-pic">${preview}</div>
      <div class="si-name">${esc(it.name)}</div>
      ${action}
    </div>`;
}

function confirmBuy(it) {
  const s = Store.state, bal = s.wallet.balance;
  const eq = Object.assign({}, s.profile.equip, { [it.cat]: it.id });
  const m = Modal.open(`
    <div class="buy-modal">
      ${avatarHTML('xxl', { equip: eq })}
      <h2>Kúpiť ${esc(it.acc || it.name.toLowerCase())}?</h2>
      <p>Stojí <b>${fmtMoney(it.price)}</b>. V pokladničke ti potom ostane <b>${fmtMoney(bal - it.price)}</b>.</p>
      <div class="res-actions">
        <button class="btn ghost no">Ešte nie</button>
        <button class="btn yellow big yes">Kúpiť 🛍️</button>
      </div>
    </div>`, { dismiss: true });
  $('.no', m).onclick = () => Modal.close();
  $('.yes', m).onclick = async () => {
    const badges = Store.buy(it);
    Modal.close();
    if (!badges) return;
    Sfx.play('buy');
    Confetti.run(90);
    Speech.say('Wow! Vyzeráš úžasne!');
    Topbar.sync();
    Topbar.render();
    renderShop();
    toast(`Kúpené: ${esc(it.name)} 🎉`);
    for (const b of badges) await showBadgeModal(b);
  };
}

/* ============================== DIPLOM ============================== */
function renderDiploma(aid) {
  const all = aid === 'all';
  const A = all ? null : AREA_BY_ID[aid];
  const reviews = LESSONS.filter(L => L.review && (all || L.area === aid));
  if ((!all && !A) || !reviews.length || !reviews.every(L => Store.isDone(L.id))) {
    toast('📜 Diplom získaš po dokončení celej oblasti');
    location.hash = '#/profile';
    return;
  }
  const s = Store.state;
  const ls = LESSONS.filter(L => !L.review && (all || L.area === aid));
  const stars = ls.concat(reviews).reduce((a, L) => a + lessonStarSum(L), 0);
  const doneAt = Math.max(...reviews.map(L => (Store.prog(L.id) || {}).doneAt || Date.now()));
  const look = all ? { color: '#8f63ff', dark: '#6a3fe0', bg: '#efe6ff', icon: '👑' } : A;
  const seal = all ? '👑' : pic(reviews[0].badge.e);
  $('#app').innerHTML = `
    <div class="screen-in">
      <div class="page-head no-print">
        <button class="back" data-go="#/profile" title="Späť">◀</button>
        <h1>📜 Diplom</h1>
        <button class="btn blue" id="print-btn">🖨️ Vytlačiť</button>
      </div>
      <p class="muted no-print">Tip: v okne tlače zvoľte orientáciu <b>na šírku</b> a zapnite <b>grafiku pozadia</b>. Diplom sa dá uložiť aj ako PDF („Uložiť ako PDF“).</p>
      <div class="diploma" style="${areaVars(look)}">
        <div class="dp-inner">
          <span class="dp-corner tl emo">${look.icon}</span><span class="dp-corner tr emo">⭐</span>
          <span class="dp-corner bl emo">⭐</span><span class="dp-corner br emo">${look.icon}</span>
          <div class="dp-owl emo">${FOX}</div>
          <div class="dp-title">DIPLOM</div>
          <div class="dp-sub">${all ? 'za zvládnutie všetkých oblastí aplikácie Objavujem svet' : 'za úspešné zvládnutie oblasti'}</div>
          ${all ? '' : `<div class="dp-world">${A.icon} ${esc(A.name)}</div>`}
          <div class="dp-for">udeľujeme</div>
          <div class="dp-name">${esc(s.profile.name)}</div>
          <div class="dp-text">ktorá sa naučila:</div>
          <div class="dp-topics">${all
            ? AREAS.map(x => `<span>${emo(x.icon)} ${esc(x.name)}</span>`).join('')
            : ls.map(L => `<span><span class="dp-ti">${pic(L.icon)}</span> ${esc(L.title)}</span>`).join('')}</div>
          <div class="dp-stats">📚 ${ls.length} ${plural(ls.length, 'lekcia', 'lekcie', 'lekcií')} · ⭐ ${stars} hviezdičiek</div>
          <div class="dp-bottom">
            <div class="dp-sign"><b>${fmtDateLong(doneAt)}</b><span>dátum</span></div>
            <div class="dp-seal"><span class="dp-seal-pic">${seal}</span></div>
            <div class="dp-sign"><b class="dp-hand">Líška Bystrulka</b><span>sprievodkyňa objaviteľov ${FOX}</span></div>
          </div>
        </div>
      </div>
    </div>`;
  $('#print-btn').onclick = () => window.print();
  setTimeout(() => Confetti.run(80), 300);
}

/* ============================== PROFIL ============================== */
function renderProfile(section) {
  const s = Store.state, w = s.wallet, badges = allBadges();
  const special = badges.filter(b => !b.id.startsWith('L-'));
  const stat = (ic, val, lbl) => `<div class="stat"><div class="ic">${ic}</div><div class="val">${val}</div><div class="lbl">${lbl}</div></div>`;
  const hist = w.history.slice(0, 12);
  const dips = AREAS.map(A => ({ id: A.id, name: A.name, icon: A.icon, ok: areaDone(A.id) }));
  dips.push({ id: 'all', name: 'Veľký diplom – všetky oblasti', icon: '👑', ok: AREAS.every(A => areaDone(A.id)) });
  $('#app').innerHTML = `
    <div class="screen-in">
      <div class="profile-head card">
        ${avatarHTML('xl', { button: true, id: 'pick-avatar', title: 'Zmeniť obrázok' })}
        <div class="ph-text">
          <div class="ph-name">${esc(s.profile.name)}</div>
          <div class="ph-rank">${rankTitle()}</div>
          <div class="muted">Ťukni na obrázok a vyber si iný 🙂</div>
        </div>
        ${s.settings.shopEnabled ? '<button class="btn pink" data-go="#/shop">🛍️ Obchod</button>' : ''}
      </div>
      <div class="stats">
        ${stat('🐷', fmtMoney(w.balance), 'v pokladničke')}
        ${stat('🏅', `${Store.badgeCount()} / ${badges.length}`, 'odznakov')}
        ${stat('📚', Store.knownCount(), 'vedomostí')}
        ${stat('⭐', Store.totalStars(), 'hviezdičiek')}
        ${stat('🔥', Store.currentStreak(), 'dní po sebe')}
        ${stat('✅', s.stats.acts, 'splnených úloh')}
      </div>

      <h2 class="section-title">📜 Diplomy</h2>
      <div class="diplomas">${dips.map(d => `
        <button class="dip-item ${d.ok ? 'got' : ''}" ${d.ok ? `data-go="#/diploma/${d.id}"` : 'data-locked="📜 Diplom získaš po dokončení celej oblasti (aj veľkého opakovania)"'}>
          <b><span class="emo">${d.ok ? '📜' : '🔒'}</span> ${d.icon} ${esc(d.name)}</b>
          <span>${d.ok ? 'Otvoriť a vytlačiť 🖨️' : 'Dokonči celú oblasť'}</span>
        </button>`).join('')}</div>

      <h2 class="section-title" id="sec-badges">🏅 Odznaky za lekcie</h2>
      ${AREAS.map(A => `<h3 class="badge-area" style="${areaVars(A)}">${emo(A.icon)} ${esc(A.name)}</h3>
        <div class="badges">${areaLessons(A.id).map(L => badgeItem(lessonBadge(L))).join('')}</div>`).join('')}
      <h2 class="section-title">✨ Špeciálne odznaky</h2>
      <div class="badges">${special.map(badgeItem).join('')}</div>

      <h2 class="section-title" id="sec-piggy">🐷 Pokladnička</h2>
      <div class="card piggy">
        <div class="piggy-top">
          <span class="emo piggy-ic">🐷</span>
          <div>
            <div class="piggy-bal">${fmtMoney(w.balance)}</div>
            <div class="muted">Spolu zarobené: ${fmtMoney(w.total)} · Minuté v obchode: ${fmtMoney(w.spent)} · Vyplatené: ${fmtMoney(w.paid)}</div>
          </div>
        </div>
        ${w.balance ? coinsHTML(w.balance, 16) : ''}
        <div class="history">${hist.length
          ? hist.map(h => `<div class="h-row"><span class="h-date">${fmtDate(h.t)}</span><span class="h-note">${esc(h.n)}</span><b class="${h.a < 0 ? 'neg' : 'pos'}">${h.a > 0 ? '+' : ''}${fmtMoney(h.a)}</b></div>`).join('')
          : '<div class="empty">Zatiaľ prázdne – zahraj si prvú úlohu! 🙂</div>'}</div>
      </div>
      <div class="home-foot">
        <button class="btn ghost" data-go="#/book">📚 Moja encyklopédia</button>
        <button class="btn" data-go="#/home">🗺️ Domov</button>
      </div>
    </div>`;
  $('#pick-avatar').onclick = () => pickAvatar(() => { Topbar.render(); renderProfile(); });
  $$('.badge-item').forEach(b => b.onclick = () => {
    const bd = getBadge(b.dataset.badge), got = Store.state.badges[bd.id];
    const m = Modal.open(`
      <div class="badge-reveal small">
        ${medalHTML(bd, { big: true, locked: !got })}
        <div class="br-name">${esc(bd.name)}</div>
        <div class="br-desc">${esc(bd.desc)}</div>
        <p class="muted">${got ? `Získaný ${fmtDate(got)} 🎉` : 'Tento odznak ešte čaká na teba! 💪'}</p>
        <button class="btn ok">OK</button>
      </div>`, { dismiss: true });
    $('.ok', m).onclick = () => Modal.close();
  });

  const target = section && document.getElementById('sec-' + section);
  if (target) setTimeout(() => {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const box = target.nextElementSibling;
    if (box) {
      box.classList.remove('spotlight'); void box.offsetWidth; box.classList.add('spotlight');
      const end = e => { if (e.target === box) { box.classList.remove('spotlight'); box.removeEventListener('animationend', end); } };
      box.addEventListener('animationend', end);
    }
    setTimeout(() => { if (target.isConnected && window.scrollY < 10) target.scrollIntoView({ block: 'start' }); }, 900);
  }, 80);
}

function badgeItem(b) {
  const got = !!Store.state.badges[b.id];
  return `<button class="badge-item ${got ? 'got' : ''}" data-badge="${b.id}">
    ${medalHTML(b, { locked: !got })}
    <div class="badge-name">${esc(b.name)}</div>
    <div class="badge-desc">${esc(b.desc)}</div>
  </button>`;
}

function pickAvatar(done) {
  const m = Modal.open(`
    <h2>Vyber si obrázok</h2>
    <div class="avatar-grid">${AVATARS.map(a => `<button class="avatar-opt ${a === Store.state.profile.avatar ? 'sel' : ''}" data-av="${a}">${a}</button>`).join('')}</div>
    ${Store.state.settings.shopEnabled ? '<p class="muted">Ozdoby (korunky, okuliare, rámčeky…) nájdeš v 🛍️ obchode.</p>' : ''}`, { dismiss: true });
  $$('.avatar-opt', m).forEach(b => b.onclick = () => {
    Store.state.profile.avatar = b.dataset.av;
    Store.save();
    Sfx.play('good');
    Modal.close();
    done && done();
  });
}

/* ============================== ENCYKLOPÉDIA ============================== */
function renderBook(aid) {
  const areas = aid && AREA_BY_ID[aid] && aid !== 'wp' ? [AREA_BY_ID[aid]] : AREAS;
  const known = Store.state.known;
  $('#app').innerHTML = `
    <div class="screen-in">
      <div class="page-head"><button class="back" data-go="${aid ? '#/area/' + aid : '#/home'}" title="Späť">◀</button><h1>📚 Moja encyklopédia</h1></div>
      <p class="muted">Tu sú všetky kartičky, ktoré si už objavila. Ťukni na kartičku a dozvieš sa zaujímavosť. Zelené ✓ = už to vieš, 💪 = oplatí sa potrénovať.</p>
      ${aid ? `<div class="f-inline"><button class="btn small ghost" data-go="#/book">Všetky oblasti</button></div>` : ''}
      ${areas.map(A => `
        <h2 class="section-title book-area" style="${areaVars(A)}">${emo(A.icon)} ${esc(A.name)}</h2>
        ${areaLessons(A.id).filter(L => !L.review && (L.items || []).some(it => it.p)).map(L => {
          const open = Store.isUnlocked(L);
          return `
            <section class="dict-sec" style="${areaVars(A)}">
              <h3 class="dict-h"><span class="dh-pic">${pic(L.icon)}</span> ${esc(L.title)} <small>${esc(L.sub)}</small></h3>
              ${open
                ? `<div class="dict-grid">${L.items.filter(it => it.p).map((it, i) => `
                    <button class="dict-w ${Store.isWeak(it.key) ? 'weak' : known[it.key] ? 'known' : ''}" data-l="${L.id}" data-k="${i}">
                      <span class="dw-pic">${pic(it.p)}</span>
                      <span class="dw-en">${esc(cap(it.n))}</span>
                    </button>`).join('')}</div>`
                : '<div class="dict-locked">🔒 Odomkne sa, keď prídeš k tejto lekcii.</div>'}
            </section>`;
        }).join('')}`).join('')}
    </div>`;
  $$('.dict-w').forEach(b => b.onclick = () => {
    const L = LESSON_BY_ID[b.dataset.l];
    showCard(L, L.items.filter(it => it.p)[+b.dataset.k]);
  });
}

/* ============================== RODIČOVSKÁ ZÓNA ============================== */
const LAUNCHER = 'Spustiť objavovanie.bat';

function storageInfoHTML() {
  if (Store.web) return `
    <p>🌐 Aplikácia beží <b>z internetu</b> – postup sa ukladá <b>v tomto zariadení</b> (v prehliadači) a funguje aj bez internetu.</p>
    <p class="tip-box">💡 Občas dajte <b>Exportovať postup</b> a zálohu si odložte. Postup sa stratí, ak sa vymažú údaje prehliadača alebo aplikácia odinštaluje. Na inom zariadení ho obnovíte cez <b>Importovať zálohu</b>.</p>`;
  if (!Store.server) return `
    <p>📁 Aplikácia je teraz otvorená <b>priamo zo súboru</b> (index.html) – postup sa ukladá iba <b>v tomto prehliadači na tomto počítači</b>.</p>
    <p class="tip-box">💡 Odporúčame spúšťať aplikáciu dvojklikom na <b>„${LAUNCHER}“</b>. Postup sa potom ukladá aj priamo do priečinka aplikácie (prenesie sa s ním).<br>
    Ak ste doteraz hrali takto, dajte tu <b>Exportovať</b> a po spustení cez „${LAUNCHER}“ <b>Importovať</b>.</p>`;
  if (Store.serverOK) return `
    <p>✅ Postup sa ukladá automaticky aj <b>do priečinka aplikácie</b> (<code>data/postup.json</code>) a každý deň sa robí záloha (<code>data/zaloha-…json</code>, posledných 14 dní).</p>
    <p>Pri prenose na iný počítač <b>stačí skopírovať celý priečinok</b> a spustiť „${LAUNCHER}“.</p>`;
  return `
    <p class="tip-box">⚠️ Server aplikácie teraz nebeží (okno „Objavujem svet“ sa asi zatvorilo) – postup sa ukladá len v prehliadači. Zatvorte toto okno a spustite aplikáciu znova cez „${LAUNCHER}“.</p>`;
}

function renderGate() {
  const a = randInt(3, 9), b = randInt(3, 9);
  $('#app').innerHTML = `
    <div class="screen-in">
      <div class="card gate">
        <div class="gate-ic emo">👨‍👩‍👧</div>
        <h2>Rodičovská zóna</h2>
        <p>Len pre dospelých 🙂 Koľko je <b>${a} × ${b}</b>?</p>
        <input type="number" id="gate-in" inputmode="numeric" autocomplete="off">
        <div class="f-inline center">
          <button class="btn ghost" data-go="#/home">Späť</button>
          <button class="btn" id="gate-ok">Vstúpiť</button>
        </div>
      </div>
    </div>`;
  const inp = $('#gate-in');
  inp.focus();
  const ok = () => {
    if (parseInt(inp.value, 10) === a * b) { App.parentOK = true; renderParent(); }
    else { inp.classList.remove('shake'); void inp.offsetWidth; inp.classList.add('shake'); inp.value = ''; }
  };
  $('#gate-ok').onclick = ok;
  inp.onkeydown = e => { if (e.key === 'Enter') ok(); };
}

function renderParent() {
  if (!App.parentOK) return renderGate();
  const s = Store.state, R = s.settings.rewards, w = s.wallet;
  const rw = (key, label) => `
    <label class="f-row"><span>${label}</span>
      <span class="f-money"><input type="number" min="0" step="0.05" data-rw="${key}" value="${(R[key] / 100).toFixed(2)}"> €</span>
    </label>`;
  const weak = Store.weakList(15);
  $('#app').innerHTML = `
    <div class="screen-in parent">
      <div class="page-head"><button class="back" data-go="#/home" title="Späť">◀</button><h1>⚙️ Rodičovská zóna</h1></div>

      <section class="card p-sec">
        <h2>🐷 Pokladnička</h2>
        <div class="p-wallet">
          <div><div class="pw-val">${fmtMoney(w.balance)}</div><div class="muted">aktuálny zostatok</div></div>
          <div><div class="pw-val small">${fmtMoney(w.total)}</div><div class="muted">spolu zarobené</div></div>
          <div><div class="pw-val small">${fmtMoney(w.spent)}</div><div class="muted">minuté v obchode</div></div>
          <div><div class="pw-val small">${fmtMoney(w.paid)}</div><div class="muted">už vyplatené</div></div>
        </div>
        <div class="f-inline">
          <input type="number" min="0" step="0.1" id="pay-amt" placeholder="suma v €">
          <button class="btn small" id="pay-btn">Vyplatiť sumu</button>
          <button class="btn small green" id="pay-all" ${w.balance ? '' : 'disabled'}>Vyplatiť všetko</button>
        </div>
        <p class="muted">Keď dieťaťu peniažky naozaj dáte, zapíšte to sem – zostatok sa zníži a v histórii ostane záznam. (Táto pokladnička je samostatná – nezávislá od angličtiny.)</p>
        <details><summary>História pokladničky</summary>
          <div class="history">${w.history.slice(0, 60).map(h => `<div class="h-row"><span class="h-date">${fmtDateTime(h.t)}</span><span class="h-note">${esc(h.n)}</span><b class="${h.a < 0 ? 'neg' : 'pos'}">${h.a > 0 ? '+' : ''}${fmtMoney(h.a)}</b></div>`).join('') || '<div class="empty">Prázdne</div>'}</div>
        </details>
      </section>

      <section class="card p-sec">
        <h2>🎁 Odmeny</h2>
        ${rw('star3', 'Úloha na ★★★')}
        ${rw('star2', 'Úloha na ★★')}
        ${rw('star1', 'Úloha na ★')}
        ${rw('learn', 'Spoznaj – kartičky (prvýkrát)')}
        ${rw('lesson', 'Bonus za dokončenú lekciu')}
        ${rw('world', 'Bonus za celú oblasť (veľké opakovanie)')}
        ${rw('daily', 'Denný bonus (prvá úloha dňa)')}
        ${rw('practice', 'Tréning chybičiek (za úlohu, najviac 3× denne)')}
        <p class="muted">Pri opakovaní úlohy sa vypláca iba rozdiel, keď získa viac hviezdičiek ako predtým – peniažky sa teda nedajú „nafarmiť“.</p>
        <button class="btn small green" id="save-rw">Uložiť odmeny</button>
      </section>

      <section class="card p-sec">
        <h2>🛍️ Obchod a 👧 profil</h2>
        <label class="f-row"><span>Obchod s ozdobami (nákupy sa odpočítajú z pokladničky)</span><input type="checkbox" id="shop-on" ${s.settings.shopEnabled ? 'checked' : ''}></label>
        <label class="f-row"><span>Meno dieťaťa</span><input type="text" id="name-in" value="${esc(s.profile.name)}" maxlength="20"></label>
        <button class="btn small green" id="save-name">Uložiť meno</button>
      </section>

      <section class="card p-sec">
        <h2>🔊 Hlas a zvuky</h2>
        <label class="f-row"><span>Slovenský hlas</span><select id="voice-sk"></select></label>
        <label class="f-row"><span>Rýchlosť reči</span>
          <span class="f-range"><input type="range" id="rate" min="0.6" max="1.3" step="0.05" value="${s.settings.rate}"><b id="rate-val">${s.settings.rate}</b></span>
        </label>
        <div class="f-inline"><button class="btn small blue" id="test-sk">▶ Vyskúšať hlas</button></div>
        <label class="f-row"><span>Čítať otázky a kartičky nahlas</span><input type="checkbox" id="read-q" ${s.settings.readQ ? 'checked' : ''}></label>
        <label class="f-row"><span>Pri prvej hre prečítať pokyny nahlas</span><input type="checkbox" id="read-instr" ${s.settings.readInstr ? 'checked' : ''}></label>
        <label class="f-row"><span>Zvukové efekty</span><input type="checkbox" id="sfx" ${s.settings.sfx ? 'checked' : ''}></label>
        <p class="muted" id="voice-tip"></p>
      </section>

      <section class="card p-sec">
        <h2>🗺️ Lekcie a pokrok</h2>
        <label class="f-row"><span>Odomknúť všetky lekcie (inak sa v každej oblasti odomykajú postupne)</span><input type="checkbox" id="unlock-all" ${s.settings.unlockAll ? 'checked' : ''}></label>
        ${AREAS.map(A => `<h3>${emo(A.icon)} ${esc(A.name)}</h3><div class="p-lessons">${areaLessons(A.id).map(L => `
          <div class="pl-row"><span>${esc(L.title)} <span class="muted">${esc(L.sub)}</span></span>
          <span>${Store.isDone(L.id) ? '✅' : ''} ${actsDone(L)}/${reqIdx(L).length} úloh · ${lessonStarSum(L)} ★</span></div>`).join('')}</div>`).join('')}
        <p class="muted">Správnych odpovedí: ${s.stats.correct} · chybičiek: ${s.stats.wrong} · dní s učením: ${Object.keys(s.stats.days).length} · najdlhšia séria: ${s.stats.bestStreak} dní · tréningov: ${s.stats.practiceDone} · nájdené na mape: ${s.stats.mapOk} · vypočítané príklady: ${s.stats.mathOk}</p>
        <h3>💪 Čo ide ťažšie</h3>
        <p class="muted">Na zopakovanie je teraz ${Store.dueCount()} otázok (tréning chybičiek na hlavnej obrazovke).</p>
        <div class="weak-list">${weak.length
          ? weak.map(x => { const l = keyLabel(x.key); return `<span class="weak-chip">${pic(l.p)} <b>${esc(l.t.length > 40 ? l.t.slice(0, 38) + '…' : l.t)}</b> <span class="muted">✗${x.e.w} ✓${x.e.c}</span></span>`; }).join('')
          : '<span class="muted">Zatiaľ nič – super! 🎉</span>'}</div>
      </section>

      <section class="card p-sec">
        <h2>💾 Záloha a prenos na iný počítač</h2>
        ${storageInfoHTML()}
        <p class="muted">Posledný export: ${s.lastExport ? fmtDateTime(s.lastExport) : 'ešte nikdy'}${Store.storageOK ? '' : ' · ⚠️ Prehliadač nedovoľuje ukladať – postup sa po zatvorení stratí!'}</p>
        <div class="f-inline">
          <button class="btn small blue" id="export">⬇ Exportovať postup</button>
          <label class="btn small ghost">⬆ Importovať zálohu<input type="file" id="import" accept=".json,application/json" hidden></label>
        </div>
      </section>

      ${creditsHTML()}

      <section class="card p-sec danger">
        <h2>🧹 Začať odznova</h2>
        <p class="muted">Vymaže všetky hviezdičky, peniažky, nákupy a odznaky. Meno a nastavenia ostanú.</p>
        <button class="btn small red" id="reset">Vymazať postup</button>
      </section>
    </div>`;

  const rerender = () => { Topbar.shown = Store.state.wallet.balance; Topbar.render(); renderParent(); };

  $('#pay-btn').onclick = () => {
    const c = Math.round(parseFloat(String($('#pay-amt').value).replace(',', '.')) * 100);
    if (!(c > 0)) { toast('Zadajte sumu'); return; }
    if (c > Store.state.wallet.balance) { toast('V pokladničke je menej peňazí'); return; }
    Store.payout(c);
    toast(`Vyplatené ${fmtMoney(c)} ✓`);
    rerender();
  };
  $('#pay-all').onclick = () => {
    const c = Store.state.wallet.balance;
    if (c > 0 && confirm(`Vyplatiť celý zostatok ${fmtMoney(c)}?`)) { Store.payout(c); toast(`Vyplatené ${fmtMoney(c)} ✓`); rerender(); }
  };
  $('#save-rw').onclick = () => {
    $$('[data-rw]').forEach(i => { R[i.dataset.rw] = Math.max(0, Math.round((parseFloat(i.value) || 0) * 100)); });
    Store.save();
    toast('Odmeny uložené ✓');
  };
  $('#shop-on').onchange = e => { s.settings.shopEnabled = e.target.checked; Store.save(); Topbar.render(); toast(e.target.checked ? 'Obchod je zapnutý' : 'Obchod je vypnutý'); };
  $('#save-name').onclick = () => {
    s.profile.name = $('#name-in').value.trim();
    Store.save();
    Topbar.render();
    toast('Meno uložené ✓');
  };
  $('#voice-sk').onchange = e => { s.settings.voiceSk = e.target.value; Speech.bad.clear(); Store.save(); Speech.say(`Ahoj ${s.profile.name}! Ja som líška Bystrulka.`.replace(' !', '!')); };
  $('#rate').oninput = e => { s.settings.rate = parseFloat(e.target.value); $('#rate-val').textContent = s.settings.rate; Store.save(); };
  $('#test-sk').onclick = () => Speech.say(`Ahoj ${s.profile.name}! Poďme spolu objavovať svet. Vieš, ktorá planéta je najväčšia?`.replace(' !', '!'));
  $('#read-q').onchange = e => { s.settings.readQ = e.target.checked; Store.save(); };
  $('#read-instr').onchange = e => { s.settings.readInstr = e.target.checked; if (e.target.checked) s.seenInstr = {}; Store.save(); };
  $('#sfx').onchange = e => { s.settings.sfx = e.target.checked; Store.save(); Sfx.play('good'); };
  $('#unlock-all').onchange = e => { s.settings.unlockAll = e.target.checked; Store.save(); toast(e.target.checked ? 'Všetky lekcie sú odomknuté' : 'Lekcie sa odomykajú postupne'); };
  $('#export').onclick = () => {
    s.lastExport = Date.now();
    Store.save();
    const blob = new Blob([JSON.stringify(Store.state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `objavujem-svet-zaloha-${dayKey()}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    toast('Záloha stiahnutá ✓');
    setTimeout(renderParent, 300);
  };
  $('#import').onchange = e => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const obj = JSON.parse(rd.result);
        if (!obj || !obj.profile || !obj.wallet || !obj.progress) throw new Error('bad');
        if (!confirm(`Načítať zálohu „${f.name}“? Aktuálny postup na tomto počítači sa nahradí.`)) return;
        Store.replace(obj);
        toast('Postup načítaný ✓');
        rerender();
      } catch (err) {
        toast('⚠️ Toto nie je platná záloha');
      }
    };
    rd.readAsText(f);
  };
  $('#reset').onclick = () => {
    if (!confirm('Naozaj vymazať všetok postup (hviezdičky, peniažky, nákupy, odznaky)?')) return;
    if (!confirm('Určite? Toto sa nedá vrátiť (ak nemáte zálohu).')) return;
    Store.reset();
    toast('Postup vymazaný');
    rerender();
  };

  const fillVoices = () => {
    const ss = $('#voice-sk');
    if (!ss) return;
    const st = Store.state.settings;
    const sk = Speech.skVoices();
    const opt = v => `<option value="${esc(v.voiceURI)}">${esc(v.name)} (${esc(v.lang)})${v.localService ? '' : ' 🌐'}</option>`;
    const auto = Speech.skVoice();
    ss.innerHTML = `<option value="">Automaticky – ${esc(auto ? auto.name : 'nenašiel sa hlas')}</option>` + sk.map(opt).join('');
    ss.value = sk.some(v => v.voiceURI === st.voiceSk) ? st.voiceSk : '';
    const tip = $('#voice-tip');
    if (!Speech.supported) tip.innerHTML = '⚠️ Tento prehliadač nevie čítať nahlas. Odporúčame Microsoft Edge alebo Google Chrome.';
    else if (!sk.length) tip.innerHTML = '⚠️ Nenašiel sa slovenský hlas – otázky sa nebudú čítať nahlas. V Microsoft Edge sú online hlasy „Viktória“ a „Lukáš“ (potrebujú internet). Vo Windows sa dá doinštalovať: <b>Nastavenia → Čas a jazyk → Reč → Pridať hlasy → slovenčina</b>.';
    else tip.innerHTML = 'Tip: najprirodzenejšie znejú hlasy „Natural“ v prehliadači Microsoft Edge (🌐 = online hlas, potrebuje internet; bez internetu sa použije hlas z Windows, ak je nainštalovaný).';
  };
  fillVoices();
  Speech.onvoices = fillVoices;
}

/* ============================== ŠTART ============================== */
function showWelcome() {
  const s = Store.state;
  const m = Modal.open(`
    <div class="welcome">
      <div class="owl big bob">${FOX}</div>
      <h2>Ahoj${s.profile.name ? ' ' + esc(s.profile.name) : ''}! 👋</h2>
      <p>Ja som <b>líška Bystrulka</b> a spolu budeme objavovať svet – mapy a vlajky, prírodu, vesmír, telo, čísla aj písmenká.</p>
      <div class="w-rules">
        <div><span class="emo">⭐</span> Za každú úlohu získaš hviezdičky.</div>
        <div><span class="emo">🪙</span> Za hviezdičky dostaneš peniažky do pokladničky 🐷.</div>
        <div><span class="emo">🏅</span> Za celú lekciu získaš odznak, za celú oblasť diplom 📜.</div>
        ${s.settings.shopEnabled ? '<div><span class="emo">🛍️</span> V obchode si môžeš kúpiť korunku, okuliare aj kamaráta.</div>' : ''}
      </div>
      <label class="w-name"><b>Ako sa voláš?</b> <input type="text" id="w-name" value="${esc(s.profile.name)}" maxlength="20" placeholder="tvoje meno" autocomplete="off"></label>
      <p><b>Vyber si svoj obrázok:</b></p>
      <div class="avatar-grid">${AVATARS.map(a => `<button class="avatar-opt ${a === s.profile.avatar ? 'sel' : ''}" data-av="${a}">${a}</button>`).join('')}</div>
      <button class="btn pink big start">Poďme na to! 🚀</button>
    </div>`);
  $$('.avatar-opt', m).forEach(b => b.onclick = () => {
    s.profile.avatar = b.dataset.av;
    $$('.avatar-opt', m).forEach(x => x.classList.toggle('sel', x === b));
    Sfx.play('click');
    Topbar.render();
  });
  $('.start', m).onclick = () => {
    s.profile.name = $('#w-name', m).value.trim().slice(0, 20);
    s.welcomed = true;
    Store.save();
    Modal.close();
    Topbar.render();
    App.route();                                                     // pozdrav na hlavnej obrazovke už s menom
    Sfx.play('win');
    Speech.say(`Ahoj ${s.profile.name}! Poďme objavovať svet!`.replace(' !', '!'));
  };
}

function decorateBg() {
  const items = ['☁️', '✨', '🌍', '☁️', '⭐', '🌿', '☁️', '🪐', '⭐'];
  $('#bg').innerHTML = items.map(e =>
    `<span style="left:${rand(2, 92).toFixed(1)}%;top:${rand(5, 88).toFixed(1)}%;font-size:${randInt(28, 58)}px;animation-delay:${(-rand(0, 9)).toFixed(1)}s">${e}</span>`
  ).join('');
}

/* autori fotiek (licencie CC BY / CC BY-SA vyžadujú uvedenie autora) */
function creditsHTML() {
  const rows = [];
  if (typeof FOTO !== 'undefined') for (const k in FOTO) { const F = FOTO[k]; rows.push({ n: F.n || k, a: F.a, l: F.l, u: F.u }); }
  for (const k in CUSTOM_BOARDS) { const c = CUSTOM_BOARDS[k].credit; if (c) rows.push({ n: 'obrázok ' + (k === 'body' ? 'tela' : k === 'organs' ? 'orgánov' : k), a: c.author, l: c.license, u: c.page }); }
  if (!rows.length) return '';
  rows.sort((x, y) => x.n.localeCompare(y.n, 'sk'));
  return `<section class="card p-sec">
    <h2>📷 Zdroje obrázkov</h2>
    <p class="muted">Fotky pochádzajú z Wikimedia Commons a sú pod voľnými licenciami. Mapy: Natural Earth (voľné dielo), vlajky: flag-icons (MIT).</p>
    <details class="credits"><summary>Zobraziť autorov (${rows.length})</summary>
      <ul>${rows.map(r => `<li><b>${esc(r.n)}</b> – ${esc(r.a || 'neznámy autor')}${r.l ? `, ${esc(r.l)}` : ''}${r.u ? ` · <a href="${esc(r.u)}" target="_blank" rel="noopener">zdroj</a>` : ''}</li>`).join('')}</ul>
    </details>
  </section>`;
}

function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen();
  else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
}

async function init() {
  prepareData();
  injectDefs();
  Store.load();
  await Store.syncWithServer();
  Speech.init();
  TapFx.init();
  decorateBg();

  // 🔊 – čokoľvek s data-sk prečíta text po slovensky (a nespustí nič iné)
  document.addEventListener('click', e => {
    const s = e.target.closest('[data-sk]');
    if (!s) return;
    e.stopPropagation();
    e.preventDefault();
    if (!Speech.hasSk()) { toast('🔇 Nenašiel sa slovenský hlas (pozri Rodičovskú zónu)'); return; }
    Speech.say(s.dataset.sk);
    s.classList.remove('speaking'); void s.offsetWidth; s.classList.add('speaking');
  }, true);

  document.addEventListener('click', e => {
    const g = e.target.closest('[data-go]');
    if (g) {
      Sfx.play('click');
      const h = g.dataset.go;
      if (location.hash === h) App.route(); else location.hash = h;
      return;
    }
    const lk = e.target.closest('[data-locked]');
    if (lk) {
      Sfx.play('bad');
      toast(lk.dataset.locked === '1' ? '🔒 Najprv dokonči predchádzajúcu lekciu' : lk.dataset.locked);
      return;
    }
    if (e.target.closest('#fs-btn')) toggleFullscreen();
  });

  document.addEventListener('pointerdown', () => Sfx.ac(), { once: true });
  window.addEventListener('hashchange', () => App.route());
  window.addEventListener('pagehide', () => { Store.save(); Store.flushServer(); });
  // iné okno (karta v prehliadači / nainštalovaná aplikácia) mohlo medzitým uložiť novší postup → prevziať ho
  let staleUI = false;
  const freshTop = () => { Topbar.shown = null; Topbar.render(); };   // aj pokladnička hneď s novou sumou (bez animácie)
  const refreshUI = () => { staleUI = false; Modal.close(); freshTop(); App.route(); toast('🔄 Načítal sa najnovší postup'); };
  Store.onExternal = () => {
    if (document.hidden) {
      // okno v pozadí: postup je už nový, len sa zastaví rozohraná hra (nech nehovorí a nehrá);
      // obrazovka sa obnoví, keď sa dieťa do okna vráti
      staleUI = true;
      try { App.cleanup(); } catch (e) { /* nič */ }
      App.cleanup = () => {};
    } else if (!staleUI && /^#\/play\//.test(location.hash)) {   // hru zastavenú v pozadí treba spustiť znova (nižšie)
      freshTop();          // rozohraná hra pokračuje už s novým postupom (výsledok sa zapíše doň), ďalšia obrazovka sa vykreslí z neho
    } else if (!document.hasFocus()) {
      staleUI = true;      // okno vedľa: prekresliť až po návrate, aby nezastavilo reč v druhom okne
    } else refreshUI();
  };
  const onBack = () => { if (!Store.refreshIfChanged() && staleUI) refreshUI(); };
  window.addEventListener('storage', e => { if (e.key === STORAGE_KEY) Store.refreshIfChanged(); });   // hneď, aj keď je okno v pozadí
  window.addEventListener('focus', onBack);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') onBack(); });
  window.addEventListener('pageshow', e => { if (e.persisted) onBack(); });

  App.route();
  if (!Store.state.welcomed) showWelcome();

  // offline režim a inštalácia na tablet – len z webu (https), lokálna verzia so serverom ho nepotrebuje
  if (Store.web && 'serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  // uložená kópia nech ostane, aj keď tabletu dochádza miesto – len v nainštalovanej aplikácii (Chrome to povolí sám, bez otázky)
  if (Store.web && navigator.storage && navigator.storage.persist && matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches) {
    navigator.storage.persisted().then(p => p || navigator.storage.persist()).catch(() => {});
  }
}

init();
