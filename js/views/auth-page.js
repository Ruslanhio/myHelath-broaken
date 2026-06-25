import { loadAuthContent } from './page-loader.js';
import { State } from '../state.js';
import { navigate } from '../router.js';
import { initLoginForm } from '../auth/login-form.js';

export function renderAuthPage(container, route) {
  const html = loadAuthContent(route.page.file, route.page.selector || '.auth');
  container.innerHTML = html;

  if (route.page.file === 'auth/login.html') {
    initLoginForm({ mode: 'spa', navigate });
  }
  if (route.page.file === 'register.html' || route.page.file === 'register-doctor.html') {
    initRegisterRole(route.page.file);
    if (window.UI) window.UI.init();
  }
  if (route.page.file === 'register-success.html') {
    initRegisterSuccess();
  }
  if (route.page.file === 'password.html') {
    initPasswordForm();
  }
  if (route.page.file === '404.html') {
    const btn = container.querySelector('a.btn');
    if (btn) {
      btn.href = State.isAuthenticated() ? State.homeRoute() : '#/login';
      btn.setAttribute('data-nav', '');
    }
  }
}

function initRegisterRole(file) {
  const toggle = document.getElementById('register-role-toggle');
  if (!toggle) return;
  const isDoctorPage = file.includes('register-doctor');

  toggle.addEventListener('rolechange', (e) => {
    const role = e.detail.role;
    if (role === 'doctor' && !isDoctorPage) navigate('#/register/doctor');
    if (role === 'patient' && isDoctorPage) navigate('#/register');
  });

  document.querySelectorAll('#register-form, #register-doctor-form').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const isDoctor = form.id === 'register-doctor-form';
      navigate(`#/register/success?role=${isDoctor ? 'doctor' : 'patient'}`);
    });
  });
}

function initRegisterSuccess() {
  const loginBtn = document.getElementById('register-success-login');
  if (!loginBtn) return;
  const q = location.hash.split('?')[1] || '';
  const role = new URLSearchParams(q).get('role');
  loginBtn.href = role === 'doctor' ? '#/login?role=doctor' : '#/login';
  loginBtn.setAttribute('data-nav', '');
}

function initPasswordForm() {
  const form = document.getElementById('password-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    window.UI?.toast('Ссылка для восстановления отправлена на email', 'success');
    navigate('#/login');
  });
}
