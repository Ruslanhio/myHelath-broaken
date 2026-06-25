import { initRouter } from './router.js';
import { initTheme } from './theme.js';

initTheme();

document.addEventListener('DOMContentLoaded', () => {
  initRouter();
});
