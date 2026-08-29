(() => {
  const shell = document.querySelector('.game-shell');
  if (!shell || document.getElementById('clubOnboardingStage')) return;

  const LOGO_BASE = 'assets/clubs/guatemala/';
  const FOUNDATION_START = 250000;
  const CLUB_GRANT = 50000;

  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = 'css/club-system.css?v=3.1.0';
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
  introStage.innerHTML = `<div class="club-system-shell club-intro-shell"><div class="club-intro-copy"><p class="eyebrow">EL NACIMIENTO DE LA PLANTILLA</p><h2 id="clubIntroTitle">Tu club necesita jugadores</h2><p id="clubIntroText"></p></div><div id="clubIntroPlayers" class="club-intro-players"></div><div class="club-tutorial-pills"><span>Plantilla</span><span>Estadísticas</span><span>Historia</span><span>Gestión</span></div><button id="clubIntroNext" class="club-intro-next" type="button">Continuar ›</button></div>`;
  shell.appendChild(introStage);

  const rosterStage = makeStage('clubRosterStage', 'Plantilla', 'Los jugadores que forman parte de este club en tu historia.');
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
      const history = histories.find((item) => item.id === id) || null;
      return { histories, history };
    } catch (error) {
      return { histories: [], history: null };
    }
  }

  function save(histories) {
    localStorage.setItem('lhdf.histories', JSON.stringify(histories));
    if (typeof renderSavedHistories === 'function') renderSavedHistories();
  }

  function clubInfo(id) {
    return window.LHDF_DATA?.clubs?.find((club) => club.id === id) || null;
  }

  function playerInfo(id) {
    return window.LHDF_DATA?.players?.find((player) => player.id === id) || null;
  }

  function logoPath(file) {
    return `${LOGO_BASE}${encodeURIComponent(file).replaceAll('%2F', '/')}`;
  }

  function randomFrom(list) {
    return list[Math.floor(Math.random() * list.length)] || null;
  }

  function pickSquad(excluded) {
    const available = (window.LHDF_DATA?.players || []).filter((player) => player.countryId === 'guatemala' && !excluded.has(player.id));
    const goalkeeper = randomFrom(available.filter((player) => player.position === 'Portero'));
    if (goalkeeper) excluded.add(goalkeeper.id);
    const fieldPool = available.filter((player) => !excluded.has(player.id) && ['Defensa', 'Mediocampista'].includes(player.position));
    const field = randomFrom(fieldPool);
    if (field) excluded.add(field.id);
    const attackPool = available.filter((player) => !excluded.has(player.id) && ['Delantero', 'Mediocampista'].includes(player.position));
    const attack = randomFrom(attackPool);
    if (attack) excluded.add(attack.id);
    return [goalkeeper, field, attack].filter(Boolean).map((player) => player.id);
  }

  function baseClubState(clubId, players, balance = 0) {
    return {
      clubId,
      players,
      balance,
      statistics: { matches: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, titles: 0 },
      history: [],
      transactions: []
    };
  }

  function ensurePlayerState(history, playerId, clubId, clubName) {
    history.playerStates = history.playerStates || {};
    const state = history.playerStates[playerId] || { stats: {}, history: [] };
    state.clubId = clubId;
    state.status = 'Jugador del club';
    state.stats = { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, titles: 0, ...(state.stats || {}) };
    state.history = Array.isArray(state.history) ? state.history : [];
    if (!state.history.some((entry) => entry.type === 'first-club')) {
      state.history.push({ type: 'first-club', date: 'Inicio de la historia', title: `Primer club: ${clubName}`, description: `${clubName} se convirtió en el primer club de su historia en LHDF.` });
    }
    history.playerStates[playerId] = state;
  }

  function ensureClubBeginning() {
    const { histories, history } = loadState();
    if (!history || !history.selectedClub || !history.rivalClub) return null;
    history.clubStates = history.clubStates || {};
    history.playerStates = history.playerStates || {};
    const owned = clubInfo(history.selectedClub);
    const rival = clubInfo(history.rivalClub);
    if (!owned || !rival) return null;

    const excluded = new Set(Object.keys(history.playerStates).filter((id) => history.playerStates[id]?.clubId));

    if (!history.clubStates[owned.id]) {
      const players = pickSquad(excluded);
      history.clubStates[owned.id] = baseClubState(owned.id, players, CLUB_GRANT);
      history.foundationFinance = history.foundationFinance || { balance: FOUNDATION_START, transactions: [{ type: 'income', amount: FOUNDATION_START, description: 'Capital inicial de la Fundación', date: 'Inicio de la historia' }] };
      if (!history.foundationFinance.initialClubGrantDone) {
        history.foundationFinance.balance = Math.max(0, Number(history.foundationFinance.balance || 0) - CLUB_GRANT);
        history.foundationFinance.transactions.push({ type: 'expense', amount: CLUB_GRANT, description: `Aporte inicial a ${owned.name}`, date: 'Inicio de la historia' });
        history.foundationFinance.initialClubGrantDone = true;
      }
      history.clubStates[owned.id].transactions.push({ type: 'income', amount: CLUB_GRANT, description: 'Aporte inicial de la Fundación', date: 'Inicio de la historia' });
      history.clubStates[owned.id].history.push({ type: 'first-squad', date: 'Inicio de la historia', title: 'Nacimiento de la primera plantilla', description: `La Fundación entregó los primeros tres jugadores a ${owned.name}.` });
      history.clubStates[owned.id].history.push({ type: 'inaugural-match', date: 'Próximamente', title: 'Partido inaugural preparado', description: `${owned.name} se prepara para disputar el primer clásico de esta historia ante ${rival.name}.` });
      players.forEach((id) => ensurePlayerState(history, id, owned.id, owned.name));
    } else {
      history.clubStates[owned.id].players.forEach((id) => excluded.add(id));
    }

    if (!history.clubStates[rival.id]) {
      const players = pickSquad(excluded);
      history.clubStates[rival.id] = baseClubState(rival.id, players, CLUB_GRANT);
      history.clubStates[rival.id].transactions.push({ type: 'income', amount: CLUB_GRANT, description: 'Capital inicial del club rival', date: 'Inicio de la historia' });
      history.clubStates[rival.id].history.push({ type: 'first-squad', date: 'Inicio de la historia', title: 'Nacimiento de la primera plantilla', description: `${rival.name} recibió sus primeros tres jugadores.` });
      players.forEach((id) => ensurePlayerState(history, id, rival.id, rival.name));
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
    const club = clubInfo(history.selectedClub);
    const state = history.clubStates?.[history.selectedClub];
    return { history, club, state };
  }

  function renderIntro() {
    const current = currentClubState();
    if (!current?.state || !current.club) return;
    const players = current.state.players.map(playerInfo).filter(Boolean);
    const revealed = Math.max(0, Math.min(3, introStep));
    introPlayers.innerHTML = players.map((player, index) => `<article class="club-reveal-card ${index < revealed ? '' : 'is-hidden'}"><div class="club-reveal-mark">${index < revealed ? '✓' : '?'}</div><strong>${player.name}</strong><span>${player.position}</span></article>`).join('');

    const steps = [
      [`${current.club.name} necesita una plantilla`, 'Un club no puede comenzar su historia sin futbolistas. La Fundación ha encontrado a los primeros jugadores dispuestos a formar parte de este proyecto.'],
      ['Primer jugador', 'La primera pieza de la plantilla ha sido revelada.'],
      ['Segundo jugador', 'El club empieza a tomar forma con un nuevo integrante.'],
      ['La primera plantilla ha nacido', `Estos serán los primeros tres jugadores de ${current.club.name}. Sus carreras, estadísticas y logros comenzarán desde aquí.`],
      ['Plantilla', 'Aquí podrás ver a todos los jugadores del club, sus posiciones y sus fichas individuales. Más adelante administraremos titulares, contratos y fichajes.'],
      ['Estadísticas', 'Aquí se registrarán partidos, victorias, empates, derrotas, goles y títulos conseguidos dentro de esta historia.'],
      ['Historia', 'Cada momento importante del club quedará registrado: la entrega de estos jugadores, el partido inaugural, fichajes, campeonatos y futuros récords.'],
      ['Gestión', 'La Fundación posee dinero general y cada club administra su propio saldo. El dinero del club servirá para salarios, fichajes y futuras mejoras.']
    ];
    const [title, text] = steps[Math.min(introStep, steps.length - 1)];
    introTitle.textContent = title;
    introText.textContent = text;
    introNext.textContent = introStep >= 7 ? 'Entrar al club ›' : 'Continuar ›';
  }

  function beginOnboarding() {
    const history = ensureClubBeginning();
    if (!history) return;
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
    const current = currentClubState();
    if (!current?.club || !current.state) return null;
    stage.querySelectorAll('[data-club-logo]').forEach((img) => img.src = logoPath(current.club.logo));
    return current;
  }

  window.showClubRoster = function () {
    const current = prepareStage(rosterStage); if (!current) return;
    const content = rosterStage.querySelector('[data-club-content]');
    content.className = 'club-system-grid';
    content.innerHTML = current.state.players.map((id) => { const player = playerInfo(id); return player ? `<button class="club-roster-card" type="button" data-roster-player="${id}"><strong>${player.name}</strong><span>${player.position}</span><div class="club-roster-club"><img src="${logoPath(current.club.logo)}" alt=""><b>${current.club.name}</b></div></button>` : ''; }).join('');
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
    managementStage.querySelector('[data-club-content]').innerHTML = `<div class="club-money-grid"><article class="club-money-card"><small>Dinero general de la Fundación</small><strong>${money(finance.balance)}</strong><span>Fondos que pueden distribuirse entre clubes y proyectos.</span></article><article class="club-money-card"><small>Dinero de ${current.club.name}</small><strong>${money(current.state.balance)}</strong><span>Se usará para salarios, fichajes y mejoras del club.</span></article></div><div class="club-transactions"><h3>Movimientos del club</h3>${current.state.transactions.map((tx) => `<article class="club-transaction"><div><small>${tx.date}</small><div>${tx.description}</div></div><strong>+ ${money(tx.amount)}</strong></article>`).join('')}</div>`;
    transitionTo(managementStage);
  };

  [rosterStage, statsStage, historyStage, managementStage].forEach((stage) => stage.querySelector('.club-system-back').addEventListener('click', () => window.showOwnedClubMenu?.()));
  rosterStage.addEventListener('click', (event) => { const player = event.target.closest('[data-roster-player]'); if (player) window.showPlayerDetail?.(player.dataset.rosterPlayer); });

  document.addEventListener('click', (event) => {
    const owned = event.target.closest('[data-owned-club]');
    if (owned) {
      event.preventDefault(); event.stopImmediatePropagation();
      const history = ensureClubBeginning();
      if (!history) return;
      if (history.clubOnboardingCompleted) window.showOwnedClubMenu?.(); else beginOnboarding();
      return;
    }

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
})();