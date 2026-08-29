(() => {
  const LOGO_BASE = 'assets/clubs/guatemala/';
  const CLUBS = {
    municipal: { name: 'Municipal', logo: 'CSD Municipal.png' },
    comunicaciones: { name: 'Comunicaciones', logo: 'Comunicaciones FC.png' },
    'antigua-gfc': { name: 'Antigua GFC', logo: 'Antigua GFC.png' },
    'xelaju-mc': { name: 'Xelajú MC', logo: 'Xelaju FC.png' },
    mixco: { name: 'Deportivo Mixco', logo: 'Mixco FC.png' },
    guastatoya: { name: 'Guastatoya', logo: 'Guastatoya FC.png' },
    'san-pedro': { name: 'San Pedro', logo: 'San Pedro FC.png' },
    suchitepequez: { name: 'Suchitepéquez', logo: 'Suchitepequez FC.png' },
    marquense: { name: 'Marquense', logo: 'Marquense FC.png' },
    aurora: { name: 'Aurora FC', logo: 'Aurora FC.png' },
    malacateco: { name: 'Malacateco', logo: 'Malacateco FC.png' },
    'coban-imperial': { name: 'Cobán Imperial', logo: 'Coban Imperial FC.png' }
  };

  const shell = document.querySelector('.game-shell');
  if (!shell || document.getElementById('hubStage')) return;

  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = 'css/hub.css?v=3.1.1';
  document.head.appendChild(style);

  const stage = document.createElement('section');
  stage.id = 'hubStage';
  stage.className = 'screen secondary-screen hub-scene';
  stage.innerHTML = `
    <div class="hub-shell">
      <header class="hub-topbar">
        <div class="hub-heading">
          <p class="eyebrow">CENTRO DE LA HISTORIA</p>
          <h2 id="hubFoundationTitle">Tu Fundación</h2>
          <p>Desde aquí construirás el futuro del fútbol.</p>
        </div>
        <div class="hub-version">Alpha 3.1</div>
      </header>

      <section class="hub-identity">
        <article class="hub-foundation-card">
          <small>Fundación activa</small>
          <h3 id="hubFoundationName">Tu Fundación</h3>
          <div class="hub-meta">
            <span>Fundador: <strong id="hubFounderName">—</strong></span>
            <span>País: <strong id="hubCountry">Guatemala</strong></span>
          </div>
        </article>

        <article class="hub-rivalry-card hub-upcoming-card">
          <div class="hub-match-heading">
            <small>Próximo partido</small>
            <span id="hubMatchDate" class="hub-match-date">Fecha por definir</span>
          </div>
          <div class="hub-rivalry-row">
            <div class="hub-club-mini">
              <div class="hub-club-logo-wrap"><img id="hubClubLogo" class="hub-club-logo" alt="Escudo del club elegido"></div>
              <strong id="hubClubName">Club</strong>
            </div>
            <div class="hub-vs">VS</div>
            <div class="hub-club-mini">
              <div class="hub-club-logo-wrap"><img id="hubRivalLogo" class="hub-club-logo" alt="Escudo del rival"></div>
              <strong id="hubRivalName">Rival</strong>
            </div>
          </div>
          <div id="hubMatchType" class="hub-match-type">Clásico inaugural</div>
        </article>
      </section>

      <section class="hub-modules" aria-label="Secciones del juego">
        <button class="hub-module" type="button"><em>Próximamente</em><strong>Clubes</strong><span>Gestiona y descubre clubes.</span></button>
        <button class="hub-module" type="button"><em>Próximamente</em><strong>Jugadores</strong><span>Plantillas y desarrollo.</span></button>
        <button class="hub-module" type="button"><em>En preparación</em><strong>Partidos</strong><span>Calendario, próximos encuentros y resultados.</span></button>
        <button class="hub-module" type="button"><em>Próximamente</em><strong>Torneos</strong><span>Crea competiciones y campeones.</span></button>
        <button class="hub-module" type="button"><em>Próximamente</em><strong>Fundación</strong><span>Expande tu organización.</span></button>
      </section>

      <footer class="hub-footer">
        <div id="hubSaveStatus" class="hub-save-status" aria-live="polite"></div>
        <div class="hub-actions">
          <button id="hubSaveButton" class="hub-action" type="button">Guardar partida</button>
          <button id="hubSettingsButton" class="hub-action" type="button">Configuraciones</button>
          <button id="hubExitButton" class="hub-action save-exit" type="button">Guardar y salir</button>
        </div>
      </footer>
    </div>`;

  shell.appendChild(stage);

  const els = {
    title: document.getElementById('hubFoundationTitle'),
    foundation: document.getElementById('hubFoundationName'),
    founder: document.getElementById('hubFounderName'),
    country: document.getElementById('hubCountry'),
    clubName: document.getElementById('hubClubName'),
    clubLogo: document.getElementById('hubClubLogo'),
    rivalName: document.getElementById('hubRivalName'),
    rivalLogo: document.getElementById('hubRivalLogo'),
    matchDate: document.getElementById('hubMatchDate'),
    matchType: document.getElementById('hubMatchType'),
    status: document.getElementById('hubSaveStatus')
  };

  function imgPath(file) {
    return `${LOGO_BASE}${encodeURIComponent(file).replaceAll('%2F', '/')}`;
  }

  function loadHistoryState() {
    try {
      const histories = JSON.parse(localStorage.getItem('lhdf.histories') || '[]');
      const id = localStorage.getItem('lhdf.currentHistoryId');
      const history = histories.find((item) => item.id === id) || null;
      return { histories, history };
    } catch (error) {
      return { histories: [], history: null };
    }
  }

  function ensureInitialMatch() {
    const { histories, history } = loadHistoryState();
    if (!history) return null;

    if (!Array.isArray(history.matches)) history.matches = [];

    if (history.matches.length === 0 && history.selectedClub && history.rivalClub) {
      const createdAt = new Date().toISOString();
      history.matches.push({
        id: `lhdf-match-${Date.now()}`,
        homeClub: history.selectedClub,
        awayClub: history.rivalClub,
        competition: 'Clásico inaugural',
        status: 'scheduled',
        scheduledAt: null,
        createdAt
      });
      history.updatedAt = createdAt;
      localStorage.setItem('lhdf.histories', JSON.stringify(histories));
    }

    return history.matches.find((match) => match.status === 'scheduled') || null;
  }

  function saveCurrentHistory(message = 'Partida guardada.') {
    try {
      const { histories, history } = loadHistoryState();
      if (!history) return false;

      history.updatedAt = new Date().toISOString();
      history.version = 'Alpha 3.1';
      localStorage.setItem('lhdf.histories', JSON.stringify(histories));
      if (typeof renderSavedHistories === 'function') renderSavedHistories();
      if (els.status) {
        const time = new Intl.DateTimeFormat('es-GT', { hour: '2-digit', minute: '2-digit' }).format(new Date());
        els.status.textContent = `${message} ${time}`;
      }
      return true;
    } catch (error) {
      console.error('No se pudo guardar la partida:', error);
      if (els.status) els.status.textContent = 'No se pudo guardar la partida.';
      return false;
    }
  }

  function formatMatchDate(value) {
    if (!value) return 'Fecha por definir';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Fecha por definir';
    return new Intl.DateTimeFormat('es-GT', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
  }

  function renderHub() {
    const { history } = loadHistoryState();
    if (!history) return false;

    const nextMatch = ensureInitialMatch();
    const homeId = nextMatch?.homeClub || history.selectedClub;
    const awayId = nextMatch?.awayClub || history.rivalClub;
    const club = CLUBS[homeId] || { name: 'Club elegido', logo: '' };
    const rival = CLUBS[awayId] || { name: 'Rival', logo: '' };

    els.title.textContent = history.foundationName || 'Tu Fundación';
    els.foundation.textContent = history.foundationName || 'Tu Fundación';
    els.founder.textContent = history.founderName || '—';
    els.country.textContent = history.country || 'Guatemala';
    els.clubName.textContent = club.name;
    els.rivalName.textContent = rival.name;
    els.matchDate.textContent = formatMatchDate(nextMatch?.scheduledAt);
    els.matchType.textContent = nextMatch?.competition || 'Sin partidos programados';

    if (club.logo) els.clubLogo.src = imgPath(club.logo);
    if (rival.logo) els.rivalLogo.src = imgPath(rival.logo);
    els.status.textContent = '';
    return true;
  }

  window.showHub = function () {
    if (!renderHub()) return;
    fade.classList.add('is-visible');
    window.setTimeout(() => {
      document.querySelectorAll('.screen.active').forEach((screen) => screen.classList.remove('active'));
      stage.classList.add('active');
      requestAnimationFrame(() => fade.classList.remove('is-visible'));
    }, typeof TRANSITION_TIME === 'number' ? TRANSITION_TIME : 480);
  };

  document.getElementById('hubSaveButton').addEventListener('click', () => {
    saveCurrentHistory('Partida guardada a las');
  });

  document.getElementById('hubSettingsButton').addEventListener('click', () => {
    sessionStorage.setItem('lhdf.settingsReturn', 'hub');
    stage.classList.remove('active');
    showScreen('settings');
  });

  document.getElementById('hubExitButton').addEventListener('click', () => {
    if (!saveCurrentHistory('Guardado antes de salir a las')) return;
    window.setTimeout(() => {
      sessionStorage.removeItem('lhdf.settingsReturn');
      stage.classList.remove('active');
      showScreen('mainMenu');
    }, 250);
  });
})();