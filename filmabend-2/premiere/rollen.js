/* ===== Filmabend 2 · Rollen =====
   GEMEINSAME DATEI für die Einladung und das Spiel (Quizabend). Beide müssen exakt dieselbe Liste in derselben Reihenfolge
   und dieselbe Rechnung benutzen, sonst steht am 18.11. im Vorspann eine andere Rolle als in der Einladung.
   Nach dem Versand der Einladung NIE MEHR ÄNDERN (keine Rolle umbenennen, umsortieren, ergänzen oder streichen).

   Regel am Abend (im Spiel): Haben zwei Personen dieselbe Rolle, behält die erste (Reihenfolge der Spielerliste) sie
   unverändert, die zweite bekommt „<ROLLE> · DAS REMAKE“, ab der dritten „<ROLLE> · DAS REMAKE VOM REMAKE“.

   Gegenstück im Spiel: Quizabend/client/tv/film/dvd/plan.ts (ROLLEN, rollenSchluessel, rollenIndex). Der Test
   Quizabend/tests/rollen-einladung.test.ts lädt DIESE Datei und vergleicht Liste, Rechnung und Beispieltabelle.
   Auch die Namenslänge muss gleich bleiben: einladung.js maxNamenLaenge = NAME_MAX in Quizabend/shared/regeln.ts (16),
   sonst schneidet das Spiel einen langen Vornamen anders ab und es gibt eine andere Rolle. */
(function (ziel) {
  'use strict';

  const ROLLEN = [
    'IN DER HAUPTROLLE',
    'IN EINER GEFÄHRLICHEN DOPPELROLLE',
    'ALS DAS GENIE MIT DER FERNBEDIENUNG',
    'ALS DIE GEHEIMWAFFE',
    'IN EINER GASTROLLE, DIE ALLES VERÄNDERT',
    'ALS DAS POPCORN-ORAKEL',
    'ALS DIE STIMME AUS DEM OFF',
    'MIT DEM SCHNELLSTEN DAUMEN DER STADT',
    'ALS DER UNERWARTETE PLOT-TWIST',
    'ALS DAS PHANTOM DER VIDEOTHEK',
    'ALS DIE ÜBERRASCHUNG DES ABENDS',
    'UND ALS DAS GROSSE FRAGEZEICHEN',
    'ALS DIE FORTSETZUNG, DIE ALLE WOLLTEN',
    'MIT DER LIZENZ ZUM RATEN',
    'ALS DIE LETZTE HOFFNUNG DES SOFAS',
    'MIT DEM POKERFACE AUS STAHL',
    'ALS DAS STUNT-DOUBLE OHNE ANGST',
    'ALS DER CLIFFHANGER IN PERSON',
  ];

  // Schlüssel: nur der Vorname (erstes Wort), ohne Akzente, klein – „Max Mustermann“ und „max“ ergeben dieselbe Rolle
  function rollenSchluessel(name) {
    return ((name || '').trim().split(/\s+/)[0] || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }
  function rollenIndex(name, anzahl) {
    let s = 7;
    for (const c of rollenSchluessel(name)) s = (s * 31 + c.charCodeAt(0)) % 2147483647;
    s = (s * 48271) % 2147483647;
    return s % anzahl;
  }
  // Rolle = ROLLEN[rollenIndex(name, ROLLEN.length)]
  function rolleFuer(name) {
    return ROLLEN[rollenIndex(name, ROLLEN.length)];
  }

  /* Feste Beispieltabelle – GENAU DIESELBE steht im Spiel (tests/rollen-einladung.test.ts, TABELLE). Ändert sich hier eine Zeile,
     stimmt eine der beiden Seiten nicht mehr. In der Browser-Konsole: FILMABEND2_ROLLEN.selbsttest() → true */
  const BEISPIELE = [
    ['Max', 'ALS DAS GENIE MIT DER FERNBEDIENUNG'],
    ['max mustermann', 'ALS DAS GENIE MIT DER FERNBEDIENUNG'],
    ['  MAX  ', 'ALS DAS GENIE MIT DER FERNBEDIENUNG'],
    ['Erika', 'ALS DER UNERWARTETE PLOT-TWIST'],
    ['René', 'IN DER HAUPTROLLE'],
    ['Rene', 'IN DER HAUPTROLLE'],
    ['Zoë', 'ALS DIE ÜBERRASCHUNG DES ABENDS'],
    ['Jürgen', 'ALS DAS POPCORN-ORAKEL'],
    ['Anna', 'ALS DER CLIFFHANGER IN PERSON'],
    ['Tim', 'ALS DIE FORTSETZUNG, DIE ALLE WOLLTEN'],
    ['Lea', 'IN DER HAUPTROLLE'],
    ['Tom', 'IN DER HAUPTROLLE'],
    ['Sam', 'ALS DAS PHANTOM DER VIDEOTHEK'],
    ['Alex', 'ALS DER CLIFFHANGER IN PERSON'],
    ['Kim', 'ALS DIE GEHEIMWAFFE'],
    ['Robin', 'ALS DIE FORTSETZUNG, DIE ALLE WOLLTEN'],
    ['Chris', 'MIT DEM POKERFACE AUS STAHL'],
    ['', 'IN EINER GEFÄHRLICHEN DOPPELROLLE'],
  ];
  function selbsttest() {
    return BEISPIELE.every(([n, r]) => rolleFuer(n) === r);
  }

  const api = { ROLLEN, rollenSchluessel, rollenIndex, rolleFuer, BEISPIELE, selbsttest };
  ziel.FILMABEND2_ROLLEN = api;
  ziel.rolleFuer = rolleFuer;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
