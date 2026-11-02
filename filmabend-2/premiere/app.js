/* ===== Filmabend 2 · Premiere-Einladung: Ablauf =====
   Einlass → Gästelisten-Check → Studiologo → Trailer → Titelkarte → Freigabe → Starring → Steckbrief → DVD-Menü.
   Texte stehen in einladung.js, die Rollen in rollen.js, Zeichnungen in motive.js, Klänge in ton.js.
   Nichts wird gesendet: Name, Geheimnisse und „gesichtet“ liegen nur in localStorage auf diesem Handy.
   Zum Testen: ?name=Max (zeigt sofort den Steckbrief, speichert nichts), ?name=Max&ab=starring (Einlass, dann ab dieser
   Szene: logo, trailer, titel, freigabe, starring, akte, menue, kapitel, besetzung, bonus, pass), ?jetzt=2026-11-18T18:59:30
   Tür-Ritual am Abend (Pass entwerten): ?jetzt=2026-11-18T18:55, dann Backstage-Pass. Ein Stempel aus einer Probezeit gilt nur,
   solange ?jetzt= in der Adresse steht, und nie am echten Abend. */
(function () {
  'use strict';
  const E = window.EINLADUNG, R = window.FILMABEND2_ROLLEN, M = window.MOTIVE, TON = window.TON, K = window.KLANG;
  const $ = id => document.getElementById(id);
  const warte = ms => new Promise(r => setTimeout(r, ms));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const ruhig = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const beruehrung = window.matchMedia && matchMedia('(pointer: coarse)').matches;
  const pfad = (o, p) => p.split('.').reduce((x, k) => (x == null ? x : x[k]), o);
  const p2 = n => String(n).padStart(2, '0');
  const TRAILER_SEK = 43;

  document.querySelectorAll('[data-text]').forEach(el => { const v = pfad(E, el.dataset.text); if (typeof v === 'string') el.textContent = v; });
  // Infozeile: Wann und Wo in zwei Gruppen, die nie mitten im Ort umbrechen (schmal: zwei Zeilen ohne Trenner am Zeilenanfang)
  document.querySelectorAll('.infozeile').forEach(el => {
    const t = E.infozeile.split(' · ');
    el.innerHTML = t.length < 2 ? esc(E.infozeile)
      : `<span class="nw">${esc(t.slice(0, -1).join(' · '))}</span><span class="trenner"> · </span><span class="nw">${esc(t[t.length - 1])}</span>`;
  });

  /* ---------- Zustand (nur auf diesem Handy) ---------- */
  const SPEICHER = 'filmabend2-premiere';
  const S = { name: '', test: false, regie: false, geheim: new Set(), gesichtet: new Set(), unterschrieben: false, stumm: false, entwertet: null };
  try {
    const d = JSON.parse(localStorage.getItem(SPEICHER) || 'null');
    if (d && typeof d === 'object') {
      if (typeof d.name === 'string') S.name = saeubern(d.name).slice(0, 40);
      (Array.isArray(d.geheim) ? d.geheim : []).forEach(g => { if (E.geheimnisse.liste.some(([id]) => id === g)) S.geheim.add(g); });
      (Array.isArray(d.gesichtet) ? d.gesichtet : []).forEach(i => { if (Number.isInteger(i) && i >= 0 && i < E.kapitel.length) S.gesichtet.add(i); });
      S.unterschrieben = !!d.unterschrieben; S.stumm = !!d.stumm; S.regie = !!d.regie;
      const ew = d.entwertet; // Tür-Ritual: { zeit: '19:04', ms, probe } – ob er gilt, prüft entwertetZeit()
      if (ew && typeof ew === 'object' && typeof ew.zeit === 'string' && /^\d{2}:\d{2}$/.test(ew.zeit) && Number.isFinite(ew.ms)) S.entwertet = { zeit: ew.zeit, ms: ew.ms, probe: !!ew.probe };
    }
  } catch (e) { /* kein Speicher – geht auch so */ }
  function merken() {
    if (S.test) return;
    try { localStorage.setItem(SPEICHER, JSON.stringify({ name: S.name, geheim: [...S.geheim], gesichtet: [...S.gesichtet], unterschrieben: S.unterschrieben, stumm: S.stumm, regie: S.regie, entwertet: S.entwertet })); } catch (e) { /* egal */ }
  }
  function saeubern(n) { return String(n || '').replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim(); }

  // Regie nur über den geheimen Schalter ?regie=1 (aus mit ?regie=0) – nicht über den Namen, sonst bekäme jeder Gast namens Chris
  // hier die Regie, am Abend im Spiel aber eine normale Rolle
  const istRegie = () => S.regie;
  const istBeispiel = n => saeubern(n).toLowerCase() === E.beispielname;
  const rolle = () => (istRegie() ? E.regie.rolle : R.rolleFuer(S.name));
  const brief = () => (istRegie() ? E.regie : E.steckbrief[rolle()]);
  const initial = () => ([...S.name][0] || '?').toUpperCase();
  const fuell = t => String(t).replace(/\{name\}/g, () => S.name).replace(/\{rolle\}/g, () => rolle()).replace(/\{tage\}/g, () => rest().tage).replace(/\{zeit\}/g, () => entwertetZeit());
  /** Schriftgröße für Namen nach Länge (CSS-Variable --gr) */
  function groesse(el, maxPx, anteil, minPx = 22) {
    const n = Math.max(3, [...S.name].length);
    el.style.setProperty('--gr', Math.round(Math.max(minPx, Math.min(maxPx, (Math.min(innerWidth, 900) * anteil) / (n * 0.8)))) + 'px');
  }

  /* ---------- Zeit ---------- */
  const datum = ([j, m, t, h, mi]) => new Date(j, m - 1, t, h, mi, 0);
  const ZIEL = datum(E.beginn), VORBEI = datum(E.vorbeiAb);
  let zeitVersatz = 0;
  const jetzt = () => new Date(Date.now() + zeitVersatz);
  const zustand = () => { const n = jetzt(); return n < ZIEL ? 'vor' : n < VORBEI ? 'laeuft' : 'vorbei'; };
  function rest() {
    const ms = Math.max(0, ZIEL - jetzt()), s = Math.floor(ms / 1000);
    return { ms, tage: Math.floor(s / 86400), std: Math.floor((s % 86400) / 3600), min: Math.floor((s % 3600) / 60), sek: s % 60 };
  }
  const zahl = n => n.toLocaleString('de-DE');
  const mz = (n, eins, viele) => `${n} ${n === 1 ? eins : viele}`;
  const heute = () => jetzt().toDateString() === ZIEL.toDateString();
  // Tür-Ritual: Ab EINLASS bis VORBEI zeigt der Pass „Am Einlass vorzeigen“, der Gastgeber entwertet ihn mit einem Wisch
  const EINLASS = datum(E.einlassAb || E.beginn);
  const tuerOffen = () => { const n = jetzt(); return n >= EINLASS && n < VORBEI; };
  /** Uhrzeit des Stempels („19:04“) oder '' – vor dem Einlass nie, und ein Probe-Stempel (mit ?jetzt=) nur mit ?jetzt= */
  function entwertetZeit() {
    const e = S.entwertet;
    if (!e || (e.probe && !zeitVersatz) || jetzt() < EINLASS || !(e.ms >= EINLASS && e.ms < VORBEI)) return '';
    return e.zeit;
  }
  const abrissZustand = () => (entwertetZeit() ? 'entwertet' : tuerOffen() ? 'offen' : 'aus');

  /* ---------- Teilchen (Staub, Funken, Glut, Goldstaub) ---------- */
  const T = (() => {
    const cv = $('teilchen'), g = cv.getContext('2d');
    let w = 0, h = 0, teile = [], quellen = [], laeuft = false, zuletzt = 0;
    function mass() { const dpr = Math.min(2, window.devicePixelRatio || 1); w = innerWidth; h = innerHeight; cv.width = w * dpr; cv.height = h * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); }
    addEventListener('resize', mass); mass();
    const zf = (a, b) => a + Math.random() * (b - a);
    const ARTEN = {
      staub: () => ({ x: zf(w * 0.22, w * 0.78), y: zf(0, h), vx: zf(-5, 5), vy: zf(-6, 2), r: zf(0.5, 1.8), amax: zf(0.2, 0.55), leben: zf(6, 12), farbe: '255,236,190' }),
      funken: o => ({ x: (o.x || w / 2) + zf(-1, 1) * (o.b || w * 0.3), y: o.y || h * 0.45, vx: zf(-30, 30), vy: zf(10, 70), g: 140, r: zf(0.7, 1.8), amax: 1, leben: zf(1, 2.2), farbe: '255,214,120', glanz: true }),
      glut: () => ({ x: zf(0, w), y: h + 8, vx: zf(-12, 12), vy: zf(-130, -50), r: zf(0.8, 2.4), amax: 0.9, leben: zf(2.2, 4.5), farbe: Math.random() < 0.5 ? '255,150,60' : '255,200,90', glanz: true, wackel: zf(0, 6) }),
      gold: () => ({ x: zf(0, w), y: -10, vx: zf(-25, 25), vy: zf(60, 150), r: zf(1.4, 3.6), amax: 1, leben: zf(3, 5), farbe: Math.random() < 0.3 ? '255,246,200' : '255,206,80', flitter: true, rot: zf(0, 6), vr: zf(-9, 9) }),
      // Paparazzi: kleine Blitzlichter am Bildrand (statt Vollbild-Blitzen)
      foto: () => {
        const rand = Math.min(w, h) * 0.13, seite = Math.random();
        const x = seite < 0.35 ? zf(0, rand) : seite < 0.7 ? zf(w - rand, w) : zf(0, w);
        const y = seite < 0.7 ? zf(h * 0.08, h * 0.92) : (Math.random() < 0.5 ? zf(0, rand) : zf(h - rand, h));
        return { x, y, vx: 0, vy: 0, r: zf(1.6, 3.2), amax: 1, leben: zf(0.16, 0.32), farbe: Math.random() < 0.6 ? '255,255,255' : '255,236,180', knips: true };
      },
    };
    function quelle(art, o = {}) { if (ruhig) return; quellen.push({ art, rate: o.rate || 30, bis: performance.now() + (o.dauer || 2) * 1000, rest: 0, o }); start(); }
    function stoss(art, n, o = {}) { if (ruhig) return; for (let i = 0; i < n; i++) teile.push(Object.assign(ARTEN[art](o), { t: 0 })); start(); }
    function alleWeg() { teile = []; quellen = []; }
    function start() { if (laeuft) return; laeuft = true; zuletzt = performance.now(); requestAnimationFrame(bild); }
    function bild(z) {
      const dt = Math.min(0.05, (z - zuletzt) / 1000); zuletzt = z;
      g.clearRect(0, 0, w, h);
      for (const q of quellen) { q.rest += q.rate * dt; while (q.rest >= 1) { teile.push(Object.assign(ARTEN[q.art](q.o), { t: 0 })); q.rest--; } }
      quellen = quellen.filter(q => z < q.bis);
      teile = teile.filter(p => (p.t += dt) < p.leben && p.y < h + 40);
      for (const p of teile) {
        p.vy += (p.g || 0) * dt;
        p.x += (p.vx + (p.wackel ? Math.sin(p.t * 3 + p.wackel) * 18 : 0)) * dt; p.y += p.vy * dt;
        if (p.knips) {
          const a = p.amax * Math.pow(1 - p.t / p.leben, 1.6), r = p.r * (1 + p.t / p.leben);
          const hof = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 10);
          hof.addColorStop(0, `rgba(${p.farbe},${a * 0.55})`); hof.addColorStop(0.3, `rgba(${p.farbe},${a * 0.16})`); hof.addColorStop(1, `rgba(${p.farbe},0)`);
          g.fillStyle = hof; g.beginPath(); g.arc(p.x, p.y, r * 10, 0, 7); g.fill();
          g.fillStyle = `rgba(255,255,255,${a})`; g.beginPath(); g.arc(p.x, p.y, r, 0, 7); g.fill();
          g.fillRect(p.x - r * 7, p.y - 0.6, r * 14, 1.2); g.fillRect(p.x - 0.6, p.y - r * 4, 1.2, r * 8);
          continue;
        }
        const a = p.amax * Math.min(1, p.t / 0.4) * Math.min(1, (p.leben - p.t) / 0.8);
        if (p.flitter) {
          p.rot += p.vr * dt; const s = Math.abs(Math.cos(p.rot));
          g.fillStyle = `rgba(${p.farbe},${a})`; g.fillRect(p.x - p.r, p.y - p.r * s, p.r * 2, p.r * 2 * s + 0.4);
        } else {
          if (p.glanz) { g.fillStyle = `rgba(${p.farbe},${a * 0.22})`; g.beginPath(); g.arc(p.x, p.y, p.r * 3.2, 0, 7); g.fill(); }
          g.fillStyle = `rgba(${p.farbe},${a})`; g.beginPath(); g.arc(p.x, p.y, p.r, 0, 7); g.fill();
        }
      }
      if (teile.length || quellen.length) requestAnimationFrame(bild); else { laeuft = false; g.clearRect(0, 0, w, h); }
    }
    return { quelle, stoss, alleWeg };
  })();

  /** Vollbild-Blitz – sparsam einsetzen (höchstens 2 pro Sekunde, Lichtempfindlichkeit); sanft = Deckkraft 0,55 statt 0,85 */
  function blitz(sanft = false) {
    if (ruhig) return; const b = $('blitz');
    b.classList.remove('an', 'sanft'); void b.offsetWidth; b.classList.add('an'); if (sanft) b.classList.add('sanft');
  }
  function beben(el) { if (ruhig || !el) return; el.classList.remove('beben'); void el.offsetWidth; el.classList.add('beben'); }
  function wackeln(el) { if (!el) return; el.classList.remove('wackeln'); void el.offsetWidth; el.classList.add('wackeln'); }
  // Vibration nur nach einem echten Tipp auf der Seite (sonst blockiert Chrome sie und meldet einen Fehler in der Konsole)
  function vib(m) { if (ruhig) return; try { if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; if (navigator.vibrate) navigator.vibrate(m); } catch (e) { /* egal */ } }

  /* ---------- Ton-Schalter ---------- */
  // Der Knopf nennt die Aktion, nicht den Zustand (sonst tippen Gäste „Ton an“ und schalten damit stumm)
  function tonKnopf() {
    $('ton').textContent = S.stumm ? E.ton.einschalten : E.ton.stummschalten;
    $('ton').dataset.stumm = S.stumm ? '1' : '';
    $('ton').setAttribute('aria-label', S.stumm ? E.ton.einschaltenLang : E.ton.stummschaltenLang);
  }
  K.setzeStumm(S.stumm); tonKnopf();
  $('ton').addEventListener('click', () => {
    S.stumm = !S.stumm; K.setzeStumm(S.stumm); tonKnopf(); merken();
    if (!S.stumm) { K.entsperren(); TON.klick(); if (MENUE_SZENEN.has(aktSzene)) K.schleifeStart(); }
  });
  // Jeder erste Tipp darf den Ton entsperren (z. B. nach „Willkommen zurück“ oder ?name=…)
  const tippEntsperrt = () => { if (!S.stumm && !K.laeuft()) { K.entsperren(); if (MENUE_SZENEN.has(aktSzene)) K.schleifeStart(); } };
  ['pointerdown', 'touchend', 'click', 'keydown'].forEach(t => document.addEventListener(t, tippEntsperrt, true));
  document.addEventListener('visibilitychange', () => { if (document.hidden) K.pausieren(); else K.fortsetzen(); });

  /* ---------- Szenen ---------- */
  const MENUE_SZENEN = new Set(['menue', 'kapitel', 'besetzung', 'bonus', 'pass']);
  let aktSzene = 'einlass';
  function zeigeSzene(z) {
    aktSzene = z;
    document.body.dataset.szene = z;
    window.scrollTo(0, 0);
    if (z !== 'einlass') T.alleWeg();
    if (MENUE_SZENEN.has(z)) K.schleifeStart(); else K.schleifeStopp();
    if (z === 'menue') menueFuellen();
    if (z === 'kapitel') kachelnBauen();
    if (z === 'besetzung') besetzungBauen();
    if (z === 'bonus') bonusBauen();
    if (z === 'pass') passZeigen();
    if (z === 'akte') akteFuellen();
    if (z !== 'kino') $('ueberspringen').hidden = true;
    pcGesperrt = true; setTimeout(() => { pcGesperrt = false; }, 900);
  }
  function geh(ziel) {
    TON.klick();
    if (ziel === 'trailer') return vorspann('logo', 'menue');
    if (ziel === 'start') return filmStarten();
    zeigeSzene(ziel);
  }
  document.addEventListener('click', e => { const b = e.target.closest('[data-geh]'); if (b) geh(b.dataset.geh); });

  /* ---------- 1 · Einlass ---------- */
  const feld = $('name'), einlassKnopf = $('einlassKnopf');
  feld.placeholder = E.einlass.platzhalter;
  einlassKnopf.removeAttribute('disabled');
  const knopfZustand = () => { einlassKnopf.classList.toggle('aus', !feld.value.trim()); einlassKnopf.setAttribute('aria-disabled', String(!feld.value.trim())); };
  feld.addEventListener('input', () => { $('fehlerName').textContent = ''; knopfZustand(); });
  knopfZustand();
  function einlassFehler(text) { $('fehlerName').textContent = text; wackeln(feld); TON.trocken(); feld.focus(); }
  let startAb = 'logo';
  $('einlassForm').addEventListener('submit', e => {
    e.preventDefault();
    const n = saeubern(feld.value);
    if (!n) return einlassFehler(E.einlass.fehlerLeer);
    // Gezählt wie im Spiel (Eingabefeld maxLength und slice(0, NAME_MAX) zählen UTF-16-Zeichen), damit nichts anders abgeschnitten wird
    if (n.length > E.maxNamenLaenge) return einlassFehler(E.einlass.fehlerLang);
    if (!S.stumm) K.entsperren();
    TON.samtseil();
    feld.blur();
    if (n !== S.name) { S.unterschrieben = false; S.entwertet = null; }
    S.name = n;
    if (!istBeispiel(n)) merken();
    if (startAb !== 'logo') return springe(startAb);
    gaestelisteCheck();
  });
  function einlassZeigen(fehlerText) {
    $('willkommen').hidden = true; $('einlassInhalt').hidden = false;
    zeigeSzene('einlass');
    T.alleWeg(); T.quelle('staub', { rate: 4, dauer: 1e6 });
    if (fehlerText) { $('fehlerName').textContent = fehlerText; wackeln(feld); }
    knopfZustand();
  }
  function willkommenZeigen() {
    $('einlassInhalt').hidden = true; $('willkommen').hidden = false;
    zeigeSzene('einlass');
    T.alleWeg(); T.quelle('staub', { rate: 4, dauer: 1e6 });
    $('willkommenText').textContent = fuell(E.einlass.willkommen);
    $('zumMenue').textContent = E.einlass.zumMenue;
    const tuer = abrissZustand() === 'offen';
    $('passVorzeigen').hidden = !tuer; $('passVorzeigen').textContent = E.tuer.willkommenKnopf;
    $('zumMenue').classList.toggle('gold', !tuer);
    $('vorspannNochmal').textContent = E.einlass.vorspannNochmal;
    $('neuEinchecken').textContent = fuell(E.einlass.neu);
  }
  $('zumMenue').addEventListener('click', () => { if (!S.stumm) K.entsperren(); TON.klick(); zeigeSzene('menue'); });
  $('passVorzeigen').addEventListener('click', () => { if (!S.stumm) K.entsperren(); TON.klick(); zeigeSzene('pass'); });
  $('vorspannNochmal').addEventListener('click', () => { if (!S.stumm) K.entsperren(); TON.samtseil(); vorspann('logo', S.unterschrieben ? 'menue' : 'akte'); });
  $('neuEinchecken').addEventListener('click', () => {
    S.name = ''; S.unterschrieben = false; S.entwertet = null; merken(); feld.value = '';
    einlassZeigen(); setTimeout(() => feld.focus(), 50);
  });

  /* ---------- 2 · Gästelisten-Check ---------- */
  let checkNr = 0;
  async function gaestelisteCheck() {
    const nr = ++checkNr;
    zeigeSzene('check');
    const zeilen = $('ladeZeilen'), gef = $('gefunden'), st = $('checkStempel');
    zeilen.textContent = ''; gef.textContent = ''; st.className = 'stempel'; st.textContent = '';
    // Scanner piept, immer schneller
    let piepen = true;
    (async () => { let a = 420, i = 0; while (piepen && nr === checkNr) { TON.piep(Math.min(3, i++ / 6)); await warte(a); a = Math.max(80, a * 0.86); } })();
    for (const z of E.check.zeilen) {
      for (let i = 1; i <= z.length; i++) {
        if (nr !== checkNr) return;
        zeilen.textContent = zeilen.textContent.replace(/[^\n]*$/, '') + z.slice(0, i);
        if (i % 3 === 0) TON.tipp();
        await warte(ruhig ? 2 : 16);
      }
      zeilen.textContent += '\n';
      await warte(260);
    }
    piepen = false;
    const beispiel = istBeispiel(S.name), regie = istRegie();
    gef.textContent = fuell(beispiel ? E.check.beispielGefunden : regie ? E.check.regieGefunden : E.check.gefunden);
    await warte(650); if (nr !== checkNr) return;
    st.textContent = beispiel ? E.check.beispielStempel : regie ? E.check.regieStempel : E.check.stempel;
    st.className = 'stempel knall' + (beispiel ? ' grau' : regie ? ' gold' : '');
    TON.stempel(beispiel ? 0.7 : 1.2); vib(beispiel ? 40 : 90); beben($('liste'));
    await warte(beispiel ? 1700 : 1300); if (nr !== checkNr) return;
    if (beispiel) { S.name = ''; feld.value = ''; return einlassZeigen(E.einlass.beispielname); }
    vorspann('logo', 'akte');
  }

  /* ---------- 3–7 · Kino ---------- */
  const leinwand = $('leinwand'), skip = $('ueberspringen');
  const ABBRUCH = {};
  let kinoNr = 0, kinoSchritt = '', kinoZiel = 'akte';
  const zeige = html => { leinwand.innerHTML = html; };
  /** Texttafel; mit motiv liegt dahinter ein dunkles, unscharfes Kapitel-Motiv mit langsamem Zoom (Ken Burns) */
  const karte = (text, ms, klasse = '', motiv = null) => zeige(
    (motiv != null && motiv < M.anzahl ? `<div class="kb" style="--d:${ms}ms">${M.kapitelMotiv(motiv)}</div>` : '') +
    `<div class="karte ${klasse}" style="--d:${ms}ms">${esc(text)}</div>`);
  // Motive hinter den vier Genre-Wörtern des Trailers (Index wie in motive.js: 1 = Western, 2 = Weltraum, 8 = Piraten, 10 = Superhelden)
  const WORT_MOTIVE = [1, 2, 8, 10];
  const buchstaben = (text, klasse, abstand) => [...text].map((b, i, a) => `<span class="${klasse}" style="--dx:${((i - (a.length - 1) / 2) * abstand).toFixed(1)}vw">${b === ' ' ? '&nbsp;' : esc(b)}</span>`).join('');

  async function vorspann(ab = 'logo', ziel = kinoZiel) {
    const nr = ++kinoNr; kinoZiel = ziel;
    const w = async ms => { await warte(ms); if (nr !== kinoNr) throw ABBRUCH; };
    zeigeSzene('kino');
    K.busStart();
    const folge = ['logo', 'trailer', 'titel', 'freigabe', 'starring'];
    try {
      for (const s of folge.slice(Math.max(0, folge.indexOf(ab)))) {
        kinoSchritt = s;
        skip.hidden = !(s === 'titel' || s === 'freigabe');
        await KINO[s](w, nr);
      }
    } catch (e) { if (e === ABBRUCH) return; throw e; }
    if (nr !== kinoNr) return;
    K.busStopp(2);
    zeigeSzene(ziel);
  }
  skip.addEventListener('click', () => {
    TON.klick(); K.busStopp(0.12); T.alleWeg();
    vorspann(kinoSchritt === 'trailer' || kinoSchritt === 'logo' ? 'titel' : 'starring');
  });

  const KINO = {
    /* 3 · Studiologo */
    async logo(w) {
      zeige(`<div class="studio-szene"><div class="himmel"></div><div class="strahl"></div><div class="nebel a"></div><div class="nebel b"></div>
        <div class="suchlicht l"></div><div class="suchlicht r"></div></div>
        <div class="studio"><div class="emblem">★</div><div class="name">${esc(E.studio[0])}</div><div class="unter">${esc(E.studio[1])}</div></div>`);
      // Lautstärke-Bogen: Der Begrenzer drückt alle großen Treffer auf fast denselben Pegel. Damit der Höhepunkt (Rolle rastet ein)
      // am lautesten ist, laufen die Treffer davor gedämpft (gemessen: Logo ~-14 dB, Trailer-Treffer ~-10, Höhepunkt ~-9).
      TON.gedaempft(-8, () => TON.logo());
      await w(1300);
      T.quelle('funken', { rate: 45, dauer: 2.2, x: innerWidth / 2, y: innerHeight * 0.5, b: Math.min(innerWidth, 600) * 0.45 });
      await w(3100);
    },
    /* 4 · Trailer: 16 Tafeln */
    async trailer(w, nr) {
      const t = E.trailer.map(fuell);
      T.alleWeg();
      setTimeout(() => { if (nr === kinoNr && kinoSchritt === 'trailer') skip.hidden = false; }, 3000);
      // Tafel 1 nur ein ferner Braam (Lautstärke-Bogen: der erste volle Braam kommt bei „Es war Training.“)
      karte(t[0], 3200, '', 0); TON.braamFern(0.11); TON.bett(27, 1.15, 0.5); await w(3200);
      karte(t[1], 3200, 'klein', 6); TON.streicher(6.2); await w(3200);
      karte(t[2], 2800, '', 3); await w(2800);
      karte(t[3], 2600); TON.gedaempft(-8, () => TON.braam(1.35, true)); beben($('kino')); vib(50); await w(2600);
      karte(t[4], 2900); await w(2900);
      for (let i = 0; i < M.anzahl; i++) { zeige(`<div class="schnitt">${M.kapitelMotiv(i)}</div>`); TON.whoosh(0.24, 0.22); await w(250); }
      // Jedes Genre-Wort knallt über sein Motiv (Western, Weltraum, Piraten, Superhelden = Kapitel 2, 3, 9, 11)
      const woerter = t[5].split(/\s+/);
      zeige(`<div class="wort-bild" id="wortBild"></div><div class="woerter">${woerter.map(x => `<span>${esc(x)}</span>`).join('')}</div>`);
      const spans = leinwand.querySelectorAll('.woerter span'), wortBild = $('wortBild');
      for (let i = 0; i < spans.length; i++) {
        const m = WORT_MOTIVE[i];
        if (m != null && m < M.anzahl) wortBild.innerHTML = M.kapitelMotiv(m, 'zoom');
        spans[i].classList.add('da'); TON.trommel(0.85 + i * 0.12); TON.whoosh(0.2, 0.18); await w(700);
      }
      await w(300);
      karte(t[6], 3000); TON.streicher(3, 1.5); await w(3000);
      for (const j of [7, 8, 9]) {
        zeige(''); TON.sog(0.26); await w(270);
        zeige(`<div class="schlagwort ${j === 9 ? 'goldtext gold' : 'chrom'}">${esc(t[j])}</div>`);
        if (j === 9) { TON.gedaempft(-6, () => { TON.trommel(1.6); TON.braam(1.2); }); beben($('kino')); vib(70); } else TON.trommel(1.1 + (j - 7) * 0.25);
        await w(950);
      }
      // Pointe: Platten-Kratzer, kurz Stille, sofort weiter
      TON.kratzer(); await w(320);
      K.busStopp(0.04); K.busStart(); zeige(''); await w(420);
      karte(t[10], 2600, 'pointe', 4); await w(2600);
      karte(t[11], 2600, '', 7); TON.bett(9.4, 0.8, 0.42); TON.braam(0.9); await w(2600);
      karte(t[12], 2700, '', 2); TON.streicher(6, 1.26); await w(2700);
      karte(t[13], 3300); await w(900); TON.riser(2.4); await w(2400);
      // Riser bricht hart ab: 1,2 s Schwarz und völlige Stille
      K.busStopp(0.02); K.busStart(); zeige(''); await w(1200);
      zeige(`<div class="name-einschlag goldtext" id="nameEin">${esc(t[14])}</div>`); groesse($('nameEin'), 140, 0.86, 28);
      TON.gedaempft(-6, () => TON.einschlag(1.3)); blitz(); beben($('kino')); vib([90, 40, 160]); await w(2600);
      // Datum als goldenes Schlagwort mit echtem Einschlag (die wichtigste Info des Trailers)
      zeige(''); TON.sog(0.3); await w(320);
      const datumZeilen = t[15].replace(/\.\s+(?=\d+\.\s)/, '.\n').replace(/\.\s+(?=\d+\s*Uhr)/i, '.\n');
      zeige(`<div class="datum-schlag goldtext">${esc(datumZeilen)}</div>`);
      TON.gedaempft(-4, () => { TON.trommel(1.5); TON.braam(1.05); }); beben($('kino')); vib([60, 30, 120]);
      T.quelle('funken', { rate: 26, dauer: 1.4, x: innerWidth / 2, y: innerHeight * 0.3, b: Math.min(innerWidth, 600) * 0.4 });
      await w(2900);
    },
    /* 5 · Titelkarte */
    async titel(w) {
      zeige(`<div class="titel-szene">
        <div class="vor">${esc(E.studio[0])} ${esc(E.studio[1])} präsentiert</div>
        <div class="titel-logo" id="tLogo"><div class="flare" id="tFlare"></div><div class="zwei goldtext">${esc(E.zahl)}</div>
          <div class="wort">${buchstaben(E.titel, 'chrom', 9)}</div></div>
        <div class="badge" id="tBadge">${esc(E.zusatz)}</div>
        <div class="unter" id="tUnter">${esc(E.untertitel)}</div>
        <div class="tagline" id="tTag">${esc(E.tagline)}</div>
        <div class="datum" id="tDatum">${esc(E.datumszeile)}</div></div>`);
      TON.riser(1.4); await w(1400);
      await w(380);
      $('tLogo').classList.add('zusammen'); TON.schlag(1); beben($('kino')); vib(40); await w(850);
      $('tLogo').classList.add('zwei-da'); TON.sog(0.42); await w(440);
      TON.gedaempft(-8, () => TON.einschlag(1.6)); blitz(); beben($('kino')); vib([60, 30, 140]); $('tFlare').classList.add('an');
      T.quelle('glut', { rate: 30, dauer: 6 });
      await w(380); $('tBadge').classList.add('da'); TON.ding(); await w(300);
      TON.gedaempft(-6, () => TON.fanfare(0)); $('tUnter').classList.add('da-weich'); await w(800);
      $('tTag').classList.add('da-weich'); await w(500);
      $('tDatum').classList.add('da-weich'); await w(2600);
      // Billing-Block
      const zeilen = E.billing.map(z => `<span>${z.split(/(<b>|<\/b>)/).map(teil => (teil === '<b>' || teil === '</b>' ? teil : esc(fuell(teil)))).join('')}</span>`).join(' · ');
      T.alleWeg();
      zeige(`<div class="bill"><div class="billing">${zeilen}</div></div>`); TON.ausklang(4.6); await w(4600);
    },
    /* 6 · Freigabe-Karte */
    async freigabe(w) {
      zeige(`<div class="freigabe"><div class="streifen"><span class="filmstreifen-badge" aria-hidden="true"><b>1+</b><small>Gast</small></span></div>
        <h2>${esc(E.freigabe.gross)}</h2><p class="fuer">${esc(fuell(E.freigabe.fuer))}</p><p class="enthaelt">${esc(E.freigabe.enthaelt)}</p></div>`);
      TON.trocken(); TON.projektor(5); await w(5200);
    },
    /* 7 · Starring: Name knallt rein, Fallblatt rattert, Rolle rastet ein */
    async starring(w) {
      skip.hidden = true;
      const r = rolle();
      zeige(`<div class="starring"><div class="suchlicht l"></div><div class="suchlicht r"></div><div class="ueber chrom">Starring</div>
        <div class="star-name" id="sName">${buchstaben(S.name, 'goldtext', 7)}</div>
        <div class="blatt-huelle" id="sHuelle"><div class="fallblatt" id="sBlatt"><div class="blatt" id="sText">&nbsp;</div></div></div>
        <div class="star-weiter" id="sWeiter"></div></div>`);
      groesse($('sName'), 140, 0.9, 26);
      const t0 = performance.now();
      if (!TON.wirbel(5.9, 6.5)) TON.wirbelSynth(5.9);
      await w(2700);
      $('sName').classList.add('da'); TON.schlag(0.9); blitz(true); vib(50);
      await w(400);
      const blatt = $('sBlatt'), text = $('sText');
      blatt.classList.add('an');
      const alle = R.ROLLEN.slice();
      let k = Math.floor(Math.random() * alle.length), a = 55;
      while (performance.now() - t0 < 5900 - a) {
        text.textContent = alle[k++ % alle.length];
        text.classList.remove('klapp'); void text.offsetWidth; text.classList.add('klapp');
        TON.tick(k); await w(a); a = Math.min(420, a * 1.1);
      }
      // 0,6 s Stille, dann rastet die Rolle ein
      await w(Math.max(0, 6540 - (performance.now() - t0)));
      text.textContent = r; text.classList.remove('klapp'); void text.offsetWidth; text.classList.add('klapp');
      blatt.classList.add('fest'); $('sHuelle').classList.add('glueht');
      // Höhepunkt = lautester Moment: Einschlag ohne Becken, Jubel laut und kurz danach (geht sonst unter Braam und Becken unter)
      TON.einschlag(1.4, { becken: false }); TON.ding(); TON.jubel(0.3, 1.3);
      // Nur EIN sanfter Blitz (Lichtempfindlichkeit, und das Gold bleibt sichtbar), danach Paparazzi-Blitzlichter am Bildrand
      blitz(true); beben($('kino')); vib([120, 60, 220]);
      T.quelle('gold', { rate: 80, dauer: 2.6 });
      T.quelle('foto', { rate: 16, dauer: 2.8 });
      await w(4200);
    },
  };

  /* ---------- 8 · Steckbrief & Vertrag ---------- */
  const unterschrift = $('unterschrift'), tinte = $('tinte');
  function akteFuellen() {
    const b = brief(), regie = istRegie();
    $('akteKarte').dataset.reiter = E.akte.kopf;
    $('akteRolle').textContent = rolle();
    $('akteName').textContent = S.name; groesse($('akteName'), 44, 0.52, 18);
    $('akteFoto').innerHTML = M.fotofeld(initial());
    $('akteFaehigkeit').textContent = b.faehigkeit;
    $('akteSchwaeche').textContent = b.schwaeche;
    $('akteRequisite').textContent = b.requisite;
    $('akteRequisiteBild').innerHTML = M.requisite(b.bild);
    $('akteSatz').textContent = b.satz;
    $('annehmenLabel').textContent = regie ? E.regie.annehmen : E.akte.annehmen;
    $('wischHinweis').textContent = E.akte.wischen;
    $('andereRolle').textContent = E.akte.andere;
    $('abgelehnt').textContent = '';
    const st = $('gecastet'); st.textContent = E.akte.stempel; st.className = 'stempel gecastet'; st.style.opacity = S.unterschrieben ? '.92' : '';
    unterschrift.setAttribute('aria-label', (regie ? E.regie.annehmen : E.akte.annehmen) + (S.unterschrieben ? ' (unterschrieben)' : ''));
    if (!S.unterschrieben) { tinte.setAttribute('d', ''); $('wischHinweis').style.opacity = '1'; }
    else if (!tinte.getAttribute('d')) zeichneAutoUnterschrift(false);
    TON.papier();
  }
  let zug = null, feder = null, tipps = 0;
  const punkt = e => { const r = unterschrift.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() }; };
  unterschrift.addEventListener('pointerdown', e => {
    if (S.unterschrieben) return;
    e.preventDefault();
    try { unterschrift.setPointerCapture(e.pointerId); } catch (x) { /* egal */ }
    const p = punkt(e);
    zug = { d: (tinte.getAttribute('d') || '') + ` M${p.x.toFixed(1)} ${p.y.toFixed(1)}`, min: p.x, max: p.x, letzt: p, weg: 0 };
    tinte.setAttribute('d', zug.d);
    feder = TON.fueller();
    $('wischHinweis').style.opacity = '0';
  });
  unterschrift.addEventListener('pointermove', e => {
    if (!zug) return;
    const p = punkt(e), dx = p.x - zug.letzt.x, dy = p.y - zug.letzt.y, dist = Math.hypot(dx, dy);
    if (dist < 1.5) return;
    zug.d += ` L${p.x.toFixed(1)} ${p.y.toFixed(1)}`; tinte.setAttribute('d', zug.d);
    zug.min = Math.min(zug.min, p.x); zug.max = Math.max(zug.max, p.x); zug.weg += dist;
    if (feder) feder.tempo(dist / Math.max(1, p.t - zug.letzt.t));
    zug.letzt = p;
  });
  const zugEnde = () => {
    if (!zug) return;
    const z = zug; zug = null;
    if (feder) { feder.stopp(); feder = null; }
    if (z.max - z.min > unterschrift.clientWidth * 0.42) return annehmen();
    if (z.weg < 10) {
      tipps++;
      if (tipps >= 2) return zeichneAutoUnterschrift(true);
      $('wischHinweis').style.opacity = '1'; wackeln($('wischHinweis'));
    }
  };
  unterschrift.addEventListener('pointerup', zugEnde);
  unterschrift.addEventListener('pointercancel', zugEnde);
  unterschrift.addEventListener('click', e => { if (e.detail === 0 && !S.unterschrieben) zeichneAutoUnterschrift(true); });
  /** Schwungvolle Unterschrift, falls jemand nicht wischen kann oder mag (Tastatur, Doppeltipp) */
  function zeichneAutoUnterschrift(mitAnnehmen) {
    const b = unterschrift.clientWidth || 300, y = 46;
    let d = `M28 ${y}`, x = 28;
    const n = Math.max(4, Math.min(9, [...S.name].length));
    for (let i = 0; i < n; i++) { const s = (b - 70) / n; d += ` C${(x + s * 0.2).toFixed(0)} ${y - 26} ${(x + s * 0.7).toFixed(0)} ${y - 26} ${(x + s * 0.5).toFixed(0)} ${y} S${(x + s * 0.9).toFixed(0)} ${y + 10} ${(x + s).toFixed(0)} ${y}`; x += s; }
    d += ` L${(b - 10).toFixed(0)} ${y - 8}`;
    tinte.setAttribute('d', d); $('wischHinweis').style.opacity = '0';
    if (!mitAnnehmen) return;
    if (!ruhig && tinte.getTotalLength) {
      const l = tinte.getTotalLength(); tinte.style.strokeDasharray = l; tinte.style.strokeDashoffset = l;
      tinte.getBoundingClientRect(); tinte.style.transition = 'stroke-dashoffset .9s ease-in-out'; tinte.style.strokeDashoffset = '0';
      const f = TON.fueller(); f.tempo(2); setTimeout(() => { f.stopp(); tinte.style.transition = ''; tinte.style.strokeDasharray = ''; tinte.style.strokeDashoffset = ''; annehmen(); }, 950);
    } else annehmen();
  }
  function annehmen() {
    if (S.unterschrieben) return;
    S.unterschrieben = true; merken();
    const st = $('gecastet'); st.style.opacity = ''; st.className = 'stempel gecastet knall';
    TON.klonk(); vib([40, 30, 90]); beben($('akteKarte'));
    unterschrift.setAttribute('aria-label', (istRegie() ? E.regie.annehmen : E.akte.annehmen) + ' (unterschrieben)');
  }
  $('andereRolle').addEventListener('click', () => {
    wackeln($('akteKarte')); TON.stempel(0.5); TON.trocken(); vib(30);
    $('abgelehnt').textContent = istRegie() ? E.regie.abgelehnt : E.akte.abgelehnt;
    geheimnis('umbesetzung');
  });

  /* ---------- 9 · DVD-Hauptmenü ---------- */
  let anzeigeModus = 0;
  function menueFuellen() {
    const tuer = abrissZustand(), tuerNeben = tuer === 'offen' ? E.tuer.menueNeben : tuer === 'entwertet' ? fuell(E.tuer.menueNebenEntwertet) : '';
    $('menueListe').innerHTML = E.menue.punkte.map(([ziel, text], i) => {
      const neben = i === 0 ? E.datumPass : ziel === 'pass' ? tuerNeben : '';
      const klasse = i === 0 ? 'haupt' : ziel === 'pass' && tuer !== 'aus' ? 'tuer ' + tuer : '';
      return `<button type="button" data-geh="${ziel}" class="${klasse}"><span class="pfeil" aria-hidden="true">▶</span>${esc(text.replace(/^▶\s*/, ''))}${neben ? `<span class="neben">${esc(neben)}</span>` : ''}</button>`;
    }).join('');
    $('besetzt').innerHTML = `${esc(E.menue.besetzt)} <b>${esc(S.name)}</b><span class="rolle-gold">${esc(rolle())}</span>`;
    laufbandBauen();
    treibenBauen();
    $('abspannListe').innerHTML = E.abspann.map(([a, b]) => `<div><dt>${esc(fuell(a))}</dt><dd>${esc(fuell(b))}</dd></div>`).join('');
    anzeigeZeichnen(true);
  }
  function laufbandBauen() {
    const r = rest(), vor = zustand() === 'vor';
    const witze = E.witze.filter(x => !x.includes('{tage}') || (vor && r.tage >= 2)).map(fuell);
    const lb = $('laufband'), spur = $('laufspur');
    if (ruhig) {
      lb.classList.add('ruhig'); let i = 0; spur.textContent = witze[0];
      clearInterval(laufbandBauen.uhr); laufbandBauen.uhr = setInterval(() => { spur.textContent = witze[++i % witze.length]; }, 6000);
      return;
    }
    const einmal = witze.map(x => `<span>${esc(x)}</span>`).join('');
    spur.innerHTML = einmal + einmal;
    spur.style.setProperty('--dauer', Math.round(witze.join(' ').length * 0.16) + 's');
  }
  let treibenFertig = false;
  function treibenBauen() {
    if (treibenFertig || ruhig) return; treibenFertig = true;
    const t = $('treiben');
    t.innerHTML = Array.from({ length: M.anzahl }, (_, i) => M.kapitelMotiv(i)).join('');
    t.querySelectorAll('.motiv').forEach((m, i) => {
      const d = 46 + (i * 7) % 30;
      m.style.cssText = `top:${(4 + (i * 37) % 88)}%;--t:${d}s;--v:${-(i * d / M.anzahl).toFixed(1)}s;--y0:${(i % 3) * 10 - 10}px;--y1:${(i % 2) * 30 - 15}px;--r:${(i % 5) - 2}deg`;
    });
  }
  /** Player-Anzeige mit Klappziffern */
  function anzeigeZeichnen(neu) {
    const a = $('anzeige'), unter = $('anzeigeUnter'), z = zustand(), r = rest();
    if (entwertetZeit() && z !== 'vorbei' && (z !== 'vor' || anzeigeModus === 0)) {
      if (a.dataset.modus === 'eingecheckt' && !neu) return;
      a.innerHTML = `<span class="text-anzeige eingecheckt">✓ ${esc(E.tuer.kopf)}</span>`;
      unter.textContent = fuell(E.tuer.kopfUnter);
      a.setAttribute('aria-label', `${E.tuer.kopf}, ${fuell(E.tuer.kopfUnter)}`);
      a.dataset.modus = 'eingecheckt'; return;
    }
    if (z !== 'vor') {
      a.innerHTML = `<span class="text-anzeige">${z === 'laeuft' ? 'Läuft gerade' : 'Fortsetzung folgt'}</span>`;
      unter.textContent = z === 'laeuft' ? 'Heute Abend! · jetzt im Wohnzimmer' : 'Danke fürs Mitspielen';
      a.dataset.modus = z; return;
    }
    if (anzeigeModus === 0) {
      const gruppen = [[p2(Math.min(99, r.tage)), 'Tage'], [p2(r.std), 'Std'], [p2(r.min), 'Min'], [p2(r.sek), 'Sek']];
      if (neu || a.dataset.modus !== 'tage') {
        a.innerHTML = gruppen.map(([, l], i) => `${i > 1 ? '<span class="doppelpunkt" aria-hidden="true">:</span>' : ''}<span class="gruppe"><span class="zz"><span class="ziffer"><span></span></span><span class="ziffer"><span></span></span></span><small>${l}</small></span>`).join('');
        a.dataset.modus = 'tage';
      }
      const ziffern = a.querySelectorAll('.ziffer');
      gruppen.map(g => g[0]).join('').split('').forEach((c, i) => {
        const el = ziffern[i], sp = el.firstChild;
        if (sp.textContent !== c) { sp.textContent = c; if (!neu) { el.classList.remove('klapp'); void el.offsetWidth; el.classList.add('klapp'); } }
      });
      a.setAttribute('aria-label', `Noch ${restText()}`);
      unter.textContent = heute() ? 'Heute Abend! · bis zum Einlass' : 'bis zum Einlass';
    } else {
      const sek = r.ms / 1000, n = anzeigeModus === 1 ? Math.ceil(sek / 1200) : Math.ceil(sek / TRAILER_SEK);
      a.innerHTML = `<span class="text-anzeige">${zahl(n)}</span>`; a.dataset.modus = 'zahl';
      unter.textContent = anzeigeModus === 1 ? 'Tüten Popcorn bis zum Einlass (à 20 Minuten)' : `Trailer bis zum Einlass (à ${TRAILER_SEK} Sekunden)`;
    }
  }
  $('player').addEventListener('click', () => {
    TON.klick();
    if (zustand() !== 'vor') return;
    anzeigeModus = (anzeigeModus + 1) % 3; anzeigeZeichnen(true);
    geheimnis('countdown');
  });
  function restText() {
    const r = rest(), teile = [];
    if (r.tage) teile.push(mz(r.tage, 'Tag', 'Tage'));
    if (r.tage || r.std) teile.push(mz(r.std, 'Stunde', 'Stunden'));
    teile.push(mz(r.min, 'Minute', 'Minuten'));
    return teile.join(', ');
  }
  function filmStarten() {
    const z = zustand();
    TON.discKratzer();
    const text = z === 'vor' ? E.menue.filmStartenVor.replace('{rest}', restText()) : z === 'laeuft' ? E.menue.filmStartenLaeuft : E.menue.filmStartenVorbei;
    meldung(E.menue.filmStartenTitel, text);
    geheimnis('start');
  }
  // Disc fünfmal antippen
  let discTipps = [];
  function discTipp() {
    const n = performance.now();
    discTipps = discTipps.filter(t => n - t < 2500); discTipps.push(n);
    TON.klick();
    if (discTipps.length >= 5) {
      discTipps = [];
      const d = $('menueDisc'); d.classList.remove('dreht'); d.classList.add('ruckeln'); TON.discKratzer(); beben(document.querySelector('#menue .inhalt')); vib([30, 30, 30, 30, 60]);
      setTimeout(() => { d.classList.remove('ruckeln'); d.classList.add('dreht'); meldung('Lesefehler', E.menue.discKaputt, outtakesZeigen); }, 750);
    }
  }
  $('menueDisc').addEventListener('click', discTipp);
  $('menueDisc').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); discTipp(); } });

  /* Meldung (DVD-Fehler) */
  let meldungDanach = null, meldungVorher = null;
  function meldung(titel, text, danach) {
    meldungDanach = danach || null; meldungVorher = document.activeElement;
    $('meldungTitel').textContent = titel; $('meldungText').textContent = text;
    $('meldung').hidden = false; K.schleifeDucken(true);
    setTimeout(() => $('meldungOk').focus(), 50);
  }
  function meldungZu() {
    if ($('meldung').hidden) return;
    $('meldung').hidden = true; TON.klick(); K.schleifeDucken(false);
    const f = meldungDanach; meldungDanach = null;
    if (f) f(); else if (meldungVorher && meldungVorher.focus) meldungVorher.focus();
  }
  $('meldungOk').addEventListener('click', meldungZu);
  $('meldung').addEventListener('click', e => { if (e.target === $('meldung')) meldungZu(); });

  /* Outtakes */
  let outNr = 0;
  async function outtakesZeigen() {
    const nr = ++outNr, o = $('outtakes'), b = $('outtakeBuehne');
    o.hidden = false; K.schleifeDucken(true); geheimnis('disc');
    setTimeout(() => $('outtakesZu').focus(), 50);
    for (let i = 0; i < E.outtakes.length; i++) {
      if (nr !== outNr) return;
      const [kopf, ...rest_] = E.outtakes[i].split(':');
      b.innerHTML = `<div class="outtake"><div class="klappe"><span>${esc(kopf)}</span></div><p>${esc(rest_.join(':').trim())}</p></div>`;
      TON.trocken(); setTimeout(() => TON.tipp(), 90);
      await warte(2600);
    }
    if (nr === outNr) outtakesZu();
  }
  function outtakesZu() { outNr++; $('outtakes').hidden = true; K.schleifeDucken(false); }
  $('outtakesZu').addEventListener('click', () => { TON.klick(); outtakesZu(); });

  /* ---------- 14 · Szene nach dem Abspann ---------- */
  let pcGesperrt = true, pcLaeuft = false, pcNr = 0;
  addEventListener('scroll', () => {
    if (aktSzene !== 'menue' || pcGesperrt || pcLaeuft || window.scrollY < 200) return;
    const r = $('abspannEnde').getBoundingClientRect();
    if (r.top < innerHeight - 4) postCredit();
  }, { passive: true });
  async function postCredit() {
    const nr = ++pcNr; pcLaeuft = true;
    const o = $('postcredit'), box = $('pcText');
    box.innerHTML = ''; $('postcreditZu').hidden = true; o.hidden = false;
    K.schleifeStopp(0.15);
    await warte(1300); if (nr !== pcNr) return;
    TON.braamFern();
    const zeilen = E.postCredit.map(fuell);
    for (const z of zeilen) {
      const el = document.createElement('div'); el.className = 'zeile cursor'; box.append(el);
      for (let i = 1; i <= z.length; i++) { if (nr !== pcNr) return; el.textContent = z.slice(0, i); if (i % 2) TON.tipp(); await warte(ruhig ? 1 : 48); }
      el.classList.remove('cursor');
      await warte(1000);
    }
    const k = document.createElement('div'); k.className = 'zeile klein'; k.textContent = E.postCreditKlein; box.append(k);
    await warte(900); if (nr !== pcNr) return;
    geheimnis('abspann');
    $('postcreditZu').hidden = false; $('postcreditZu').focus();
  }
  $('postcreditZu').addEventListener('click', () => {
    pcNr++; pcLaeuft = false; $('postcredit').hidden = true; TON.klick();
    window.scrollTo(0, 0); pcGesperrt = true; setTimeout(() => { pcGesperrt = false; }, 900);
    K.schleifeStart();
  });

  /* ---------- Geheimnisse ---------- */
  let toastUhr = 0;
  function toast(text, ms = 3400) {
    const t = $('toast'); t.textContent = text; t.classList.add('da');
    clearTimeout(toastUhr); toastUhr = setTimeout(() => t.classList.remove('da'), ms);
  }
  function geheimnis(id) {
    if (S.geheim.has(id)) return;
    S.geheim.add(id); merken();
    const titel = (E.geheimnisse.liste.find(([x]) => x === id) || [, ''])[1], n = S.geheim.size;
    setTimeout(() => { toast(E.geheimnisse.neu.replace('{titel}', titel).replace('{n}', n)); TON.ding(); }, 500);
    if (n === E.geheimnisse.liste.length) setTimeout(() => toast(E.geheimnisse.alle, 4500), 4200);
  }

  /* ---------- 10 · Szenenauswahl ---------- */
  function kachelnBauen() {
    $('kacheln').innerHTML = E.kapitel.map((k, i) =>
      `<button class="kachel${i === E.kapitel.length - 1 ? ' finale' : ''}" type="button" data-kapitel="${i}" aria-label="Kapitel ${i + 1}: ${esc(k.titel)}${S.gesichtet.has(i) ? ', gesichtet' : ''}">
        <span class="bild">${M.kapitelMotiv(i)}<span class="nr">${i + 1}</span>${S.gesichtet.has(i) ? '<span class="gesichtet">gesichtet</span>' : ''}${k.siegel ? `<span class="siegel">${esc(k.siegel)}</span>` : ''}</span>
        <span class="titel">${esc(k.titel)}</span></button>`).join('');
  }
  $('kacheln').addEventListener('click', e => { const b = e.target.closest('[data-kapitel]'); if (b) miniTrailer(+b.dataset.kapitel); });
  let mtNr = 0, mtAkt = 0;
  async function miniTrailer(i) {
    const nr = ++mtNr; mtAkt = i;
    const k = E.kapitel[i], mt = $('minitrailer'), fin = i === E.kapitel.length - 1;
    mt.hidden = false; mt.classList.remove('lauf'); mt.classList.toggle('endgame', fin);
    mt.style.setProperty('--akzent', M.kapitelAkzent(i));
    $('mtBild').innerHTML = M.kapitelMotiv(i) + (k.siegel ? `<span class="siegel mt-siegel">${esc(k.siegel)}</span>` : '');
    $('mtNr').textContent = `Kapitel ${p2(i + 1)}`; $('mtTitel').textContent = k.titel; $('mtTeaser').textContent = k.teaser;
    ['mtNr', 'mtTitel', 'mtTeaser'].forEach(id => $(id).classList.remove('da'));
    void mt.offsetWidth; mt.classList.add('lauf');
    K.schleifeDucken(true); TON.whoosh(0.5, 0.4); TON.kapitel(i);
    await warte(600); if (nr !== mtNr) return; $('mtNr').classList.add('da');
    await warte(700); if (nr !== mtNr) return; $('mtTeaser').classList.add('da');
    await warte(fin ? 2300 : 2000); if (nr !== mtNr) return;
    $('mtTitel').classList.add('da'); TON.kapitelTitel(i); beben(mt);
    if (fin) { blitz(); vib([80, 40, 120]); setTimeout(() => { beben(mt); blitz(); }, 420); T.quelle('glut', { rate: 30, dauer: 3 }); }
    S.gesichtet.add(i); merken();
    await warte(2600); if (nr !== mtNr) return;
    K.schleifeDucken(false);
  }
  function miniTrailerZu() {
    if ($('minitrailer').hidden) return;
    mtNr++; $('minitrailer').hidden = true; K.schleifeDucken(false); T.alleWeg();
    kachelnBauen();
    const b = document.querySelector(`[data-kapitel="${mtAkt}"]`); if (b) b.focus({ preventScroll: false });
  }
  $('mtZurueck').addEventListener('click', () => { TON.klick(); miniTrailerZu(); });
  $('mtWeiter').addEventListener('click', () => { TON.klick(); miniTrailer((mtAkt + 1) % E.kapitel.length); });

  /* ---------- 11 · Besetzungsliste ---------- */
  function besetzungBauen() {
    const meine = rolle(), regie = istRegie();
    const plakat = (r, meins) => {
      const b = E.steckbrief[r] || {};
      return `<div class="plakat${meins ? ' meins' : ''}">${meins ? `<div class="meins-bild">${M.fotofeld(initial())}</div>` : M.silhouette()}
        <div class="p-text"><div class="p-name">${meins ? esc(S.name) : '???'}</div><div class="p-rolle">${esc(r)}</div>
        <div class="p-frage">${meins ? 'Das bist du. Am 18.11. auf dem großen Bildschirm.' : esc(`${b.frage} ${E.besetzung.anhang}`)}</div></div></div>`;
    };
    const liste = R.ROLLEN.filter(r => regie || r !== meine);
    const kopf = regie
      ? `<div class="plakat meins"><div class="meins-bild">${M.fotofeld(initial())}</div><div class="p-text"><div class="p-name">${esc(S.name)}</div><div class="p-rolle">${esc(E.regie.rolle)}</div><div class="p-frage">${esc(E.regie.satz)}</div></div></div>`
      : plakat(meine, true);
    $('plakate').innerHTML = kopf + liste.map(r => plakat(r, false)).join('');
  }

  /* ---------- 12 · Bonusmaterial ---------- */
  function bonusBauen() {
    const n = S.geheim.size, alle = E.geheimnisse.liste;
    $('geheimnisBox').innerHTML = `<p class="zaehler">${esc(E.geheimnisse.zaehler.replace('{n}', n))}</p>
      <div class="mini-discs" aria-hidden="true">${alle.map(([id]) => `<i class="${S.geheim.has(id) ? 'ja' : ''}"></i>`).join('')}</div>
      <ul>${alle.map(([id, t]) => (S.geheim.has(id) ? `<li>${esc(t)}</li>` : '<li class="nein">???</li>')).join('')}</ul>
      ${n === alle.length ? `<p style="margin:10px 0 0;color:#ffe58a">${esc(E.geheimnisse.alle)}</p>` : ''}`;
    if (!$('extras').childElementCount) {
      $('extras').innerHTML = E.bonus.map(b => `<details class="extra"><summary>${esc(b.titel)}</summary><div class="text">${esc(b.text)}</div></details>`).join('');
      $('extras').querySelectorAll('details').forEach(d => d.addEventListener('toggle', () => { if (d.open) TON.whoosh(0.32, 0.22); else TON.klick(); }));
    }
  }

  /* ---------- 13 · Backstage-Pass ---------- */
  function passNummer() {
    let h = 2166136261 >>> 0;
    for (const c of R.rollenSchluessel(S.name)) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619) >>> 0; }
    return 'FA2-' + String(h % 10000).padStart(4, '0');
  }
  function barcode() {
    let h = 7, x = 0, s = '';
    for (const c of S.name + passNummer()) h = (h * 31 + c.charCodeAt(0)) % 2147483647;
    while (x < 200) { h = (h * 48271) % 2147483647; const b = 1 + (h % 3); const l = 1 + ((h >> 3) % 3); s += `<rect x="${x}" width="${b}" height="40"/>`; x += b + l; }
    return `<svg viewBox="0 0 200 40" preserveAspectRatio="none" aria-hidden="true"><g fill="#0a0f1e">${s}</g></svg>`;
  }
  function passCountdown() {
    const z = zustand(), r = rest();
    if (z !== 'vorbei' && entwertetZeit()) return fuell(E.tuer.countdown);
    if (z === 'laeuft') return 'Läuft gerade · ab ins Wohnzimmer!';
    if (z === 'vorbei') return 'Danke fürs Mitspielen · Fortsetzung folgt';
    return `${heute() ? 'Heute Abend! · ' : ''}Noch ${r.tage} T · ${r.std} Std · ${r.min} Min bis zum Vorspann`;
  }
  function passBauen() {
    const regie = istRegie(), gold = S.geheim.size >= E.geheimnisse.liste.length;
    $('bandText').textContent = Array(6).fill(E.pass.band).join(' · ');
    const pass = $('passKarte'); pass.classList.toggle('regie', regie); pass.classList.remove('umgedreht');
    $('passVorne').innerHTML = `<div class="loch"></div>
      <div class="p-streifen">${regie ? esc(E.regie.passTitel + ' · ALL ACCESS*') : esc(E.pass.streifen)}</div>
      <div class="p-logo"><div class="logo"><span class="zwei goldtext">${esc(E.zahl)}</span><span class="wort chrom">${esc(E.titel)}</span></div><br><span class="ed">${esc(E.zusatz)}</span></div>
      <div class="p-mitte"><div class="p-foto">${M.fotofeld(initial())}</div>
        <div class="stempel">${esc(regie ? E.check.regieStempel : E.check.stempel)}</div>
        <div><div class="p-name chrom" id="passName">${esc(S.name)}</div><div class="p-rolle goldtext">${esc(regie ? E.regie.passZeile : rolle())}</div></div></div>
      <div class="p-felder">
        <div><small>Datum</small><b>${esc(E.datumPass)}</b></div><div><small>Einlass</small><b>${esc(E.uhrzeitPass)}</b></div>
        <div class="voll"><small>Saal</small><b>${esc(E.ortPass)}</b></div>
        <div class="voll"><small>Platz</small><b>${esc(E.platz)}</b></div>
        <div><small>Zugang</small><b>${esc(E.pass.zugang)}</b></div><div><small>Pass-Nr.</small><b>${esc(passNummer())}</b></div>
      </div>
      <div class="holo" id="holo"></div>
      <div class="p-unten"><div class="p-countdown" id="passCountdown">${esc(passCountdown())}</div>
        <div class="p-code">${barcode()}<div class="sticker${gold ? ' gold' : ''}">${gold ? esc(E.pass.sticker) : 'Platz für Sticker'}</div></div>
        <div class="p-fuss">${esc(E.pass.fussnote)}</div></div>${abrissHtml()}`;
    groesse($('passName'), 30, 0.4, 15);
    passBauen.stand = abrissZustand(); abrissVerdrahten();
    const hw = $('passHinweis'), tz = passBauen.stand;
    hw.textContent = tz === 'offen' ? E.tuer.hinweis : tz === 'entwertet' ? fuell(E.tuer.hinweisEntwertet) : E.pass.umdrehen;
    hw.classList.toggle('tuer', tz === 'offen');
    $('passHinten').innerHTML = `<h3>Rückseite · Bedingungen</h3><p>${esc(E.pass.rueckseite)}</p>
      <h3>Mitbringen</h3><ul>${E.pass.mitbringen.map(x => `<li>${esc(x)}</li>`).join('')}</ul><p>${esc(E.pass.nichtMitbringen)}</p>
      <div class="r-logo">${esc(E.titel)} ${esc(E.zahl)} · ${esc(E.zusatz)}<br><small>${esc(passNummer())}</small></div>`;
  }
  function passZeigen() {
    passBauen();
    const l = $('lanyard'); l.classList.remove('schwingt'); void l.offsetWidth;
    if (!ruhig) { l.classList.add('schwingt'); setTimeout(() => TON.karabiner(), 700); setTimeout(() => TON.passFanfare(), 850); }
    else TON.passFanfare();
  }
  // Hologramm schimmert beim Wischen, Tippen dreht den Pass um
  const passKarte = $('passKarte');
  let passDruck = null;
  passKarte.addEventListener('pointerdown', e => { passDruck = { x: e.clientX, y: e.clientY }; });
  passKarte.addEventListener('pointermove', e => {
    const r = passKarte.getBoundingClientRect(), holo = $('holo'); if (!holo) return;
    holo.style.setProperty('--hx', (((e.clientX - r.left) / r.width) * 120).toFixed(0));
    holo.style.setProperty('--hy', (((e.clientY - r.top) / r.height) * 100).toFixed(0));
  });
  passKarte.addEventListener('pointerup', e => {
    if (!passDruck) return;
    const weit = Math.hypot(e.clientX - passDruck.x, e.clientY - passDruck.y) > 12; passDruck = null;
    if (!weit) umdrehen();
  });
  passKarte.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); umdrehen(); } });
  function umdrehen() { passKarte.classList.toggle('umgedreht'); TON.papier(); }

  /* ---------- 14 · Tür-Ritual: Pass entwerten (nur am Abend) ---------- */
  // Unten am Pass sitzt ein Abschnitt mit Perforation. Der Gastgeber wischt an der Tür einmal quer darüber (mindestens 70 %
  // der Breite, überwiegend waagerecht, in einem Zug). Dann fällt der Abschnitt ab und der Stempel ENTWERTET knallt drauf.
  // Tippen, Scrollen oder ein kurzer Wischer lösen nichts aus. Mit Tastatur: zweimal Enter.
  const ABRISS_ANTEIL = 0.7;
  function stempelHtml(knall) {
    return `<div class="stempel entwertet ${knall ? 'knall' : 'da'}" id="passEntwertet" role="img" aria-label="${esc(fuell(E.tuer.ariaEntwertet))}">
      <b>${esc(E.tuer.stempel)}</b><small>${esc(entwertetZeit())} · ${esc(E.tuer.willkommen)}</small></div>`;
  }
  function abrissHtml() {
    const z = abrissZustand();
    if (z === 'aus') return '';
    const fertig = z === 'entwertet';
    return (fertig ? stempelHtml(false) : '') +
      `<div class="p-abriss${fertig ? ' fertig' : ''}" id="passAbriss" ${fertig ? '' : `role="button" tabindex="0" aria-label="${esc(E.tuer.aria)}"`}>
        <i class="ab-schnitt" id="abSchnitt" aria-hidden="true"></i>
        <div class="ab-stub" aria-hidden="${fertig}"><b>${esc(E.tuer.vorzeigen)}</b><span id="abText">${esc(E.tuer.wischen)}</span>
          <i class="ab-pfeile" aria-hidden="true"><i></i><i></i><i></i></i><i class="ab-glanz" aria-hidden="true"></i></div>
        <div class="ab-rest" id="abRest">${fertig ? '✂ ' + esc(fuell(E.tuer.abschnitt)) : ''}</div>
      </div>`;
  }
  let abZug = null, abEnter = 0;
  function abrissVerdrahten() {
    const ab = $('passAbriss'); if (!ab || ab.classList.contains('fertig')) return;
    const schnitt = $('abSchnitt');
    const zeichnen = (von, bis, w) => { schnitt.style.transform = `translateX(${Math.min(von, bis).toFixed(1)}px) scaleX(${(Math.abs(bis - von) / w).toFixed(3)})`; };
    const zurueck = () => { schnitt.classList.add('zurueck'); schnitt.style.transform = ''; schnitt.classList.remove('an'); setTimeout(() => schnitt.classList.remove('zurueck'), 260); };
    const hinweis = () => { $('abText').textContent = E.tuer.nurWischen; wackeln(ab.querySelector('.ab-stub')); TON.trocken(); };
    ab.addEventListener('pointerdown', e => {
      e.stopPropagation(); // sonst dreht sich der Pass um
      if (abrissZustand() !== 'offen' || abZug) return;
      const r = ab.getBoundingClientRect();
      abZug = { id: e.pointerId, x0: e.clientX, y0: e.clientY, l: r.left, w: r.width, dyMax: 0, weg: 0 };
      try { ab.setPointerCapture(e.pointerId); } catch (x) { /* egal */ }
    });
    ab.addEventListener('pointermove', e => {
      if (!abZug || e.pointerId !== abZug.id) return;
      e.stopPropagation();
      const z = abZug, dx = e.clientX - z.x0, dy = Math.abs(e.clientY - z.y0);
      z.dyMax = Math.max(z.dyMax, dy); z.weg = Math.max(z.weg, Math.abs(dx));
      // Zu steil: das ist Scrollen, kein Wisch
      if (z.dyMax > Math.max(44, Math.abs(dx) * 0.6)) { abZug = null; return zurueck(); }
      schnitt.classList.add('an'); zeichnen(z.x0 - z.l, e.clientX - z.l, z.w);
      if (Math.abs(dx) >= z.w * ABRISS_ANTEIL) { abZug = null; zeichnen(0, z.w, z.w); entwerten(); }
    });
    const ende = e => {
      if (!abZug || e.pointerId !== abZug.id) return;
      e.stopPropagation();
      const z = abZug; abZug = null;
      zurueck();
      if (e.type === 'pointerup' && z.weg < 10) hinweis();
    };
    ab.addEventListener('pointerup', ende);
    ab.addEventListener('pointercancel', ende);
    ab.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault(); e.stopPropagation();
      const n = performance.now();
      if (n - abEnter < 3000) { abEnter = 0; schnitt.classList.add('an'); zeichnen(0, ab.clientWidth, ab.clientWidth); return entwerten(); }
      abEnter = n; hinweis();
    });
  }
  function entwerten() {
    if (abrissZustand() !== 'offen') return;
    const n = jetzt();
    S.entwertet = { zeit: `${p2(n.getHours())}:${p2(n.getMinutes())}`, ms: n.getTime(), probe: zeitVersatz !== 0 };
    merken();
    passBauen.stand = 'entwertet';
    const ab = $('passAbriss');
    ab.classList.add('fertig', 'reisst'); ab.removeAttribute('role'); ab.removeAttribute('tabindex'); ab.removeAttribute('aria-label');
    ab.querySelector('.ab-stub').setAttribute('aria-hidden', 'true');
    $('abRest').textContent = '✂ ' + fuell(E.tuer.abschnitt);
    TON.papier(); vib(25);
    setTimeout(() => {
      if (aktSzene !== 'pass' || $('passEntwertet')) return;
      $('passVorne').insertAdjacentHTML('beforeend', stempelHtml(true));
      TON.stempel(1.2); vib(90); beben(passKarte.parentElement);
      const st = $('passEntwertet').getBoundingClientRect();
      T.stoss('funken', 16, { x: st.left + st.width / 2, y: st.top + st.height * 0.6, b: st.width * 0.45 });
      const c = $('passCountdown'); if (c) c.textContent = passCountdown();
      const hw = $('passHinweis'); hw.textContent = fuell(E.tuer.hinweisEntwertet); hw.classList.remove('tuer');
    }, ruhig ? 0 : 240);
  }
  if (window.DeviceOrientationEvent && !ruhig) {
    addEventListener('deviceorientation', e => {
      if (aktSzene !== 'pass' || e.gamma == null) return;
      const holo = $('holo'); if (!holo) return;
      holo.style.setProperty('--hx', (60 + e.gamma * 2).toFixed(0)); holo.style.setProperty('--hy', (50 + (e.beta - 45)).toFixed(0));
    });
  }

  /* Kalender (.ics, ohne Adresse) */
  $('kalender').addEventListener('click', () => {
    TON.klick();
    const f = ([j, m, t, h, mi]) => `${j}${p2(m)}${p2(t)}T${p2(h)}${p2(mi)}00`;
    const txt = s => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
    const falten = z => { const teile = []; let rest_ = z; while (rest_.length > 70) { teile.push(rest_.slice(0, 70)); rest_ = rest_.slice(70); } teile.push(rest_); return teile.join('\r\n '); };
    const stempel = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Quizabend//Filmabend 2//DE', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
      `UID:filmabend-2-${f(E.beginn)}-${passNummer()}@quizabend`, `DTSTAMP:${stempel}`, `DTSTART:${f(E.beginn)}`, `DTEND:${f(E.kalenderEnde)}`,
      `SUMMARY:${txt(E.pass.kalenderTitel)}`, `LOCATION:${txt(E.ortKalender)}`, `DESCRIPTION:${txt(fuell(E.pass.kalenderText))}`,
      'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Filmabend 2 · Handy laden!', 'TRIGGER:-PT3H', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].map(falten).join('\r\n');
    // iPhone/iPad (auch im WhatsApp-Browser): feste Datei ohne Name und Rolle – GitHub Pages liefert sie als text/calendar,
    // dann bietet iOS „Zum Kalender hinzufügen“ an. data:-Adressen und Downloads klappen dort oft nicht.
    const ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (ios) { location.href = 'filmabend-2.ics'; return; }
    herunterladen(new Blob([ics], { type: 'text/calendar;charset=utf-8' }), 'filmabend-2.ics');
  });
  function herunterladen(blob, name) {
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = name; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  /* Pass als Bild (Canvas → PNG) */
  $('alsBild').addEventListener('click', async () => {
    TON.klick();
    const knopf = $('alsBild'), alt = knopf.textContent; knopf.textContent = 'Wird entwickelt …';
    try {
      const blob = await passBild();
      const name = 'backstage-pass-filmabend-2.png';
      if (beruehrung && window.File && navigator.canShare) {
        const datei = new File([blob], name, { type: 'image/png' });
        if (navigator.canShare({ files: [datei] })) {
          try { await navigator.share({ files: [datei], title: 'Backstage-Pass · Filmabend 2' }); knopf.textContent = alt; return; }
          catch (e) { if (e && e.name === 'AbortError') { knopf.textContent = alt; return; } }
        }
      }
      herunterladen(blob, name);
      knopf.textContent = 'Gespeichert ✓';
    } catch (e) {
      knopf.textContent = 'Ging nicht – mach lieber einen Screenshot';
    }
    setTimeout(() => { knopf.textContent = alt; }, 3500);
  });
  async function passBild() {
    try { await Promise.all(['700 40px Cinzel', '500 20px Oswald', '400 16px Atkinson', '700 16px Atkinson'].map(f => document.fonts.load(f))); } catch (e) { /* egal */ }
    const W = 720, H = 1144, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const g = cv.getContext('2d'), regie = istRegie();
    const rund = (x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
    const verlauf = (y0, y1, stopps) => { const v = g.createLinearGradient(0, y0, 0, y1); stopps.forEach(([o, c]) => v.addColorStop(o, c)); return v; };
    const CHROM = [[0, '#ffffff'], [0.34, '#eef2fa'], [0.5, '#8a98b9'], [0.58, '#d3dbeb'], [0.72, '#f7f9fd'], [1, '#9aa6c2']];
    const GOLD = [[0, '#fff6c8'], [0.34, '#ffd65a'], [0.54, '#b67d12'], [0.7, '#ffd36b'], [1, '#8f5e06']];
    const umbruch = (text, maxB) => { const w = text.split(' '), z = []; let l = ''; for (const x of w) { const t = l ? l + ' ' + x : x; if (g.measureText(t).width > maxB && l) { z.push(l); l = x; } else l = t; } z.push(l); return z; };
    // Karte
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    rund(20, 20, W - 40, H - 40, 40); g.save(); g.clip();
    g.fillStyle = verlauf(20, H, regie ? [[0, '#3a2600'], [0.5, '#140d00'], [1, '#050300']] : [[0, '#1a3270'], [0.4, '#0d1b42'], [1, '#050915']]); g.fillRect(0, 0, W, H);
    g.fillStyle = '#000'; rund(W / 2 - 52, 44, 104, 18, 9); g.fill();
    // Streifen
    const sv = g.createLinearGradient(0, 0, W, 0); sv.addColorStop(0, '#d9a422'); sv.addColorStop(0.5, '#ffe58a'); sv.addColorStop(1, '#d9a422');
    g.fillStyle = sv; g.fillRect(20, 84, W - 40, 44);
    g.fillStyle = '#241600'; g.font = '500 24px Oswald, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    if ('letterSpacing' in g) g.letterSpacing = '5px';
    g.fillText(regie ? E.regie.passTitel + ' · ALL ACCESS*' : E.pass.streifen, W / 2, 107);
    if ('letterSpacing' in g) g.letterSpacing = '0px';
    // Logo
    g.font = '700 150px Cinzel, serif'; g.fillStyle = verlauf(140, 290, GOLD); g.globalAlpha = 0.95; g.fillText(E.zahl, W / 2, 222); g.globalAlpha = 1;
    g.font = '700 66px Cinzel, serif'; g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowOffsetY = 4; g.fillStyle = verlauf(185, 255, CHROM); g.fillText(E.titel, W / 2, 222); g.shadowColor = 'transparent';
    g.fillStyle = verlauf(282, 316, [[0, '#ffe58a'], [1, '#d9a422']]); rund(W / 2 - 120, 282, 240, 34, 6); g.fill();
    g.fillStyle = '#2e1e00'; g.font = '500 20px Oswald, sans-serif'; g.fillText(E.zusatz.toUpperCase(), W / 2, 300);
    // Fotofeld
    const fx = 54, fy = 350, fw = 210, fh = 252;
    g.save(); rund(fx, fy, fw, fh, 16); g.clip();
    g.fillStyle = verlauf(fy, fy + fh, [[0, '#0c1a3d'], [1, '#02040c']]); g.fillRect(fx, fy, fw, fh);
    g.fillStyle = verlauf(fy, fy + fh, [[0, 'rgba(255,246,208,.7)'], [1, 'rgba(255,246,208,0)']]);
    g.beginPath(); g.moveTo(fx + fw * 0.42, fy); g.lineTo(fx + fw * 0.58, fy); g.lineTo(fx + fw * 0.94, fy + fh); g.lineTo(fx + fw * 0.06, fy + fh); g.fill();
    g.fillStyle = '#111'; g.fillRect(fx + 45, fy + 150, 120, 72);
    g.save(); g.translate(fx + 45, fy + 146); g.rotate(-0.24); g.fillRect(0, -20, 120, 22);
    g.fillStyle = '#f3f7ff'; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(8 + i * 30, -20); g.lineTo(24 + i * 30, -20); g.lineTo(12 + i * 30, 2); g.lineTo(-4 + i * 30, 2); g.fill(); }
    g.restore();
    g.fillStyle = '#ffd36b'; g.font = '700 50px Cinzel, serif'; g.fillText(initial(), fx + 105, fy + 190);
    g.restore();
    g.strokeStyle = 'rgba(196,232,255,.4)'; g.lineWidth = 3; rund(fx, fy, fw, fh, 16); g.stroke();
    // Name und Rolle
    g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    let gr = 64; g.font = `700 ${gr}px Cinzel, serif`;
    while (g.measureText(S.name).width > 370 && gr > 30) { gr -= 2; g.font = `700 ${gr}px Cinzel, serif`; }
    const nz = umbruch(S.name, 370);
    let y = 400 + gr * 0.4;
    g.fillStyle = verlauf(y - gr, y + gr * nz.length, CHROM);
    nz.forEach((z, i) => g.fillText(z, 292, y + i * gr * 1.05));
    y += (nz.length - 1) * gr * 1.05 + 46;
    g.font = '500 27px Oswald, sans-serif'; g.fillStyle = verlauf(y - 30, y + 90, GOLD);
    umbruch(regie ? E.regie.passZeile : rolle(), 370).forEach((z, i) => g.fillText(z, 292, y + i * 34));
    // Felder
    const feldZ = (x, yy, l, w) => { g.font = '500 19px Oswald, sans-serif'; g.fillStyle = '#7f9ccc'; g.fillText(l.toUpperCase(), x, yy); g.font = '700 26px Atkinson, sans-serif'; g.fillStyle = '#eef3fb'; g.fillText(w, x, yy + 32); };
    feldZ(54, 650, 'Datum', E.datumPass); feldZ(380, 650, 'Einlass', E.uhrzeitPass);
    feldZ(54, 724, 'Saal', E.ortPass); feldZ(54, 798, 'Platz', E.platz);
    feldZ(54, 872, 'Zugang', E.pass.zugang); feldZ(380, 872, 'Pass-Nr.', passNummer());
    // Hologramm-Streifen
    const hv = g.createLinearGradient(0, 340, 0, 640); ['#ff7ad9', '#7ff3ff', '#ffe58a', '#b6ffb0', '#c8a8ff', '#ff7ad9'].forEach((c, i, a) => hv.addColorStop(i / (a.length - 1), c));
    g.globalAlpha = 0.85; g.fillStyle = hv; g.fillRect(W - 54, 340, 34, 300); g.globalAlpha = 1;
    // Countdown, Barcode, Sticker, Fußnote
    g.textAlign = 'center'; g.font = '500 22px Oswald, sans-serif'; g.fillStyle = '#8fe3ff'; g.fillText(passCountdown().toUpperCase(), W / 2, 950);
    g.fillStyle = '#f3f7ff'; rund(54, 975, 470, 76, 6); g.fill(); g.fillStyle = '#0a0f1e';
    let h = 7, bx = 66; for (const c of S.name + passNummer()) h = (h * 31 + c.charCodeAt(0)) % 2147483647;
    while (bx < 512) { h = (h * 48271) % 2147483647; const b = 2 + (h % 3) * 2, l = 2 + ((h >> 3) % 3) * 2; if (bx + b > 512) break; g.fillRect(bx, 985, b, 56); bx += b + l; }
    const gold = S.geheim.size >= E.geheimnisse.liste.length;
    g.save(); g.translate(600, 1013);
    if (gold) {
      const cg = g.createConicGradient ? g.createConicGradient(0, 0, 0) : null;
      if (cg) { ['#ffe58a', '#c8921a', '#fff3c0', '#d9a422', '#ffe58a'].forEach((c, i, a) => cg.addColorStop(i / (a.length - 1), c)); g.fillStyle = cg; } else g.fillStyle = '#ffd36b';
      g.beginPath(); g.arc(0, 0, 50, 0, 7); g.fill(); g.fillStyle = '#3a2700'; g.beginPath(); g.arc(0, 0, 6, 0, 7); g.fill();
      g.rotate(-0.2); g.font = '500 13px Oswald, sans-serif'; g.fillText(E.pass.sticker, 0, -24);
    } else { g.setLineDash([6, 5]); g.strokeStyle = 'rgba(196,232,255,.45)'; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 46, 0, 7); g.stroke(); }
    g.restore();
    g.font = '400 18px Atkinson, sans-serif'; g.fillStyle = '#7f9ccc'; g.fillText(E.pass.fussnote, W / 2, 1085);
    // Stempel (über der Foto-Ecke, nicht über Countdown und Barcode)
    g.save(); g.translate(236, 590); g.rotate(-0.16); g.strokeStyle = 'rgba(227,38,63,.85)'; g.fillStyle = 'rgba(227,38,63,.85)'; g.lineWidth = 7;
    g.font = '500 46px Oswald, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    const st = regie ? E.check.regieStempel : E.check.stempel, sw = g.measureText(st).width + 40;
    rund(-sw / 2, -40, sw, 80, 10); g.stroke(); g.fillText(st, 0, 3); g.restore();
    // Tür-Ritual: Stempel ENTWERTET über den Feldern
    const ez = entwertetZeit();
    if (ez) {
      g.save(); g.translate(W / 2, 760); g.rotate(-0.19); g.strokeStyle = 'rgba(255,53,80,.92)'; g.fillStyle = 'rgba(255,53,80,.92)'; g.lineWidth = 8;
      g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '500 84px Oswald, sans-serif';
      if ('letterSpacing' in g) g.letterSpacing = '8px';
      const ew = g.measureText(E.tuer.stempel).width + 56;
      rund(-ew / 2, -74, ew, 148, 14); g.fillStyle = 'rgba(20,0,6,.86)'; g.fill(); g.stroke();
      g.fillStyle = 'rgba(255,53,80,.92)'; g.fillText(E.tuer.stempel, 0, -16);
      g.font = '500 30px Oswald, sans-serif'; if ('letterSpacing' in g) g.letterSpacing = '5px';
      g.fillText(`${ez} · ${E.tuer.willkommen}`.toUpperCase(), 0, 44);
      if ('letterSpacing' in g) g.letterSpacing = '0px';
      g.restore();
    }
    // Laminat-Glanz
    const gl = g.createLinearGradient(0, 0, W, H); gl.addColorStop(0, 'rgba(255,255,255,.16)'); gl.addColorStop(0.3, 'rgba(255,255,255,0)'); gl.addColorStop(0.7, 'rgba(255,255,255,0)'); gl.addColorStop(1, 'rgba(255,255,255,.07)');
    g.fillStyle = gl; g.fillRect(0, 0, W, H);
    g.restore();
    g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 2; rund(20, 20, W - 40, H - 40, 40); g.stroke();
    return new Promise((ok, f) => cv.toBlob(b => (b ? ok(b) : f(new Error('kein Bild'))), 'image/png'));
  }

  /* ---------- Uhr: Countdown live ---------- */
  setInterval(() => {
    if (aktSzene === 'menue') anzeigeZeichnen(false);
    if (aktSzene === 'pass') {
      const c = $('passCountdown'); if (c) c.textContent = passCountdown();
      if (!abZug && abrissZustand() !== passBauen.stand) passBauen();
    }
    if (!$('meldung').hidden && $('meldungTitel').textContent === E.menue.filmStartenTitel && zustand() === 'vor') $('meldungText').textContent = E.menue.filmStartenVor.replace('{rest}', restText());
  }, 1000);

  /* Escape schließt Überlagerungen */
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (!$('meldung').hidden) return meldungZu();
    if (!$('minitrailer').hidden) return miniTrailerZu();
    if (!$('outtakes').hidden) return outtakesZu();
  });

  /* ---------- Testabkürzungen ---------- */
  function springe(ab) {
    if (['logo', 'trailer', 'titel', 'freigabe', 'starring'].includes(ab)) return vorspann(ab, 'akte');
    if (ab === 'check') return gaestelisteCheck();
    zeigeSzene(ab);
  }

  /* ---------- Start ---------- */
  const q = new URLSearchParams(location.search);
  if (q.get('jetzt')) { const d = new Date(q.get('jetzt')); if (!isNaN(d)) zeitVersatz = d - Date.now(); }
  // Geheimer Regie-Schalter für Chris: ?regie=1 an, ?regie=0 aus (bleibt auf diesem Handy gespeichert)
  if (q.has('regie')) { S.regie = q.get('regie') !== '0'; merken(); }
  const testName = saeubern(q.get('name') || '').slice(0, E.maxNamenLaenge);
  const testAb = q.get('ab');
  const SZENEN = ['check', 'logo', 'trailer', 'titel', 'freigabe', 'starring', 'akte', 'menue', 'kapitel', 'besetzung', 'bonus', 'pass'];
  if (testName && !istBeispiel(testName)) {
    S.test = true; S.name = testName; S.unterschrieben = false; S.entwertet = null;
    if (testAb && SZENEN.includes(testAb)) {
      feld.value = testName; startAb = testAb === 'check' ? 'logo' : testAb;
      einlassZeigen();
    } else zeigeSzene('akte');
    console.info('[Filmabend 2] Testmodus:', testName, '→', rolle(), '| rolleFuer() =', window.rolleFuer(testName));
  } else if (S.name && !istBeispiel(S.name)) {
    willkommenZeigen();
  } else {
    S.name = '';
    einlassZeigen();
  }
})();
