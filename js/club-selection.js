(() => {
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = 'css/club-selection.css?v=2.1.3';
  document.head.appendChild(stylesheet);

  const LOGO_BASE = 'assets/clubs/guatemala/';
  const CELEBRATION_COLORS = ['#ffd166', '#55e6d9', '#ffffff', '#ff7b72', '#a78bfa'];

  const clubs = [
    { id: 'municipal', name: 'Municipal', place: 'Ciudad de Guatemala', initials: 'MUN', logo: 'CSD Municipal.png', primary: '#d71920', secondary: '#ffffff', rival: 'comunicaciones' },
    { id: 'comunicaciones', name: 'Comunicaciones', place: 'Ciudad de Guatemala', initials: 'COM', logo: 'Comunicaciones FC.png', primary: '#f2f0e7', secondary: '#c9c4ad', rival: 'municipal' },
    { id: 'antigua-gfc', name: 'Antigua GFC', place: 'Antigua Guatemala', initials: 'ANT', logo: 'Antigua GFC.png', primary: '#198754', secondary: '#ffffff', rival: 'xelaju-mc' },
    { id: 'xelaju-mc', name: 'Xelajú MC', place: 'Quetzaltenango', initials: 'XEL', logo: 'Xelaju FC.png', primary: '#233a8b', secondary: '#c91e2b', rival: 'antigua-gfc' },
    { id: 'mixco', name: 'Deportivo Mixco', place: 'Mixco', initials: 'MIX', logo: 'Mixco FC.png', primary: '#244a9b', secondary: '#f1d23b', rival: 'comunicaciones' },
    { id: 'guastatoya', name: 'Guastatoya', place: 'El Progreso', initials: 'GUA', logo: 'Guastatoya FC.png', primary: '#f0d323', secondary: '#2c8b42', rival: 'coban-imperial' },
    { id: 'san-pedro', name: 'San Pedro', place: 'San Marcos', initials: 'SPD', logo: 'San Pedro FC.png', primary: '#1e57a6', secondary: '#ffffff', rival: 'marquense' },
    { id: 'suchitepequez', name: 'Suchitepéquez', place: 'Mazatenango', initials: 'SUC', logo: 'Suchitepequez FC.png', primary: '#b51f32', secondary: '#244a8f', rival: 'xelaju-mc' },
    { id: 'marquense', name: 'Marquense', place: 'San Marcos', initials: 'MAR', logo: 'Marquense FC.png', primary: '#f0d027', secondary: '#111111', rival: 'san-pedro' },
    { id: 'aurora', name: 'Aurora FC', place: 'Ciudad de Guatemala', initials: 'AUR', logo: 'Aurora FC.png', primary: '#f2d21e', secondary: '#111111', rival: 'municipal' },
    { id: 'malacateco', name: 'Malacateco', place: 'Malacatán', initials: 'MAL', logo: 'Malacateco FC.png', primary: '#d4272e', secondary: '#ffffff', rival: 'marquense' },
    { id: 'coban-imperial', name: 'Cobán Imperial', place: 'Alta Verapaz', initials: 'COB', logo: 'Coban Imperial FC.png', primary: '#1f4aa5', secondary: '#ffffff', rival: 'guastatoya' }
  ];

  const gameShell = document.querySelector('.game-shell');
  if (!gameShell || document.getElementById('clubSelectionStage')) return;

  const selectionSection = document.createElement('section');
  selectionSection.id = 'clubSelectionStage';
  selectionSection.className = 'screen secondary-screen club-selection-scene';
  selectionSection.setAttribute('aria-labelledby', 'clubSelectionTitle');
  selectionSection.innerHTML = `
    <div class="club-selection-shell">
      <header class="club-selection-heading">
        <p class="eyebrow">LOS PRIMEROS CLUBES</p>
        <h2 id="clubSelectionTitle">Elige dónde comenzará tu historia</h2>
        <p>Tu elección definirá el club inicial de esta partida y también el primer rival que aparecerá en tu historia.</p>
      </header>
      <div id="clubGrid" class="club-grid"></div>
    </div>
    <div id="clubModal" class="club-modal" aria-hidden="true">
      <div id="clubModalCard" class="club-modal-card">
        <div id="clubModalEmblem" class="club-placeholder club-modal-emblem">---</div>
        <h3 id="clubModalName">Club</h3>
        <p>¿Quieres comenzar tu historia con este club?</p>
        <div class="club-modal-actions">
          <button id="clubCancelButton" class="club-cancel-button" type="button">Volver</button>
          <button id="clubConfirmButton" class="club-confirm-button" type="button">Elegir club</button>
        </div>
      </div>
    </div>
    <div id="clubConfirmed" class="club-confirmed" aria-hidden="true">
      <div id="confettiLayer" aria-hidden="true"></div>
      <div class="club-confirmed-content">
        <div id="confirmedEmblem" class="club-placeholder">---</div>
        <h3 id="confirmedClubName">Club</h3>
        <p>Tu historia comienza aquí.</p>
        <button id="clubNextButton" class="club-next-button" type="button">Continuar ›</button>
      </div>
    </div>`;

  gameShell.appendChild(selectionSection);

  const clubGrid = document.getElementById('clubGrid');
  const clubModal = document.getElementById('clubModal');
  const clubModalCard = document.getElementById('clubModalCard');
  const clubModalEmblem = document.getElementById('clubModalEmblem');
  const clubModalName = document.getElementById('clubModalName');
  const clubConfirmButton = document.getElementById('clubConfirmButton');
  const clubCancelButton = document.getElementById('clubCancelButton');
  const clubConfirmed = document.getElementById('clubConfirmed');
  const confirmedEmblem = document.getElementById('confirmedEmblem');
  const confirmedClubName = document.getElementById('confirmedClubName');
  const clubNextButton = document.getElementById('clubNextButton');
  const confettiLayer = document.getElementById('confettiLayer');
  let pendingClub = null;

  function emblemMarkup(club) {
    const src = `${LOGO_BASE}${encodeURIComponent(club.logo).replaceAll('%2F', '/')}`;
    return `<span class="club-initials-fallback" style="display:none">${club.initials}</span><img class="club-logo" src="${src}" alt="Escudo de ${club.name}" onerror="this.previousElementSibling.style.display='grid';this.style.display='none'">`;
  }

  function setEmblem(container, club) {
    container.innerHTML = emblemMarkup(club);
    applyClubTheme(container, club);
  }

  clubGrid.innerHTML = clubs.map((club, index) => `
    <button class="club-card" type="button" data-club-id="${club.id}" style="--club-primary:${club.primary};--club-secondary:${club.secondary};animation-delay:${index * 55}ms">
      <div class="club-placeholder">${emblemMarkup(club)}</div>
      <strong>${club.name}</strong>
      <small>${club.place}</small>
    </button>`).join('');

  const oldInvitationButton = document.getElementById('invitationContinueButton');
  if (oldInvitationButton) {
    const invitationButton = oldInvitationButton.cloneNode(true);
    oldInvitationButton.replaceWith(invitationButton);
    invitationButton.textContent = 'Elegir club ›';
    invitationButton.addEventListener('click', () => {
      if (typeof stopInvitationScene === 'function') stopInvitationScene();
      updateIntroProgress(5);
      showSelectionScreen();
    });
  }

  clubGrid.querySelectorAll('[data-club-id]').forEach((button) => {
    button.addEventListener('click', () => openClubModal(button.dataset.clubId));
  });

  clubCancelButton.addEventListener('click', closeClubModal);
  clubModal.addEventListener('click', (event) => {
    if (event.target === clubModal) closeClubModal();
  });

  clubConfirmButton.addEventListener('click', () => {
    if (!pendingClub) return;
    saveClubChoice(pendingClub);
    closeClubModal();
    celebrateClub(pendingClub);
  });

  clubNextButton.addEventListener('click', () => {
    clubConfirmed.classList.remove('is-visible');
    clubConfirmed.setAttribute('aria-hidden', 'true');
    showScreen('mainMenu');
  });

  function showSelectionScreen() {
    fade.classList.add('is-visible');
    window.setTimeout(() => {
      document.querySelectorAll('.screen.active').forEach((screen) => screen.classList.remove('active'));
      selectionSection.classList.add('active');
      requestAnimationFrame(() => fade.classList.remove('is-visible'));
    }, TRANSITION_TIME);
  }

  function updateIntroProgress(scene) {
    try {
      const histories = JSON.parse(localStorage.getItem('lhdf.histories') || '[]');
      const id = localStorage.getItem('lhdf.currentHistoryId');
      const history = histories.find((item) => item.id === id);
      if (!history) return;
      history.introScene = scene;
      history.updatedAt = new Date().toISOString();
      localStorage.setItem('lhdf.histories', JSON.stringify(histories));
    } catch (error) {
      console.error('No se pudo actualizar el progreso de la introducción:', error);
    }
  }

  function openClubModal(clubId) {
    pendingClub = clubs.find((club) => club.id === clubId) || null;
    if (!pendingClub) return;
    applyClubTheme(clubModalCard, pendingClub);
    applyClubTheme(clubConfirmButton, pendingClub);
    setEmblem(clubModalEmblem, pendingClub);
    clubModalName.textContent = pendingClub.name;
    clubModal.classList.add('is-open');
    clubModal.setAttribute('aria-hidden', 'false');
  }

  function closeClubModal() {
    clubModal.classList.remove('is-open');
    clubModal.setAttribute('aria-hidden', 'true');
  }

  function saveClubChoice(club) {
    try {
      const histories = JSON.parse(localStorage.getItem('lhdf.histories') || '[]');
      const id = localStorage.getItem('lhdf.currentHistoryId');
      const history = histories.find((item) => item.id === id);
      if (!history) return;
      history.selectedClub = club.id;
      history.rivalClub = club.rival;
      history.clubSelected = true;
      history.introScene = 5;
      history.updatedAt = new Date().toISOString();
      localStorage.setItem('lhdf.histories', JSON.stringify(histories));
    } catch (error) {
      console.error('No se pudo guardar el club seleccionado:', error);
    }
  }

  function celebrateClub(club) {
    applyClubTheme(clubConfirmed, club);
    applyClubTheme(clubNextButton, club);
    setEmblem(confirmedEmblem, club);
    confirmedClubName.textContent = club.name;
    confettiLayer.innerHTML = '';

    for (let index = 0; index < 100; index += 1) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      piece.style.left = `${Math.random() * 100}vw`;
      piece.style.setProperty('--confetti-color', CELEBRATION_COLORS[index % CELEBRATION_COLORS.length]);
      piece.style.setProperty('--fall-duration', `${2.6 + Math.random() * 2.4}s`);
      piece.style.setProperty('--drift', `${-120 + Math.random() * 240}px`);
      piece.style.animationDelay = `${Math.random() * .7}s`;
      confettiLayer.appendChild(piece);
    }

    clubConfirmed.classList.add('is-visible');
    clubConfirmed.setAttribute('aria-hidden', 'false');
  }

  function applyClubTheme(element, club) {
    element.style.setProperty('--club-primary', club.primary);
    element.style.setProperty('--club-secondary', club.secondary);
  }
})();
