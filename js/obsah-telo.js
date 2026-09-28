/* ==========================================================================
   Oblasť: TELO A ZDRAVIE
   ========================================================================== */
addLessons('body', [
  /* ------------------------------------------------------------------ */
  {
    id: 'b-body', title: 'Moje telo', sub: 'časti tela', icon: '🧍‍♀️', board: 'body',
    badge: { e: '🧍‍♀️', name: 'Poznám svoje telo', desc: 'Vieš pomenovať časti tela' },
    items: [
      { n: 'hlava', p: 'board:body:hlava', id: 'hlava', f: 'V hlave je mozog, ktorým myslíme. Na hlave rastú vlasy.' },
      { n: 'krk', p: 'board:body:krk', id: 'krk', f: 'Krk spája hlavu s telom. Vďaka nemu otočíme hlavu doľava aj doprava.' },
      { n: 'rameno', p: 'board:body:rameno', id: 'rameno', f: 'Ramená sú hore po bokoch tela. Keď nevieš, pokrčíš nimi.' },
      { n: 'hrudník', p: 'board:body:hrudnik', id: 'hrudnik', f: 'V hrudníku bije srdce a sú v ňom pľúca. Chránia ich rebrá.' },
      { n: 'brucho', p: 'board:body:brucho', id: 'brucho', f: 'V bruchu je žalúdok a črevá – tam sa trávi jedlo.' },
      { n: 'lakeť', p: 'board:body:laket', id: 'laket', f: 'Lakeť je v strede ruky. Vďaka nemu ruku ohneme.' },
      { n: 'dlaň', p: 'board:body:dlan', id: 'dlan', f: 'Na ruke máme dlaň a päť prstov. Najhrubší prst je palec.' },
      { n: 'koleno', p: 'board:body:koleno', id: 'koleno', f: 'Koleno je v strede nohy. Pri páde ho chránia chrániče.' },
      { n: 'chodidlo', p: 'board:body:chodidlo', id: 'chodidlo', f: 'Na chodidlách stojíme a chodíme. Na každom je päť prstov.' },
    ],
    quiz: [
      { q: 'Koľko prstov máme na jednej ruke?', a: '5', o: ['4', '6', '10'] },
      { q: 'Koľko prstov máme na rukách aj nohách spolu?', a: '20', o: ['10', '5', '15'] },
      { q: 'Ako sa volá najhrubší prst na ruke?', a: 'palec', o: ['malíček', 'prostredník', 'ukazovák'] },
      { q: 'Čím ohneme ruku?', a: 'v lakti', o: ['v kolene', 'v krku', 'v chodidle'] },
      { q: 'Čo máme v hlave?', a: 'mozog', o: ['žalúdok', 'pľúca', 'koleno'] },
      { q: 'Koľko mliečnych zubov majú deti?', a: '20', o: ['5', '32', '100'], f: 'Deti majú 20 mliečnych zubov. Dospelí majú až 32 zubov.' },
      { q: 'Ktorým prstom ukazujeme?', a: 'ukazovákom', o: ['palcom', 'malíčkom', 'prstenníkom'] },
    ],
    tf: [
      { s: 'Na jednej ruke máme päť prstov.', ok: true },
      { s: 'Koleno je na ruke.', ok: false, f: 'Koleno je na nohe. Na ruke je lakeť.' },
      { s: 'Mliečne zuby nám vypadnú a narastú nové.', ok: true },
      { s: 'Chodidlo je na konci nohy.', ok: true },
      { s: 'Srdce máme v kolene.', ok: false, f: 'Srdce je v hrudníku.' },
    ],
    acts: [
      { type: 'learn' },
      { type: 'map', rounds: 7, ask: 'Ukáž na tele: {n}' },
      { type: 'quiz', rounds: 5 },
      { type: 'map', rounds: 9, ask: 'Kde je {n}?' },
      { type: 'tf', rounds: 5 },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'b-inside', title: 'Vnútri tela', sub: 'srdce, pľúca, mozog', icon: '🧠', board: 'organs',
    badge: { e: '🧠', name: 'Malá doktorka', desc: 'Vieš, čo je vnútri tela' },
    items: [
      { n: 'mozog', p: 'board:organs:mozog', id: 'mozog', f: 'Mozog riadi celé telo. Myslíme ním, učíme sa a pamätáme si.' },
      { n: 'srdce', p: 'board:organs:srdce', id: 'srdce', f: 'Srdce pumpuje krv do celého tela. Je veľké asi ako tvoja päsť.' },
      { n: 'pľúca', p: 'board:organs:pluca', id: 'pluca', f: 'Pľúcami dýchame – berú zo vzduchu kyslík.' },
      { n: 'žalúdok', p: 'board:organs:zaludok', id: 'zaludok', f: 'V žalúdku sa trávi jedlo, ktoré zjeme.' },
      { n: 'črevá', p: 'board:organs:creva', id: 'creva', f: 'Dlhé črevá sú v bruchu. Berú z jedla všetko dobré pre telo.' },
      { n: 'kostra', p: 'foto:kostra', f: 'Kostra drží telo pokope. Dospelý človek má 206 kostí.' },
      { n: 'svaly', p: 'foto:svaly', f: 'Svalmi hýbeme telom. Keď cvičíme, sú silnejšie.' },
      { n: 'krv', p: '🩸', f: 'Krv roznáša po tele kyslík a živiny. Tečie v žilách.' },
      { n: 'koža', p: '✋', f: 'Koža je najväčší orgán. Chráni nás a cítime ňou teplo, chlad aj dotyk.' },
    ],
    quiz: [
      { q: 'Čím dýchame?', a: 'pľúcami', o: ['žalúdkom', 'srdcom', 'kolenom'] },
      { q: 'Čo pumpuje krv?', a: 'srdce', o: ['pľúca', 'mozog', 'žalúdok'] },
      { q: 'Koľko kostí má dospelý človek?', a: '206', o: ['10', '50', '1000'] },
      { q: 'Kde sa trávi jedlo?', a: 'v žalúdku', o: ['v mozgu', 'v pľúcach', 'v srdci'] },
      { q: 'Ktorý orgán je najväčší?', a: 'koža', o: ['srdce', 'mozog', 'žalúdok'] },
      { q: 'Čím myslíme?', a: 'mozgom', o: ['žalúdkom', 'lakťom', 'pľúcami'] },
      { q: 'Ako veľké je srdce?', a: 'ako naša päsť', o: ['ako lopta', 'ako hrach', 'ako auto'] },
      { q: 'Čo chráni mozog?', a: 'lebka', o: ['koleno', 'rebrá', 'nechty'] },
    ],
    tf: [
      { s: 'Srdce bije aj v noci, keď spíme.', ok: true },
      { s: 'Pľúcami trávime jedlo.', ok: false, f: 'Pľúcami dýchame. Jedlo sa trávi v žalúdku a črevách.' },
      { s: 'Dospelý má 206 kostí.', ok: true },
      { s: 'Keď behám, srdce bije rýchlejšie.', ok: true },
      { s: 'Mozog je v nohe.', ok: false, f: 'Mozog je v hlave a chráni ho lebka.' },
    ],
    acts: [
      { type: 'learn' },
      { type: 'map', rounds: 5, ask: 'Nájdi v tele: {n}' },
      { type: 'quiz', rounds: 6 },
      { type: 'memory', pairs: 5 },
      { type: 'tf', rounds: 5 },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'b-senses', title: 'Päť zmyslov', sub: 'zrak, sluch, čuch, chuť, hmat', icon: '👀',
    badge: { e: '👀', name: 'Bystré očko', desc: 'Poznáš päť zmyslov' },
    items: [
      { n: 'zrak', p: '👀', org: 'oči', f: 'Očami vidíme farby, tvary a svetlo.' },
      { n: 'sluch', p: '👂', org: 'uši', f: 'Ušami počujeme hudbu, hlasy aj spev vtákov.' },
      { n: 'čuch', p: '👃', org: 'nos', f: 'Nosom cítime vône – kvety, voňavý koláč aj dym.' },
      { n: 'chuť', p: '👅', org: 'jazyk', f: 'Jazykom cítime, či je jedlo sladké, slané, kyslé alebo horké.' },
      { n: 'hmat', p: '✋', org: 'koža a prsty', f: 'Kožou a prstami cítime, či je niečo mäkké, tvrdé, teplé alebo studené.' },
    ],
    sort: {
      title: 'Ktorým zmyslom to spoznáš?',
      bins: [
        { id: 'zrak', n: 'zrak', p: '👀' },
        { id: 'sluch', n: 'sluch', p: '👂' },
        { id: 'cuch', n: 'čuch', p: '👃' },
        { id: 'chut', n: 'chuť', p: '👅' },
        { id: 'hmat', n: 'hmat', p: '✋' },
      ],
      items: [
        { n: 'dúha', p: '🌈', b: 'zrak' }, { n: 'hviezdy na oblohe', p: '🌟', b: 'zrak' }, { n: 'farebný obrázok', p: '🖼️', b: 'zrak' },
        { n: 'hudba', p: '🎵', b: 'sluch' }, { n: 'zvonček', p: '🔔', b: 'sluch' }, { n: 'bubon', p: '🥁', b: 'sluch' },
        { n: 'vôňa ruže', p: '🌹', b: 'cuch' }, { n: 'voňavý parfum', p: '🧴', b: 'cuch' }, { n: 'kytica kvetov', p: '💐', b: 'cuch' },
        { n: 'kyslý citrón', p: '🍋', b: 'chut' }, { n: 'sladký cukrík', p: '🍬', b: 'chut' }, { n: 'pálivá paprička', p: '🌶️', b: 'chut' },
        { n: 'studená kocka ľadu', p: '🧊', b: 'hmat' }, { n: 'pichľavý ježko', p: '🦔', b: 'hmat' }, { n: 'mäkký macko', p: '🧸', b: 'hmat' },
      ],
    },
    quiz: [
      { q: 'Koľko zmyslov má človek?', a: '5', o: ['2', '3', '10'] },
      { q: 'Čím počujeme?', a: 'ušami', o: ['očami', 'nosom', 'jazykom'] },
      { q: 'Čím cítime vôňu?', a: 'nosom', o: ['ušami', 'lakťom', 'vlasmi'] },
      { q: 'Čím spoznáme, že je citrón kyslý?', a: 'jazykom', o: ['ušami', 'lakťom', 'kolenom'] },
      { q: 'Čo pomáha ľuďom, ktorí zle vidia?', a: 'okuliare', o: ['čiapka', 'rukavice', 'šál'] },
      { q: 'Ako čítajú nevidiaci ľudia?', a: 'prstami – písmom z bodiek', o: ['nosom', 'nečítajú', 'ušami'], f: 'Braillovo písmo má vypuklé bodky, ktoré sa dajú nahmatať prstami.' },
    ],
    tf: [
      { s: 'Očami vidíme.', ok: true },
      { s: 'Nosom počujeme.', ok: false, f: 'Nosom cítime vône. Počujeme ušami.' },
      { s: 'Jazykom cítime, či je jedlo sladké.', ok: true },
      { s: 'Hmat nám povie, či je čaj horúci.', ok: true, f: 'Ale pozor – horúci čaj radšej nechytaj, mohla by si sa popáliť!' },
      { s: 'Človek má 7 zmyslov.', ok: false, f: 'Máme 5 zmyslov: zrak, sluch, čuch, chuť a hmat.' },
    ],
    acts: [
      { type: 'learn' },
      { type: 'match', pairs: 5, a: 'n', b: 'org', title: 'Čím to cítime?' },
      { type: 'sort', rounds: 10 },
      { type: 'quiz', rounds: 5 },
      { type: 'odd', rounds: 4 },
      { type: 'tf', rounds: 5 },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'b-health', title: 'Zdravie', sub: 'zdravé jedlo a hygiena', icon: '🥦',
    badge: { e: '🍏', name: 'Zdravá hlavička', desc: 'Vieš, čo je zdravé' },
    items: [
      { n: 'ovocie a zelenina', p: '🥦', f: 'Jedz ich každý deň – majú veľa vitamínov.' },
      { n: 'voda', p: '💧', f: 'Najlepší nápoj je voda. Telo potrebuje veľa vody každý deň.' },
      { n: 'umývanie rúk', p: '🧼', f: 'Ruky si umývame mydlom pred jedlom a po záchode – tak odplavíme baktérie.' },
      { n: 'čistenie zubov', p: '🪥', f: 'Zuby si čistíme ráno a večer aspoň dve minúty.' },
      { n: 'spánok', p: '😴', f: 'Deti potrebujú spať asi 10 hodín. V spánku telo rastie a oddychuje.' },
      { n: 'pohyb', p: '🚴‍♀️', f: 'Behaj, skáč, bicykluj sa! Pohyb robí telo silné a zdravé.' },
      { n: 'sladkosti', p: '🍭', f: 'Sladkosti sú len niekedy – veľa cukru kazí zuby.' },
    ],
    sort: {
      title: 'Každý deň, alebo len niekedy?',
      bins: [
        { id: 'zdrave', n: 'zdravé – každý deň', p: '🥦' },
        { id: 'niekedy', n: 'len niekedy', p: '🍭' },
      ],
      items: [
        { n: 'jablko', p: '🍎', b: 'zdrave' }, { n: 'mrkva', p: '🥕', b: 'zdrave' }, { n: 'mlieko', p: '🥛', b: 'zdrave' }, { n: 'ryba', p: '🐟', b: 'zdrave' },
        { n: 'vajíčko', p: '🥚', b: 'zdrave' }, { n: 'chlieb', p: '🍞', b: 'zdrave' }, { n: 'šalát', p: '🥗', b: 'zdrave' }, { n: 'banán', p: '🍌', b: 'zdrave' }, { n: 'syr', p: '🧀', b: 'zdrave' },
        { n: 'lízanka', p: '🍭', b: 'niekedy' }, { n: 'cukríky', p: '🍬', b: 'niekedy' }, { n: 'šiška', p: '🍩', b: 'niekedy' }, { n: 'hranolky', p: '🍟', b: 'niekedy' },
        { n: 'hamburger', p: '🍔', b: 'niekedy' }, { n: 'čokoláda', p: '🍫', b: 'niekedy' }, { n: 'torta', p: '🍰', b: 'niekedy' }, { n: 'sladká limonáda', p: '🥤', b: 'niekedy' },
      ],
    },
    quiz: [
      { q: 'Kedy si umývame ruky?', a: 'pred jedlom a po záchode', o: ['len v nedeľu', 'nikdy', 'iba v lete'] },
      { q: 'Ako dlho si máme čistiť zuby?', a: 'aspoň 2 minúty', o: ['2 sekundy', 'celý deň', 'vôbec'] },
      { q: 'Aký nápoj je najzdravší?', a: 'voda', o: ['sladká limonáda', 'kola', 'sirup'] },
      { q: 'Koľko hodín majú spať deti?', a: 'asi 10 hodín', o: ['2 hodiny', '20 hodín', 'nemusia spať'] },
      { q: 'Čo kazí zuby?', a: 'veľa cukru', o: ['mrkva', 'voda', 'jablko'] },
      { q: 'Čo robíme, keď kýchame?', a: 'dáme si ruku alebo lakeť pred ústa', o: ['kýchneme na kamaráta', 'kýchneme do jedla'] },
      { q: 'Čo máme jesť každý deň?', a: 'ovocie a zeleninu', o: ['len cukríky', 'len hranolky', 'nič'] },
    ],
    tf: [
      { s: 'Zuby si čistíme ráno a večer.', ok: true },
      { s: 'Sladkosti môžeme jesť celý deň.', ok: false, f: 'Sladkosti sú len niekedy – cukor kazí zuby.' },
      { s: 'Pohyb je dobrý pre zdravie.', ok: true },
      { s: 'Ruky stačí umývať raz za týždeň.', ok: false, f: 'Ruky si umývame viackrát denne – vždy pred jedlom.' },
      { s: 'Voda je zdravý nápoj.', ok: true },
    ],
    acts: [
      { type: 'learn' },
      { type: 'sort', rounds: 10 },
      { type: 'quiz', rounds: 6 },
      { type: 'balloons', rounds: 6 },
      { type: 'tf', rounds: 5 },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'b-road', title: 'Na ceste', sub: 'semafor a dopravné značky', icon: '🚦',
    badge: { e: '🚦', name: 'Bezpečná chodkyňa', desc: 'Poznáš pravidlá na ceste' },
    items: [
      { n: 'červená', p: 'light:red', f: 'Na červenú stojíme! Cez cestu sa nechodí.' },
      { n: 'oranžová', p: 'light:orange', f: 'Oranžová znamená pozor – svetlo sa práve mení.' },
      { n: 'zelená', p: 'light:green', f: 'Na zelenú môžeme ísť – ale aj tak sa pozrieme, či nič nejde.' },
      { n: 'STOP', p: 'sign:stop', f: 'Vodič musí úplne zastaviť.' },
      { n: 'prechod pre chodcov', p: 'sign:prechod', f: 'Tu môžu chodci bezpečne prejsť cez cestu. Pruhom sa hovorí zebra.' },
      { n: 'pozor, deti', p: 'sign:deti', f: 'Vodiči musia dávať pozor – blízko je škola alebo ihrisko.' },
      { n: 'zákaz vjazdu', p: 'sign:zakaz', f: 'Sem nesmie žiadne auto vojsť.' },
      { n: 'cestička pre cyklistov', p: 'sign:cyklo', f: 'Tu jazdia bicykle. Na bicykli nosíme vždy prilbu!' },
      { n: 'daj prednosť v jazde', p: 'sign:prednost', f: 'Vodič musí pustiť autá na hlavnej ceste.' },
      { n: 'reflexné prvky', p: '🦺', f: 'Svietia, keď na ne zasvieti auto. Vodič ťa tak uvidí aj v tme.' },
    ],
    order: [
      { q: 'Ako prejdeš cez cestu? Zoraď kroky', seq: [{ n: 'zastav pri kraji', p: '✋' }, { n: 'pozri vľavo', p: '⬅️' }, { n: 'pozri vpravo', p: '➡️' }, { n: 'znova vľavo', p: '⬅️' }, { n: 'prejdi rovno', p: '🚶‍♀️' }] },
      { q: 'Zoraď svetlá semafora zhora', seq: [{ n: 'červená', p: 'light:red' }, { n: 'oranžová', p: 'light:orange' }, { n: 'zelená', p: 'light:green' }] },
    ],
    quiz: [
      { q: 'Na akú farbu môže chodec prejsť cez cestu?', a: 'na zelenú', o: ['na červenú', 'na oranžovú', 'hocikedy'] },
      { q: 'Kde prechádzame cez cestu?', a: 'na priechode pre chodcov', o: ['pomedzi autá', 'v zákrute', 'kde sa mi páči'] },
      { q: 'Kam sa pozrieme ako prvé, keď prechádzame cez cestu?', a: 'vľavo', o: ['hore na nebo', 'dozadu', 'na topánky'] },
      { q: 'Čo nosíme na hlave na bicykli?', a: 'prilbu', o: ['korunku', 'šiltovku', 'nič'] },
      { q: 'Kde sedia deti v aute?', a: 'v autosedačke a pripútané', o: ['vodičovi na kolenách', 'v kufri', 'stoja v strede'] },
      { q: 'Ako voláme pruhy na priechode pre chodcov?', a: 'zebra', o: ['tiger', 'žirafa', 'krokodíl'] },
      { q: 'Čo nám pomôže, aby nás vodič videl v tme?', a: 'reflexné prvky', o: ['čierne oblečenie', 'zatvorené oči', 'slnečné okuliare'] },
      { q: 'Ktorá značka je STOP?', pics: true, a: 'sign:stop', o: ['sign:zakaz', 'sign:prednost', 'sign:prechod'] },
    ],
    tf: [
      { s: 'Na červenú sa cez cestu nechodí.', ok: true },
      { s: 'Cez cestu môžeme vybehnúť za loptou.', ok: false, f: 'Nikdy! Najprv sa pozri vľavo, vpravo a znova vľavo.' },
      { s: 'Na bicykli nosíme prilbu.', ok: true },
      { s: 'V aute sa pripútame.', ok: true },
      { s: 'V tme sú najlepšie čierne šaty bez reflexných prvkov.', ok: false, f: 'V tme nás vodič uvidí len vďaka reflexným prvkom.' },
    ],
    acts: [
      { type: 'learn' },
      { type: 'name', rounds: 6, opts: 3, title: 'Čo znamená táto značka?' },
      { type: 'quiz', rounds: 6 },
      { type: 'order', rounds: 2 },
      { type: 'memory', pairs: 5 },
      { type: 'tf', rounds: 5 },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'b-help', title: 'Keď treba pomoc', sub: 'tiesňové čísla 112, 150, 155, 158', icon: '🚑',
    badge: { e: '🚒', name: 'Malá záchranárka', desc: 'Vieš, kam zavolať o pomoc' },
    items: [
      { n: 'tiesňová linka', p: 'txt:SOS', num: '112', f: 'Číslo 112 pomôže vždy – pošlú hasičov, záchranku aj políciu. Funguje v celej Európe.' },
      { n: 'hasiči', p: 'foto:hasici', num: '150', f: 'Hasiči hasia požiare a pomáhajú pri nehodách. Voláme im na číslo 150.' },
      { n: 'záchranka', p: 'foto:zachranka', num: '155', f: 'Záchranka príde, keď je niekto vážne chorý alebo zranený. Číslo je 155.' },
      { n: 'polícia', p: 'foto:policia', num: '158', f: 'Polícia chráni ľudí a stráži poriadok. Číslo je 158.' },
      { n: 'čo povedať', p: '📞', f: 'Povedz svoje meno, čo sa stalo a kde si. Nezavesíš, kým ti to nepovedia.' },
      { n: 'cudzí človek', p: '🙅‍♀️', f: 'S cudzím človekom nikam nechodíme a nič si od neho neberieme.' },
    ],
    dial: [
      { n: 'hasičov', num: '150', p: '🚒', q: 'Horí! Zavolaj hasičov.' },
      { n: 'záchranku', num: '155', p: '🚑', q: 'Dedko spadol a nevie vstať. Zavolaj záchranku.' },
      { n: 'políciu', num: '158', p: '🚓', q: 'Niekto sa vlámal do auta. Zavolaj políciu.' },
      { n: 'tiesňovú linku', num: '112', p: '🆘', q: 'Stala sa nehoda. Zavolaj tiesňovú linku.' },
    ],
    quiz: [
      { q: 'Horí dom. Koho zavoláš?', a: 'hasičov – 150', o: ['políciu – 158', 'kamarátku', 'nikoho'] },
      { q: 'Kamarát spadol a krváca mu hlava. Koho zavoláš?', a: 'záchranku – 155', o: ['hasičov – 150', 'pizzu', 'nikoho'] },
      { q: 'Ktoré číslo pomôže vždy?', a: '112', o: ['123', '999', '555'] },
      { q: 'Čo povieš, keď voláš na 112?', a: 'meno, čo sa stalo a kde si', o: ['len „ahoj“', 'vtip', 'nič, hneď zavesím'] },
      { q: 'Cudzí pán ti ponúka cukrík a chce, aby si išla s ním. Čo urobíš?', a: 'nejdem a poviem to rodičom', o: ['pôjdem s ním', 'zoberiem si cukrík'] },
      { q: 'Aké číslo má polícia?', a: '158', o: ['150', '155', '100'] },
    ],
    tf: [
      { s: 'Na 112 môžeme volať zo žartu.', ok: false, f: 'Nikdy! Tiesňová linka je len pre skutočnú pomoc.' },
      { s: 'Hasiči majú číslo 150.', ok: true },
      { s: 'Záchranka má číslo 155.', ok: true },
      { s: 'Na 112 sa dá zavolať aj bez kreditu v telefóne.', ok: true },
      { s: 'S cudzím človekom môžem ísť, keď je milý.', ok: false, f: 'S cudzím človekom nikdy nikam nechodíme.' },
    ],
    acts: [
      { type: 'learn' },
      { type: 'match', pairs: 4, a: 'p', b: 'num', title: 'Priraď číslo' },
      { type: 'dial', rounds: 4 },
      { type: 'quiz', rounds: 6 },
      { type: 'tf', rounds: 5 },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'b-review', review: true, title: 'Zdravá hlavička', sub: 'opakovanie tela a zdravia', icon: '🏆',
    badge: { e: '🩺', name: 'Pani doktorka', desc: 'Zvládla si celé telo a zdravie!' },
    acts: [
      { type: 'bigquiz', rounds: 10 },
      { type: 'map', rounds: 8, board: 'body', src: 'area' },
      { type: 'sort', rounds: 10, src: 'area' },
      { type: 'mix', rounds: 8, src: 'area' },
    ],
  },
]);
