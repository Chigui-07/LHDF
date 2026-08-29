(() => {
  const LOGO_BASE = 'assets/clubs/guatemala/';
  const CLUBS = [
    { id: 'municipal', name: 'Municipal', logo: 'CSD Municipal.png' },
    { id: 'comunicaciones', name: 'Comunicaciones', logo: 'Comunicaciones FC.png' },
    { id: 'antigua-gfc', name: 'Antigua GFC', logo: 'Antigua GFC.png' },
    { id: 'xelaju-mc', name: 'Xelajú MC', logo: 'Xelaju FC.png' },
    { id: 'mixco', name: 'Deportivo Mixco', logo: 'Mixco FC.png' },
    { id: 'guastatoya', name: 'Guastatoya', logo: 'Guastatoya FC.png' },
    { id: 'san-pedro', name: 'San Pedro', logo: 'San Pedro FC.png' },
    { id: 'suchitepequez', name: 'Suchitepéquez', logo: 'Suchitepequez FC.png' },
    { id: 'marquense', name: 'Marquense', logo: 'Marquense FC.png' },
    { id: 'aurora', name: 'Aurora FC', logo: 'Aurora FC.png' },
    { id: 'malacateco', name: 'Malacateco', logo: 'Malacateco FC.png' },
    { id: 'coban-imperial', name: 'Cobán Imperial', logo: 'Coban Imperial FC.png' }
  ];

  const shell = document.querySelector('.game-shell');
  if (!shell || document.getElementById('clubsStage')) return;

  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = 'css/clubs.css?v=3.1.0';
  document.head.appendChild(style);

  const clubsStage = document.createElement('section');
  clubsStage.id = 'clubsStage';
  clubsStage.className = 'screen secondary-screen clubs-scene';
  clubsStage.innerHTML = `
    <div class="clubs-shell">
      <header class="clubs-header">
        <div>
          <p class="eyebrow">CLUBES DE GUATEMALA</p>
          <h2>Clubes</h2>
          <p>Solo los clubes descubiertos en tu historia estarán disponibles.</p>
        </div>
        <button id="clubsBackButton" class="clubs-back" type="button">← Volver al Hub</button>
      </header>
      <div id="clubsGrid" class="clubs-grid"></div>
      <div class="clubs-footer-note">Los clubes desconocidos se revelarán conforme avance tu historia.</div>
    </div>`;

  const clubMenuStage = document.createElement('section');
  clubMenuStage.id = 'clubMenuStage';
  clubMenuStage.className = 'screen secondary-screen club-menu-scene';
  clubMenuStage.innerHTML = `
    <div class="club-menu-shell">
      <header class="club-menu-header">
        <div class="club-menu-identity">
          <div class="club-menu-logo-wrap"><img id="clubMenuLogo" class="club-menu-logo" alt="Escudo de tu club"></div>
          <div class="club-menu-copy">
            <p class="eyebrow">MI CLUB</p>
            <h2 id="clubMenuName">Tu club</h2>
            <p>Este será el centro de gestión de tu club.</p>
          </div>
        </div>
        <button id="clubMenuBackButton" class="club-menu-back" type="button">← Volver a Clubes</button>
      </header>

      <section class="club-menu-options" aria-label="Opciones del club">
        <button class="club-menu-option" type="button"><em>Próximamente</em><strong>Plantilla</strong><span>Jugadores y posiciones del club.</span></button>
        <button class="club-menu-option" type="button"><em>Próximamente</em><strong>Estadísticas</strong><span>Partidos, goles y rendimiento.</span></button>
        <button class="club-menu-option" type="button"><em>Próximamente</em><strong>Historia</strong><span>Momentos creados en esta partida.</span></button>
        <button class="club-menu-option" type="button"><em>Próximamente</em><strong>Gestión</strong><span>Herramientas y decisiones del club.</span></button>
      </section>

      <footer class="club-menu-footer">Menú base del club — Alpha 3.1</footer>
    </div>`;

  shell.appendChild(clubsStage);
  shell.appendChild(clubMenuStage);

  const grid = document.getElementById('clubsGrid');
  const clubMenuLogo = document.getElementById('clubMenuLogo');
  const clubMenuName = document.getElementById('clubMenuName');

  function imageSrc(file) {
    return `${LOGO_BASE}${encodeURIComponent(file).replaceAll('%2F', '/')}`;
  }

  function getHistory() {
    try {
      const histories = JSON.parse(localStorage.getItem('lhdf.histories') || '[]');
      const id = localStorage.getItem('lhdf.currentHistoryId');
      return histories.find((history) => history.id === id) || null;
    } catch (error) {
      return null;
    }
  }

  function transitionTo(stage) {
    if (typeof fade !== 'undefined') fade.classList.add('is-visible');
    window.setTimeout(() => {
      document.querySelectorAll('.screen.active').forEach((screen) => screen.classList.remove('active'));
      stage.classList.add('active');
      if (typeof fade !== 'undefined') requestAnimationFrame(() => fade.classList.remove('is-visible'));
    }, typeof TRANSITION_TIME === 'number' ? TRANSITION_TIME : 480);
  }

  function renderClubs() {
    const history = getHistory();
    if (!history) return false;
    const ownedId = history.selectedClub;

    grid.innerHTML = CLUBS.map((club) => {
      if (club.id === ownedId) {
        return `
          <button class="club-discovery-card is-owned" type="button" data-owned-club="${club.id}">
            <div class="club-discovery-logo-wrap"><img class="club-discovery-logo" src="${imageSrc(club.logo)}" alt="Escudo de ${club.name}"></div>
            <strong>${club.name}</strong>
            <small>Tu club</small>
          </button>`;
      }

      return `
        <article class="club-discovery-card is-hidden" aria-label="Club desconocido">
          <div class="club-hidden-emblem">?</div>
          <strong>DESCONOCIDO</strong>
          <small>Bloqueado</small>
        </article>`;
    }).join('');

    return true;
  }

  function renderClubMenu() {
    const history = getHistory();
    if (!history) return false;
    const club = CLUBS.find((item) => item.id === history.selectedClub);
    if (!club) return false;

    clubMenuName.textContent = club.name;
    clubMenuLogo.src = imageSrc(club.logo);
    return true;
  }

  window.showClubs = function () {
    if (!renderClubs()) return;
    transitionTo(clubsStage);
  };

  window.showOwnedClubMenu = function () {
    if (!renderClubMenu()) return;
    transitionTo(clubMenuStage);
  };

  grid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-owned-club]');
    if (!button) return;
    window.showOwnedClubMenu();
  });

  document.getElementById('clubsBackButton').addEventListener('click', () => {
    if (typeof window.showHub === 'function') window.showHub();
  });

  document.getElementById('clubMenuBackButton').addEventListener('click', () => {
    window.showClubs();
  });

  document.addEventListener('click', (event) => {
    const module = event.target.closest('.hub-module');
    if (!module) return;
    const title = module.querySelector('strong');
    if (!title || title.textContent.trim() !== 'Clubes') return;
    event.preventDefault();
    window.showClubs();
  });
})();
