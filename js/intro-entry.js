// Control temporal de entrada a la introducción durante Alpha 2.1.
// Mientras la introducción no esté completada, siempre comienza desde la primera escena.

openHistory = function (history) {
  const histories = loadHistories();
  const storedHistory = histories.find((item) => item.id === history.id);

  if (!storedHistory) {
    return;
  }

  storedHistory.updatedAt = new Date().toISOString();
  writeHistories(histories);
  localStorage.setItem(CURRENT_HISTORY_KEY, storedHistory.id);
  renderSavedHistories();

  if (storedHistory.introCompleted === true) {
    // Destino provisional hasta que exista el hub real.
    showScreen('introStage');
    return;
  }

  // Una introducción sin completar siempre vuelve a comenzar desde El Sueño.
  showScreen('introStage');
};
