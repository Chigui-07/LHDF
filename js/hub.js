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
  style.href = 'css/hub.css?v=3.1.0';
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

        <article class="hub-rivalry-card">
          <small>Primer clásico de esta historia</small>
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
        </article>
      </section>

      <section class="hub-modules" aria-label="Secciones del juego">
        <button class="hub-module" type="button"><em>Próximamente</em><strong>Clubes</strong><span>Gestiona y descubre clubes.</span></button>
        <button class="hub-module" type="button"><em>Próximamente</em><strong>Jugadores</strong><span>Plantillas y desarrollo.</span></button>
        <button class="hub-module" type="button"><em>Próximamente</em><strong>Partidos</strong><span>Organiza y disputa encuentros.</span></button>
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
    status: document.getElementById('hubSaveStatus')
  };

  function imgPath(file) {
    return `${LOGO_BASE}${encodeURIComponent(file).replaceAll('%2F', '/')}`;
  }

  function getHistory() {
    try {
      const histories = JSON.parse(localStorage.getItem('lhdf.histories') || '[]');
      const id = localStorage.getItem('lhdf.currentHistoryId');
      return histories.find((item) => item.id === id) || null;
    } catch (error) {
      return null;
    }
  }

  function saveCurrentHistory(message = 'Partida guardada.') {
    try {
      const histories = JSON.parse(localStorage.getItem('lhdf.histories') || '[]');
      const id = localStorage.getItem('lhdf.currentHistoryId');
      const history = histories.find((item) => item.id === id);
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

  function renderHub() {
    const history = getHistory();
    if (!history) return false;

    const club = CLUBS[history.selectedClub] || { name: 'Club elegido', logo: '' };
    const rival = CLUBS[history.rivalClub] || { name: 'Rival', logo: '' };

    els.title.textContent = history.foundationName || 'Tu Fundación';
    els.foundation.textContent = history.foundationName || 'Tu Fundación';
    els.founder.textContent = history.founderName || '—';
    els.country.textContent = history.country || 'Guatemala';
    els.clubName.textContent = club.name;
    els.rivalName.textContent = rival.name;

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
    stage.classList.remove('active');
    showScreen('settings');
  });

  document.getElementById('hubExitButton').addEventListener('click', () => {
    if (!saveCurrentHistory('Guardado antes de salir a las')) return;
    window.setTimeout(() => {
      stage.classList.remove('active');
      showScreen('mainMenu');
    }, 250);
  });
})();
