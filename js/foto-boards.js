/* Fotky tela a orgánov pre hry „Nájdi na tele“ (zdroje: pozri credit) */
const PHOTO_BOARDS = {
  body: {
    // skutočná fotka dievčatka (6 r.), spredu; orezaná a zmenšená z originálu
    w: 520, h: 1000, photo: 'telo.jpg', big: true, bg: '#ffffff',   // big: ostrá verzia v img/foto/velke na zväčšenie
    names: { hlava: 'hlava', krk: 'krk', rameno: 'rameno', hrudnik: 'hrudník', brucho: 'brucho', laket: 'lakeť', dlan: 'dlaň', koleno: 'koleno', chodidlo: 'chodidlo', paza: 'ruka', noha: 'noha', vlasy: 'vlasy' },
    // poradie kľúčov = poradie kreslenia: veľké oblasti prvé, malé navrch (vyhrajú ťuknutie)
    shapes: {
      paza: [
        ['p', '165,258 200,252 178,300 172,420 174,560 180,628 126,628 114,540 116,460 122,380 132,320 148,278'],
        ['p', '330,250 365,258 385,278 398,330 403,400 405,470 403,540 398,628 346,628 352,560 352,420 350,300'],
      ],
      noha: [
        ['p', '176,596 274,596 274,720 272,845 262,862 200,862 190,830 182,720'],
        ['p', '274,596 349,596 347,700 342,780 338,845 326,862 274,862 276,720'],
      ],
      hrudnik: [['p', '175,300 185,272 215,256 245,250 295,250 330,256 353,272 352,300 352,428 173,428']],
      brucho: [['p', '173,428 352,428 353,470 355,530 352,570 350,598 176,598 173,570 172,500']],
      krk: [['e', 266, 241, 30, 20]],
      hlava: [['e', 262, 140, 60, 86]],            // celá hlava aj s vlasmi na temene
      vlasy: [                                        // len dlhé pramene vedľa krku (temeno patrí k hlave)
        ['p', '193,168 208,170 212,190 216,235 222,262 206,274 196,245 190,200'],
        ['p', '316,168 330,172 338,190 348,230 360,268 334,272 320,240 315,200'],
      ],
      rameno: [['e', 176, 285, 27, 25], ['e', 368, 287, 27, 25]],
      laket: [['e', 145, 435, 27, 32], ['e', 377, 435, 27, 32]],
      dlan: [['e', 153, 591, 25, 34], ['e', 371, 591, 25, 34]],
      koleno: [['e', 231, 722, 34, 36], ['e', 309, 722, 33, 36]],
      chodidlo: [['e', 231, 900, 37, 51], ['e', 296, 900, 33, 51]],
    },
    credit: { author: 'MIKI Yoshihito', license: 'CC BY 2.0', licenseUrl: 'https://creativecommons.org/licenses/by/2.0/', page: 'https://commons.wikimedia.org/wiki/File:SAKURAKO_-_le_coq_sportif._(17265789065).jpg', title: 'SAKURAKO - le coq sportif. (17265789065).jpg' },
  },
  organs: {
    // anatomická ilustrácia; upravené: odstránené popisy, kostra, svaly a cievy, orezané
    w: 700, h: 955, photo: 'organy.jpg', big: true, bg: '#ffffff', zoomPic: true,   // zoomPic: kartičky ukážu priblížený orgán
    names: { mozog: 'mozog', srdce: 'srdce', pluca: 'pľúca', zaludok: 'žalúdok', creva: 'črevá', pecen: 'pečeň' },
    shapes: {
      pecen: [['p', '273,546 245,558 237,564 232,576 230,654 233,672 243,672 255,666 287,660 310,642 352,636 371,624 370,606 350,576 377,570 379,564 323,552']],
      mozog: [['e', 347, 85, 76, 58]],
      pluca: [
        ['p', '308,354 273,390 254,426 246,450 233,528 233,558 244,558 272,546 313,540 302,516 300,492 306,462 307,390 319,378 306,366 328,360'],
        ['p', '385,352 400,356 428,396 444,426 455,462 462,510 463,576 457,576 437,552 410,540 403,510 377,474 375,462 379,438 372,402 378,378 372,362'],
      ],
      srdce: [['p', '307,372 322,378 340,392 362,388 380,372 393,362 373,390 371,408 378,438 374,462 376,474 402,510 409,540 406,552 385,558 349,558 324,552 310,534 303,516 301,492 307,462 308,390']],
      zaludok: [['p', '409,546 407,552 353,564 351,576 371,606 370,642 314,648 306,672 306,684 314,702 382,708 408,702 432,690 441,678 459,636 463,606 456,576 444,558']],
      creva: [['p', '212,702 244,672 288,660 305,662 308,690 318,706 382,712 410,704 434,690 446,676 460,680 476,698 486,720 487,786 476,816 441,864 403,906 387,918 364,912 357,900 277,888 226,828 212,798']],
    },
    credit: { author: 'Mikael Häggström', license: 'Public domain', licenseUrl: 'https://creativecommons.org/publicdomain/mark/1.0/', page: 'https://commons.wikimedia.org/wiki/File:Internal_organs.svg', title: 'Internal organs.svg' },
  },
};
