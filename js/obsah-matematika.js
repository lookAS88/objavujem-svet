/* ==========================================================================
   Oblasť: POČTÁRSKA DIELŇA (matematika)
   Príklady sa vymýšľajú samé (typ úlohy „math“, „compare“, „coins“, „clock“…),
   takže sú zakaždým iné. gen = druh príkladov (pozri MATH_GEN v js/games.js).
   ========================================================================== */
addLessons('math', [
  /* ------------------------------------------------------------------ */
  {
    id: 'm-add', title: 'Sčítanie', sub: 'plus do 20', icon: '➕',
    badge: { e: '➕', name: 'Sčítacia víla', desc: 'Vieš sčítať do 20' },
    qgen: { gen: ['add10', 'add20', 'add20c'] },
    items: [
      { n: 'plus', p: 'txt:+', f: 'Znamienko plus (+) znamená, že veci pridávame. 3 + 2 = 5.' },
      { n: 'sčítanie cez 10', p: 'txt:8+5', f: 'Najprv doplň do 10, potom pridaj zvyšok: 8 + 2 = 10, a ešte 3 je 13.' },
      { n: 'dvojice do 10', p: 'txt:7+3', f: 'Tieto dvojice dajú spolu 10: 1+9, 2+8, 3+7, 4+6, 5+5. Oplatí sa ich vedieť naspamäť!' },
      { n: 'poradie nevadí', p: 'txt:2+6', f: '2 + 6 je to isté ako 6 + 2. Začni väčším číslom – ide to rýchlejšie!' },
    ],
    acts: [
      { type: 'learn' },
      { type: 'math', gen: 'add10', rounds: 8 },
      { type: 'math', gen: 'add20', rounds: 8 },
      { type: 'balloons', mode: 'math', gen: 'add20', rounds: 6 },
      { type: 'math', gen: 'add20c', rounds: 8 },
      { type: 'dots', rounds: 1, pick: 'fish' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'm-sub', title: 'Odčítanie', sub: 'mínus do 20', icon: '➖',
    badge: { e: '➖', name: 'Odčítacia hviezda', desc: 'Vieš odčítať do 20' },
    qgen: { gen: ['sub10', 'sub20', 'sub20c', 'miss10'] },
    items: [
      { n: 'mínus', p: 'txt:−', f: 'Znamienko mínus (−) znamená, že veci uberáme. 5 − 2 = 3.' },
      { n: 'odčítanie cez 10', p: 'txt:13−5', f: 'Najprv uber do 10: 13 − 3 = 10, a ešte 2 dole je 8.' },
      { n: 'chýbajúce číslo', p: 'txt:4+?=9', f: 'Koľko chýba? Počítaj od 4 po 9: 5, 6, 7, 8, 9 – to je 5 krokov.' },
    ],
    acts: [
      { type: 'learn' },
      { type: 'math', gen: 'sub10', rounds: 8 },
      { type: 'math', gen: 'sub20', rounds: 8 },
      { type: 'math', gen: 'miss10', rounds: 6 },
      { type: 'balloons', mode: 'math', gen: 'sub20', rounds: 6 },
      { type: 'math', gen: 'sub20c', rounds: 8 },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'm-100', title: 'Do sto', sub: 'desiatky a jednotky', icon: '💯',
    badge: { e: '💯', name: 'Stovková šampiónka', desc: 'Počítaš do 100' },
    qgen: { gen: ['tens', 'add100', 'sub100', 'tensunits'] },
    items: [
      { n: 'desiatky', p: 'tens:3:0', f: 'Desať jednotiek je jedna desiatka. Tri desiatky sú 30.' },
      { n: 'desiatky a jednotky', p: 'tens:4:7', f: 'Číslo 47 má 4 desiatky a 7 jednotiek.' },
      { n: 'sto', p: 'txt:100', f: 'Desať desiatok je sto. 10 + 10 + 10 + … (desaťkrát) = 100.' },
      { n: 'počítanie po desiatkach', p: 'txt:40+30', f: '4 desiatky a 3 desiatky je 7 desiatok – teda 70.' },
    ],
    acts: [
      { type: 'learn' },
      { type: 'math', gen: 'tensunits', rounds: 6 },
      { type: 'math', gen: 'tens', rounds: 8 },
      { type: 'numline', max: 100, rounds: 6 },
      { type: 'math', gen: 'add100', rounds: 8 },
      { type: 'math', gen: 'sub100', rounds: 8 },
      { type: 'dots', rounds: 1, pick: 'rocket' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'm-compare', title: 'Väčší či menší', sub: 'porovnávanie čísel', icon: '🐊',
    badge: { e: '🐊', name: 'Krokodília kamarátka', desc: 'Vieš porovnávať čísla' },
    items: [
      { n: 'väčší', p: 'txt:>', f: 'Krokodíl je hladný a vždy otvára pusu na väčšie číslo: 8 > 3.' },
      { n: 'menší', p: 'txt:<', f: 'Špička ukazuje na menšie číslo: 2 < 9.' },
      { n: 'rovná sa', p: 'txt:=', f: 'Keď sú čísla rovnaké, dáme rovná sa: 5 = 5.' },
    ],
    acts: [
      { type: 'learn' },
      { type: 'compare', max: 20, rounds: 8 },
      { type: 'order', rounds: 4, gen: 'numbers', max: 20 },
      { type: 'compare', max: 100, rounds: 8 },
      { type: 'order', rounds: 4, gen: 'numbers', max: 100 },
      { type: 'compare', max: 20, expr: true, rounds: 6 },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'm-money', title: 'Peniaze', sub: 'eurá a centy', icon: '💶',
    badge: { e: '💶', name: 'Šikovná nákupčička', desc: 'Vieš platiť eurami' },
    items: [
      { n: '1 cent', p: 'coin:1', f: 'Najmenšia minca. 100 centov je 1 euro.' },
      { n: '10 centov', p: 'coin:10', f: 'Desať centov – zlatá minca.' },
      { n: '50 centov', p: 'coin:50', f: 'Päťdesiat centov je pol eura.' },
      { n: '1 euro', p: 'coin:100', f: 'Jedno euro = 100 centov. Minca má zlatý stred a strieborný okraj.' },
      { n: '2 eurá', p: 'coin:200', f: 'Najväčšia minca – má strieborný stred a zlatý okraj.' },
      { n: '5 eur', p: 'note:5', f: 'Najmenšia bankovka je sivá päťeurovka.' },
      { n: '10 eur', p: 'note:10', f: 'Desaťeurová bankovka je červená.' },
    ],
    quiz: [
      { q: 'Koľko centov má 1 euro?', a: '100', o: ['10', '50', '1000'] },
      { q: 'Koľko je dve 50-centové mince?', a: '1 euro', o: ['50 centov', '2 eurá', '5 eur'] },
      { q: 'Čo je viac?', pics: true, a: 'coin:200', o: ['coin:100', 'coin:50', 'coin:20'] },
      { q: 'Aká je najmenšia minca?', pics: true, a: 'coin:1', o: ['coin:10', 'coin:100', 'coin:5'] },
      { q: 'Máš 1 euro. Lízanka stojí 60 centov. Koľko ti vrátia?', a: '40 centov', o: ['60 centov', '1 euro', 'nič'] },
      { q: 'Koľko je 20 + 20 + 10 centov?', a: '50 centov', o: ['40 centov', '60 centov', '1 euro'] },
      { q: 'Koľko je päť 20-centových mincí?', a: '1 euro', o: ['50 centov', '2 eurá', '20 centov'] },
    ],
    acts: [
      { type: 'learn' },
      { type: 'coins', max: 100, rounds: 5 },
      { type: 'quiz', rounds: 6 },
      { type: 'coins', max: 500, rounds: 5 },
      { type: 'math', gen: 'money', rounds: 6 },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'm-clock', title: 'Hodiny', sub: 'koľko je hodín?', icon: '⏰',
    badge: { e: '⏰', name: 'Pani času', desc: 'Vieš, koľko je hodín' },
    items: [
      { n: 'malá ručička', p: 'clock:3:0', f: 'Malá ručička ukazuje hodiny. Tu ukazuje na 3 – sú 3 hodiny.' },
      { n: 'veľká ručička', p: 'clock:12:0', f: 'Veľká ručička ukazuje minúty. Keď je hore na 12, je celá hodina.' },
      { n: 'pol', p: 'clock:7:30', f: 'Veľká ručička dole na 6 – je pol. 7:30 je pol ôsmej.' },
      { n: 'štvrť', p: 'clock:7:15', f: 'Veľká ručička na 3 – je štvrť. 7:15 je štvrť na osem.' },
      { n: 'trištvrte', p: 'clock:7:45', f: 'Veľká ručička na 9 – sú trištvrte. 7:45 je trištvrte na osem.' },
      { n: 'hodina a minúty', p: '⏱️', f: 'Hodina má 60 minút. Deň má 24 hodín.' },
    ],
    quiz: [
      { q: 'Koľko minút má hodina?', a: '60', o: ['100', '12', '30'] },
      { q: 'Koľko hodín má deň?', a: '24', o: ['12', '10', '60'] },
      { q: 'Ktorá ručička ukazuje hodiny?', a: 'malá', o: ['veľká', 'obidve rovnako', 'žiadna'] },
      { q: 'Koľko je hodín, keď je 7:30?', a: 'pol ôsmej', o: ['pol siedmej', 'štvrť na osem', 'sedem hodín'] },
      { q: 'Koľko je hodín, keď je 9:15?', a: 'štvrť na desať', o: ['štvrť na deväť', 'pol desiatej', 'trištvrte na desať'] },
      { q: 'Kde je veľká ručička, keď je pol?', a: 'dole na 6', o: ['hore na 12', 'na 3', 'na 9'] },
    ],
    acts: [
      { type: 'learn' },
      { type: 'clock', level: 1, rounds: 6 },
      { type: 'clock', level: 2, rounds: 6 },
      { type: 'quiz', rounds: 5 },
      { type: 'clock', level: 3, rounds: 6 },
      { type: 'clock', mode: 'set', level: 2, rounds: 5 },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'm-shapes', title: 'Tvary', sub: 'kruh, štvorec, kocka, guľa', icon: '🔷',
    badge: { e: '🔺', name: 'Geometrička', desc: 'Poznáš tvary a telesá' },
    items: [
      { n: 'kruh', p: 'shape:kruh', f: 'Kruh je okrúhly a nemá žiadne rohy. Ako tanier alebo minca.' },
      { n: 'štvorec', p: 'shape:stvorec', f: 'Štvorec má 4 rovnako dlhé strany a 4 rohy.' },
      { n: 'obdĺžnik', p: 'shape:obdlznik', f: 'Obdĺžnik má 4 strany – dve dlhšie a dve kratšie. Ako dvere či zošit.' },
      { n: 'trojuholník', p: 'shape:trojuholnik', f: 'Trojuholník má 3 strany a 3 rohy.' },
      { n: 'kocka', p: 'shape:kocka', f: 'Kocka má 6 rovnakých štvorcových stien. Ako hracia kocka.' },
      { n: 'kváder', p: 'shape:kvader', f: 'Kváder je ako krabica od topánok – steny sú obdĺžniky.' },
      { n: 'guľa', p: 'shape:gula', f: 'Guľa je okrúhla zo všetkých strán – ako lopta.' },
      { n: 'valec', p: 'shape:valec', f: 'Valec má dve okrúhle podstavy – ako plechovka.' },
      { n: 'kužeľ', p: 'shape:kuzel', f: 'Kužeľ má okrúhlu podstavu a špičku – ako kornútok na zmrzlinu.' },
      { n: 'ihlan', p: 'shape:ihlan', f: 'Ihlan má špičku a steny sú trojuholníky – ako egyptská pyramída.' },
    ],
    sort: {
      title: 'Rovinný tvar alebo teleso?',
      bins: [
        { id: 'rov', n: 'rovinný tvar', p: 'shape:stvorec' },
        { id: 'tel', n: 'teleso', p: 'shape:kocka' },
      ],
      items: [
        { n: 'kruh', p: 'shape:kruh', b: 'rov' }, { n: 'štvorec', p: 'shape:stvorec', b: 'rov' }, { n: 'trojuholník', p: 'shape:trojuholnik', b: 'rov' }, { n: 'obdĺžnik', p: 'shape:obdlznik', b: 'rov' },
        { n: 'kocka', p: 'shape:kocka', b: 'tel' }, { n: 'guľa', p: 'shape:gula', b: 'tel' }, { n: 'valec', p: 'shape:valec', b: 'tel' }, { n: 'kužeľ', p: 'shape:kuzel', b: 'tel' },
        { n: 'kváder', p: 'shape:kvader', b: 'tel' }, { n: 'ihlan', p: 'shape:ihlan', b: 'tel' },
        { n: 'lopta', p: '⚽', b: 'tel' }, { n: 'hracia kocka', p: '🎲', b: 'tel' },
      ],
    },
    quiz: [
      { q: 'Koľko strán má trojuholník?', a: '3', o: ['4', '5', '0'] },
      { q: 'Koľko rohov má štvorec?', a: '4', o: ['3', '5', '6'] },
      { q: 'Koľko stien má kocka?', a: '6', o: ['4', '8', '3'] },
      { q: 'Aký tvar má lopta?', a: 'guľa', o: ['kocka', 'valec', 'ihlan'] },
      { q: 'Aký tvar má plechovka?', a: 'valec', o: ['guľa', 'kužeľ', 'kocka'] },
      { q: 'Ktorý tvar nemá žiadne rohy?', a: 'kruh', o: ['štvorec', 'trojuholník', 'obdĺžnik'] },
      { q: 'Na čo sa podobá kornútok na zmrzlinu?', a: 'na kužeľ', o: ['na kocku', 'na guľu', 'na kváder'] },
    ],
    acts: [
      { type: 'learn' },
      { type: 'find', rounds: 6, opts: 4 },
      { type: 'name', rounds: 6, opts: 4 },
      { type: 'sort', rounds: 10 },
      { type: 'quiz', rounds: 6 },
      { type: 'memory', pairs: 5 },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'm-mult', title: 'Násobilka', sub: 'krát 2, 5 a 10', icon: '✖️',
    badge: { e: '✖️', name: 'Násobilková kráľovná', desc: 'Vieš násobiť 2, 5 a 10' },
    qgen: { gen: ['mul2', 'mul5', 'mul10', 'groups'] },
    items: [
      { n: 'krát', p: 'txt:×', f: 'Násobenie je rýchle sčítanie rovnakých čísel. 3 × 2 = 2 + 2 + 2 = 6.' },
      { n: 'skupinky', p: 'groups:3:4', f: 'Tri skupinky po štyri jabĺčka: 3 × 4 = 12.' },
      { n: 'krát 2', p: 'txt:2,4,6,8', f: 'Počítaj po dvoch: 2, 4, 6, 8, 10, 12, 14, 16, 18, 20.' },
      { n: 'krát 5', p: 'txt:5,10,15', f: 'Po piatich: 5, 10, 15, 20, 25… Výsledok končí vždy na 5 alebo na 0.' },
      { n: 'krát 10', p: 'txt:10,20,30', f: 'Krát 10 je ľahké – stačí dopísať nulu: 4 × 10 = 40.' },
    ],
    acts: [
      { type: 'learn' },
      { type: 'math', gen: 'groups', rounds: 6 },
      { type: 'dots', rounds: 1, pick: 'heart2' },
      { type: 'math', gen: 'mul2', rounds: 8 },
      { type: 'math', gen: 'mul10', rounds: 6 },
      { type: 'math', gen: 'mul5', rounds: 8 },
      { type: 'dots', rounds: 1, pick: 'star5' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'm-review', review: true, title: 'Počtárska olympiáda', sub: 'opakovanie matematiky', icon: '🏆',
    badge: { e: '🧮', name: 'Kráľovná čísel', desc: 'Zvládla si celú Počtársku dielňu!' },
    acts: [
      { type: 'bigquiz', rounds: 10 },
      { type: 'math', gen: 'mix', rounds: 10 },
      { type: 'coins', max: 500, rounds: 4 },
      { type: 'clock', level: 3, rounds: 5 },
      { type: 'compare', max: 100, expr: true, rounds: 6 },
    ],
  },
]);
