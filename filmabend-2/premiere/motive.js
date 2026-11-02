/* ===== Filmabend 2 · Premiere: selbst gezeichnete Motive (SVG) =====
   11 Kapitel-Motive (Genre nur im Stil, keine echten Filme, Figuren oder Logos), Requisiten für den Steckbrief,
   Silhouette und Filmklappe. Jede Zeichnung bekommt eigene IDs, damit Verläufe auch mehrfach auf der Seite stimmen. */
(function () {
  'use strict';
  let zaehler = 0;
  const lin = (id, stopps, x1 = 0, y1 = 0, x2 = 0, y2 = 1) =>
    `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stopps.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</linearGradient>`;
  const rad = (id, stopps, cx = 0.5, cy = 0.5, r = 0.5) =>
    `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stopps.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</radialGradient>`;
  // feste Pseudo-Zufallszahl 0–1 (gleiches Bild auf jedem Handy)
  const zz = (i, s = 1) => { const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453; return x - Math.floor(x); };
  const sterne = (n, s, yMax = 100, farbe = '#fff') => Array.from({ length: n }, (_, i) =>
    `<circle cx="${(zz(i, s) * 160).toFixed(1)}" cy="${(zz(i, s + 1) * yMax).toFixed(1)}" r="${(0.3 + zz(i, s + 2) * 0.8).toFixed(2)}" fill="${farbe}" opacity="${(0.4 + zz(i, s + 3) * 0.6).toFixed(2)}"/>`).join('');
  const blitz = (x, y, r) => `<g transform="translate(${x} ${y})"><circle r="${r * 2.4}" fill="#fff" opacity=".18"/><circle r="${r * 1.2}" fill="#fff" opacity=".35"/>` +
    `<path d="M0 ${-r * 2.2}L${r * .35} ${-r * .35}L${r * 2.2} 0L${r * .35} ${r * .35}L0 ${r * 2.2}L${-r * .35} ${r * .35}L${-r * 2.2} 0L${-r * .35} ${-r * .35}Z" fill="#fff"/></g>`;

  /* Kapitel-Motive: [Farbe, Akzent, Zeichnung(id)] – Bühne 160 × 100 */
  const KAPITEL = [
    // 1 · Vorspann: roter Teppich, Blitzlichter
    ['#7a0f1f', '#ffd36b', id => `<defs>${lin(id + 'h', [[0, '#12020a'], [1, '#3d0614']])}${lin(id + 't', [[0, '#7a0a18'], [1, '#d11a33']])}${rad(id + 'g', [[0, '#ffd36b', .45], [1, '#ffd36b', 0]], .5, 0, .7)}</defs>
      <rect width="160" height="100" fill="url(#${id}h)"/><rect width="160" height="60" fill="url(#${id}g)"/>
      <path d="M60 0L66 46L94 46L100 0" fill="#fff" opacity=".05"/>
      <rect x="0" y="40" width="160" height="6" fill="#250308"/>
      <path d="M64 46L96 46L144 100L16 100Z" fill="url(#${id}t)"/><path d="M64 46L16 100M96 46L144 100" stroke="#ffd36b" stroke-width="1.2" opacity=".8"/>
      ${[[34, 58], [50, 48], [110, 48], [126, 58]].map(([x, y]) => `<rect x="${x - 1.6}" y="${y}" width="3.2" height="${(100 - y) * .45}" fill="#e8b45a"/><circle cx="${x}" cy="${y}" r="2.4" fill="#ffd36b"/>`).join('')}
      <path d="M34 60Q42 70 50 50M110 50Q118 70 126 60" stroke="#b3001b" stroke-width="2.4" fill="none"/>
      ${blitz(18, 26, 3.4)}${blitz(142, 20, 4)}${blitz(128, 40, 2.2)}${blitz(30, 46, 2.4)}${blitz(80, 14, 1.8)}`],
    // 2 · Western: Sonnenuntergang, Tafelberge, Kaktus
    ['#c2410c', '#ffb46a', id => `<defs>${lin(id + 'h', [[0, '#2a0f3a'], [.55, '#c2410c'], [1, '#f59e0b']])}${rad(id + 's', [[0, '#ffe29a'], [.6, '#ffb347'], [1, '#ff7a1a', 0]])}</defs>
      <rect width="160" height="100" fill="url(#${id}h)"/><circle cx="74" cy="70" r="34" fill="url(#${id}s)"/><circle cx="74" cy="70" r="15" fill="#ffe7a8"/>
      <path d="M0 74L14 74L19 57L42 57L47 74L96 74L101 63L124 63L128 74L160 74L160 100L0 100Z" fill="#4a1a33"/>
      <rect y="78" width="160" height="22" fill="#2a0d1c"/>
      <g fill="#14060d"><rect x="116" y="44" width="9" height="46" rx="4.5"/><rect x="104" y="56" width="7" height="18" rx="3.5"/><rect x="104" y="68" width="14" height="6" rx="3"/>
      <rect x="130" y="50" width="7" height="16" rx="3.5"/><rect x="123" y="61" width="14" height="6" rx="3"/><ellipse cx="120" cy="91" rx="16" ry="2"/></g>
      <circle cx="40" cy="88" r="4.5" fill="none" stroke="#14060d" stroke-width="1.2" stroke-dasharray="2 1.5"/>`],
    // 3 · Science-Fiction: Mutterschiff über der Stadt
    ['#0b2a5a', '#7ff3ff', id => `<defs>${lin(id + 'h', [[0, '#020617'], [1, '#0b2a5a']])}${lin(id + 'b', [[0, '#7ff3ff', .55], [1, '#7ff3ff', 0]])}${lin(id + 'r', [[0, '#3a4a6a'], [1, '#0a1428']])}</defs>
      <rect width="160" height="100" fill="url(#${id}h)"/>${sterne(40, 3, 70)}
      <path d="M68 40L92 40L122 100L38 100Z" fill="url(#${id}b)"/>
      <ellipse cx="80" cy="32" rx="66" ry="12" fill="url(#${id}r)"/><ellipse cx="80" cy="27" rx="22" ry="7" fill="#1b2b4a"/>
      <path d="M14 32Q80 46 146 32" stroke="#7ff3ff" stroke-width=".8" fill="none" opacity=".7"/>
      ${Array.from({ length: 11 }, (_, i) => `<circle cx="${30 + i * 10}" cy="${36 + Math.sin(i / 10 * Math.PI) * 3}" r="1.3" fill="#bff9ff"/>`).join('')}
      <path d="M0 100L0 84L8 84L8 78L16 78L16 88L26 88L26 80L32 80L32 90L132 90L132 82L140 82L140 76L148 76L148 86L160 86L160 100Z" fill="#030a18"/>`],
    // 4 · Agenten-Thriller: Fadenkreuz über der Stadt
    ['#1c2333', '#e3263f', id => `<defs>${lin(id + 'h', [[0, '#05070d'], [1, '#1c2333']])}</defs>
      <rect width="160" height="100" fill="url(#${id}h)"/>
      <path d="M0 100L0 60L12 60L12 48L22 48L22 64L34 64L34 40L46 40L46 58L58 58L58 50L70 50L70 66L96 66L96 44L106 44L106 36L114 36L114 56L126 56L126 46L138 46L138 62L150 62L150 54L160 54L160 100Z" fill="#0a0e18"/>
      ${Array.from({ length: 26 }, (_, i) => `<rect x="${(4 + zz(i, 9) * 150).toFixed(0)}" y="${(52 + zz(i, 11) * 40).toFixed(0)}" width="2" height="2.6" fill="#9fb4d8" opacity=".55"/>`).join('')}
      ${Array.from({ length: 12 }, (_, i) => `<rect y="${i * 8.5}" width="160" height=".5" fill="#9fd2ff" opacity=".06"/>`).join('')}
      <g stroke="#e3263f" fill="none" stroke-width="1.6"><circle cx="86" cy="46" r="24"/><circle cx="86" cy="46" r="15" stroke-width=".7" opacity=".7"/>
      <path d="M86 16V36M86 56V76M56 46H76M96 46H116"/></g><circle cx="86" cy="46" r="2.2" fill="#ff3b4f"/>
      <text x="10" y="14" fill="#e3263f" font-family="Oswald,sans-serif" font-size="6" letter-spacing="1">ZIEL ERFASST · 00:47</text>`],
    // 5 · Kellerclub: Glühbirne, Ziegelwand
    ['#5a3a1a', '#ffd36b', id => `<defs>${rad(id + 'l', [[0, '#ffe9a8', .55], [1, '#ffb347', 0]], .5, .1, .9)}<pattern id="${id}z" width="20" height="10" patternUnits="userSpaceOnUse"><rect width="20" height="10" fill="#2a170d"/><path d="M0 10H20M0 5H20M10 0V5M0 5V10M20 5V10" stroke="#120904" stroke-width="1"/></pattern></defs>
      <rect width="160" height="100" fill="url(#${id}z)"/><rect width="160" height="100" fill="#000" opacity=".35"/>
      <path d="M72 42L88 42L158 100L2 100Z" fill="url(#${id}l)"/>
      <rect y="86" width="160" height="14" fill="#140a05" opacity=".8"/>
      <path d="M80 0V30" stroke="#0a0604" stroke-width="1.4"/><rect x="76" y="29" width="8" height="6" fill="#3a2a1a"/>
      <circle cx="80" cy="41" r="16" fill="#ffd36b" opacity=".18"/><circle cx="80" cy="41" r="7.5" fill="#fff1c4"/>
      <path d="M77 41Q80 37 83 41" stroke="#c98a2a" stroke-width=".8" fill="none"/>
      <g fill="#0b0604"><rect x="40" y="74" width="16" height="3"/><rect x="41" y="77" width="2" height="12"/><rect x="53" y="77" width="2" height="12"/><rect x="41" y="62" width="2" height="12"/></g>`],
    // 6 · Fantasy-Epos: Drache vor dem Mond, Burg
    ['#3a1020', '#ff6a3d', id => `<defs>${lin(id + 'h', [[0, '#0b0f1a'], [1, '#4a1424']])}${rad(id + 'm', [[0, '#fff6e0'], [.7, '#e8d9b8'], [1, '#e8d9b8', 0]])}</defs>
      <rect width="160" height="100" fill="url(#${id}h)"/>${sterne(26, 6, 60)}<circle cx="104" cy="34" r="26" fill="url(#${id}m)"/>
      <g fill="#0a0508"><path d="M98 36L82 10L91 22L87 6L106 32Z"/><path d="M106 36L124 8L119 22L132 13L113 39Z"/>
      <ellipse cx="102" cy="38" rx="12" ry="4.5" transform="rotate(-12 102 38)"/><path d="M110 34Q120 26 128 27L135 26L130 31Q121 31 113 38Z"/></g>
      <path d="M91 40Q76 47 68 42Q62 38 57 43" stroke="#0a0508" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path d="M135 28Q146 30 152 36" stroke="#ff6a3d" stroke-width="2.4" fill="none" opacity=".85" stroke-linecap="round"/>
      <path d="M0 100L0 76L8 76L8 72L12 72L12 76L16 76L16 64L20 60L24 64L24 76L44 76L44 70L48 70L48 74L52 74L52 70L56 70L56 82L110 82L110 72L114 72L114 76L118 76L118 58L123 52L128 58L128 76L134 76L134 70L138 70L138 76L160 76L160 100Z" fill="#06040a"/>
      ${Array.from({ length: 14 }, (_, i) => `<circle cx="${(zz(i, 21) * 160).toFixed(0)}" cy="${(60 + zz(i, 22) * 36).toFixed(0)}" r=".8" fill="#ff8a3d" opacity="${(.4 + zz(i, 23) * .6).toFixed(2)}"/>`).join('')}`],
    // 7 · Sitcom: Sofa, Fenster, Applaus-Schild
    ['#5b2a7a', '#ffd23f', id => `<defs>${lin(id + 'h', [[0, '#3b1f5a'], [1, '#6b2f88']])}${lin(id + 's', [[0, '#f08a3a'], [1, '#c4561a']])}</defs>
      <rect width="160" height="100" fill="url(#${id}h)"/><rect y="80" width="160" height="20" fill="#2a1630"/>
      <rect x="14" y="20" width="34" height="30" fill="#7fb8e8"/><path d="M14 40L22 34L28 38L36 30L48 36L48 50L14 50Z" fill="#3a5a8a"/><rect x="14" y="20" width="34" height="30" fill="none" stroke="#f3e6d0" stroke-width="2.5"/><path d="M31 20V50M14 35H48" stroke="#f3e6d0" stroke-width="1.5"/>
      <rect x="60" y="8" width="40" height="12" rx="2" fill="#2a0a0a"/><rect x="61.5" y="9.5" width="37" height="9" rx="1.5" fill="#e3263f"/><text x="80" y="16.6" text-anchor="middle" fill="#fff" font-family="Oswald,sans-serif" font-size="6.4" letter-spacing=".8">APPLAUS</text>
      <rect x="66" y="26" width="28" height="20" fill="#2a1630" stroke="#ffd23f" stroke-width="1.5"/><circle cx="80" cy="36" r="5" fill="#ffd23f" opacity=".6"/>
      <rect x="42" y="54" width="76" height="18" rx="6" fill="url(#${id}s)"/><rect x="36" y="66" width="88" height="13" rx="4" fill="#e0742a"/>
      <rect x="30" y="58" width="14" height="22" rx="5" fill="#c4561a"/><rect x="116" y="58" width="14" height="22" rx="5" fill="#c4561a"/>
      <path d="M67 56V71M93 56V71" stroke="#a8461a" stroke-width="1.2"/><rect x="38" y="79" width="3" height="5" fill="#1a0a10"/><rect x="119" y="79" width="3" height="5" fill="#1a0a10"/>
      <path d="M142 30V82" stroke="#1a0a10" stroke-width="1.6"/><path d="M134 30L150 30L146 18L138 18Z" fill="#ffd23f"/><ellipse cx="142" cy="31" rx="12" ry="5" fill="#ffd23f" opacity=".25"/>`],
    // 8 · Coup: Gemälde im Museum, Laserstrahlen
    ['#123a33', '#e8b45a', id => `<defs>${lin(id + 'h', [[0, '#071613'], [1, '#123a33']])}${lin(id + 'r', [[0, '#ffe08a'], [.5, '#b8862a'], [1, '#ffd36b']], 0, 0, 1, 1)}${lin(id + 'l', [[0, '#fff6d0', .35], [1, '#fff6d0', 0]])}</defs>
      <rect width="160" height="100" fill="url(#${id}h)"/><rect y="82" width="160" height="18" fill="#05100e"/>
      <path d="M66 0L94 0L118 86L42 86Z" fill="url(#${id}l)"/>
      <rect x="54" y="18" width="52" height="44" fill="url(#${id}r)"/><rect x="59" y="23" width="42" height="34" fill="#f1e4c4"/>
      <path d="M59 23L82 23L72 57L59 57Z" fill="#3a6ab8"/><path d="M82 23L101 23L101 44L86 57L72 57Z" fill="#d9a23a"/><path d="M76 36L92 30L94 48L80 52Z" fill="#c4361a" opacity=".9"/>
      <circle cx="73" cy="34" r="3.2" fill="#fff"/><circle cx="73" cy="34" r="1.5" fill="#111"/><path d="M86 40l5 -3v6z" fill="#111"/><circle cx="89" cy="31" r="2.4" fill="#111"/><path d="M76 50Q82 46 88 50" stroke="#111" stroke-width="1.4" fill="none"/>
      <g stroke="#ff2d3d" stroke-width=".9" opacity=".9"><path d="M0 70L160 54"/><path d="M0 58L160 78"/><path d="M0 88L160 66"/></g>
      <g stroke="#ff2d3d" stroke-width="3" opacity=".18"><path d="M0 70L160 54"/><path d="M0 58L160 78"/><path d="M0 88L160 66"/></g>
      <path d="M40 84Q80 96 120 84" stroke="#8a1020" stroke-width="2.2" fill="none"/><rect x="38" y="76" width="3" height="12" fill="#e8b45a"/><rect x="119" y="76" width="3" height="12" fill="#e8b45a"/>`],
    // 9 · Piraten: Schatzkarte auf dem Meer
    ['#0b6a7a', '#ffd36b', id => `<defs>${lin(id + 'h', [[0, '#032536'], [1, '#0b6a7a']])}${lin(id + 'p', [[0, '#f3e1b0'], [1, '#d9b878']], 0, 0, 1, 1)}</defs>
      <rect width="160" height="100" fill="url(#${id}h)"/>
      ${Array.from({ length: 9 }, (_, i) => `<path d="M${-10 + (i % 3) * 60} ${12 + i * 10}q8 -4 16 0t16 0" stroke="#7fe7ff" stroke-width=".8" fill="none" opacity=".35"/>`).join('')}
      <g transform="rotate(-6 80 50)"><path d="M28 18L134 14L136 22L132 32L137 46L133 62L136 80L28 86L24 74L29 60L23 44L28 30Z" fill="url(#${id}p)" stroke="#8a6a30" stroke-width="1"/>
      <path d="M44 34Q58 24 70 32Q80 40 70 52Q56 58 46 50Q38 42 44 34Z" fill="#9ab86a" stroke="#6a7a3a" stroke-width=".8"/>
      <path d="M92 52Q104 44 116 52Q122 62 110 68Q98 70 92 62Z" fill="#9ab86a" stroke="#6a7a3a" stroke-width=".8"/>
      <path d="M62 44Q80 40 86 50Q92 60 104 58" stroke="#7a2a12" stroke-width="1.4" stroke-dasharray="2.5 2" fill="none"/>
      <path d="M100 52L110 62M110 52L100 62" stroke="#c4161a" stroke-width="2.6" stroke-linecap="round"/>
      <g transform="translate(118 30)"><circle r="7" fill="none" stroke="#7a5a22" stroke-width=".8"/><path d="M0 -9L2 0L0 9L-2 0Z" fill="#7a2a12"/><path d="M-9 0L0 2L9 0L0 -2Z" fill="#7a5a22"/></g></g>`],
    // 10 · Gerichtsdrama: Richterhammer, Holzvertäfelung
    ['#5a3414', '#e8b45a', id => `<defs>${lin(id + 'h', [[0, '#1e1006'], [1, '#5a3414']])}${lin(id + 'k', [[0, '#a8682a'], [1, '#5a3010']])}</defs>
      <rect width="160" height="100" fill="url(#${id}h)"/>
      ${Array.from({ length: 8 }, (_, i) => `<rect x="${i * 20 + 3}" y="6" width="14" height="60" rx="1" fill="none" stroke="#7a4a1d" stroke-width=".8" opacity=".6"/>`).join('')}
      <g transform="translate(80 26)" stroke="#e8b45a" stroke-width="1.1" fill="none" opacity=".8"><path d="M0 -14V12M-18 -8H18"/><path d="M-18 -8L-24 4H-12Z"/><path d="M18 -8L12 4H24Z"/><path d="M-8 12H8"/></g>
      <rect y="70" width="160" height="30" fill="#3a1e08"/><rect y="70" width="160" height="2.5" fill="#8a5a24"/>
      <ellipse cx="96" cy="74" rx="20" ry="4.5" fill="#2a1406"/><rect x="76" y="66" width="40" height="8" rx="3" fill="url(#${id}k)"/>
      <g transform="rotate(-28 70 52)"><rect x="40" y="49" width="46" height="5" rx="2.5" fill="url(#${id}k)"/><rect x="82" y="40" width="14" height="23" rx="3" fill="#7a4518"/><rect x="85" y="40" width="2.5" height="23" fill="#e8b45a"/><rect x="90.5" y="40" width="2.5" height="23" fill="#e8b45a"/></g>
      <g stroke="#ffd36b" stroke-width="1.2" opacity=".7"><path d="M114 56L122 50M116 62L126 60M112 50L116 42"/></g>`],
    // 11 · Superhelden-Finale: Schild mit Blitz, Energiestrahlen
    ['#b3001b', '#ff3b3b', id => `<defs>${lin(id + 'h', [[0, '#1a0003'], [.6, '#5a0010'], [1, '#b3001b']])}${lin(id + 's', [[0, '#f4f6fb'], [.45, '#a9b4cc'], [.55, '#ffd36b'], [1, '#b8862a']], 0, 0, 1, 1)}${rad(id + 'g', [[0, '#ffb347', .7], [1, '#ff2d3d', 0]])}</defs>
      <rect width="160" height="100" fill="url(#${id}h)"/><circle cx="80" cy="48" r="60" fill="url(#${id}g)"/>
      ${Array.from({ length: 14 }, (_, i) => { const w = i / 14 * Math.PI * 2; return `<path d="M80 48L${(80 + Math.cos(w) * 120).toFixed(0)} ${(48 + Math.sin(w) * 120).toFixed(0)}L${(80 + Math.cos(w + .1) * 120).toFixed(0)} ${(48 + Math.sin(w + .1) * 120).toFixed(0)}Z" fill="#ffd36b" opacity=".12"/>`; }).join('')}
      <path d="M80 12L108 21Q108 58 80 84Q52 58 52 21Z" fill="url(#${id}s)" stroke="#3a0006" stroke-width="1.5"/>
      <path d="M80 18L102 25Q101 55 80 77Q59 55 58 25Z" fill="#7a0010"/>
      <path d="M86 26L70 52L80 52L74 72L92 42L82 42L88 26Z" fill="#ffd36b" stroke="#fff3c4" stroke-width=".6"/>
      <path d="M62 30L68 36L66 42M98 60L92 56L94 50" stroke="#2a0004" stroke-width=".8" fill="none"/>
      ${Array.from({ length: 18 }, (_, i) => `<circle cx="${(zz(i, 31) * 160).toFixed(0)}" cy="${(zz(i, 32) * 100).toFixed(0)}" r="${(.5 + zz(i, 33)).toFixed(1)}" fill="#ffd36b" opacity="${(.3 + zz(i, 34) * .6).toFixed(2)}"/>`).join('')}`],
  ];

  function kapitelMotiv(i, klasse = '') {
    const id = 'm' + (++zaehler) + 'k' + i;
    return `<svg class="motiv ${klasse}" viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${KAPITEL[i][2](id)}</svg>`;
  }
  const kapitelFarbe = i => KAPITEL[i][0];
  const kapitelAkzent = i => KAPITEL[i][1];

  /* Requisiten (64 × 64, Strich in currentColor) */
  const R = {
    scheinwerfer: '<path d="M18 58L26 38L34 58M26 38V30"/><rect x="14" y="16" width="22" height="16" rx="4" transform="rotate(-20 25 24)"/><path d="M38 14L60 6M40 22L62 22M38 30L58 38" stroke-dasharray="3 3"/>',
    sonnenbrille: '<path d="M6 26H58"/><path d="M8 26Q8 42 20 42Q30 42 30 28Z" class="voll"/><path d="M34 28Q34 42 44 42Q56 42 56 26Z" class="voll"/><path d="M30 28Q32 25 34 28"/><path d="M6 26L2 22M58 26L62 22"/>',
    fernbedienung: '<rect x="22" y="6" width="20" height="52" rx="6"/><circle cx="32" cy="16" r="3.5" class="voll"/><circle cx="27" cy="27" r="2"/><circle cx="37" cy="27" r="2"/><circle cx="27" cy="35" r="2"/><circle cx="37" cy="35" r="2"/><path d="M27 45H37M27 50H37"/>',
    koffer: '<rect x="8" y="20" width="48" height="34" rx="4"/><path d="M24 20V14Q24 10 28 10H36Q40 10 40 14V20M8 34H56"/><rect x="24" y="30" width="16" height="9" rx="1.5" class="voll"/>',
    ausweis: '<rect x="12" y="14" width="40" height="44" rx="4"/><path d="M26 14V8H38V14"/><rect x="18" y="22" width="12" height="14" rx="1"/><path d="M34 24H46M34 30H44M18 42H46M18 48H40"/>',
    popcorn: '<path d="M16 26L22 60H42L48 26Z"/><path d="M24 26L28 60M32 26V60M40 26L36 60"/><circle cx="20" cy="22" r="5"/><circle cx="29" cy="17" r="6"/><circle cx="39" cy="18" r="5.5"/><circle cx="46" cy="23" r="4.5"/><circle cx="33" cy="25" r="4"/>',
    mikrofon: '<rect x="23" y="6" width="18" height="28" rx="9"/><path d="M23 16H41M23 22H41"/><path d="M16 28Q16 42 32 42Q48 42 48 28M32 42V56M22 58H42"/>',
    schweissband: '<ellipse cx="32" cy="32" rx="22" ry="12"/><ellipse cx="32" cy="32" rx="14" ry="6"/><path d="M32 18L34 23H39L35 26L37 31L32 28L27 31L29 26L25 23H30Z" class="voll" transform="translate(0 -6) scale(1)"/>',
    umschlag: '<rect x="6" y="16" width="52" height="34" rx="2"/><path d="M6 18L32 36L58 18"/><circle cx="32" cy="36" r="5" class="voll"/><path d="M10 46H24"/>',
    kassette: '<rect x="6" y="16" width="52" height="32" rx="3"/><rect x="16" y="22" width="32" height="14" rx="2"/><circle cx="24" cy="29" r="4"/><circle cx="40" cy="29" r="4"/><path d="M14 48L18 42H46L50 48"/>',
    konfetti: '<path d="M10 54L36 28L44 36L18 62Z"/><path d="M36 28L44 36"/><path d="M46 10L48 16M54 22L60 20M52 8L56 4M40 14L38 8M58 32L62 36"/><rect x="48" y="26" width="4" height="4" class="voll" transform="rotate(30 50 28)"/><circle cx="44" cy="20" r="2" class="voll"/>',
    notizblock: '<rect x="12" y="10" width="40" height="48" rx="3"/><path d="M18 6V14M26 6V14M34 6V14M42 6V14"/><path d="M20 26Q30 20 34 30T46 28M44 24L46 28L42 30"/><path d="M22 46Q28 38 38 44M36 40L38 44L34 46"/>',
    zwei: '<path d="M14 12H50M14 52H50M24 12V52M40 12V52"/><path d="M14 12V16M50 12V16M14 52V48M50 52V48"/>',
    fliege: '<path d="M6 16L20 22L6 28Z" class="voll"/><path d="M34 16L20 22L34 28Z" class="voll"/><circle cx="20" cy="22" r="2.5"/><path d="M38 28H62L50 42Z"/><path d="M50 42V56M42 58H58M56 30L60 24"/><circle cx="60" cy="22" r="2" class="voll"/>',
    umhang: '<path d="M20 10Q32 16 44 10L54 56Q32 48 10 56Z"/><path d="M20 10Q32 22 44 10"/><path d="M26 22L22 50M38 22L42 50"/>',
    karten: '<rect x="10" y="16" width="22" height="32" rx="3" transform="rotate(-18 21 32)"/><rect x="22" y="12" width="22" height="32" rx="3"/><rect x="34" y="16" width="22" height="32" rx="3" transform="rotate(18 45 32)"/><path d="M33 22L36 28L33 34L30 28Z" class="voll"/>',
    pflaster: '<rect x="8" y="22" width="48" height="20" rx="10" transform="rotate(-25 32 32)"/><rect x="22" y="24" width="20" height="16" rx="2" transform="rotate(-25 32 32)"/><path d="M32 24L34 29H39L35 32L37 37L32 34L27 37L29 32L25 29H30Z" class="voll"/>',
    seil: '<path d="M2 30H14L18 60M62 30H50L46 60"/><path d="M14 30Q32 46 50 30"/><circle cx="32" cy="34" r="3" class="voll"/><path d="M32 37V44M28 40H36M32 44L29 50M32 44L35 50"/>',
    megafon: '<path d="M12 26V38L44 52V12Z"/><path d="M44 12Q52 32 44 52"/><path d="M20 38L24 52H30L28 41"/><path d="M52 22L58 18M54 32H60M52 42L58 46"/>',
  };
  function requisite(name) {
    return `<svg class="requisite" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${R[name] || R.scheinwerfer}</g></svg>`;
  }

  /* Silhouette für die Besetzungsliste */
  function silhouette() {
    const id = 's' + (++zaehler);
    return `<svg class="silhouette" viewBox="0 0 100 120" aria-hidden="true" focusable="false"><defs>${rad(id, [[0, '#9fd2ff', .35], [1, '#9fd2ff', 0]], .5, .35, .6)}</defs>
      <rect width="100" height="120" fill="url(#${id})"/><circle cx="50" cy="44" r="17" fill="#050b1e"/><path d="M14 120Q14 72 50 70Q86 72 86 120Z" fill="#050b1e"/>
      <text x="50" y="52" text-anchor="middle" fill="#2f5296" font-family="Cinzel,serif" font-size="18" font-weight="700">?</text></svg>`;
  }

  /* Fotofeld des Passes: Scheinwerferkegel, Filmklappe, Anfangsbuchstabe */
  function fotofeld(buchstabe) {
    const id = 'f' + (++zaehler);
    const b = String(buchstabe || '?').replace(/[&<>"]/g, '');
    return `<svg class="fotofeld" viewBox="0 0 100 120" aria-hidden="true" focusable="false"><defs>${lin(id + 'k', [[0, '#fff6d0', .75], [1, '#fff6d0', 0]])}${lin(id + 'h', [[0, '#0c1a3d'], [1, '#02040c']])}</defs>
      <rect width="100" height="120" fill="url(#${id}h)"/><path d="M42 0L58 0L92 120L8 120Z" fill="url(#${id}k)"/><ellipse cx="50" cy="112" rx="40" ry="6" fill="#fff6d0" opacity=".25"/>
      <g transform="translate(22 60)"><rect y="12" width="56" height="34" rx="2" fill="#111"/><g transform="rotate(-14)"><rect width="56" height="10" fill="#111"/>
      ${[0, 1, 2, 3].map(i => `<path d="M${4 + i * 14} 0L${12 + i * 14} 0L${6 + i * 14} 10L${-2 + i * 14} 10Z" fill="#f3f7ff"/>`).join('')}</g>
      ${[0, 1, 2, 3].map(i => `<path d="M${4 + i * 14} 12L${12 + i * 14} 12L${6 + i * 14} 18L${-2 + i * 14} 18Z" fill="#f3f7ff"/>`).join('')}
      <text x="28" y="42" text-anchor="middle" fill="#ffd36b" font-family="Cinzel,serif" font-weight="700" font-size="22">${b}</text></g></svg>`;
  }

  window.MOTIVE = { kapitelMotiv, kapitelFarbe, kapitelAkzent, requisite, silhouette, fotofeld, anzahl: KAPITEL.length };
})();
