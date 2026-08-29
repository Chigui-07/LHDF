// Entrada oficial de historias para Alpha 3.1.
// Las historias sin completar comienzan desde El Sueño; las completadas entran al Hub.

const introResponsiveStyle = document.createElement('link');
introResponsiveStyle.rel = 'stylesheet';
introResponsiveStyle.href = 'css/intro-responsive.css?v=2.1.1';
document.head.appendChild(introResponsiveStyle);

const introAlignmentStyle = document.createElement('link');
introAlignmentStyle.rel = 'stylesheet';
introAlignmentStyle.href = 'css/intro-alignment.css?v=2.1.0';
document.head.appendChild(introAlignmentStyle);

openHistory = function (history) {
  const histories = loadHistories();
  const storedHistory = histories.find((item) => item.id === history.id);

  if (!storedHistory) return;

  storedHistory.updatedAt = new Date().toISOString();
  writeHistories(histories);
  localStorage.setItem(CURRENT_HISTORY_KEY, storedHistory.id);
  renderSavedHistories();

  if (storedHistory.introCompleted === true) {
    if (typeof window.showHub === 'function') window.showHub();
    else showScreen('mainMenu');
    return;
  }

  showScreen('introStage');
};

// Escena 4: invitación a los primeros jóvenes.
const invitationStyle = document.createElement('link');
invitationStyle.rel = 'stylesheet';
invitationStyle.href = 'css/intro-invitation.css?v=2.1.0';
document.head.appendChild(invitationStyle);

const invitationStage = document.createElement('section');
invitationStage.id = 'invitationStage';
invitationStage.className = 'screen secondary-screen invitation-scene';
invitationStage.setAttribute('aria-labelledby', 'invitationSceneTitle');
invitationStage.innerHTML = `
  <div id="invitationSequence" class="invitation-sequence">
    <div class="invitation-sun" aria-hidden="true"></div>
    <div class="invitation-houses" aria-hidden="true">
      <div class="invitation-house house-one"><span></span><span></span></div>
      <div class="invitation-house house-two"><span></span><span></span></div>
      <div class="invitation-house house-three"><span></span><span></span></div>
      <div class="invitation-house house-four"><span></span><span></span></div>
    </div>

    <div class="community-field" aria-hidden="true"></div>
    <div class="invitation-goal" aria-hidden="true"></div>

    <div class="invitation-players" aria-hidden="true">
      <span class="invitation-person player-1"></span>
      <span class="invitation-person player-2"></span>
      <span class="invitation-person player-3"></span>
      <div class="invitation-ball"></div>
    </div>

    <div class="invitation-flyer flyer-one" aria-hidden="true">SE BUSCAN JÓVENES<br><br>Una nueva idea está comenzando.</div>
    <div class="invitation-flyer flyer-two" aria-hidden="true">¿TE GUSTA JUGAR?<br><br>Ven y forma parte del comienzo.</div>
    <div class="invitation-flyer flyer-three" aria-hidden="true">PRIMERA CONVOCATORIA<br><br>Todos pueden acercarse.</div>

    <div class="invitation-board">
      <small>CONVOCATORIA ABIERTA</small>
      <strong id="invitationFoundationName">TU FUNDACIÓN</strong>
      <span>Buscamos jóvenes dispuestos a jugar, organizarse y construir algo nuevo.</span>
    </div>

    <div class="invitation-people" aria-hidden="true">
      <span class="invitation-person young-1"></span>
      <span class="invitation-person young-2"></span>
      <span class="invitation-person young-3"></span>
      <span class="invitation-person young-4"></span>
    </div>

    <div class="invitation-story" id="invitationSceneTitle">
      <p class="invitation-line invitation-line-1">La idea necesitaba personas para poder crecer.</p>
      <p class="invitation-line invitation-line-2">Así que decidiste salir a buscarlas.</p>
      <p class="invitation-line invitation-line-3">La primera convocatoria comenzó a extenderse por el barrio.</p>
      <p class="invitation-line invitation-line-4">Poco a poco, algunos jóvenes se detuvieron a escuchar.</p>
      <p class="invitation-line invitation-line-5">Todavía no eran clubes... pero ya no estabas solo.</p>
    </div>

    <button id="invitationContinueButton" class="invitation-continue-button" type="button">Continuar ›</button>
  </div>
`;

