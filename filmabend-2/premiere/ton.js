/* ===== Filmabend 2 · Premiere: Klang =====
   Alles selbst gebaut mit Web Audio (keine bekannten Melodien), außer Trommelwirbel und Jubel (freie CC0-Aufnahmen, als MP3,
   weil Safari auf dem iPhone OGG oft nicht abspielt). Alles läuft über einen Kinosaal-Hall und einen Begrenzer.
   Abläufe (Trailer, Vorspann) hängen an einem eigenen „Bus“, den Überspringen hart oder weich abschneidet.
   Ton startet erst nach einem Tipp (Einlass-Knopf), sonst sperrt der Browser. */
(function () {
  'use strict';
  let ctx = null, master = null, hall = null, stumm = false, bus = null, rauschPuffer = null, geste = false;
  // pausiert: Seite im Hintergrund – dann weckt auch der nächste Klang den Ton nicht wieder auf
  let pausiert = false;
  /** resume()/suspend() liefern ein Promise; dessen Fehler (iOS) still abfangen */
  const still = p => { if (p && p.catch) p.catch(() => {}); };
  let pegelFaktor = 1; // siehe TON.gedaempft()
  const puffer = {}, laedt = {};
  const DATEIEN = { wirbel: 'klaenge/trommelwirbel.mp3', jubel: 'klaenge/jubel.mp3' };

  function audio() {
    if (stumm || pausiert) return null; // im Hintergrund nichts einplanen, sonst spielt bei der Rückkehr alles auf einmal
    if (!ctx && !geste) return null; // erst nach einem Tipp (sonst sperrt der Browser)
    if (!ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        // iPhone: Wiedergabe auch bei Lautlos-Schalter (Safari ab 17, sonst wirkungslos)
        try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* egal */ }
        ctx = new AC();
        const begrenzer = ctx.createDynamicsCompressor();
        begrenzer.threshold.value = -12; begrenzer.knee.value = 8; begrenzer.ratio.value = 14; begrenzer.attack.value = 0.002; begrenzer.release.value = 0.3;
        master = ctx.createGain(); master.gain.value = 0.85;
        master.connect(begrenzer); begrenzer.connect(ctx.destination);
        hall = ctx.createConvolver(); hall.buffer = raumImpuls(ctx, 4.2, 2.3);
        const hallPegel = ctx.createGain(); hallPegel.gain.value = 0.6;
        hall.connect(hallPegel); hallPegel.connect(master);
        rauschPuffer = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
        const d = rauschPuffer.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      } catch (e) { ctx = null; return null; }
    }
    if (ctx.state !== 'running' && !stumm && !pausiert) { try { still(ctx.resume()); } catch (e) { /* egal */ } }
    return ctx;
  }
  /** Im Tipp aufrufen: entsperrt den Ton (auch iOS) und lädt die Aufnahmen */
  function entsperren() {
    geste = true;
    const c = audio(); if (!c) return;
    try { const q = c.createBufferSource(); q.buffer = c.createBuffer(1, 1, 22050); q.connect(c.destination); q.start(0); } catch (e) { /* egal */ }
    for (const k of Object.keys(DATEIEN)) laden(k);
  }
  function laden(k) {
    if (puffer[k] || laedt[k] || !ctx) return;
    laedt[k] = fetch(DATEIEN[k]).then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
      .then(ab => new Promise((ok, f) => ctx.decodeAudioData(ab, ok, f)))
      .then(b => { puffer[k] = b; }).catch(() => { laedt[k] = null; });
  }
  function raumImpuls(c, sek, abfall) {
    const n = Math.floor(c.sampleRate * sek), b = c.createBuffer(2, n, c.sampleRate);
    for (let k = 0; k < 2; k++) { const d = b.getChannelData(k); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, abfall); }
    return b;
  }
  function rauschen(c, t, sek) {
    const q = c.createBufferSource(); q.buffer = rauschPuffer; q.loop = true;
    q.start(t, Math.random() * 2); q.stop(t + sek); return q;
  }
  function biss(c, menge) {
    const w = c.createWaveShaper(), n = 1024, k = new Float32Array(n);
    for (let i = 0; i < n; i++) { const x = (i / (n - 1)) * 2 - 1; k[i] = Math.tanh(x * menge); }
    w.curve = k; w.oversample = '2x'; return w;
  }
  /** Ausgang eines Klangs: trocken in den Bus (bzw. Master), ein Teil in den Hall */
  function ausgang(c, nass = 0.35, pan = 0) {
    const g = c.createGain(); g.gain.value = pegelFaktor;
    let ziel = g;
    if (pan && c.createStereoPanner) { const p = c.createStereoPanner(); p.pan.value = pan; g.connect(p); ziel = p; }
    ziel.connect(bus ? bus.trocken : master);
    if (nass > 0) { const s = c.createGain(); s.gain.value = nass; ziel.connect(s); s.connect(bus ? bus.nass : hall); }
    return g;
  }
  /** Hüllkurve: anschwellen, halten, abklingen */
  function kurve(c, ziel, t, spitze, an, halten, ab) {
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, spitze), t + an);
    g.gain.setValueAtTime(Math.max(0.0002, spitze), t + an + halten);
    g.gain.exponentialRampToValueAtTime(0.0001, t + an + halten + ab);
    g.connect(ziel); return g;
  }
  function osz(c, typ, fr, ziel, t, bis) { const o = c.createOscillator(); o.type = typ; o.frequency.value = fr; o.connect(ziel); o.start(t); o.stop(bis); return o; }
  function filter(c, typ, fr, q = 1) { const f = c.createBiquadFilter(); f.type = typ; f.frequency.value = fr; f.Q.value = q; return f; }
  /** Rauschstoß durch ein Filter */
  function stoss(c, t, { typ = 'bandpass', fr = 1000, q = 1, pegel = 0.3, an = 0.002, halten = 0, ab = 0.1, nass = 0.3, pan = 0, bis } = {}) {
    const f = filter(c, typ, fr, q); f.connect(kurve(c, ausgang(c, nass, pan), t, pegel, an, halten, ab));
    rauschen(c, t, bis || an + halten + ab + 0.05).connect(f); return f;
  }
  /** Ton mit Tonhöhen-Fall (Trommeln, Schläge) */
  function fall(c, t, von, nach, sek, pegel, ab, ziel, typ = 'sine') {
    const o = c.createOscillator(); o.type = typ; o.frequency.setValueAtTime(von, t); o.frequency.exponentialRampToValueAtTime(nach, t + sek);
    o.connect(kurve(c, ziel, t, pegel, 0.003, 0.02, ab)); o.start(t); o.stop(t + ab + 0.1);
  }
  /** Mitten-Anteil für Schläge: Rauschstoß im Band 300–1200 Hz plus Dreieck 240–420 Hz, damit Trommel, Stempel und Schlag
      auch auf dem Handy-Lautsprecher ankommen (die Sinus-Subs darunter hört dort niemand, sie füttern nur den Begrenzer) */
  function mitte(c, t, pegel, nass = 0.4, ab = 0.3) {
    stoss(c, t, { fr: 600, q: 0.6, pegel: 1.6 * pegel, an: 0.002, ab, nass });
    fall(c, t, 420, 240, 0.15, 0.8 * pegel, ab * 1.3, ausgang(c, nass * 0.8), 'triangle');
  }
  /** Aufnahme abspielen (Ausschnitt möglich); liefert den Pegel-Knoten */
  function datei(k, { wann = 0, ab = 0, dauer, pegel = 1, nass = 0.15 } = {}) {
    const c = audio(); if (!c || !puffer[k]) return null;
    const t = c.currentTime + wann;
    const q = c.createBufferSource(); q.buffer = puffer[k];
    const g = c.createGain(); g.gain.value = pegel; q.connect(g); g.connect(ausgang(c, nass));
    if (dauer) {
      g.gain.setValueAtTime(pegel, t + dauer - 0.04); g.gain.linearRampToValueAtTime(0, t + dauer);
      q.start(t, ab, dauer + 0.02);
    } else q.start(t, ab);
    return g;
  }

  /* ---------- Bus für Abläufe ---------- */
  function busStart() {
    const c = audio(); if (!c) return;
    busStopp(0.03);
    const trocken = c.createGain(), nass = c.createGain();
    trocken.connect(master); nass.connect(hall);
    bus = { trocken, nass };
  }
  function busStopp(sek = 0.6) {
    if (!bus || !ctx) { bus = null; return; }
    const t = ctx.currentTime, alt = bus;
    for (const g of [alt.trocken, alt.nass]) { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(0, t + sek); }
    setTimeout(() => { try { alt.trocken.disconnect(); alt.nass.disconnect(); } catch (e) { /* egal */ } }, sek * 1000 + 300);
    bus = null;
  }

  /* ---------- Menü-Schleife: 8 Takte, dunkel und leise (selbst komponiert) ---------- */
  const SCHLEIFE = {
    bpm: 76,
    // Akkorde je Takt (Hz): d-Moll, B, F, C, g-Moll, B, A sus4, A
    akkorde: [[146.8, 174.6, 220], [116.5, 146.8, 174.6], [130.8, 174.6, 220], [130.8, 164.8, 196], [98, 146.8, 116.5], [116.5, 146.8, 174.6], [110, 146.8, 164.8], [110, 138.6, 164.8]],
    bass: [73.4, 58.3, 87.3, 65.4, 49, 58.3, 55, 55],
    // Glöckchen: [Takt, Achtel, Hz]
    glocke: [[0, 0, 880], [0, 3, 698.5], [1, 2, 587.3], [2, 0, 880], [2, 5, 1046.5], [3, 4, 784], [4, 0, 698.5], [4, 3, 587.3], [5, 2, 523.3], [6, 0, 659.3], [6, 4, 587.3], [7, 2, 554.4]],
  };
  let schleife = null;
  function schleifeStart() {
    const c = audio(); if (!c || schleife) return;
    const pegel = c.createGain(); pegel.gain.setValueAtTime(0.0001, c.currentTime); pegel.gain.exponentialRampToValueAtTime(0.5, c.currentTime + 2.5);
    pegel.connect(master);
    const hallSend = c.createGain(); hallSend.gain.value = 0.5; pegel.connect(hallSend); hallSend.connect(hall);
    const s = { pegel, takt: 0, naechster: c.currentTime + 0.15, uhr: 0 };
    const viertel = 60 / SCHLEIFE.bpm, taktSek = viertel * 4, achtel = viertel / 2;
    const planen = () => {
      if (!ctx || ctx.state !== 'running') return;
      while (s.naechster < ctx.currentTime + 0.6) {
        const t = s.naechster, i = s.takt % 8;
        // Fläche
        const lp = filter(c, 'lowpass', 520 + (i % 2) * 120, 0.7); lp.connect(kurve(c, pegel, t, 0.09, 0.9, taktSek - 1.2, 1.4));
        SCHLEIFE.akkorde[i].forEach(fr => { osz(c, 'sawtooth', fr, lp, t, t + taktSek + 1.5); osz(c, 'triangle', fr * 1.003, lp, t, t + taktSek + 1.5); });
        // Bass-Puls auf Achteln, sehr weich
        for (let a = 0; a < 8; a++) {
          const ta = t + a * achtel, bl = filter(c, 'lowpass', 260);
          bl.connect(kurve(c, pegel, ta, a % 4 === 0 ? 0.16 : 0.07, 0.01, 0.05, achtel * 0.9));
          osz(c, 'triangle', SCHLEIFE.bass[i], bl, ta, ta + achtel + 0.1);
          if (a % 2 === 1) { const hp = filter(c, 'highpass', 7000); hp.connect(kurve(c, pegel, ta, 0.025, 0.001, 0, 0.04)); rauschen(c, ta, 0.06).connect(hp); }
        }
        // Glöckchen
        SCHLEIFE.glocke.filter(g => g[0] === i).forEach(([, a, fr]) => {
          const tg = t + a * achtel;
          osz(c, 'sine', fr, kurve(c, pegel, tg, 0.05, 0.004, 0, 1.6), tg, tg + 1.8);
          osz(c, 'sine', fr * 2.76, kurve(c, pegel, tg, 0.012, 0.002, 0, 0.6), tg, tg + 0.8);
        });
        s.takt++; s.naechster += taktSek;
      }
    };
    planen();
    s.uhr = setInterval(planen, 150);
    schleife = s;
  }
  function schleifeStopp(sek = 0.8) {
    if (!schleife) return;
    const s = schleife; schleife = null; clearInterval(s.uhr);
    if (ctx) { const t = ctx.currentTime; s.pegel.gain.cancelScheduledValues(t); s.pegel.gain.setValueAtTime(Math.max(0.0001, s.pegel.gain.value), t); s.pegel.gain.exponentialRampToValueAtTime(0.0001, t + sek); }
    setTimeout(() => { try { s.pegel.disconnect(); } catch (e) { /* egal */ } }, sek * 1000 + 3000);
  }
  function schleifeDucken(an) {
    if (!schleife || !ctx) return;
    const t = ctx.currentTime, g = schleife.pegel.gain;
    g.cancelScheduledValues(t); g.setValueAtTime(Math.max(0.0001, g.value), t); g.exponentialRampToValueAtTime(an ? 0.06 : 0.5, t + (an ? 0.3 : 1.5));
  }

  /* ---------- Klänge ---------- */
  const TON = {
    /** Klänge in fn um dB leiser (z. B. TON.gedaempft(-6, () => TON.braam(1.35, true))). Für den Lautstärke-Bogen: Der Begrenzer
        drückt alle großen Treffer auf etwa denselben Pegel, also müssen die Treffer vor dem Höhepunkt schon vorher leiser sein. */
    gedaempft(dB, fn) {
      const alt = pegelFaktor; pegelFaktor = alt * Math.pow(10, dB / 20);
      try { return fn(); } finally { pegelFaktor = alt; }
    },
    /** Samtseil: tiefes Klacken mit Hall */
    samtseil() {
      const c = audio(); if (!c) return; const t = c.currentTime;
      const aus = ausgang(c, 0.8);
      fall(c, t, 180, 60, 0.12, 0.7, 0.35, aus);
      stoss(c, t, { fr: 1800, q: 2, pegel: 0.35, ab: 0.05, nass: 0.8 });
      [880, 1318, 2093].forEach((fr, i) => osz(c, 'sine', fr, kurve(c, aus, t + 0.01, 0.05 / (i + 1), 0.002, 0, 0.9), t, t + 1.2));
    },
    /** Scanner-Piepen */
    piep(hoch = 0) {
      const c = audio(); if (!c) return; const t = c.currentTime;
      const lp = filter(c, 'lowpass', 3500); lp.connect(kurve(c, ausgang(c, 0.15), t, 0.07, 0.003, 0.05, 0.05));
      osz(c, 'square', 1500 + hoch * 300, lp, t, t + 0.12);
    },
    /** Tipp-Geräusch der Lade-Zeilen */
    tipp() {
      const c = audio(); if (!c) return; const t = c.currentTime;
      stoss(c, t, { fr: 3200 + Math.random() * 1200, q: 3, pegel: 0.08, ab: 0.03, nass: 0.05 });
    },
    /** Stempel: dumpfer Wumms mit Sub-Bass */
    stempel(stark = 1) {
      const c = audio(); if (!c) return; const t = c.currentTime;
      const aus = ausgang(c, 0.45);
      fall(c, t, 110, 38, 0.25, 0.7 * stark, 0.6, aus);
      fall(c, t, 60, 30, 0.5, 0.3 * stark, 0.9, ausgang(c, 0));
      stoss(c, t, { typ: 'lowpass', fr: 900, pegel: 0.5 * stark, ab: 0.12, nass: 0.4 });
      stoss(c, t + 0.005, { fr: 2400, q: 1.5, pegel: 0.22 * stark, ab: 0.05 });
      mitte(c, t, 1.5 * stark, 0.45, 0.28);
    },
    /** Studiologo: schimmernder Akkord mit Glocke, länger und mit Sub darunter */
    logo() {
      const c = audio(); if (!c) return; const t = c.currentTime;
      const aus = ausgang(c, 1.0);
      const lp = filter(c, 'lowpass', 600); lp.frequency.setValueAtTime(500, t); lp.frequency.exponentialRampToValueAtTime(4600, t + 2.6);
      lp.connect(kurve(c, aus, t, 0.045, 1.6, 1.6, 2.8));
      [146.8, 220, 293.7, 370, 440, 587.3, 659.3, 880].forEach((fr, i) => { osz(c, i % 2 ? 'triangle' : 'sawtooth', fr, lp, t, t + 6.2); osz(c, 'sine', fr * 1.004, lp, t, t + 6.2); });
      [1760, 2637, 3520, 4186].forEach((fr, i) => osz(c, 'sine', fr, kurve(c, aus, t + 1.4 + i * 0.06, 0.03, 0.005, 0, 3), t + 1.4, t + 5));
      osz(c, 'sine', 36.7, kurve(c, ausgang(c, 0), t, 0.1, 1.2, 1.8, 2.4), t, t + 5.6);
      osz(c, 'sine', 73.4, kurve(c, ausgang(c, 0.3), t, 0.07, 1.2, 1.8, 2.4), t, t + 5.6);
    },
    /** BRAAM: tiefes, verzerrtes Blech */
    braam(stark = 1, hoch = false, dunkel = 1) {
      const c = audio(); if (!c) return; const t = c.currentTime;
      const aus = ausgang(c, 0.55);
      const pegel = kurve(c, aus, t, 0.5 * stark * dunkel, 0.09, 1.3, 2.6);
      const lp = filter(c, 'lowpass', 110, 7);
      lp.frequency.setValueAtTime(110, t); lp.frequency.exponentialRampToValueAtTime(1500 * stark * dunkel, t + 0.32); lp.frequency.exponentialRampToValueAtTime(260, t + 3.8);
      const zerr = biss(c, 2.6); lp.connect(zerr); zerr.connect(pegel);
      const toene = [[55, 1], [54.7, 1], [55.3, 1], [82.4, 0.8], [110, 0.7], [27.5, 0.3]];
      if (hoch) toene.push([130.8, 0.5], [164.8, 0.45], [220, 0.35]);
      toene.forEach(([fr, v]) => { const g = c.createGain(); g.gain.value = v * 0.35; g.connect(lp); osz(c, 'sawtooth', fr, g, t, t + 4.4); });
      osz(c, 'sine', 41.2, kurve(c, ausgang(c, 0), t, 0.28 * stark, 0.05, 1, 2.2), t, t + 3.6);
      stoss(c, t, { fr: 500, q: 0.8, pegel: 0.25 * stark, an: 0.01, halten: 0.05, ab: 0.4 });
    },
    /** Ferner Braam (Szene nach dem Abspann) */
    braamFern(pegel = 0.18) {
      const c = audio(); if (!c) return; const t = c.currentTime;
      const aus = ausgang(c, 1.6);
      const lp = filter(c, 'lowpass', 380, 2); lp.connect(kurve(c, aus, t, pegel, 0.4, 1.4, 3.2));
      [55, 55.4, 82.4, 110].forEach(fr => osz(c, 'sawtooth', fr, lp, t, t + 5.2));
    },
    /** Taiko-Schlag */
    trommel(stark = 1) {
      const c = audio(); if (!c) return; const t = c.currentTime;
      const aus = ausgang(c, 0.6);
      fall(c, t, 140, 42, 0.45, 0.75 * stark, 1.1, aus);
      fall(c, t, 260, 90, 0.2, 0.45 * stark, 0.3, aus, 'triangle');
      stoss(c, t, { typ: 'lowpass', fr: 2200, pegel: 0.5 * stark, ab: 0.28, nass: 0.6 });
      mitte(c, t, stark, 0.6, 0.36);
    },
    /** Rückwärts-Sog in den nächsten Schlag */
    sog(sek = 0.32) {
      const c = audio(); if (!c) return; const t = c.currentTime;
      const bp = filter(c, 'bandpass', 400, 1.2); bp.frequency.setValueAtTime(400, t); bp.frequency.exponentialRampToValueAtTime(5000, t + sek);
      const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.45, t + sek); g.gain.setValueAtTime(0.0001, t + sek + 0.01);
      bp.connect(g); g.connect(ausgang(c, 0.3)); rauschen(c, t, sek + 0.05).connect(bp);
    },
    /** Spannungsbett: dunkler Dröhnton und Herzschlag, der schneller wird */
    bett(sek, von = 1.1, bis = 0.5) {
      const c = audio(); if (!c) return; const t = c.currentTime;
      const aus = ausgang(c, 0.4);
      const lp = filter(c, 'lowpass', 180); lp.frequency.setValueAtTime(180, t); lp.frequency.linearRampToValueAtTime(560, t + sek);
      lp.connect(kurve(c, aus, t, 0.12, 1.8, Math.max(0.1, sek - 2.6), 0.8));
      [36.7, 36.9, 73.4, 55].forEach(fr => osz(c, 'sawtooth', fr, lp, t, t + sek + 0.1));
      let z = t + 0.6, abstand = von;
      while (z < t + sek - 0.3) {
        for (const [d, v] of [[0, 0.8], [0.16, 0.5]]) fall(c, z + d, 72, 38, 0.18, v, 0.26, ausgang(c, 0.15));
        z += abstand; abstand = Math.max(bis, abstand * 0.9);
      }
    },
    /** Hohe Streicher-Spannung mit Tremolo */
    streicher(sek, hoehe = 1) {
      const c = audio(); if (!c) return; const t = c.currentTime;
      const aus = ausgang(c, 0.8);
      const pegel = c.createGain(); pegel.gain.setValueAtTime(0.0001, t); pegel.gain.exponentialRampToValueAtTime(0.1, t + sek); pegel.gain.setValueAtTime(0.0001, t + sek + 0.05); pegel.connect(aus);
      const trem = c.createGain(); trem.gain.value = 0.6; trem.connect(pegel);
      const lfo = c.createOscillator(); lfo.frequency.value = 11; const tiefe = c.createGain(); tiefe.gain.value = 0.4; lfo.connect(tiefe); tiefe.connect(trem.gain); lfo.start(t); lfo.stop(t + sek + 0.1);
      const lp = filter(c, 'lowpass', 3200); lp.connect(trem);
      [880, 932.3, 1174.7, 1244.5].forEach(fr => { osz(c, 'sawtooth', fr * hoehe, lp, t, t + sek + 0.1); osz(c, 'sawtooth', fr * hoehe * 1.006, lp, t, t + sek + 0.1); });
    },
    /** Riser: steigt und endet hart */
    riser(sek) {
      const c = audio(); if (!c) return; const t = c.currentTime;
      const aus = ausgang(c, 0.35);
      const bp = filter(c, 'bandpass', 250, 3); bp.frequency.setValueAtTime(250, t); bp.frequency.exponentialRampToValueAtTime(7500, t + sek);
      const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.55, t + sek); g.gain.setValueAtTime(0.0001, t + sek + 0.01);
      bp.connect(g); g.connect(aus); rauschen(c, t, sek + 0.05).connect(bp);
      const tg = c.createGain(); tg.gain.setValueAtTime(0.0001, t); tg.gain.exponentialRampToValueAtTime(0.14, t + sek); tg.gain.setValueAtTime(0.0001, t + sek + 0.01); tg.connect(aus);
      [110, 164.8, 220].forEach(fr => { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(fr, t); o.frequency.exponentialRampToValueAtTime(fr * 4, t + sek); o.connect(tg); o.start(t); o.stop(t + sek + 0.02); });
      let z = t, abstand = 0.32;
      while (z < t + sek - 0.05) {
        osz(c, 'square', 1800, kurve(c, ausgang(c, 0.1), z, 0.06 + (z - t) / sek * 0.1, 0.002, 0, 0.04), z, z + 0.06);
        z += abstand; abstand = Math.max(0.06, abstand * 0.84);
      }
    },
    /** Becken */
    becken(stark = 1) {
      const c = audio(); if (!c) return; const t = c.currentTime;
      stoss(c, t, { typ: 'highpass', fr: 3500, pegel: 0.35 * stark, an: 0.005, halten: 0.05, ab: 2.8, nass: 0.7 });
      [523, 1243, 1871, 2649].forEach(fr => osz(c, 'sine', fr, kurve(c, ausgang(c, 0.8), t, 0.035 * stark, 0.003, 0, 2.5), t, t + 3));
    },
    /** Einschlag: Sub-Fall, Braam mit Oberstimmen, Becken (becken: false lässt Platz für den Jubel) */
    einschlag(stark = 1, { becken = true } = {}) {
      const c = audio(); if (!c) return; const t = c.currentTime;
      TON.braam(1.2 + stark * 0.3, true);
      TON.trommel(1.2 + stark * 0.2);
      fall(c, t, 80, 28, 2.2, 0.45 * Math.min(1.2, stark), 2.4, ausgang(c, 0));
      if (becken && stark >= 1) TON.becken(stark);
    },
    /** Kleiner Einschlag (erster Teil der Titelkarte, Name im Starring) */
    schlag(stark = 1) {
      const c = audio(); if (!c) return; const t = c.currentTime;
      TON.trommel(1.1 * stark);
      fall(c, t, 70, 30, 1.2, 0.35 * stark, 1.4, ausgang(c, 0));
      const lp = filter(c, 'lowpass', 900, 3); lp.connect(kurve(c, ausgang(c, 0.6), t, 0.22 * stark, 0.02, 0.3, 1.4));
      [55, 82.4, 110].forEach(fr => osz(c, 'sawtooth', fr, lp, t, t + 2));
    },
    /** Heller Ding */
    ding() {
      const c = audio(); if (!c) return; const t = c.currentTime;
      [[2093, 0.08], [3136, 0.04], [4186, 0.03], [5274, 0.015]].forEach(([fr, v]) => osz(c, 'sine', fr, kurve(c, ausgang(c, 0.7), t, v, 0.002, 0, 2.2), t, t + 2.5));
    },
    /** Blech-Fanfare (D-Dur, öffnet sich), dazu Pauke */
    fanfare(verzug = 0) {
      const c = audio(); if (!c) return; const t = c.currentTime + verzug;
      const akkorde = [[0, [73.4, 146.8, 220, 293.7, 370]], [0.42, [98, 196, 293.7, 392, 493.9]], [0.84, [110, 220, 277.2, 329.6, 440]], [1.26, [73.4, 146.8, 220, 293.7, 370, 440, 587.3]]];
      akkorde.forEach(([d, toene], i) => {
        const letzt = i === akkorde.length - 1, lang = letzt ? 2.6 : 0.36;
        const lp = filter(c, 'lowpass', 500, 2); lp.frequency.setValueAtTime(500, t + d); lp.frequency.exponentialRampToValueAtTime(letzt ? 3200 : 2400, t + d + 0.25);
        lp.connect(kurve(c, ausgang(c, 0.6), t + d, letzt ? 0.16 : 0.115, 0.05, lang, letzt ? 2 : 0.4));
        toene.forEach(fr => { osz(c, 'sawtooth', fr, lp, t + d, t + d + lang + 2.2); osz(c, 'sawtooth', fr * 1.005, lp, t + d, t + d + lang + 2.2); });
        fall(c, t + d, 98, 60, 0.3, letzt ? 0.6 : 0.35, 0.8, ausgang(c, 0.5));
      });
    },
    /** Ausklang unter dem Billing-Block */
    ausklang(sek = 4) {
      const c = audio(); if (!c) return; const t = c.currentTime;
      const lp = filter(c, 'lowpass', 900); lp.connect(kurve(c, ausgang(c, 0.8), t, 0.1, 0.8, sek - 1.8, 1.6));
      [73.4, 110, 146.8, 185, 220].forEach(fr => osz(c, 'triangle', fr, lp, t, t + sek + 0.2));
    },
    /** Platten-Kratzer */
    kratzer() {
      const c = audio(); if (!c) return; const t = c.currentTime;
      const bp = filter(c, 'bandpass', 600, 4);
      bp.frequency.setValueAtTime(300, t); bp.frequency.exponentialRampToValueAtTime(3200, t + 0.12); bp.frequency.exponentialRampToValueAtTime(400, t + 0.3);
      bp.connect(kurve(c, ausgang(c, 0.2), t, 0.6, 0.01, 0.22, 0.08)); rauschen(c, t, 0.4).connect(bp);
      const o = c.createOscillator(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(180, t); o.frequency.exponentialRampToValueAtTime(900, t + 0.12); o.frequency.exponentialRampToValueAtTime(120, t + 0.3);
      const lp = filter(c, 'lowpass', 1800); o.connect(lp); lp.connect(kurve(c, ausgang(c, 0.2), t, 0.18, 0.01, 0.22, 0.06)); o.start(t); o.stop(t + 0.4);
    },
    /** Whoosh (links nach rechts) */
    whoosh(sek = 0.4, pegel = 0.35) {
      const c = audio(); if (!c) return; const t = c.currentTime;
      const bp = filter(c, 'bandpass', 400, 1.4);
      bp.frequency.setValueAtTime(300, t); bp.frequency.exponentialRampToValueAtTime(3000, t + sek * 0.55); bp.frequency.exponentialRampToValueAtTime(600, t + sek);
      const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(pegel, t + sek * 0.5); g.gain.exponentialRampToValueAtTime(0.0001, t + sek);
      let ziel = ausgang(c, 0.3);
      if (c.createStereoPanner) { const p = c.createStereoPanner(); p.pan.setValueAtTime(-0.8, t); p.pan.linearRampToValueAtTime(0.8, t + sek); p.connect(ziel); ziel = p; }
      bp.connect(g); g.connect(ziel); rauschen(c, t, sek + 0.05).connect(bp);
    },
    /** DVD-Knopf */
    klick() {
      const c = audio(); if (!c) return; const t = c.currentTime;
      osz(c, 'triangle', 1320, kurve(c, ausgang(c, 0.1), t, 0.13, 0.003, 0, 0.06), t, t + 0.1);
      osz(c, 'sine', 2640, kurve(c, ausgang(c, 0.1), t + 0.03, 0.05, 0.003, 0, 0.08), t + 0.03, t + 0.14);
    },
    /** trockener Klick (Freigabe-Karte) */
    trocken() {
      const c = audio(); if (!c) return; const t = c.currentTime;
      stoss(c, t, { fr: 2600, q: 2, pegel: 0.35, ab: 0.02, nass: 0.05 });
      fall(c, t, 400, 200, 0.03, 0.25, 0.06, ausgang(c, 0.05));
    },
    /** Projektor-Rattern */
    projektor(sek = 4) {
      const c = audio(); if (!c) return; const t = c.currentTime;
      const bp = filter(c, 'bandpass', 2200, 2);
      const am = c.createGain(); am.gain.value = 0; bp.connect(am);
      am.connect(kurve(c, ausgang(c, 0.2), t, 0.12, 0.4, sek - 1, 0.6));
      const lfo = c.createOscillator(); lfo.type = 'square'; lfo.frequency.value = 18; const tiefe = c.createGain(); tiefe.gain.value = 0.5;
      lfo.connect(tiefe); tiefe.connect(am.gain); lfo.start(t); lfo.stop(t + sek + 0.1);
      rauschen(c, t, sek + 0.1).connect(bp);
      osz(c, 'sine', 50, kurve(c, ausgang(c, 0), t, 0.05, 0.4, sek - 1, 0.6), t, t + sek + 0.1);
    },
    /** Fallblatt-Tick */
    tick(i = 0) {
      const c = audio(); if (!c) return; const t = c.currentTime;
      stoss(c, t, { fr: 2800 + (i % 3) * 300, q: 4, pegel: 0.22, ab: 0.025, nass: 0.05 });
      fall(c, t, 900, 500, 0.02, 0.06, 0.04, ausgang(c, 0));
    },
    /** Füller: kratzt, solange der Daumen wischt – liefert {tempo(v), stopp()} */
    fueller() {
      const c = audio(); if (!c) return { tempo() {}, stopp() {} };
      const t = c.currentTime;
      const bp = filter(c, 'bandpass', 3800, 1.6), g = c.createGain(); g.gain.value = 0.0001;
      bp.connect(g); g.connect(ausgang(c, 0.1));
      const q = c.createBufferSource(); q.buffer = rauschPuffer; q.loop = true; q.connect(bp); q.start(t);
      return {
        tempo(v) { const z = c.currentTime; g.gain.cancelScheduledValues(z); g.gain.setTargetAtTime(Math.min(0.28, 0.02 + v * 0.12), z, 0.02); bp.frequency.setTargetAtTime(3000 + Math.min(2500, v * 900), z, 0.03); },
        stopp() { const z = c.currentTime; g.gain.cancelScheduledValues(z); g.gain.setTargetAtTime(0.0001, z, 0.03); try { q.stop(z + 0.2); } catch (e) { /* egal */ } },
      };
    },
    /** Stempel-Klonk mit Rückprall und kleiner Fanfare */
    klonk() {
      const c = audio(); if (!c) return; const t = c.currentTime;
      TON.stempel(0.9);
      fall(c, t + 0.14, 300, 160, 0.05, 0.18, 0.12, ausgang(c, 0.3));
      TON.passFanfare(0.35);
    },
    /** Kleine Fanfare (Pass, Vertrag) */
    passFanfare(verzug = 0) {
      const c = audio(); if (!c) return; const t = c.currentTime + verzug;
      [[293.7, 0], [370, 0.1], [440, 0.2], [587.3, 0.3]].forEach(([fr, d]) => {
        const lp = filter(c, 'lowpass', 2400); lp.connect(kurve(c, ausgang(c, 0.5), t + d, 0.1, 0.03, 0.15, 1.2 - d));
        osz(c, 'sawtooth', fr, lp, t + d, t + 1.8); osz(c, 'sawtooth', fr * 1.005, lp, t + d, t + 1.8);
      });
    },
    /** Karabiner-Klick */
    karabiner() {
      const c = audio(); if (!c) return; const t = c.currentTime;
      [0, 0.07].forEach((d, i) => {
        stoss(c, t + d, { typ: 'highpass', fr: 4000, pegel: 0.25, ab: 0.03, nass: 0.2 });
        [3100 + i * 400, 4700 + i * 300].forEach(fr => osz(c, 'sine', fr, kurve(c, ausgang(c, 0.3), t + d, 0.04, 0.001, 0, 0.18), t + d, t + d + 0.25));
      });
    },
    /** Papier-Whoosh (Pass umdrehen, Akte) */
    papier() {
      const c = audio(); if (!c) return; const t = c.currentTime;
      const hp = filter(c, 'bandpass', 2500, 0.7); hp.frequency.setValueAtTime(1500, t); hp.frequency.exponentialRampToValueAtTime(5000, t + 0.25);
      hp.connect(kurve(c, ausgang(c, 0.2), t, 0.22, 0.08, 0.05, 0.18)); rauschen(c, t, 0.4).connect(hp);
    },
    /** Disc springt: Stottern und Kratzen */
    discKratzer() {
      const c = audio(); if (!c) return; const t = c.currentTime;
      TON.kratzer();
      for (let i = 0; i < 6; i++) {
        const z = t + 0.35 + i * 0.09;
        stoss(c, z, { fr: 900 + i * 200, q: 3, pegel: 0.25, ab: 0.05, nass: 0.1 });
        osz(c, 'square', 220 - i * 20, kurve(c, ausgang(c, 0.1), z, 0.05, 0.002, 0.02, 0.03), z, z + 0.08);
      }
    },
    /** Trommelwirbel (Aufnahme) fürs Casting: Wirbel bis zur Stille, dann der Schlussschlag – liefert die Zeit des Schlags */
    wirbel(stilleAb, schlagAb) {
      const c = audio(); if (!c) return false;
      if (!puffer.wirbel) return false;
      datei('wirbel', { wann: 0, ab: 0, dauer: stilleAb, pegel: 0.9, nass: 0.2 });
      datei('wirbel', { wann: schlagAb, ab: 6.46, pegel: 1, nass: 0.35 });
      return true;
    },
    /** Ersatz, falls die Aufnahme nicht geladen ist: Wirbel aus Rauschen */
    wirbelSynth(sek) {
      const c = audio(); if (!c) return; const t = c.currentTime;
      const bp = filter(c, 'bandpass', 2400, 0.8);
      const am = c.createGain(); am.gain.value = 0.3; bp.connect(am);
      const g = c.createGain(); g.gain.setValueAtTime(0.05, t); g.gain.exponentialRampToValueAtTime(0.4, t + sek); g.gain.setValueAtTime(0.0001, t + sek + 0.02);
      am.connect(g); g.connect(ausgang(c, 0.3));
      const lfo = c.createOscillator(); lfo.type = 'square'; lfo.frequency.value = 24; const tiefe = c.createGain(); tiefe.gain.value = 0.3;
      lfo.connect(tiefe); tiefe.connect(am.gain); lfo.start(t); lfo.stop(t + sek + 0.05);
      rauschen(c, t, sek + 0.05).connect(bp);
    },
    jubel(verzug = 0, pegel = 0.8) { return datei('jubel', { wann: verzug, pegel, nass: 0.25 }); },
    hatJubel() { return !!puffer.jubel; },

    /* ---------- Mini-Trailer der Kapitel: je ein eigener Klang ----------
       Alle etwa gleich laut (gemessen ~ -14 dB auf dem Handy-Lautsprecher), nur Endgame bewusst am lautesten. */
    kapitel(i) {
      const c = audio(); if (!c) return; const t = c.currentTime;
      const K = [
        // 1 · Blitzlicht-Klicks, Raunen und ein kurzer Applaus-Schwall
        () => {
          [0.2, 0.55, 0.7, 1.1, 1.5, 1.62, 2.1, 2.5].forEach((d, k) => {
            stoss(c, t + d, { typ: 'highpass', fr: 2500, pegel: 0.6, ab: 0.05, nass: 0.2, pan: (k % 2 ? 0.6 : -0.6) });
            stoss(c, t + d, { fr: 1400, q: 1.5, pegel: 0.25, ab: 0.03, nass: 0.1, pan: (k % 2 ? 0.6 : -0.6) });
            const o = c.createOscillator(); o.frequency.setValueAtTime(3000, t + d); o.frequency.exponentialRampToValueAtTime(7000, t + d + 0.3);
            o.connect(kurve(c, ausgang(c, 0.2), t + d, 0.03, 0.01, 0.1, 0.2)); o.start(t + d); o.stop(t + d + 0.4);
          });
          [500, 1100].forEach(fr => stoss(c, t + 0.3, { fr, q: 1.5, pegel: 0.6, an: 0.8, halten: 0.8, ab: 1.4, nass: 0.6 }));
          stoss(c, t + 1.7, { fr: 1800, q: 0.8, pegel: 0.4, an: 0.15, halten: 0.9, ab: 0.5, nass: 0.5 });
          for (let k = 0; k < 90; k++) { const d = 1.7 + Math.random() * 1.3; stoss(c, t + d, { fr: 1100 + Math.random() * 1900, q: 1.2, pegel: 0.18 + Math.random() * 0.12, ab: 0.03, pan: Math.random() * 1.6 - 0.8, nass: 0.4 }); }
        },
        // 2 · gezupfte Saite und Hufklopfen
        () => {
          [[0, 82.4], [0.5, 123.5], [0.75, 110], [1.5, 82.4], [2.25, 98], [2.5, 82.4]].forEach(([d, fr]) => {
            const lp = filter(c, 'lowpass', 3000); lp.frequency.setValueAtTime(3200, t + d); lp.frequency.exponentialRampToValueAtTime(300, t + d + 0.6);
            lp.connect(kurve(c, ausgang(c, 0.5), t + d, 0.26, 0.002, 0, 1.4));
            osz(c, 'sawtooth', fr, lp, t + d, t + d + 1.5); osz(c, 'sawtooth', fr * 2.003, lp, t + d, t + d + 1.5);
          });
          for (let k = 0; k < 8; k++) [0, 0.11].forEach((d, j) => {
            const z = t + 0.9 + k * 0.32 + d;
            fall(c, z, j ? 420 : 340, 200, 0.04, 0.2, 0.08, ausgang(c, 0.2, 0.3));
            stoss(c, z, { fr: 1500, q: 2, pegel: 0.11, ab: 0.03, pan: 0.3 });
          });
        },
        // 3 · Theremin-Gleiten und Raumschiff-Brummen
        () => {
          const o = c.createOscillator(); o.type = 'sine';
          o.frequency.setValueAtTime(420, t); o.frequency.exponentialRampToValueAtTime(880, t + 1.2); o.frequency.exponentialRampToValueAtTime(560, t + 2.2); o.frequency.exponentialRampToValueAtTime(740, t + 3.2);
          const vib = c.createOscillator(); vib.frequency.value = 6; const vt = c.createGain(); vt.gain.value = 9; vib.connect(vt); vt.connect(o.frequency);
          o.connect(kurve(c, ausgang(c, 0.7), t, 0.09, 0.4, 2.4, 1)); o.start(t); o.stop(t + 4); vib.start(t); vib.stop(t + 4);
          const lp = filter(c, 'lowpass', 200, 4); const l2 = c.createOscillator(); l2.frequency.value = 0.7; const l2g = c.createGain(); l2g.gain.value = 120; l2.connect(l2g); l2g.connect(lp.frequency); l2.start(t); l2.stop(t + 4.2);
          lp.connect(kurve(c, ausgang(c, 0.5), t, 0.2, 0.8, 2, 1.2)); [41.2, 41.6, 82.4].forEach(fr => osz(c, 'sawtooth', fr, lp, t, t + 4.2));
        },
        // 4 · Schritte, tiefe Basslinie, Stempel GEHEIM
        () => {
          [0, 0.45, 0.9, 1.35].forEach((d, k) => { fall(c, t + d, 120, 60, 0.06, 0.3, 0.15, ausgang(c, 0.4, k % 2 ? 0.3 : -0.3)); stoss(c, t + d, { typ: 'lowpass', fr: 700, pegel: 0.15, ab: 0.08, pan: k % 2 ? 0.3 : -0.3 }); });
          [[0, 55], [0.3, 55], [0.6, 65.4], [0.9, 55], [1.2, 49], [1.5, 55], [1.8, 61.7], [2.1, 55]].forEach(([d, fr]) => {
            const lp = filter(c, 'lowpass', 500, 2); lp.connect(kurve(c, ausgang(c, 0.2), t + 0.3 + d, 0.25, 0.01, 0.12, 0.12)); osz(c, 'sawtooth', fr, lp, t + 0.3 + d, t + 0.6 + d);
          });
          setTimeout(() => TON.stempel(0.8), 2700);
        },
        // 5 · Neonbrummen mit Flackern
        () => {
          const lp = filter(c, 'lowpass', 1400); const g = c.createGain(); g.gain.setValueAtTime(0.0001, t);
          [[0, 0.12], [0.3, 0.0001], [0.36, 0.12], [0.9, 0.12], [0.93, 0.0001], [1.05, 0.12], [1.12, 0.0001], [1.2, 0.12], [3.6, 0.12], [4, 0.0001]].forEach(([d, v]) => g.gain.setValueAtTime(v, t + d));
          lp.connect(g); g.connect(ausgang(c, 0.3));
          [100, 200, 300.5].forEach(fr => osz(c, 'sawtooth', fr, lp, t, t + 4.1));
          [0.3, 0.93, 1.12].forEach(d => stoss(c, t + d, { typ: 'highpass', fr: 3000, pegel: 0.15, ab: 0.05 }));
        },
        // 6 · Hornruf und Flügelschlag
        () => {
          [[0, 146.8, 1.0], [1.1, 220, 1.6]].forEach(([d, fr, l]) => {
            const lp = filter(c, 'lowpass', 300, 1.5); lp.frequency.setValueAtTime(300, t + d); lp.frequency.exponentialRampToValueAtTime(1600, t + d + 0.3);
            lp.connect(kurve(c, ausgang(c, 1.0), t + d, 0.11, 0.15, l, 1.0));
            const o = osz(c, 'sawtooth', fr, lp, t + d, t + d + l + 1.3); const o2 = osz(c, 'sawtooth', fr * 1.004, lp, t + d, t + d + l + 1.3);
            const v = c.createOscillator(); v.frequency.value = 5; const vg = c.createGain(); vg.gain.value = 2.5; v.connect(vg); vg.connect(o.frequency); vg.connect(o2.frequency); v.start(t + d); v.stop(t + d + l + 1.3);
          });
          [2.6, 3.0, 3.4].forEach(d => stoss(c, t + d, { typ: 'lowpass', fr: 500, pegel: 0.32, an: 0.08, ab: 0.22, nass: 0.4 }));
        },
        // 7 · Applaus-Rauschen und Slap-Bass
        () => {
          stoss(c, t + 0.1, { fr: 1800, q: 0.8, pegel: 0.4, an: 0.3, halten: 1.2, ab: 0.6, nass: 0.5 });
          for (let k = 0; k < 70; k++) { const d = 0.1 + Math.random() * 1.8; stoss(c, t + d, { fr: 1200 + Math.random() * 1800, q: 1.2, pegel: 0.24 + Math.random() * 0.2, ab: 0.03, pan: Math.random() * 1.6 - 0.8, nass: 0.4 }); }
          [[2.2, 82.4], [2.38, 164.8], [2.56, 82.4], [2.74, 98], [2.92, 110], [3.1, 82.4]].forEach(([d, fr]) => {
            const lp = filter(c, 'lowpass', 2400); lp.frequency.setValueAtTime(2400, t + d); lp.frequency.exponentialRampToValueAtTime(200, t + d + 0.25);
            lp.connect(kurve(c, ausgang(c, 0.15), t + d, 0.9, 0.003, 0.02, 0.22)); osz(c, 'sawtooth', fr, lp, t + d, t + d + 0.35);
            stoss(c, t + d, { fr: 2500, q: 2, pegel: 0.14, ab: 0.02 });
          });
        },
        // 8 · Tresor-Klicken und Fingerschnippen
        () => {
          for (let k = 0; k < 14; k++) { const d = k * 0.08 + (k > 9 ? 0.4 : 0); stoss(c, t + d, { fr: 4200, q: 6, pegel: 0.32, ab: 0.015, nass: 0.1 }); }
          fall(c, t + 1.65, 300, 120, 0.08, 0.6, 0.2, ausgang(c, 0.3));
          [2.0, 2.5, 3.0, 3.5].forEach((d, k) => stoss(c, t + d, { fr: 2200, q: 2.5, pegel: 0.75, an: 0.001, ab: 0.06, nass: 0.35, pan: k % 2 ? 0.4 : -0.4 }));
        },
        // 9 · Wellen und Schiffsglocke
        () => {
          [0, 1.4, 2.8].forEach(d => { const lp = filter(c, 'lowpass', 600); lp.frequency.setValueAtTime(300, t + d); lp.frequency.linearRampToValueAtTime(900, t + d + 0.8); lp.frequency.linearRampToValueAtTime(300, t + d + 1.6); lp.connect(kurve(c, ausgang(c, 0.5), t + d, 0.55, 0.7, 0.2, 0.8)); rauschen(c, t + d, 1.8).connect(lp); });
          [0.6, 1.0].forEach(d => [[740, 0.16], [1863, 0.07], [2960, 0.035]].forEach(([fr, v]) => osz(c, 'sine', fr, kurve(c, ausgang(c, 0.8), t + d, v, 0.002, 0, 2.4), t + d, t + d + 2.6)));
        },
        // 10 · drei Hammerschläge und Orgelakkord
        () => {
          [0, 0.5, 1.0].forEach(d => { fall(c, t + d, 240, 110, 0.05, 0.36, 0.18, ausgang(c, 0.7)); stoss(c, t + d, { fr: 1100, q: 1.5, pegel: 0.22, ab: 0.06, nass: 0.7 }); });
          const g = kurve(c, ausgang(c, 0.9), t + 1.5, 0.045, 0.6, 1.6, 1.0);
          [130.8, 155.6, 196, 261.6].forEach(fr => [1, 2, 3].forEach(h => osz(c, 'sine', fr * h, g, t + 1.5, t + 4.8)));
        },
        // 11 · riesiger Braam mit Chor-Fläche
        () => {
          TON.braam(1.6, true);
          const chor = c.createGain(); chor.connect(kurve(c, ausgang(c, 1.2), t + 0.2, 0.22, 1.0, 1.6, 1.4));
          [[700, 6], [1150, 8]].forEach(([fr, q]) => { const bp = filter(c, 'bandpass', fr, q); bp.connect(chor); [146.8, 220, 293.7, 349.2].forEach(n => { osz(c, 'sawtooth', n, bp, t + 0.2, t + 4.4); osz(c, 'sawtooth', n * 1.006, bp, t + 0.2, t + 4.4); }); });
        },
      ];
      (K[i] || K[0])();
    },
    /** Titel knallt rein (Mini-Trailer); Endgame mit doppeltem Einschlag */
    kapitelTitel(i) {
      if (i === 10) { TON.einschlag(1.2); setTimeout(() => TON.einschlag(1.5), 420); return; }
      TON.schlag(1);
    },
  };

  window.TON = TON;
  window.KLANG = {
    audio, entsperren, busStart, busStopp, schleifeStart, schleifeStopp, schleifeDucken,
    get stumm() { return stumm; },
    setzeStumm(an) {
      stumm = !!an;
      if (stumm) { schleifeStopp(0.2); busStopp(0.1); if (ctx) setTimeout(() => { if (stumm && ctx) still(ctx.suspend()); }, 300); }
      else if (ctx && !pausiert) { try { still(ctx.resume()); } catch (e) { /* egal */ } }
    },
    pausieren() { pausiert = true; if (ctx && ctx.state === 'running') still(ctx.suspend()); },
    fortsetzen() { pausiert = false; if (ctx && !stumm) still(ctx.resume()); },
    laeuft() { return !!ctx && ctx.state === 'running'; },
  };
})();
