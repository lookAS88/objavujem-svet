/* ==========================================================================
   Oblasť: KÚZELNÉ PÍSMENKÁ (slovenčina a rozprávky)
   ========================================================================== */
addLessons('sk', [
  /* ------------------------------------------------------------------ */
  {
    id: 's-abc', title: 'Abeceda', sub: 'písmenká po poriadku', icon: 'txt:ABC',
    badge: { e: '🔤', name: 'Abecedná princezná', desc: 'Poznáš abecedu' },
    qgen: { gen: ['abcmissing', 'abcnext'] },
    items: [
      { n: 'abeceda', p: 'txt:a b c', f: 'Abeceda sú všetky písmená po poriadku: a, á, ä, b, c, č, d, ď, dz, dž, e, é, f, g, h, ch, i, í, j, k, l, ĺ, ľ, m, n, ň, o, ó, ô, p, q, r, ŕ, s, š, t, ť, u, ú, v, w, x, y, ý, z, ž.' },
      { n: 'ch', p: 'txt:ch', f: 'Ch je jedno písmeno, hoci ho píšeme dvoma znakmi. V abecede je hneď za h.' },
      { n: 'mäkčeň', p: 'txt:č š ž', f: 'Háčik nad písmenom sa volá mäkčeň: č, š, ž, ť, ď, ň, ľ.' },
      { n: 'dĺžeň', p: 'txt:á é í', f: 'Čiarka nad písmenom je dĺžeň – písmeno čítame dlhšie: á, é, í, ó, ú, ý.' },
      { n: 'slová podľa abecedy', p: 'txt:auto, dom', f: 'Slová zoraďujeme podľa prvého písmena: auto, banán, citrón, dom…' },
    ],
    acts: [
      { type: 'learn' },
      { type: 'order', gen: 'abc', rounds: 4 },
      { type: 'mix', gen: 'abcmissing', rounds: 6, title: 'Ktoré písmenko chýba?' },
      { type: 'order', gen: 'abcwords', rounds: 4 },
      { type: 'mix', gen: 'abcnext', rounds: 6, title: 'Čo nasleduje?' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 's-vowels', title: 'Samohlásky', sub: 'samohlásky a spoluhlásky', icon: 'txt:a e i',
    badge: { e: '🅰️', name: 'Hláskovačka', desc: 'Rozoznáš samohlásky a spoluhlásky' },
    items: [
      { n: 'krátke samohlásky', p: 'txt:a ä e i o u y', f: 'Krátke samohlásky sú a, ä, e, i, o, u, y.' },
      { n: 'dlhé samohlásky', p: 'txt:á é í ó ú ý', f: 'Dlhé samohlásky majú dĺžeň: á, é, í, ó, ú, ý.' },
      { n: 'dvojhlásky', p: 'txt:ia ie iu ô', f: 'Dvojhlásky sú ia, ie, iu a ô – ako v slovách piatok, lienka, ďakujem… a kôň.' },
      { n: 'spoluhlásky', p: 'txt:b c d f', f: 'Ostatné písmená sú spoluhlásky: b, c, č, d, f, g, h, k, l, m, n, p, r, s, t, v, z…' },
      { n: 'slabika', p: 'txt:ma-ma', f: 'Každá slabika má samohlásku (alebo r či l, napríklad vlk, slnko).' },
    ],
    sort: {
      title: 'Samohláska alebo spoluhláska?',
      bins: [
        { id: 'sam', n: 'samohláska', p: 'txt:a' },
        { id: 'spol', n: 'spoluhláska', p: 'txt:b' },
      ],
      items: 'a á ä e é i í o ó u ú y ý'.split(' ').map(l => ({ n: l, p: 'txt:' + l, b: 'sam' }))
        .concat('b c č d f g h ch j k l m n p r s š t v z ž'.split(' ').map(l => ({ n: l, p: 'txt:' + l, b: 'spol' }))),
    },
    quiz: [
      { q: 'Koľko samohlások je v slove MAMA?', a: '2', o: ['1', '3', '4'] },
      { q: 'Koľko samohlások je v slove PES?', a: '1', o: ['2', '3', '0'] },
      { q: 'Koľko samohlások je v slove JAHODA?', a: '3', o: ['2', '4', '6'] },
      { q: 'Ktoré písmeno je samohláska?', pics: true, a: 'txt:o', o: ['txt:k', 'txt:m', 'txt:s'] },
      { q: 'Ktoré písmeno je spoluhláska?', pics: true, a: 'txt:t', o: ['txt:a', 'txt:u', 'txt:e'] },
      { q: 'Ktorá samohláska je dlhá?', pics: true, a: 'txt:á', o: ['txt:a', 'txt:e', 'txt:o'] },
      { q: 'Čo je „ô“?', a: 'dvojhláska', o: ['spoluhláska', 'číslo', 'znamienko'] },
    ],
    tf: [
      { s: 'Písmeno A je samohláska.', ok: true },
      { s: 'Písmeno K je samohláska.', ok: false, f: 'K je spoluhláska.' },
      { s: 'Á je dlhá samohláska.', ok: true },
      { s: 'Ô je dvojhláska.', ok: true },
      { s: 'Slovo KOT má dve samohlásky.', ok: false, f: 'V slove KOT je len jedna samohláska – O.' },
    ],
    acts: [
      { type: 'learn' },
      { type: 'sort', rounds: 12 },
      { type: 'balloons', rounds: 6 },
      { type: 'quiz', rounds: 6 },
      { type: 'tf', rounds: 5 },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 's-syll', title: 'Slabiky', sub: 'tlieskaj a počítaj', icon: '👏',
    badge: { e: '👏', name: 'Slabikovačka', desc: 'Vieš rozdeliť slová na slabiky' },
    qgen: { gen: ['syll'] },
    items: [
      { n: 'pes', sy: 'pes', p: 'foto:pes' }, { n: 'dom', sy: 'dom', p: '🏠' }, { n: 'slon', sy: 'slon', p: 'foto:slon' },
      { n: 'strom', sy: 'strom', p: '🌳' }, { n: 'vlak', sy: 'vlak', p: '🚂' },
      { n: 'mačka', sy: 'mač-ka', p: 'foto:macka' }, { n: 'sova', sy: 'so-va', p: 'foto:sova' }, { n: 'ryba', sy: 'ry-ba', p: 'foto:ryba' },
      { n: 'auto', sy: 'au-to', p: '🚗' }, { n: 'lopta', sy: 'lop-ta', p: '⚽' }, { n: 'žaba', sy: 'ža-ba', p: 'foto:zaba' },
      { n: 'banán', sy: 'ba-nán', p: 'foto:banan' }, { n: 'motýľ', sy: 'mo-týľ', p: 'foto:motyl' }, { n: 'lienka', sy: 'lien-ka', p: 'foto:lienka' },
      { n: 'hruška', sy: 'hruš-ka', p: 'foto:hruska' },
      { n: 'jahoda', sy: 'ja-ho-da', p: 'foto:jahoda' }, { n: 'žirafa', sy: 'ži-ra-fa', p: 'foto:zirafa' }, { n: 'raketa', sy: 'ra-ke-ta', p: 'foto:raketa' },
      { n: 'topánka', sy: 'to-pán-ka', p: '👟' }, { n: 'papagáj', sy: 'pa-pa-gáj', p: 'foto:papagaj' }, { n: 'čerešne', sy: 'če-reš-ne', p: 'foto:ceresne' },
      { n: 'balónik', sy: 'ba-ló-nik', p: '🎈' }, { n: 'zmrzlina', sy: 'zmrz-li-na', p: '🍦' }, { n: 'krokodíl', sy: 'kro-ko-díl', p: 'foto:krokodil' },
      { n: 'bicykel', sy: 'bi-cy-kel', p: '🚲' },
      { n: 'korytnačka', sy: 'ko-ryt-nač-ka', p: 'foto:korytnacka' }, { n: 'paradajka', sy: 'pa-ra-daj-ka', p: 'foto:paradajka' },
    ],
    acts: [
      { type: 'syll', mode: 'count', rounds: 8 },
      { type: 'syll', mode: 'build', rounds: 6 },
      { type: 'syll', mode: 'count', rounds: 8, min: 2 },
      { type: 'syll', mode: 'build', rounds: 6, min: 3 },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 's-yi', title: 'Tvrdé a mäkké', sub: 'kedy y a kedy i', icon: 'txt:y/i',
    badge: { e: '✍️', name: 'Pravopisná víla', desc: 'Vieš, kedy písať y a kedy i' },
    items: [
      { n: 'tvrdé spoluhlásky', p: 'txt:h ch k g d t n l', f: 'Po tvrdých spoluhláskach píšeme tvrdé y, ý: ruky, chyba, lyže.' },
      { n: 'mäkké spoluhlásky', p: 'txt:c dz j ž š č ť ď ň ľ', f: 'Po mäkkých spoluhláskach píšeme mäkké i, í: cibuľa, žirafa, čiapka.' },
      { n: 'obojaké spoluhlásky', p: 'txt:b m p r s v z f', f: 'Po obojakých môže byť y aj i. To sa naučíš s vybranými slovami v 3. ročníku.' },
      { n: 'básnička', p: '📜', f: 'Tvrdé spoluhlásky: h, ch, k, g, d, t, n, l. Mäkké: c, dz, j, ž, š, č, ť, ď, ň, ľ.' },
    ],
    sort: {
      title: 'Tvrdá alebo mäkká spoluhláska?',
      bins: [
        { id: 'tvrde', n: 'tvrdá → y', p: 'txt:y' },
        { id: 'makke', n: 'mäkká → i', p: 'txt:i' },
      ],
      items: 'h ch k g d t n l'.split(' ').map(l => ({ n: l, p: 'txt:' + l, b: 'tvrde' }))
        .concat('c dz j ž š č ť ď ň ľ'.split(' ').map(l => ({ n: l, p: 'txt:' + l, b: 'makke' }))),
    },
    gaps: [
      { w: 'ru_y', a: 'y', o: ['i'], p: '🙌' }, { w: 'no_y', a: 'y', o: ['i'], p: '🦵' }, { w: 'kni_y', a: 'y', o: ['i'], p: '📚' },
      { w: 'vla_y', a: 'y', o: ['i'], p: '🚂' }, { w: 'l_že', a: 'y', o: ['i'], p: '🎿' }, { w: 'd_ňa', a: 'y', o: ['i'], p: '🍉' },
      { w: 'k_tica', a: 'y', o: ['i'], p: '💐' }, { w: 'ch_ba', a: 'y', o: ['i'], p: '❌' }, { w: 'rožk_', a: 'y', o: ['i'], p: '🥐' },
      { w: 'much_', a: 'y', o: ['i'], p: '🪰' }, { w: 'g_mnastika', a: 'y', o: ['i'], p: '🤸‍♀️' },
      { w: 'č_apka', a: 'i', o: ['y'], p: '🧢' }, { w: 'ž_rafa', a: 'i', o: ['y'], p: '🦒' }, { w: 'c_buľa', a: 'i', o: ['y'], p: '🧅' },
      { w: 'c_rkus', a: 'i', o: ['y'], p: '🎪' }, { w: 'dž_nsy', a: 'í', o: ['ý'], p: '👖' }, { w: 'š_p', a: 'í', o: ['ý'], p: '🏹' },
      { w: 'ž_ak', a: 'i', o: ['y'], p: '🧒' }, { w: 'č_žmy', a: 'i', o: ['y'], p: '👢' },
    ],
    quiz: [
      { q: 'Aké y píšeme po tvrdej spoluhláske?', a: 'tvrdé y', o: ['mäkké i', 'žiadne'] },
      { q: 'Aké i píšeme po mäkkej spoluhláske?', a: 'mäkké i', o: ['tvrdé y', 'žiadne'] },
      { q: 'Ktorá spoluhláska je tvrdá?', pics: true, a: 'txt:k', o: ['txt:č', 'txt:ž', 'txt:j'] },
      { q: 'Ktorá spoluhláska je mäkká?', pics: true, a: 'txt:š', o: ['txt:h', 'txt:d', 'txt:k'] },
      { q: 'Ktoré slovo je napísané správne?', a: 'ruky', o: ['ruki'] },
      { q: 'Ktoré slovo je napísané správne?', a: 'žirafa', o: ['žyrafa'] },
      { q: 'Ktoré slovo je napísané správne?', a: 'chyba', o: ['chiba'] },
      { q: 'Ktoré slovo je napísané správne?', a: 'cibuľa', o: ['cybuľa'] },
    ],
    acts: [
      { type: 'learn' },
      { type: 'sort', rounds: 12 },
      { type: 'gap', rounds: 8 },
      { type: 'quiz', rounds: 6 },
      { type: 'gap', rounds: 10 },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 's-sentence', title: 'Vety', sub: 'bodka, otáznik, výkričník', icon: 'txt:.?!',
    badge: { e: '❓', name: 'Majsterka viet', desc: 'Poznáš druhy viet a veľké písmená' },
    items: [
      { n: 'oznamovacia veta', p: 'txt:.', f: 'Niečo oznamuje a končí bodkou. Dnes svieti slnko.' },
      { n: 'opytovacia veta', p: 'txt:?', f: 'Pýta sa a končí otáznikom. Kde je môj psík?' },
      { n: 'rozkazovacia veta', p: 'txt:!', f: 'Prikazuje alebo prosí a končí výkričníkom. Poď sem!' },
      { n: 'želacia veta', p: '🌠', f: 'Vyjadruje želanie a končí výkričníkom. Kiež by už boli Vianoce!' },
      { n: 'veľké písmeno', p: 'txt:N', f: 'Veľkým písmenom začína každá veta aj mená ľudí, zvierat, miest, riek a hôr: Zuzka, Bratislava, Dunaj.' },
      { n: 'dni a mesiace', p: '📅', f: 'Dni a mesiace píšeme s malým písmenom: pondelok, január.' },
    ],
    gaps: [
      { w: 'Koľko je hodín_', a: '?', o: ['.', '!'] }, { w: 'Dnes svieti slnko_', a: '.', o: ['?', '!'] },
      { w: 'Pozor, auto_', a: '!', o: ['?', '.'] }, { w: 'Kde je moja bábika_', a: '?', o: ['.', '!'] },
      { w: 'Mám rada zmrzlinu_', a: '.', o: ['?', '!'] }, { w: 'Kiež by už boli Vianoce_', a: '!', o: ['?', '.'] },
      { w: 'Poď sa hrať_', a: '!', o: ['?', '.'] }, { w: 'Máš doma psíka_', a: '?', o: ['.', '!'] },
      { w: 'Mačka spí na gauči_', a: '.', o: ['?', '!'] }, { w: 'Prečo je tráva zelená_', a: '?', o: ['.', '!'] },
      { w: '_atálka ide do školy.', a: 'N', o: ['n'] }, { w: 'Bývame v meste _ratislava.', a: 'B', o: ['b'] },
      { w: 'Dnes je _ondelok.', a: 'p', o: ['P'] }, { w: 'Cez mesto tečie rieka _unaj.', a: 'D', o: ['d'] },
      { w: 'Môj pes sa volá _ex.', a: 'R', o: ['r'] }, { w: 'Narodila som sa v _úli.', a: 'j', o: ['J'] },
    ],
    sort: {
      title: 'Píšeme s veľkým alebo malým písmenom?',
      bins: [
        { id: 'velke', n: 'veľké písmeno', p: 'txt:A' },
        { id: 'male', n: 'malé písmeno', p: 'txt:a' },
      ],
      items: [
        { n: 'zuzka', p: '👧', b: 'velke', f: 'Meno človeka: Zuzka.' }, { n: 'bratislava', p: 'foto:bratislava', b: 'velke', f: 'Mesto: Bratislava.' },
        { n: 'dunaj', p: 'foto:dunaj', b: 'velke', f: 'Rieka: Dunaj.' }, { n: 'tatry', p: 'foto:vysoke-tatry', b: 'velke', f: 'Hory: Tatry.' },
        { n: 'slovensko', p: 'flag:sk', b: 'velke', f: 'Krajina: Slovensko.' }, { n: 'micka', p: '🐈', b: 'velke', f: 'Meno mačky: Micka.' },
        { n: 'mesto', p: '🏙️', b: 'male' }, { n: 'rieka', p: '🏞️', b: 'male' }, { n: 'stôl', p: '🪑', b: 'male' },
        { n: 'pes', p: '🐕', b: 'male' }, { n: 'pondelok', p: '📅', b: 'male', f: 'Dni v týždni píšeme s malým písmenom.' },
        { n: 'január', p: '❄️', b: 'male', f: 'Mesiace píšeme s malým písmenom.' },
      ],
    },
    quiz: [
      { q: 'Čím končí opytovacia veta?', a: 'otáznikom ?', o: ['bodkou .', 'čiarkou ,'] },
      { q: 'Čím končí oznamovacia veta?', a: 'bodkou .', o: ['otáznikom ?', 'výkričníkom !'] },
      { q: 'Akým písmenom začína veta?', a: 'veľkým', o: ['malým', 'hocijakým'] },
      { q: 'Ktoré slovo píšeme s veľkým písmenom?', a: 'Košice', o: ['stolička', 'jablko', 'utorok'] },
      { q: 'Aká je veta „Poď sem!“?', a: 'rozkazovacia', o: ['opytovacia', 'oznamovacia'] },
      { q: 'Aká je veta „Kde bývaš?“', a: 'opytovacia', o: ['rozkazovacia', 'oznamovacia'] },
    ],
    acts: [
      { type: 'learn' },
      { type: 'gap', rounds: 8, only: 'punct' },
      { type: 'sort', rounds: 10 },
      { type: 'quiz', rounds: 6 },
      { type: 'gap', rounds: 6, only: 'caps' },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 's-tales', title: 'Rozprávky', sub: 'poznáš ich všetky?', icon: '🏰',
    badge: { e: '👸', name: 'Rozprávková princezná', desc: 'Poznáš veľa rozprávok' },
    items: [
      { n: 'Červená čiapočka', p: '🐺', f: 'Dievčatko nesie babičke košík. Vlk sa prezlečie za babičku, no poľovník ich zachráni.' },
      { n: 'Popoluška', p: '👠', f: 'Na plese stratila črievičku a princ ju podľa nej hľadal po celom kráľovstve.' },
      { n: 'Snehulienka', p: '🍎', f: 'Bývala u siedmich trpaslíkov. Zlá kráľovná jej dala otrávené jablko.' },
      { n: 'Šípková Ruženka', p: '🌹', f: 'Pichla sa o vreteno a zaspala na sto rokov. Zobudil ju princ.' },
      { n: 'Janko Hraško', p: '🌱', f: 'Bol malý ako hrášok, ale silný a veľmi šikovný.' },
      { n: 'Soľ nad zlato', p: '🧂', f: 'Princezná mala otca rada ako soľ. Kráľ sa nahneval – kým nezistil, aké je jedlo bez soli.' },
      { n: 'Janko a Marienka', p: '🍪', f: 'Zablúdili v lese a našli perníkovú chalúpku. Bývala v nej ježibaba.' },
      { n: 'Tri prasiatka', p: '🐷', f: 'Postavili si domčeky zo slamy, z dreva a z tehál. Vlk nezrúcal iba ten z tehál.' },
      { n: 'Pinocchio', p: '🤥', f: 'Drevený chlapček, ktorému rastie nos, keď klame.' },
      { n: 'Kocúr v čižmách', p: '👢', f: 'Múdry kocúr, ktorý pomohol svojmu chudobnému pánovi stať sa kráľom.' },
      { n: 'Pipi Dlhá Pančucha', p: '👧', f: 'Najsilnejšie dievča na svete. Vo svojej vile má koňa aj opičku.' },
      { n: 'Malá morská víla', p: '🧜‍♀️', f: 'Morská víla, ktorá túžila žiť na súši. Napísal ju Hans Christian Andersen.' },
    ],
    sort: {
      title: 'Dobrá alebo zlá postava?',
      bins: [
        { id: 'dobra', n: 'dobrá postava', p: '😇' },
        { id: 'zla', n: 'zlá postava', p: '😈' },
      ],
      items: [
        { n: 'dobrá víla', p: '🧚‍♀️', b: 'dobra' }, { n: 'princezná', p: '👸', b: 'dobra' }, { n: 'princ', p: '🤴', b: 'dobra' },
        { n: 'Popoluška', p: '👠', b: 'dobra' }, { n: 'Červená čiapočka', p: '👧', b: 'dobra' }, { n: 'poľovník', p: '🏹', b: 'dobra' },
        { n: 'ježibaba', p: '🧙‍♀️', b: 'zla' }, { n: 'čert', p: '😈', b: 'zla' }, { n: 'drak', p: '🐉', b: 'zla' },
        { n: 'zlý vlk', p: '🐺', b: 'zla' }, { n: 'duch', p: '👻', b: 'zla' },
      ],
    },
    quiz: [
      { q: 'V ktorej rozprávke je vlk a babička?', a: 'Červená čiapočka', o: ['Popoluška', 'Pinocchio', 'Snehulienka'] },
      { q: 'Kto stratil na plese črievičku?', a: 'Popoluška', o: ['Snehulienka', 'Šípková Ruženka', 'Pipi'] },
      { q: 'Kto spal sto rokov?', a: 'Šípková Ruženka', o: ['Popoluška', 'Janko Hraško', 'Kocúr v čižmách'] },
      { q: 'Komu rastie nos, keď klame?', a: 'Pinocchiovi', o: ['Jankovi Hraškovi', 'vlkovi', 'princovi'] },
      { q: 'Koľko trpaslíkov mala Snehulienka?', a: '7', o: ['3', '5', '12'] },
      { q: 'Z čoho bol domček tretieho prasiatka?', a: 'z tehál', o: ['zo slamy', 'z dreva', 'z papiera'] },
      { q: 'Ako mala princezná rada otca v rozprávke Soľ nad zlato?', a: 'ako soľ', o: ['ako zlato', 'ako cukor', 'ako med'] },
      { q: 'Kto býval v perníkovej chalúpke?', a: 'ježibaba', o: ['Popoluška', 'trpaslíci', 'kráľ'] },
      { q: 'Aký veľký bol Janko Hraško?', a: 'ako hrášok', o: ['ako strom', 'ako dom', 'ako slon'] },
      { q: 'Čo nosil kocúr z rozprávky?', a: 'čižmy', o: ['korunu', 'okuliare', 'dáždnik'] },
    ],
    tf: [
      { s: 'Popoluška stratila na plese črievičku.', ok: true },
      { s: 'Snehulienka bývala u troch medveďov.', ok: false, f: 'Snehulienka bývala u siedmich trpaslíkov.' },
      { s: 'Pinocchiovi rastie nos, keď klame.', ok: true },
      { s: 'Tretie prasiatko si postavilo domček z tehál.', ok: true },
      { s: 'Červenú čiapočku zachránil poľovník.', ok: true },
      { s: 'Janko Hraško bol obor.', ok: false, f: 'Janko Hraško bol malý ako hrášok.' },
    ],
    acts: [
      { type: 'learn' },
      { type: 'name', rounds: 6, opts: 3, title: 'Z ktorej rozprávky?' },
      { type: 'quiz', rounds: 6 },
      { type: 'sort', rounds: 8 },
      { type: 'memory', pairs: 5 },
      { type: 'tf', rounds: 5 },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 's-review', review: true, title: 'Kúzelná kniha', sub: 'opakovanie slovenčiny', icon: '🏆',
    badge: { e: '📚', name: 'Kráľovná písmenok', desc: 'Zvládla si celé Kúzelné písmenká!' },
    acts: [
      { type: 'bigquiz', rounds: 10 },
      { type: 'gap', rounds: 8, src: 'area' },
      { type: 'syll', mode: 'build', rounds: 5, src: 'area' },
      { type: 'sort', rounds: 10, src: 'area' },
      { type: 'mix', rounds: 8, src: 'area' },
    ],
  },
]);
