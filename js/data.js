/* ==========================================================================
   Objavujem svet – ZÁKLAD OBSAHU (oblasti, odznaky, obchod)
   --------------------------------------------------------------------------
   Samotné lekcie sú v súboroch js/obsah-*.js (jeden súbor = jedna oblasť).
   Lekcia:
     id, area, title, sub, icon, badge: { e, name, desc }
     items – kartičky lekcie: { n: názov, p: obrázok, f: zaujímavosť, ...ďalšie polia }
     quiz  – otázky: { q, p?, a: správna odpoveď, o: [zlé odpovede], f?: vysvetlenie, pics?: true }
     tf    – pravda / nepravda: { s: tvrdenie, ok: true/false, f?: vysvetlenie }
     sort  – triedenie: { bins: [{ id, n, p }], items: [{ n, p, b: id koša }] }
     order – zoraďovanie: [{ q, seq: [{ n, p }, ...] }]
     gaps  – doplň písmenko: [{ w: 'ru_y', a: 'y', o: ['i'], p }]
     acts  – úlohy lekcie (typy sú v js/games.js)
   Obrázok (p) je emoji alebo skratka: flag:sk, map:world:fr, pt:slovakia:17.1:48.1,
     planet:mars, clock:7:30, coin:50, note:5, shape:kruh, sign:stop, bin:yellow, txt:A,
     row:🥚|🐛 (viac obrázkov vedľa seba), svg:kukla (vlastné kresby v js/pics.js)
   ========================================================================== */

const AREAS = [
  { id: 'geo',   name: 'Cestovateľka',       sub: 'Zemepis – mapy, vlajky a krajiny',   icon: '🌍', color: '#3fa9f5', dark: '#2386d1', bg: '#e1f2ff' },
  { id: 'nat',   name: 'Čarovná príroda',     sub: 'Zvieratá, rastliny a ročné obdobia', icon: '🌿', color: '#2fc97a', dark: '#1d9f5b', bg: '#ddf8ea' },
  { id: 'space', name: 'Vesmír',              sub: 'Planéty, Mesiac, hviezdy a rakety',  icon: '🚀', color: '#6c5ce7', dark: '#4b3cc4', bg: '#e9e5ff' },
  { id: 'body',  name: 'Telo a zdravie',      sub: 'Moje telo, zmysly, bezpečnosť',      icon: '❤️', color: '#ff6b81', dark: '#e0485f', bg: '#ffe4e9' },
  { id: 'math',  name: 'Počtárska dielňa',    sub: 'Počítanie, peniaze, hodiny, tvary',  icon: '🔢', color: '#ff9d3d', dark: '#e07b17', bg: '#fff0dc' },
  { id: 'sk',    name: 'Kúzelné písmenká',    sub: 'Slovenčina a rozprávky',             icon: '📖', color: '#ff5fa2', dark: '#d9427f', bg: '#ffe4f1' },
  { id: 'know',  name: 'Múdra hlavička',      sub: 'Kalendár, povolania, hudba, dinosaury', icon: '💡', color: '#e6a100', dark: '#b87f00', bg: '#fff3cf' },
];
/* „oblasť“ pre tréning chybičiek (nie je na mape) */
const PRACTICE_AREA = { id: 'wp', name: 'Tréning', icon: '💪', color: '#ff9d3d', dark: '#e07b17', bg: '#fff0dc' };

const LESSONS = [];
function addLessons(area, list) {
  list.forEach(L => { L.area = area; LESSONS.push(L); });
}

