(() => {
  let ready = false;
  let failed = false;

  function hideLoader() {
    const loader = document.getElementById('loading-overlay');
    if (loader) {
      loader.classList.add('fade-out');
      loader.style.display = 'none';
    }
  }

  function showFailure() {
    hideLoader();
    const panel = document.getElementById('startup-error');
    if (panel) panel.hidden = false;
  }

  function fail(error, stage = 'Initialization failed') {
    if (ready || failed) return;
    failed = true;
    clearTimeout(watchdog);
    console.error(`[Midnight Delivery] ${stage}`, error);
    showFailure();
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showFailure, { once: true });
  }

  const watchdog = setTimeout(() => fail(new Error('Startup exceeded 8 seconds'), 'Startup timeout'), 8000);

  window.midnightStartup = {
    fail,
    complete() {
      ready = true;
      failed = false;
      clearTimeout(watchdog);
      hideLoader();
      const panel = document.getElementById('startup-error');
      if (panel) panel.hidden = true;
    },
    optional(stage, initialize) {
      try {
        initialize();
      } catch (error) {
        console.error(`[Midnight Delivery] Optional startup helper failed: ${stage}`, error);
      }
    }
  };

  window.addEventListener('error', event => {
    if (event.target instanceof HTMLScriptElement) {
      fail(new Error(`Could not load ${event.target.src}`), 'Script load failed');
    } else if (event.error || event.message) {
      fail(event.error || new Error(event.message), `${event.filename || 'Startup'}:${event.lineno || 0}`);
    }
  }, true);
  window.addEventListener('unhandledrejection', event => fail(event.reason, 'Unhandled startup rejection'));
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-startup-retry')?.addEventListener('click', () => location.reload());
    if (failed) showFailure();
  }, { once: true });
})();
