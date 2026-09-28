/* ==========================================================================
   Typy úloh (hry). Každá hra dostane `ctx`:
     ctx.L / ctx.act          – lekcia a nastavenie úlohy
     ctx.el                   – plocha hry
     ctx.correct(key) / ctx.wrong(key) – zapíše odpoveď (kľúč otázky pre tréning chybičiek)
     ctx.praise() / ctx.progress(d, t) / ctx.say(text)
     ctx.timeout(fn, ms) / ctx.interval(fn, ms) / ctx.onCleanup(fn)
     ctx.finish({ mistakes, total } | { stars })
   ========================================================================== */

const Games = {};
function defGame(type, meta, run) { Games[type] = Object.assign({ type, run }, meta); }
function actName(act) { const G = Games[act.type]; return act.title || (G ? (typeof G.name === 'function' ? G.name(act) : G.name) : act.type); }
function actIcon(act) { const G = Games[act.type]; return G ? (typeof G.icon === 'function' ? G.icon(act) : G.icon) : '❓'; }
function tpl(s, it) { return String(s).replace(/\{(\w+)\}/g, (_, k) => (it[k] != null ? it[k] : '')); }
const PRAISE = ['Výborne! 🌟', 'Super! ⭐', 'Správne! 👏', 'Áno! 🎉', 'Paráda! 🦄', 'Bravo! 💖', 'Šikulka! 👍', 'Wow! ✨', 'Presne tak! 🏆'];

/* n cieľov – neopakujú sa hneď po sebe */
function pickTargets(pool, n) {
  if (!pool.length) return [];
  let out = [];
  while (out.length < n) {
    const s = shuffle(pool);
    if (out.length && s.length > 1 && s[0] === out[out.length - 1]) {
      const j = 1 + Math.floor(Math.random() * (s.length - 1));
      [s[0], s[j]] = [s[j], s[0]];
    }
    out = out.concat(s);
  }
  return out.slice(0, n);
}
function srcLessons(ctx) {
  if (ctx.act.src === 'area') return ctx.L.pool || areaLessons(ctx.L.area).filter(x => !x.review);
  return [ctx.L];
}
function srcItems(ctx) { return srcLessons(ctx).flatMap(L => L.items || []); }
function sayBtn(text, cls = 'say-btn') {
  return text && Speech.supported ? `<button class="${cls}" data-sk="${esc(text)}" title="Prečítať nahlas">🔊</button>` : '';
}
function valHTML(v, lbl) {
  if (isPic(v)) return `<span class="o-pic">${pic(v)}</span>${lbl ? `<span class="o-lbl">${esc(lbl)}</span>` : ''}`;
  return `<span class="o-txt">${esc(v)}</span>${lbl ? `<span class="o-sub">${esc(lbl)}</span>` : ''}`;
}

/* ==========================================================================
   Spoločné kolo „vyber správnu odpoveď“
   q: { key, text, say, pic, head, opts: [{ v, ok, lbl }], f, tf }
   ========================================================================== */
function choiceRound(ctx, q, done, hooks = {}) {
  let locked = false, miss = 0;
  const opts = q.opts;
  const allPics = opts.every(o => isPic(o.v));
  const longest = Math.max(...opts.map(o => String(o.v).length));
  let cls, optCls;
  if (q.tf) { cls = 'tf-btns'; optCls = 'btn big tf-btn'; }
  else if (allPics) { cls = `opts opts-${opts.length}`; optCls = 'opt pic-opt'; }
  else if (longest > 16) { cls = 'tr-opts'; optCls = 'opt tr-opt'; }
  else { cls = `opts opts-${opts.length === 4 ? 2 : opts.length} words`; optCls = 'opt word-opt'; }
  ctx.el.innerHTML = `
    <div class="qwrap">
      <div class="qcard pop-in ${q.pic || q.head ? '' : 'noimg'}">
        ${q.head || ''}
        ${q.pic ? `<div class="q-pic">${zoomable(q.pic, pic(q.pic))}</div>` : ''}
        <div class="q-text">${esc(q.text)} ${sayBtn(q.say || q.text)}</div>
      </div>
      <div class="${cls}">${opts.map((o, i) => q.tf
        ? `<button class="${optCls} ${i === 0 ? 'green' : 'red'}" data-i="${i}">${esc(o.v)}</button>`
        : `<button class="${optCls}" data-i="${i}">${valHTML(o.v, o.lbl)}</button>`).join('')}</div>
      <div class="explain-slot"></div>
    </div>`;
  const btns = $$('[data-i]', ctx.el);
  if (hooks.onRender) hooks.onRender(btns, opts);
  if (q.onShow) {                                                // hádaj nástroj – zahraj zvuk
    const pb = $('.play-it', ctx.el);
    if (pb) pb.onclick = () => Sfx.instrument(q.onShow);
    ctx.timeout(() => Sfx.instrument(q.onShow), 400);
  } else ctx.timeout(() => ctx.say(q.say != null ? q.say : q.text), 250);
  const finishRound = () => {
    const slot = $('.explain-slot', ctx.el);
    if (q.f && slot) {
      slot.innerHTML = `<div class="explain pop-in"><span class="ex-ic emo">💡</span><span class="ex-t">${esc(q.f)}</span>${sayBtn(q.f)}
        <button class="btn green next-q">Ďalej ➜</button></div>`;
      ctx.timeout(() => ctx.say(q.f), 500);
      $('.next-q', slot).onclick = () => { Speech.stop(); done(miss); };
    } else ctx.timeout(() => done(miss), q.fast ? 800 : 1150);
  };
  btns.forEach(b => b.onclick = () => {
    if (locked || b.classList.contains('bad')) return;
    const o = opts[+b.dataset.i];
    if (o.ok) {
      locked = true;
      b.classList.add('good', 'chosen');
      Sfx.play('good');
      ctx.correct(q.key, miss === 0);
      if (!miss) ctx.praise();
      if (q.onCorrect) q.onCorrect(ctx.el);
      else if (!q.f && q.sayOk) ctx.say(q.sayOk);
      finishRound();
    } else {
      b.classList.add('bad');
      miss++;
      Sfx.play('bad');
      ctx.wrong(q.key);
      const left = btns.filter(x => !x.classList.contains('bad'));
      if (left.length === 1) {                                   // ostala len správna – ukáž ju a pokračuj
        locked = true;
        left[0].classList.add('good', 'reveal');
        finishRound();
      }
    }
  });
  return {
    remove(n) {                                                   // 50 : 50
      const wrong = shuffle(btns.filter(b => !opts[+b.dataset.i].ok && !b.classList.contains('bad')));
      wrong.slice(0, n).forEach(b => b.classList.add('gone'));
    },
    hint() { const b = btns.find(x => opts[+x.dataset.i].ok); if (b) b.classList.add('hinted'); },
  };
}

/* sada kôl za sebou – kolo je buď výber odpovede, alebo mapa */
function runRounds(ctx, list, build, res = {}) {
  let r = 0, mistakes = 0;
  const total = list.length;
  if (!total) return ctx.finish({ stars: 3 });
  const next = () => {
    if (r >= total) return ctx.finish(Object.assign({ mistakes, total }, res));
    const q = typeof build === 'function' ? build(list[r], r) : list[r];
    const fin = (m) => { mistakes += Math.min(m, 2); r++; ctx.progress(r, total); next(); };
    if (!q) { r++; return next(); }
    if (q.map) mapRound(ctx, q, fin);
    else choiceRound(ctx, q, fin);
  };
  next();
}

/* ---------- tvorba otázok ---------- */
function optsFrom(correct, wrongs, n) {
  const w = uniqBy(wrongs.filter(x => x.v !== correct.v), x => x.v);
  return shuffle([Object.assign({ ok: true }, correct)].concat(sample(w, n - 1)));
}
/* ako sa pýtať na kartičku lekcie (podľa prvej vhodnej úlohy lekcie) */
function itemMode(L) {
  const a = (L.acts || []).find(x => ['name', 'match', 'memory', 'find'].includes(x.type) && !x.only);
  if (!a) return null;
  if (a.type === 'name') return { show: a.show || 'p', ans: a.ans || 'n', ask: a.ask };
  if (a.type === 'find') return { show: 'n', ans: 'p', ask: a.ask || 'Kde je: {n}?' };
  return { show: a.a || 'p', ans: a.b || 'n' };
}
function itemQ(it, pool, mode = {}, nOpts = 3) {
  const show = mode.show || 'p', ans = mode.ans || 'n';
  const others = pool.filter(x => x !== it && x[ans] != null && x[ans] !== it[ans]);
  if (it[ans] == null || others.length < 1) return null;
  const opts = optsFrom({ v: it[ans] }, others.map(x => ({ v: x[ans] })), Math.min(nOpts, others.length + 1));
  const sv = it[show];
  let text = mode.ask ? tpl(mode.ask, it) : (isPic(sv) ? (ans === 'n' ? 'Čo je na obrázku?' : 'Čo k tomu patrí?') : `Čo patrí k slovu „${sv}“?`);
  let img = isPic(sv) ? sv : '';
  if (!img && show === 'n' && ans !== 'n' && isPic(it.p) && mode.hint !== false) img = it.p;   // napr. vlajka pri otázke na hlavné mesto
  return { key: it.key, text, pic: img, opts, sayOk: isPic(it[ans]) ? cap(it.n) : '' };
}
function quizQ(q) {
  return { key: q.key, text: q.q, pic: q.p || '', f: q.f, opts: shuffle([{ v: q.a, ok: true }].concat(q.o.map(v => ({ v })))) };
}
function tfQ(t) {
  return { key: t.key, tf: true, text: t.s, f: t.f || (t.ok ? 'Áno, je to pravda!' : 'Nie, to nie je pravda.'), fast: true,
    opts: [{ v: '✓ Pravda', ok: t.ok }, { v: '✗ Nepravda', ok: !t.ok }] };
}
function sortQ(S, it) {
  return { key: it.key, text: (S.title || 'Kam patrí?').replace(/\?$/, '') + ': ' + it.n + '?', pic: it.p, f: it.f,
    opts: shuffle(S.bins.map(b => ({ v: b.p, lbl: b.n, ok: b.id === it.b }))) };
}
function gapQ(g) {
  const shown = esc(g.w).replace('_', '<span class="gap-blank">?</span>');
  return {
    key: g.key, text: /[.?!]$/.test(g.a) || /[.?!]/.test(g.a) ? 'Aké znamienko patrí na koniec?' : 'Ktoré písmenko chýba?',
    say: '', head: `${g.p ? `<div class="q-pic small">${zoomable(g.p, pic(g.p))}</div>` : ''}<div class="gap-line">${shown}</div>`,
    opts: shuffle([{ v: g.a, ok: true }].concat(g.o.map(v => ({ v })))), fast: true,
    onCorrect: (root) => {
      const b = $('.gap-blank', root);
      if (b) { b.textContent = g.a; b.classList.add('filled'); }
      Speech.say(g.w.replace('_', g.a));
    },
  };
}
function syllCountQ(it) {
  const n = it.sy.split('-').length;
  return { key: it.key, text: `Koľko slabík má slovo „${it.n}“?`, pic: it.p, fast: true,
    opts: ['1', '2', '3', '4'].map(v => ({ v, ok: +v === n, lbl: '👏'.repeat(+v) })),
    onCorrect: (root) => { const t = $('.q-text', root); if (t) t.innerHTML = `<span class="syl-show">${esc(it.sy.replace(/-/g, ' – '))}</span>`; Speech.say(it.sy.replace(/-/g, ', '), { slow: true }); } };
}
/* otázka podľa kľúča (tréning chybičiek, mix) */
function questionFor(key) {
  const E = QREG[key];
  if (!E) return null;
  const L = E.L, x = E.ref;
  switch (E.kind) {
    case 'quiz': return quizQ(x);
    case 'tf':   return tfQ(x);
    case 'sort': return sortQ(L.sort, x);
    case 'gap':  return gapQ(x);
    case 'item': {
      if (x.sy) return syllCountQ(x);
      if (x.snd) {
        const pool = uniqBy(L.items.filter(i => i.snd), i => i.snd);
        return { key, text: 'Ktorý nástroj hrá?', sayOk: cap(x.n), head: `<button class="big-speaker play-it" title="Zahrať">🎵</button>`, onShow: x.snd,
          opts: optsFrom({ v: x.p, lbl: x.n }, pool.filter(i => i !== x).map(i => ({ v: i.p, lbl: i.n })), 3) };
      }
      const board = x.b || L.board;
      const t = board && L.acts.some(a => a.type === 'map') ? mapTargetOf(x, board) : null;
      const mode = itemMode(L);
      const iq = mode ? itemQ(x, L.items, mode, 3) : null;
      if (t && (!iq || Math.random() < 0.5)) return { map: true, key, board, t, it: x, pool: L.items };
      return iq;
    }
  }
  return null;
}

