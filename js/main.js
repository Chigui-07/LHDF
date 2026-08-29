const fade = document.getElementById('screenFade');
const screens = [...document.querySelectorAll('.screen')];
const navigationButtons = [...document.querySelectorAll('[data-screen]')];
const newHistoryForm = document.getElementById('newHistoryForm');
const historyMessage = document.getElementById('historyMessage');
const savedHistoriesContainer = document.getElementById('savedHistories');
const continueMessage = document.getElementById('continueMessage');
const dreamSequence = document.getElementById('dreamSequence');
const dreamContinueButton = document.getElementById('dreamContinueButton');
const foundationSequence = document.getElementById('foundationSequence');
const foundationContinueButton = document.getElementById('foundationContinueButton');
const foundationDocumentName = document.getElementById('foundationDocumentName');
const foundationDocumentFounder = document.getElementById('foundationDocumentFounder');
const foundationStoryName = document.getElementById('foundationStoryName');

const TRANSITION_TIME = 480;
const DREAM_SCENE_DURATION = 22600;
const FOUNDATION_SCENE_DURATION = 19400;
const SAVE_KEY = 'lhdf.histories';
const CURRENT_HISTORY_KEY = 'lhdf.currentHistoryId';
const GAME_VERSION = 'Alpha 2.1';

let pendingDeleteHistoryId = null;
let dreamSceneTimer = null;
let foundationSceneTimer = null;

window.addEventListener('load', () => {
  renderSavedHistories();
  requestAnimationFrame(() => fade.classList.remove('is-visible'));
});

function showScreen(screenId) {
  const target = document.getElementById(screenId);

  if (!target || target.classList.contains('active')) {
    if (screenId === 'introStage') playDreamScene();
    if (screenId === 'foundationStage') playFoundationScene();
    return;
  }

  fade.classList.add('is-visible');

  window.setTimeout(() => {
    screens.forEach((screen) => screen.classList.remove('active'));
    target.classList.add('active');

    if (screenId === 'continueGame') {
      pendingDeleteHistoryId = null;
      renderSavedHistories();
    }

    if (screenId === 'introStage') {
      playDreamScene();
    } else {
      stopDreamScene();
    }

    if (screenId === 'foundationStage') {
      prepareFoundationScene(getCurrentHistory());
      playFoundationScene();
    } else {
      stopFoundationScene();
    }

    requestAnimationFrame(() => fade.classList.remove('is-visible'));
  }, TRANSITION_TIME);
}

function playDreamScene() {
  if (!dreamSequence) return;
  stopDreamScene();
  dreamSequence.classList.remove('is-playing', 'is-complete');
  void dreamSequence.offsetWidth;
  requestAnimationFrame(() => dreamSequence.classList.add('is-playing'));
  dreamSceneTimer = window.setTimeout(() => dreamSequence.classList.add('is-complete'), DREAM_SCENE_DURATION);
}

function stopDreamScene() {
  if (dreamSceneTimer) {
    window.clearTimeout(dreamSceneTimer);
    dreamSceneTimer = null;
  }
}

function playFoundationScene() {
  if (!foundationSequence) return;
  stopFoundationScene();
  foundationSequence.classList.remove('is-playing', 'is-complete');
  void foundationSequence.offsetWidth;
  requestAnimationFrame(() => foundationSequence.classList.add('is-playing'));
  foundationSceneTimer = window.setTimeout(() => foundationSequence.classList.add('is-complete'), FOUNDATION_SCENE_DURATION);
}

function stopFoundationScene() {
  if (foundationSceneTimer) {
    window.clearTimeout(foundationSceneTimer);
    foundationSceneTimer = null;
  }
}

function loadHistories() {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('No se pudieron leer las partidas guardadas:', error);
    return [];
  }
}

function writeHistories(histories) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(histories));
}

function getCurrentHistory() {
  const currentHistoryId = localStorage.getItem(CURRENT_HISTORY_KEY);
  return loadHistories().find((history) => history.id === currentHistoryId) || null;
}

