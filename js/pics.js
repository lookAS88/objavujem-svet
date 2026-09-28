/* ==========================================================================
   Obrázky: vlajky, mapy, planéty, hodiny, mince, tvary, značky, kontajnery
   a vlastné kresby. pic('…') vráti HTML obrázka (veľkosť podľa font-size).
   Kresby sú <symbol> v jednom skrytom SVG (injectDefs), obrázok ich len použije.
   ========================================================================== */

const LAND = '#fff4dc', LAND_LINE = '#c9b99a', SEA = '#bfe3ff';
const CONT_COLORS = { eu: '#b9a4ff', as: '#ffc27a', af: '#ffe066', na: '#8fe3a8', sa: '#ff9ec7', oc: '#7fdcd2', an: '#eef3f7' };
const CONT_NAMES = { eu: 'Európa', as: 'Ázia', af: 'Afrika', na: 'Severná Amerika', sa: 'Južná Amerika', oc: 'Austrália a Oceánia', an: 'Antarktída' };
const OCEAN_NAMES = { pacific: 'Tichý oceán', atlantic: 'Atlantický oceán', indian: 'Indický oceán', arctic: 'Severný ľadový oceán', southern: 'Južný oceán' };
const OCEANS = Object.keys(OCEAN_NAMES);

/* ---------- projekcia bodu (mestá) – rovnaká ako pri výrobe máp ---------- */
function projectPt(board, lon, lat) {
  const B = MAP_DATA[board], P = B.proj, R = Math.PI / 180;
  let x, y;
  if (P.type === 'ne') {
    const l = lon * R, p = lat * R, p2 = p * p, p4 = p2 * p2;
    x = l * (0.8707 - 0.131979 * p2 + p4 * (-0.013791 + p4 * (0.003971 * p2 - 0.001529 * p4)));
    y = -p * (1.007226 + p2 * (0.015085 + p4 * (-0.044475 + 0.028874 * p2 - 0.005916 * p4)));
  } else {
    const l0 = P.lon0 * R, p0 = P.lat0 * R, l = lon * R - l0, p = lat * R;
    const k = Math.sqrt(2 / (1 + Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l)));
    x = k * Math.cos(p) * Math.sin(l);
    y = -k * (Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l));
  }
  return [(x - P.minX) * P.s, (y - P.minY) * P.s];
}

/* regióny (štáty) mapy s daným id / kontinentom */
function boardRegions(board, id) {
  const B = MAP_DATA[board];
  if (!B) return [];
  if (id && id[0] === '#') return B.regions.filter(r => r.cont === id.slice(1));
  return B.regions.filter(r => r.id === id);
}
function unionBox(regs) {
  const b = [Infinity, Infinity, -Infinity, -Infinity];
  regs.forEach(r => { b[0] = Math.min(b[0], r.box[0]); b[1] = Math.min(b[1], r.box[1]); b[2] = Math.max(b[2], r.box[2]); b[3] = Math.max(b[3], r.box[3]); });
  return b;
}

/* ---------- malá mapa (obrázok) ---------- */
function miniMap(board, o = {}) {
  const B = MAP_DATA[board];
  if (!B) return '';
  let hl = '', box = null, dot = '';
  if (o.hl) {
    if (OCEANS.includes(o.hl) && B.extra[o.hl]) { hl = `<path d="${B.extra[o.hl]}" fill="#3fa9f5" opacity=".75"/>`; }
    else {
      const regs = boardRegions(board, o.hl);
      hl = regs.map(r => `<path d="${r.d}" fill="#ff5fa2" stroke="#fff" stroke-width="${board === 'world' ? 0.8 : 1.2}"/>`).join('');
      if (regs.length && o.hl[0] !== '#' && board !== 'slovakia') box = unionBox(regs);
    }
  }
  if (o.line && B.extra[o.line]) hl = `<path d="${B.extra[o.line]}" fill="none" stroke="#1a6fd6" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`;
  if (o.pt) {
    const [x, y] = projectPt(board, o.pt[0], o.pt[1]);
    const r = B.w / 42;
    dot = `<circle cx="${x}" cy="${y}" r="${r * 1.9}" fill="#ff5fa2" opacity=".25"/><circle cx="${x}" cy="${y}" r="${r}" fill="#ff5fa2" stroke="#fff" stroke-width="${r / 3}"/>`;
  }
  let vb = `0 0 ${B.w} ${B.h}`;
  if (box) {
    // priblíž malý štát, ale ukáž aj okolie
    const minW = B.w * (board === 'world' ? 0.36 : 0.45), aspect = B.h / B.w;
    let w = Math.max((box[2] - box[0]) * 2.2, minW), h = w * aspect;
    if ((box[3] - box[1]) * 1.6 > h) { h = (box[3] - box[1]) * 1.6; w = h / aspect; }
    const cx = (box[0] + box[2]) / 2, cy = (box[1] + box[3]) / 2;
    const x0 = Math.max(0, Math.min(B.w - w, cx - w / 2)), y0 = Math.max(0, Math.min(B.h - h, cy - h / 2));
    vb = `${x0.toFixed(1)} ${y0.toFixed(1)} ${Math.min(w, B.w).toFixed(1)} ${Math.min(h, B.h).toFixed(1)}`;
  }
  return `<span class="mappic${board === 'world' && !box ? ' wide' : ''}"><svg viewBox="${vb}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <rect x="-50" y="-50" width="${B.w + 100}" height="${B.h + 100}" fill="${SEA}"/>
    <use href="#mb-${board}" width="${B.w}" height="${B.h}"/>${hl}${dot}</svg></span>`;
}

/* ---------- hodiny ---------- */
function clockPic(h, m = 0) {
  const pt = (deg, r) => [50 + r * Math.sin(deg * Math.PI / 180), 50 - r * Math.cos(deg * Math.PI / 180)].map(v => v.toFixed(1));
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const [x1, y1] = pt(i * 30, 38), [x2, y2] = pt(i * 30, 43);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
  }).join('');
  const nums = Array.from({ length: 12 }, (_, i) => { const n = i + 1, [x, y] = pt(n * 30, 31); return `<text x="${x}" y="${y}">${n}</text>`; }).join('');
  const [hx, hy] = pt(((h % 12) + m / 60) * 30, 19), [mx, my] = pt(m * 6, 30);
  return `<span class="clockpic"><svg viewBox="0 0 100 100" aria-hidden="true">
    <circle class="cp-face" cx="50" cy="50" r="46"/><g class="cp-ticks">${ticks}</g><g class="cp-num">${nums}</g>
    <line class="cp-min" x1="50" y1="50" x2="${mx}" y2="${my}"/><line class="cp-hour" x1="50" y1="50" x2="${hx}" y2="${hy}"/>
    <circle class="cp-dot" cx="50" cy="50" r="4.5"/></svg></span>`;
}

