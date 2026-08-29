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

    const foundationName = document.getElementById('foundationName').value.trim();
    const founderName = document.getElementById('founderName').value.trim();

    if (!foundationName || !founderName) {
      historyMessage.textContent = 'Completa los dos campos para crear tu historia.';
      return;
    }

    const newHistory = {
      foundationName,
      founderName,
      country: 'Guatemala'
    };

    console.log('Nueva historia preparada:', newHistory);
    historyMessage.textContent = `Fundación “${foundationName}” preparada. El siguiente paso será crear el sistema de guardado.`;
  });
}
