import { initLoginForm, fixStandaloneAuthLinks } from './login-form.js';

document.addEventListener('DOMContentLoaded', () => {
  window.UI?.init();
  fixStandaloneAuthLinks();
  initLoginForm({ mode: 'standalone' });
});
