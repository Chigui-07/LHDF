(() => {
  const shell = document.querySelector('.game-shell');
  if (!shell || document.getElementById('countriesStage')) return;

  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = 'css/countries.css?v=3.1.0';
  document.head.appendChild(style);

  const stage = document.createElement('section');
  stage.id = 'countriesStage';
  stage.className = 'screen secondary-screen countries-scene';
  stage.innerHTML = `
    <div class="countries-shell">
      <header class="countries-header">
        <div>
          <p class="eyebrow">MUNDO DEL FÚTBOL</p>
          <h2>Países</h2>
          <p>Los clubes y jugadores pertenecen a un país dentro de tu historia.</p>
        </div>
        <button id="countriesBackButton" class="countries-back" type="button">← Volver al Hub</button>
      </header>
      <div id="countriesGrid" class="countries-grid"></div>
      <div class="countries-note">Nuevos países se añadirán y descubrirán conforme crezca el mundo de LHDF.</div>
    </div>`;
  shell.appendChild(stage);

  const grid = document.getElementById('countriesGrid');

  function renderCountries() {
    const countries = window.LHDF_DATA?.countries || [];
    grid.innerHTML = countries.map((country) => `
      <button class="country-card is-discovered" type="button" data-country-id="${country.id}">
        <div class="country-code">${country.code}</div>
        <div>
          <small>País descubierto</small>
          <strong>${country.name}</strong>
          <span>Clubes y jugadores disponibles en esta nación.</span>
        </div>
      </button>`).join('');
  }

  window.showCountries = function () {
    renderCountries();
    fade.classList.add('is-visible');
    window.setTimeout(() => {
      document.querySelectorAll('.screen.active').forEach((screen) => screen.classList.remove('active'));
      stage.classList.add('active');
      requestAnimationFrame(() => fade.classList.remove('is-visible'));
    }, typeof TRANSITION_TIME === 'number' ? TRANSITION_TIME : 480);
  };

  document.getElementById('countriesBackButton').addEventListener('click', () => window.showHub?.());
})();
