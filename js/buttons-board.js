/**
 * Витрина buttons.html: data-state-toggle для демо-состояний.
 * Копируйте разметку из [data-uikit-copy], не обёртки component-set.
 */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.buttons-board .sidebar__link[href]:not([data-state-toggle])').forEach((link) => {
    link.setAttribute('data-state-toggle', '');
  });

  window.UI?.init();
});