/* ==========================================================================
   SPOZNAJ – kartičky
   ========================================================================== */
function locPic(L, it) {
  const board = it.b || L.board;
  if (!board || !MAP_DATA[board] || /^(map|pt|line):/.test(it.p || '')) return '';
  if (it.pt) return pic(`pt:${board}:${it.pt[0]}:${it.pt[1]}`);
  if (it.line) return pic(`line:${board}:${it.line}`);
  if (it.id && !OCEANS.includes(it.id) && boardRegions(board, it.id).length) return pic(`map:${board}:${it.id}`);
  if (it.id && OCEANS.includes(it.id)) return pic(`map:${board}:${it.id}`);
  return '';
}
defGame('learn', {
  name: 'Spoznaj', icon: '📖',
  instr: 'Pozri si kartičky a vypočuj si, čo je na nich. Šípkou ▶ pokračuj ďalej.',
}, function (ctx) {
  const cards = ctx.L.items;
  let i = 0;
  function draw() {
    const it = cards[i], last = i === cards.length - 1;
    const where = locPic(ctx.L, it);
    const readText = cap(it.n) + '. ' + (it.f || '');
    ctx.el.innerHTML = `
      <div class="learn">
        <button class="nav prev" ${i === 0 ? 'disabled' : ''} title="Späť">◀</button>
        <div class="flash pop-in">
          <div class="flash-pic ${where ? 'has-map' : ''}">${zoomable(it.p, pic(it.p), it.n)}</div>
          <div class="flash-name">${esc(cap(it.n))}</div>
          ${it.f ? `<div class="flash-fact">${esc(it.f)}</div>` : ''}
          ${where ? `<div class="flash-map">${where}</div>` : ''}
        </div>
        <button class="nav next ${last ? 'done' : ''}" title="Ďalej">${last ? '✓' : '▶'}</button>
      </div>
      <div class="learn-tools">
        ${Speech.supported ? `<button class="btn blue" data-sk="${esc(readText)}">🔊 Prečítaj</button>` : ''}
        ${it.snd ? `<button class="btn orange play-snd">🎵 Zahraj</button>` : ''}
      </div>
      <div class="dots">${cards.map((_, k) => `<span class="${k === i ? 'on' : k < i ? 'seen' : ''}"></span>`).join('')}</div>`;
    ctx.progress(i + 1, cards.length);
    ctx.timeout(() => ctx.say(readText), 300);
    if (it.snd) { $('.play-snd', ctx.el).onclick = () => Sfx.instrument(it.snd); ctx.timeout(() => Sfx.instrument(it.snd), 200); }
    $('.prev', ctx.el).onclick = () => { if (i > 0) { i--; Sfx.play('flip'); draw(); } };
    $('.next', ctx.el).onclick = () => {
      Sfx.play('flip');
      if (last) ctx.finish({ learn: true, stars: 3 });
      else { i++; draw(); }
    };
  }
  draw();
});

/* ==========================================================================
   NÁJDI OBRÁZOK / AKO SA TO VOLÁ / KVÍZ / PRAVDA ČI NIE
   ========================================================================== */
defGame('find', {
  name: 'Nájdi obrázok', icon: '🔍',
  instr: 'Prečítaj si, čo máš nájsť, a ťukni na správny obrázok.',
}, function (ctx) {
  const pool = uniqBy(srcItems(ctx).filter(x => isPic(x.p)), x => x.p);
  const n = Math.min(ctx.act.opts || 3, pool.length);
  const targets = pickTargets(pool, ctx.act.rounds || 6);
  runRounds(ctx, targets, t => ({
    key: t.key, text: tpl(ctx.act.ask || 'Kde je: {n}?', t), sayOk: cap(t.n),
    opts: optsFrom({ v: t.p }, pool.filter(x => x !== t).map(x => ({ v: x.p })), n),
  }));
});

defGame('name', {
  name: 'Ako sa to volá?', icon: '🏷️',
  instr: 'Pozri sa a vyber správnu odpoveď.',
}, function (ctx) {
  const a = ctx.act, mode = { show: a.show || 'p', ans: a.ans || 'n', ask: a.ask };
  const pool = srcItems(ctx).filter(x => x[mode.ans] != null && x[mode.show] != null);
  const targets = pickTargets(pool, a.rounds || 6);
  runRounds(ctx, targets, t => itemQ(t, pool, mode, a.opts || 3));
});

defGame('quiz', {
  name: 'Kvíz', icon: '❓',
  instr: 'Prečítaj si otázku a vyber správnu odpoveď.',
}, function (ctx) {
  const qs = sample(srcLessons(ctx).flatMap(L => L.quiz || []), ctx.act.rounds || 6);
  runRounds(ctx, qs, quizQ);
});

defGame('tf', {
  name: 'Pravda či nie?', icon: '✅',
  instr: 'Je to pravda, alebo nie? Ťukni na Pravda alebo Nepravda.',
}, function (ctx) {
  const ts = sample(srcLessons(ctx).flatMap(L => L.tf || []), ctx.act.rounds || 6);
  runRounds(ctx, ts, tfQ);
});

/* ==========================================================================
   PRIRAĎOVAČKA a PEXESO
   ========================================================================== */
function pairPool(ctx) {
  const a = ctx.act.a || 'p', b = ctx.act.b || 'n';
  let items = srcItems(ctx).filter(x => x[a] != null && x[b] != null);
  if (ctx.act.only === 'row') items = items.filter(x => /^row:/.test(x.p));
  if (ctx.act.flags) items = items.filter(x => /^flag:/.test(x.p));
  if (ctx.act.src === 'area' && !ctx.act.flags) items = items.filter(x => isPic(x.p) && !/^(map|pt|line):/.test(x.p));
  return uniqBy(uniqBy(items, x => String(x[a])), x => String(x[b]));
}
function faceHTML(v) {
  if (isPic(v)) return `<span class="f-pic">${pic(v)}</span>`;
  const s = String(v), longest = Math.max(...s.split(/\s+/).map(w => w.length));
  return `<span class="f-txt${longest > 11 ? ' xlong' : s.length > 11 || longest > 8 ? ' long' : ''}">${esc(v)}</span>`;
}
defGame('match', {
  name: 'Priraďovačka', icon: '🔗',
  instr: 'Ťukni na kartičku vľavo a potom na tú, ktorá k nej patrí, vpravo.',
}, function (ctx) {
  const a = ctx.act.a || 'p', b = ctx.act.b || 'n';
  const pool = pairPool(ctx);
  const ws = sample(pool, Math.min(ctx.act.pairs || 4, pool.length));
  const left = shuffle(ws), right = shuffle(ws);
  const PC = ['#ff5fa2', '#7c5cff', '#3fa9f5', '#2fc97a', '#ff9d3d', '#00b8a9', '#e6a100'];
  let selL = null, selR = null, done = 0, mistakes = 0;
  ctx.el.innerHTML = `
    <div class="match">
      <div class="col">${left.map((w, i) => `<button class="opt m-item" data-side="L" data-i="${i}">${faceHTML(w[a])}</button>`).join('')}</div>
      <div class="col">${right.map((w, i) => `<button class="opt m-item" data-side="R" data-i="${i}">${faceHTML(w[b])}</button>`).join('')}</div>
    </div>`;
  const items = $$('.m-item', ctx.el);
  const btn = (side, i) => items.find(x => x.dataset.side === side && +x.dataset.i === i);
  items.forEach(el => el.onclick = () => {
    if (el.classList.contains('matched')) return;
    const i = +el.dataset.i;
    if (el.dataset.side === 'L') selL = (selL === i) ? null : i;
    else selR = (selR === i) ? null : i;
    items.forEach(x => x.classList.remove('selected'));
    if (selL != null) btn('L', selL).classList.add('selected');
    if (selR != null) btn('R', selR).classList.add('selected');
    if (selL == null || selR == null) { Sfx.play('click'); return; }
    const x = btn('L', selL), y = btn('R', selR);
    if (left[selL] === right[selR]) {
      const col = PC[done % PC.length];
      [x, y].forEach(z => { z.classList.remove('selected'); z.classList.add('matched'); z.style.setProperty('--pc', col); });
      Sfx.play('good');
      ctx.correct(left[selL].key, true);
      Speech.say(cap(left[selL].n));
      done++; ctx.progress(done, ws.length);
      if (done === ws.length) { ctx.praise(); ctx.timeout(() => ctx.finish({ mistakes, total: ws.length }), 1000); }
    } else {
      mistakes++; ctx.wrong(left[selL].key); Sfx.play('bad');
      [x, y].forEach(z => { z.classList.remove('selected'); z.classList.add('shake'); setTimeout(() => z.classList.remove('shake'), 450); });
    }
    selL = selR = null;
  });
});

defGame('memory', {
  name: 'Pexeso', icon: '🃏',
  instr: 'Otáčaj kartičky a nájdi dvojice, ktoré k sebe patria.',
}, function (ctx) {
  const a = ctx.act.a || 'p', b = ctx.act.b || 'n';
  const pool = pairPool(ctx);
  const n = Math.min(ctx.act.pairs || 4, pool.length);
  const ws = sample(pool, n);
  const cards = shuffle(ws.flatMap((w, k) => [{ k, w, v: w[a] }, { k, w, v: w[b] }]));
  const cols = cards.length <= 8 ? 4 : cards.length <= 10 ? 5 : 4;
  ctx.el.innerHTML = `<div class="memory" style="--cols:${cols}">${cards.map((c, i) => `
    <button class="mcard" data-i="${i}">
      <div class="mc-inner">
        <div class="mc-back"><span>?</span></div>
        <div class="mc-front ${isPic(c.v) ? 'pic' : 'word'}">${faceHTML(c.v)}</div>
      </div>
    </button>`).join('')}</div>`;
  const els = $$('.mcard', ctx.el);
  // dlhé slová (brachiosaurus…) zmenši tak, aby sa zmestili bez delenia
  requestAnimationFrame(() => $$('.mc-front .f-txt', ctx.el).forEach(t => {
    t.style.overflowWrap = 'normal';
    const cs = getComputedStyle(t), avail = t.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const widest = () => { const r = document.createRange(); r.selectNodeContents(t); return Math.max(0, ...[...r.getClientRects()].map(x => x.width)); };
    const front = t.parentElement, availH = front.clientHeight - 8;
    let fs = parseFloat(cs.fontSize);
    while (fs > 11 && (widest() > avail || t.scrollHeight > availH)) { fs -= .5; t.style.fontSize = fs + 'px'; }
    t.style.overflowWrap = '';
  }));
  let open = [], found = 0, mistakes = 0, lock = false;
  els.forEach(el => el.onclick = () => {
    const i = +el.dataset.i;
    if (lock || el.classList.contains('flipped') || el.classList.contains('found')) return;
    el.classList.add('flipped');
    Sfx.play('flip');
    open.push(i);
    if (open.length < 2) return;
    lock = true;
    const [x, y] = open;
    if (cards[x].k === cards[y].k) {
      ctx.timeout(() => {
        els[x].classList.add('found'); els[y].classList.add('found');
        ctx.correct(cards[x].w.key, true);
        Sfx.play('good');
        Speech.say(cap(cards[x].w.n));
        found++; open = []; lock = false;
        ctx.progress(found, n);
        if (found === n) {
          ctx.praise();
          const stars = mistakes <= n + 1 ? 3 : mistakes <= 2 * n + 2 ? 2 : 1;
          ctx.timeout(() => ctx.finish({ stars, mistakes, memory: true }), 900);
        }
      }, 500);
    } else {
      mistakes++;
      ctx.timeout(() => {
        els[x].classList.remove('flipped'); els[y].classList.remove('flipped');
        open = []; lock = false;
      }, 1200);
    }
  });
});

/* ==========================================================================
   TRIEDIČKA, ČO SEM NEPATRÍ, BALÓNIKY
   ========================================================================== */
function sortData(ctx) {
  if (ctx.act.src === 'area') {
    const ls = srcLessons(ctx).filter(L => L.sort);
    if (ls.length) return pick(ls).sort;
  }
  return ctx.L.sort;
}
/* vyber položky tak, aby bol zastúpený každý kôš */
function balanced(S, n) {
  const byBin = S.bins.map(b => shuffle(S.items.filter(i => i.b === b.id)));
  const out = [];
  for (let k = 0; out.length < Math.min(n, S.items.length); k++) {
    byBin.forEach(list => { if (list[k] && out.length < n) out.push(list[k]); });
    if (k > 50) break;
  }
  return shuffle(out);
}

