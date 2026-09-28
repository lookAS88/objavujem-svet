# 🌍 Objavujem svet

Interaktívna aplikácia pre zvedavých druhákov: zemepis, príroda, vesmír, telo, počty, slovenčina a všeobecný prehľad. Dieťa sprevádza líška Bystrulka. Nič sa neinštaluje, aplikácia beží v prehliadači a funguje aj bez internetu (okrem online hlasov v Edge).

## Na webe a na tablete
Aplikácia je na adrese **https://lookas88.github.io/objavujem-svet/**. Na tablete ju otvorte v Chrome a v menu ⋮ dajte **Pridať na plochu / Inštalovať aplikáciu** – potom sa spúšťa ikonkou ako bežná aplikácia a funguje aj bez internetu (pri prvom otvorení sa uloží asi 11 MB, veľké fotky na zväčšenie až keď sa otvoria).

Postup sa na webe ukladá **len v danom zariadení** (v prehliadači). Občas ho zálohujte v Rodičovskej zóne tlačidlom **Exportovať postup**; na inom zariadení ho obnovíte cez **Importovať zálohu**. Na čítanie nahlas potrebuje tablet slovenský hlas (Android: *Nastavenia → Jazyk a vstup → Prevod textu na reč → Google → slovenčina*).

## Spustenie na počítači
**Odporúčané: dvojklik na `Spustiť objavovanie.bat`.** Spustí sa malý lokálny server (PowerShell, súčasť Windows) a aplikácia sa otvorí v okne Microsoft Edge. Postup sa ukladá aj **do priečinka aplikácie** (`data/postup.json`). Každý deň sa robí záloha a uchováva sa posledných 14 dní. Pri prenose na iný počítač stačí skopírovať celý priečinok.

Na hlavnú obrazovku sa odkiaľkoľvek vrátite tlačidlom **🏠 Domov** v hornej lište.

Počas hry ostane na paneli úloh minimalizované okno *„Objavujem svet“*. To je server, nezatvárajte ho.
Tip: kliknite pravým na `Spustiť objavovanie.bat` → *Odoslať do → Pracovná plocha (vytvoriť odkaz)*.

Dá sa aj len dvojklikom na **`index.html`**. Aplikácia funguje rovnako, ale postup sa ukladá len v prehliadači.

Aplikácia na angličtinu (samostatný priečinok) a táto aplikácia sú **samostatné**. Každá má vlastnú pokladničku, postup a server (angličtina port 8765, objavovanie 8766), takže môžu bežať naraz.

## Oblasti a lekcie
**7 oblastí, 52 lekcií, vyše 1 000 otázok a kartičiek.** Každá oblasť končí veľkým opakovaním. Ďalšia lekcia sa odomkne po dokončení predchádzajúcej a oblasti sa dajú striedať podľa chuti.

| Oblasť | Lekcie |
|---|---|
| 🌍 **Cestovateľka** – zemepis | Moje Slovensko, Mapa Slovenska, Naši susedia, Svetadiely, Oceány, Krajiny Európy, Veľké krajiny sveta, Slávne miesta, *Veľká cesta* |
| 🌿 **Čarovná príroda** | Mamy a mláďatá, Kto kde býva?, Rastliny, Ročné obdobia, Zvieracia ríša, Ako rastieme, Triedime odpad, *Prírodná výprava* |
| 🚀 **Vesmír** | Planéty, Zem a Mesiac, Hviezdy, Astronauti, *Let do vesmíru* |
| ❤️ **Telo a zdravie** | Moje telo, Vnútri tela, Päť zmyslov, Zdravie, Na ceste, Keď treba pomoc (150, 155, 158, 112), *Zdravá hlavička* |
| 🔢 **Počtárska dielňa** | Sčítanie, Odčítanie, Do sto, Väčší či menší, Peniaze, Hodiny, Tvary, Násobilka, *Počtárska olympiáda* |
| 📖 **Kúzelné písmenká** – slovenčina | Abeceda, Samohlásky, Slabiky, Tvrdé a mäkké (y/i), Vety, Rozprávky, *Kúzelná kniha* |
| 💡 **Múdra hlavička** | Dni v týždni, Povolania, Hudobné nástroje, Dinosaury, Rekordy sveta, Poklady Slovenska, *Veľký kvíz* |