document.querySelector('.game-shell').appendChild(invitationStage);

const invitationSequence = document.getElementById('invitationSequence');
const invitationContinueButton = document.getElementById('invitationContinueButton');
const invitationFoundationName = document.getElementById('invitationFoundationName');
const INVITATION_SCENE_DURATION = 19400;
let invitationSceneTimer = null;

function prepareInvitationScene() {
  const history = getCurrentHistory();
  if (history && invitationFoundationName) {
    invitationFoundationName.textContent = history.foundationName || 'Tu Fundación';
  }
}

function stopInvitationScene() {
  if (invitationSceneTimer) {
    window.clearTimeout(invitationSceneTimer);
    invitationSceneTimer = null;
  }
}

function playInvitationScene() {
  if (!invitationSequence) return;

  stopInvitationScene();
  invitationSequence.classList.remove('is-playing', 'is-complete');
  void invitationSequence.offsetWidth;

  requestAnimationFrame(() => {
    invitationSequence.classList.add('is-playing');
  });

  invitationSceneTimer = window.setTimeout(() => {
    invitationSequence.classList.add('is-complete');
  }, INVITATION_SCENE_DURATION);
}

function showInvitationScene() {
  prepareInvitationScene();
  fade.classList.add('is-visible');

  window.setTimeout(() => {
    document.querySelectorAll('.screen.active').forEach((screen) => screen.classList.remove('active'));
    invitationStage.classList.add('active');
    stopDreamScene();
    stopFoundationScene();
    stopUnknownScene();
    playInvitationScene();

    requestAnimationFrame(() => fade.classList.remove('is-visible'));
  }, TRANSITION_TIME);
}

// Capturamos el botón de la tercera escena antes de que el manejador provisional
// de main.js lo envíe al menú principal.
document.addEventListener('click', (event) => {
  const button = event.target.closest('#unknownContinueButton');
  if (!button) return;

  event.preventDefault();
  event.stopImmediatePropagation();
  updateCurrentIntroScene(4);
  showInvitationScene();
}, true);

if (invitationContinueButton) {
  invitationContinueButton.addEventListener('click', () => {
    // Destino temporal; club-selection.js sustituye este listener cuando carga.
    invitationStage.classList.remove('active');
    stopInvitationScene();
    showScreen('mainMenu');
  });
}

// Pantalla interactiva de elección del primer club.
const clubSelectionScript = document.createElement('script');
clubSelectionScript.src = 'js/club-selection.js?v=2.1.4';
clubSelectionScript.addEventListener('load', () => {
  if (!document.querySelector('script[data-lhdf-classic]')) {
    const classicScript = document.createElement('script');
    classicScript.src = 'js/intro-classic.js?v=2.1.2';
    classicScript.dataset.lhdfClassic = 'true';
    document.body.appendChild(classicScript);
  }
});
document.body.appendChild(clubSelectionScript);

// Sistemas propios de Alpha 3.1.
const settingsScript = document.createElement('script');
settingsScript.src = 'js/settings.js?v=3.1.0';
document.body.appendChild(settingsScript);

// Cargador oficial del Hub de Alpha 3.1.
if (!document.querySelector('script[data-lhdf-hub-entry]')) {
  const hubEntryScript = document.createElement('script');
  hubEntryScript.src = 'js/hub-entry.js?v=3.1.5';
  hubEntryScript.dataset.lhdfHubEntry = 'true';
  document.body.appendChild(hubEntryScript);
}