/* Špeciálne odznaky */
const SPECIAL_BADGES = [
  { id: 'first',    e: '🐣', name: 'Prvé kroky',          desc: 'Dokonči prvú úlohu',                        color: '#ffb020' },
  { id: 'perfect',  e: '💎', name: 'Bez chybičky',        desc: 'Získaj ★★★ vo všetkých úlohách lekcie',      color: '#3fa9f5' },
  { id: 'streak3',  e: '🔥', name: '3 dni za sebou',      desc: 'Uč sa 3 dni po sebe',                       color: '#ff7a3d' },
  { id: 'streak7',  e: '🌟', name: 'Celý týždeň',         desc: 'Uč sa 7 dní po sebe',                       color: '#ffc83d' },
  { id: 'allareas', e: '🧭', name: 'Všestranná',          desc: 'Dokonči lekciu v každej oblasti',           color: '#00b8a9' },
  { id: 'memory5',  e: '🧠', name: 'Pexeso majsterka',    desc: 'Vyhraj 5× pexeso na ★★★',                   color: '#9b4dff' },
  { id: 'map25',    e: '🗺️', name: 'Malá kartografka',    desc: 'Nájdi na mape 25 miest bez chybičky',       color: '#3fa9f5' },
  { id: 'math100',  e: '🧮', name: 'Počtárka',            desc: 'Vypočítaj správne 100 príkladov',           color: '#ff9d3d' },
  { id: 'quiz3',    e: '🏆', name: 'Kvízová šampiónka',   desc: 'Vyhraj Veľký kvíz na ★★★',                  color: '#e6a100' },
  { id: 'trainer5', e: '🏋️‍♀️', name: 'Tréningová hviezda', desc: 'Dokonči 5 tréningov chybičiek',             color: '#ff9d3d' },
  { id: 'know50',   e: '📚', name: '50 vedomostí',        desc: 'Správne odpovedz na 50 rôznych otázok',     color: '#2fc97a' },
  { id: 'know100',  e: '🎓', name: '100 vedomostí',       desc: 'Správne odpovedz na 100 rôznych otázok',    color: '#00b8a9' },
  { id: 'know200',  e: '🦊', name: 'Múdra líška',         desc: 'Správne odpovedz na 200 rôznych otázok',    color: '#ff7a3d' },
  { id: 'know400',  e: '🦉', name: 'Profesorka',          desc: 'Správne odpovedz na 400 rôznych otázok',    color: '#8f63ff' },
  { id: 'know600',  e: '👑', name: 'Encyklopédia',        desc: 'Správne odpovedz na 600 rôznych otázok',    color: '#ff5fa2' },
  { id: 'money5',   e: '🐷', name: 'Šetrílek',            desc: 'Zarob spolu 5 €',                           color: '#ff5fa2' },
  { id: 'money20',  e: '💰', name: 'Boháčka',             desc: 'Zarob spolu 20 €',                          color: '#e6a100' },
  { id: 'money50',  e: '🏦', name: 'Malá bankárka',       desc: 'Zarob spolu 50 €',                          color: '#00b8a9' },
  { id: 'shop1',    e: '🛍️', name: 'Prvý nákup',          desc: 'Kúp si niečo v obchode',                    color: '#ff5fa2' },
];

