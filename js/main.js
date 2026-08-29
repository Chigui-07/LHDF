const fade = document.getElementById('screenFade');
const screens = [...document.querySelectorAll('.screen')];
const navigationButtons = [...document.querySelectorAll('[data-screen]')];

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
