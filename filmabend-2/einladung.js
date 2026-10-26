/* ===== Einstellungen der Einladung – hier anpassen =====
   Gilt für die Einladung (index.html) und die Auswertung (auswertung.html). Nach dem Ändern speichern, committen, pushen. */
window.EINLADUNG = {
  titel: 'Filmabend',
  zusatz: 'Special Edition',
  tagline: 'Das Film- und Serienquiz',
  gastgeber: 'Chris',
  uhrzeit: 'ab 19:00 Uhr',
  ort: 'bei Chris',
  saal: 'Wohnzimmer',
  antwortBis: 'Sonntag, 1. November',
  // Mögliche Termine (Chris, 26.10.2026); im Menü steht die Kurzfassung
  termine: ['Fr 6.11.', 'Sa 7.11.', 'So 8.11.', 'Mo 9.11.', 'Di 10.11.', 'Mi 11.11.', 'Mi 18.11.', 'Di 24.11.', 'Mi 25.11.', 'Mo 30.11.'],
  termineKurz: '6.–11. · 18. · 24.–25. · 30. November',
  maxGenres: 3,
  kapitelZahl: 14,
  genres: [
    { name: 'Action & Blockbuster', satz: 'Explosionen inklusive', sym: '💥', f: ['#8a1a12', '#e3532a'] },
    { name: 'Animation', satz: 'Trickfilm, Pixar und Co.', sym: '🎨', f: ['#0b5c7a', '#24b3c9'] },
    { name: 'Horror', satz: 'Nicht allein gucken', sym: '🔪', f: ['#1a0a10', '#7a1023'] },
    { name: 'Science-Fiction', satz: 'Weit, weit weg', sym: '🚀', f: ['#101a5a', '#4b62d9'] },
    { name: 'Fantasy', satz: 'Drachen, Ringe, Zauberstäbe', sym: '🐉', f: ['#24412a', '#5a9a4b'] },
    { name: 'Komödie', satz: 'Lachen bis der Bauch wehtut', sym: '😂', f: ['#8a5a00', '#f5b62e'] },
    { name: 'Krimi & Thriller', satz: 'Wer war es?', sym: '🕵️', f: ['#1d2333', '#5a6886'] },
    { name: 'Romantik & Drama', satz: 'Taschentücher bereit', sym: '💔', f: ['#6b1240', '#d94b8a'] },
    { name: 'Superhelden', satz: 'Capes und Comics', sym: '🦸', f: ['#5a0f12', '#2a4bd9'] },
    { name: 'Serien-Klassiker', satz: 'Die großen Serien von früher', sym: '📺', f: ['#3a2a14', '#9a7240'] },
    { name: 'Neue Serien', satz: 'Was alle gerade streamen', sym: '🍿', f: ['#3b0f5a', '#9b3ad9'] },
    { name: 'Musik im Film', satz: 'Soundtracks und Musicals', sym: '🎵', f: ['#0f4a3a', '#2fc28f'] },
  ],
  // Szenenauswahl im Menü: nur die Namen – was genau passiert, bleibt eine Überraschung
  kapitel: ['Buzzer-Runde', 'Zitate', 'Schätzen', 'Bilder', 'Filmmusik', 'Großes Finale'],
};
