(() => {
  const shell = document.querySelector('.game-shell');
  if (!shell || document.getElementById('playerDetailStage')) return;

  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = 'css/player-detail.css?v=3.1.0';
  document.head.appendChild(style);

  const stage = document.createElement('section');
  stage.id = 'playerDetailStage';
  stage.className = 'screen secondary-screen player-detail-scene';
  stage.innerHTML = `
    <div class="player-detail-shell">
      <header class="player-detail-header">
        <div>
          <p class="eyebrow">FICHA DEL JUGADOR</p>
          <h2 id="playerDetailName">Jugador</h2>
          <p>Su historia deportiva se construirá dentro de esta partida.</p>
        </div>
        <button id="playerDetailBackButton" class="player-detail-back" type="button">← Volver a Jugadores</button>
      </header>

      <section class="player-detail-main">
        <article class="player-detail-identity">
          <div class="player-detail-country">
            <img id="playerDetailFlag" class="player-detail-flag" alt="Bandera del país">
            <div>
              <small>País</small>
              <strong id="playerDetailCountry">—</strong>
            </div>
          </div>

          <div class="player-detail-info-grid">
            <div><small>Posición</small><strong id="playerDetailPosition">—</strong></div>
            <div><small>Club en esta historia</small><strong id="playerDetailClub">Sin club</strong></div>
            <div><small>Estado</small><strong id="playerDetailStatus">Disponible</strong></div>
          </div>
        </article>

        <article class="player-detail-stats-card">
          <div class="player-detail-section-title">
            <small>ESTADÍSTICAS EN LHDF</small>
            <span>Esta partida</span>
          </div>
          <div class="player-detail-stats">
            <div><strong id="playerStatMatches">0</strong><span>Partidos</span></div>
            <div><strong id="playerStatGoals">0</strong><span>Goles</span></div>
            <div><strong id="playerStatAssists">0</strong><span>Asistencias</span></div>
            <div><strong id="playerStatYellow">0</strong><span>Amarillas</span></div>
            <div><strong id="playerStatRed">0</strong><span>Rojas</span></div>
            <div><strong id="playerStatTitles">0</strong><span>Títulos</span></div>
          </div>
        </article>
      </section>

      <section class="player-detail-history-card">
        <div class="player-detail-section-title">
          <small>HISTORIA DEL JUGADOR</small>
          <span id="playerHistoryCount">0 momentos</span>
        </div>
        <div id="playerDetailHistory" class="player-detail-history">
          <div class="player-detail-history-empty">
            <strong>Su historia todavía no ha comenzado.</strong>
            <span>Debut, fichajes, goles importantes y títulos aparecerán aquí conforme avance la partida.</span>
          </div>
        </div>
      </section>
    </div>`;
  shell.appendChild(stage);

  const els = {
    name: document.getElementById('playerDetailName'),
    flag: document.getElementById('playerDetailFlag'),
    country: document.getElementById('playerDetailCountry'),
    position: document.getElementById('playerDetailPosition'),
    club: document.getElementById('playerDetailClub'),
    status: document.getElementById('playerDetailStatus'),
    matches: document.getElementById('playerStatMatches'),
    goals: document.getElementById('playerStatGoals'),
    assists: document.getElementById('playerStatAssists'),
    yellow: document.getElementById('playerStatYellow'),
    red: document.getElementById('playerStatRed'),
    titles: document.getElementById('playerStatTitles'),
    history: document.getElementById('playerDetailHistory'),
    historyCount: document.getElementById('playerHistoryCount')
  };

  let currentPlayerId = null;

  function getHistoryState() {
    try {
      const histories = JSON.parse(localStorage.getItem('lhdf.histories') || '[]');
      const id = localStorage.getItem('lhdf.currentHistoryId');
      const history = histories.find((item) => item.id === id) || null;
      return history;
    } catch (error) {
      return null;
    }
  }

  function getPlayerState(playerId) {
    const history = getHistoryState();
    const stored = history?.playerStates?.[playerId] || {};
    return {
      clubId: stored.clubId ?? null,
      status: stored.status || 'Disponible',
      stats: {
        matches: stored.stats?.matches || 0,
        goals: stored.stats?.goals || 0,
        assists: stored.stats?.assists || 0,
        yellowCards: stored.stats?.yellowCards || 0,
        redCards: stored.stats?.redCards || 0,
        titles: stored.stats?.titles || 0
      },
      history: Array.isArray(stored.history) ? stored.history : []
    };
  }

  function transitionToDetail() {
    if (typeof fade !== 'undefined') fade.classList.add('is-visible');
    window.setTimeout(() => {
      document.querySelectorAll('.screen.active').forEach((screen) => screen.classList.remove('active'));
      stage.classList.add('active');
      if (typeof fade !== 'undefined') requestAnimationFrame(() => fade.classList.remove('is-visible'));
    }, typeof TRANSITION_TIME === 'number' ? TRANSITION_TIME : 480);
  }

  function renderPlayer(playerId) {
    const data = window.LHDF_DATA || { players: [], countries: [], clubs: [] };
    const player = data.players.find((item) => item.id === playerId);
    if (!player) return false;

    const country = data.countries.find((item) => item.id === player.countryId) || { name: player.countryId, flag: '' };
    const state = getPlayerState(playerId);
    const club = state.clubId ? data.clubs.find((item) => item.id === state.clubId) : null;

    els.name.textContent = player.name;
    els.country.textContent = country.name || '—';
    els.position.textContent = player.position || 'Por definir';
    els.club.textContent = club?.name || 'Sin club en esta historia';
    els.status.textContent = state.status;

    if (country.flag) {
      els.flag.src = country.flag;
      els.flag.alt = `Bandera de ${country.name}`;
      els.flag.hidden = false;
    } else {
      els.flag.removeAttribute('src');
      els.flag.hidden = true;
    }

    els.matches.textContent = String(state.stats.matches);
    els.goals.textContent = String(state.stats.goals);
    els.assists.textContent = String(state.stats.assists);
    els.yellow.textContent = String(state.stats.yellowCards);
    els.red.textContent = String(state.stats.redCards);
    els.titles.textContent = String(state.stats.titles);

    els.historyCount.textContent = `${state.history.length} ${state.history.length === 1 ? 'momento' : 'momentos'}`;
    if (!state.history.length) {
      els.history.innerHTML = `
        <div class="player-detail-history-empty">
          <strong>Su historia todavía no ha comenzado.</strong>
          <span>Debut, fichajes, goles importantes y títulos aparecerán aquí conforme avance la partida.</span>
        </div>`;
    } else {
      els.history.innerHTML = state.history.map((entry) => `
        <article class="player-history-entry">
          <small>${entry.date || 'Fecha por definir'}</small>
          <strong>${entry.title || 'Momento de la historia'}</strong>
          <span>${entry.description || ''}</span>
        </article>`).join('');
    }

    currentPlayerId = playerId;
    return true;
  }

  window.showPlayerDetail = function (playerId) {
    if (!renderPlayer(playerId)) return;
    transitionToDetail();
  };

  document.getElementById('playerDetailBackButton').addEventListener('click', () => {
    const player = window.LHDF_DATA?.players?.find((item) => item.id === currentPlayerId);
    window.showPlayers?.(player?.countryId || 'guatemala');
  });
})();
