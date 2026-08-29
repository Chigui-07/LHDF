(() => {
  const shell = document.querySelector('.game-shell');
  if (!shell || document.getElementById('countriesStage')) return;

  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = 'css/countries.css?v=3.1.1';
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
          <p>Los jugadores se registran por su país y después construyen su historia de clubes dentro de LHDF.</p>
        </div>
        <button id="countriesBackButton" class="countries-back" type="button">← Volver al Hub</button>
      </header>
      <div id="countriesGrid" class="countries-grid"></div>
      <div class="countries-note">Selecciona Guatemala para abrir sus jugadores disponibles.</div>
    </div>`;
  shell.appendChild(stage);

  const grid = document.getElementById('countriesGrid');

  function renderCountries() {
    const countries = window.LHDF_DATA?.countries || [];
    const players = window.LHDF_DATA?.players || [];
    grid.innerHTML = countries.map((country) => {
      const totalPlayers = players.filter((player) => player.countryId === country.id).length;
      const mark = country.flag
        ? `<div class="country-flag-wrap"><img class="country-flag" src="${country.flag}" alt="Bandera de ${country.name}"></div>`
        : `<div class="country-code">${country.code}</div>`;
      return `
        <button class="country-card is-discovered" type="button" data-country-id="${country.id}">
          ${mark}
          <div>
            <small>País descubierto</small>
            <strong>${country.name}</strong>
            <span>${totalPlayers} jugadores disponibles · abrir registro</span>
          </div>
        </button>`;
    }).join('');
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

  grid.addEventListener('click', (event) => {
    const country = event.target.closest('[data-country-id]');
    if (!country || typeof window.showPlayers !== 'function') return;
    window.showPlayers(country.dataset.countryId);
  });

  document.getElementById('countriesBackButton').addEventListener('click', () => window.showHub?.());
})();
