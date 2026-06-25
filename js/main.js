/**
 * MyHealth — интерактив для legacy HTML-страниц (register, terms, 404).
 * Навигация в кабинет — только через index.html#/… (SPA).
 */
const App = {
  init() {
    UI.init();
    this.initLoginRole();
    this.initRegisterRole();
    this.initRegisterSuccess();
    this.initForms();
  },

  initRegisterSuccess() {
    const loginBtn = document.getElementById('register-success-login');
    if (!loginBtn) return;
    const role = new URLSearchParams(window.location.search).get('role');
    loginBtn.href = role === 'doctor' ? 'index.html#/login?role=doctor' : 'index.html#/login';
  },

  initLoginRole() {
    const toggle = document.getElementById('login-role-toggle');
    const form = document.getElementById('login-form');
    if (!toggle || !form) return;

    const registerLink = document.getElementById('register-link');

    const setRole = (role) => {
      toggle.querySelectorAll('[data-role]').forEach((btn) => {
        btn.classList.toggle('role-toggle__btn--active', btn.dataset.role === role);
      });
      if (registerLink) {
        registerLink.href = role === 'doctor' ? 'register-doctor.html' : 'register.html';
      }
    };

    toggle.addEventListener('rolechange', (e) => setRole(e.detail.role));

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      window.location.href = 'index.html#/login';
    });

    form.action = '#';
    form.method = 'post';

    const roleParam = new URLSearchParams(window.location.search).get('role');
    if (roleParam === 'doctor' || roleParam === 'patient') {
      setRole(roleParam);
    } else {
      const active = toggle.querySelector('.role-toggle__btn--active');
      if (active) setRole(active.dataset.role);
    }
  },

  initRegisterRole() {
    const toggle = document.getElementById('register-role-toggle');
    if (!toggle) return;

    const isDoctorPage = document.getElementById('register-doctor-form');

    toggle.addEventListener('rolechange', (e) => {
      const role = e.detail.role;
      if (role === 'doctor' && !isDoctorPage) {
        window.location.href = 'register-doctor.html';
      }
      if (role === 'patient' && isDoctorPage) {
        window.location.href = 'register.html';
      }
    });
  },

  initForms() {
    document.addEventListener('submit', (e) => {
      if (e.target.id === 'password-form') {
        e.preventDefault();
        UI.toast('Ссылка для восстановления отправлена на email', 'success');
        window.location.href = 'index.html#/login';
      }

      if (e.target.id === 'chat-form') {
        e.preventDefault();
        const input = document.getElementById('chat-input');
        const messages = document.getElementById('chat-messages');
        if (!input?.value.trim() || !messages) return;

        const question = input.value.trim();
        messages.insertAdjacentHTML('beforeend', `
          <article class="chat__message chat__message--user"><p class="text">${question}</p></article>
        `);
        input.value = '';
        messages.scrollTop = messages.scrollHeight;

        setTimeout(() => {
          messages.insertAdjacentHTML('beforeend', `
            <article class="chat__message chat__message--bot"><p class="text">${App.getAiReply(question)}</p></article>
          `);
          messages.scrollTop = messages.scrollHeight;
        }, 800);
      }
    });
  },

  getAiReply(question) {
    const q = question.toLowerCase();
    if (q.includes('анализ') || q.includes('кров')) {
      return 'Ваш последний общий анализ крови от 05.05.2026 в норме. Гемоглобин — 135 г/л, лейкоциты — 6.2×10⁹/л. Для детальной расшифровки рекомендую обратиться к терапевту.';
    }
    if (q.includes('запис') || q.includes('врач') || q.includes('приём')) {
      return 'У вас 2 предстоящих визита: к педиатру 25.05 и к кардиологу 04.06. Хотите записаться на новый приём? Перейдите в раздел «Записи».';
    }
    if (q.includes('документ') || q.includes('загруз')) {
      return 'Чтобы загрузить документ, нажмите «Загрузить документ» на главной или в разделе «Документы». Поддерживаются форматы PDF, JPG и PNG до 10 МБ.';
    }
    return 'Спасибо за вопрос! Я могу помочь с анализами, записями к врачам и навигацией по сервису. Уточните, пожалуйста, что именно вас интересует.';
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());

window.App = App;
