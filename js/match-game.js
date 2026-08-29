(() => {
  const shell = document.querySelector('.game-shell');
  if (!shell || document.getElementById('matchGameStage')) return;

  const LOGO_BASE = 'assets/clubs/guatemala/';
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = 'css/match-game.css?v=3.1.2';
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
          <b id="matchClock">03:00</b>
          <div><span id="matchAwayScore">0</span><strong id="matchAwayCode">VIS</strong></div>
        </div>
        <div class="match-controls-help">WASD/Flechas · Shift correr · Espacio tirar · E robar · 1/2/3 cambiar</div>
      </header>

      <div class="match-canvas-wrap">
        <canvas id="matchCanvas" width="960" height="540" aria-label="Cancha del partido"></canvas>
        <div id="matchMessage" class="match-message is-visible">Preparando partido...</div>
        <div id="matchGoalOverlay" class="match-goal-overlay" aria-live="polite">
          <img id="matchGoalLogo" alt="Escudo del equipo goleador">
          <div><small>¡GOOOOOOL!</small><strong id="matchGoalPlayer">Jugador</strong><span id="matchGoalClub">Club</span></div>
        </div>
      </div>

      <footer class="match-benches">
        <div><small>TU EQUIPO · LOS 3 ESTÁN EN CANCHA</small><div id="matchHomeBench" class="match-bench-list"></div></div>
        <div class="match-center-actions">
          <button id="matchStealButton" class="match-action match-action-steal" type="button">ROBAR <kbd>E</kbd></button>
          <button id="matchStartButton" class="match-start" type="button">Comenzar partido</button>
          <button id="matchShootButton" class="match-action" type="button">TIRAR <kbd>ESPACIO</kbd></button>
        </div>
        <div class="match-away-bench"><small>RIVAL · 3 EN CANCHA</small><div id="matchAwayBench" class="match-bench-list"></div></div>
      </footer>
    </div>`;
  shell.appendChild(stage);

  const canvas = document.getElementById('matchCanvas');
  const ctx = canvas.getContext('2d');
  const homeScoreEl = document.getElementById('matchHomeScore');
  const awayScoreEl = document.getElementById('matchAwayScore');
  const homeCodeEl = document.getElementById('matchHomeCode');
  const awayCodeEl = document.getElementById('matchAwayCode');
  const clockEl = document.getElementById('matchClock');
  const messageEl = document.getElementById('matchMessage');
  const homeBenchEl = document.getElementById('matchHomeBench');
  const awayBenchEl = document.getElementById('matchAwayBench');
  const startButton = document.getElementById('matchStartButton');
  const stealButton = document.getElementById('matchStealButton');
  const shootButton = document.getElementById('matchShootButton');
  const goalOverlay = document.getElementById('matchGoalOverlay');
  const goalLogo = document.getElementById('matchGoalLogo');
  const goalPlayer = document.getElementById('matchGoalPlayer');
  const goalClub = document.getElementById('matchGoalClub');

  const keys = new Set();
  const MATCH_SECONDS = 180;
  const field = { x: 55, y: 45, w: 850, h: 450, goalH: 135 };
  const ball = { x: 480, y: 270, vx: 0, vy: 0, r: 10, owner: null, pickupLock: 0 };

  let running = false;
  let animationId = 0;
  let lastTime = 0;
  let elapsed = 0;
  let homeScore = 0;
  let awayScore = 0;
  let homeClub = null;
  let awayClub = null;
  let homePlayers = [];
  let awayPlayers = [];
  let homeActors = [];
  let awayActors = [];
  let controlledIndex = 0;
  let finished = false;
  let stealCooldown = 0;
  let lastTouch = null;
  let celebrationPause = 0;

  function loadHistory() {
    try {
      const histories = JSON.parse(localStorage.getItem('lhdf.histories') || '[]');
      const id = localStorage.getItem('lhdf.currentHistoryId');
      return { histories, history: histories.find((item) => item.id === id) || null };
    } catch (error) {
      return { histories: [], history: null };
    }
  }

  function clubInfo(id) { return window.LHDF_DATA?.clubs?.find((club) => club.id === id) || null; }
  function playerInfo(id) { return window.LHDF_DATA?.players?.find((player) => player.id === id) || null; }
  function codeFor(club) { return (club?.name || 'CLUB').replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, '').slice(0, 3).toUpperCase(); }
  function logoPath(file) { return `${LOGO_BASE}${encodeURIComponent(file || '').replace(/%2F/g, '/')}`; }

  function transitionTo(target) {
    if (typeof fade !== 'undefined') fade.classList.add('is-visible');
    window.setTimeout(() => {
      document.querySelectorAll('.screen.active').forEach((screen) => screen.classList.remove('active'));
      target.classList.add('active');
      if (typeof fade !== 'undefined') requestAnimationFrame(() => fade.classList.remove('is-visible'));
    }, typeof TRANSITION_TIME === 'number' ? TRANSITION_TIME : 480);
  }

  function actorColor(club, side) {
    const map = {
      municipal: '#d72d3a', comunicaciones: '#f4f4f4', 'antigua-gfc': '#2c8a56', 'xelaju-mc': '#164fc7',
      mixco: '#49a058', guastatoya: '#f2d43d', 'san-pedro': '#d92b35', suchitepequez: '#f3cf24',
      marquense: '#f2c425', aurora: '#1d74d7', malacateco: '#e33137', 'coban-imperial': '#1c75c9'
    };
    return map[club?.id] || (side === 'home' ? '#40d99a' : '#e9eef0');
  }

  function roleFor(player) {
    if (player?.position === 'Portero') return 'goalkeeper';
    if (player?.position === 'Defensa') return 'defender';
    if (player?.position === 'Mediocampista') return 'midfielder';
    return 'forward';
  }

  function makeActor(side, index, player) {
    return {
      side,
      index,
      role: roleFor(player),
      x: 0,
      y: 270,
      vx: 0,
      vy: 0,
      r: 20,
      angle: side === 'home' ? 0 : Math.PI,
      stamina: 100,
      stealFlash: 0
    };
  }

  function formationSpot(actor) {
    const home = actor.side === 'home';
    const slots = {
      goalkeeper: { x: home ? 120 : 840, y: 270 },
      defender: { x: home ? 260 : 700, y: actor.index % 2 ? 340 : 205 },
      midfielder: { x: home ? 340 : 620, y: actor.index % 2 ? 335 : 205 },
      forward: { x: home ? 420 : 540, y: actor.index % 2 ? 325 : 215 }
    };
    return slots[actor.role] || slots.midfielder;
  }

  function resetKickoff() {
    homeActors.forEach((actor) => {
      const p = formationSpot(actor);
      actor.x = p.x; actor.y = p.y; actor.vx = actor.vy = 0; actor.angle = 0; actor.stamina = 100;
    });
    awayActors.forEach((actor) => {
      const p = formationSpot(actor);
      actor.x = p.x; actor.y = p.y; actor.vx = actor.vy = 0; actor.angle = Math.PI; actor.stamina = 100;
    });
    ball.x = 480; ball.y = 270; ball.vx = 0; ball.vy = 0; ball.owner = null; ball.pickupLock = .35;
    lastTouch = null;
  }

  function prepareMatch() {
    const { history } = loadHistory();
    if (!history?.clubStates?.[history.selectedClub] || !history?.clubStates?.[history.rivalClub]) return false;

    homeClub = clubInfo(history.selectedClub);
    awayClub = clubInfo(history.rivalClub);
    homePlayers = history.clubStates[history.selectedClub].players.slice(0, 3).map(playerInfo).filter(Boolean);
    awayPlayers = history.clubStates[history.rivalClub].players.slice(0, 3).map(playerInfo).filter(Boolean);
    if (!homeClub || !awayClub || homePlayers.length < 3 || awayPlayers.length < 3) return false;

    homeActors = homePlayers.map((player, i) => makeActor('home', i, player));
    awayActors = awayPlayers.map((player, i) => makeActor('away', i, player));
    controlledIndex = Math.min(controlledIndex, 2);
    homeScore = 0; awayScore = 0; elapsed = 0; finished = false; stealCooldown = 0; celebrationPause = 0;

    homeCodeEl.textContent = codeFor(homeClub);
    awayCodeEl.textContent = codeFor(awayClub);
    homeScoreEl.textContent = '0'; awayScoreEl.textContent = '0'; clockEl.textContent = '03:00';
    resetKickoff(); renderPlayersPanel(); draw();
    messageEl.textContent = `${homeClub.name} vs ${awayClub.name}`;
    messageEl.classList.add('is-visible');
    goalOverlay.classList.remove('is-visible');
    startButton.hidden = false; startButton.textContent = 'Comenzar partido';
    syncActionButtons();
    return true;
  }

  function renderPlayersPanel() {
    homeBenchEl.innerHTML = homePlayers.map((p, i) => {
      const owns = ball.owner?.side === 'home' && ball.owner.index === i;
      return `<button type="button" data-home-change="${i}" class="match-player-chip ${i === controlledIndex ? 'is-active' : ''} ${owns ? 'has-ball' : ''}"><b>${i + 1}</b><span>${p.name}</span><small>${p.position}${owns ? ' · BALÓN' : ''}</small></button>`;
    }).join('');
    awayBenchEl.innerHTML = awayPlayers.map((p, i) => {
      const owns = ball.owner?.side === 'away' && ball.owner.index === i;
      return `<div class="match-player-chip ${owns ? 'has-ball is-rival-owner' : ''}"><b>${i + 1}</b><span>${p.name}</span><small>${p.position}${owns ? ' · BALÓN' : ''}</small></div>`;
    }).join('');
  }

  function switchHome(index) {
    if (index < 0 || index >= homePlayers.length || index === controlledIndex || finished) return;
    controlledIndex = index;
    renderPlayersPanel();
    showMessage(`Controlas a ${homePlayers[index].name}`, 650);
    syncActionButtons();
  }

  function showMessage(text, ms = 800) {
    messageEl.textContent = text;
    messageEl.classList.add('is-visible');
    window.clearTimeout(showMessage.timer);
    showMessage.timer = window.setTimeout(() => messageEl.classList.remove('is-visible'), ms);
  }

  function showGoal(side, scorerIndex) {
    const club = side === 'home' ? homeClub : awayClub;
    const players = side === 'home' ? homePlayers : awayPlayers;
    const scorer = players[scorerIndex] || null;
    goalLogo.src = logoPath(club?.logo);
    goalPlayer.textContent = scorer?.name || 'Gol';
    goalClub.textContent = club?.name || '';
    goalOverlay.classList.add('is-visible');
    window.clearTimeout(showGoal.timer);
    showGoal.timer = window.setTimeout(() => goalOverlay.classList.remove('is-visible'), 1900);
  }

  function moveActor(actor, dx, dy, speed, dt) {
    if (dx || dy) {
      const len = Math.hypot(dx, dy) || 1;
      dx /= len; dy /= len;
      actor.angle = Math.atan2(dy, dx);
      actor.x += dx * speed * dt;
      actor.y += dy * speed * dt;
    }
    actor.x = Math.max(field.x + actor.r, Math.min(field.x + field.w - actor.r, actor.x));
    actor.y = Math.max(field.y + actor.r, Math.min(field.y + field.h - actor.r, actor.y));
  }

  function updateControlled(dt) {
    const actor = homeActors[controlledIndex];
    if (!actor) return;
    let dx = 0, dy = 0;
    if (keys.has('arrowleft') || keys.has('a')) dx -= 1;
    if (keys.has('arrowright') || keys.has('d')) dx += 1;
    if (keys.has('arrowup') || keys.has('w')) dy -= 1;
    if (keys.has('arrowdown') || keys.has('s')) dy += 1;
    const sprinting = keys.has('shift') && actor.stamina > 0 && (dx || dy);
    const speed = sprinting ? 245 : 178;
    actor.stamina = sprinting ? Math.max(0, actor.stamina - 25 * dt) : Math.min(100, actor.stamina + 12 * dt);
    moveActor(actor, dx, dy, speed, dt);
  }

  function nearestActor(actors, point, filter = () => true) {
    let best = null, bestD = Infinity;
    actors.forEach((actor) => {
      if (!filter(actor)) return;
      const d = Math.hypot(actor.x - point.x, actor.y - point.y);
      if (d < bestD) { best = actor; bestD = d; }
    });
    return best;
  }

  function moveToward(actor, target, speed, dt) {
    moveActor(actor, target.x - actor.x, target.y - actor.y, speed, dt);
  }

  function updateHomeAI(dt) {
    const enemyHasBall = ball.owner?.side === 'away';
    const looseBall = !ball.owner;
    const chaser = enemyHasBall || looseBall
      ? nearestActor(homeActors, ball, (actor) => actor.index !== controlledIndex && actor.role !== 'goalkeeper')
      : null;

    homeActors.forEach((actor) => {
      if (actor.index === controlledIndex) return;
      actor.stamina = Math.min(100, actor.stamina + 10 * dt);

      if (ball.owner?.side === 'home' && ball.owner.index === actor.index) {
        const target = { x: field.x + field.w - 150, y: field.y + field.h / 2 };
        moveToward(actor, target, 132, dt);
        return;
      }

      if (actor === chaser) {
        moveToward(actor, ball, 142, dt);
        return;
      }

      const spot = formationSpot(actor);
      const shift = ball.x - (field.x + field.w / 2);
      spot.x += Math.max(-60, Math.min(95, shift * .18));
      moveToward(actor, spot, actor.role === 'goalkeeper' ? 105 : 118, dt);
    });
  }

  function updateAwayAI(dt) {
    const homeHasBall = ball.owner?.side === 'home';
    const looseBall = !ball.owner;
    const chaser = homeHasBall || looseBall
      ? nearestActor(awayActors, ball, (actor) => actor.role !== 'goalkeeper')
      : null;

    awayActors.forEach((actor) => {
      if (ball.owner?.side === 'away' && ball.owner.index === actor.index) {
        const target = { x: field.x + 100, y: field.y + field.h / 2 + Math.sin(elapsed * 1.7 + actor.index) * 75 };
        moveToward(actor, target, 158, dt);
        const distanceToGoal = actor.x - field.x;
        if (distanceToGoal < 245 && Math.random() < .036) kickActor(actor, 420);
        return;
      }

      if (actor === chaser) {
        moveToward(actor, ball, 157, dt);
        if (homeHasBall) trySteal(actor, false);
        return;
      }

      const spot = formationSpot(actor);
      const shift = ball.x - (field.x + field.w / 2);
      spot.x += Math.max(-95, Math.min(60, shift * .18));
      moveToward(actor, spot, actor.role === 'goalkeeper' ? 112 : 126, dt);
    });
  }

  function actorFromOwner(owner) {
    if (!owner) return null;
    return owner.side === 'home' ? homeActors[owner.index] : awayActors[owner.index];
  }

  function kickActor(actor, power = 465) {
    if (!actor || !ball.owner || ball.owner.side !== actor.side || ball.owner.index !== actor.index) return false;
    ball.owner = null;
    ball.pickupLock = .16;
    ball.x = actor.x + Math.cos(actor.angle) * (actor.r + ball.r + 4);
    ball.y = actor.y + Math.sin(actor.angle) * (actor.r + ball.r + 4);
    ball.vx = Math.cos(actor.angle) * power;
    ball.vy = Math.sin(actor.angle) * power;
    lastTouch = { side: actor.side, index: actor.index };
    renderPlayersPanel();
    syncActionButtons();
    return true;
  }

  function shootControlled() {
    if (!running || celebrationPause > 0) return;
    const actor = homeActors[controlledIndex];
    if (!ball.owner || ball.owner.side !== 'home' || ball.owner.index !== controlledIndex) {
      showMessage('Necesitas tener la pelota para tirar', 600);
      return;
    }
    kickActor(actor, 480);
  }

  function trySteal(actor, userAction = true) {
    if (!actor || !ball.owner || ball.owner.side === actor.side) return false;
    const ownerActor = actorFromOwner(ball.owner);
    if (!ownerActor) return false;
    const distance = Math.hypot(actor.x - ownerActor.x, actor.y - ownerActor.y);
    if (distance > actor.r + ownerActor.r + 25) {
      if (userAction) showMessage('Acércate más para robar', 500);
      return false;
    }

    const chance = userAction ? .72 : .022;
    if (Math.random() <= chance) {
      ball.owner = { side: actor.side, index: actor.index };
      lastTouch = { side: actor.side, index: actor.index };
      actor.stealFlash = .22;
      renderPlayersPanel();
      syncActionButtons();
      if (userAction) showMessage(`¡Robo de ${homePlayers[actor.index]?.name || 'tu jugador'}!`, 600);
      return true;
    }

    if (userAction) showMessage('No logró quitarle la pelota', 500);
    return false;
  }

  function stealControlled() {
    if (!running || celebrationPause > 0 || stealCooldown > 0) return;
    stealCooldown = .68;
    stealButton.classList.add('is-cooldown');
    trySteal(homeActors[controlledIndex], true);
  }

  function updateBall(dt) {
    ball.pickupLock = Math.max(0, ball.pickupLock - dt);
    if (ball.owner) {
      const actor = actorFromOwner(ball.owner);
      if (!actor) { ball.owner = null; return; }
      ball.x = actor.x + Math.cos(actor.angle) * (actor.r + ball.r + 5);
      ball.y = actor.y + Math.sin(actor.angle) * (actor.r + ball.r + 5);
      ball.vx = ball.vy = 0;
      return;
    }

    ball.x += ball.vx * dt; ball.y += ball.vy * dt;
    const drag = Math.pow(0.986, dt * 60);
    ball.vx *= drag; ball.vy *= drag;

    const goalTop = field.y + field.h / 2 - field.goalH / 2;
    const goalBottom = goalTop + field.goalH;
    const inGoalY = ball.y > goalTop && ball.y < goalBottom;

    if (ball.x - ball.r <= field.x) {
      if (inGoalY) { scoreGoal('away'); return; }
      ball.x = field.x + ball.r; ball.vx = Math.abs(ball.vx) * .72;
    }
    if (ball.x + ball.r >= field.x + field.w) {
      if (inGoalY) { scoreGoal('home'); return; }
      ball.x = field.x + field.w - ball.r; ball.vx = -Math.abs(ball.vx) * .72;
    }
    if (ball.y - ball.r <= field.y) { ball.y = field.y + ball.r; ball.vy = Math.abs(ball.vy) * .72; }
    if (ball.y + ball.r >= field.y + field.h) { ball.y = field.y + field.h - ball.r; ball.vy = -Math.abs(ball.vy) * .72; }

    if (ball.pickupLock <= 0 && Math.hypot(ball.vx, ball.vy) < 260) {
      const candidates = [...homeActors, ...awayActors]
        .map((actor) => ({ actor, d: Math.hypot(ball.x - actor.x, ball.y - actor.y) }))
        .filter((item) => item.d < item.actor.r + ball.r + 7)
        .sort((a, b) => a.d - b.d);
      if (candidates[0]) {
        const actor = candidates[0].actor;
        ball.owner = { side: actor.side, index: actor.index };
        lastTouch = { side: actor.side, index: actor.index };
        renderPlayersPanel();
        syncActionButtons();
      }
    }
  }

  function scoreGoal(side) {
    const scorerIndex = lastTouch?.side === side ? lastTouch.index : 0;
    if (side === 'home') {
      homeScore += 1; homeScoreEl.textContent = String(homeScore);
    } else {
      awayScore += 1; awayScoreEl.textContent = String(awayScore);
    }
    showGoal(side, scorerIndex);
    celebrationPause = 2.05;
    ball.owner = null; ball.vx = ball.vy = 0;
  }

  function resolveCollisions() {
    const all = [...homeActors, ...awayActors];
    for (let i = 0; i < all.length; i++) {
      for (let j = i + 1; j < all.length; j++) {
        const a = all[i], b = all[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 1;
        const min = a.r + b.r;
        if (d >= min) continue;
        const overlap = (min - d) / 2;
        const nx = dx / d, ny = dy / d;
        a.x -= nx * overlap; a.y -= ny * overlap;
        b.x += nx * overlap; b.y += ny * overlap;
      }
    }
  }

  function drawField() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#07140e'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#11633c'; ctx.fillRect(field.x, field.y, field.w, field.h);
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = i % 2 ? 'rgba(255,255,255,.022)' : 'rgba(0,0,0,.028)';
      ctx.fillRect(field.x + i * field.w / 10, field.y, field.w / 10, field.h);
    }
    ctx.strokeStyle = 'rgba(255,255,255,.82)'; ctx.lineWidth = 3;
    ctx.strokeRect(field.x, field.y, field.w, field.h);
    ctx.beginPath(); ctx.moveTo(field.x + field.w / 2, field.y); ctx.lineTo(field.x + field.w / 2, field.y + field.h); ctx.stroke();
    ctx.beginPath(); ctx.arc(field.x + field.w / 2, field.y + field.h / 2, 62, 0, Math.PI * 2); ctx.stroke();
    const gt = field.y + field.h / 2 - field.goalH / 2;
    ctx.strokeRect(field.x - 23, gt, 23, field.goalH); ctx.strokeRect(field.x + field.w, gt, 23, field.goalH);
  }

  function drawActor(actor, club, player, controlled) {
    const ownsBall = ball.owner?.side === actor.side && ball.owner.index === actor.index;
    if (controlled) {
      ctx.beginPath(); ctx.arc(actor.x, actor.y, actor.r + 9, 0, Math.PI * 2);
      ctx.strokeStyle = '#82ffca'; ctx.lineWidth = 3; ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(actor.x, actor.y - actor.r - 18); ctx.lineTo(actor.x - 7, actor.y - actor.r - 29); ctx.lineTo(actor.x + 7, actor.y - actor.r - 29); ctx.closePath();
      ctx.fillStyle = '#82ffca'; ctx.fill();
    }
    if (ownsBall) {
      ctx.beginPath(); ctx.arc(actor.x, actor.y, actor.r + 5, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffe36c'; ctx.lineWidth = 3; ctx.stroke();
    }
    if (actor.stealFlash > 0) {
      ctx.beginPath(); ctx.arc(actor.x, actor.y, actor.r + 13, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,255,255,${Math.min(1, actor.stealFlash * 4)})`; ctx.lineWidth = 4; ctx.stroke();
    }

    ctx.beginPath(); ctx.arc(actor.x, actor.y, actor.r, 0, Math.PI * 2);
    ctx.fillStyle = actorColor(club, actor.side); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.lineWidth = 3; ctx.stroke();

    ctx.beginPath(); ctx.moveTo(actor.x, actor.y);
    ctx.lineTo(actor.x + Math.cos(actor.angle) * 31, actor.y + Math.sin(actor.angle) * 31);
    ctx.strokeStyle = controlled ? '#b8ffe0' : 'rgba(255,255,255,.82)'; ctx.lineWidth = 4; ctx.stroke();

    ctx.font = '700 12px system-ui'; ctx.textAlign = 'center';
    ctx.fillStyle = '#fff'; ctx.fillText((player?.name || 'Jugador').split(' ')[0], actor.x, actor.y - 31);
    ctx.font = '800 9px system-ui'; ctx.fillStyle = 'rgba(255,255,255,.62)';
    ctx.fillText(player?.position?.toUpperCase() || '', actor.x, actor.y + 37);
  }

  function draw() {
    drawField();
    homeActors.forEach((actor, i) => drawActor(actor, homeClub, homePlayers[i], i === controlledIndex));
    awayActors.forEach((actor, i) => drawActor(actor, awayClub, awayPlayers[i], false));

    ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.stroke();

    const active = homeActors[controlledIndex];
    ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(70, 505, 190, 12);
    ctx.fillStyle = '#62e5af'; ctx.fillRect(70, 505, 190 * (active?.stamina || 0) / 100, 12);
    ctx.fillStyle = '#fff'; ctx.font = '700 11px system-ui'; ctx.textAlign = 'left';
    ctx.fillText(`ENERGÍA · ${homePlayers[controlledIndex]?.name || ''}`, 70, 500);

    const possession = ball.owner ? (ball.owner.side === 'home' ? 'TU EQUIPO' : 'RIVAL') : 'BALÓN SUELTO';
    ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(255,255,255,.72)';
    ctx.fillText(possession, 890, 514);
  }

  function syncActionButtons() {
    const canShoot = running && ball.owner?.side === 'home' && ball.owner.index === controlledIndex;
    shootButton.classList.toggle('is-ready', !!canShoot);
    shootButton.disabled = !running;
    stealButton.disabled = !running;
  }

  function updateClock() {
    const remain = Math.max(0, MATCH_SECONDS - Math.floor(elapsed));
    const m = Math.floor(remain / 60), s = remain % 60;
    clockEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    if (remain <= 0) finishMatch();
  }

  function finishMatch() {
    if (finished) return;
    finished = true; running = false;
    cancelAnimationFrame(animationId);
    const result = homeScore === awayScore ? 'Empate' : homeScore > awayScore ? `Victoria de ${homeClub.name}` : `Victoria de ${awayClub.name}`;
    showMessage(`Final · ${result} · ${homeScore}-${awayScore}`, 5000);
    startButton.hidden = false; startButton.textContent = 'Jugar otra prueba';
    syncActionButtons();
  }

  function loop(now) {
    if (!running) return;
    const dt = Math.min(.033, Math.max(.001, (now - lastTime) / 1000 || .016));
    lastTime = now;
    stealCooldown = Math.max(0, stealCooldown - dt);
    if (stealCooldown <= 0) stealButton.classList.remove('is-cooldown');
    [...homeActors, ...awayActors].forEach((actor) => actor.stealFlash = Math.max(0, actor.stealFlash - dt));

    if (celebrationPause > 0) {
      celebrationPause = Math.max(0, celebrationPause - dt);
      if (celebrationPause <= 0) resetKickoff();
      draw();
      animationId = requestAnimationFrame(loop);
      return;
    }

    elapsed += dt;
    updateControlled(dt);
    updateHomeAI(dt);
    updateAwayAI(dt);
    resolveCollisions();
    updateBall(dt);
    updateClock();
    draw();
    if (running) animationId = requestAnimationFrame(loop);
  }

  function startMatch() {
    if (!prepareMatch()) return;
    elapsed = 0; running = true; finished = false; lastTime = performance.now();
    messageEl.classList.remove('is-visible'); startButton.hidden = true;
    syncActionButtons();
    cancelAnimationFrame(animationId); animationId = requestAnimationFrame(loop);
  }

  window.showInauguralMatch = function () {
    if (!prepareMatch()) {
      window.alert('Primero entra a tu club para recibir las plantillas iniciales.');
      return;
    }
    transitionTo(stage);
  };

  function installLauncher() {
    const options = document.querySelector('.club-menu-options');
    if (!options || document.getElementById('clubPlayMatchButton')) return;
    const button = document.createElement('button');
    button.id = 'clubPlayMatchButton'; button.className = 'club-menu-option club-match-launch is-active'; button.type = 'button';
    button.innerHTML = '<em>Jugable · prueba 2</em><strong>Partido inaugural</strong><span>3 contra 3: cambia de jugador, roba el balón y busca el gol.</span>';
    button.addEventListener('click', (event) => { event.stopPropagation(); window.showInauguralMatch(); });
    options.appendChild(button);
  }

  homeBenchEl.addEventListener('click', (event) => {
    const button = event.target.closest('[data-home-change]');
    if (button) switchHome(Number(button.dataset.homeChange));
  });
  startButton.addEventListener('click', startMatch);
  stealButton.addEventListener('click', stealControlled);
  shootButton.addEventListener('click', shootControlled);
  document.getElementById('matchGameBack').addEventListener('click', () => {
    running = false; cancelAnimationFrame(animationId); window.showOwnedClubMenu?.();
  });

  window.addEventListener('keydown', (event) => {
    if (!stage.classList.contains('active')) return;
    const key = event.key.toLowerCase();
    if (['arrowup','arrowdown','arrowleft','arrowright',' ','shift'].includes(key) || ['w','a','s','d','e','1','2','3'].includes(key)) event.preventDefault();
    keys.add(key);
    if (event.repeat && [' ','e','1','2','3'].includes(key)) return;
    if (key === ' ') shootControlled();
    if (key === 'e') stealControlled();
    if (['1','2','3'].includes(key)) switchHome(Number(key) - 1);
  });
  window.addEventListener('keyup', (event) => keys.delete(event.key.toLowerCase()));

  installLauncher();
  window.setTimeout(installLauncher, 900);
})();