Obsah je mierne nad úroveň 2. ročníka: počty do 100, prvé násobky, hodiny so štvrťhodinami, hlavné mestá Európy a podobne.

## 25 typov hier
Spoznaj (kartičky), Nájdi obrázok, Ako sa to volá?, Kvíz, Pravda či nie?, Priraďovačka, Pexeso, Triedička (ťukanie alebo ťahanie do košíkov), Čo sem nepatrí?, Balóniky, Zoraď, Slabiky (spočítaj alebo poskladaj), **Nájdi na mape** (Slovensko s mestami a riekami, susedia, Európa, svet, svetadiely, oceány), **Nájdi na tele / v tele** (skutočná fotka postavy a realistický obrázok orgánov), **Nájdi vo vesmíre** (Slnečná sústava z fotiek NASA), Ukáž na rastline, Čo je na mape?, Spoj bodky (aj súhvezdia), Počítanie s číselníkom, Krokodíl (<, =, >), Obchodík (platenie mincami), Koľko je hodín? a Nastav hodiny, Číselná os, Doplň písmenko, Zavolaj pomoc (telefón), Hádaj nástroj (zvuky), Veľký kvíz (s pomocníkmi 50 : 50 a „Poraď mi“) a Mix otázok.

Pri chybe sa ukáže krátke vysvetlenie („Vedela si, že…“), takže sa dieťa učí aj z chýb. Každé ťuknutie má jemnú animáciu, správna odpoveď vybuchne ohňostrojom hviezdičiek.

**Skutočné fotky:** všetko, čo existuje v skutočnosti, je na fotke – zvieratá (aj mamy s mláďatami), rastliny, ovocie a zelenina, ročné obdobia, planéty a Mesiac, astronauti, hrady, mestá a hory Slovenska, slávne miesta sveta, hudobné nástroje, dinosaury (realistické rekonštrukcie), záchranári… Rozprávky, značky, mince a písmenká ostali kreslené.

**🔍 Zväčšenie:** fotku (aj vlajku alebo obrázok tela) s lupou 🔍 v rohu stačí ťuknúť a otvorí sa na celú obrazovku v plnej kvalite (`img/foto/velke`). Priblížiť sa dá tlačidlami ➕ ➖, dvojitým ťuknutím, dvoma prstami alebo kolieskom myši a posúvať ťahaním. V hrách sa pri zväčšení nezobrazuje názov, aby neprezradil odpoveď.

Na hlavnej obrazovke je každý deň nová zaujímavosť a v profile **Moja encyklopédia** so všetkými objavenými kartičkami.

## Odmeny (rovnaké ako v angličtine)
Dajú sa zmeniť v Rodičovskej zóne ⚙️:
- ★★★ = 0,50 €, ★★ = 0,20 €, ★ = 0,10 €, prezretie kartičiek 0,10 €
- celá lekcia +1 € a odznak, celá oblasť +2 €, trofej a diplom
- denný bonus 0,10 €
- tréning chybičiek 0,10 € za úlohu (najviac 3× denne)

Pri opakovaní úlohy sa vypláca len rozdiel, keď dieťa získa viac hviezdičiek. Ďalej sú tu špeciálne odznaky (séria dní, mapy, počty, znalosti, našetrené peniaze…), **obchod** s ozdobami k obrázku (korunky, prilby, rámčeky, kamaráti – líška, dinosaurus, papagáj…) a **diplomy** na vytlačenie za každú oblasť aj Veľký diplom za všetko. Diplomy tlačte *na šírku* so zapnutou *grafikou pozadia*.

### 💪 Tréning chybičiek
Aplikácia si pamätá otázky, s ktorými boli ťažkosti, a zopakuje ich v rozostupoch (o 1, 2, 4, 7 a 14 dní). Keď je čo opakovať, na hlavnej obrazovke sa objaví karta **Tréning chybičiek**.

