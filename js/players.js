(() => {
  const shell = document.querySelector('.game-shell');
  if (!shell || document.getElementById('playersStage')) return;

  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = 'css/players.css?v=3.1.0';
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
          <p>Cada jugador estará relacionado con un país y un club.</p>
        </div>
        <button id="playersBackButton" class="players-back" type="button">← Volver al Hub</button>
      </header>

      <section class="players-filters">
        <label>País
          <select id="playersCountryFilter"></select>
        </label>
        <label>Club
          <select id="playersClubFilter"></select>
        </label>
      </section>

      <div id="playersGrid" class="players-grid"></div>
    </div>`;
  shell.appendChild(stage);

  const countryFilter = document.getElementById('playersCountryFilter');
  const clubFilter = document.getElementById('playersClubFilter');
  const grid = document.getElementById('playersGrid');

  function getHistory() {
    try {
      const histories = JSON.parse(localStorage.getItem('lhdf.histories') || '[]');
      const id = localStorage.getItem('lhdf.currentHistoryId');
      return histories.find((item) => item.id === id) || null;
    } catch (error) {
      return null;
    }
  }

  function renderFilters() {
    const data = window.LHDF_DATA || { countries: [], clubs: [] };
    const history = getHistory();
    const countries = data.countries.filter((country) => country.discovered !== false);
    countryFilter.innerHTML = countries.map((country) => `<option value="${country.id}">${country.name}</option>`).join('');

    const selectedCountry = countryFilter.value || countries[0]?.id || 'guatemala';
    const clubs = data.clubs.filter((club) => club.countryId === selectedCountry && (!history || club.id === history.selectedClub));
    clubFilter.innerHTML = `<option value="">Todos los clubes disponibles</option>` + clubs.map((club) => `<option value="${club.id}">${club.name}</option>`).join('');
  }

  function renderPlayers() {
    const players = window.LHDF_DATA?.players || [];
    const countryId = countryFilter.value;
    const clubId = clubFilter.value;
    const visible = players.filter((player) => (!countryId || player.countryId === countryId) && (!clubId || player.clubId === clubId));

    if (!visible.length) {
      grid.innerHTML = `
        <div class="players-empty">
          <div class="players-empty-icon">?</div>
          <h3>Aún no hay jugadores registrados</h3>
          <p>La estructura ya está preparada. Aquí aparecerán los jugadores reales cuando carguemos las plantillas de Guatemala.</p>
        </div>`;
      return;
    }

    grid.innerHTML = visible.map((player) => `
      <article class="player-card">
        <strong>${player.name}</strong>
        <span>${player.position || 'Posición por definir'}</span>
      </article>`).join('');
  }

  function refresh() {
    renderFilters();
    renderPlayers();
  }

  countryFilter.addEventListener('change', () => { renderFilters(); renderPlayers(); });
  clubFilter.addEventListener('change', renderPlayers);

  window.showPlayers = function () {
    refresh();
    fade.classList.add('is-visible');
    window.setTimeout(() => {
      document.querySelectorAll('.screen.active').forEach((screen) => screen.classList.remove('active'));
      stage.classList.add('active');
      requestAnimationFrame(() => fade.classList.remove('is-visible'));
    }, typeof TRANSITION_TIME === 'number' ? TRANSITION_TIME : 480);
  };

  document.getElementById('playersBackButton').addEventListener('click', () => window.showHub?.());
})();
