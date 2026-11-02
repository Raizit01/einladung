/* ===== Filmabend 2 · Premiere-Einladung: alle Texte und Einstellungen – hier anpassen =====
   Platzhalter: {name} = Name des Gastes, {rolle} = seine Rolle, {tage} = Tage bis zum Abend.
   Die Rollen selbst (Liste und Rechnung) stehen in rollen.js und dürfen nach dem Versand nicht mehr geändert werden.
   Öffentliches Repo: keine Adresse, keine Telefonnummer, keine echten E-Mails, keine Namen echter Gäste. */
window.EINLADUNG = {
  titel: 'FILMABEND',
  zahl: '2',
  zusatz: 'Ultimate Edition',
  untertitel: 'Das Wohnzimmer schlägt zurück',
  tagline: 'Das Film- und Serienquiz · Diesmal wird’s persönlich',
  datumszeile: 'Mittwoch, 18. November · 19:00 Uhr · nur im Wohnzimmer',
  gastgeber: 'Chris',
  studio: ['QUIZABEND', 'PICTURES'],

  // Termin (Ortszeit): Jahr, Monat (1–12), Tag, Stunde, Minute
  beginn: [2026, 11, 18, 19, 0],
  // Ende für den Kalendereintrag
  kalenderEnde: [2026, 11, 18, 23, 30],
  // Ab hier gilt der Abend als vorbei („Fortsetzung folgt“)
  vorbeiAb: [2026, 11, 19, 4, 0],
  // Tür-Ritual: Ab hier (bis vorbeiAb) zeigt der Backstage-Pass „Am Einlass vorzeigen“, und der Gastgeber entwertet ihn mit
  // einem Wisch (Texte unten bei „tuer“). Vorher ist davon nichts zu sehen. Testen: ?jetzt=2026-11-18T18:55
  einlassAb: [2026, 11, 18, 17, 0],
  datumPass: 'Mi 18.11.2026',
  uhrzeitPass: '19:00 Uhr',
  saal: 'Wohnzimmer',
  ortPass: 'bei Chris · Wohnzimmer',
  ortKalender: 'Wohnzimmer bei Chris',
  platz: 'Sofa, freie Wahl (wer zuerst kommt …)',
  // Wann und Wo auf einen Blick (Einlass, Willkommen, Hauptmenü). Öffentliches Repo: keine Adresse!
  infozeile: 'Mittwoch, 18.11. · 19:00 Uhr · bei Chris im Wohnzimmer',
  // Muss gleich NAME_MAX im Spiel sein (Quizabend/shared/regeln.ts), sonst schneidet das Spiel den Vornamen anders ab
  // und es gibt am Abend eine andere Rolle. Ein Test im Spiel (tests/rollen-einladung.test.ts) prüft das.
  maxNamenLaenge: 16,

  // Ton-Schalter oben rechts: nennt die Aktion, nicht den Zustand
  ton: {
    stummschalten: '🔊 Stumm schalten',
    einschalten: '🔇 Ton einschalten',
    stummschaltenLang: 'Ton läuft. Tippen schaltet stumm (Stummfilm-Modus).',
    einschaltenLang: 'Stummfilm-Modus. Tippen schaltet den Ton ein.',
  },

  /* ---------- 1 · Einlass ---------- */
  einlass: {
    oben: 'Geschlossene Vorstellung. Nur für geladene Gäste.',
    label: 'Dein Vorname für die Gästeliste',
    platzhalter: 'z. B. Max',
    hinweis: 'Nimm den Namen, mit dem du dich am 18.11. im Spiel anmeldest. Gleicher Name, gleiche Rolle.',
    knopf: '▶ Einlass',
    tonzeile: 'Handy laut stellen. Lauter. Noch ein bisschen lauter. · iPhone: Lautlos-Schalter aus · ca. 90 Sekunden · Dein Name bleibt auf deinem Handy.',
    fehlerLeer: 'Ohne Namen kein Einlass. So sind die Regeln.',
    fehlerLang: 'Zu lang fürs Filmplakat. Nur der Vorname, bitte.',
    beispielname: 'Ah, der berühmte Beispielname. Netter Versuch. Wie heißt du wirklich?',
    willkommen: 'Willkommen zurück, {name}. Deine Rolle wartet.',
    zumMenue: '▶ Zum Hauptmenü',
    vorspannNochmal: 'Vorspann nochmal ansehen',
    neu: 'Nicht {name}? Neu einchecken',
  },

  /* ---------- 2 · Gästelisten-Check ---------- */
  check: {
    titel: 'Gästeliste · Filmabend 2',
    zeilen: [
      'Filmgedächtnis wird vermessen … 98 %',
      'Popcorn-Verträglichkeit: hervorragend',
      'Spoiler-Risiko: erheblich',
      'Drehbuch wird umgeschrieben … deinetwegen',
    ],
    gefunden: '{name} … gefunden.',
    stempel: 'ZUGELASSEN',
    regieGefunden: '{name} … Moment. Das ist ja die Regie.',
    regieStempel: 'REGIE',
    beispielGefunden: '{name} … steht auf jedem Formular der Welt.',
    beispielStempel: 'BEISPIELNAME',
  },

  /* ---------- 4 · Trailer (16 Tafeln) ----------
     Tafel 6: die vier Wörter knallen der Reihe nach über die Motive von Kapitel 2, 3, 9 und 11 (Western, Weltraum, Piraten, Superhelden).
     Tafel 16 (Datum) wird als goldenes Schlagwort in Zeilen gesetzt: „Mittwoch.“ / „18. November.“ / „19 Uhr.“ */
  trailer: [
    'Jahrelang hat {name} Filme geschaut.',
    'Auf dem Sofa. Im Kino. Heimlich bis drei Uhr nachts.',
    'Alle dachten, es sei ein Hobby.',
    'Es war Training.',
    'Denn elf Filmwelten sind aus ihren DVD-Hüllen ausgebrochen.',
    'Western. Weltraum. Piraten. Superhelden.',
    'Und nur ein Wohnzimmer stellt sich ihnen in den Weg.',
    '11 KAPITEL.',
    '1 SOFA.',
    'KEINE GNADE.',
    '(Keine Sorge. Es tut nicht weh. Meistens.)',
    'Du dachtest, du kennst jeden Film.',
    'Diesmal kennen die Filme dich.',
    'Die Besetzung ist komplett. Bis auf eine Rolle.',
    '{name}.',
    'Mittwoch. 18. November. 19 Uhr.',
  ],

  /* ---------- 5 · Titelkarte: Billing-Block ---------- */
  billing: [
    'Quizabend Pictures präsentiert', 'eine Chris-Produktion', '<b>{name}</b>', 'in <b>FILMABEND 2</b>', 'in 11 Kapiteln',
    'Kamera: ein Handy', 'Licht: die Stehlampe', 'Stunts: das Sofa', 'Musik: aus Schwingungen selbst gebaut',
    'gedreht an Originalschauplätzen im Wohnzimmer',
  ],

  /* ---------- 6 · Freigabe-Karte ---------- */
  freigabe: {
    gross: 'FREIGEGEBEN AB 1 GAST',
    fuer: 'Freigegeben für: {name}. Und für alle, die dir gerade über die Schulter gucken.',
    enthaelt: 'Enthält: epische Momente, plötzliche Geistesblitze, Besserwisserei in Überlänge, lautes Jubeln, leichte Schadenfreude und Spuren von Popcorn.',
  },

  /* ---------- 8 · Steckbrief & Vertrag ---------- */
  akte: {
    kopf: 'Besetzungsakte · Filmabend 2',
    annehmen: 'Rolle annehmen',
    wischen: 'Mit dem Daumen über die Linie wischen',
    stempel: 'GECASTET',
    andere: 'Andere Rolle?',
    abgelehnt: 'Abgelehnt. Das Studio ändert keine Rollen. Auch nicht gegen Chips.',
    fix: 'Diese Rolle ist fix. Am 18.11. stehst du damit im Vorspann auf dem großen Bildschirm.',
    klein: 'Gage: Ruhm, Ehre, Applaus. Drehtermin: Mi, 18.11., 19:00 Uhr.',
    pass: 'Backstage-Pass holen',
    menue: 'Zum Hauptmenü',
  },

  // Steckbriefe – Schlüssel = Rolle genau wie in rollen.js. „frage“ steht in der Besetzungsliste, „bild“ = Zeichnung der Requisite
  steckbrief: {
    'IN DER HAUPTROLLE': { bild: 'scheinwerfer', frage: 'Wer spielt die Hauptrolle?',
      faehigkeit: 'Steht im Rampenlicht, ohne auch nur einmal zu blinzeln.',
      schwaeche: 'Hat die Dankesrede schon fertig, bevor der Film anfängt.',
      requisite: 'Ein Scheinwerfer, der dir überallhin folgt, auch zum Kühlschrank.',
      satz: 'Die Kamera liebt dich. Die anderen Gäste sind noch unentschlossen.' },
    'IN EINER GEFÄHRLICHEN DOPPELROLLE': { bild: 'sonnenbrille', frage: 'Wer spielt die gefährliche Doppelrolle?',
      faehigkeit: 'Lächelt freundlich und rechnet heimlich schon den Punktestand aus.',
      schwaeche: 'Streitet manchmal mit sich selbst und verliert.',
      requisite: 'Eine Sonnenbrille für die zweite Persönlichkeit.',
      satz: 'Niemand weiß, auf welcher Seite du stehst. Am wenigsten du selbst.' },
    'ALS DAS GENIE MIT DER FERNBEDIENUNG': { bild: 'fernbedienung', frage: 'Wer ist das Genie mit der Fernbedienung?',
      faehigkeit: 'Findet jede Szene in drei Sekunden, auch ohne Kapitelmarke.',
      schwaeche: 'Gibt die Fernbedienung nie freiwillig ab. Nie.',
      requisite: 'Die Fernbedienung, die sonst immer in der Sofaritze verschwindet.',
      satz: 'Die Macht liegt in deiner Hand. Die Batterien leider nicht.' },
    'ALS DIE GEHEIMWAFFE': { bild: 'koffer', frage: 'Wer ist die Geheimwaffe?',
      faehigkeit: 'Wird unterschätzt. Ungefähr bis Kapitel 3.',
      schwaeche: 'So geheim, dass nicht mal das eigene Gehirn Bescheid weiß.',
      requisite: 'Ein Koffer mit Zahlenschloss. Inhalt: Gummibärchen.',
      satz: 'Deine Akte ist geschwärzt. Komplett. Sogar das Foto.' },
    'IN EINER GASTROLLE, DIE ALLES VERÄNDERT': { bild: 'ausweis', frage: 'Wer hat die Gastrolle, die alles verändert?',
      faehigkeit: 'Zehn Minuten Auftritt, zehn Jahre Gesprächsstoff.',
      schwaeche: 'Kommt zu spät und nennt es Timing.',
      requisite: 'Ein Ausweis mit der Aufschrift „Nur ganz kurz da“.',
      satz: 'Klein im Abspann, riesig in der Erinnerung.' },
    'ALS DAS POPCORN-ORAKEL': { bild: 'popcorn', frage: 'Wer spielt das Popcorn-Orakel?',
      faehigkeit: 'Sieht das Ende kommen, bevor der Vorspann vorbei ist.',
      schwaeche: 'Kann nicht aufhören, es laut zu sagen.',
      requisite: 'Eine Popcorntüte als Kristallkugel. Bitte nicht aufessen.',
      satz: 'Du hast diese Einladung kommen sehen. Natürlich hast du das.' },
    'ALS DIE STIMME AUS DEM OFF': { bild: 'mikrofon', frage: 'Wer ist die Stimme aus dem Off?',
      faehigkeit: 'Kommentiert alles, und zwar in Trailer-Stimme.',
      schwaeche: 'Flüstern ist keine Option.',
      requisite: 'Ein unsichtbares Mikrofon. Leider immer an.',
      satz: 'In einer Welt … in der du einfach nicht leise sein kannst …' },
    'MIT DEM SCHNELLSTEN DAUMEN DER STADT': { bild: 'schweissband', frage: 'Wer hat den schnellsten Daumen der Stadt?',
      faehigkeit: 'Tippt schneller, als ein Trailer schneiden kann.',
      schwaeche: 'Ist manchmal schneller als das eigene Gehirn.',
      requisite: 'Ein goldenes Schweißband, nur für den Daumen.',
      satz: 'Andere ziehen im Western den Colt. Du ziehst das Handy.' },
    'ALS DER UNERWARTETE PLOT-TWIST': { bild: 'umschlag', frage: 'Wer ist der unerwartete Plot-Twist?',
      faehigkeit: 'Liegt den ganzen Abend hinten, bis plötzlich nicht mehr.',
      schwaeche: 'Hat selbst keine Ahnung, was als Nächstes passiert.',
      requisite: 'Ein Umschlag mit der Aufschrift „Erst am Ende öffnen“.',
      satz: 'Alle dachten, sie kennen das Ende. Dann kamst du.' },
    'ALS DAS PHANTOM DER VIDEOTHEK': { bild: 'kassette', frage: 'Wer ist das Phantom der Videothek?',
      faehigkeit: 'Kennt jeden Film, den sonst niemand je ausgeliehen hat.',
      schwaeche: 'Hat noch drei Kassetten von 2004 zu Hause. Gebühr: unbezahlbar.',
      requisite: 'Ein Mitgliedsausweis einer Videothek, die es seit Jahren nicht mehr gibt.',
      satz: 'Man sagt, nachts flüsterst du zwischen den Regalen: „Bitte zurückspulen.“' },
    'ALS DIE ÜBERRASCHUNG DES ABENDS': { bild: 'konfetti', frage: 'Wer wird die Überraschung des Abends?',
      faehigkeit: 'Weiß Dinge, von denen keiner ahnte, dass du sie weißt.',
      schwaeche: 'Stapelt vorher so tief, dass es fast glaubwürdig ist.',
      requisite: 'Eine Konfettikanone, Sicherung schon entfernt.',
      satz: 'Die Wettquoten waren gegen dich. Die Wettquoten haben sich geirrt.' },
    'UND ALS DAS GROSSE FRAGEZEICHEN': { bild: 'notizblock', frage: 'Wer ist das große Fragezeichen?',
      faehigkeit: 'Stellt Fragen, auf die sonst niemand kommt.',
      schwaeche: 'Fragt nach dem Abspann: „Moment, worum ging es?“',
      requisite: 'Ein Notizblock voller Pfeile, die ins Nichts zeigen.',
      satz: 'Keiner weiß, was du vorhast. Du auch nicht. Das macht dich gefährlich.' },
    'ALS DIE FORTSETZUNG, DIE ALLE WOLLTEN': { bild: 'zwei', frage: 'Wer ist die Fortsetzung, die alle wollten?',
      faehigkeit: 'Besser als Teil 1. Sagen alle, die Teil 1 nicht gesehen haben.',
      schwaeche: 'Die Erwartungen sind höher als das Budget.',
      requisite: 'Eine selbst gebastelte römische Zwei.',
      satz: 'Fortsetzungen sind selten gut. Du bist die Ausnahme.' },
    'MIT DER LIZENZ ZUM RATEN': { bild: 'fliege', frage: 'Wer hat die Lizenz zum Raten?',
      faehigkeit: 'Rät so selbstbewusst, dass es fast wie Wissen aussieht.',
      schwaeche: 'Gibt nie zu, dass es geraten war.',
      requisite: 'Eine Fliege und ein Cocktailglas voll Apfelschorle.',
      satz: 'Lizenz erteilt. Haftung ausgeschlossen.' },
    'ALS DIE LETZTE HOFFNUNG DES SOFAS': { bild: 'umhang', frage: 'Wer ist die letzte Hoffnung des Sofas?',
      faehigkeit: 'Rettet die Ehre, wenn alle anderen schon aufgegeben haben.',
      schwaeche: 'Steht unter enormem Druck. Vom Sofakissen.',
      requisite: 'Ein Umhang aus Kuscheldecke.',
      satz: 'Wenn alle Stricke reißen, reißt du dich zusammen.' },
    'MIT DEM POKERFACE AUS STAHL': { bild: 'karten', frage: 'Wer hat das Pokerface aus Stahl?',
      faehigkeit: 'Niemand sieht dir an, ob du die Antwort weißt.',
      schwaeche: 'Niemand sieht dir an, ob du überhaupt wach bist.',
      requisite: 'Ein Kartenspiel, das nie gespielt wird. Nur zum Mischen.',
      satz: 'Dein Gesicht verrät nichts. Deine Punkte verraten alles.' },
    'ALS DAS STUNT-DOUBLE OHNE ANGST': { bild: 'pflaster', frage: 'Wer ist das Stunt-Double ohne Angst?',
      faehigkeit: 'Springt in jede Lücke, auch ohne Sicherheitsnetz.',
      schwaeche: 'Liest die Gebrauchsanweisung erst hinterher.',
      requisite: 'Ein Pflaster mit Sternchen drauf.',
      satz: 'Wenn es brenzlig wird, rufen alle nach dir. Ob du willst oder nicht.' },
    'ALS DER CLIFFHANGER IN PERSON': { bild: 'seil', frage: 'Wer ist der Cliffhanger in Person?',
      faehigkeit: 'Hört immer genau dann auf, wenn es am spannendsten ist.',
      schwaeche: 'Lässt alle bis zur nächsten Staffel warten, auch auf Antworten.',
      requisite: 'Ein Seil über dem Abgrund. Bequemer, als es aussieht.',
      satz: 'Und dann … Fortsetzung folgt. Wann? Das weißt nur du.' },
  },

  // Easter Egg nur für Chris: Link mit ?regie=1 öffnen (aus mit ?regie=0). Nicht über den Namen „Chris“ – ein Gast mit diesem
  // Vornamen bekommt sonst hier die Regie, am Abend im Spiel aber eine normale Rolle.
  regie: {
    rolle: 'REGIE',
    bild: 'megafon',
    faehigkeit: 'Kennt alle Lösungen. Wirklich alle.',
    schwaeche: 'Darf deshalb nicht mitspielen.',
    requisite: 'Ein Regiestuhl mit deinem Namen und ein Megafon.',
    satz: 'Regie erkannt. Du kennst alle Lösungen, du spielst nicht mit.',
    annehmen: 'Regie übernehmen',
    abgelehnt: 'Abgelehnt. Die Regie kann sich nicht selbst umbesetzen.',
    passTitel: 'REGIE-PASS',
    passZeile: 'EIN FILM VON CHRIS · ALL ACCESS',
  },
  // Nur der volle Name „Max Mustermann“ wird abgelehnt (wer wirklich Max heißt, bekommt ganz normal eine Rolle)
  beispielname: 'max mustermann',

  /* ---------- 9 · DVD-Hauptmenü ---------- */
  menue: {
    besetzt: 'Besetzt:',
    punkte: [
      ['start', '▶ Film starten'],
      ['kapitel', 'Szenenauswahl'],
      ['akte', 'Mein Steckbrief'],
      ['besetzung', 'Besetzungsliste'],
      ['bonus', 'Bonusmaterial'],
      ['pass', 'Backstage-Pass'],
      ['trailer', 'Trailer nochmal'],
    ],
    filmStartenTitel: 'Disc-Fehler 10-11',
    filmStartenVor: 'Der Hauptfilm ist erst am Mittwoch, 18.11., um 19:00 Uhr freigeschaltet. Noch {rest}.',
    filmStartenLaeuft: 'JETZT IM WOHNZIMMER. Was machst du noch hier?',
    filmStartenVorbei: 'Danke fürs Mitspielen. Fortsetzung folgt.',
    discKaputt: 'Disc verschmutzt. Bitte nicht mit Chipsfingern anfassen.',
  },
  witze: [
    'Handys bitte nicht ausschalten. Ausnahmsweise.',
    'Bei den Dreharbeiten zu dieser Einladung wurde kein Popcorn verletzt. Zwei Tüten gelten als vermisst.',
    'Teil 1 war gut. Teil 2 wird größer. Ob es Teil 3 gibt, hängt davon ab, wie du dich benimmst.',
    'Noch {tage} Tage. Fang schon mal an, Filme zu gucken. Bringt nichts, beruhigt aber.',
    'Die Presse ist sich einig: Die Presse war nicht eingeladen.',
    'Budget: ein Wohnzimmer. Ehrgeiz: Hollywood.',
    'Der rote Teppich ist ein Fußabtreter. Bitte trotzdem würdevoll drüberlaufen.',
    'Spoiler bitte an der Garderobe abgeben.',
    'Handlung: ihr. Drehbuch: Chris. Ausgang: völlig offen.',
    'Diese Einladung enthält keine Spoiler. Chris hat es versucht, wir haben ihn aufgehalten.',
    'Wer googelt, wird im Abspann unter „Komparserie“ geführt.',
    'Kann Spuren von Wissen enthalten.',
    'Spoiler: Jemand wird gewinnen.',
    'Handy laden. Ernsthaft. Ohne Akku bist du nur Publikum.',
    'Die Kritik ist begeistert.* *Es gab keine Kritik.',
    'Kein 3D. Dafür 100 % echte Menschen.',
    'Freie Platzwahl. Wer zuerst kommt, kriegt das Sofa.',
    'Zwei Leute mit derselben Rolle? Das nennt man Ensemble.',
  ],
  // Outtakes nach dem Disc-Easter-Egg (Disc im Menü fünfmal antippen)
  outtakes: [
    'Tafel 4, Versuch 12: Braam zu laut, Nachbarschaft klopft.',
    'Tafel 9, Versuch 3: Das Sofa hat seinen Einsatz verpasst.',
    'Tafel 11, Versuch 7: Die Regie musste selbst lachen. Nochmal.',
    'Tafel 15, Versuch 2: Falscher Name im Vorspann. Peinlich. Nochmal.',
    'Tafel 16, Versuch 5: Datum stimmte, Stehlampe war aus.',
  ],
  // Abspann unten im Menü (danach kommt die Szene nach dem Abspann)
  abspann: [
    ['Regie, Buch, Schnitt', 'Chris'],
    ['{rolle}', '{name}'],
    ['Kamera', 'ein Handy'],
    ['Licht', 'die Stehlampe'],
    ['Stunts', 'das Sofa'],
    ['Musik und Klänge', 'aus Schwingungen selbst gebaut'],
    ['Trommelwirbel und Jubel', 'freie Aufnahmen (CC0)'],
    ['Schriften', 'Cinzel, Oswald, Atkinson Hyperlegible (SIL OFL)'],
    ['Drehort', 'ein Wohnzimmer'],
  ],
  postCredit: [
    'Du bist bis nach dem Abspann geblieben. Respekt.',
    '{name} kehrt zurück. Am 18. November.',
    'Filmabend 3?',
  ],
  postCreditKlein: 'Erst mal Teil 2 überleben.',

  /* ---------- 10 · Szenenauswahl: Titel und Teaser (nichts über die Spielweise verraten!) ---------- */
  kapitel: [
    { titel: 'Vorspann', teaser: 'Roter Teppich, Blitzlichtgewitter, feuchte Hände. Die Premiere beginnt, und diesmal sitzt du nicht im Publikum.' },
    { titel: 'Der mit dem Emoji tanzt', teaser: 'Staub, Saloon, Sonnenuntergang. Irgendwo spielt eine Mundharmonika, und selbst die Pferde gucken skeptisch.' },
    { titel: 'Interpretation Day', teaser: 'Riesige Raumschiffe über dem Wohnzimmer. Die Menschheit ist in Aufruhr, das Sofa auch. Jetzt hilft nur noch ein kühler Kopf.' },
    { titel: 'The Hint Identity', teaser: 'Gedächtnis gelöscht, Pass gefälscht, Spur eiskalt. Irgendwer weiß genau, wer du bist. Nur du noch nicht.' },
    { titel: 'Quote Club', teaser: 'Ein Keller, eine flackernde Glühbirne, sehr ernste Gesichter. Über diesen Club wird nicht geredet. Deine Mitgliedschaft hast du hiermit.' },
    { titel: 'Game of Letters', teaser: 'Drachen kreisen, Häuser zerstreiten sich, und um den Thron wird gekämpft wie ums letzte Sofakissen.' },
    { titel: 'How I met your Graph', teaser: 'Ein Sofa, eine Stammkneipe, Lacher vom Band. Und eine Geschichte, die viel zu lange dauert und sich trotzdem lohnt.' },
    { titel: 'Picasso Royale', teaser: 'Ein Museum, ein unbezahlbares Meisterwerk und eine Crew mit zu vielen Sonnenbrillen. Der Plan ist perfekt. Ziemlich sicher.' },
    { titel: 'Die Schätzinsel', teaser: 'Eine alte Karte, ein großes X und eine Crew, die schon vor dem Ablegen über den Kurs streitet.' },
    { titel: 'Sort & Order', teaser: 'Ruhe im Saal! Die Anklage ist bereit, die Verteidigung schwitzt, und die Jury hat Snacks reingeschmuggelt.' },
    { titel: 'Endgame', teaser: 'Alles davor war nur Aufwärmen. Jetzt kommt das Finale, für das Capes erfunden wurden. Niemand ist sicher.', siegel: 'versiegelt bis zum Finale' },
  ],

  /* ---------- 11 · Besetzungsliste ---------- */
  besetzung: {
    titel: 'Besetzungsliste',
    unter: '18 Rollen. Eine davon ist deine. Der Rest bleibt bis zum 18.11. ein Geheimnis.',
    anhang: 'Am 18.11. weißt du es.',
    ensemble: 'Zwei Leute mit derselben Rolle? Das nennt man Ensemble.',
  },

  /* ---------- 12 · Bonusmaterial ---------- */
  bonus: [
    { titel: 'Mitbringen', text: 'Ein Handy mit vollem Akku (das ist dein Controller), zur Not das Ladekabel. Gute Laune und so viel Ehrgeiz, wie du verantworten kannst. Filmwissen ist willkommen, aber keine Pflicht. Nicht mitbringen: Ausreden und Spoiler.' },
    { titel: 'Die Regeln in 3 Sätzen', text: '1. Der Fernseher zeigt, dein Handy antwortet. 2. Googeln ist Hochverrat. 3. Die Regie hat immer recht, und falls nicht, gilt Regel 3.' },
    { titel: 'Wichtig für deine Rolle', text: 'Tipp am 18.11. im Spiel denselben Vornamen ein wie hier, dann wartet dieselbe Rolle im Vorspann auf dich. Groß- und Kleinschreibung ist egal, es zählt nur der Vorname. Anderer Name, andere Rolle. Doppelagenten, aufgepasst.' },
    { titel: 'Inhaltshinweise', text: 'FREIGEGEBEN AB 1 GAST. Enthält: epische Momente, plötzliche Geistesblitze, Besserwisserei in Überlänge, lautes Jubeln, leichte Schadenfreude, eine Siegerehrung mit allem Drum und Dran und Spuren von Popcorn. Laufzeit: ein ganzer Abend · Bild: 16:9 Wohnzimmer · Ton: laut · Sprache: Deutsch · Untertitel: Gelächter. Nicht geeignet für Leute, die beim Abspann aufstehen.' },
    { titel: 'Making-of', text: 'Drehzeit: unzählige Abende. Gestrichene Fragen: geheim. Verbrauchter Kaffee: ebenfalls geheim. Spezialeffekte: die Stehlampe. Jeder Klang auf dieser Seite ist selbst gebaut, kein einziger Ton ist geliehen. (Na gut: Trommelwirbel und Jubel sind echte, freie Aufnahmen. Die Trommel wollte unbedingt mitspielen.)' },
    { titel: 'Kritikerstimmen', text: '„Fünf von fünf Krümeln.“ – die Chipsschale. „Ich bin nur hier, weil ich hier wohne.“ – das Sofa. „Endlich zeige ich mal was Vernünftiges.“ – der Fernseher. „Ein Abend, über den man noch beim Frühstück redet.“ – die Kaffeemaschine.' },
    { titel: 'Pannen vom Dreh', text: 'Take 14: Der Braam war so laut, dass die Nachbarschaft applaudiert hat. Take 22: Disc verkehrt herum eingelegt. Zweimal. Take 31: Chris hat beim Testen gegen sich selbst verloren.' },
    { titel: 'Doppelbesetzung', text: 'Du hast dieselbe Rolle wie jemand anderes? Das ist kein Fehler, das ist ein Showdown. Am 18.11. klärt sich, wer das Original ist.' },
  ],
  geheimnisse: {
    // Reihenfolge = Anzeige im Bonusmaterial; Titel erscheinen erst, wenn das Geheimnis gefunden ist
    liste: [
      ['disc', 'Die verschmutzte Disc'],
      ['countdown', 'Die Popcorn-Zeitrechnung'],
      ['start', 'Der verbotene Hauptfilm'],
      ['umbesetzung', 'Der abgelehnte Rollentausch'],
      ['abspann', 'Die Szene nach dem Abspann'],
    ],
    zaehler: '{n} von 5 Geheimnissen gefunden',
    alle: 'Alle gefunden! Auf deinem Backstage-Pass klebt jetzt die GOLDENE DISC.',
    neu: 'Geheimnis gefunden: {titel} ({n} von 5)',
  },

  /* ---------- 13 · Backstage-Pass ---------- */
  pass: {
    streifen: 'BACKSTAGE · ALL ACCESS*',
    band: 'FILMABEND 2 · CAST · ALL ACCESS',
    zugang: 'alle 11 Kapitel',
    fussnote: '*All Access gilt nicht für den Kühlschrank nach Mitternacht.',
    rueckseite: 'Nicht übertragbar. Spoiler werden an der Tür abgegeben. Am 18.11. denselben Vornamen eintippen, sonst wartet eine andere Rolle. Bei Verlust einfach den Link nochmal öffnen, der Pass kennt dich noch. Bitte nicht laminieren, ist schon.',
    mitbringen: ['Handy mit vollem Akku', 'zur Not das Ladekabel', 'gute Laune', 'Ehrgeiz in verantwortbarer Menge'],
    nichtMitbringen: 'Nicht mitbringen: Ausreden und Spoiler.',
    kalender: 'In den Kalender',
    bild: 'Als Bild speichern',
    tipp: 'Screenshot machen. Kontrolliert wird nicht, aber es sieht fantastisch aus.',
    umdrehen: 'Tippen dreht den Pass um',
    sticker: 'GOLDENE DISC',
    kalenderTitel: 'Filmabend 2 · Das Film- und Serienquiz',
    kalenderText: 'Deine Rolle: {rolle}. Handy mit vollem Akku mitbringen. Im Spiel denselben Vornamen eintippen: {name}.',
    // Für die feste Datei filmabend-2.ics (iPhone): ohne Name und Rolle. Nach einer Änderung hier die Datei neu bauen
    // (Termin, Titel und Ort stehen dort ebenfalls fest drin).
    kalenderTextFest: 'Handy mit vollem Akku mitbringen. Im Spiel denselben Vornamen eintippen wie in der Einladung, dann wartet dieselbe Rolle im Vorspann.',
  },

  /* ---------- 14 · Am Abend: Tür-Ritual (Pass entwerten) ---------- */
  // Nur ab einlassAb sichtbar. {zeit} = Uhrzeit des Stempels (z. B. 19:04). Der Gastgeber wischt einmal quer über den
  // Abschnitt unten am Pass, dann knallt der Stempel. Kein Geheimnis: Wer wischt, entwertet.
  tuer: {
    vorzeigen: 'AM EINLASS VORZEIGEN',
    wischen: 'Der Gastgeber wischt hier quer. Du hältst nur still.',
    nurWischen: 'Wischen, nicht tippen. Das ist Sache des Gastgebers.',
    stempel: 'ENTWERTET',
    willkommen: 'Willkommen',
    abschnitt: 'Abschnitt einbehalten · {zeit}',
    countdown: 'Eingecheckt um {zeit} · Das Sofa wartet',
    hinweis: 'Heute Abend an der Tür vorzeigen. Der Gastgeber entwertet ihn mit einem Wisch. Kein Wisch, kein Sofa.',
    hinweisEntwertet: 'Entwertet um {zeit}. Ab jetzt zählt nur noch, was auf dem Fernseher passiert.',
    menueNeben: 'an der Tür zeigen',
    menueNebenEntwertet: '✓ {zeit}',
    kopf: 'Eingecheckt',
    kopfUnter: '{zeit} · Willkommen im Wohnzimmer',
    willkommenKnopf: '▶ Backstage-Pass vorzeigen',
    aria: 'Abschnitt zum Entwerten. Der Gastgeber wischt hier einmal quer darüber.',
    ariaEntwertet: 'Entwertet um {zeit}. Willkommen.',
  },
};
