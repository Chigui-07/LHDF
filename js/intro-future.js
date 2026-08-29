(() => {
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = 'css/intro-future.css?v=2.1.0';
  document.head.appendChild(style);

  const LOGO_BASE = 'assets/clubs/guatemala/';
  const CLUBS = [
    { id: 'municipal', name: 'Municipal', logo: 'CSD Municipal.png', color: '#d71920' },
    { id: 'comunicaciones', name: 'Comunicaciones', logo: 'Comunicaciones FC.png', color: '#e7e1cf' },
    { id: 'antigua-gfc', name: 'Antigua GFC', logo: 'Antigua GFC.png', color: '#198754' },
    { id: 'xelaju-mc', name: 'Xelajú MC', logo: 'Xelaju FC.png', color: '#233a8b' },
    { id: 'mixco', name: 'Deportivo Mixco', logo: 'Mixco FC.png', color: '#244a9b' },
    { id: 'guastatoya', name: 'Guastatoya', logo: 'Guastatoya FC.png', color: '#d9c41a' },
    { id: 'san-pedro', name: 'San Pedro', logo: 'San Pedro FC.png', color: '#1e57a6' },
    { id: 'suchitepequez', name: 'Suchitepéquez', logo: 'Suchitepequez FC.png', color: '#b51f32' },
    { id: 'marquense', name: 'Marquense', logo: 'Marquense FC.png', color: '#d7be23' },
    { id: 'aurora', name: 'Aurora FC', logo: 'Aurora FC.png', color: '#dbc51f' },
    { id: 'malacateco', name: 'Malacateco', logo: 'Malacateco FC.png', color: '#d4272e' },
    { id: 'coban-imperial', name: 'Cobán Imperial', logo: 'Coban Imperial FC.png', color: '#1f4aa5' }
  ];

  const shell = document.querySelector('.game-shell');
  if (!shell || document.getElementById('futureStage')) return;

  const stage = document.createElement('section');
  stage.id = 'futureStage';
  stage.className = 'screen secondary-screen future-scene';
  stage.setAttribute('aria-labelledby', 'futureTitle');
  stage.innerHTML = `
    <div id="futureSequence" class="future-sequence">
      <header class="future-heading">
        <p class="eyebrow">EL COMIENZO DE ALGO MAYOR</p>
        <h2 id="futureTitle">El fútbol apenas comienza</h2>
      </header>
      <div id="futureClubGrid" class="future-club-grid"></div>
      <div class="future-story">
        <p class="future-line future-line-1">El primer clásico ya había nacido.</p>
        <p class="future-line future-line-2">Pero todavía quedaban muchos clubes por descubrir.</p>
        <p class="future-line future-line-3">Cada uno traería nuevos partidos, historias y rivalidades.</p>
        <p class="future-line future-line-4">El futuro del fútbol ahora estaba en tus manos.</p>
      </div>
      <button id="futureContinueButton" class="future-continue-button" type="button">Comenzar historia ›</button>
    </div>`;

  shell.appendChild(stage);

  const sequence = document.getElementById('futureSequence');
  const grid = document.getElementById('futureClubGrid');
  const continueButton = document.getElementById('futureContinueButton');
  const DURATION = 11200;
  let timer = null;

  function imageSrc(file) {
    return `${LOGO_BASE}${encodeURIComponent(file).replaceAll('%2F', '/')}`;
  }

  function getCurrentHistorySafe() {
    try {
      const histories = JSON.parse(localStorage.getItem('lhdf.histories') || '[]');
      const id = localStorage.getItem('lhdf.currentHistoryId');
      return histories.find((history) => history.id === id) || null;
    } catch (error) {
      return null;
    }
  }

  function renderClubs() {
    const history = getCurrentHistorySafe();
    if (!history) return false;

    const revealed = new Set([history.selectedClub, history.rivalClub]);
    grid.innerHTML = CLUBS.map((club, index) => {
      const isRevealed = revealed.has(club.id);
      if (isRevealed) {
        return `
          <article class="future-club-card is-revealed" style="--card-index:${index};--club-color:${club.color}">
            <div class="future-logo-wrap">
              <img class="future-logo" src="${imageSrc(club.logo)}" alt="Escudo de ${club.name}">
            </div>
            <div class="future-club-name">${club.name}</div>
          </article>`;
      }

      return `
        <article class="future-club-card is-hidden" style="--card-index:${index}">
          <div class="future-hidden-badge">?</div>
          <div class="future-club-name">DESCONOCIDO</div>
        </article>`;
    }).join('');

    return true;
  }

  function stop() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function play() {
    stop();
    sequence.classList.remove('is-playing', 'is-complete');
    void sequence.offsetWidth;
    requestAnimationFrame(() => sequence.classList.add('is-playing'));
    timer = window.setTimeout(() => sequence.classList.add('is-complete'), DURATION);
  }

  window.showFutureScene = function () {
    if (!renderClubs()) return;
    fade.classList.add('is-visible');
    window.setTimeout(() => {
      document.querySelectorAll('.screen.active').forEach((screen) => screen.classList.remove('active'));
      stage.classList.add('active');
      play();
      requestAnimationFrame(() => fade.classList.remove('is-visible'));
    }, TRANSITION_TIME);
  };

  continueButton.addEventListener('click', () => {
    stop();
    stage.classList.remove('active');

    try {
      const histories = JSON.parse(localStorage.getItem('lhdf.histories') || '[]');
      const id = localStorage.getItem('lhdf.currentHistoryId');
      const history = histories.find((item) => item.id === id);
      if (history) {
        history.introScene = 7;
        history.updatedAt = new Date().toISOString();
        localStorage.setItem('lhdf.histories', JSON.stringify(histories));
      }
    } catch (error) {
      console.error('No se pudo guardar el cierre de la introducción:', error);
    }

    // Destino provisional hasta construir el hub real del juego.
    showScreen('mainMenu');
  });
})();
