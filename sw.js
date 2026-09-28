/* Offline režim (tablet, inštalácia z https adresy) – rovnaký princíp ako v AutiLabe.
   Aplikácia sa vždy načíta okamžite z uloženej kópie – aj keď je Wi-Fi bez internetu.
   Pri prvom otvorení sa uloží celá aplikácia aj bežné fotky (~11 MB). Veľké fotky na zväčšenie
   (img/foto/velke) sa uložia až vtedy, keď si ich dieťa otvorí.
   Nová verzia sa stiahne celá na pozadí (pri zmene CACHE nižšie) a použije sa pri ďalšom spustení. */
const CACHE = 'objavujem-svet-v1';        // pri každej novej verzii aplikácie zvýšiť
const VELKE = 'objavujem-svet-velke-v1';  // veľké fotky – zvýšiť len keď sa zmenia
const PREFIX = 'objavujem-svet-';         // mažeme len svoje kópie (na github.io môžu byť aj iné aplikácie toho istého účtu)
const CORE = [
  './', 'index.html', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png',
  'css/style.css', 'css/objavy.css',
  'js/maps-data.js', 'js/foto-data.js', 'js/foto-boards.js', 'js/data.js',
  'js/obsah-zemepis.js', 'js/obsah-priroda.js', 'js/obsah-vesmir.js', 'js/obsah-telo.js',
  'js/obsah-matematika.js', 'js/obsah-slovencina.js', 'js/obsah-hlavicka.js',
  'js/ui.js', 'js/pics.js', 'js/store.js', 'js/audio.js', 'js/fx.js', 'js/zoom.js', 'js/games.js', 'js/app.js',
];
const FLAGS = ['ar', 'at', 'au', 'be', 'bg', 'br', 'ca', 'ch', 'cn', 'cz', 'de', 'dk', 'dz', 'eg', 'es', 'eu', 'fi', 'fr', 'gb', 'gr', 'hr',
  'hu', 'ie', 'in', 'it', 'jp', 'ke', 'kr', 'kz', 'mx', 'nl', 'no', 'nz', 'pl', 'pt', 'ro', 'ru', 'se', 'si', 'sk', 'tr', 'ua', 'us', 'za']
  .map((c) => `img/flags/${c}.svg`);

// zoznam fotiek priamo zo súborov aplikácie – netreba ho tu udržiavať
async function photoList(cache) {
  const text = async (f) => { const r = await cache.match(f); return r ? r.text() : ''; };
  const fotos = [...(await text('js/foto-data.js')).matchAll(/"f":"([^"]+)"/g)].map((m) => m[1]);
  const boards = [...(await text('js/foto-boards.js')).matchAll(/photo:\s*'([^']+)'/g)].map((m) => m[1]);
  return [...new Set([...fotos, ...boards])].map((f) => `img/foto/${f}`);
}

self.addEventListener('install', (e) => {
  // cache: 'reload' → obísť HTTP cache servera, aby sa naozaj stiahla nová verzia všetkých súborov
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(CORE.map((f) => new Request(f, { cache: 'reload' })));
    const rest = [...FLAGS, ...(await photoList(cache))];
    for (let i = 0; i < rest.length; i += 8) {   // po kúskoch; jedna chýbajúca fotka nezastaví celú inštaláciu
      await Promise.all(rest.slice(i, i + 8).map((f) => fetch(new Request(f, { cache: 'reload' }))
        .then((r) => (r.ok ? cache.put(f, r) : null)).catch(() => null)));
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k.startsWith(PREFIX) && k !== CACHE && k !== VELKE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin || url.pathname.includes('/api/')) return;
  e.respondWith((async () => {
    const big = url.pathname.includes('/img/foto/velke/');
    const cache = await caches.open(big ? VELKE : CACHE);
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try {
      const res = await fetch(req);
      if (res.ok && res.type === 'basic') cache.put(req, res.clone());
      return res;
    } catch (err) {
      // bez siete a bez kópie: pri otvorení stránky aspoň uložená aplikácia
      if (req.mode === 'navigate') {
        const index = await (await caches.open(CACHE)).match('index.html');
        if (index) return index;
      }
      throw err;
    }
  })());
});
