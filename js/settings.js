(() => {
  const SETTINGS_KEY = 'lhdf.settings';
  const DEFAULTS = {
    animations: true,
    transitionSpeed: 'normal',
    interfaceScale: '100'
  };

  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = 'css/settings.css?v=3.1.0';
  document.head.appendChild(style);

  const compatibilityStyle = document.createElement('style');
  compatibilityStyle.textContent = `
    body.lhdf-no-animations *,
    body.lhdf-no-animations *::before,
    body.lhdf-no-animations *::after {
      animation-duration: .01ms !important;
      animation-delay: 0ms !important;
      transition-duration: .01ms !important;
    }
    body.lhdf-fast-transitions .screen-fade { transition-duration: 180ms !important; }
  `;
  document.head.appendChild(compatibilityStyle);

  const settingsScreen = document.getElementById('settings');
  if (!settingsScreen) return;

  settingsScreen.classList.add('settings-screen');
  settingsScreen.innerHTML = `
    <div class="settings-layout">
      <header class="settings-heading">
        <p class="eyebrow">ALPHA 3.1</p>
        <h2>Configuraciones</h2>
        <p>Personaliza cómo se ve y se siente La Historia del Fútbol en este navegador.</p>
      </header>

      <div class="settings-grid">
        <article class="setting-card">
          <div class="setting-copy">
            <strong>Pantalla completa</strong>
            <small>Activa o abandona el modo de pantalla completa del navegador.</small>
          </div>
          <button id="fullscreenSetting" class="setting-toggle" type="button" role="switch" aria-checked="false" aria-label="Pantalla completa"></button>
        </article>

        <article class="setting-card">
          <div class="setting-copy">
            <strong>Animaciones</strong>
            <small>Permite las animaciones visuales del menú, transiciones e introducción.</small>
          </div>
          <button id="animationsSetting" class="setting-toggle" type="button" role="switch" aria-checked="true" aria-label="Animaciones"></button>
        </article>

        <article class="setting-card">
          <div class="setting-copy">
            <strong>Velocidad de transición</strong>
            <small>Controla qué tan rápido cambia el juego entre una pantalla y otra.</small>
          </div>
          <select id="transitionSetting" class="setting-select" aria-label="Velocidad de transición">
            <option value="normal">Normal</option>
            <option value="fast">Rápida</option>
          </select>
        </article>

        <article class="setting-card">
          <div class="setting-copy">
            <strong>Tamaño de interfaz</strong>
            <small>Ajusta textos y controles sin cambiar el zoom completo del navegador.</small>
          </div>
          <select id="scaleSetting" class="setting-select" aria-label="Tamaño de interfaz">
            <option value="90">90%</option>
            <option value="100">100%</option>
            <option value="110">110%</option>
          </select>
        </article>
      </div>

      <div id="settingsStatus" class="settings-status" aria-live="polite"></div>

      <div class="settings-actions">
        <button class="back-button" type="button" data-screen="mainMenu">← Volver al menú</button>
        <button id="settingsReset" class="settings-reset-button" type="button">Restablecer configuraciones</button>
      </div>
    </div>`;

  const fullscreenButton = document.getElementById('fullscreenSetting');
  const animationsButton = document.getElementById('animationsSetting');
  const transitionSelect = document.getElementById('transitionSetting');
  const scaleSelect = document.getElementById('scaleSetting');
  const resetButton = document.getElementById('settingsReset');
  const status = document.getElementById('settingsStatus');

  function loadSettings() {
    try {
      return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') };
    } catch (error) {
      return { ...DEFAULTS };
    }
  }

  let settings = loadSettings();

  function saveSettings(message = 'Configuración guardada.') {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    applySettings();
    status.textContent = message;
    window.setTimeout(() => {
      if (status.textContent === message) status.textContent = '';
    }, 1800);
  }

  function applySettings() {
    animationsButton.setAttribute('aria-checked', String(settings.animations));
    transitionSelect.value = settings.transitionSpeed;
    scaleSelect.value = settings.interfaceScale;

    document.body.classList.toggle('lhdf-no-animations', !settings.animations);
    document.body.classList.toggle('lhdf-fast-transitions', settings.transitionSpeed === 'fast');
    document.documentElement.style.fontSize = `${Number(settings.interfaceScale) / 100 * 16}px`;
  }

  function syncFullscreen() {
    fullscreenButton.setAttribute('aria-checked', String(Boolean(document.fullscreenElement)));
  }

  fullscreenButton.addEventListener('click', async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        status.textContent = 'Pantalla completa activada.';
      } else {
        await document.exitFullscreen();
        status.textContent = 'Pantalla completa desactivada.';
      }
    } catch (error) {
      status.textContent = 'El navegador no permitió cambiar a pantalla completa.';
    }
  });

  document.addEventListener('fullscreenchange', syncFullscreen);

  animationsButton.addEventListener('click', () => {
    settings.animations = !settings.animations;
    saveSettings(settings.animations ? 'Animaciones activadas.' : 'Animaciones reducidas.');
  });

  transitionSelect.addEventListener('change', () => {
    settings.transitionSpeed = transitionSelect.value;
    saveSettings('Velocidad de transición actualizada.');
  });

  scaleSelect.addEventListener('change', () => {
    settings.interfaceScale = scaleSelect.value;
    saveSettings('Tamaño de interfaz actualizado.');
  });

  resetButton.addEventListener('click', () => {
    settings = { ...DEFAULTS };
    saveSettings('Configuraciones restablecidas.');
  });

  settingsScreen.querySelector('[data-screen="mainMenu"]').addEventListener('click', () => showScreen('mainMenu'));

  document.querySelectorAll('.footer-version').forEach((element) => {
    element.textContent = 'Alpha 3.1';
  });

  // Las historias creadas durante Alpha 3.1 quedan identificadas con esta versión.
  const newHistoryForm = document.getElementById('newHistoryForm');
  if (newHistoryForm) {
    newHistoryForm.addEventListener('submit', () => {
      window.setTimeout(() => {
        try {
          const histories = JSON.parse(localStorage.getItem('lhdf.histories') || '[]');
          const id = localStorage.getItem('lhdf.currentHistoryId');
          const history = histories.find((item) => item.id === id);
          if (!history) return;
          history.version = 'Alpha 3.1';
          localStorage.setItem('lhdf.histories', JSON.stringify(histories));
          if (typeof renderSavedHistories === 'function') renderSavedHistories();
        } catch (error) {
          console.error('No se pudo actualizar la versión de la historia:', error);
        }
      }, 400);
    }, true);
  }

  applySettings();
  syncFullscreen();
})();