/* ---------- peniaze ---------- */
function noteHTML(eur) {
  const c = { 5: ['#b9bcc2', '#7d828a'], 10: ['#f28b82', '#c5453d'], 20: ['#8ab4f8', '#3c6fd0'], 50: ['#fbbc6a', '#d98320'] }[eur] || ['#ccc', '#888'];
  return `<span class="notepic" style="--n1:${c[0]};--n2:${c[1]}"><b>${eur}</b><i>€</i></span>`;
}
/* desiatky (paličky po 10) a jednotky */
function tensPic(t, u) {
  const bundle = '<span class="tp-ten"></span>';
  return `<span class="tenspic">${bundle.repeat(t)}${'<span class="tp-one"></span>'.repeat(u)}</span>`;
}
function groupsPic(g, n) {
  const fruit = ['🍎', '🍓', '🍊', '🍐', '🍋'][g % 5];
  return `<span class="groupspic">${Array.from({ length: g }, () => `<span class="gp-g">${fruit.repeat(n)}</span>`).join('')}</span>`;
}

/* ---------- text ako obrázok ---------- */
const TXT_COLORS = ['#ff5fa2', '#7c5cff', '#3fa9f5', '#2fc97a', '#ff9d3d', '#ff5d5d', '#00b8a9', '#e6a100'];
function txtPic(t) {
  let h = 0;
  for (const ch of t) h = (h * 31 + ch.codePointAt(0)) % 997;
  const len = [...t].length;
  const size = len <= 1 ? 1 : len <= 2 ? .8 : len <= 3 ? .62 : len <= 5 ? .46 : len <= 8 ? .34 : .24;
  return `<span class="txtpic2" style="--nc:${TXT_COLORS[h % TXT_COLORS.length]};--ts:${size}em"><span>${esc(t)}</span></span>`;
}

function emo(s) {
  return `<span class="emo${glyphs(s) > 1 ? ' multi' : ''}">${s}</span>`;
}
function symPic(id, cls = 'artpic') {
  return `<span class="${cls}"><svg viewBox="0 0 100 100" aria-hidden="true"><use href="#${id}"/></svg></span>`;
}

/* ---------- skutočné fotky (img/foto, zoznam v foto-data.js) ---------- */
const HAS_FOTO = typeof FOTO !== 'undefined';
function fotoOf(slug) { return HAS_FOTO ? FOTO[slug] || null : null; }
function fotoHTML(slug, cls = '') {
  const F = fotoOf(slug);
  if (!F) return emo('🖼️');
  const st = F.pos ? ` style="object-position:${F.pos}"` : '';
  return `<img class="foto${cls ? ' ' + cls : ''}" src="img/foto/${F.f}"${st} alt="" draggable="false" decoding="async">`;
}
const PLANET_FOTO = { sun: 'planeta-slnko', mercury: 'planeta-merkur', venus: 'planeta-venusa', earth: 'planeta-zem', mars: 'planeta-mars',
  jupiter: 'planeta-jupiter', saturn: 'planeta-saturn', uranus: 'planeta-uran', neptune: 'planeta-neptun', moon: 'mesiac' };
function planetPic(id) {
  const slug = PLANET_FOTO[id];
  if (fotoOf(slug)) return `<span class="planetfoto${id === 'saturn' ? ' wide' : ''}">${fotoHTML(slug)}</span>`;
  return symPic('pl-' + id, 'planetpic');
}
/* malý obrázok „mapy“ tela/rastliny so zvýraznenou časťou */
function boardPic(board, id) {
  const C = CUSTOM_BOARDS[board];
  if (!C || !C.photo) return emo('❓');
  const shapes = (C.shapes[id] || []).map(sh => shapeSVG(sh, 'hl')).join('');
  let vb = [0, 0, C.w, C.h];
  if (C.zoomPic && C.shapes[id]) {
    const b = shapesBox(C.shapes[id]), m = Math.max(b[2] - b[0], b[3] - b[1]) * .45 + C.w * .06;
    let x0 = b[0] - m, y0 = b[1] - m, w = b[2] - b[0] + 2 * m, h = b[3] - b[1] + 2 * m;
    if (w / h > 1.25) { const nh = w / 1.25; y0 -= (nh - h) / 2; h = nh; } else if (h / w > 1.25) { const nw = h / 1.25; x0 -= (nw - w) / 2; w = nw; }
    vb = [Math.round(x0), Math.round(y0), Math.round(w), Math.round(h)];
  }
  return `<span class="boardpic" style="--ar:${vb[2]}/${vb[3]}"><svg viewBox="${vb.join(' ')}" aria-hidden="true"><rect x="${vb[0]}" y="${vb[1]}" width="${vb[2]}" height="${vb[3]}" fill="${C.bg || '#fff'}"/><image href="img/foto/${C.photo}" x="0" y="0" width="${C.w}" height="${C.h}" preserveAspectRatio="xMidYMid slice"/>
    <g class="hl-g" style="stroke-width:${(C.w / 90).toFixed(1)}">${shapes}</g></svg></span>`;
}
/* obdĺžnik okolo tvarov [x0, y0, x1, y1] */
function shapesBox(list) {
  const xs = [], ys = [];
  for (const [t, ...a] of list) {
    if (t === 'e') { const r = Math.max(a[2], a[3]); xs.push(a[0] - r, a[0] + r); ys.push(a[1] - r, a[1] + r); }
    else if (t === 'c') { xs.push(a[0] - a[2], a[0] + a[2]); ys.push(a[1] - a[2], a[1] + a[2]); }
    else if (t === 'r') { xs.push(a[0], a[0] + a[2]); ys.push(a[1], a[1] + a[3]); }
    else if (t === 'p') a[0].trim().split(/\s+/).forEach(pt => { const [x, y] = pt.split(',').map(Number); xs.push(x); ys.push(y); });
  }
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}
/* tvar oblasti na fotke: ['e',cx,cy,rx,ry] | ['c',cx,cy,r] | ['r',x,y,w,h,rx] | ['p','x,y x,y …'] */
function shapeSVG(sh, cls = 'hit') {
  const [t, ...a] = sh;
  if (t === 'e') return `<ellipse class="${cls}" cx="${a[0]}" cy="${a[1]}" rx="${a[2]}" ry="${a[3]}"${a[4] ? ` transform="rotate(${a[4]} ${a[0]} ${a[1]})"` : ''}/>`;
  if (t === 'c') return `<circle class="${cls}" cx="${a[0]}" cy="${a[1]}" r="${a[2]}"/>`;
  if (t === 'r') return `<rect class="${cls}" x="${a[0]}" y="${a[1]}" width="${a[2]}" height="${a[3]}" rx="${a[4] || 0}"/>`;
  if (t === 'p') return `<polygon class="${cls}" points="${a[0]}"/>`;
  return '';
}

