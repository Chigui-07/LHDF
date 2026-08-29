const fade = document.getElementById('screenFade');
const screens = [...document.querySelectorAll('.screen')];
const navigationButtons = [...document.querySelectorAll('[data-screen]')];
const newHistoryForm = document.getElementById('newHistoryForm');
const historyMessage = document.getElementById('historyMessage');

const TRANSITION_TIME = 480;
const SAVE_KEY = 'lhdf.histories';
const CURRENT_HISTORY_KEY = 'lhdf.currentHistoryId';
const GAME_VERSION = 'Alpha 1.1';

window.addEventListener('load', () => {
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

    requestAnimationFrame(() => {
      fade.classList.remove('is-visible');
    });
  }, TRANSITION_TIME);
}

function loadHistories() {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('No se pudieron leer las partidas guardadas:', error);
    return [];
  }
}

function saveHistory(history) {
  const histories = loadHistories();
  histories.push(history);

  localStorage.setItem(SAVE_KEY, JSON.stringify(histories));
  localStorage.setItem(CURRENT_HISTORY_KEY, history.id);
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
    } catch (error) {
      console.error('No se pudo guardar la historia:', error);
      historyMessage.textContent = 'No se pudo guardar la historia en este navegador.';
    }
  });
}