defGame('sort', {
  name: 'Triedička', icon: '🧺',
  instr: 'Kam to patrí? Ťukni na správny košík – alebo obrázok do košíka potiahni.',
}, function (ctx) {
  const S = sortData(ctx);
  const list = balanced(S, ctx.act.rounds || 10);
  let r = 0, mistakes = 0;
  ctx.el.innerHTML = `
    <div class="sort">
      <div class="sort-title">${esc(S.title || 'Kam to patrí?')} ${sayBtn(S.title || 'Kam to patrí?')}</div>
      <div class="sort-stage"></div>
      <div class="bins bins-${S.bins.length}">${S.bins.map(b => `
        <button class="bin" data-b="${b.id}"><span class="bin-pic">${pic(b.p)}</span><span class="bin-name">${esc(b.n)}</span><span class="bin-count">0</span></button>`).join('')}</div>
    </div>`;
  const stage = $('.sort-stage', ctx.el), bins = $$('.bin', ctx.el);
  const counts = {};
  let cur = null, local = 0, locked = false;

  function next() {
    if (r >= list.length) return ctx.finish({ mistakes, total: list.length });
    cur = list[r]; local = 0; locked = false;
    bins.forEach(b => b.classList.remove('hint'));
    stage.innerHTML = `<div class="sort-card pop-in"><span class="sc-pic">${pic(cur.p)}</span><span class="sc-name">${esc(cur.n)}</span></div>`;
    ctx.timeout(() => ctx.say(cap(cur.n)), 200);
    enableDrag($('.sort-card', stage));
  }
  function choose(binId) {
    if (locked || !cur) return;
    const bin = bins.find(b => b.dataset.b === binId);
    if (!bin) return;
    if (binId === cur.b) {
      locked = true;
      ctx.correct(cur.key, local === 0);
      Sfx.play('drop');
      if (!local) ctx.praise();
      counts[binId] = (counts[binId] || 0) + 1;
      $('.bin-count', bin).textContent = counts[binId];
      bin.classList.remove('bump'); void bin.offsetWidth; bin.classList.add('bump');
      const card = $('.sort-card', stage);
      if (card) {
        const cr = card.getBoundingClientRect(), br = bin.getBoundingClientRect();
        card.style.transition = 'transform .45s ease-in, opacity .45s';
        card.style.transform = `translate(${br.left + br.width / 2 - (cr.left + cr.width / 2)}px, ${br.top + br.height / 2 - (cr.top + cr.height / 2)}px) scale(.3)`;
        card.style.opacity = '0';
      }
      r++; ctx.progress(r, list.length);
      if (cur.f && local) toast('💡 ' + esc(cur.f), 2600);
      ctx.timeout(next, cur.f && local ? 1500 : 700);
    } else {
      local++; mistakes++;
      Sfx.play('bad');
      ctx.wrong(cur.key);
      bin.classList.remove('wrong'); void bin.offsetWidth; bin.classList.add('wrong');
      const card = $('.sort-card', stage);
      if (card) { card.style.transform = ''; card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake'); }
      if (cur.f) toast('💡 ' + esc(cur.f), 2600);
      if (local >= 2) bins.find(b => b.dataset.b === cur.b).classList.add('hint');
    }
  }
  function enableDrag(card) {
    if (!card) return;
    let sx = 0, sy = 0, drag = false, id = null;
    card.addEventListener('pointerdown', e => {
      if (locked) return;
      id = e.pointerId; sx = e.clientX; sy = e.clientY; drag = false;
      card.setPointerCapture(id);
      card.classList.add('grab');
    });
    card.addEventListener('pointermove', e => {
      if (e.pointerId !== id) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (!drag && Math.hypot(dx, dy) > 8) drag = true;
      if (drag) card.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx / 20}deg)`;
      bins.forEach(b => { const q = b.getBoundingClientRect(); b.classList.toggle('over', drag && e.clientX > q.left && e.clientX < q.right && e.clientY > q.top && e.clientY < q.bottom); });
    });
    const end = e => {
      if (e.pointerId !== id) return;
      id = null;
      card.classList.remove('grab');
      bins.forEach(b => b.classList.remove('over'));
      if (!drag) return;
      const hit = bins.find(b => { const q = b.getBoundingClientRect(); return e.clientX > q.left && e.clientX < q.right && e.clientY > q.top && e.clientY < q.bottom; });
      if (hit) choose(hit.dataset.b);
      else { card.style.transition = 'transform .25s'; card.style.transform = ''; setTimeout(() => { card.style.transition = ''; }, 260); }
    };
    card.addEventListener('pointerup', end);
    card.addEventListener('pointercancel', end);
  }
  bins.forEach(b => b.onclick = () => choose(b.dataset.b));
  next();
});

function oddQ(S) {
  const withN = n => S.bins.filter(b => S.items.filter(i => i.b === b.id).length >= n);
  const A = pick(withN(3).length ? withN(3) : withN(2));
  const others = S.bins.filter(b => b !== A && S.items.some(i => i.b === b.id));
  if (!A || !others.length) return null;
  const B = pick(others);
  const three = sample(S.items.filter(i => i.b === A.id), 3), one = pick(S.items.filter(i => i.b === B.id));
  return {
    key: one.key, text: 'Čo sem nepatrí?',
    opts: shuffle(three.map(i => ({ v: i.p, lbl: i.n })).concat([{ v: one.p, lbl: one.n, ok: true }])),
    f: `${cap(one.n)} patrí inam (${B.n}). Ostatné: ${A.n}.`,
  };
}
defGame('odd', {
  name: 'Čo sem nepatrí?', icon: '🙈',
  instr: 'Jedna vec medzi ostatné nepatrí. Nájdeš ju?',
}, function (ctx) {
  const list = Array.from({ length: ctx.act.rounds || 5 }, () => sortData(ctx));
  runRounds(ctx, list, S => oddQ(S));
});

defGame('balloons', {
  name: 'Balóniky', icon: '🎈',
  instr: (act) => act.mode === 'math' ? 'Vypočítaj príklad a praskni balónik so správnym výsledkom!' : 'Praskni len tie balóniky, ktoré patria do skupiny hore!',
}, function (ctx) {
  const math = ctx.act.mode === 'math';
  const S = math ? null : sortData(ctx);
  const need = ctx.act.rounds || 5;
  const COLORS = ['#ff6fae', '#7c5cff', '#3fa9f5', '#2fc97a', '#ffc83d', '#ff9d3d', '#ff5d5d', '#00b8a9'];
  let r = 0, mistakes = 0, lastLane = -1, running = true, sinceTarget = 0;
  let bin = null, ex = null;
  let goodBins = S ? S.bins.filter(b => S.items.filter(i => i.b === b.id).length >= 2) : [];
  if (S && !goodBins.length) goodBins = S.bins.filter(b => S.items.some(i => i.b === b.id));
  ctx.el.innerHTML = `<div class="bt"></div><div class="sky"></div>`;
  const sky = $('.sky', ctx.el), bt = $('.bt', ctx.el);

  function newTarget() {
    if (math) {
      ex = MATH_GEN[ctx.act.gen || 'add20']();
      bt.innerHTML = `<div class="bt-eq">${eqHTML(ex.parts)}</div>`;
      $$('.balloon', sky).forEach(b => b.remove());
      ctx.say(ex.say || '');
    } else {
      const prev = bin;
      bin = pick(goodBins.filter(b => b !== prev).length ? goodBins.filter(b => b !== prev) : goodBins);
      bt.innerHTML = `<span class="bt-lbl">Praskni:</span><span class="bt-pic">${pic(bin.p)}</span><span class="bt-name">${esc(bin.n)}</span>`;
      ctx.say('Praskni: ' + bin.n);
    }
    sinceTarget = 3;
  }
  const isTarget = v => math ? v === ex.ans : v.b === bin.id;
  function spawn() {
    if (!running) return;
    const alive = $$('.balloon:not(.popped)', sky);
    if (alive.length >= 6) return;
    let v;
    if (math) {
      const has = alive.some(b => b._v === ex.ans);
      if (!has && (sinceTarget >= 1 || Math.random() < 0.5)) v = ex.ans;
      else { do { v = Math.max(0, ex.ans + pick([-10, -2, -1, 1, 2, 3, 10])); } while (v === ex.ans); }
    } else {
      const want = !alive.some(b => isTarget(b._v)) && (sinceTarget >= 1 || Math.random() < 0.5);
      const pool = S.items.filter(i => want ? i.b === bin.id : Math.random() < 0.35 ? i.b === bin.id : i.b !== bin.id);
      v = pick(pool.length ? pool : S.items);
    }
    sinceTarget = isTarget(v) ? 0 : sinceTarget + 1;
    let lane;
    do { lane = randInt(0, 4); } while (lane === lastLane);
    lastLane = lane;
    const b = document.createElement('div');
    b.className = 'balloon';
    b._v = v;
    b.style.cssText = `left:${12 + lane * 19 + rand(-4, 4)}%; --bc:${pick(COLORS)}; animation-duration:${rand(7, 9.5).toFixed(2)}s`;
    const inner = math ? `<span class="b-word">${v}</span>` : `<span class="b-pic">${pic(v.p)}</span>`;
    b.innerHTML = `<div class="b-body">${inner}</div><div class="b-knot"></div><div class="b-string"></div>`;
    b.addEventListener('animationend', e => { if (e.target === b) b.remove(); });
    b.addEventListener('pointerdown', e => { e.preventDefault(); hit(b); });
    sky.appendChild(b);
  }
  function hit(b) {
    if (!running || b.classList.contains('popped')) return;
    if (isTarget(b._v)) {
      b.classList.add('popped');
      Sfx.play('pop');
      ctx.correct(math ? null : b._v.key, true);
      if (math) Store.state.stats.mathOk++;
      ctx.praise();
      if (!math) Speech.say(cap(b._v.n));
      setTimeout(() => b.remove(), 400);
      r++; ctx.progress(r, need);
      if (r >= need) {
        running = false;
        ctx.timeout(() => ctx.finish({ mistakes, total: need }), 900);
      } else if (math || r % 3 === 0) ctx.timeout(newTarget, 600);
    } else {
      mistakes++;
      Sfx.play('bad');
      ctx.wrong(math ? null : b._v.key);
      b.classList.remove('wrong'); void b.offsetWidth; b.classList.add('wrong');
      if (!math) toast(`${esc(cap(b._v.n))} – to nie je ${esc(bin.n)}`, 1600);
    }
  }
  newTarget();
  spawn();
  ctx.timeout(spawn, 500);
  ctx.interval(spawn, 1100);
});

/* ==========================================================================
   ZORAĎ (aj slabiky a abeceda)
   ========================================================================== */
const ABC_FULL = 'a á ä b c č d ď dz dž e é f g h ch i í j k l ĺ ľ m n ň o ó ô p q r ŕ s š t ť u ú v w x y ý z ž'.split(' ');
const ABC_COMMON = new Set('a b c č d ď e f g h ch i j k l ľ m n ň o p r s š t ť u v z ž'.split(' '));
const ABC_SUB = ABC_FULL.filter(l => ABC_COMMON.has(l));
const ABC_WORDS = [['auto', '🚗'], ['banán', '🍌'], ['citrón', '🍋'], ['čiapka', '🧢'], ['dom', '🏠'], ['ďateľ', '🐦'], ['ežko', ''], ['figa', ''], ['gitara', '🎸'],
  ['hrad', '🏰'], ['ihla', '🪡'], ['jablko', '🍎'], ['kvet', '🌸'], ['líška', '🦊'], ['mačka', '🐈'], ['nos', '👃'], ['oko', '👁️'], ['pes', '🐕'],
  ['ruža', '🌹'], ['slon', '🐘'], ['šál', '🧣'], ['tiger', '🐅'], ['ucho', '👂'], ['vlak', '🚂'], ['zebra', '🦓'], ['žaba', '🐸']].filter(w => w[1]);
const DAYS = ['pondelok', 'utorok', 'streda', 'štvrtok', 'piatok', 'sobota', 'nedeľa'];

function orderSeqs(ctx) {
  const a = ctx.act, n = a.rounds || 3;
  const gen = {
    abc: () => { const k = randInt(0, ABC_SUB.length - 5); return { q: 'Zoraď písmenká podľa abecedy', seq: ABC_SUB.slice(k, k + 5).map(l => ({ n: l, big: true })) }; },
    abcwords: () => {
      const ws = uniqBy(shuffle(ABC_WORDS), w => w[0][0]).slice(0, 4);
      ws.sort((x, y) => ABC_FULL.indexOf(x[0][0]) - ABC_FULL.indexOf(y[0][0]));
      return { q: 'Zoraď slová podľa abecedy', seq: ws.map(w => ({ n: w[0], p: w[1] })) };
    },
    numbers: () => {
      const max = a.max || 20, set = new Set();
      while (set.size < 5) set.add(randInt(0, max));
      const up = Math.random() < 0.65, list = [...set].sort((x, y) => up ? x - y : y - x);
      return { q: up ? 'Zoraď čísla od najmenšieho' : 'Zoraď čísla od najväčšieho', seq: list.map(v => ({ n: String(v), big: true })) };
    },
  }[a.gen];
  if (gen) return Array.from({ length: n }, gen);
  const all = srcLessons(ctx).flatMap(L => Array.isArray(L.order) ? L.order : []);
  return sample(all, Math.min(n, all.length));
}
/* jedno zoraďovanie; head = HTML nad tým (napr. obrázok) */
function orderRound(ctx, seq, title, head, done) {
  let tiles = shuffle(seq.map((x, i) => ({ x, i })));
  if (tiles.length > 1 && tiles.every((t, k) => t.i === k)) tiles = tiles.reverse();
  let pos = 0, miss = 0, lock = false;
  const face = x => `${x.p ? `<span class="t-pic">${pic(x.p)}</span>` : ''}<span class="t-txt${x.big ? ' big' : ''}">${esc(x.n)}</span>`;
  ctx.el.innerHTML = `
    <div class="order">
      ${head || ''}
      <div class="order-title">${esc(title)} ${sayBtn(title)}</div>
      <div class="order-slots">${seq.map((_, i) => `<span class="oslot ${i === 0 ? 'next' : ''}"><i>${i + 1}.</i></span>`).join('')}</div>
      <div class="order-tiles">${tiles.map((t, k) => `<button class="otile" data-k="${k}">${face(t.x)}</button>`).join('')}</div>
    </div>`;
  ctx.timeout(() => ctx.say(title), 200);
  const slots = $$('.oslot', ctx.el);
  $$('.otile', ctx.el).forEach(b => b.onclick = () => {
    if (lock) return;
    const t = tiles[+b.dataset.k];
    if (t.i === pos) {
      Sfx.play('good');
      slots[pos].innerHTML = face(t.x);
      slots[pos].classList.remove('next'); slots[pos].classList.add('filled');
      b.classList.add('used');
      pos++;
      if (slots[pos]) slots[pos].classList.add('next');
      if (pos === seq.length) {
        lock = true;
        if (!miss) ctx.praise();
        ctx.timeout(() => done(miss), 1100);
      }
    } else {
      miss++;
      Sfx.play('bad');
      b.classList.remove('bad'); void b.offsetWidth; b.classList.add('bad');
    }
  });
}
defGame('order', {
  name: 'Zoraď', icon: '🔢',
  instr: 'Ťukaj na kartičky v správnom poradí.',
}, function (ctx) {
  const seqs = orderSeqs(ctx);
  let r = 0, mistakes = 0;
  const total = seqs.reduce((s, x) => s + x.seq.length, 0) || 1;
  const next = () => {
    if (r >= seqs.length) return ctx.finish({ mistakes, total: Math.max(total / 2, 1) });
    const s = seqs[r];
    orderRound(ctx, s.seq, s.q, '', m => { mistakes += m; r++; ctx.progress(r, seqs.length); next(); });
  };
  next();
});

defGame('syll', {
  name: (a) => a.mode === 'build' ? 'Poskladaj slovo' : 'Koľko slabík?', icon: (a) => a.mode === 'build' ? '🧱' : '👏',
  instr: (a) => a.mode === 'build' ? 'Poskladaj slovo zo slabík – ťukaj na ne v správnom poradí.' : 'Koľko slabík má slovo? Pri každej slabike si tleskni 👏.',
}, function (ctx) {
  const min = ctx.act.min || (ctx.act.mode === 'build' ? 2 : 1);
  const pool = srcItems(ctx).filter(x => x.sy && x.sy.split('-').length >= min);
  const targets = pickTargets(pool, ctx.act.rounds || 6);
  if (ctx.act.mode !== 'build') return runRounds(ctx, targets, syllCountQ);
  let r = 0, mistakes = 0;
  const next = () => {
    if (r >= targets.length) return ctx.finish({ mistakes, total: targets.length });
    const t = targets[r];
    const head = `<div class="order-head"><span class="oh-pic">${pic(t.p)}</span>${sayBtn(t.n)}</div>`;
    orderRound(ctx, t.sy.split('-').map(s => ({ n: s, big: true })), 'Poskladaj slovo zo slabík', head, m => {
      mistakes += m;
      if (!m) ctx.correct(t.key, true); else ctx.wrong(t.key);
      Speech.say(t.n);
      r++; ctx.progress(r, targets.length); next();
    });
  };
  next();
});

/* ==========================================================================
   MAPY (skutočné aj „obrázkové“: rastlina, telo, planéty)
   ========================================================================== */
function itemBoard(it) { return it.b || (LESSON_BY_ID[it.lesson] || {}).board; }
function mapTargetOf(it, board) {
  const C = CUSTOM_BOARDS[board];
  if (C) return it.id && C.names[it.id] && itemBoard(it) === board ? { kind: 'custom', id: it.id } : null;
  const B = MAP_DATA[board];
  if (!B) return null;
  if (it.b && it.b !== board) return null;
  if (it.pt) return itemBoard(it) === board ? { kind: 'pt', id: it.key, pt: it.pt } : null;
  if (it.line) return B.extra[it.line] ? { kind: 'line', id: it.line } : null;
  if (!it.id) return null;
  if (it.id[0] === '#') return board === 'world' ? { kind: 'cont', id: it.id.slice(1) } : null;
  if (OCEANS.includes(it.id)) return board === 'world' ? { kind: 'ocean', id: it.id } : null;
  const regs = B.regions.filter(r => r.id === it.id);
  if (!regs.length) return null;
  if (board === 'world' && regs.reduce((s, r) => s + r.a, 0) < 60) return null;     // pridrobné na svetovej mape
  return { kind: 'region', id: it.id };
}
/* „To je lakeť“, ale „To sú pľúca“ */
const PLURAL_NAMES = new Set(['pľúca', 'črevá', 'vlasy', 'obličky', 'Vysoké Tatry', 'Pyramídy', 'Veterné mlyny', 'Nízke Tatry', 'Košice']);
function jeSu(name) { return PLURAL_NAMES.has(name) ? 'To sú' : 'To je'; }
function mapPrompt(it, t) {
  if (t.kind === 'pt' && PLURAL_NAMES.has(it.n)) return 'Kde sú {n}?';
  switch (t.kind) {
    case 'cont':  return 'Nájdi svetadiel: {n}';
    case 'ocean': return 'Nájdi na mape: {n}';
    case 'pt':    return 'Kde je {n}?';
    case 'line':  return 'Kde tečie {n}?';
    case 'custom': return 'Ukáž: {n}';
    default:      return 'Nájdi na mape: {n}';
  }
}
/* sivé popisy susedov na mape Slovenska (súradnice v bodoch mapy) */
const NEIGHBOR_LABELS = {
  slovakia: [['Česko', 150, 110], ['Poľsko', 640, 40], ['Ukrajina', 948, 170], ['Maďarsko', 600, 490], ['Rakúsko', 52, 360]],
};
/* nakreslí mapu do elementu; vráti pomocníka na kontrolu kliknutí */
function mountBoard(host, board, opts = {}) {
  const C = CUSTOM_BOARDS[board];
  let svg;
  if (C && C.photo) {
    // skutočná fotka + neviditeľné oblasti na ťukanie (veľké oblasti prvé, malé navrch)
    const regs = Object.keys(C.shapes).map(id => `<g class="rg" data-id="${id}">${C.shapes[id].map(sh => shapeSVG(sh)).join('')}</g>`).join('');
    svg = `<svg class="mapboard custom photo board-${board}" viewBox="0 0 ${C.w} ${C.h}"><rect x="0" y="0" width="${C.w}" height="${C.h}" fill="${C.bg || '#fff'}"/>
      <image href="img/foto/${C.photo}" x="0" y="0" width="${C.w}" height="${C.h}" preserveAspectRatio="xMidYMid slice"/>${regs}<g class="labels"></g></svg>`;
  } else if (C) {
    svg = `<svg class="mapboard custom board-${board}" viewBox="0 0 ${C.w} ${C.h}"><rect x="0" y="0" width="${C.w}" height="${C.h}" fill="${C.bg}" rx="12"/>${C.svg}<g class="labels"></g></svg>`;
  } else {
    const B = MAP_DATA[board];
    const contMode = !!opts.contColors;
    const oceans = board === 'world' ? OCEANS.filter(o => B.extra[o]).map(o => `<path class="ocean" data-ocean="${o}" d="${B.extra[o]}"/>`).join('') : '';
    const land = B.regions.map(r => `<path class="rg" data-id="${r.id}"${r.cont ? ` data-cont="${r.cont}"` : ''} d="${r.d}"${contMode && r.cont ? ` style="fill:${CONT_COLORS[r.cont]}"` : r.cont === 'an' ? ' style="fill:#f4f7fa"' : ''}/>`).join('');
    const rivers = ['dunaj', 'morava', 'vah', 'hron', 'hornad', 'ipel'].filter(x => B.extra[x]).map(x =>
      `<g class="river${(opts.lines || []).includes(x) ? ' target' : ''}" data-line="${x}"><path class="rv-hit" d="${B.extra[x]}"/><path class="rv" d="${B.extra[x]}"/></g>`).join('');
    const r = B.w / 70;
    const pts = (opts.points || []).map(p => { const [x, y] = projectPt(board, p.pt[0], p.pt[1]); return `<g class="pt" data-pt="${p.key}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><circle class="pt-hit" r="${r * 2.6}"/><circle class="pt-dot" r="${r}"/></g>`; }).join('');
    const fs = (B.w / 50).toFixed(1);
    const nbs = (NEIGHBOR_LABELS[board] || []).map(([t, x, y]) => `<text class="mlabel nb" x="${x}" y="${y}" font-size="${fs}">${t}</text>`).join('');
    svg = `<svg class="mapboard geo board-${board}${contMode ? ' conts' : ''}${opts.ptsOnly ? ' pts-only' : ''}" viewBox="0 0 ${B.w} ${B.h}"><rect class="sea" x="0" y="0" width="${B.w}" height="${B.h}" rx="10"/>${oceans}<g class="land">${land}</g><g class="nbs">${nbs}</g>${rivers}<g class="pts">${pts}</g><g class="labels"></g></svg>`;
  }
  host.innerHTML = svg;
  const root = host.firstElementChild;
  const W = C ? C.w : MAP_DATA[board].w, H = C ? C.h : MAP_DATA[board].h;
  // nech sa celá mapa zmestí na obrazovku bez posúvania
  const top = Math.max(250, Math.round(host.getBoundingClientRect().top + window.scrollY + 40));   // +40 = rezerva na dlhšiu otázku nad mapou a okraj
  host.style.maxWidth = `min(${C ? (C.w > C.h ? 720 : 470) : 940}px, max(${W > H ? 300 : 150}px, calc((100vh - ${top}px) * ${(W / H).toFixed(3)})))`;
  const labels = $('.labels', root);
  const elsOf = t => {
    switch (t.kind) {
      case 'region': case 'custom': return $$(`[data-id="${t.id}"]`, root);
      case 'cont': return $$(`.rg[data-cont="${t.id}"]`, root);
      case 'ocean': return $$(`[data-ocean="${t.id}"]`, root);
      case 'pt': return $$(`[data-pt="${t.id}"]`, root);
      case 'line': return $$(`[data-line="${t.id}"]`, root);
    }
    return [];
  };
  const centerOf = (t, els) => {
    if (t.kind === 'pt') { const [x, y] = projectPt(board, t.pt[0], t.pt[1]); return [x, y - W / 38]; }
    if (!C && (t.kind === 'region' || t.kind === 'cont')) {
      const regs = MAP_DATA[board].regions.filter(r => t.kind === 'region' ? r.id === t.id : r.cont === t.id).sort((a, b) => b.a - a.a);
      if (regs.length) return regs[0].c;
    }
    try {
      const bb = els.reduce((acc, e) => { const b = e.getBBox(); return acc ? [Math.min(acc[0], b.x), Math.min(acc[1], b.y), Math.max(acc[2], b.x + b.width), Math.max(acc[3], b.y + b.height)] : [b.x, b.y, b.x + b.width, b.y + b.height]; }, null);
      return [(bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2];
    } catch (e) { return [W / 2, 20]; }
  };
  const label = (text, x, y, cls) => {
    const fs = W / (C ? (C.w > C.h ? 32 : 16) : 42);
    const tEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    tEl.setAttribute('x', x); tEl.setAttribute('y', y); tEl.setAttribute('class', 'mlabel ' + (cls || ''));
    tEl.setAttribute('font-size', fs.toFixed(1));
    tEl.textContent = text;
    labels.appendChild(tEl);
    try {                                                            // nech popis nevytŕča z obrázka (napr. Slnko pri kraji)
      const len = tEl.getComputedTextLength(), H0 = C ? C.h : MAP_DATA[board].h;
      tEl.setAttribute('x', Math.min(Math.max(x, len / 2 + fs * .3), W - len / 2 - fs * .3).toFixed(1));
      tEl.setAttribute('y', Math.min(Math.max(y, fs * .8), H0 - fs * .8).toFixed(1));
    } catch (e) { /* nič */ }
    return tEl;
  };
  // kontinenty: pri prechode myšou zvýrazni celý svetadiel
  if (opts.contColors) {
    root.classList.add('cont-now');
    root.addEventListener('pointerover', e => {
      const g = root.classList.contains('cont-now') && e.target.closest('.rg[data-cont]');
      $$('.rg.hov', root).forEach(x => x.classList.remove('hov'));
      if (g) $$(`.rg[data-cont="${g.dataset.cont}"]`, root).forEach(x => x.classList.add('hov'));
    });
  }
  return {
    root, elsOf, label,
    /* čo je na mieste kliknutia: { kind, id, name } */
    hitOf(e, contMode) {
      const t = e.target;
      const p = t.closest('[data-pt]');
      if (p) return { kind: 'pt', id: p.dataset.pt, name: (ITEM_BY_KEY[p.dataset.pt] || {}).n };
      const l = t.closest('[data-line]');
      if (l) { const it = (opts.lineItems || []).find(x => x.line === l.dataset.line); return { kind: 'line', id: l.dataset.line, name: it ? it.n : 'rieka' }; }
      const o = t.closest('[data-ocean]');
      if (o) return { kind: 'ocean', id: o.dataset.ocean, name: OCEAN_NAMES[o.dataset.ocean] };
      const g = t.closest('[data-id]');
      if (g) {
        if (C) return { kind: 'custom', id: g.dataset.id, name: C.names[g.dataset.id] };
        if (contMode && g.dataset.cont) return { kind: 'cont', id: g.dataset.cont, name: CONT_NAMES[g.dataset.cont] };
        const reg = MAP_DATA[board].regions.find(r => r.id === g.dataset.id);
        return { kind: 'region', id: g.dataset.id, name: reg ? reg.name : '' };
      }
      return null;
    },
    found(t, name) {
      const els = elsOf(t);
      els.forEach(x => { x.classList.remove('hint', 'bad'); x.classList.add('found'); });
      const [x, y] = centerOf(t, els);
      label(name, x, y, 'ok');
    },
    wrong(hit, e) {
      const els = elsOf(hit);
      els.forEach(x => { x.classList.remove('bad'); void x.getBBox; x.classList.add('bad'); setTimeout(() => x.classList.remove('bad'), 900); });
      if (hit.name) {
        const pt = root.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
        const m = root.getScreenCTM();
        const q = m ? pt.matrixTransform(m.inverse()) : { x: W / 2, y: 20 };
        const lb = label(jeSu(hit.name) + ' ' + hit.name, q.x, q.y - W / 60, 'no');
        setTimeout(() => lb.remove(), 1500);
      }
    },
    hint(t) { elsOf(t).forEach(x => x.classList.add('hint')); },
  };
}
/* jedna otázka na mape (tréning, mix) */
function mapRound(ctx, q, done) {
  ctx.el.innerHTML = `<div class="map-q"></div><div class="map-host"></div>`;
  const pts = q.t.kind === 'pt' ? q.pool.filter(x => x.pt && itemBoard(x) === q.board).map(x => ({ key: x.key, pt: x.pt })) : [];
  const lines = q.t.kind === 'line' ? q.pool.filter(x => x.line).map(x => x.line) : [];
  const M = mountBoard($('.map-host', ctx.el), q.board, { points: pts, lines, lineItems: q.pool, contColors: q.t.kind === 'cont', ptsOnly: q.t.kind === 'pt' || q.t.kind === 'line' });
  const text = tpl(mapPrompt(q.it, q.t), q.it);
  $('.map-q', ctx.el).innerHTML = `${/^flag:/.test(q.it.p || '') ? `<span class="mq-pic">${pic(q.it.p)}</span>` : ''}<span class="mq-t">${esc(text)}</span>${sayBtn(text)}`;
  ctx.timeout(() => ctx.say(text), 250);
  let miss = 0, locked = false;
  M.root.addEventListener('click', e => {
    if (locked) return;
    const hit = M.hitOf(e, q.t.kind === 'cont');
    if (!hit) return;
    if (hit.kind === q.t.kind && hit.id === q.t.id) {
      locked = true;
      Sfx.play('good'); if (!miss) ctx.praise();
      ctx.correct(q.key, miss === 0);
      M.found(q.t, q.it.n);
      Speech.say(cap(q.it.n));
      ctx.timeout(() => done(miss), 1300);
    } else {
      miss++; Sfx.play('bad'); ctx.wrong(q.key);
      M.wrong(hit, e);
      if (miss >= 2) M.hint(q.t);
    }
  });
}
/* „mapa“ nemusí byť mapa – na tele, rastline či v Slnečnej sústave sa úloha volá inak */
const BOARD_KINDS = {
  body:   { name: 'Nájdi na tele', icon: '🧍', instr: 'Pozri sa na telo a ťukni na tú časť, ktorú hľadáme.' },
  organs: { name: 'Nájdi v tele', icon: '🫀', instr: 'Pozri sa dovnútra tela a ťukni na orgán, ktorý hľadáme.' },
  plant:  { name: 'Ukáž na rastline', icon: '🌱', instr: 'Pozri sa na rastlinu a ťukni na časť, ktorú hľadáme.' },
  solar:  { name: 'Nájdi vo vesmíre', icon: '🪐', instr: 'Pozri sa na Slnečnú sústavu a ťukni na planétu, ktorú hľadáme.' },
};
function boardKind(act) { return BOARD_KINDS[act && (act.board || (LESSON_BY_ID[act.lesson] || {}).board)] || null; }
defGame('map', {
  name: act => (boardKind(act) || { name: 'Nájdi na mape' }).name,
  icon: act => (boardKind(act) || { icon: '🗺️' }).icon,
  instr: act => (boardKind(act) || { instr: 'Nájdi na mape, čo hľadáme, a ťukni tam.' }).instr,
}, function (ctx) {
  const board = ctx.act.board || ctx.L.board;
  let pool = srcItems(ctx).map(it => ({ it, t: mapTargetOf(it, board) })).filter(x => x.t);
  if (ctx.act.only) pool = pool.filter(x => x.t.kind === ctx.act.only);
  const targets = pickTargets(pool, Math.min(ctx.act.rounds || 6, Math.max(pool.length, 1) * 2));
  if (!targets.length) return ctx.finish({ stars: 3 });
  const contMode = pool.some(x => x.t.kind === 'cont');
  ctx.el.innerHTML = `<div class="map-q"></div><div class="map-host"></div>`;
  const pts = pool.filter(x => x.t.kind === 'pt').map(x => ({ key: x.it.key, pt: x.it.pt }));
  const lines = pool.filter(x => x.t.kind === 'line').map(x => x.t.id);
  const ptsOnly = targets.every(x => x.t.kind === 'pt' || x.t.kind === 'line');
  const M = mountBoard($('.map-host', ctx.el), board, { points: pts, lines, lineItems: pool.map(x => x.it), contColors: contMode, ptsOnly });
  let r = 0, mistakes = 0, miss = 0, cur = null, locked = true;
  const shownFound = new Set();
  function next() {
    if (r >= targets.length) return ctx.finish({ mistakes, total: targets.length });
    cur = targets[r]; miss = 0; locked = false;
    M.root.classList.toggle('cont-now', cur.t.kind === 'cont');       // celý svetadiel sa zvýrazní len pri hľadaní svetadielu
    $$('.hint', M.root).forEach(x => x.classList.remove('hint'));
    // pri opakovaní toho istého cieľa zmaž starý popis
    if (shownFound.has(cur.it.key)) { $$('.mlabel.ok', M.root).forEach(l => { if (l.textContent === cur.it.n) l.remove(); }); M.elsOf(cur.t).forEach(x => x.classList.remove('found')); }
    const text = tpl(ctx.act.ask || mapPrompt(cur.it, cur.t), cur.it);
    $('.map-q', ctx.el).innerHTML = `${/^flag:/.test(cur.it.p || '') ? `<span class="mq-pic">${pic(cur.it.p)}</span>` : ''}<span class="mq-t pop-in">${esc(text)}</span>${sayBtn(text)}`;
    ctx.say(text);
  }
  M.root.addEventListener('click', e => {
    if (locked || !cur) return;
    const hit = M.hitOf(e, cur.t.kind === 'cont');
    if (!hit) return;
    if (hit.kind === cur.t.kind && hit.id === cur.t.id) {
      locked = true;
      Sfx.play('good');
      if (!miss) { ctx.praise(); Store.state.stats.mapOk++; }
      ctx.correct(cur.it.key, miss === 0);
      M.found(cur.t, cur.it.n);
      shownFound.add(cur.it.key);
      Speech.say(cap(cur.it.n));
      r++; ctx.progress(r, targets.length);
      ctx.timeout(next, 1300);
    } else {
      miss++; mistakes++;
      Sfx.play('bad');
      ctx.wrong(cur.it.key);
      M.wrong(hit, e);
      if (miss >= 2) M.hint(cur.t);
    }
  });
  next();
});

defGame('mapname', {
  name: 'Čo je na mape?', icon: '📍',
  instr: 'Čo je vyznačené na mape? Vyber správny názov.',
}, function (ctx) {
  const board = ctx.act.board || ctx.L.board;
  const pool = srcItems(ctx).filter(it => { const t = mapTargetOf(it, board); return t && ['region', 'cont', 'ocean'].includes(t.kind); });
  const targets = pickTargets(pool, ctx.act.rounds || 5);
  runRounds(ctx, targets, t => ({
    key: t.key, text: 'Čo je vyznačené na mape?', pic: `map:${board}:${t.id}`,
    opts: optsFrom({ v: t.n }, pool.filter(x => x !== t).map(x => ({ v: x.n })), Math.min(ctx.act.opts || 4, pool.length)),
  }));
});

/* ==========================================================================
   SPOJ BODKY
   ========================================================================== */
const DOT_SHAPES = {
  fish:   { name: 'Rybka', icon: '🐟', start: 1, step: 1, close: 0, pts: [[88, 50], [78, 36], [62, 28], [44, 30], [30, 40], [12, 24], [18, 50], [12, 76], [30, 60], [44, 70], [62, 72], [78, 64]], f: 'Rybka! Počítala si od 1 do 12.' },
  rocket: { name: 'Raketa', icon: '🚀', start: 10, step: 10, close: 0, pts: [[50, 6], [62, 24], [64, 62], [80, 86], [60, 78], [50, 94], [40, 78], [20, 86], [36, 62], [38, 24]], f: 'Raketa! Počítala si po desiatkach až do 100.' },
  heart2: { name: 'Srdiečko', icon: '❤️', start: 2, step: 2, close: 0, pts: [[50, 30], [62, 16], [80, 14], [92, 28], [88, 48], [50, 88], [12, 48], [8, 28], [20, 14], [38, 16]], f: 'Srdiečko! Počítala si po dvoch: 2, 4, 6… až 20.' },
  star5:  { name: 'Hviezda', icon: '⭐', start: 5, step: 5, close: 0, pts: [[50, 8], [61, 38], [93, 38], [67, 57], [77, 88], [50, 69], [23, 88], [33, 57], [7, 38], [39, 38]], f: 'Hviezda! Počítala si po piatich až do 50.' },
};
defGame('dots', {
  name: 'Spoj bodky', icon: '✏️',
  instr: 'Spájaj bodky podľa čísel – od najmenšieho – a uvidíš, čo sa skrýva!',
}, function (ctx) {
  const list = ctx.act.pick ? [DOT_SHAPES[ctx.act.pick]] : sample(ctx.L.dots || [], ctx.act.rounds || 3);
  let r = 0, mistakes = 0, total = 0;
  const next = () => {
    if (r >= list.length) return ctx.finish({ mistakes, total: Math.max(1, total / 3) });
    const D = list[r], start = D.start || 1, step = D.step || 1;
    total += D.pts.length;
    let pos = 0, lock = false;
    const P = D.pts;
    ctx.el.innerHTML = `
      <div class="dots-game ${D.stars ? 'night' : ''}">
        <div class="dg-title">${D.stars ? 'Spoj hviezdy od 1' : `Spájaj od ${start}${step > 1 ? ` po ${step}` : ''}`}</div>
        <svg class="dg-svg" viewBox="0 0 100 100">
          <polygon class="dg-fill" points=""/>
          <polyline class="dg-line" points=""/>
          ${P.map(([x, y], i) => `<g class="dg-pt" data-i="${i}" transform="translate(${x} ${y})"><circle class="dg-hit" r="7"/><circle class="dg-dot" r="${D.stars ? 2.6 : 2.2}"/>
            <text class="dg-num" y="-4.2">${start + i * step}</text></g>`).join('')}
        </svg>
        <div class="dg-done"></div>
      </div>`;
    const line = $('.dg-line', ctx.el), fill = $('.dg-fill', ctx.el), ptsEl = $$('.dg-pt', ctx.el);
    const drawn = [];
    ptsEl[0].classList.add('next');
    ptsEl.forEach(g => g.addEventListener('pointerdown', e => {
      e.preventDefault();
      if (lock) return;
      const i = +g.dataset.i;
      if (i === pos) {
        Sfx.play('click');
        drawn.push(P[i].join(','));
        line.setAttribute('points', drawn.join(' '));
        g.classList.remove('next'); g.classList.add('on');
        pos++;
        if (ptsEl[pos]) ptsEl[pos].classList.add('next');
        if (pos === P.length) {
          lock = true;
          if (D.close != null) { drawn.push(P[D.close].join(',')); line.setAttribute('points', drawn.join(' ')); }
          if (!D.stars) fill.setAttribute('points', drawn.join(' '));
          ctx.el.firstElementChild.classList.add('complete');
          Sfx.play('win');
          $('.dg-done', ctx.el).innerHTML = `<div class="dg-name pop-in"><span class="emo">${D.icon}</span> ${esc(D.name)}</div>${D.f ? `<div class="dg-fact">${esc(D.f)}</div>` : ''}`;
          ctx.say(D.name + '. ' + (D.f || ''));
          ctx.timeout(() => { r++; ctx.progress(r, list.length); next(); }, 3200);
        }
      } else if (!g.classList.contains('on')) {
        mistakes++;
        Sfx.play('bad');
        g.classList.remove('bad'); void g.getBBox; g.classList.add('bad');
        setTimeout(() => g.classList.remove('bad'), 500);
      }
    }));
  };
  next();
});

/* ==========================================================================
   POČÍTANIE – príklady sa vymýšľajú samé
   ========================================================================== */
const BL = '□';
function eqq(a, op, b, r) { return { parts: [a, op, b, '=', BL], ans: r }; }
function sayOp(parts) {
  return parts.map(p => p === BL ? 'koľko' : p === '+' ? 'plus' : p === '−' ? 'mínus' : p === '×' ? 'krát' : p === '=' ? 'je' : typeof p === 'object' ? '' : p).join(' ');
}
const MATH_GEN = {
  add10()  { const a = randInt(1, 9), b = randInt(1, 10 - a); return eqq(a, '+', b, a + b); },
  add20()  { const a = randInt(10, 18), b = randInt(1, 9 - (a % 10)); return Math.random() < 0.3 ? eqq(b, '+', a, a + b) : eqq(a, '+', b, a + b); },
  add20c() { const a = randInt(2, 9), b = randInt(11 - a, 9); return eqq(a, '+', b, a + b); },
  sub10()  { const a = randInt(2, 10), b = randInt(1, a); return eqq(a, '−', b, a - b); },
  sub20()  { const a = randInt(11, 19), b = Math.random() < 0.2 ? 10 : randInt(1, a % 10); return eqq(a, '−', b, a - b); },
  sub20c() { const a = randInt(11, 18), b = randInt((a % 10) + 1, 9); return eqq(a, '−', b, a - b); },
  miss10() {
    const c = randInt(5, Math.random() < 0.5 ? 10 : 20), a = randInt(1, c - 1);
    if (Math.random() < 0.3) return { parts: [BL, '+', a, '=', c], ans: c - a };
    return { parts: [a, '+', BL, '=', c], ans: c - a };
  },
  tens() {
    if (Math.random() < 0.5) { const a = randInt(1, 8), b = randInt(1, 9 - a); return eqq(a * 10, '+', b * 10, (a + b) * 10); }
    const a = randInt(2, 10), b = randInt(1, a - 1); return eqq(a * 10, '−', b * 10, (a - b) * 10);
  },
  tensunits() { const t = randInt(1, 9), u = randInt(0, 9); return { parts: [{ pic: tensPic(t, u) }, '=', BL], ans: t * 10 + u, say: 'Koľko je to spolu? Desiatky a jednotky.' }; },
  add100() {
    const k = randInt(0, 2), t = randInt(1, 8), u = randInt(0, 8);
    if (k === 0) { const b = randInt(1, 9 - u); return eqq(t * 10 + u, '+', b, t * 10 + u + b); }
    if (k === 1) { const b = randInt(1, 9 - t) * 10; return eqq(t * 10 + u, '+', b, t * 10 + u + b); }
    const kk = randInt(1, 9 - t), v = randInt(1, 9 - u); return eqq(t * 10 + u, '+', kk * 10 + v, (t + kk) * 10 + u + v);
  },
  sub100() {
    const k = randInt(0, 2), t = randInt(2, 9), u = randInt(1, 9);
    if (k === 0) { const b = randInt(1, u); return eqq(t * 10 + u, '−', b, t * 10 + u - b); }
    if (k === 1) { const b = randInt(1, t - 1) * 10; return eqq(t * 10 + u, '−', b, t * 10 + u - b); }
    const kk = randInt(1, t - 1), v = randInt(0, u); return eqq(t * 10 + u, '−', kk * 10 + v, (t - kk) * 10 + u - v);
  },
  mul(f) { const a = randInt(1, 10); return Math.random() < 0.5 ? eqq(a, '×', f, a * f) : eqq(f, '×', a, a * f); },
  mul2() { return MATH_GEN.mul(2); }, mul5() { return MATH_GEN.mul(5); }, mul10() { return MATH_GEN.mul(10); },
  groups() { const g = randInt(2, 5), n = randInt(2, 5); return { parts: [{ pic: groupsPic(g, n) }, 'nl', g, '×', n, '=', BL], ans: g * n, say: `Koľko je ${g} krát ${n}?` }; },
  money() {
    const cs = []; let s = 0;
    const k = randInt(2, 3);
    for (let i = 0; i < k; i++) { const c = pick(s <= 50 ? [10, 20, 50] : [10, 20]); if (s + c <= 100) { cs.push(c); s += c; } }
    if (cs.length < 2) { cs.push(10); s += 10; }
    return { parts: [{ pic: `<span class="coins-row">${cs.map(c => coinHTML(c)).join('')}</span>` }, '=', BL, 'c'], ans: s, say: 'Koľko centov je spolu?' };
  },
  mix() { return MATH_GEN[pick(['add20c', 'sub20c', 'add100', 'sub100', 'mul2', 'mul5', 'mul10', 'miss10'])](); },
};
function eqHTML(parts, typed) {
  return parts.map(p => {
    if (p === 'nl') return '<span class="eq-br"></span>';
    if (p === BL) return `<span class="eq-bl">${typed != null && typed !== '' ? esc(typed) : '?'}</span>`;
    if (typeof p === 'object') return `<span class="eq-pic">${p.pic}</span>`;
    if (['+', '−', '×', '=', ':'].includes(p)) return `<span class="eq-op">${p}</span>`;
    return `<span class="eq-n">${esc(p)}</span>`;
  }).join('');
}
/* príklad ako otázka s možnosťami (veľký kvíz, mix) */
function mathChoiceQ(gen) {
  const m = MATH_GEN[gen]();
  const wrong = new Set();
  [1, -1, 2, -2, 10, -10].forEach(d => { const v = m.ans + d; if (v >= 0 && v !== m.ans) wrong.add(v); });
  return { key: null, text: 'Koľko je to?', head: `<div class="eq small">${eqHTML(m.parts)}</div>`, say: m.say || sayOp(m.parts),
    opts: shuffle([{ v: String(m.ans), ok: true }].concat(sample([...wrong], 3).map(v => ({ v: String(v) })))) };
}
defGame('math', {
  name: 'Počítanie', icon: '🧮',
  instr: 'Vypočítaj príklad a výsledok vyťukaj na číselníku. Potom ťukni na ✓.',
}, function (ctx) {
  const gen = MATH_GEN[ctx.act.gen || 'add10'];
  const rounds = ctx.act.rounds || 8;
  let r = 0, mistakes = 0;
  function next() {
    if (r >= rounds) return ctx.finish({ mistakes, total: rounds });
    const m = gen();
    let typed = '', miss = 0, lock = false;
    ctx.el.innerHTML = `
      <div class="math">
        <div class="eq pop-in">${eqHTML(m.parts)}</div>
        <div class="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => `<button class="pk" data-d="${d}">${d}</button>`).join('')}
          <button class="pk del" data-d="del">⌫</button><button class="pk" data-d="0">0</button><button class="pk ok" data-d="ok">✓</button></div>
      </div>`;
    const bl = () => $('.eq-bl', ctx.el);
    const upd = () => { const b = bl(); if (b) { b.textContent = typed || '?'; b.classList.toggle('typing', !!typed); } };
    const check = () => {
      if (lock || !typed) return;
      if (+typed === m.ans) {
        lock = true;
        bl().classList.add('right');
        Sfx.play('good');
        if (!miss) { ctx.praise(); Store.state.stats.mathOk++; }
        ctx.correct(null, !miss);
        r++; ctx.progress(r, rounds);
        ctx.timeout(next, 900);
      } else {
        miss++; mistakes++;
        Sfx.play('bad');
        ctx.wrong(null);
        const e = $('.eq', ctx.el); e.classList.remove('shake'); void e.offsetWidth; e.classList.add('shake');
        typed = '';
        if (miss >= 2) {
          lock = true;
          typed = String(m.ans); upd(); bl().classList.add('shown');
          toast(`Správne je ${m.ans}. Nabudúce to dáš! 💪`, 1800);
          r++; ctx.progress(r, rounds);
          ctx.timeout(next, 2000);
        } else upd();
      }
    };
    const press = d => {
      if (lock) return;
      if (d === 'ok') return check();
      if (d === 'del') typed = typed.slice(0, -1);
      else if (typed.length < 3) typed = (typed === '0' ? '' : typed) + d;
      Sfx.play('click');
      upd();
    };
    $$('.pk', ctx.el).forEach(b => b.onclick = () => press(b.dataset.d));
    const kb = e => {
      if (/^[0-9]$/.test(e.key)) press(e.key);
      else if (e.key === 'Backspace') press('del');
      else if (e.key === 'Enter') press('ok');
      else return;
      e.preventDefault();
    };
    document.addEventListener('keydown', kb);
    ctx.onCleanup(() => document.removeEventListener('keydown', kb));
    ctx.timeout(() => ctx.say(m.say || sayOp(m.parts)), 200);
  }
  next();
});

defGame('compare', {
  name: 'Krokodíl', icon: '🐊',
  instr: 'Ktoré číslo je väčšie? Krokodíl je hladný a otvára pusu vždy na väčšie číslo. Vyber menší, rovná sa, alebo väčší.',
}, function (ctx) {
  const max = ctx.act.max || 20, rounds = ctx.act.rounds || 8;
  let r = 0, mistakes = 0;
  function next() {
    if (r >= rounds) return ctx.finish({ mistakes, total: rounds });
    let L, R, lv, rv;
    if (ctx.act.expr) {
      const a = randInt(1, Math.floor(max / 2)), b = randInt(1, Math.floor(max / 2));
      lv = a + b; L = `${a} + ${b}`;
      rv = Math.max(0, lv + pick([-2, -1, 0, 1, 2])); R = String(rv);
    } else {
      lv = randInt(1, max); rv = Math.random() < 0.15 ? lv : randInt(1, max);
      L = String(lv); R = String(rv);
    }
    if (Math.random() < 0.5 && ctx.act.expr) { [L, R] = [R, L]; [lv, rv] = [rv, lv]; }
    const ans = lv < rv ? '<' : lv > rv ? '>' : '=';
    let miss = 0, lock = false;
    ctx.el.innerHTML = `
      <div class="cmp">
        <div class="cmp-row pop-in"><span class="cmp-n">${esc(L)}</span><span class="cmp-slot">?</span><span class="cmp-n">${esc(R)}</span></div>
        <div class="cmp-btns"><button class="btn blue big" data-s="<">&lt;</button><button class="btn yellow big" data-s="=">=</button><button class="btn pink big" data-s=">">&gt;</button></div>
        <div class="cmp-tip">🐊 &lt; menší · = rovná sa · &gt; väčší</div>
      </div>`;
    $$('[data-s]', ctx.el).forEach(b => b.onclick = () => {
      if (lock) return;
      if (b.dataset.s === ans) {
        lock = true;
        const sl = $('.cmp-slot', ctx.el);
        sl.innerHTML = `${ans === '=' ? '=' : ans === '<' ? '&lt;' : '&gt;'}<span class="croc emo ${ans === '<' ? 'flip' : ''}">${ans === '=' ? '🤝' : '🐊'}</span>`;
        sl.classList.add('right');
        Sfx.play('good'); if (!miss) ctx.praise();
        ctx.correct(null, !miss);
        r++; ctx.progress(r, rounds);
        ctx.timeout(next, 1100);
      } else {
        miss++; mistakes++; Sfx.play('bad'); ctx.wrong(null);
        b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
      }
    });
  }
  next();
});

/* ==========================================================================
   OBCHODÍK – platenie mincami
   ========================================================================== */
const SHOP_GOODS = [['🍎', 'jablko'], ['🍌', 'banán'], ['🍭', 'lízanka'], ['🍦', 'zmrzlina'], ['🥐', 'rožok'], ['🧃', 'džús'], ['✏️', 'ceruzka'],
  ['📒', 'zošit'], ['🎈', 'balónik'], ['🧸', 'macko'], ['🍫', 'čokoláda'], ['🍪', 'keksík'], ['🥨', 'praclík'], ['🖍️', 'pastelky']];
defGame('coins', {
  name: 'Obchodík', icon: '🛒',
  instr: 'Zaplať presne toľko, koľko to stojí. Ťukaj na mince. Keď sa pomýliš, ťukni na mincu hore a vráti sa späť.',
}, function (ctx) {
  const max = ctx.act.max || 100, rounds = ctx.act.rounds || 5;
  const denoms = max <= 100 ? [5, 10, 20, 50, 100] : [10, 20, 50, 100, 200];
  let r = 0, mistakes = 0;
  function next() {
    if (r >= rounds) return ctx.finish({ mistakes, total: rounds });
    const g = pick(SHOP_GOODS);
    const price = max <= 100 ? randInt(2, 19) * 5 : randInt(11, 50) * 10;
    let tray = [], miss = 0, lock = false;
    ctx.el.innerHTML = `
      <div class="shopgame">
        <div class="sg-item pop-in"><span class="emo sg-pic">${g[0]}</span><div><div class="sg-name">${esc(cap(g[1]))}</div><div class="sg-price">${fmtMoney(price)}</div></div>${sayBtn(`${cap(g[1])} stojí ${fmtMoney(price).replace(' €', ' eura')}`)}</div>
        <div class="sg-tray"><div class="sg-coins"></div><div class="sg-sum">Spolu: <b>0,00 €</b></div></div>
        <div class="sg-purse">${denoms.map(d => `<button class="sg-c" data-c="${d}">${coinHTML(d)}</button>`).join('')}</div>
        <div class="sg-act"><button class="btn green big pay">Zaplatiť 👛</button></div>
      </div>`;
    const upd = () => {
      $('.sg-coins', ctx.el).innerHTML = tray.map((c, i) => `<button class="sg-t" data-i="${i}">${coinHTML(c)}</button>`).join('') || '<span class="muted">Sem ťukaj mince 👇</span>';
      $('.sg-sum b', ctx.el).textContent = fmtMoney(tray.reduce((a, b) => a + b, 0));
      $$('.sg-t', ctx.el).forEach(b => b.onclick = () => { if (lock) return; tray.splice(+b.dataset.i, 1); Sfx.play('flip'); upd(); });
    };
    $$('.sg-c', ctx.el).forEach(b => b.onclick = () => { if (lock || tray.length >= 14) return; tray.push(+b.dataset.c); Sfx.play('coin'); upd(); });
    $('.pay', ctx.el).onclick = () => {
      if (lock) return;
      const s = tray.reduce((a, b) => a + b, 0);
      if (s === price) {
        lock = true;
        Sfx.play('buy'); if (!miss) ctx.praise();
        ctx.correct(null, !miss);
        $('.sg-item', ctx.el).classList.add('paid');
        Speech.say('Ďakujem, presne!');
        r++; ctx.progress(r, rounds);
        ctx.timeout(next, 1300);
      } else {
        miss++; mistakes++; Sfx.play('bad'); ctx.wrong(null);
        toast(s > price ? `To je o ${fmtMoney(s - price)} viac. Vráť nejakú mincu.` : `Ešte chýba ${fmtMoney(price - s)}.`, 2000);
      }
    };
    upd();
    ctx.timeout(() => ctx.say(`${cap(g[1])} stojí ${fmtMoney(price).replace(' €', ' eura')}`), 250);
  }
  next();
});

/* ==========================================================================
   HODINY
   ========================================================================== */
const HOD_GEN = ['', 'jednej', 'druhej', 'tretej', 'štvrtej', 'piatej', 'šiestej', 'siedmej', 'ôsmej', 'deviatej', 'desiatej', 'jedenástej', 'dvanástej'];
const HOD_ACC = ['', 'jednu', 'dve', 'tri', 'štyri', 'päť', 'šesť', 'sedem', 'osem', 'deväť', 'desať', 'jedenásť', 'dvanásť'];
function hodinyWord(h) { return h === 1 ? '1 hodina' : h < 5 ? `${h} hodiny` : `${h} hodín`; }
function timeWords(h, m) {
  const n = h % 12 + 1;
  if (m === 0) return hodinyWord(h);
  if (m === 30) return 'pol ' + HOD_GEN[n];
  if (m === 15) return 'štvrť na ' + HOD_ACC[n];
  return 'trištvrte na ' + HOD_ACC[n];
}
function digital(h, m) { return `${h}:${String(m).padStart(2, '0')}`; }
function clockMinutes(level) { return level <= 1 ? [0] : level === 2 ? [0, 30] : [0, 15, 30, 45]; }
defGame('clock', {
  name: (a) => a.mode === 'set' ? 'Nastav hodiny' : 'Koľko je hodín?', icon: '⏰',
  instr: (a) => a.mode === 'set' ? 'Nastav ručičky tak, aby hodiny ukazovali správny čas. Potom ťukni na ✓.' : 'Pozri sa na hodiny a vyber, koľko je hodín.',
}, function (ctx) {
  const level = ctx.act.level || 1, rounds = ctx.act.rounds || 6, mins = clockMinutes(level);
  if (ctx.act.mode !== 'set') {
    const qs = Array.from({ length: rounds }, () => [randInt(1, 12), pick(mins)]);
    return runRounds(ctx, qs, ([h, m]) => {
      const cands = [[h % 12 + 1, m], [(h + 10) % 12 + 1, m]].concat(mins.filter(x => x !== m).map(x => [h, x])).concat([[randInt(1, 12), pick(mins)]]);
      const wrong = uniqBy(cands.filter(([a, b]) => !(a === h && b === m)), ([a, b]) => a + ':' + b);
      return { key: null, text: 'Koľko je hodín?', pic: `clock:${h}:${m}`, sayOk: 'Je ' + timeWords(h, m),
        opts: shuffle([{ v: timeWords(h, m), lbl: digital(h, m), ok: true }].concat(sample(wrong, 3).map(([a, b]) => ({ v: timeWords(a, b), lbl: digital(a, b) })))) };
    });
  }
  let r = 0, mistakes = 0;
  function next() {
    if (r >= rounds) return ctx.finish({ mistakes, total: rounds });
    const th = randInt(1, 12), tm = pick(mins);
    let h = 12, m = 0, miss = 0, lock = false;
    const step = level >= 3 ? 15 : 30;
    ctx.el.innerHTML = `
      <div class="setclock">
        <div class="qcard"><div class="q-text">Nastav: <b>${esc(timeWords(th, tm))}</b> <span class="muted">(${digital(th, tm)})</span> ${sayBtn('Nastav hodiny: ' + timeWords(th, tm))}</div></div>
        <div class="sc-row">
          <div class="sc-ctl"><div class="sc-lbl">malá ručička</div><button class="btn small pink" data-a="h-">◀ −1 h</button><button class="btn small pink" data-a="h+">+1 h ▶</button></div>
          <div class="sc-clock"></div>
          <div class="sc-ctl"><div class="sc-lbl">veľká ručička</div><button class="btn small blue" data-a="m-">◀ −${step} min</button><button class="btn small blue" data-a="m+">+${step} min ▶</button></div>
        </div>
        <div class="sc-dig"></div>
        <div class="sg-act"><button class="btn green big ok">✓ Hotovo</button></div>
      </div>`;
    const draw = () => { $('.sc-clock', ctx.el).innerHTML = clockPic(h, m); $('.sc-dig', ctx.el).textContent = digital(h, m); };
    $$('[data-a]', ctx.el).forEach(b => b.onclick = () => {
      if (lock) return;
      const a = b.dataset.a;
      if (a === 'h+') h = h % 12 + 1;
      if (a === 'h-') h = (h + 10) % 12 + 1;
      if (a === 'm+') { m += step; if (m >= 60) { m -= 60; h = h % 12 + 1; } }
      if (a === 'm-') { m -= step; if (m < 0) { m += 60; h = (h + 10) % 12 + 1; } }
      Sfx.play('click'); draw();
    });
    $('.ok', ctx.el).onclick = () => {
      if (lock) return;
      if (h === th && m === tm) {
        lock = true; Sfx.play('good'); if (!miss) ctx.praise();
        ctx.correct(null, !miss);
        $('.sc-clock', ctx.el).classList.add('right');
        r++; ctx.progress(r, rounds);
        ctx.timeout(next, 1200);
      } else {
        miss++; mistakes++; Sfx.play('bad'); ctx.wrong(null);
        const c = $('.sc-clock', ctx.el); c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake');
        toast(h !== th && m !== tm ? 'Skontroluj obe ručičky 🙂' : h !== th ? 'Malá ručička ešte nie je správne.' : 'Veľká ručička ešte nie je správne.', 1800);
      }
    };
    draw();
    ctx.timeout(() => ctx.say('Nastav hodiny: ' + timeWords(th, tm)), 250);
  }
  next();
});

/* ==========================================================================
   ČÍSELNÁ OS
   ========================================================================== */
defGame('numline', {
  name: 'Číselná os', icon: '📏',
  instr: 'Ťukni na číselnú os tam, kde je hľadané číslo.',
}, function (ctx) {
  const max = ctx.act.max || 100, rounds = ctx.act.rounds || 6, tol = Math.max(1, Math.round(max / 33));
  const X0 = 40, X1 = 960, xOf = v => X0 + (X1 - X0) * v / max;
  let r = 0, mistakes = 0;
  function next() {
    if (r >= rounds) return ctx.finish({ mistakes, total: rounds });
    let t; do { t = randInt(2, max - 2); } while (t % 10 === 0 && Math.random() < 0.7);
    let miss = 0, lock = false;
    const ticks = [];
    for (let v = 0; v <= max; v++) {
      const big = v % 10 === 0, mid = v % 5 === 0;
      if (max > 100 && !mid) continue;
      ticks.push(`<line x1="${xOf(v)}" x2="${xOf(v)}" y1="${big ? 52 : mid ? 60 : 64}" y2="${big ? 88 : mid ? 80 : 76}" class="${big ? 'tb' : 'ts'}"/>` + (big ? `<text x="${xOf(v)}" y="116">${v}</text>` : ''));
    }
    ctx.el.innerHTML = `
      <div class="numline">
        <div class="qcard"><div class="q-text">Kde je číslo <b class="nl-t">${t}</b>? ${sayBtn('Kde je číslo ' + t + '?')}</div></div>
        <svg class="nl-svg" viewBox="0 0 1000 140"><rect x="0" y="0" width="1000" height="140" fill="transparent"/>
          <line x1="${X0}" x2="${X1}" y1="70" y2="70" class="nl-line"/>${ticks.join('')}<g class="nl-marks"></g></svg>
      </div>`;
    const svg = $('.nl-svg', ctx.el), marks = $('.nl-marks', ctx.el);
    const mark = (v, cls, txt) => { marks.insertAdjacentHTML('beforeend', `<g class="nl-m ${cls}" transform="translate(${xOf(v)} 0)"><path d="M0 64L-12 38H12Z"/><text y="30">${txt}</text></g>`); };
    svg.addEventListener('click', e => {
      if (lock) return;
      const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      const q = pt.matrixTransform(svg.getScreenCTM().inverse());
      const v = Math.max(0, Math.min(max, Math.round((q.x - X0) / (X1 - X0) * max)));
      if (Math.abs(v - t) <= tol) {
        lock = true; mark(t, 'ok', t); Sfx.play('good'); if (!miss) ctx.praise();
        ctx.correct(null, !miss);
        r++; ctx.progress(r, rounds); ctx.timeout(next, 1200);
      } else {
        miss++; mistakes++; Sfx.play('bad'); ctx.wrong(null);
        mark(v, 'no', v);
        setTimeout(() => { const m = marks.querySelector('.nl-m.no'); if (m) m.remove(); }, 1200);
        if (miss >= 2) { lock = true; mark(t, 'ok', t); r++; ctx.progress(r, rounds); ctx.timeout(next, 1800); }
      }
    });
    ctx.timeout(() => ctx.say('Kde je číslo ' + t + '?'), 250);
  }
  next();
});

/* ==========================================================================
   DOPLŇ, TELEFÓN, HÁDAJ NÁSTROJ
   ========================================================================== */
defGame('gap', {
  name: 'Doplň', icon: '🧩',
  instr: 'Čo chýba? Vyber správne písmenko alebo znamienko.',
}, function (ctx) {
  let gs = srcLessons(ctx).flatMap(L => L.gaps || []);
  if (ctx.act.only === 'punct') gs = gs.filter(g => /[.?!]/.test(g.a));
  if (ctx.act.only === 'caps') gs = gs.filter(g => !/[.?!]/.test(g.a));
  runRounds(ctx, sample(gs, ctx.act.rounds || 8), gapQ);
});

defGame('dial', {
  name: 'Zavolaj pomoc', icon: '📞',
  instr: 'Vyťukaj na telefóne správne číslo, na ktoré zavoláš pomoc.',
}, function (ctx) {
  const list = pickTargets(ctx.L.dial || [], ctx.act.rounds || 4);
  let r = 0, mistakes = 0;
  function next() {
    if (r >= list.length) return ctx.finish({ mistakes, total: list.length });
    const d = list[r];
    let typed = '', miss = 0, lock = false;
    ctx.el.innerHTML = `
      <div class="dial">
        <div class="qcard"><div class="q-pic small">${pic(d.p)}</div><div class="q-text">${esc(d.q)} ${sayBtn(d.q)}</div></div>
        <div class="phone"><div class="ph-screen"><span class="ph-num"></span></div>
          <div class="ph-keys">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(k => `<button class="pk" data-k="${k}">${k}</button>`).join('')}<button class="pk del" data-k="del">⌫</button><button class="pk" data-k="0">0</button><button class="pk call" data-k="call">📞</button></div></div>
      </div>`;
    const scr = $('.ph-num', ctx.el);
    const upd = () => { scr.textContent = typed; };
    const check = () => {
      if (typed === d.num) {
        lock = true;
        $('.phone', ctx.el).classList.add('calling');
        scr.textContent = `📞 Volám ${d.num}…`;
        Sfx.play('ring');
        if (!miss) ctx.praise();
        ctx.correct(null, !miss);
        Speech.say(`Výborne. Na číslo ${d.num.split('').join(' ')} zavoláš ${d.n}.`);
        r++; ctx.progress(r, list.length);
        ctx.timeout(next, 2600);
      } else {
        miss++; mistakes++; Sfx.play('bad'); ctx.wrong(null);
        const p = $('.phone', ctx.el); p.classList.remove('shake'); void p.offsetWidth; p.classList.add('shake');
        typed = ''; upd();
        if (miss >= 2) toast(`Číslo je ${d.num} 🙂`, 2200);
      }
    };
    $$('.pk', ctx.el).forEach(b => b.onclick = () => {
      if (lock) return;
      const k = b.dataset.k;
      if (k === 'del') typed = typed.slice(0, -1);
      else if (k === 'call') { if (typed) check(); return; }
      else if (typed.length < 4) typed += k;
      Sfx.play('click'); upd();
      if (typed.length === d.num.length) setTimeout(check, 250);
    });
    ctx.timeout(() => ctx.say(d.q), 250);
  }
  next();
});

defGame('sound', {
  name: 'Hádaj nástroj', icon: '🎵',
  instr: 'Vypočuj si hudbu a hádaj, ktorý nástroj hrá. Na 🎵 si ju môžeš pustiť znova.',
}, function (ctx) {
  const pool = uniqBy(srcItems(ctx).filter(x => x.snd), x => x.snd);
  const targets = pickTargets(pool, ctx.act.rounds || 6);
  const n = Math.min(ctx.act.opts || 3, pool.length);
  runRounds(ctx, targets, t => ({
    key: t.key, text: 'Ktorý nástroj hrá?', sayOk: cap(t.n),
    head: `<button class="big-speaker play-it" title="Zahrať">🎵</button>`,
    opts: optsFrom({ v: t.p, lbl: t.n }, pool.filter(x => x !== t).map(x => ({ v: x.p, lbl: x.n })), n),
    onShow: t.snd,
  }));
});

/* ==========================================================================
   VEĽKÝ KVÍZ a MIX OTÁZOK
   ========================================================================== */
const QGEN = {
  abcmissing() {
    const cands = [];
    for (let i = 1; i < ABC_FULL.length - 1; i++) if ([i - 1, i, i + 1].every(k => ABC_COMMON.has(ABC_FULL[k]))) cands.push(i);
    const i = pick(cands), a = ABC_FULL[i];
    return { key: null, text: 'Ktoré písmenko chýba?', head: `<div class="gap-line abc">${ABC_FULL[i - 1]}, <span class="gap-blank">?</span>, ${ABC_FULL[i + 1]}</div>`, say: '', fast: true,
      opts: optsFrom({ v: a }, sample(ABC_SUB.filter(x => x !== a), 4).map(v => ({ v })), 3),
      onCorrect: root => { const b = $('.gap-blank', root); if (b) { b.textContent = a; b.classList.add('filled'); } } };
  },
  abcnext() {
    const cands = [];
    for (let i = 2; i < ABC_FULL.length; i++) if ([i - 2, i - 1, i].every(k => ABC_COMMON.has(ABC_FULL[k]))) cands.push(i);
    const i = pick(cands), a = ABC_FULL[i];
    return { key: null, text: 'Ktoré písmenko nasleduje?', head: `<div class="gap-line abc">${ABC_FULL[i - 2]}, ${ABC_FULL[i - 1]}, <span class="gap-blank">?</span></div>`, say: '', fast: true,
      opts: optsFrom({ v: a }, sample(ABC_SUB.filter(x => x !== a), 4).map(v => ({ v })), 3),
      onCorrect: root => { const b = $('.gap-blank', root); if (b) { b.textContent = a; b.classList.add('filled'); } } };
  },
  daynext() {
    const i = randInt(0, 6), a = DAYS[(i + 1) % 7];
    return { key: null, text: `Ktorý deň je po dni ${DAYS[i]}?`, say: `Ktorý deň je po dni ${DAYS[i]}?`, fast: true,
      opts: optsFrom({ v: a }, DAYS.filter(d => d !== a && d !== DAYS[i]).map(v => ({ v })), 3) };
  },
  dayprev() {
    const i = randInt(0, 6), a = DAYS[(i + 6) % 7];
    return { key: null, text: `Ktorý deň je pred dňom ${DAYS[i]}?`, say: `Ktorý deň je pred dňom ${DAYS[i]}?`, fast: true,
      opts: optsFrom({ v: a }, DAYS.filter(d => d !== a && d !== DAYS[i]).map(v => ({ v })), 3) };
  },
  syll() { const L = LESSON_BY_ID['s-syll']; return L ? syllCountQ(pick(L.items)) : null; },
};
/* všetky otázky, ktoré sa dajú položiť z lekcií (bez máp) */
function questionPool(lessons, withMaps) {
  const out = [];
  lessons.forEach(L => {
    const add = f => out.push({ L: L.id, f });
    (L.quiz || []).forEach(q => add(() => quizQ(q)));
    (L.tf || []).forEach(t => add(() => tfQ(t)));
    if (L.sort) L.sort.items.forEach(s => add(() => sortQ(L.sort, s)));
    (L.gaps || []).forEach(g => add(() => gapQ(g)));
    const mode = itemMode(L);
    (L.items || []).forEach(it => {
      if (it.snd) return;
      if (it.sy) return add(() => syllCountQ(it));
      if (withMaps) {
        const q = questionFor(it.key);
        if (q && q.map) return add(() => questionFor(it.key));
      }
      if (mode && it[mode.ans] != null && it[mode.show] != null) add(() => itemQ(it, L.items, mode, 3));
    });
    if (L.qgen) L.qgen.gen.forEach(g => { for (let k = 0; k < 4; k++) add(() => (MATH_GEN[g] ? mathChoiceQ(g) : QGEN[g] ? QGEN[g]() : null)); });
  });
  return out;
}
/* vyber n otázok rovnomerne z lekcií */
function spreadPick(pool, n) {
  const by = {};
  pool.forEach(p => (by[p.L] = by[p.L] || []).push(p));
  const lists = shuffle(Object.values(by).map(l => shuffle(l)));
  const out = [];
  for (let k = 0; out.length < n && k < 60; k++) lists.forEach(l => { if (l[k] && out.length < n) out.push(l[k]); });
  return shuffle(out);
}
defGame('bigquiz', {
  name: 'Veľký kvíz', icon: '🏆',
  instr: 'Veľký kvíz! Čaká ťa desať otázok. Máš dvoch pomocníkov: 50 na 50 a líšku, ktorá ti poradí.',
}, function (ctx) {
  const lessons = ctx.L.pool || srcLessons(ctx);
  const qs = spreadPick(questionPool(lessons, false), ctx.act.rounds || 10);
  const total = qs.length;
  let r = 0, mistakes = 0, j50 = true, jfox = true;
  function next() {
    if (r >= total) return ctx.finish({ mistakes, total, bigquiz: true });
    const q = qs[r].f();
    if (!q) { r++; return next(); }
    let handle = null;
    const fin = m => { mistakes += Math.min(m, 2); r++; ctx.progress(r, total); next(); };
    handle = choiceRound(ctx, q, fin);
    const bar = el(`<div class="bq-bar">
      <div class="bq-ladder">${qs.map((_, i) => `<span class="${i < r ? 'done' : i === r ? 'on' : ''}">${i === total - 1 ? '🏆' : i + 1}</span>`).join('')}</div>
      <div class="bq-jokers"><button class="btn small yellow j50" ${j50 && !q.tf && q.opts.length > 2 ? '' : 'disabled'}>½ 50 : 50</button>
      <button class="btn small orange jfox" ${jfox ? '' : 'disabled'}>🦊 Poraď mi</button></div></div>`);
    ctx.el.prepend(bar);
    $('.j50', bar).onclick = () => { if (!j50) return; j50 = false; mistakes += 0.5; handle.remove(Math.max(1, q.opts.length - 2)); $('.j50', bar).disabled = true; Sfx.play('flip'); };
    $('.jfox', bar).onclick = () => { if (!jfox) return; jfox = false; mistakes += 0.5; handle.hint(); $('.jfox', bar).disabled = true; Sfx.play('star'); toast('🦊 Líška šepká: „Myslím, že je to táto!“', 2000); };
  }
  next();
});

defGame('mix', {
  name: 'Mix otázok', icon: '🎲',
  instr: 'Odpovedz na otázky. Budú rôzne – z celej oblasti.',
}, function (ctx) {
  const a = ctx.act;
  if (ctx.L.practice) return runRounds(ctx, a.keys || [], questionFor);
  if (a.gen) return runRounds(ctx, Array.from({ length: a.rounds || 6 }, () => a.gen), g => QGEN[g] ? QGEN[g]() : mathChoiceQ(g));
  const lessons = ctx.L.pool || srcLessons(ctx);
  const qs = spreadPick(questionPool(lessons, true), a.rounds || 8);
  runRounds(ctx, qs, p => p.f());
});
