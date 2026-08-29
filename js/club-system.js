(() => {
  const shell = document.querySelector('.game-shell');
  if (!shell || document.getElementById('clubOnboardingStage')) return;

  const LOGO_BASE = 'assets/clubs/guatemala/';
  const FOUNDATION_START = 250000;
  const CLUB_GRANT = 50000;
  const SQUAD_VERSION = 2;
  const ROLES = [
    ['goalkeeper', 'Portero'],
    ['defender', 'Defensa'],
    ['midfielder', 'Mediocampista'],
    ['forward', 'Delantero']
  ];

  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = 'css/club-system.css?v=3.1.2';
  document.head.appendChild(style);

  function makeStage(id, title, subtitle) {
    const stage = document.createElement('section');
    stage.id = id;
    stage.className = 'screen secondary-screen club-system-scene';
    stage.innerHTML = `<div class="club-system-shell"><header class="club-system-header"><div class="club-system-title"><img class="club-system-logo" data-club-logo alt="Escudo del club"><div><p class="eyebrow">MI CLUB</p><h2>${title}</h2><p>${subtitle}</p></div></div><button class="club-system-back" type="button">← Volver al club</button></header><div data-club-content></div></div>`;
    shell.appendChild(stage);
    return stage;
  }

  const introStage = document.createElement('section');
  introStage.id = 'clubOnboardingStage';
  introStage.className = 'screen secondary-screen club-system-scene';
  introStage.innerHTML = `<div class="club-system-shell club-intro-shell"><div class="club-intro-copy"><p class="eyebrow">EL NACIMIENTO DE LA PLANTILLA</p><h2 id="clubIntroTitle">Tu club necesita jugadores</h2><p id="clubIntroText"></p></div><div id="clubIntroPlayers" class="club-intro-players"></div><div class="club-tutorial-pills"><span>Plantilla</span><span>Alineación</span><span>Estadísticas</span><span>Historia</span><span>Gestión</span></div><button id="clubIntroNext" class="club-intro-next" type="button">Continuar ›</button></div>`;
  shell.appendChild(introStage);

  const rosterStage = makeStage('clubRosterStage', 'Plantilla', 'Todos los jugadores que pertenecen al club y la alineación actual para los partidos.');
  const statsStage = makeStage('clubStatsStage', 'Estadísticas', 'El rendimiento acumulado del club dentro de esta partida.');
  const historyStage = makeStage('clubHistoryStage', 'Historia', 'Los momentos que están construyendo la identidad de este club.');
  const managementStage = makeStage('clubManagementStage', 'Gestión', 'Economía y recursos disponibles para hacer crecer al club.');

  const introTitle = document.getElementById('clubIntroTitle');
  const introText = document.getElementById('clubIntroText');
  const introPlayers = document.getElementById('clubIntroPlayers');
  const introNext = document.getElementById('clubIntroNext');
  let introStep = 0;

  function loadState() {
    try {
      const histories = JSON.parse(localStorage.getItem('lhdf.histories') || '[]');
      const id = localStorage.getItem('lhdf.currentHistoryId');
      return { histories, history: histories.find((item) => item.id === id) || null };
    } catch (error) {
      return { histories: [], history: null };
    }
  }

  function save(histories) {
    localStorage.setItem('lhdf.histories', JSON.stringify(histories));
    if (typeof renderSavedHistories === 'function') renderSavedHistories();
  }

  const clubInfo = (id) => window.LHDF_DATA?.clubs?.find((club) => club.id === id) || null;
  const playerInfo = (id) => window.LHDF_DATA?.players?.find((player) => player.id === id) || null;
  const logoPath = (file) => `${LOGO_BASE}${encodeURIComponent(file).replace(/%2F/g, '/')}`;
  const randomFrom = (list) => list[Math.floor(Math.random() * list.length)] || null;

  function pickFour(excluded) {
    const lineup = {};
    for (const [key, position] of ROLES) {
      const options = (window.LHDF_DATA?.players || []).filter((player) => player.countryId === 'guatemala' && player.position === position && !excluded.has(player.id));
      const player = randomFrom(options);
      if (!player) return null;
      lineup[key] = player.id;
      excluded.add(player.id);
    }
    return { players: Object.values(lineup), lineup };
  }

  function defaultStats() {
    return {
      matches: 0, goals: 0, assists: 0, saves: 0, goalsConceded: 0, cleanSheets: 0,
      recoveries: 0, interceptions: 0, passesCompleted: 0, keyPasses: 0,
      shots: 0, shotsOnTarget: 0, yellowCards: 0, redCards: 0, titles: 0
    };
  }

  function baseClubState(clubId, squad, balance = 0) {
    return {
      clubId,
      players: squad.players,
      lineup: squad.lineup,
      balance,
      statistics: { matches: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, titles: 0 },
      history: [],
      transactions: [],
      initialSquadVersion: SQUAD_VERSION
    };
  }

  function releaseOldSquad(history, clubId) {
    const state = history.clubStates?.[clubId];
    if (!state) return;
    (state.players || []).forEach((playerId) => {
      const playerState = history.playerStates?.[playerId];
      if (playerState?.clubId === clubId) {
        playerState.clubId = null;
        playerState.status = 'Disponible';
        playerState.history = (playerState.history || []).filter((entry) => entry.type !== 'first-club');
      }
    });
  }

  function ensurePlayerState(history, playerId, clubId, clubName) {
    history.playerStates = history.playerStates || {};
    const state = history.playerStates[playerId] || {};
    state.clubId = clubId;
    state.status = 'Jugador del club';
    state.stats = { ...defaultStats(), ...(state.stats || {}) };
    state.history = Array.isArray(state.history) ? state.history : [];
    if (!state.history.some((entry) => entry.type === 'first-club')) {
      state.history.push({ type: 'first-club', date: 'Inicio de la historia', title: `Primer club: ${clubName}`, description: `${clubName} se convirtió en el primer club de su historia en LHDF.` });
    }
    history.playerStates[playerId] = state;
  }

  function preserveClubData(oldState, newState, owned) {
    if (!oldState) return newState;
    newState.balance = Number(oldState.balance ?? newState.balance);
    newState.statistics = { ...newState.statistics, ...(oldState.statistics || {}) };
    newState.transactions = Array.isArray(oldState.transactions) ? oldState.transactions : newState.transactions;
    newState.history = (oldState.history || []).filter((entry) => !['first-squad', 'inaugural-match'].includes(entry.type));
    newState.history.push({ type: 'first-squad', date: 'Inicio de la historia', title: 'Nacimiento de la primera plantilla', description: `${owned ? 'La Fundación entregó' : 'El club recibió'} un portero, un defensa, un mediocampista y un delantero como primera plantilla.` });
    return newState;
  }

  function ensureClubBeginning() {
    const { histories, history } = loadState();
    if (!history?.selectedClub || !history?.rivalClub) return null;
    history.clubStates = history.clubStates || {};
    history.playerStates = history.playerStates || {};
    const owned = clubInfo(history.selectedClub);
    const rival = clubInfo(history.rivalClub);
    if (!owned || !rival) return null;

    const needsMigration = history.clubStates[owned.id]?.initialSquadVersion !== SQUAD_VERSION || history.clubStates[rival.id]?.initialSquadVersion !== SQUAD_VERSION;
    if (needsMigration) {
      releaseOldSquad(history, owned.id);
      releaseOldSquad(history, rival.id);
      const oldOwned = history.clubStates[owned.id];
      const oldRival = history.clubStates[rival.id];
      const excluded = new Set(Object.keys(history.playerStates).filter((id) => history.playerStates[id]?.clubId));
      const ownedSquad = pickFour(excluded);
      const rivalSquad = pickFour(excluded);
      if (!ownedSquad || !rivalSquad) return null;

      let ownedState = baseClubState(owned.id, ownedSquad, oldOwned?.balance ?? CLUB_GRANT);
      let rivalState = baseClubState(rival.id, rivalSquad, oldRival?.balance ?? CLUB_GRANT);
      ownedState = preserveClubData(oldOwned, ownedState, true);
      rivalState = preserveClubData(oldRival, rivalState, false);
      ownedState.history.push({ type: 'inaugural-match', date: 'Próximamente', title: 'Partido inaugural preparado', description: `${owned.name} se prepara para disputar el primer partido de esta historia ante ${rival.name}.` });

      history.clubStates[owned.id] = ownedState;
      history.clubStates[rival.id] = rivalState;
      ownedSquad.players.forEach((id) => ensurePlayerState(history, id, owned.id, owned.name));
      rivalSquad.players.forEach((id) => ensurePlayerState(history, id, rival.id, rival.name));
      history.clubOnboardingCompleted = false;
      history.initialSquadVersion = SQUAD_VERSION;
    }

    history.foundationFinance = history.foundationFinance || {
      balance: FOUNDATION_START,
      transactions: [{ type: 'income', amount: FOUNDATION_START, description: 'Capital inicial de la Fundación', date: 'Inicio de la historia' }]
    };
    if (!history.foundationFinance.initialClubGrantDone) {
      history.foundationFinance.balance = Math.max(0, Number(history.foundationFinance.balance || 0) - CLUB_GRANT);
      history.foundationFinance.transactions.push({ type: 'expense', amount: CLUB_GRANT, description: `Aporte inicial a ${owned.name}`, date: 'Inicio de la historia' });
      history.foundationFinance.initialClubGrantDone = true;
      history.clubStates[owned.id].balance = CLUB_GRANT;
      history.clubStates[owned.id].transactions.push({ type: 'income', amount: CLUB_GRANT, description: 'Aporte inicial de la Fundación', date: 'Inicio de la historia' });
    }

    history.updatedAt = new Date().toISOString();
    save(histories);
    return history;
  }

  function transitionTo(stage) {
    if (typeof fade !== 'undefined') fade.classList.add('is-visible');
    window.setTimeout(() => {
      document.querySelectorAll('.screen.active').forEach((screen) => screen.classList.remove('active'));
      stage.classList.add('active');
      if (typeof fade !== 'undefined') requestAnimationFrame(() => fade.classList.remove('is-visible'));
    }, typeof TRANSITION_TIME === 'number' ? TRANSITION_TIME : 480);
  }

  function currentClubState() {
    const { history } = loadState();
    if (!history) return null;
    return { history, club: clubInfo(history.selectedClub), state: history.clubStates?.[history.selectedClub] };
  }

  function renderIntro() {
    const current = currentClubState();
    if (!current?.state || !current.club) return;
    const players = ROLES.map(([key, position]) => ({ position, player: playerInfo(current.state.lineup?.[key]) })).filter((item) => item.player);
    const revealed = Math.max(0, Math.min(4, introStep));
    introPlayers.innerHTML = players.map((item, index) => `<article class="club-reveal-card ${index < revealed ? '' : 'is-hidden'}"><div class="club-reveal-mark">${index < revealed ? '✓' : '?'}</div><small>${item.position}</small><strong>${item.player.name}</strong><span>${item.player.position}</span></article>`).join('');

    const steps = [
      [`${current.club.name} necesita una plantilla`, 'Para competir necesitaremos cubrir cuatro funciones: portería, defensa, creación y ataque. La Fundación ha encontrado a los primeros futbolistas del club.'],
      ['El guardián de la portería', 'El Portero permanecerá en su zona. Su misión principal será detener los disparos rivales y comenzar las jugadas.'],
      ['La primera línea defensiva', 'El Defensa protegerá el camino hacia la portería, interceptará y ayudará a sacar el balón.'],
      ['El creador del juego', 'El Mediocampista conectará la defensa con el ataque mediante pases, recuperaciones y futuras asistencias.'],
      ['El primer goleador', 'El Delantero será quien pueda finalizar las jugadas y buscar el gol. La primera alineación ya está completa.'],
      ['Plantilla y alineación', 'Plantilla reunirá a todos los futbolistas del club. Alineación decidirá quién ocupa Portero, Defensa, Mediocampista y Delantero en cada partido.'],
      ['Estadísticas', 'El club registrará partidos, resultados y títulos. Cada jugador tendrá estadísticas diferentes según su posición.'],
      ['Historia y Gestión', 'Los momentos importantes quedarán en Historia. Gestión seguirá controlando el dinero propio del club y los aportes de la Fundación.']
    ];
    const [title, text] = steps[Math.min(introStep, steps.length - 1)];
    introTitle.textContent = title;
    introText.textContent = text;
    introNext.textContent = introStep >= steps.length - 1 ? 'Entrar al club ›' : 'Continuar ›';
  }

  function beginOnboarding() {
    if (!ensureClubBeginning()) return;
    introStep = 0;
    renderIntro();
    transitionTo(introStage);
  }

  introNext.addEventListener('click', () => {
    if (introStep < 7) {
      introStep += 1;
      renderIntro();
      return;
    }
    const { histories, history } = loadState();
    if (history) {
      history.clubOnboardingCompleted = true;
      history.updatedAt = new Date().toISOString();
      save(histories);
    }
    window.showOwnedClubMenu?.();
  });

  function prepareStage(stage) {
    ensureClubBeginning();
    const current = currentClubState();
    if (!current?.club || !current.state) return null;
    stage.querySelectorAll('[data-club-logo]').forEach((img) => img.src = logoPath(current.club.logo));
    return current;
  }

  window.showClubRoster = function () {
    const current = prepareStage(rosterStage); if (!current) return;
    const content = rosterStage.querySelector('[data-club-content]');
    const roleById = Object.fromEntries(ROLES.map(([key, position]) => [current.state.lineup?.[key], position]));
    content.className = '';
    content.innerHTML = `<section class="club-lineup-panel"><div><p class="eyebrow">ALINEACIÓN ACTUAL</p><h3>Los cuatro roles del partido</h3></div><div class="club-lineup-row">${ROLES.map(([key, position]) => { const p = playerInfo(current.state.lineup?.[key]); return `<article><small>${position}</small><strong>${p?.name || 'Vacante'}</strong></article>`; }).join('')}</div><p>Cuando la plantilla crezca podrás cambiar quién ocupa cada puesto antes de jugar.</p></section><div class="club-system-grid">${current.state.players.map((id) => { const player = playerInfo(id); return player ? `<button class="club-roster-card" type="button" data-roster-player="${id}"><small class="club-roster-role">${roleById[id] || 'Plantilla'}</small><strong>${player.name}</strong><span>${player.position}</span><div class="club-roster-club"><img src="${logoPath(current.club.logo)}" alt=""><b>${current.club.name}</b></div></button>` : ''; }).join('')}</div>`;
    transitionTo(rosterStage);
  };

  window.showClubStats = function () {
    const current = prepareStage(statsStage); if (!current) return;
    const s = current.state.statistics;
    statsStage.querySelector('[data-club-content]').innerHTML = `<div class="club-stats-grid"><div class="club-stat"><strong>${s.matches}</strong><span>Partidos</span></div><div class="club-stat"><strong>${s.wins}</strong><span>Victorias</span></div><div class="club-stat"><strong>${s.draws}</strong><span>Empates</span></div><div class="club-stat"><strong>${s.losses}</strong><span>Derrotas</span></div><div class="club-stat"><strong>${s.goalsFor}</strong><span>Goles a favor</span></div><div class="club-stat"><strong>${s.goalsAgainst}</strong><span>Goles en contra</span></div><div class="club-stat"><strong>${s.titles}</strong><span>Títulos</span></div></div>`;
    transitionTo(statsStage);
  };

  window.showClubHistory = function () {
    const current = prepareStage(historyStage); if (!current) return;
    historyStage.querySelector('[data-club-content]').innerHTML = `<div class="club-history-list">${current.state.history.map((entry) => `<article class="club-history-entry"><small>${entry.date}</small><strong>${entry.title}</strong><span>${entry.description}</span></article>`).join('')}</div>`;
    transitionTo(historyStage);
  };

  const money = (value) => new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ', maximumFractionDigits: 0 }).format(value || 0);
  window.showClubManagement = function () {
    const current = prepareStage(managementStage); if (!current) return;
    const finance = current.history.foundationFinance || { balance: 0, transactions: [] };
    managementStage.querySelector('[data-club-content]').innerHTML = `<div class="club-money-grid"><article class="club-money-card"><small>Dinero general de la Fundación</small><strong>${money(finance.balance)}</strong><span>Fondos que pueden distribuirse entre clubes y proyectos.</span></article><article class="club-money-card"><small>Dinero de ${current.club.name}</small><strong>${money(current.state.balance)}</strong><span>Se usará para salarios, fichajes y mejoras del club.</span></article></div><div class="club-transactions"><h3>Movimientos del club</h3>${current.state.transactions.map((tx) => `<article class="club-transaction"><div><small>${tx.date}</small><div>${tx.description}</div></div><strong>${tx.type === 'expense' ? '-' : '+'} ${money(tx.amount)}</strong></article>`).join('') || '<p>Sin movimientos.</p>'}</div>`;
    transitionTo(managementStage);
  };

  document.querySelectorAll('.club-system-back').forEach((button) => button.addEventListener('click', () => window.showOwnedClubMenu?.()));
  rosterStage.addEventListener('click', (event) => {
    const card = event.target.closest('[data-roster-player]');
    if (card) window.showPlayerDetail?.(card.dataset.rosterPlayer);
  });

  const originalShowOwnedClubMenu = window.showOwnedClubMenu;
  window.showOwnedClubMenu = function () {
    const history = ensureClubBeginning();
    if (!history) return;
    if (!history.clubOnboardingCompleted) { beginOnboarding(); return; }
    originalShowOwnedClubMenu?.();
  };

  document.addEventListener('click', (event) => {
    const option = event.target.closest('.club-menu-option');
    if (!option) return;
    const title = option.querySelector('strong')?.textContent.trim();
    const actions = { Plantilla: window.showClubRoster, Estadísticas: window.showClubStats, Historia: window.showClubHistory, Gestión: window.showClubManagement };
    if (actions[title]) { event.preventDefault(); actions[title](); }
  }, true);

  document.querySelectorAll('.club-menu-option').forEach((option) => {
    option.classList.add('is-active');
    const em = option.querySelector('em'); if (em) em.textContent = 'Disponible';
  });

  window.ensureLHDFClubBeginning = ensureClubBeginning;
})();