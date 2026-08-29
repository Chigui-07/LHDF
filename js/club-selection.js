(() => {
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = 'css/club-selection.css?v=2.1.0';
  document.head.appendChild(stylesheet);

  const clubs = [
    { id: 'municipal', name: 'Municipal', place: 'Ciudad de Guatemala', initials: 'MUN', primary: '#d71920', secondary: '#ffffff', rival: 'comunicaciones' },
    { id: 'comunicaciones', name: 'Comunicaciones', place: 'Ciudad de Guatemala', initials: 'COM', primary: '#f2f0e7', secondary: '#c9c4ad', rival: 'municipal' },
    { id: 'antigua-gfc', name: 'Antigua GFC', place: 'Antigua Guatemala', initials: 'ANT', primary: '#198754', secondary: '#ffffff', rival: 'xelaju-mc' },
    { id: 'xelaju-mc', name: 'Xelajú MC', place: 'Quetzaltenango', initials: 'XEL', primary: '#233a8b', secondary: '#c91e2b', rival: 'antigua-gfc' },
    { id: 'mixco', name: 'Deportivo Mixco', place: 'Mixco', initials: 'MIX', primary: '#244a9b', secondary: '#f1d23b', rival: 'comunicaciones' },
    { id: 'guastatoya', name: 'Guastatoya', place: 'El Progreso', initials: 'GUA', primary: '#f0d323', secondary: '#2c8b42', rival: 'coban-imperial' },
    { id: 'san-pedro', name: 'San Pedro', place: 'San Marcos', initials: 'SPD', primary: '#1e57a6', secondary: '#ffffff', rival: 'marquense' },
    { id: 'suchitepequez', name: 'Suchitepéquez', place: 'Mazatenango', initials: 'SUC', primary: '#b51f32', secondary: '#244a8f', rival: 'xelaju-mc' },
    { id: 'marquense', name: 'Marquense', place: 'San Marcos', initials: 'MAR', primary: '#f0d027', secondary: '#111111', rival: 'san-pedro' },
    { id: 'aurora', name: 'Aurora FC', place: 'Ciudad de Guatemala', initials: 'AUR', primary: '#f2d21e', secondary: '#111111', rival: 'municipal' },
    { id: 'malacateco', name: 'Malacateco', place: 'Malacatán', initials: 'MAL', primary: '#d4272e', secondary: '#ffffff', rival: 'marquense' },
    { id: 'coban-imperial', name: 'Cobán Imperial', place: 'Alta Verapaz', initials: 'COB', primary: '#1f4aa5', secondary: '#ffffff', rival: 'guastatoya' }
  ];

  const insertionPoint = document.getElementById('settings') || document.querySelector('main');
  if (!insertionPoint || document.getElementById('invitationStage')) return;

  const invitationSection = document.createElement('section');
  invitationSection.id = 'invitationStage';
  invitationSection.className = 'screen secondary-screen invitation-scene';
  invitationSection.setAttribute('aria-labelledby', 'invitationSceneTitle');
  invitationSection.innerHTML = `
    <div class="invitation-sequence">
      <div class="community-sun" aria-hidden="true"></div>
      <div class="community-hills" aria-hidden="true"></div>
      <div class="community-field" aria-hidden="true"></div>
      <div class="community-goal" aria-hidden="true"></div>
      <div class="community-ball" aria-hidden="true"></div>
      <div class="community-player player-a" aria-hidden="true"></div>
      <div class="community-player player-b" aria-hidden="true"></div>
      <div class="community-player player-c" aria-hidden="true"></div>
      <div class="community-player player-d" aria-hidden="true"></div>
      <div class="invitation-flyer flyer-a" aria-hidden="true">BUSCAMOS JÓVENES<br><br>UNA NUEVA HISTORIA ESTÁ POR COMENZAR</div>
      <div class="invitation-flyer flyer-b" aria-hidden="true">PRIMERA CONVOCATORIA<br><br>FORMA PARTE DEL COMIENZO</div>
      <div class="invitation-flyer flyer-c" aria-hidden="true">FÚTBOL<br><br>UNA IDEA NECESITA JUGADORES</div>
      <div class="invitation-board" aria-hidden="true"><small>CONVOCATORIA</small><strong id="invitationFoundationName">TU FUNDACIÓN</strong><span>Buscamos jóvenes dispuestos a formar los primeros clubes.</span></div>
      <div class="invitation-story" id="invitationSceneTitle">
        <p class="invitation-line invitation-line-1">La idea necesitaba salir a las calles.</p>
        <p class="invitation-line invitation-line-2">Publicaste la primera convocatoria.</p>
        <p class="invitation-line invitation-line-3">Poco a poco, jóvenes de distintos lugares comenzaron a acercarse.</p>
        <p class="invitation-line invitation-line-4">Querían jugar. Querían competir. Querían formar algo propio.</p>
        <p class="invitation-line invitation-line-5">Todavía no eran clubes... pero ya no estabas solo.</p>
      </div>
      <button id="invitationContinueButton" class="invitation-continue-button" type="button">Elegir club ›</button>
    </div>`;

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
        <p id="clubModalText">¿Quieres comenzar tu historia con este club?</p>
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

  insertionPoint.parentNode.insertBefore(invitationSection, insertionPoint);
  insertionPoint.parentNode.insertBefore(selectionSection, insertionPoint);

  // main.js ya registró un destino provisional en este botón. Lo clonamos para retirar ese listener.
  const oldUnknownButton = document.getElementById('unknownContinueButton');
  if (oldUnknownButton) {
    const newUnknownButton = oldUnknownButton.cloneNode(true);
    oldUnknownButton.replaceWith(newUnknownButton);
    newUnknownButton.addEventListener('click', () => {
      updateIntroProgress(4);
      prepareInvitation();
      showScreen('invitationStage');
    });
  }

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

  clubGrid.innerHTML = clubs.map((club, index) => `
    <button class="club-card" type="button" data-club-id="${club.id}" style="--club-primary:${club.primary};--club-secondary:${club.secondary};animation-delay:${index * 55}ms">
      <div class="club-placeholder">${club.initials}</div>
      <strong>${club.name}</strong>
      <small>${club.place}</small>
    </button>`).join('');

  document.getElementById('invitationContinueButton').addEventListener('click', () => {
    updateIntroProgress(5);
    showScreen('clubSelectionStage');
  });

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
    // Destino temporal hasta construir la siguiente animación personalizada del clásico.
    clubConfirmed.classList.remove('is-visible');
    showScreen('mainMenu');
  });

  function prepareInvitation() {
    const history = currentHistory();
    const name = document.getElementById('invitationFoundationName');
    if (name) name.textContent = history?.foundationName || 'TU FUNDACIÓN';
  }

  function currentHistory() {
    try {
      const histories = JSON.parse(localStorage.getItem('lhdf.histories') || '[]');
      const id = localStorage.getItem('lhdf.currentHistoryId');
      return Array.isArray(histories) ? histories.find((history) => history.id === id) || null : null;
    } catch {
      return null;
    }
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
    clubModalEmblem.textContent = pendingClub.initials;
    applyClubTheme(clubModalEmblem, pendingClub);
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
    applyClubTheme(confirmedEmblem, club);
    applyClubTheme(clubNextButton, club);
    confirmedEmblem.textContent = club.initials;
    confirmedClubName.textContent = club.name;
    confettiLayer.innerHTML = '';
    const colors = [club.primary, club.secondary, club.primary, club.secondary];
    for (let index = 0; index < 90; index += 1) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      piece.style.left = `${Math.random() * 100}vw`;
      piece.style.setProperty('--confetti-color', colors[index % colors.length]);
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
