(() => {
  const shell = document.querySelector('.game-shell');
  if (!shell || document.getElementById('matchGameStage')) return;

  const LOGO_BASE = 'assets/clubs/guatemala/';
  const ROLES = [
    ['goalkeeper', 'POR'],
    ['defender', 'DEF'],
    ['midfielder', 'MED'],
    ['forward', 'DEL']
  ];
  const ROLE_NAMES = { goalkeeper: 'Portero', defender: 'Defensa', midfielder: 'Mediocampista', forward: 'Delantero' };
  const ZONES = {
    home: {
      goalkeeper: { minX: 4, maxX: 19, minY: 28, maxY: 72 },
      defender: { minX: 8, maxX: 57, minY: 10, maxY: 90 },
      midfielder: { minX: 20, maxX: 79, minY: 8, maxY: 92 },
      forward: { minX: 40, maxX: 94, minY: 8, maxY: 92 }
    },
    away: {
      goalkeeper: { minX: 81, maxX: 96, minY: 28, maxY: 72 },
      defender: { minX: 43, maxX: 92, minY: 10, maxY: 90 },
      midfielder: { minX: 21, maxX: 80, minY: 8, maxY: 92 },
      forward: { minX: 6, maxX: 60, minY: 8, maxY: 92 }
    }
  };
  const START_POSITIONS = {
    home: {
      goalkeeper: { x: 10, y: 50 }, defender: { x: 30, y: 57 }, midfielder: { x: 47, y: 40 }, forward: { x: 67, y: 54 }
    },
    away: {
      goalkeeper: { x: 90, y: 50 }, defender: { x: 70, y: 43 }, midfielder: { x: 53, y: 60 }, forward: { x: 33, y: 46 }
    }
  };

  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = 'css/match-game.css?v=3.1.3';
  document.head.appendChild(style);

  const stage = document.createElement('section');
  stage.id = 'matchGameStage';
  stage.className = 'screen secondary-screen match-game-scene';
  stage.innerHTML = `
    <div class="match-game-shell">
      <header class="match-game-header">
        <button id="matchGameBack" class="match-game-back" type="button">← Volver al club</button>
        <div class="match-scoreboard">
          <div><strong id="matchHomeCode">LOC</strong><span id="matchHomeScore">0</span></div>
          <b id="matchClock">00'</b>
          <div><span id="matchAwayScore">0</span><strong id="matchAwayCode">VIS</strong></div>
        </div>
        <button id="matchPauseButton" class="match-pause" type="button">⏸ Pausa</button>
      </header>

      <main class="board-match-main">
        <section class="board-wrap">
          <div id="turnField" class="board-field">
            <div class="board-half-line"></div>
            <div class="board-center-circle"></div>
            <div class="board-box board-box-home"></div>
            <div class="board-box board-box-away"></div>
            <div class="board-goal board-goal-home"></div>
            <div class="board-goal board-goal-away"></div>
            <svg id="aimLayer" class="board-aim" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <defs><marker id="aimArrowHead" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 Z"></path></marker></defs>
              <line id="aimLine" x1="0" y1="0" x2="0" y2="0"></line>
            </svg>
            <div id="homePieces" class="board-team"></div>
            <div id="awayPieces" class="board-team"></div>
            <div id="boardBall" class="board-ball">⚽</div>
          </div>
          <div id="matchEvent" class="match-event">El partido está listo.</div>
        </section>

        <aside class="board-panel">
          <p class="eyebrow" id="turnEyebrow">PARTIDO TÁCTICO</p>
          <h2 id="turnTitle">Apunta y juega</h2>
          <p id="turnDescription">Selecciona una ficha y arrastra para elegir dirección. Cada movimiento consume tu turno.</p>
          <div class="board-help">
            <div><b>↗ Mover</b><span>Arrastra a una zona vacía.</span></div>
            <div><b>⚽ Pasar</b><span>Suelta sobre un compañero.</span></div>
            <div><b>🥅 Disparar</b><span>Solo el delantero puede apuntar al arco.</span></div>
          </div>
          <div class="turn-rule"><strong>1 movimiento</strong><span>por turno</span></div>
          <button id="matchStartButton" class="match-start" type="button">Comenzar partido</button>
        </aside>
      </main>

      <footer class="board-footer">
        <span id="selectedLabel">Ficha: —</span>
        <strong id="possessionLabel">Posesión: —</strong>
        <span>POR · DEF · MED · DEL</span>
      </footer>

      <div id="goalCelebration" class="goal-celebration" hidden>
        <div class="goal-celebration-card">
          <div class="goal-word">¡GOOOOOOL!</div>
          <img id="goalClubLogo" alt="Escudo del club">
          <strong id="goalPlayerName">Jugador</strong>
          <span id="goalClubName">Club</span>
          <b id="goalScoreText">1 - 0</b>
        </div>
      </div>

      <div id="pauseOverlay" class="match-pause-overlay" hidden>
        <div class="match-pause-card">
          <p class="eyebrow">PARTIDO EN PAUSA</p>
          <h2>La historia espera.</h2>
          <p>El turno actual queda detenido.</p>
          <button id="resumeMatchButton" type="button">Continuar</button>
          <button id="pauseRulesButton" type="button">Cómo jugar</button>
          <button id="abandonMatchButton" class="is-danger" type="button">Abandonar partido</button>
          <div id="pauseRules" class="pause-rules" hidden>Arrastra una ficha a una zona vacía para moverla. Si la ficha tiene la pelota, suelta sobre un compañero para pasar. Solo el delantero puede disparar apuntando hacia la portería rival. Cada acción termina tu turno.</div>
        </div>
      </div>
    </div>`;
  shell.appendChild(stage);

  const fieldEl = document.getElementById('turnField');
  const homePiecesEl = document.getElementById('homePieces');
  const awayPiecesEl = document.getElementById('awayPieces');
  const ballEl = document.getElementById('boardBall');
  const aimLine = document.getElementById('aimLine');
  const homeScoreEl = document.getElementById('matchHomeScore');
  const awayScoreEl = document.getElementById('matchAwayScore');
  const homeCodeEl = document.getElementById('matchHomeCode');
  const awayCodeEl = document.getElementById('matchAwayCode');
  const clockEl = document.getElementById('matchClock');
  const eventEl = document.getElementById('matchEvent');
  const turnEyebrow = document.getElementById('turnEyebrow');
  const turnTitle = document.getElementById('turnTitle');
  const turnDescription = document.getElementById('turnDescription');
  const possessionLabel = document.getElementById('possessionLabel');
  const selectedLabel = document.getElementById('selectedLabel');
  const startButton = document.getElementById('matchStartButton');
  const pauseButton = document.getElementById('matchPauseButton');
  const pauseOverlay = document.getElementById('pauseOverlay');
  const goalCelebration = document.getElementById('goalCelebration');

  let homeClub = null;
  let awayClub = null;
  let homeLineup = null;
  let awayLineup = null;
  let pieces = { home: {}, away: {} };
  let possession = { side: 'home', role: 'goalkeeper' };
  let selected = null;
  let drag = null;
  let minute = 0;
  let homeScore = 0;
  let awayScore = 0;
  let running = false;
  let paused = false;
  let resolving = false;
  let halftimeShown = false;
  let matchStats = {};
  let goalLog = [];
  let pendingAssist = { home: null, away: null };

  function loadState() {
    try {
      const histories = JSON.parse(localStorage.getItem('lhdf.histories') || '[]');
      const id = localStorage.getItem('lhdf.currentHistoryId');
      return { histories, history: histories.find((item) => item.id === id) || null };
    } catch (error) {
      return { histories: [], history: null };
    }
  }

  const clubInfo = (id) => window.LHDF_DATA?.clubs?.find((club) => club.id === id) || null;
  const playerInfo = (id) => window.LHDF_DATA?.players?.find((player) => player.id === id) || null;
  const logoPath = (file) => `${LOGO_BASE}${encodeURIComponent(file).replace(/%2F/g, '/')}`;
  const codeFor = (club) => (club?.name || 'CLB').replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, '').slice(0, 3).toUpperCase();
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const chance = (p) => Math.random() < p;
  const pick = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  function lineupFromState(state) {
    if (!state?.lineup) return null;
    const result = {};
    for (const [role] of ROLES) {
      const player = playerInfo(state.lineup[role]);
      if (!player) return null;
      result[role] = player;
    }
    return result;
  }

  function stat(id, key, amount = 1) {
    matchStats[id] = matchStats[id] || {};
    matchStats[id][key] = (matchStats[id][key] || 0) + amount;
  }

  function resetPositions() {
    pieces = { home: {}, away: {} };
    ['home', 'away'].forEach((side) => {
      ROLES.forEach(([role]) => {
        pieces[side][role] = { ...START_POSITIONS[side][role] };
      });
    });
  }

  function piecePlayer(side, role) {
    return (side === 'home' ? homeLineup : awayLineup)?.[role] || null;
  }

  function pieceClub(side) {
    return side === 'home' ? homeClub : awayClub;
  }

  function clubColor(club, side) {
    const map = {
      municipal: '#d52b3d', comunicaciones: '#efefef', 'antigua-gfc': '#27905d', 'xelaju-mc': '#2452c9',
      mixco: '#51a663', guastatoya: '#e9cf35', 'san-pedro': '#d72c39', suchitepequez: '#e5c728',
      marquense: '#e8c22a', aurora: '#2675d0', malacateco: '#d8323d', 'coban-imperial': '#2476c8'
    };
    return map[club?.id] || (side === 'home' ? '#36d69a' : '#f1f1f1');
  }

  function pieceMarkup(side, role) {
    const player = piecePlayer(side, role);
    const p = pieces[side][role];
    const owns = possession.side === side && possession.role === role;
    const active = selected?.side === side && selected?.role === role;
    const color = clubColor(pieceClub(side), side);
    return `<button class="board-piece ${owns ? 'has-ball' : ''} ${active ? 'is-selected' : ''}" data-side="${side}" data-role="${role}" type="button" style="left:${p.x}%;top:${p.y}%;--piece-color:${color}"><span>${ROLE_NAMES[role]}</span><strong>${player?.name || 'Jugador'}</strong><b>${ROLES.find(([key]) => key === role)?.[1] || role}</b></button>`;
  }

  function renderField() {
    homePiecesEl.innerHTML = ROLES.map(([role]) => pieceMarkup('home', role)).join('');
    awayPiecesEl.innerHTML = ROLES.map(([role]) => pieceMarkup('away', role)).join('');
    const ownerPos = pieces[possession.side][possession.role];
    ballEl.style.left = `${ownerPos.x}%`;
    ballEl.style.top = `${ownerPos.y}%`;
    const club = pieceClub(possession.side);
    const player = piecePlayer(possession.side, possession.role);
    possessionLabel.textContent = `Posesión: ${club?.name || '—'} · ${player?.name || '—'}`;
    selectedLabel.textContent = selected ? `Ficha: ${piecePlayer(selected.side, selected.role)?.name || '—'}` : 'Ficha: —';
    homeScoreEl.textContent = String(homeScore);
    awayScoreEl.textContent = String(awayScore);
    clockEl.textContent = `${String(Math.min(minute, 90)).padStart(2, '0')}'`;
  }

  function transitionTo(target) {
    if (typeof fade !== 'undefined') fade.classList.add('is-visible');
    window.setTimeout(() => {
      document.querySelectorAll('.screen.active').forEach((screen) => screen.classList.remove('active'));
      target.classList.add('active');
      if (typeof fade !== 'undefined') requestAnimationFrame(() => fade.classList.remove('is-visible'));
    }, typeof TRANSITION_TIME === 'number' ? TRANSITION_TIME : 480);
  }

  function prepareMatch() {
    window.ensureLHDFClubBeginning?.();
    const { history } = loadState();
    const homeState = history?.clubStates?.[history.selectedClub];
    const awayState = history?.clubStates?.[history.rivalClub];
    if (!homeState || !awayState) return false;
    homeClub = clubInfo(history.selectedClub);
    awayClub = clubInfo(history.rivalClub);
    homeLineup = lineupFromState(homeState);
    awayLineup = lineupFromState(awayState);
    if (!homeClub || !awayClub || !homeLineup || !awayLineup) return false;

    resetPositions();
    possession = { side: 'home', role: 'goalkeeper' };
    selected = null;
    minute = 0;
    homeScore = 0;
    awayScore = 0;
    running = false;
    paused = false;
    resolving = false;
    halftimeShown = false;
    matchStats = {};
    goalLog = [];
    pendingAssist = { home: null, away: null };
    homeCodeEl.textContent = codeFor(homeClub);
    awayCodeEl.textContent = codeFor(awayClub);
    eventEl.textContent = `${homeClub.name} vs ${awayClub.name}.`;
    turnEyebrow.textContent = 'PARTIDO TÁCTICO';
    turnTitle.textContent = 'Apunta y juega';
    turnDescription.textContent = 'Selecciona una ficha y arrastra. Mover, pasar o disparar consume el turno.';
    startButton.hidden = false;
    startButton.textContent = 'Comenzar partido';
    pauseButton.disabled = true;
    renderField();
    return true;
  }

  function advanceClock() {
    minute += pick(2, 4);
    if (!halftimeShown && minute >= 45) {
      halftimeShown = true;
      minute = 45;
      setEvent('Descanso. Los equipos reorganizan sus fichas.');
    }
    minute = Math.min(90, minute);
    renderField();
  }

  function setEvent(text) {
    eventEl.textContent = `${String(Math.min(minute, 90)).padStart(2, '0')}’ · ${text}`;
  }

  function pointerPercent(event) {
    const rect = fieldEl.getBoundingClientRect();
    return {
      x: clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100),
      y: clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100)
    };
  }

  function closestPieceAt(point, side, exceptRole = null, radius = 7.2) {
    let best = null;
    ROLES.forEach(([role]) => {
      if (role === exceptRole) return;
      const p = pieces[side][role];
      const d = dist(point, p);
      if (d <= radius && (!best || d < best.distance)) best = { role, distance: d };
    });
    return best;
  }

  function pointToSegmentDistance(p, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    if (!dx && !dy) return dist(p, a);
    const t = clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy), 0, 1);
    return dist(p, { x: a.x + t * dx, y: a.y + t * dy });
  }

  function findInterceptor(side, from, to) {
    const rival = side === 'home' ? 'away' : 'home';
    let candidate = null;
    ROLES.forEach(([role]) => {
      const p = pieces[rival][role];
      const lane = pointToSegmentDistance(p, from, to);
      const endpointDistance = dist(p, to);
      if (lane < 5.4 && endpointDistance > 5 && (!candidate || lane < candidate.lane)) candidate = { side: rival, role, lane };
    });
    return candidate;
  }

  function zonePoint(side, role, point) {
    const z = ZONES[side][role];
    return { x: clamp(point.x, z.minX, z.maxX), y: clamp(point.y, z.minY, z.maxY) };
  }

  function maxMoveFor(role) {
    return role === 'goalkeeper' ? 12 : role === 'defender' ? 16 : role === 'midfielder' ? 18 : 17;
  }

  function limitMove(from, desired, role) {
    const max = maxMoveFor(role);
    const d = dist(from, desired);
    if (d <= max) return desired;
    const ratio = max / d;
    return { x: from.x + (desired.x - from.x) * ratio, y: from.y + (desired.y - from.y) * ratio };
  }

  function attemptSteal(movingSide, movingRole) {
    const other = movingSide === 'home' ? 'away' : 'home';
    if (possession.side !== other) return false;
    const mover = pieces[movingSide][movingRole];
    const carrier = pieces[other][possession.role];
    if (dist(mover, carrier) > 8.5) return false;
    const probability = movingRole === 'defender' ? .58 : movingRole === 'midfielder' ? .52 : movingRole === 'forward' ? .36 : .2;
    if (chance(probability)) {
      const player = piecePlayer(movingSide, movingRole);
      possession = { side: movingSide, role: movingRole };
      stat(player.id, 'recoveries');
      pendingAssist[other] = null;
      setEvent(`${player.name} gana el duelo y recupera la pelota.`);
      return true;
    }
    setEvent(`${piecePlayer(other, possession.role).name} resiste el duelo y conserva la pelota.`);
    return false;
  }

  function movePiece(side, role, target) {
    const from = { ...pieces[side][role] };
    const limited = limitMove(from, zonePoint(side, role, target), role);
    const finalPoint = zonePoint(side, role, limited);
    pieces[side][role] = finalPoint;
    const player = piecePlayer(side, role);
    if (possession.side === side && possession.role === role) {
      setEvent(`${player.name} conduce y cambia de posición.`);
    } else {
      setEvent(`${player.name} se mueve para ocupar otro espacio.`);
      attemptSteal(side, role);
    }
    renderField();
  }

  function passBall(side, fromRole, toRole) {
    if (possession.side !== side || possession.role !== fromRole) return false;
    const from = pieces[side][fromRole];
    const to = pieces[side][toRole];
    const passer = piecePlayer(side, fromRole);
    const receiver = piecePlayer(side, toRole);
    const interceptor = findInterceptor(side, from, to);
    const passDistance = dist(from, to);
    let completion = clamp(.96 - Math.max(0, passDistance - 18) * .009, .62, .96);
    if (interceptor) completion -= .27;
    if (chance(completion)) {
      possession = { side, role: toRole };
      stat(passer.id, 'passesCompleted');
      if (toRole === 'forward') pendingAssist[side] = passer.id;
      setEvent(`${passer.name} encuentra a ${receiver.name} con un pase.`);
      renderField();
      return true;
    }
    const rival = side === 'home' ? 'away' : 'home';
    const role = interceptor?.role || closestPieceAt(to, rival, null, 14)?.role || 'midfielder';
    possession = { side: rival, role };
    stat(piecePlayer(rival, role).id, 'interceptions');
    pendingAssist[side] = null;
    setEvent(`${piecePlayer(rival, role).name} corta el pase de ${passer.name}.`);
    renderField();
    return false;
  }

  function isGoalAim(side, point) {
    if (side === 'home') return point.x >= 94 && point.y >= 36 && point.y <= 64;
    return point.x <= 6 && point.y >= 36 && point.y <= 64;
  }

  function shoot(side, target) {
    if (possession.side !== side || possession.role !== 'forward') return false;
    const striker = piecePlayer(side, 'forward');
    const keeperSide = side === 'home' ? 'away' : 'home';
    const keeper = piecePlayer(keeperSide, 'goalkeeper');
    const strikerPos = pieces[side].forward;
    const keeperPos = pieces[keeperSide].goalkeeper;
    stat(striker.id, 'shots');

    const distanceToGoal = side === 'home' ? 100 - strikerPos.x : strikerPos.x;
    const accuracy = clamp(.86 - Math.max(0, distanceToGoal - 20) * .008, .46, .86);
    if (!chance(accuracy)) {
      possession = { side: keeperSide, role: 'goalkeeper' };
      pendingAssist[side] = null;
      setEvent(`${striker.name} remata, pero falla la portería.`);
      renderField();
      return false;
    }

    stat(striker.id, 'shotsOnTarget');
    const aimY = clamp(target.y, 36, 64);
    const keeperGap = Math.abs(keeperPos.y - aimY);
    const saveChance = clamp(.72 - keeperGap * .025 + Math.max(0, distanceToGoal - 25) * .004, .18, .76);
    if (chance(saveChance)) {
      stat(keeper.id, 'saves');
      possession = { side: keeperSide, role: 'goalkeeper' };
      pendingAssist[side] = null;
      setEvent(`${keeper.name} lee el disparo y realiza la atajada.`);
      renderField();
      return false;
    }

    if (side === 'home') homeScore += 1; else awayScore += 1;
    stat(striker.id, 'goals');
    stat(keeper.id, 'goalsConceded');
    if (pendingAssist[side] && pendingAssist[side] !== striker.id) stat(pendingAssist[side], 'assists');
    goalLog.push({ side, scorerId: striker.id, assisterId: pendingAssist[side], minute: Math.min(minute, 90) });
    pendingAssist[side] = null;
    renderField();
    showGoal(side, striker);
    return true;
  }

  function showGoal(side, striker) {
    resolving = true;
    const club = pieceClub(side);
    document.getElementById('goalClubLogo').src = logoPath(club.logo);
    document.getElementById('goalPlayerName').textContent = striker.name;
    document.getElementById('goalClubName').textContent = club.name;
    document.getElementById('goalScoreText').textContent = `${homeScore} - ${awayScore}`;
    goalCelebration.hidden = false;
    window.setTimeout(() => {
      goalCelebration.hidden = true;
      resetPositions();
      possession = { side: side === 'home' ? 'away' : 'home', role: 'goalkeeper' };
      selected = null;
      renderField();
      setEvent(`Saque de ${pieceClub(possession.side).name} después del gol.`);
      resolving = false;
      if (minute >= 90) finishMatch();
      else if (side === 'home') scheduleAI();
      else beginHomeTurn();
    }, 1800);
  }

  function beginHomeTurn() {
    if (!running || paused || resolving) return;
    selected = null;
    renderField();
    turnEyebrow.textContent = 'TU TURNO';
    turnTitle.textContent = possession.side === 'home' ? 'Construye tu jugada' : 'Defiende y busca recuperar';
    turnDescription.textContent = 'Arrastra una ficha. La acción que ejecutes consumirá este turno.';
  }

  function executeHomeDrag(side, role, point) {
    if (!running || paused || resolving || side !== 'home') return;
    resolving = true;
    const ownsBall = possession.side === 'home' && possession.role === role;
    const teammate = ownsBall ? closestPieceAt(point, 'home', role, 8) : null;

    if (ownsBall && role === 'forward' && isGoalAim('home', point)) {
      shoot('home', point);
    } else if (teammate) {
      passBall('home', role, teammate.role);
    } else {
      movePiece('home', role, point);
    }

    advanceClock();
    if (!goalCelebration.hidden) return;
    if (minute >= 90) { finishMatch(); return; }
    selected = null;
    renderField();
    scheduleAI();
  }

  function scheduleAI() {
    turnEyebrow.textContent = 'TURNO RIVAL';
    turnTitle.textContent = `${awayClub.name} está pensando...`;
    turnDescription.textContent = 'El rival también dispone de una sola acción.';
    window.setTimeout(aiTurn, 650);
  }

  function randomZonePoint(side, role, towardBall = false) {
    const z = ZONES[side][role];
    if (towardBall) {
      const carrier = pieces[possession.side][possession.role];
      return zonePoint(side, role, { x: carrier.x + pick(-5, 5), y: carrier.y + pick(-6, 6) });
    }
    return { x: pick(Math.ceil(z.minX), Math.floor(z.maxX)), y: pick(Math.ceil(z.minY), Math.floor(z.maxY)) };
  }

  function bestAwayPassTarget(fromRole) {
    const options = fromRole === 'goalkeeper' ? ['defender'] : fromRole === 'defender' ? ['midfielder', 'forward'] : fromRole === 'midfielder' ? ['forward', 'defender'] : ['midfielder'];
    return options[Math.floor(Math.random() * options.length)];
  }

  function aiTurn() {
    if (!running || paused) { resolving = false; return; }
    resolving = true;

    if (possession.side === 'away') {
      const role = possession.role;
      if (role === 'forward' && isGoalAim('away', { x: 3, y: clamp(50 + pick(-14, 14), 36, 64) }) && (pieces.away.forward.x < 44 || chance(.55))) {
        shoot('away', { x: 2, y: clamp(50 + pick(-14, 14), 36, 64) });
      } else if (role !== 'forward' && chance(.72)) {
        passBall('away', role, bestAwayPassTarget(role));
      } else if (role === 'forward' && chance(.55)) {
        passBall('away', 'forward', 'midfielder');
      } else {
        const direction = role === 'goalkeeper' ? randomZonePoint('away', role) : zonePoint('away', role, { x: pieces.away[role].x - pick(8, 15), y: pieces.away[role].y + pick(-10, 10) });
        movePiece('away', role, direction);
      }
    } else {
      const carrier = pieces.home[possession.role];
      const candidates = ROLES.map(([role]) => ({ role, d: dist(pieces.away[role], carrier) })).sort((a, b) => a.d - b.d);
      const chosen = candidates.find((item) => item.role !== 'goalkeeper') || candidates[0];
      if (chosen.d < 16 || chance(.7)) movePiece('away', chosen.role, randomZonePoint('away', chosen.role, true));
      else movePiece('away', 'midfielder', randomZonePoint('away', 'midfielder'));
    }

    advanceClock();
    if (!goalCelebration.hidden) return;
    if (minute >= 90) { finishMatch(); return; }
    resolving = false;
    beginHomeTurn();
  }

  function saveResultOnce() {
    const { histories, history } = loadState();
    if (!history || history.inauguralMatchPlayed) return;
    const homeState = history.clubStates?.[history.selectedClub];
    const awayState = history.clubStates?.[history.rivalClub];
    if (!homeState || !awayState) return;

    function applyClub(state, gf, ga) {
      state.statistics = state.statistics || {};
      state.statistics.matches = (state.statistics.matches || 0) + 1;
      state.statistics.goalsFor = (state.statistics.goalsFor || 0) + gf;
      state.statistics.goalsAgainst = (state.statistics.goalsAgainst || 0) + ga;
      if (gf > ga) state.statistics.wins = (state.statistics.wins || 0) + 1;
      else if (gf < ga) state.statistics.losses = (state.statistics.losses || 0) + 1;
      else state.statistics.draws = (state.statistics.draws || 0) + 1;
    }
    applyClub(homeState, homeScore, awayScore);
    applyClub(awayState, awayScore, homeScore);

    [...Object.values(homeLineup), ...Object.values(awayLineup)].forEach((player) => {
      const state = history.playerStates?.[player.id];
      if (!state) return;
      state.stats = state.stats || {};
      state.stats.matches = (state.stats.matches || 0) + 1;
      const updates = matchStats[player.id] || {};
      Object.entries(updates).forEach(([key, value]) => { state.stats[key] = (state.stats[key] || 0) + value; });
    });

    const title = `${homeClub.name} ${homeScore}-${awayScore} ${awayClub.name}`;
    homeState.history = homeState.history || [];
    homeState.history.push({ type: 'first-match-played', date: 'Primer partido', title: 'Primer partido de la historia', description: title });
    goalLog.forEach((goal) => {
      const scorer = playerInfo(goal.scorerId);
      const scorerState = history.playerStates?.[goal.scorerId];
      if (scorerState) {
        scorerState.history = scorerState.history || [];
        scorerState.history.push({ type: 'goal', date: `${goal.minute}'`, title: 'Gol en el partido inaugural', description: `${scorer?.name || 'El jugador'} marcó en ${title}.` });
      }
    });
    history.matches = history.matches || [];
    history.matches.push({ id: `match-${Date.now()}`, type: 'inaugural', homeClubId: homeClub.id, awayClubId: awayClub.id, homeScore, awayScore, goals: goalLog, playedAt: new Date().toISOString() });
    history.inauguralMatchPlayed = true;
    history.updatedAt = new Date().toISOString();
    localStorage.setItem('lhdf.histories', JSON.stringify(histories));
  }

  function finishMatch() {
    if (!running) return;
    running = false;
    resolving = true;
    pauseButton.disabled = true;
    selected = null;
    renderField();
    saveResultOnce();
    const result = homeScore === awayScore ? 'Empate' : homeScore > awayScore ? `Victoria de ${homeClub.name}` : `Victoria de ${awayClub.name}`;
    eventEl.textContent = `90’ · FINAL · ${homeClub.name} ${homeScore}-${awayScore} ${awayClub.name}`;
    turnEyebrow.textContent = 'FINAL DEL PARTIDO';
    turnTitle.textContent = result;
    turnDescription.textContent = 'El primer encuentro ha terminado.';
    startButton.hidden = false;
    startButton.textContent = 'Repetir prueba';
  }

  function startMatch() {
    if (!prepareMatch()) return;
    running = true;
    resolving = false;
    pauseButton.disabled = false;
    startButton.hidden = true;
    setEvent(`${homeLineup.goalkeeper.name} inicia la primera jugada.`);
    beginHomeTurn();
  }

  function beginDrag(event) {
    if (!running || paused || resolving) return;
    const piece = event.target.closest('.board-piece[data-side="home"]');
    if (!piece) return;
    event.preventDefault();
    const side = 'home';
    const role = piece.dataset.role;
    selected = { side, role };
    const start = pieces[side][role];
    const current = pointerPercent(event);
    drag = { side, role, pointerId: event.pointerId, start, current };
    piece.setPointerCapture?.(event.pointerId);
    aimLine.setAttribute('x1', start.x); aimLine.setAttribute('y1', start.y);
    aimLine.setAttribute('x2', current.x); aimLine.setAttribute('y2', current.y);
    aimLine.classList.add('is-visible');
    renderField();
  }

  function updateDrag(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const current = pointerPercent(event);
    drag.current = current;
    aimLine.setAttribute('x2', current.x);
    aimLine.setAttribute('y2', current.y);
  }

  function endDrag(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const action = drag;
    drag = null;
    aimLine.classList.remove('is-visible');
    const moved = dist(action.start, action.current);
    if (moved < 2.5) {
      renderField();
      return;
    }
    executeHomeDrag(action.side, action.role, action.current);
  }

  fieldEl.addEventListener('pointerdown', beginDrag);
  fieldEl.addEventListener('pointermove', updateDrag);
  fieldEl.addEventListener('pointerup', endDrag);
  fieldEl.addEventListener('pointercancel', () => { drag = null; aimLine.classList.remove('is-visible'); });

  window.showInauguralMatch = function () {
    if (!prepareMatch()) {
      window.alert('Primero entra a tu club para preparar la plantilla y la alineación.');
      return;
    }
    transitionTo(stage);
  };

  function installLauncher() {
    const options = document.querySelector('.club-menu-options');
    if (!options) return;
    let button = document.getElementById('clubPlayMatchButton');
    if (!button) {
      button = document.createElement('button');
      button.id = 'clubPlayMatchButton';
      button.className = 'club-menu-option club-match-launch is-active';
      button.type = 'button';
      options.appendChild(button);
      button.addEventListener('click', (event) => { event.stopPropagation(); window.showInauguralMatch(); });
    }
    button.innerHTML = '<em>Jugable · prueba 4</em><strong>Partido inaugural</strong><span>Partido táctico por turnos con fichas que puedes mover y apuntar.</span>';
  }

  startButton.addEventListener('click', startMatch);
  document.getElementById('matchGameBack').addEventListener('click', () => {
    if (running && !window.confirm('¿Salir del partido actual? El progreso de esta prueba se perderá.')) return;
    running = false;
    window.showOwnedClubMenu?.();
  });
  pauseButton.addEventListener('click', () => {
    if (!running) return;
    paused = true;
    pauseOverlay.hidden = false;
  });
  document.getElementById('resumeMatchButton').addEventListener('click', () => {
    paused = false;
    pauseOverlay.hidden = true;
    if (!resolving) beginHomeTurn();
  });
  document.getElementById('pauseRulesButton').addEventListener('click', () => {
    const rules = document.getElementById('pauseRules');
    rules.hidden = !rules.hidden;
  });
  document.getElementById('abandonMatchButton').addEventListener('click', () => {
    if (!window.confirm('¿Abandonar este partido?')) return;
    running = false;
    paused = false;
    pauseOverlay.hidden = true;
    window.showOwnedClubMenu?.();
  });

  installLauncher();
  window.setTimeout(installLauncher, 900);
})();