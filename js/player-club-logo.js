// Alpha 3.1 — Escudo del club dentro de la ficha del jugador.
(() => {
  if (typeof window.showPlayerDetail !== 'function') return;
  const originalShowPlayerDetail = window.showPlayerDetail;
  const LOGO_BASE = 'assets/clubs/guatemala/';

  function clubLogoPath(file) {
    return `${LOGO_BASE}${encodeURIComponent(file).replaceAll('%2F', '/')}`;
  }

  function getCurrentHistory() {
    try {
      const histories = JSON.parse(localStorage.getItem('lhdf.histories') || '[]');
      const id = localStorage.getItem('lhdf.currentHistoryId');
      return histories.find((history) => history.id === id) || null;
    } catch (error) {
      return null;
    }
  }

  function decorateClub(playerId) {
    const target = document.getElementById('playerDetailClub');
    if (!target) return;
    const history = getCurrentHistory();
    const clubId = history?.playerStates?.[playerId]?.clubId;
    const club = window.LHDF_DATA?.clubs?.find((item) => item.id === clubId);
    if (!club) return;

    target.innerHTML = `<span style="display:inline-flex;align-items:center;gap:8px"><img src="${clubLogoPath(club.logo)}" alt="Escudo de ${club.name}" style="width:30px;height:30px;object-fit:contain">${club.name}</span>`;
  }

  window.showPlayerDetail = function (playerId) {
    originalShowPlayerDetail(playerId);
    window.setTimeout(() => decorateClub(playerId), (typeof TRANSITION_TIME === 'number' ? TRANSITION_TIME : 480) + 40);
  };
})();
