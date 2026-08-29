(() => {
  const shell = document.querySelector('.game-shell');
  if (!shell || document.getElementById('playersStage')) return;

  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = 'css/players.css?v=3.1.1';
  document.head.appendChild(style);

  const stage = document.createElement('section');
  stage.id = 'playersStage';
  stage.className = 'screen secondary-screen players-scene';
  stage.innerHTML = `
    <div class="players-shell">
      <header class="players-header">
        <div>
          <p class="eyebrow">REGISTRO DE JUGADORES</p>
          <h2>Jugadores</h2>
          <p>Los jugadores pertenecen a un país, pero todavía no tienen club dentro de esta historia.</p>
        </div>
        <button id="playersBackButton" class="players-back" type="button">← Volver al Hub</button>
      </header>

      <section class="players-filters">
        <label>País
          <select id="playersCountryFilter"></select>
        </label>
        <label>Posición
          <select id="playersPositionFilter">
            <option value="">Todas las posiciones</option>
            <option value="Portero">Porteros</option>
            <option value="Defensa">Defensas</option>
            <option value="Mediocampista">Mediocampistas</option>
            <option value="Delantero">Delanteros</option>
          </select>
        </label>
      </section>

      <div class="players-summary"><strong id="playersCount">0</strong> jugadores disponibles para esta nación.</div>
      <div id="playersGrid" class="players-grid"></div>
    </div>`;
  shell.appendChild(stage);

  const countryFilter = document.getElementById('playersCountryFilter');
  const positionFilter = document.getElementById('playersPositionFilter');
  const count = document.getElementById('playersCount');
  const grid = document.getElementById('playersGrid');

  function renderFilters(preferredCountry) {
    const data = window.LHDF_DATA || { countries: [] };
    const countries = data.countries.filter((country) => country.discovered !== false);
    countryFilter.innerHTML = countries.map((country) => `<option value="${country.id}">${country.name}</option>`).join('');
    if (preferredCountry && countries.some((country) => country.id === preferredCountry)) countryFilter.value = preferredCountry;
  }

  function renderPlayers() {
    const players = window.LHDF_DATA?.players || [];
    const countryId = countryFilter.value;
    const position = positionFilter.value;
    const visible = players.filter((player) => (!countryId || player.countryId === countryId) && (!position || player.position === position));

    count.textContent = String(visible.length);

    if (!visible.length) {
      grid.innerHTML = `
        <div class="players-empty">
          <div class="players-empty-icon">?</div>
          <h3>No hay jugadores disponibles</h3>
          <p>No encontramos jugadores de primer equipo que cumplan los filtros actuales.</p>
        </div>`;
      return;
    }

    grid.innerHTML = visible.map((player) => `
      <article class="player-card">
        <div class="player-card-top">
          <strong>${player.name}</strong>
          <small>${player.countryId === 'guatemala' ? 'GT' : player.countryId.toUpperCase()}</small>
        </div>
        <span>${player.position || 'Posición por definir'}</span>
        <em>Sin club en esta historia</em>
      </article>`).join('');
  }

  function refresh(preferredCountry) {
    renderFilters(preferredCountry);
    renderPlayers();
  }

  countryFilter.addEventListener('change', renderPlayers);
  positionFilter.addEventListener('change', renderPlayers);

  window.showPlayers = function (countryId = 'guatemala') {
    refresh(countryId);
    fade.classList.add('is-visible');
    window.setTimeout(() => {
      document.querySelectorAll('.screen.active').forEach((screen) => screen.classList.remove('active'));
      stage.classList.add('active');
      requestAnimationFrame(() => fade.classList.remove('is-visible'));
    }, typeof TRANSITION_TIME === 'number' ? TRANSITION_TIME : 480);
  };

  document.getElementById('playersBackButton').addEventListener('click', () => window.showHub?.());
})();