function updateCurrentIntroScene(sceneNumber) {
  const currentHistoryId = localStorage.getItem(CURRENT_HISTORY_KEY);
  const histories = loadHistories();
  const currentHistory = histories.find((history) => history.id === currentHistoryId);

  if (!currentHistory) return;

  currentHistory.introScene = sceneNumber;
  currentHistory.updatedAt = new Date().toISOString();
  writeHistories(histories);
}

function prepareFoundationScene(history) {
  if (!history) return;
  const foundationName = history.foundationName || 'Tu Fundación';
  const founderName = history.founderName || 'Fundador';

  if (foundationDocumentName) foundationDocumentName.textContent = foundationName;
  if (foundationDocumentFounder) foundationDocumentFounder.textContent = founderName;
  if (foundationStoryName) foundationStoryName.textContent = foundationName;
}

function normalizeFoundationName(value) {
  return value.trim().toLocaleLowerCase('es-GT');
}

function foundationNameExists(foundationName) {
  const normalizedName = normalizeFoundationName(foundationName);
  return loadHistories().some((history) => normalizeFoundationName(history.foundationName || '') === normalizedName);
}

function saveHistory(history) {
  const histories = loadHistories();
  histories.push(history);
  writeHistories(histories);
  localStorage.setItem(CURRENT_HISTORY_KEY, history.id);
}

function formatSaveDate(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';

  return new Intl.DateTimeFormat('es-GT', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }).format(date);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function openHistory(history) {
  const histories = loadHistories();
  const storedHistory = histories.find((item) => item.id === history.id);
  if (!storedHistory) return;

  storedHistory.updatedAt = new Date().toISOString();
  writeHistories(histories);
  localStorage.setItem(CURRENT_HISTORY_KEY, storedHistory.id);
  renderSavedHistories();

  if ((storedHistory.introScene || 1) >= 2) {
    prepareFoundationScene(storedHistory);
    showScreen('foundationStage');
  } else {
    showScreen('introStage');
  }
}

function selectHistory(historyId) {
  const selectedHistory = loadHistories().find((history) => history.id === historyId);

  if (!selectedHistory) {
    if (continueMessage) continueMessage.textContent = 'No se pudo encontrar esa historia guardada.';
    return;
  }

  pendingDeleteHistoryId = null;
  openHistory(selectedHistory);
}

function requestDeleteHistory(historyId) {
  pendingDeleteHistoryId = historyId;
  if (continueMessage) continueMessage.textContent = 'Confirma la eliminación de la partida seleccionada.';
  renderSavedHistories();
}

function cancelDeleteHistory() {
  pendingDeleteHistoryId = null;
  if (continueMessage) continueMessage.textContent = '';
  renderSavedHistories();
}

function deleteHistory(historyId) {
  const histories = loadHistories();
  const historyToDelete = histories.find((history) => history.id === historyId);

  if (!historyToDelete) {
    if (continueMessage) continueMessage.textContent = 'No se pudo encontrar esa partida.';
    pendingDeleteHistoryId = null;
    renderSavedHistories();
    return;
  }

  const remainingHistories = histories.filter((history) => history.id !== historyId);
  writeHistories(remainingHistories);

  const currentHistoryId = localStorage.getItem(CURRENT_HISTORY_KEY);
  if (currentHistoryId === historyId) {
    if (remainingHistories.length > 0) {
      const nextCurrent = [...remainingHistories].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))[0];
      localStorage.setItem(CURRENT_HISTORY_KEY, nextCurrent.id);
    } else {
      localStorage.removeItem(CURRENT_HISTORY_KEY);
    }
  }

  pendingDeleteHistoryId = null;
  if (continueMessage) continueMessage.textContent = `La partida “${historyToDelete.foundationName}” fue eliminada.`;
  renderSavedHistories();
}