## Rodičovská zóna
Otvára sa ikonou ⚙️ vpravo hore a je chránená príkladom z násobilky. Obsahuje:
- vyplácanie peňazí a históriu pokladničky
- výšku odmien a zapnutie alebo vypnutie obchodu
- meno dieťaťa
- výber slovenského hlasu, rýchlosť reči, čítanie otázok a pokynov nahlas, zvuky
- postup po oblastiach a zoznam vecí, ktoré idú ťažšie
- odomknutie všetkých lekcií
- export a import zálohy postupu, vymazanie postupu

## Hlas
Aplikácia číta otázky po slovensky (dá sa vypnúť). Najlepšie znejú hlasy **Microsoft Viktória / Lukáš Online (Natural)** v Edge, ktoré potrebujú internet. Bez internetu sa použije slovenský hlas z Windows, ak je nainštalovaný: *Nastavenia → Čas a jazyk → Reč → Pridať hlasy → slovenčina*. Keď slovenský hlas nie je nikde, aplikácia použije český, a ak nie je ani ten, jednoducho mlčí a všetko funguje aj bez neho.

## Prenos na iný počítač
- **Cez spúšťač:** skopírujte celý priečinok (aj s podpriečinkom `data`) a na novom PC spustite `Spustiť objavovanie.bat`.
- **Bez spúšťača:** Rodičovská zóna → **Exportovať postup**, na novom PC **Importovať zálohu**.

Ak Windows spúšťač zablokuje (niektoré firemné počítače zakazujú PowerShell skripty), použite `index.html`.

## Úpravy obsahu
Obsah je rozdelený podľa oblastí v súboroch `js/obsah-*.js` (zemepis, príroda, vesmír, telo, matematika, slovenčina, hlavička). Otázky, kartičky a zaujímavosti sa dajú pridávať bez programovania, stačí skopírovať existujúci riadok a zmeniť text. Obchod a odznaky sú v `js/data.js`.

Fotky (`img/foto`, zoznam v `js/foto-data.js`) pochádzajú z [Wikimedia Commons](https://commons.wikimedia.org) a sú pod voľnými licenciami (voľné dielo, CC0, CC BY, CC BY-SA). Autorov a licencie nájdete v Rodičovskej zóne → *Zdroje obrázkov*. Fotku v lekcii zmeníte tak, že v súbore `js/obsah-*.js` napíšete `p: 'foto:nazov'` a súbor `img/foto/nazov.jpg` doplníte aj do `js/foto-data.js`. Na zväčšenie slúži veľká verzia `img/foto/velke/nazov.jpg` (dlhšia strana do 1440 px) – jej rozmery sú v `js/foto-data.js` v poli `b`; fotka bez veľkej verzie sa dá priblížiť len trochu, aby nebola rozmazaná.

Mapy a vlajky pochádzajú z otvorených dát [Natural Earth](https://www.naturalearthdata.com/) (voľné dielo) a z kolekcie vlajok [flag-icons](https://github.com/lipis/flag-icons) (licencia MIT). Sú uložené priamo v aplikácii (`js/maps-data.js`, `img/flags`), internet na ne netreba.

## Zverejnenie na webe (GitHub Pages)
Webová verzia je v repozitári [lookAS88/objavujem-svet](https://github.com/lookAS88/objavujem-svet). Priečinok `data/` (postup dieťaťa a zálohy) sa na web nikdy nenahráva (`.gitignore`). Novú verziu odošlete dvojklikom na `Odoslat na GitHub.cmd` (zmeny musia byť predtým zapísané cez `git commit`). Pri každej novej verzii treba v `sw.js` zvýšiť číslo v `CACHE`, aby si tablety stiahli nové súbory (keď sa zmení niektorá veľká fotka v `img/foto/velke`, zvýšte aj `VELKE`); keď pribudne nový súbor v `js/`, doplňte ho aj do zoznamu `CORE` v `sw.js`.
