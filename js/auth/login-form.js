import { login } from '../api.js';
import { State } from '../state.js';

/**
 * Инициализация формы входа (SPA и standalone auth/login.html).
 * @param {{ mode?: 'spa' | 'standalone', navigate?: (hash: string) => void }} options
 */
export function initLoginForm(options = {}) {
  const { mode = 'spa', navigate } = options;
  const toggle = document.getElementById('login-role-toggle');
  const form = document.getElementById('login-form');
  if (!form) return;

  let currentRole = 'patient';
  const registerLink = document.getElementById('register-link');

  const registerHref = (role) => {
    if (mode === 'standalone') {
      return role === 'doctor' ? '../register-doctor.html' : '../register.html';
    }
    return role === 'doctor' ? '#/register/doctor' : '#/register';
  };

  const homeHref = (role) => {
    const hash = role === 'doctor' ? '#/doctor/home' : '#/patient/home';
    if (mode === 'standalone') {
      return `../index.html${hash}`;
    }
    return hash;
  };

  const setRole = (role) => {
    currentRole = role;
    toggle?.querySelectorAll('[data-role]').forEach((btn) => {
      btn.classList.toggle('role-toggle__btn--active', btn.dataset.role === role);
    });
    if (registerLink) {
      registerLink.href = registerHref(role);
      if (mode === 'spa') registerLink.setAttribute('data-nav', '');
      else registerLink.removeAttribute('data-nav');
    }
  };

  toggle?.addEventListener('rolechange', (e) => setRole(e.detail.role));

  const roleParam =
    mode === 'spa'
      ? new URLSearchParams(location.hash.split('?')[1] || '').get('role')
      : new URLSearchParams(location.search).get('role');

  if (roleParam === 'doctor' || roleParam === 'patient') {
    setRole(roleParam);
  } else {
    const active = toggle?.querySelector('.role-toggle__btn--active');
    setRole(active?.dataset.role || 'patient');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.querySelector('[name="email"], #email')?.value;
    const password = form.querySelector('[name="password"], #password')?.value;
    try {
      const { user, role } = await login(email, password, currentRole);
      State.login(role, user);
      const target = homeHref(role);
      if (mode === 'spa' && navigate) {
        navigate(target);
      } else {
        window.location.href = target;
      }
    } catch (err) {
      window.UI?.toast(err.message || 'Ошибка входа', 'error');
    }
  });
}

/** Ссылки #/… → index.html#/… для открытия auth/login.html напрямую */
export function fixStandaloneAuthLinks() {
  document.querySelectorAll('a[href^="#/"]').forEach((a) => {
    const hash = a.getAttribute('href');
    a.setAttribute('href', `../index.html${hash}`);
    a.removeAttribute('data-nav');
  });
}