function renderSavedHistories() {
  if (!savedHistoriesContainer) return;

  const histories = loadHistories().sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  const currentHistoryId = localStorage.getItem(CURRENT_HISTORY_KEY);

  if (histories.length === 0) {
    savedHistoriesContainer.innerHTML = '<div class="empty-histories"><strong>No hay historias guardadas</strong><span>Crea una nueva fundación desde el menú principal para comenzar.</span></div>';
    return;
  }

  savedHistoriesContainer.innerHTML = histories.map((history) => {
    const isCurrent = history.id === currentHistoryId;
    const isPendingDelete = history.id === pendingDeleteHistoryId;
    const foundationName = escapeHtml(history.foundationName || 'Fundación sin nombre');
    const founderName = escapeHtml(history.founderName || 'Sin fundador');
    const country = escapeHtml(history.country || 'Guatemala');
    const version = escapeHtml(history.version || 'Desconocida');
    const historyId = escapeHtml(history.id);
    const date = formatSaveDate(history.updatedAt || history.createdAt);

    return `
      <article class="saved-history-card${isCurrent ? ' is-current' : ''}${isPendingDelete ? ' is-deleting' : ''}">
        <div class="save-card-top"><h3>${foundationName}</h3>${isCurrent ? '<span class="current-badge">Activa</span>' : ''}</div>
        <div class="save-details">
          <div class="save-detail"><span>Fundador</span><strong>${founderName}</strong></div>
          <div class="save-detail"><span>País</span><strong>${country}</strong></div>
          <div class="save-detail"><span>Último guardado</span><strong>${date}</strong></div>
          <div class="save-detail"><span>Versión</span><strong>${version}</strong></div>
        </div>
        ${isPendingDelete ? `
          <div class="delete-confirmation"><p>¿Eliminar definitivamente <strong>${foundationName}</strong>?</p><div class="delete-confirmation-actions"><button class="confirm-delete-button" type="button" data-confirm-delete-id="${historyId}">Confirmar eliminación</button><button class="cancel-delete-button" type="button" data-cancel-delete>Cancelar</button></div></div>
        ` : `
          <div class="save-card-actions"><button class="continue-save-button" type="button" data-history-id="${historyId}">${isCurrent ? 'Continuar partida' : 'Seleccionar y continuar'}</button><button class="delete-save-button" type="button" data-delete-history-id="${historyId}">Eliminar</button></div>
        `}
      </article>`;
  }).join('');

  savedHistoriesContainer.querySelectorAll('[data-history-id]').forEach((button) => button.addEventListener('click', () => selectHistory(button.dataset.historyId)));
  savedHistoriesContainer.querySelectorAll('[data-delete-history-id]').forEach((button) => button.addEventListener('click', () => requestDeleteHistory(button.dataset.deleteHistoryId)));
  savedHistoriesContainer.querySelectorAll('[data-confirm-delete-id]').forEach((button) => button.addEventListener('click', () => deleteHistory(button.dataset.confirmDeleteId)));
  savedHistoriesContainer.querySelectorAll('[data-cancel-delete]').forEach((button) => button.addEventListener('click', cancelDeleteHistory));
}

navigationButtons.forEach((button) => button.addEventListener('click', () => showScreen(button.dataset.screen)));

if (dreamContinueButton) {
  dreamContinueButton.addEventListener('click', () => {
    updateCurrentIntroScene(2);
    showScreen('foundationStage');
  });
}

if (foundationContinueButton) {
  foundationContinueButton.addEventListener('click', () => {
    showScreen('mainMenu');
  });
}

if (newHistoryForm) {
  newHistoryForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const foundationName = document.getElementById('foundationName').value.trim();
    const founderName = document.getElementById('founderName').value.trim();

    if (!foundationName || !founderName) {
      historyMessage.textContent = 'Completa los dos campos para crear tu historia.';
      return;
    }

    if (foundationNameExists(foundationName)) {
      historyMessage.textContent = 'Ya existe una partida con ese nombre de fundación. Elige otro nombre.';
      return;
    }

    const createdAt = new Date().toISOString();
    const newHistory = {
      id: `lhdf-${Date.now()}`,
      foundationName,
      founderName,
      country: 'Guatemala',
      createdAt,
      updatedAt: createdAt,
      version: GAME_VERSION,
      introCompleted: false,
      introScene: 1
    };

    try {
      saveHistory(newHistory);
      historyMessage.textContent = `Fundación “${foundationName}” guardada correctamente.`;
      newHistoryForm.reset();
      renderSavedHistories();
      window.setTimeout(() => showScreen('introStage'), 260);
    } catch (error) {
      console.error('No se pudo guardar la historia:', error);
      historyMessage.textContent = 'No se pudo guardar la historia en este navegador.';
    }
  });
}
