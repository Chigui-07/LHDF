// Alpha 3.1 — Conexión de módulos disponibles del Hub.
(() => {
  const style = document.createElement('style');
  style.textContent = `
    @media (min-width: 901px) {
      .hub-modules { grid-template-columns: repeat(3, minmax(170px, 1fr)) !important; }
      .hub-module { min-height: 118px !important; }
    }
  `;
  document.head.appendChild(style);

  function findModule(name) {
    return [...document.querySelectorAll('.hub-module')].find((module) => module.querySelector('strong')?.textContent.trim() === name) || null;
  }

  const clubs = findModule('Clubes');
  if (clubs) {
    clubs.querySelector('em').textContent = 'Disponible';
    clubs.querySelector('span').textContent = 'Tu club y los clubes que descubras.';
    clubs.style.cursor = 'pointer';
  }

  const players = findModule('Jugadores');
  if (players) {
    players.querySelector('em').textContent = 'Disponible';
    players.querySelector('span').textContent = 'Jugadores relacionados con país y club.';
    players.style.cursor = 'pointer';
    players.addEventListener('click', () => window.showPlayers?.());
  }

  const modules = document.querySelector('.hub-modules');
  if (modules && !findModule('Países')) {
    const countries = document.createElement('button');
    countries.className = 'hub-module';
    countries.type = 'button';
    countries.style.cursor = 'pointer';
    countries.innerHTML = '<em>Disponible</em><strong>Países</strong><span>Naciones, clubes y jugadores del mundo.</span>';
    countries.addEventListener('click', () => window.showCountries?.());
    modules.appendChild(countries);
  }
})();