/* ---------- hlavná funkcia ---------- */
function pic(p) {
  if (p == null || p === '') return '';
  p = String(p);
  const m = /^([a-z]+):(.*)$/.exec(p);
  if (!m) return emo(p);
  const kind = m[1], rest = m[2];
  switch (kind) {
    case 'flag':   return `<img class="flag" src="img/flags/${rest}.svg" alt="" draggable="false">`;
    case 'map':    { const [b, id] = rest.split(':'); return miniMap(b, { hl: id }); }
    case 'pt':     { const [b, lo, la] = rest.split(':'); return miniMap(b, { pt: [+lo, +la] }); }
    case 'line':   { const [b, id] = rest.split(':'); return miniMap(b, { line: id }); }
    case 'planet': return planetPic(rest);
    case 'foto':   return fotoHTML(rest);
    case 'board':  { const [b, id] = rest.split(':'); return boardPic(b, id); }
    case 'clock':  { const [h, mm] = rest.split(':').map(Number); return clockPic(h, mm || 0); }
    case 'coin':   return coinHTML(+rest, 'pic-coin');
    case 'note':   return noteHTML(+rest);
    case 'shape':  return symPic('sh-' + rest);
    case 'sign':   return symPic('sg-' + rest);
    case 'light':  return symPic('lt-' + rest);
    case 'bin':    return symPic('bin-' + rest);
    case 'svg':    return symPic('art-' + rest);
    case 'txt':    return txtPic(rest);
    case 'tens':   { const [t, u] = rest.split(':').map(Number); return tensPic(t, u); }
    case 'groups': { const [g, n] = rest.split(':').map(Number); return groupsPic(g, n); }
    case 'pair':   return `<span class="picrow pair">${rest.split('|').map(x => `<span class="pr-i">${pic(x)}</span>`).join('')}</span>`;
    case 'row':    return `<span class="picrow">${rest.split('|').map(x => `<span class="pr-i">${pic(x)}</span>`).join('')}</span>`;
    default:       return emo(p);
  }
}
/* je hodnota obrázok (emoji / skratka), alebo text? */
function isPic(v) {
  if (v == null) return false;
  v = String(v);
  if (/^(flag|map|pt|line|planet|foto|board|pair|clock|coin|note|shape|sign|light|bin|svg|txt|tens|groups|row):/.test(v)) return true;
  return !/[0-9a-zA-ZÀ-ž]/.test(v);
}

/* ==========================================================================
   Kresby (symboly 100×100)
   ========================================================================== */
const ART = {};

/* štátny znak */
ART['art-znak'] = `<path d="M13 5H87V50C87 76 70 89 50 97C30 89 13 76 13 50Z" fill="#ee1c25" stroke="#fff" stroke-width="3"/>
  <path d="M19 79C22 70 30 66 36 71C40 61 60 61 64 71C70 66 78 70 81 79C73 88 62 93 50 97C38 93 27 88 19 79Z" fill="#0b4ea2"/>
  <g fill="#fff"><rect x="45.5" y="14" width="9" height="53"/><rect x="35" y="24" width="30" height="8" rx="1"/><rect x="28" y="40" width="44" height="9" rx="1"/></g>`;

/* kolobeh života */
ART['art-kukla'] = `<path d="M8 14H92" stroke="#8b5a2b" stroke-width="7" stroke-linecap="round"/>
  <path d="M50 17V22" stroke="#6b8f3a" stroke-width="3"/>
  <path d="M50 20C67 33 69 60 59 80C55 88 45 88 41 80C31 60 33 33 50 20Z" fill="#a6d672" stroke="#5f8f3a" stroke-width="3"/>
  <path d="M39 42Q50 47 61 42M37 56Q50 61 63 56M40 70Q50 74 60 70" stroke="#5f8f3a" stroke-width="2.5" fill="none"/>
  <circle cx="44" cy="34" r="2.2" fill="#ffd23f"/><circle cx="56" cy="34" r="2.2" fill="#ffd23f"/>`;
ART['art-vajicka'] = [[30, 40], [52, 34], [72, 44], [40, 60], [62, 62], [50, 80], [28, 76], [78, 70], [50, 50]].map(([x, y]) =>
  `<circle cx="${x}" cy="${y}" r="13" fill="#d8f0ff" stroke="#9cc9e6" stroke-width="2" opacity=".9"/><circle cx="${x + 1}" cy="${y + 1}" r="4.5" fill="#222"/>`).join('');
ART['art-zubrienka'] = `<path d="M44 50C58 38 72 60 90 42C80 62 64 56 50 62Z" fill="#5a5f4a"/>
  <ellipse cx="34" cy="52" rx="22" ry="17" fill="#4a4f3c"/><circle cx="26" cy="46" r="4" fill="#fff"/><circle cx="25" cy="46" r="2" fill="#111"/>`;
ART['art-zubrienka2'] = `<path d="M50 50C62 42 72 56 86 46C78 60 64 56 54 60Z" fill="#6d7a4a"/>
  <path d="M40 62L34 78M52 62L58 78" stroke="#5e6b3c" stroke-width="5" stroke-linecap="round"/>
  <ellipse cx="38" cy="52" rx="22" ry="16" fill="#6b8a3a"/><circle cx="30" cy="45" r="4.5" fill="#fff"/><circle cx="29" cy="45" r="2.2" fill="#111"/>`;
ART['art-semienko'] = `<rect x="5" y="70" width="90" height="25" rx="8" fill="#9b6a3c"/><path d="M50 22C66 34 68 58 50 70C32 58 34 34 50 22Z" fill="#c8883f" stroke="#8b5a2b" stroke-width="3"/>
  <path d="M45 34C42 44 43 54 47 62" stroke="#f1c27d" stroke-width="3" fill="none" stroke-linecap="round"/>`;
ART['art-jablcko'] = `<path d="M50 28C50 20 54 14 60 11" stroke="#7a4a1c" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M52 22C62 12 74 16 76 22C68 28 58 28 52 22Z" fill="#48b04a"/>
  <circle cx="50" cy="52" r="20" fill="#a8d64a" stroke="#7fae2a" stroke-width="3"/><circle cx="43" cy="45" r="4" fill="#fff" opacity=".6"/>`;
