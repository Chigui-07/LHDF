(() => {
  const shell = document.querySelector('.game-shell');
  if (!shell || document.getElementById('matchGameStage')) return;

  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = 'css/match-game.css?v=3.1.0';
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
        <div class="match-controls-help">WASD/Flechas · Shift correr · Espacio tiro · 1/2/3 cambio</div>
      </header>

      <div class="match-canvas-wrap">
        <canvas id="matchCanvas" width="960" height="540" aria-label="Cancha del partido"></canvas>
        <div id="matchMessage" class="match-message is-visible">Preparando partido...</div>
      </div>

      <footer class="match-benches">
        <div><small>TUS JUGADORES</small><div id="matchHomeBench" class="match-bench-list"></div></div>
        <button id="matchStartButton" class="match-start" type="button">Comenzar partido</button>
        <div class="match-away-bench"><small>RIVAL</small><div id="matchAwayBench" class="match-bench-list"></div></div>
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

  const keys = new Set();
  const MATCH_SECONDS = 180;
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
  let homeIndex = 0;
  let awayIndex = 0;
  let finished = false;

  const field = { x: 55, y: 45, w: 850, h: 450, goalH: 135 };
  const homeActor = { x: 260, y: 270, vx: 0, vy: 0, r: 23, angle: 0, stamina: 100 };
  const awayActor = { x: 700, y: 270, vx: 0, vy: 0, r: 23, angle: Math.PI, stamina: 100 };
  const ball = { x: 480, y: 270, vx: 0, vy: 0, r: 10, owner: null };

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

  function transitionTo(target) {
    if (typeof fade !== 'undefined') fade.classList.add('is-visible');
    window.setTimeout(() => {
      document.querySelectorAll('.screen.active').forEach((screen) => screen.classList.remove('active'));
      target.classList.add('active');
      if (typeof fade !== 'undefined') requestAnimationFrame(() => fade.classList.remove('is-visible'));
    }, typeof TRANSITION_TIME === 'number' ? TRANSITION_TIME : 480);
  }

  function actorColor(club, side) {
    const id = club?.id || '';
    const map = {
      municipal: '#d72d3a', comunicaciones: '#f4f4f4', 'antigua-gfc': '#2c8a56', 'xelaju-mc': '#164fc7',
      mixco: '#49a058', guastatoya: '#f2d43d', 'san-pedro': '#d92b35', suchitepequez: '#f3cf24',
      marquense: '#f2c425', aurora: '#1d74d7', malacateco: '#e33137', 'coban-imperial': '#1c75c9'
    };
    return map[id] || (side === 'home' ? '#40d99a' : '#e9eef0');
  }

  function resetKickoff(scoredBy = null) {
    homeActor.x = 260; homeActor.y = 270; homeActor.vx = homeActor.vy = 0; homeActor.angle = 0;
    awayActor.x = 700; awayActor.y = 270; awayActor.vx = awayActor.vy = 0; awayActor.angle = Math.PI;
    ball.x = 480; ball.y = 270; ball.vx = ball.vy = 0; ball.owner = null;
    if (scoredBy) showMessage(`¡Gol de ${scoredBy}!`, 1100);
  }

  function prepareMatch() {
    const { history } = loadHistory();
    if (!history?.clubStates?.[history.selectedClub] || !history?.clubStates?.[history.rivalClub]) return false;
    homeClub = clubInfo(history.selectedClub);
    awayClub = clubInfo(history.rivalClub);
    homePlayers = history.clubStates[history.selectedClub].players.map(playerInfo).filter(Boolean);
    awayPlayers = history.clubStates[history.rivalClub].players.map(playerInfo).filter(Boolean);
    if (!homeClub || !awayClub || homePlayers.length < 1 || awayPlayers.length < 1) return false;

    homeIndex = 0; awayIndex = 0; homeScore = 0; awayScore = 0; elapsed = 0; finished = false;
    homeActor.stamina = 100; awayActor.stamina = 100;
    homeCodeEl.textContent = codeFor(homeClub);
    awayCodeEl.textContent = codeFor(awayClub);
    homeScoreEl.textContent = '0'; awayScoreEl.textContent = '0'; clockEl.textContent = '03:00';
    renderBenches(); resetKickoff(); draw();
    messageEl.textContent = `${homeClub.name} vs ${awayClub.name}`;
    messageEl.classList.add('is-visible');
    startButton.hidden = false; startButton.textContent = 'Comenzar partido';
    return true;
  }

  function renderBenches() {
    homeBenchEl.innerHTML = homePlayers.map((p, i) => `<button type="button" data-home-change="${i}" class="match-player-chip ${i === homeIndex ? 'is-active' : ''}"><b>${i + 1}</b><span>${p.name}</span><small>${p.position}</small></button>`).join('');
    awayBenchEl.innerHTML = awayPlayers.map((p, i) => `<div class="match-player-chip ${i === awayIndex ? 'is-active' : ''}"><b>${i + 1}</b><span>${p.name}</span><small>${p.position}</small></div>`).join('');
  }

  function switchHome(index) {
    if (index < 0 || index >= homePlayers.length || index === homeIndex || finished) return;
    homeIndex = index;
    homeActor.stamina = Math.min(100, homeActor.stamina + 20);
    if (ball.owner === 'home') ball.owner = null;
    renderBenches();
    showMessage(`Entra ${homePlayers[homeIndex].name}`, 900);
  }

  function showMessage(text, ms = 800) {
    messageEl.textContent = text;
    messageEl.classList.add('is-visible');
    window.clearTimeout(showMessage.timer);
    showMessage.timer = window.setTimeout(() => messageEl.classList.remove('is-visible'), ms);
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

  function updateHome(dt) {
    let dx = 0, dy = 0;
    if (keys.has('arrowleft') || keys.has('a')) dx -= 1;
    if (keys.has('arrowright') || keys.has('d')) dx += 1;
    if (keys.has('arrowup') || keys.has('w')) dy -= 1;
    if (keys.has('arrowdown') || keys.has('s')) dy += 1;
    const sprinting = keys.has('shift') && homeActor.stamina > 0 && (dx || dy);
    const speed = sprinting ? 255 : 185;
    if (sprinting) homeActor.stamina = Math.max(0, homeActor.stamina - 24 * dt);
    else homeActor.stamina = Math.min(100, homeActor.stamina + 11 * dt);
    moveActor(homeActor, dx, dy, speed, dt);
  }

  function updateAI(dt) {
    const target = ball.owner === 'away' ? { x: field.x + 55, y: field.y + field.h / 2 } : ball;
    const dx = target.x - awayActor.x;
    const dy = target.y - awayActor.y;
    moveActor(awayActor, dx, dy, 150, dt);

    if (ball.owner === 'away') {
      const distanceToGoal = awayActor.x - field.x;
      if (distanceToGoal < 255 && Math.random() < 0.022) kick('away', 430);
    }
  }

  function kick(side, power = 470) {
    const actor = side === 'home' ? homeActor : awayActor;
    if (ball.owner !== side && Math.hypot(ball.x - actor.x, ball.y - actor.y) > actor.r + ball.r + 18) return;
    ball.owner = null;
    ball.x = actor.x + Math.cos(actor.angle) * (actor.r + ball.r + 3);
    ball.y = actor.y + Math.sin(actor.angle) * (actor.r + ball.r + 3);
    ball.vx = Math.cos(actor.angle) * power;
    ball.vy = Math.sin(actor.angle) * power;
  }

  function updateBall(dt) {
    if (ball.owner) {
      const actor = ball.owner === 'home' ? homeActor : awayActor;
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
      if (inGoalY) { awayScore++; awayScoreEl.textContent = String(awayScore); resetKickoff(awayClub.name); return; }
      ball.x = field.x + ball.r; ball.vx = Math.abs(ball.vx) * .75;
    }
    if (ball.x + ball.r >= field.x + field.w) {
      if (inGoalY) { homeScore++; homeScoreEl.textContent = String(homeScore); resetKickoff(homeClub.name); return; }
      ball.x = field.x + field.w - ball.r; ball.vx = -Math.abs(ball.vx) * .75;
    }
    if (ball.y - ball.r <= field.y) { ball.y = field.y + ball.r; ball.vy = Math.abs(ball.vy) * .75; }
    if (ball.y + ball.r >= field.y + field.h) { ball.y = field.y + field.h - ball.r; ball.vy = -Math.abs(ball.vy) * .75; }

    [['home', homeActor], ['away', awayActor]].forEach(([side, actor]) => {
      if (ball.owner) return;
      const d = Math.hypot(ball.x - actor.x, ball.y - actor.y);
      if (d < actor.r + ball.r + 9 && Math.hypot(ball.vx, ball.vy) < 270) ball.owner = side;
    });
  }

  function resolveActorCollision() {
    const dx = awayActor.x - homeActor.x, dy = awayActor.y - homeActor.y;
    const d = Math.hypot(dx, dy) || 1;
    const min = homeActor.r + awayActor.r;
    if (d < min) {
      const overlap = (min - d) / 2;
      const nx = dx / d, ny = dy / d;
      homeActor.x -= nx * overlap; homeActor.y -= ny * overlap;
      awayActor.x += nx * overlap; awayActor.y += ny * overlap;
      if (ball.owner && Math.random() < .07) ball.owner = null;
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
    ctx.strokeStyle = 'rgba(255,255,255,.78)'; ctx.lineWidth = 3;
    ctx.strokeRect(field.x, field.y, field.w, field.h);
    ctx.beginPath(); ctx.moveTo(field.x + field.w / 2, field.y); ctx.lineTo(field.x + field.w / 2, field.y + field.h); ctx.stroke();
    ctx.beginPath(); ctx.arc(field.x + field.w / 2, field.y + field.h / 2, 62, 0, Math.PI * 2); ctx.stroke();
    const gt = field.y + field.h / 2 - field.goalH / 2;
    ctx.strokeRect(field.x - 23, gt, 23, field.goalH); ctx.strokeRect(field.x + field.w, gt, 23, field.goalH);
  }

  function drawActor(actor, club, player, active) {
    const color = actorColor(club, active ? 'home' : 'away');
    if (active) {
      ctx.beginPath(); ctx.arc(actor.x, actor.y, actor.r + 8, 0, Math.PI * 2);
      ctx.strokeStyle = '#82ffca'; ctx.lineWidth = 3; ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(actor.x, actor.y, actor.r, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = 3; ctx.stroke();

    ctx.beginPath(); ctx.moveTo(actor.x, actor.y);
    ctx.lineTo(actor.x + Math.cos(actor.angle) * 34, actor.y + Math.sin(actor.angle) * 34);
    ctx.strokeStyle = active ? '#b8ffe0' : '#ffffff'; ctx.lineWidth = 4; ctx.stroke();

    ctx.font = '700 13px system-ui'; ctx.textAlign = 'center';
    ctx.fillStyle = '#fff'; ctx.fillText((player?.name || 'Jugador').split(' ')[0], actor.x, actor.y - 35);
  }

  function draw() {
    drawField();
    drawActor(homeActor, homeClub, homePlayers[homeIndex], true);
    drawActor(awayActor, awayClub, awayPlayers[awayIndex], false);
    ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.stroke();

    ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(70, 505, 190, 12);
    ctx.fillStyle = '#62e5af'; ctx.fillRect(70, 505, 190 * homeActor.stamina / 100, 12);
    ctx.fillStyle = '#fff'; ctx.font = '700 11px system-ui'; ctx.textAlign = 'left'; ctx.fillText('ENERGÍA', 70, 500);
  }

  function updateClock() {
    const remain = Math.max(0, MATCH_SECONDS - Math.floor(elapsed));
    const m = Math.floor(remain / 60); const s = remain % 60;
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
  }

  function loop(now) {
    if (!running) return;
    const dt = Math.min(.033, Math.max(.001, (now - lastTime) / 1000 || .016));
    lastTime = now; elapsed += dt;
    updateHome(dt); updateAI(dt); resolveActorCollision(); updateBall(dt); updateClock(); draw();
    if (running) animationId = requestAnimationFrame(loop);
  }

  function startMatch() {
    if (!prepareMatch()) return;
    elapsed = 0; running = true; finished = false; lastTime = performance.now();
    messageEl.classList.remove('is-visible'); startButton.hidden = true;
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
    button.innerHTML = '<em>Jugable</em><strong>Partido inaugural</strong><span>Controla a tu jugador en el primer 1 vs 1 de esta historia.</span>';
    button.addEventListener('click', (event) => { event.stopPropagation(); window.showInauguralMatch(); });
    options.appendChild(button);
  }

  homeBenchEl.addEventListener('click', (event) => {
    const button = event.target.closest('[data-home-change]');
    if (button) switchHome(Number(button.dataset.homeChange));
  });
  startButton.addEventListener('click', startMatch);
  document.getElementById('matchGameBack').addEventListener('click', () => {
    running = false; cancelAnimationFrame(animationId); window.showOwnedClubMenu?.();
  });

  window.addEventListener('keydown', (event) => {
    if (!stage.classList.contains('active')) return;
    const key = event.key.toLowerCase();
    if (['arrowup','arrowdown','arrowleft','arrowright',' ','shift'].includes(key) || ['w','a','s','d','1','2','3'].includes(key)) event.preventDefault();
    keys.add(key);
    if (key === ' ') kick('home');
    if (['1','2','3'].includes(key)) switchHome(Number(key) - 1);
  });
  window.addEventListener('keyup', (event) => keys.delete(event.key.toLowerCase()));

  installLauncher();
  window.setTimeout(installLauncher, 900);
})();