/* Obchod – ozdoby k obrázku (ceny v centoch) */
const SHOP_CATS = [
  { id: 'hat',     name: 'Na hlavu',  icon: '👑' },
  { id: 'glasses', name: 'Okuliare',  icon: '🕶️' },
  { id: 'frame',   name: 'Rámčeky',   icon: '🌈' },
  { id: 'pet',     name: 'Kamaráti',  icon: '🐶' },
];
const SHOP_ITEMS = [
  { id: 'bow',         cat: 'hat',     emoji: '🎀', name: 'Mašľa',             acc: 'mašľu', price: 30 },
  { id: 'flower',      cat: 'hat',     emoji: '🌸', name: 'Kvietok',           acc: 'kvietok', price: 30 },
  { id: 'cap',         cat: 'hat',     emoji: '🧢', name: 'Šiltovka',          acc: 'šiltovku', price: 50 },
  { id: 'sunhat',      cat: 'hat',     emoji: '👒', name: 'Klobúčik',          acc: 'klobúčik', price: 60 },
  { id: 'helmet',      cat: 'hat',     emoji: '⛑️', name: 'Záchranárska prilba', acc: 'záchranársku prilbu', price: 70 },
  { id: 'tophat',      cat: 'hat',     emoji: '🎩', name: 'Cylinder',          acc: 'cylinder', price: 80 },
  { id: 'gradcap',     cat: 'hat',     emoji: '🎓', name: 'Múdra čiapka',      acc: 'múdru čiapku', price: 100 },
  { id: 'crown',       cat: 'hat',     emoji: '👑', name: 'Korunka',           acc: 'korunku', price: 150 },
  { id: 'glasses',     cat: 'glasses', emoji: '👓', name: 'Okuliare',          acc: 'okuliare', price: 40 },
  { id: 'sunglasses',  cat: 'glasses', emoji: '🕶️', name: 'Slnečné okuliare',  acc: 'slnečné okuliare', price: 60 },
  { id: 'goggles',     cat: 'glasses', emoji: '🥽', name: 'Bádateľské okuliare', acc: 'bádateľské okuliare', price: 80 },
  { id: 'f-pink',      cat: 'frame',   name: 'Ružový rámček',    acc: 'ružový rámček', price: 20,  bg: 'linear-gradient(135deg,#ffc2df,#ff7eb9)' },
  { id: 'f-mint',      cat: 'frame',   name: 'Mätový rámček',    acc: 'mätový rámček', price: 20,  bg: 'linear-gradient(135deg,#c9f7e2,#5fd8a4)' },
  { id: 'f-sky',       cat: 'frame',   name: 'Nebeský rámček',   acc: 'nebeský rámček', price: 30,  bg: 'linear-gradient(135deg,#cfeaff,#6bb8ff)' },
  { id: 'f-earth',     cat: 'frame',   name: 'Zemeguľový rámček', acc: 'zemeguľový rámček', price: 60, bg: 'radial-gradient(circle at 30% 30%,#7fd4ff,#2d8fe0 55%,#1f6fb8), #2d8fe0' },
  { id: 'f-forest',    cat: 'frame',   name: 'Lesný rámček',     acc: 'lesný rámček', price: 60,  bg: 'linear-gradient(135deg,#b8f0a0,#3fae5a 60%,#2a7d3f)' },
  { id: 'f-gold',      cat: 'frame',   name: 'Zlatý rámček',     acc: 'zlatý rámček', price: 100, bg: 'radial-gradient(circle at 35% 30%,#fff6c2,#ffd23f 55%,#d9a300)' },
  { id: 'f-rainbow',   cat: 'frame',   name: 'Dúhový rámček',    acc: 'dúhový rámček', price: 120, bg: 'conic-gradient(#ff5f5f,#ffb14d,#ffe14d,#5fd87a,#4db8ff,#9b6bff,#ff5fa2,#ff5f5f)' },
  { id: 'f-galaxy',    cat: 'frame',   name: 'Vesmírny rámček',  acc: 'vesmírny rámček', price: 150, bg: 'radial-gradient(circle at 30% 30%,#8f7bff,#3b2d8f 60%,#1a1447)', sparkle: true },
  { id: 'p-chick',     cat: 'pet',     emoji: '🐣', name: 'Kuriatko',   acc: 'kuriatko', price: 50 },
  { id: 'p-hedgehog',  cat: 'pet',     emoji: '🦔', name: 'Ježko',      acc: 'ježka', price: 60 },
  { id: 'p-butterfly', cat: 'pet',     emoji: '🦋', name: 'Motýlik',    acc: 'motýlika', price: 60 },
  { id: 'p-turtle',    cat: 'pet',     emoji: '🐢', name: 'Korytnačka', acc: 'korytnačku', price: 70 },
  { id: 'p-parrot',    cat: 'pet',     emoji: '🦜', name: 'Papagáj',    acc: 'papagája', price: 80 },
  { id: 'p-dog',       cat: 'pet',     emoji: '🐶', name: 'Psík',       acc: 'psíka', price: 80 },
  { id: 'p-cat',       cat: 'pet',     emoji: '🐱', name: 'Mačička',    acc: 'mačičku', price: 80 },
  { id: 'p-fox',       cat: 'pet',     emoji: '🦊', name: 'Líštička',   acc: 'líštičku', price: 100 },
  { id: 'p-unicorn',   cat: 'pet',     emoji: '🦄', name: 'Jednorožec', acc: 'jednorožca', price: 150 },
  { id: 'p-dino',      cat: 'pet',     emoji: '🦕', name: 'Dinosaurík', acc: 'dinosauríka', price: 180 },
  { id: 'p-dragon',    cat: 'pet',     emoji: '🐉', name: 'Dráčik',     acc: 'dráčika', price: 200 },
];
const SHOP_BY_ID = {};
SHOP_ITEMS.forEach(i => { SHOP_BY_ID[i.id] = i; });

