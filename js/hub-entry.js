// Enrutador del Hub para Alpha 3.1.
(() => {
  function loadScript(src, onload) {
    const script = document.createElement('script');
    script.src = src;
    if (onload) script.addEventListener('load', onload);
    document.body.appendChild(script);
  }

  loadScript('js/game-data.js?v=3.1.0', () => {
    loadScript('js/hub.js?v=3.1.1', () => {
      loadScript('js/clubs.js?v=3.1.0');
      loadScript('js/countries.js?v=3.1.0');
      loadScript('js/players.js?v=3.1.0', () => {
        loadScript('js/hub-modules.js?v=3.1.0');
      });

      // En Alpha 3.1, una historia que ya terminó la introducción entra al Hub.
      openHistory = function (history) {
        const histories = loadHistories();
        const storedHistory = histories.find((item) => item.id === history.id);
        if (!storedHistory) return;

        storedHistory.updatedAt = new Date().toISOString();
        writeHistories(histories);
        localStorage.setItem(CURRENT_HISTORY_KEY, storedHistory.id);
        renderSavedHistories();

        if (storedHistory.introCompleted === true) {
          window.showHub();
          return;
        }

        showScreen('introStage');
      };

      // La última escena de la introducción ahora termina directamente en el Hub.
      document.addEventListener('click', (event) => {
        const button = event.target.closest('#futureContinueButton');
        if (!button) return;

        event.preventDefault();
        event.stopImmediatePropagation();

        try {
          const histories = JSON.parse(localStorage.getItem('lhdf.histories') || '[]');
          const id = localStorage.getItem('lhdf.currentHistoryId');
          const history = histories.find((item) => item.id === id);

          if (history) {
            history.introScene = 7;
            history.introCompleted = true;
            history.version = 'Alpha 3.1';
            history.updatedAt = new Date().toISOString();
            localStorage.setItem('lhdf.histories', JSON.stringify(histories));
            if (typeof renderSavedHistories === 'function') renderSavedHistories();
          }
        } catch (error) {
          console.error('No se pudo cerrar la introducción antes de entrar al Hub:', error);
        }

        window.showHub();
      }, true);
    });
  });
})();
