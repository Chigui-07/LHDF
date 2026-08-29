const fade = document.getElementById('screenFade');
const screens = [...document.querySelectorAll('.screen')];
const navigationButtons = [...document.querySelectorAll('[data-screen]')];
const newHistoryForm = document.getElementById('newHistoryForm');
const historyMessage = document.getElementById('historyMessage');

const TRANSITION_TIME = 480;

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

navigationButtons.forEach((button) => {
  button.addEventListener('click', () => {
    showScreen(button.dataset.screen);
  });
});

if (newHistoryForm) {
  newHistoryForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const historyName = document.getElementById('historyName').value.trim();
    const managerName = document.getElementById('managerName').value.trim();
    const startingCountry = document.getElementById('startingCountry').value;
    const startingTeam = document.getElementById('startingTeam').value.trim();

    if (!historyName || !managerName || !startingCountry || !startingTeam) {
      historyMessage.textContent = 'Completa todos los campos para crear la historia.';
      return;
    }

    const newHistory = {
      historyName,
      managerName,
      startingCountry,
      startingTeam
    };

    console.log('Nueva historia preparada:', newHistory);
    historyMessage.textContent = `Historia “${historyName}” preparada. El guardado se añadirá en el siguiente sistema.`;
  });
}