ART['art-koren'] = `<rect x="0" y="0" width="100" height="30" fill="#d9f2ff"/><rect x="0" y="30" width="100" height="70" fill="#a8743f"/>
  <path d="M50 30V8M50 16C42 8 36 10 34 14M50 12C58 4 64 6 66 10" stroke="#3fae4a" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M50 30V70M50 44L32 60M50 44L70 58M50 56L38 80M50 58L64 82M32 60L22 66M70 58L80 66M50 70L50 90" stroke="#f3e1c0" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;

/* odpad */
ART['art-pet'] = `<path d="M42 10H58V20C66 24 68 30 68 38V86C68 91 64 94 59 94H41C36 94 32 91 32 86V38C32 30 34 24 42 20Z" fill="#cfefff" stroke="#6bb8e8" stroke-width="3"/>
  <rect x="41" y="4" width="18" height="10" rx="2" fill="#2f7cf6"/><rect x="32" y="50" width="36" height="18" fill="#4db8ff" opacity=".8"/>
  <path d="M38 30V84" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/>`;
ART['art-flasa'] = `<path d="M44 6H56V28C66 34 68 42 68 50V88C68 92 65 95 61 95H39C35 95 32 92 32 88V50C32 42 34 34 44 28Z" fill="#2e8b57" stroke="#1d6b40" stroke-width="3"/>
  <rect x="43" y="3" width="14" height="8" rx="2" fill="#b58b3c"/><rect x="36" y="56" width="28" height="20" rx="3" fill="#f3e9c6"/><path d="M39 38V86" stroke="#9fe0b8" stroke-width="4" stroke-linecap="round" opacity=".7"/>`;
ART['art-zavaranina'] = `<rect x="26" y="10" width="48" height="12" rx="3" fill="#d9a300"/><path d="M28 22H72V86C72 91 68 95 63 95H37C32 95 28 91 28 86Z" fill="#e8f7ff" stroke="#7fb9d6" stroke-width="3"/>
  <path d="M30 44H70V86C70 90 67 93 63 93H37C33 93 30 90 30 86Z" fill="#e0344a"/><rect x="34" y="52" width="32" height="16" rx="2" fill="#fff3d6"/><path d="M34 28V40" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`;
ART['art-plechovka'] = `<path d="M30 12H70V88H30Z" fill="#ff4d5e"/><ellipse cx="50" cy="12" rx="20" ry="6" fill="#d7dde3" stroke="#9aa3ab" stroke-width="2"/>
  <ellipse cx="50" cy="88" rx="20" ry="6" fill="#c33"/><rect x="30" y="40" width="40" height="20" fill="#fff"/><path d="M36 50Q50 38 64 50" stroke="#ff4d5e" stroke-width="4" fill="none"/>
  <path d="M36 18V84" stroke="#fff" stroke-width="3" opacity=".5"/><circle cx="50" cy="11" r="3" fill="#9aa3ab"/>`;

/* hudobné nástroje */
ART['art-flauta'] = `<g transform="rotate(-35 50 50)"><rect x="6" y="44" width="88" height="12" rx="6" fill="#d7dde3" stroke="#8e979f" stroke-width="2"/>
  ${[30, 42, 54, 66, 78].map(x => `<circle cx="${x}" cy="50" r="3" fill="#555"/>`).join('')}<rect x="12" y="46" width="10" height="8" rx="2" fill="#b9c0c6"/></g>`;
ART['art-fujara'] = `<rect x="44" y="4" width="14" height="92" rx="6" fill="#c8883f" stroke="#7a4a1c" stroke-width="2.5"/>
  <rect x="34" y="8" width="6" height="36" rx="3" fill="#b0702e" stroke="#7a4a1c" stroke-width="2"/><path d="M37 44Q37 50 44 50" stroke="#7a4a1c" stroke-width="3" fill="none"/>
  ${[16, 28, 40, 52, 64, 76, 88].map(y => `<path d="M44 ${y}H58" stroke="#7a4a1c" stroke-width="2"/>`).join('')}
  ${[62, 70, 78].map(y => `<circle cx="51" cy="${y}" r="2.6" fill="#3b2410"/>`).join('')}
  <path d="M46 20L56 26M46 32L56 38" stroke="#f3d08a" stroke-width="2"/>`;
ART['art-triangel'] = `<path d="M50 14L86 80H18L46 26" fill="none" stroke="#b9c0c6" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="M50 14L50 4" stroke="#e84a5f" stroke-width="3"/><path d="M70 40L96 22" stroke="#8e979f" stroke-width="5" stroke-linecap="round"/>
  <path d="M86 30l6 4M90 44l6 0M84 20l3 -6" stroke="#ffc83d" stroke-width="3" stroke-linecap="round"/>`;
ART['art-xylofon'] = `<path d="M10 38L90 30M10 78L90 70" stroke="#7a4a1c" stroke-width="5" stroke-linecap="round"/>
  ${['#ff5d5d', '#ff9d3d', '#ffc83d', '#2fc97a', '#3fa9f5', '#7c5cff'].map((c, i) => { const x = 14 + i * 13, t = 28 + i * 2, b = 84 - i * 3.5; return `<rect x="${x}" y="${t}" width="10" height="${b - t}" rx="3" fill="${c}"/>`; }).join('')}
  <path d="M60 14L80 4M76 20L96 12" stroke="#8b5a2b" stroke-width="3.5"/><circle cx="60" cy="14" r="5" fill="#e84a5f"/><circle cx="76" cy="20" r="5" fill="#e84a5f"/>`;
ART['art-harfa'] = `<path d="M24 90L24 18C40 6 54 30 88 30L70 90Z" fill="none" stroke="#c9922e" stroke-width="7" stroke-linejoin="round"/>
  ${[32, 40, 48, 56, 64, 72].map((x, i) => `<path d="M${x} ${[20, 22, 25, 28, 30, 32][i]}L${x - 1} 88" stroke="#e6d9b8" stroke-width="1.8"/>`).join('')}
  <path d="M20 92H74" stroke="#9c6d1c" stroke-width="7" stroke-linecap="round"/>`;

/* dinosaury (pohľad z boku) */
ART['art-triceratops'] = `<path d="M18 62C18 44 34 36 54 38C68 39 76 46 80 54L94 64L80 66C76 76 66 80 52 80H30C22 80 18 72 18 62Z" fill="#7cc66a"/>
  <path d="M8 58C12 50 16 48 22 50L18 62Z" fill="#7cc66a"/><path d="M70 36C80 28 92 34 92 46C88 52 80 52 74 50Z" fill="#f2a65a" stroke="#d08032" stroke-width="2"/>
  <path d="M84 48L98 40L88 52Z" fill="#fff4dc" stroke="#c9b99a" stroke-width="1.5"/><path d="M78 42L90 30L84 44Z" fill="#fff4dc" stroke="#c9b99a" stroke-width="1.5"/><path d="M88 58L96 58L90 62Z" fill="#fff4dc"/>
  <circle cx="82" cy="50" r="2.5" fill="#222"/><rect x="28" y="72" width="10" height="18" rx="4" fill="#5fae52"/><rect x="58" y="72" width="10" height="18" rx="4" fill="#5fae52"/>`;
ART['art-stegosaurus'] = `${[[26, 44], [38, 34], [50, 30], [62, 34], [72, 42]].map(([x, y]) => `<path d="M${x - 7} ${y + 12}L${x} ${y - 6}L${x + 7} ${y + 12}Z" fill="#ff9d3d" stroke="#e07b17" stroke-width="2"/>`).join('')}
  <path d="M10 64C14 50 30 44 50 44C70 44 82 52 88 60L98 64L88 68C80 74 68 78 50 78C32 78 20 76 10 64Z" fill="#62b6e8"/>
  <path d="M6 60L2 52M10 62L6 72" stroke="#555" stroke-width="3" stroke-linecap="round"/><circle cx="90" cy="62" r="2.3" fill="#222"/>
  <rect x="28" y="70" width="10" height="20" rx="4" fill="#4a9fd0"/><rect x="62" y="70" width="10" height="20" rx="4" fill="#4a9fd0"/>`;
ART['art-pteranodon'] = `<path d="M50 50L4 34C18 52 26 58 44 60Z" fill="#b48ae8"/><path d="M50 50L96 34C82 52 74 58 56 60Z" fill="#b48ae8"/>
  <ellipse cx="50" cy="56" rx="10" ry="8" fill="#9a6cd6"/><path d="M50 50C54 40 60 36 70 34L60 44Z" fill="#9a6cd6"/>
  <path d="M58 42L90 44L60 48Z" fill="#ffc83d"/><path d="M62 38L52 24L66 36Z" fill="#9a6cd6"/><circle cx="62" cy="41" r="2" fill="#222"/>
  <path d="M46 64L42 72M54 64L58 72" stroke="#7a52b8" stroke-width="3" stroke-linecap="round"/>`;
ART['art-ankylosaurus'] = `<path d="M14 64C16 48 32 40 52 40C70 40 82 48 86 58L94 62L86 66C80 74 66 78 50 78H28C18 78 13 72 14 64Z" fill="#c9a36a"/>
  ${[[30, 46], [42, 42], [54, 41], [66, 44], [36, 56], [50, 54], [64, 56], [76, 52]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.5" fill="#a67c3c"/>`).join('')}
  <path d="M14 62C8 60 4 58 2 54" stroke="#c9a36a" stroke-width="7" stroke-linecap="round"/><circle cx="4" cy="54" r="7" fill="#8b6428"/>
  <circle cx="88" cy="60" r="2.3" fill="#222"/><rect x="28" y="70" width="11" height="18" rx="4" fill="#b08a50"/><rect x="62" y="70" width="11" height="18" rx="4" fill="#b08a50"/>`;
ART['art-bigdipper'] = `<rect width="100" height="100" rx="18" fill="#1e2a5a"/>
  <path d="M90 26L76 22L63 30L48 42L16 34L19 64L47 68L48 42" stroke="#9fb4ff" stroke-width="2" fill="none" stroke-dasharray="3 3"/>
  ${[[90, 26], [76, 22], [63, 30], [48, 42], [16, 34], [19, 64], [47, 68]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#fff6c2"/>`).join('')}`;

/* rovinné tvary a telesá */
ART['sh-kruh'] = `<circle cx="50" cy="50" r="40" fill="#ff5fa2"/><circle cx="36" cy="36" r="8" fill="#fff" opacity=".35"/>`;
ART['sh-stvorec'] = `<rect x="12" y="12" width="76" height="76" rx="4" fill="#3fa9f5"/>`;
ART['sh-obdlznik'] = `<rect x="4" y="26" width="92" height="48" rx="4" fill="#2fc97a"/>`;
ART['sh-trojuholnik'] = `<path d="M50 8L94 88H6Z" fill="#ffc83d" stroke-linejoin="round"/>`;
ART['sh-kocka'] = `<path d="M20 34L50 20L80 34L50 48Z" fill="#8fd0ff"/><path d="M20 34V70L50 86V48Z" fill="#3fa9f5"/><path d="M80 34V70L50 86V48Z" fill="#2386d1"/>`;
ART['sh-kvader'] = `<path d="M8 40L34 28L92 40L66 52Z" fill="#b9f0cf"/><path d="M8 40V70L66 82V52Z" fill="#2fc97a"/><path d="M92 40V70L66 82V52Z" fill="#1d9f5b"/>`;
ART['sh-gula'] = `<circle cx="50" cy="50" r="40" fill="url(#g-ball)"/><ellipse cx="50" cy="52" rx="40" ry="12" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="2"/>`;
ART['sh-valec'] = `<path d="M24 22V78A26 9 0 0 0 76 78V22Z" fill="#ff9d3d"/><ellipse cx="50" cy="22" rx="26" ry="9" fill="#ffc98a"/><path d="M32 30V74" stroke="#fff" stroke-opacity=".3" stroke-width="5"/>`;
ART['sh-kuzel'] = `<path d="M50 8L80 78A30 10 0 0 1 20 78Z" fill="#9b6bff"/><ellipse cx="50" cy="78" rx="30" ry="10" fill="#7c4be0"/><path d="M50 12L36 72" stroke="#fff" stroke-opacity=".3" stroke-width="4"/>`;
ART['sh-ihlan'] = `<path d="M50 10L14 72L52 88Z" fill="#ffd66b"/><path d="M50 10L52 88L88 70Z" fill="#e6a100"/>`;

/* semafor */
['red', 'orange', 'green'].forEach(on => {
  const lamp = (c, dim, y) => `<circle cx="50" cy="${y}" r="12" fill="${on === c ? dim[0] : dim[1]}"/>${on === c ? `<circle cx="46" cy="${y - 4}" r="4" fill="#fff" opacity=".6"/>` : ''}`;
  ART['lt-' + on] = `<rect x="30" y="4" width="40" height="92" rx="10" fill="#333a44"/>` +
    lamp('red', ['#ff3b3b', '#5a2a2a'], 22) + lamp('orange', ['#ffab2e', '#5a4420'], 50) + lamp('green', ['#2fe07a', '#1f4a30'], 78);
});

/* dopravné značky */
ART['sg-stop'] = `<path d="M31 4H69L96 31V69L69 96H31L4 69V31Z" fill="#e2231a" stroke="#fff" stroke-width="4"/><text x="50" y="61" text-anchor="middle" font-size="27" font-weight="900" fill="#fff" font-family="Arial, sans-serif">STOP</text>`;
ART['sg-zakaz'] = `<circle cx="50" cy="50" r="45" fill="#e2231a" stroke="#fff" stroke-width="3"/><rect x="20" y="42" width="60" height="16" rx="2" fill="#fff"/>`;
ART['sg-prednost'] = `<path d="M6 12H94L50 90Z" fill="#fff" stroke="#e2231a" stroke-width="9" stroke-linejoin="round"/>`;
ART['sg-hlavna'] = `<path d="M50 4L96 50L50 96L4 50Z" fill="#fff"/><path d="M50 16L84 50L50 84L16 50Z" fill="#ffc400"/><path d="M50 4L96 50L50 96L4 50Z" fill="none" stroke="#333" stroke-width="2"/>`;
ART['sg-prechod'] = `<rect x="4" y="4" width="92" height="92" rx="8" fill="#1f5fbf"/><path d="M50 12L88 82H12Z" fill="#fff"/>
  <path d="M26 78H74" stroke="#111" stroke-width="4" stroke-dasharray="6 4"/><circle cx="52" cy="36" r="5" fill="#111"/>
  <path d="M51 42L47 58L40 70M47 58L56 68M50 46L58 54M49 46L42 54" stroke="#111" stroke-width="4.5" stroke-linecap="round" fill="none"/>`;
ART['sg-deti'] = `<path d="M50 8L94 88H6Z" fill="#fff" stroke="#e2231a" stroke-width="8" stroke-linejoin="round"/>
  <circle cx="42" cy="44" r="5" fill="#111"/><circle cx="60" cy="50" r="4.5" fill="#111"/>
  <path d="M42 50L40 64L34 76M40 64L46 76M41 54L34 62M42 54L52 58" stroke="#111" stroke-width="4" stroke-linecap="round" fill="none"/>
  <path d="M60 55L60 66L56 77M60 66L65 77M60 58L66 64M52 58L60 58" stroke="#111" stroke-width="3.6" stroke-linecap="round" fill="none"/>`;
ART['sg-cyklo'] = `<circle cx="50" cy="50" r="45" fill="#1f5fbf" stroke="#fff" stroke-width="3"/>
  <g stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"><circle cx="30" cy="62" r="13"/><circle cx="70" cy="62" r="13"/>
  <path d="M30 62L44 40H62L70 62M44 40L52 62L62 40M40 34H48M62 40L60 32H66"/></g>`;

/* kontajnery na odpad */
[['yellow', '#ffd23f', '#d9a300'], ['blue', '#3f8df5', '#2566c4'], ['green', '#2fbf5a', '#1d8f40'], ['red', '#ef4444', '#b91c1c'], ['brown', '#9b6a3c', '#6f4722'], ['black', '#444', '#222']].forEach(([n, c, d]) => {
  ART['bin-' + n] = `<rect x="16" y="14" width="68" height="12" rx="4" fill="${d}"/><path d="M20 26H80L74 88H26Z" fill="${c}"/>
    <path d="M30 34V80M50 34V80M70 34V80" stroke="${d}" stroke-width="3" opacity=".35"/>
    <circle cx="30" cy="90" r="6" fill="#333"/><circle cx="70" cy="90" r="6" fill="#333"/>
    <text x="50" y="66" text-anchor="middle" font-size="30" fill="#fff" font-family="Segoe UI Symbol, sans-serif">♻</text>`;
});

/* planéty */
const PLANETS = {
  sun: `<g fill="#ffb300">${Array.from({ length: 12 }, (_, i) => `<path d="M50 2L55 14H45Z" transform="rotate(${i * 30} 50 50)"/>`).join('')}</g><circle cx="50" cy="50" r="34" fill="url(#g-sun)"/>`,
  mercury: `<circle cx="50" cy="50" r="40" fill="url(#g-mercury)"/><circle cx="36" cy="38" r="6" fill="#8b857e" opacity=".6"/><circle cx="62" cy="60" r="8" fill="#8b857e" opacity=".5"/><circle cx="58" cy="30" r="4" fill="#8b857e" opacity=".5"/><circle cx="34" cy="64" r="4" fill="#8b857e" opacity=".5"/>`,
  venus: `<circle cx="50" cy="50" r="40" fill="url(#g-venus)"/><path d="M14 44Q50 34 86 48M16 60Q50 52 84 64" stroke="#fff3d6" stroke-width="5" fill="none" opacity=".6"/>`,
  earth: `<circle cx="50" cy="50" r="40" fill="url(#g-earth)"/>
    <g clip-path="url(#c-planet)" fill="#3fbf5a"><path d="M20 30C30 20 44 24 46 34C44 44 32 44 30 54C26 60 18 54 16 46Z"/><path d="M54 22C66 20 80 28 78 38C70 42 62 36 56 40C52 34 50 28 54 22Z"/>
    <path d="M52 52C62 48 72 54 70 66C66 78 56 84 52 76C50 68 46 60 52 52Z"/></g>
    <path d="M24 70Q40 64 54 72M60 30Q72 26 80 32" stroke="#fff" stroke-width="4" fill="none" opacity=".7" stroke-linecap="round"/>`,
  moon: `<circle cx="50" cy="50" r="40" fill="url(#g-moon)"/><circle cx="36" cy="38" r="8" fill="#a9adb3"/><circle cx="62" cy="58" r="10" fill="#a9adb3"/><circle cx="60" cy="30" r="5" fill="#a9adb3"/><circle cx="38" cy="66" r="5" fill="#a9adb3"/>`,
  mars: `<circle cx="50" cy="50" r="40" fill="url(#g-mars)"/><path d="M24 44C34 38 42 46 50 42C60 38 66 46 74 44" stroke="#8f2f0a" stroke-width="6" fill="none" opacity=".45" stroke-linecap="round"/>
    <circle cx="60" cy="64" r="7" fill="#8f2f0a" opacity=".35"/><ellipse cx="50" cy="13" rx="12" ry="4" fill="#fff" opacity=".9"/>`,
  jupiter: `<circle cx="50" cy="50" r="40" fill="#e9c9a0"/><g clip-path="url(#c-planet40)">
    ${[[14, '#c98f5a'], [26, '#f3dcc0'], [36, '#b8784a'], [48, '#f0d2ac'], [58, '#c98f5a'], [68, '#f3dcc0'], [78, '#b8784a']].map(([y, c]) => `<rect x="0" y="${y}" width="100" height="7" fill="${c}"/>`).join('')}
    <ellipse cx="62" cy="62" rx="10" ry="6" fill="#d9532b"/></g><circle cx="50" cy="50" r="40" fill="url(#g-shade)"/>`,
  saturn: `<path d="M4 58A46 13 0 0 1 96 48" stroke="#d9b36a" stroke-width="7" fill="none"/>
    <circle cx="50" cy="52" r="27" fill="#f0d49a"/><g clip-path="url(#c-saturn)">${[34, 44, 56, 66].map(y => `<rect x="0" y="${y}" width="100" height="4" fill="#d9ad62"/>`).join('')}</g>
    <circle cx="50" cy="52" r="27" fill="url(#g-shade)"/><path d="M96 48A46 13 0 0 1 4 58" stroke="#e8c887" stroke-width="7" fill="none"/>`,
  uranus: `<ellipse cx="50" cy="50" rx="8" ry="46" stroke="#bff0f5" stroke-width="3" fill="none" opacity=".8"/><circle cx="50" cy="50" r="36" fill="url(#g-uranus)"/>`,
  neptune: `<circle cx="50" cy="50" r="38" fill="url(#g-neptune)"/><ellipse cx="40" cy="44" rx="9" ry="5" fill="#1d3aa8" opacity=".7"/><path d="M18 60Q50 54 82 62" stroke="#9fc1ff" stroke-width="3" fill="none" opacity=".5"/>`,
};
for (const k in PLANETS) ART['pl-' + k] = PLANETS[k];

const GRADIENTS = `
  <radialGradient id="g-sun" cx="40%" cy="38%" r="65%"><stop offset="0" stop-color="#fff9c4"/><stop offset=".5" stop-color="#ffd23f"/><stop offset="1" stop-color="#ff9500"/></radialGradient>
  <radialGradient id="g-mercury" cx="38%" cy="35%" r="70%"><stop offset="0" stop-color="#e6e1dc"/><stop offset="1" stop-color="#8f8a85"/></radialGradient>
  <radialGradient id="g-venus" cx="38%" cy="35%" r="70%"><stop offset="0" stop-color="#fff3d1"/><stop offset="1" stop-color="#e2a95a"/></radialGradient>
  <radialGradient id="g-earth" cx="38%" cy="35%" r="70%"><stop offset="0" stop-color="#7fd0ff"/><stop offset="1" stop-color="#1c5fc4"/></radialGradient>
  <radialGradient id="g-moon" cx="38%" cy="35%" r="70%"><stop offset="0" stop-color="#f1f3f5"/><stop offset="1" stop-color="#9aa0a8"/></radialGradient>
  <radialGradient id="g-mars" cx="38%" cy="35%" r="70%"><stop offset="0" stop-color="#ffb08a"/><stop offset="1" stop-color="#c1440e"/></radialGradient>
  <radialGradient id="g-uranus" cx="38%" cy="35%" r="70%"><stop offset="0" stop-color="#e6fdff"/><stop offset="1" stop-color="#6fcfdc"/></radialGradient>
  <radialGradient id="g-neptune" cx="38%" cy="35%" r="70%"><stop offset="0" stop-color="#8fb4ff"/><stop offset="1" stop-color="#2442c4"/></radialGradient>
  <radialGradient id="g-shade" cx="35%" cy="32%" r="75%"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></radialGradient>
  <radialGradient id="g-ball" cx="35%" cy="32%" r="70%"><stop offset="0" stop-color="#ffb3d4"/><stop offset="1" stop-color="#e0357d"/></radialGradient>
  <clipPath id="c-planet"><circle cx="50" cy="50" r="40"/></clipPath>
  <clipPath id="c-planet40"><circle cx="50" cy="50" r="40"/></clipPath>
  <clipPath id="c-saturn"><circle cx="50" cy="52" r="27"/></clipPath>`;

/* Skryté SVG so všetkými kresbami a mapami (pre <use>) – vloží sa raz pri štarte */
function injectDefs() {
  if (document.getElementById('art-defs')) return;
  const maps = Object.keys(MAP_DATA).map(k => {
    const B = MAP_DATA[k];
    const land = B.regions.map(r => `<path d="${r.d}"${k === 'world' && r.cont === 'an' ? ' fill="#f4f7fa"' : ''}/>`).join('');
    const rivers = ['dunaj', 'morava', 'vah', 'hron', 'hornad', 'ipel'].filter(x => B.extra[x]).map(x => `<path d="${B.extra[x]}" fill="none" stroke="#6bb8ff" stroke-width="3.5" stroke-linejoin="round"/>`).join('');
    return `<symbol id="mb-${k}" viewBox="0 0 ${B.w} ${B.h}"><g fill="${LAND}" stroke="${LAND_LINE}" stroke-width="${k === 'world' ? 0.5 : 0.9}" stroke-linejoin="round">${land}</g>${rivers}</symbol>`;
  }).join('');
  const syms = Object.keys(ART).map(id => `<symbol id="${id}" viewBox="0 0 100 100">${ART[id]}</symbol>`).join('');
  const svg = `<svg id="art-defs" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true"><defs>${GRADIENTS}</defs>${syms}${maps}</svg>`;
  document.body.insertAdjacentHTML('afterbegin', svg);
}

/* ==========================================================================
   Vlastné „mapy“ na ukazovanie: rastlina, telo, orgány, slnečná sústava
   ========================================================================== */
const CUSTOM_BOARDS = {
  plant: {
    w: 300, h: 360, bg: '#dff4ff',
    names: { koren: 'koreň', stonka: 'stonka', list: 'list', kvet: 'kvet', plod: 'plod' },
    svg: `<rect x="0" y="250" width="300" height="110" fill="#b07a45"/><rect x="0" y="244" width="300" height="10" fill="#6fbf4a"/>
      <circle cx="252" cy="52" r="26" fill="#ffd23f" opacity=".9"/>
      <g class="rg" data-id="koren"><path d="M150 252V330M150 272L112 300M150 272L190 296M150 292L124 340M150 296L178 342M112 300L92 312M190 296L212 310M150 330L146 352"
        stroke="#f3dfba" stroke-width="9" fill="none" stroke-linecap="round"/><rect x="80" y="252" width="140" height="104" fill="transparent"/></g>
      <g class="rg" data-id="stonka"><path d="M150 250C148 200 154 160 150 96" stroke="#3a9e45" stroke-width="12" fill="none" stroke-linecap="round"/>
        <path d="M151 176C176 170 196 160 208 148" stroke="#3a9e45" stroke-width="8" fill="none" stroke-linecap="round"/></g>
      <g class="rg" data-id="list"><path d="M149 210C120 214 94 200 80 180C108 176 132 186 149 210Z" fill="#4cc15a" stroke="#2f8f3c" stroke-width="3"/>
        <path d="M151 150C176 146 196 128 204 108C178 110 158 126 151 150Z" fill="#4cc15a" stroke="#2f8f3c" stroke-width="3"/>
        <path d="M149 210C124 202 104 192 84 182M151 150C170 136 186 122 200 112" stroke="#2f8f3c" stroke-width="2" fill="none"/></g>
      <g class="rg" data-id="plod"><circle cx="214" cy="164" r="20" fill="#ff4d4d" stroke="#c62828" stroke-width="3"/><circle cx="207" cy="157" r="5" fill="#fff" opacity=".5"/>
        <path d="M206 146L214 150L222 146" stroke="#2f8f3c" stroke-width="3" fill="none"/></g>
      <g class="rg" data-id="kvet">${Array.from({ length: 8 }, (_, i) => `<ellipse cx="150" cy="58" rx="13" ry="28" fill="#ff8fc1" stroke="#e05a9a" stroke-width="2" transform="rotate(${i * 45} 150 86)"/>`).join('')}
        <circle cx="150" cy="86" r="17" fill="#ffc83d" stroke="#e0a100" stroke-width="3"/></g>`,
  },
  body: {
    w: 240, h: 420, bg: '#fff4f6',
    names: { hlava: 'hlava', krk: 'krk', rameno: 'rameno', hrudnik: 'hrudník', brucho: 'brucho', laket: 'lakeť', dlan: 'dlaň', koleno: 'koleno', chodidlo: 'chodidlo', paza: 'ruka', stehno: 'noha', lytko: 'noha', vlasy: 'vlasy' },
    svg: (() => {
      const S = '#ffd3b0', SL = '#e8a97c';
      const arm = (sx) => {
        const m = sx < 120 ? 1 : -1;
        const x = v => 120 - m * (120 - v);
        return `<g class="rg" data-id="paza"><path d="M${x(62)} 128L${x(42)} 184L${x(34)} 244" stroke="${S}" stroke-width="20" stroke-linecap="round" fill="none"/></g>
          <g class="rg" data-id="laket"><circle cx="${x(42)}" cy="184" r="12" fill="${SL}"/></g>
          <g class="rg" data-id="dlan"><ellipse cx="${x(32)}" cy="262" rx="15" ry="18" fill="${S}" stroke="${SL}" stroke-width="2"/></g>
          <g class="rg" data-id="rameno"><circle cx="${x(66)}" cy="124" r="15" fill="#ff8fb3"/></g>`;
      };
      const leg = (side) => {
        const x = v => side < 0 ? v : 240 - v;
        return `<g class="rg" data-id="stehno"><path d="M${x(98)} 238L${x(96)} 306" stroke="#5b7bd5" stroke-width="30" stroke-linecap="round"/></g>
          <g class="rg" data-id="lytko"><path d="M${x(96)} 318L${x(96)} 372" stroke="${S}" stroke-width="22" stroke-linecap="round"/></g>
          <g class="rg" data-id="koleno"><circle cx="${x(96)}" cy="312" r="14" fill="${SL}"/></g>
          <g class="rg" data-id="chodidlo"><ellipse cx="${x(side < 0 ? 88 : 88)}" cy="392" rx="22" ry="11" fill="#ff5fa2"/></g>`;
      };
      return `${arm(0)}${arm(240)}${leg(-1)}${leg(1)}
        <g class="rg" data-id="brucho"><path d="M72 178H168V238C168 250 158 254 150 254H90C82 254 72 250 72 238Z" fill="#ffc6de"/></g>
        <g class="rg" data-id="hrudnik"><path d="M64 128C64 116 76 110 90 110H150C164 110 176 116 176 128V180H64Z" fill="#ff8fb3"/></g>
        <g class="rg" data-id="krk"><rect x="106" y="90" width="28" height="26" rx="6" fill="${SL}"/></g>
        <g class="rg" data-id="hlava"><circle cx="120" cy="58" r="40" fill="${S}"/><circle cx="106" cy="56" r="4" fill="#3b2d5e"/><circle cx="134" cy="56" r="4" fill="#3b2d5e"/>
          <path d="M108 74Q120 84 132 74" stroke="#d9534f" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="98" cy="68" r="5" fill="#ff9aa8" opacity=".6"/><circle cx="142" cy="68" r="5" fill="#ff9aa8" opacity=".6"/></g>
        <g class="rg" data-id="vlasy"><path d="M80 52C78 22 100 12 120 14C144 14 164 26 160 54C150 36 132 30 120 30C104 30 90 36 80 52Z" fill="#8b5a2b"/></g>`;
    })(),
  },
  organs: {
    w: 240, h: 420, bg: '#fff4f6',
    names: { mozog: 'mozog', srdce: 'srdce', pluca: 'pľúca', zaludok: 'žalúdok', creva: 'črevá', telo: 'telo' },
    svg: `<g class="rg" data-id="telo"><circle cx="120" cy="60" r="44" fill="#ffe3cf"/><rect x="104" y="98" width="32" height="24" fill="#ffe3cf"/>
        <path d="M60 130C60 118 74 112 90 112H150C166 112 180 118 180 130V270C180 282 170 290 158 290H82C70 290 60 282 60 270Z" fill="#ffe3cf"/>
        <path d="M60 136L34 250M180 136L206 250" stroke="#ffe3cf" stroke-width="24" stroke-linecap="round"/>
        <path d="M94 286L92 404M146 286L148 404" stroke="#ffe3cf" stroke-width="32" stroke-linecap="round"/></g>
      <g class="rg" data-id="mozog"><path d="M86 56C82 34 100 24 112 30C120 20 138 22 142 32C156 30 164 46 156 58C160 70 146 78 136 72C128 80 112 80 104 72C92 78 80 68 86 56Z" fill="#ff9ec7" stroke="#d9608f" stroke-width="3"/>
        <path d="M104 40Q110 50 102 58M124 34Q128 46 120 54M142 44Q136 54 142 62M112 64Q122 58 132 64" stroke="#d9608f" stroke-width="2.5" fill="none"/></g>
      <g class="rg" data-id="pluca"><path d="M112 140C112 128 102 124 94 130C80 142 76 176 80 200C84 212 104 212 110 200Z" fill="#ff8a8a" stroke="#d45a5a" stroke-width="3"/>
        <path d="M128 140C128 128 138 124 146 130C160 142 164 176 160 200C156 212 136 212 130 200Z" fill="#ff8a8a" stroke="#d45a5a" stroke-width="3"/>
        <path d="M120 118V140M120 140L108 152M120 140L132 152" stroke="#c4a3a3" stroke-width="5" fill="none" stroke-linecap="round"/></g>
      <g class="rg" data-id="srdce"><path d="M126 168C126 158 138 156 142 164C146 156 158 158 158 168C158 180 142 190 142 196C142 190 126 180 126 168Z" fill="#e0263a" stroke="#fff" stroke-width="2.5" transform="translate(-14 0)"/></g>
      <g class="rg" data-id="zaludok"><path d="M132 214C150 206 164 216 160 232C156 250 136 250 124 244C116 240 118 230 126 230C136 232 142 228 138 222C136 218 132 216 132 214Z" fill="#ffb347" stroke="#d98a1c" stroke-width="3"/></g>
      <g class="rg" data-id="creva"><path d="M92 250C92 240 106 238 110 246C114 254 102 260 98 266C94 274 108 280 116 274C124 268 120 256 130 254C142 252 150 262 146 272C142 282 128 282 122 280"
        stroke="#f5a3a3" stroke-width="11" fill="none" stroke-linecap="round"/><rect x="84" y="240" width="72" height="46" fill="transparent"/></g>`,
  },
  solar: {
    w: 1000, h: 280, bg: '#141b3d',
    names: { sun: 'Slnko', mercury: 'Merkúr', venus: 'Venuša', earth: 'Zem', mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Urán', neptune: 'Neptún' },
    svg: (() => {
      const P = [['mercury', 170, 9], ['venus', 235, 14], ['earth', 305, 15], ['mars', 372, 11], ['jupiter', 490, 46], ['saturn', 650, 50], ['uranus', 790, 26], ['neptune', 912, 25]];
      const stars = Array.from({ length: 40 }, (_, i) => `<circle cx="${(i * 137) % 1000}" cy="${(i * 71) % 280}" r="${i % 3 ? 1 : 1.8}" fill="#fff" opacity=".6"/>`).join('');
      const orbits = P.map(([, x]) => `<circle cx="-60" cy="140" r="${x + 60}" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="2"/>`).join('');
      // so skutočnými fotkami: čierne pozadie fotiek zmizne vďaka „screen“ zmiešaniu
      const img = (id, x, y, w, h) => { const F = fotoOf(PLANET_FOTO[id]); return F ? `<image class="pl-foto" href="img/foto/${F.f}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet"/>` : `<use href="#pl-${id}" x="${x}" y="${y}" width="${w}" height="${h}"/>`; };
      const planets = P.map(([id, x, r]) => {
        const F = fotoOf(PLANET_FOTO[id]);
        const s = F ? (id === 'saturn' ? r * 2.6 : r * 2.2) : id === 'saturn' ? r * 2.1 : id === 'uranus' ? r * 2.6 : r * 2.5;
        return `<g class="rg" data-id="${id}"><circle cx="${x}" cy="140" r="${Math.max(r, 20) + 6}" fill="transparent"/>${img(id, x - s / 2, 140 - s / 2, s, s)}</g>`;
      }).join('');
      return `${stars}${orbits}<g class="rg" data-id="sun"><circle cx="-30" cy="140" r="112" fill="transparent"/>${img('sun', -150, 20, 240, 240)}</g>${planets}`;
    })(),
  },
};
/* fotky tela a orgánov (foto-boards.js) nahradia kreslené verzie */
if (typeof PHOTO_BOARDS !== "undefined") Object.assign(CUSTOM_BOARDS, PHOTO_BOARDS);
