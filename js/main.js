const fade = document.getElementById('screenFade');
const screens = [...document.querySelectorAll('.screen')];
const navigationButtons = [...document.querySelectorAll('[data-screen]')];
const newHistoryForm = document.getElementById('newHistoryForm');
const historyMessage = document.getElementById('historyMessage');
const savedHistoriesContainer = document.getElementById('savedHistories');
const continueMessage = document.getElementById('continueMessage');

const TRANSITION_TIME = 480;
const SAVE_KEY = 'lhdf.histories';
const CURRENT_HISTORY_KEY = 'lhdf.currentHistoryId';
const GAME_VERSION = 'Alpha 1.1';

window.addEventListener('load', () => {
  renderSavedHistories();

  requestAnimationFrame(() => {
    fade.classList.remove('is-visible');
  });
});

function showScreen(screenId) {
  const target = document.getElementById(screenId);

  if (!target || target.classList.contains('active')) {
    return;
  }

  fade.classList.add('is-visible');

  window.setTimeout(() => {
    screens.forEach((screen) => screen.classList.remove('active'));
    target.classList.add('active');

    if (screenId === 'continueGame') {
      renderSavedHistories();
    }

    requestAnimationFrame(() => {
      fade.classList.remove('is-visible');
    });
  }, TRANSITION_TIME);
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

function saveHistory(history) {
  const histories = loadHistories();
  histories.push(history);
  writeHistories(histories);
  localStorage.setItem(CURRENT_HISTORY_KEY, history.id);
}

function formatSaveDate(dateValue) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return 'Sin fecha';
  }

  return new Intl.DateTimeFormat('es-GT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
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

function selectHistory(historyId) {
  const histories = loadHistories();
  const selectedHistory = histories.find((history) => history.id === historyId);

  if (!selectedHistory) {
    if (continueMessage) {
      continueMessage.textContent = 'No se pudo encontrar esa historia guardada.';
    }
    return;
  }

  selectedHistory.updatedAt = new Date().toISOString();
  writeHistories(histories);
  localStorage.setItem(CURRENT_HISTORY_KEY, selectedHistory.id);

  if (continueMessage) {
    continueMessage.textContent = `“${selectedHistory.foundationName}” quedó seleccionada como partida activa.`;
  }

  renderSavedHistories();
}

function renderSavedHistories() {
  if (!savedHistoriesContainer) {
    return;
  }

  const histories = loadHistories().sort((a, b) => {
    return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
  });
  const currentHistoryId = localStorage.getItem(CURRENT_HISTORY_KEY);

  if (histories.length === 0) {
    savedHistoriesContainer.innerHTML = `
      <div class="empty-histories">
        <strong>No hay historias guardadas</strong>
        <span>Crea una nueva fundación desde el menú principal para comenzar.</span>
      </div>
    `;

    if (continueMessage) {
      continueMessage.textContent = '';
    }
    return;
  }

  savedHistoriesContainer.innerHTML = histories.map((history) => {
    const isCurrent = history.id === currentHistoryId;
    const foundationName = escapeHtml(history.foundationName || 'Fundación sin nombre');
    const founderName = escapeHtml(history.founderName || 'Sin fundador');
    const country = escapeHtml(history.country || 'Guatemala');
    const version = escapeHtml(history.version || 'Desconocida');
    const date = formatSaveDate(history.updatedAt || history.createdAt);

    return `
      <article class="saved-history-card${isCurrent ? ' is-current' : ''}">
        <div class="save-card-top">
          <h3>${foundationName}</h3>
          ${isCurrent ? '<span class="current-badge">Activa</span>' : ''}
        </div>

        <div class="save-details">
          <div class="save-detail"><span>Fundador</span><strong>${founderName}</strong></div>
          <div class="save-detail"><span>País</span><strong>${country}</strong></div>
          <div class="save-detail"><span>Último guardado</span><strong>${date}</strong></div>
          <div class="save-detail"><span>Versión</span><strong>${version}</strong></div>
        </div>

        <button class="continue-save-button" type="button" data-history-id="${escapeHtml(history.id)}">
          ${isCurrent ? 'Continuar partida' : 'Seleccionar y continuar'}
        </button>
      </article>
    `;
  }).join('');

  savedHistoriesContainer.querySelectorAll('[data-history-id]').forEach((button) => {
    button.addEventListener('click', () => {
      selectHistory(button.dataset.historyId);
    });
  });
}

navigationButtons.forEach((button) => {
  button.addEventListener('click', () => {
    showScreen(button.dataset.screen);
  });
});

if (newHistoryForm) {
  newHistoryForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const foundationName = document.getElementById('foundationName').value.trim();
    const founderName = document.getElementById('founderName').value.trim();

    if (!foundationName || !founderName) {
      historyMessage.textContent = 'Completa los dos campos para crear tu historia.';
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
      introCompleted: false
    };

    try {
      saveHistory(newHistory);
      historyMessage.textContent = `Fundación “${foundationName}” guardada correctamente.`;
      newHistoryForm.reset();
      renderSavedHistories();
    } catch (error) {
      console.error('No se pudo guardar la historia:', error);
      historyMessage.textContent = 'No se pudo guardar la historia en este navegador.';
    }
  });
}
