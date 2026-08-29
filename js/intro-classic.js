(() => {
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = 'css/intro-classic.css?v=2.1.0';
  document.head.appendChild(style);

  const LOGO_BASE = 'assets/clubs/guatemala/';
  const CLUBS = {
    municipal: { name: 'Municipal', place: 'Ciudad de Guatemala', logo: 'CSD Municipal.png', color: '#d71920', initials: 'MUN' },
    comunicaciones: { name: 'Comunicaciones', place: 'Ciudad de Guatemala', logo: 'Comunicaciones FC.png', color: '#e7e1cf', initials: 'COM' },
    'antigua-gfc': { name: 'Antigua GFC', place: 'Antigua Guatemala', logo: 'Antigua GFC.png', color: '#198754', initials: 'ANT' },
    'xelaju-mc': { name: 'Xelajú MC', place: 'Quetzaltenango', logo: 'Xelaju FC.png', color: '#233a8b', initials: 'XEL' },
    mixco: { name: 'Deportivo Mixco', place: 'Mixco', logo: 'Mixco FC.png', color: '#244a9b', initials: 'MIX' },
    guastatoya: { name: 'Guastatoya', place: 'El Progreso', logo: 'Guastatoya FC.png', color: '#e0c918', initials: 'GUA' },
    'san-pedro': { name: 'San Pedro', place: 'San Marcos', logo: 'San Pedro FC.png', color: '#1e57a6', initials: 'SPD' },
    suchitepequez: { name: 'Suchitepéquez', place: 'Mazatenango', logo: 'Suchitepequez FC.png', color: '#b51f32', initials: 'SUC' },
    marquense: { name: 'Marquense', place: 'San Marcos', logo: 'Marquense FC.png', color: '#dfc31d', initials: 'MAR' },
    aurora: { name: 'Aurora FC', place: 'Ciudad de Guatemala', logo: 'Aurora FC.png', color: '#dfc71c', initials: 'AUR' },
    malacateco: { name: 'Malacateco', place: 'Malacatán', logo: 'Malacateco FC.png', color: '#d4272e', initials: 'MAL' },
    'coban-imperial': { name: 'Cobán Imperial', place: 'Alta Verapaz', logo: 'Coban Imperial FC.png', color: '#1f4aa5', initials: 'COB' }
  };

  const shell = document.querySelector('.game-shell');
  if (!shell || document.getElementById('classicStage')) return;

  const stage = document.createElement('section');
  stage.id = 'classicStage';
  stage.className = 'screen secondary-screen classic-scene';
  stage.innerHTML = `
    <div id="classicSequence" class="classic-sequence">
      <div class="classic-light classic-light-left" aria-hidden="true"></div>
      <div class="classic-light classic-light-right" aria-hidden="true"></div>
      <div class="classic-center-line" aria-hidden="true"></div>

      <div class="classic-versus">
        <article class="classic-club classic-home">
          <div class="classic-crest-wrap">
            <span id="classicHomeFallback" class="classic-fallback">---</span>
            <img id="classicHomeLogo" class="classic-crest" alt="">
          </div>
          <h3 id="classicHomeName">Tu club</h3>
          <small id="classicHomePlace"></small>
        </article>

        <div class="classic-vs">VS</div>

        <article class="classic-club classic-rival">
          <div class="classic-crest-wrap">
            <span id="classicRivalFallback" class="classic-fallback">---</span>
            <img id="classicRivalLogo" class="classic-crest" alt="">
          </div>
          <h3 id="classicRivalName">Rival</h3>
          <small id="classicRivalPlace"></small>
        </article>
      </div>

      <div class="classic-story">
        <p class="classic-line classic-line-1">Los primeros clubes empezaron a tomar forma.</p>
        <p class="classic-line classic-line-2">Pero una historia no crece sin oposición.</p>
        <p class="classic-line classic-line-3">Dos equipos estaban destinados a encontrarse.</p>
        <p class="classic-line classic-line-4">Y así nació el primer clásico de tu historia.</p>
      </div>

      <button id="classicContinueButton" class="classic-continue-button" type="button">Continuar ›</button>
    </div>`;

  shell.appendChild(stage);

  const sequence = document.getElementById('classicSequence');
  const homeLogo = document.getElementById('classicHomeLogo');
  const rivalLogo = document.getElementById('classicRivalLogo');
  const homeFallback = document.getElementById('classicHomeFallback');
  const rivalFallback = document.getElementById('classicRivalFallback');
  const homeName = document.getElementById('classicHomeName');
  const rivalName = document.getElementById('classicRivalName');
  const homePlace = document.getElementById('classicHomePlace');
  const rivalPlace = document.getElementById('classicRivalPlace');
  const continueButton = document.getElementById('classicContinueButton');
  const DURATION = 12500;
  let timer = null;

  function imageSrc(file) {
    return `${LOGO_BASE}${encodeURIComponent(file).replaceAll('%2F', '/')}`;
  }

  function setClubVisual(img, fallback, club) {
    fallback.textContent = club.initials;
    fallback.style.display = 'none';
    img.style.display = 'block';
    img.src = imageSrc(club.logo);
    img.alt = `Escudo de ${club.name}`;
    img.onerror = () => {
      img.style.display = 'none';
      fallback.style.display = 'grid';
    };
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

  function prepare() {
    const history = getCurrentHistorySafe();
    if (!history) return false;

    const home = CLUBS[history.selectedClub];
    const rival = CLUBS[history.rivalClub];
    if (!home || !rival) return false;

    sequence.style.setProperty('--home-color', home.color);
    sequence.style.setProperty('--rival-color', rival.color);
    setClubVisual(homeLogo, homeFallback, home);
    setClubVisual(rivalLogo, rivalFallback, rival);
    homeName.textContent = home.name;
    rivalName.textContent = rival.name;
    homePlace.textContent = home.place;
    rivalPlace.textContent = rival.place;
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

  window.showFirstClassicScene = function () {
    if (!prepare()) return;
    fade.classList.add('is-visible');
    window.setTimeout(() => {
      document.querySelectorAll('.screen.active').forEach((screen) => screen.classList.remove('active'));
      stage.classList.add('active');
      play();
      requestAnimationFrame(() => fade.classList.remove('is-visible'));
    }, TRANSITION_TIME);
  };

  // Intercepta el botón final de la celebración del club antes de que
  // club-selection.js lo envíe provisionalmente al menú principal.
  document.addEventListener('click', (event) => {
    const button = event.target.closest('#clubNextButton');
    if (!button || typeof window.showFirstClassicScene !== 'function') return;

    event.preventDefault();
    event.stopImmediatePropagation();

    const confirmed = document.getElementById('clubConfirmed');
    if (confirmed) {
      confirmed.classList.remove('is-visible');
      confirmed.setAttribute('aria-hidden', 'true');
    }

    window.showFirstClassicScene();
  }, true);

  continueButton.addEventListener('click', () => {
    stop();
    stage.classList.remove('active');
    try {
      const histories = JSON.parse(localStorage.getItem('lhdf.histories') || '[]');
      const id = localStorage.getItem('lhdf.currentHistoryId');
      const history = histories.find((item) => item.id === id);
      if (history) {
        history.introScene = 6;
        history.updatedAt = new Date().toISOString();
        localStorage.setItem('lhdf.histories', JSON.stringify(histories));
      }
    } catch (error) {
      console.error('No se pudo guardar el avance del primer clásico:', error);
    }

    // Destino provisional hasta implementar la animación final de clubes por descubrir.
    showScreen('mainMenu');
  });
})();