/* ---------- príprava dát (netreba meniť) ---------- */
const AREA_BY_ID = { wp: PRACTICE_AREA };
AREAS.forEach(a => { AREA_BY_ID[a.id] = a; });
const LESSON_BY_ID = {};
let QREG = {};          // kľúč otázky → { L, kind, ref } (na tréning chybičiek)
let ITEM_BY_KEY = {};

/* Zostava úloh opakovania oblasti – ak lekcia nemá vlastnú */
const REVIEW_ACTS = [
  { type: 'bigquiz', rounds: 10 },
  { type: 'mix', rounds: 8, src: 'area' },
  { type: 'memory', pairs: 6, src: 'area' },
];

function prepareData() {
  QREG = {}; ITEM_BY_KEY = {};
  const byArea = {};
  LESSONS.forEach((L, i) => {
    LESSON_BY_ID[L.id] = L;
    (byArea[L.area] = byArea[L.area] || []).push(L);
    L.items = L.items || [];
    L.items.forEach((it, j) => {
      it.k = it.k || it.n;
      it.key = L.id + '|i|' + it.k;
      it.lesson = L.id;
      ITEM_BY_KEY[it.key] = it;
      QREG[it.key] = { L, kind: 'item', ref: it };
    });
    (L.acts || []).forEach(a => { if (a.type === 'map' && !a.board && L.board) a.board = L.board; });
    (L.quiz || []).forEach((q, j) => { q.key = L.id + '|q|' + j; QREG[q.key] = { L, kind: 'quiz', ref: q }; });
    (L.tf || []).forEach((t, j) => { t.key = L.id + '|t|' + j; QREG[t.key] = { L, kind: 'tf', ref: t }; });
    if (L.sort) L.sort.items.forEach((s, j) => { s.key = L.id + '|s|' + j; QREG[s.key] = { L, kind: 'sort', ref: s }; });
    (L.gaps || []).forEach((g, j) => { g.key = L.id + '|g|' + j; QREG[g.key] = { L, kind: 'gap', ref: g }; });
  });
  for (const a in byArea) {
    const ls = byArea[a];
    ls.forEach((L, k) => {
      L.index = k;
      L.prev = k ? ls[k - 1] : null;
      if (L.review) {
        L.pool = ls.filter(x => !x.review);
        L.acts = L.acts || REVIEW_ACTS;
      }
    });
  }
}

function areaLessons(areaId) { return LESSONS.filter(L => L.area === areaId); }
function areaReview(areaId) { return LESSONS.find(L => L.review && L.area === areaId); }
function reqIdx(L) { return L.acts.map((a, i) => (a.bonus ? -1 : i)).filter(i => i >= 0); }

function lessonBadge(L) {
  const A = AREA_BY_ID[L.area];
  return { id: 'L-' + L.id, e: L.badge.e, name: L.badge.name, desc: L.badge.desc, color: A.color, lesson: L.id };
}
function allBadges() { return LESSONS.map(lessonBadge).concat(SPECIAL_BADGES); }
function getBadge(id) { return allBadges().find(b => b.id === id); }
