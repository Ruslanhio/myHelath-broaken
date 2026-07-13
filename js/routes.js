/**
 * Карта маршрутов: hash → метаданные и источник страницы
 * См. README.md для полной таблицы соответствия Figma-фреймам
 */

const patientNav = [
  { path: '/patient/home', label: 'Главная', icon: 'icon-home', group: 'cabinet' },
  { path: '/patient/documents', label: 'Документы', icon: 'icon-document', group: 'cabinet' },
  { path: '/patient/appointments', label: 'Записи', icon: 'icon-calendar', group: 'cabinet' },
  { path: '/patient/family', label: 'Семья', icon: 'icon-people', group: 'cabinet' },
  { path: '/patient/ai-assistant', label: 'ИИ-помощник', icon: 'icon-sparkles', group: 'cabinet' },
  { path: '/patient/access', label: 'Доступ', icon: 'icon-shield', group: 'cabinet' },
  { path: '/patient/profile', label: 'Профиль', icon: 'icon-person', group: 'account' },
  { path: '/patient/notifications', label: 'Уведомления', icon: 'icon-bell', group: 'account' },
  { path: '/patient/settings', label: 'Настройки', icon: 'icon-settings', group: 'account' },
  { path: '/patient/help', label: 'Помощь', icon: 'icon-help', group: 'account' },
];

const doctorNav = [
  { path: '/doctor/home', label: 'Главная', icon: 'icon-home', group: 'cabinet' },
  { path: '/doctor/access', label: 'Доступ', icon: 'icon-shield', group: 'cabinet' },
  { path: '/doctor/work', label: 'Работа', icon: 'icon-people', group: 'cabinet' },
  { path: '/doctor/profile', label: 'Профиль', icon: 'icon-person', group: 'account' },
  { path: '/doctor/notifications', label: 'Уведомления', icon: 'icon-bell', group: 'account' },
  { path: '/doctor/settings', label: 'Настройки', icon: 'icon-settings', group: 'account' },
  { path: '/doctor/help', label: 'Помощь', icon: 'icon-help', group: 'account' },
];

export function getNavForRole(role) {
  return role === 'doctor' ? doctorNav : patientNav;
}

/** @type {import('./router.js').RouteDef[]} */
export const routes = [
  // Auth (public)
  {
    pattern: /^\/login\/?$/,
    title: 'Вход',
    auth: false,
    page: { type: 'auth', file: 'auth/login.html', selector: '.section' },
    bodyClass: 'layout layout--auth',
  },
  {
    pattern: /^\/register\/doctor\/?$/,
    title: 'Регистрация врача',
    auth: false,
    page: { type: 'auth', file: 'register-doctor.html', selector: '.modal-overlay--auth-modal, .auth' },
    bodyClass: 'layout layout--auth layout--auth-modal',
  },
  {
    pattern: /^\/register\/success\/?$/,
    title: 'Регистрация завершена',
    auth: false,
    page: { type: 'auth', file: 'register-success.html', selector: '.modal-overlay--auth-modal' },
    bodyClass: 'layout layout--auth layout--auth-modal',
  },
  {
    pattern: /^\/register\/?$/,
    title: 'Регистрация',
    auth: false,
    page: { type: 'auth', file: 'register.html', selector: '.modal-overlay--auth-modal' },
    bodyClass: 'layout layout--auth layout--auth-modal',
  },
  {
    pattern: /^\/password\/?$/,
    title: 'Восстановление пароля',
    auth: false,
    page: { type: 'auth', file: 'password.html', selector: '.modal-overlay--auth-page' },
    bodyClass: 'layout layout--auth layout--auth-page',
  },
  {
    pattern: /^\/terms\/?$/,
    title: 'Условия использования',
    auth: false,
    page: { type: 'auth', file: 'terms.html', selector: '.modal-overlay--open' },
    bodyClass: 'layout layout--auth layout--legal-modal',
  },
  {
    pattern: /^\/privacy\/?$/,
    title: 'Политика конфиденциальности',
    auth: false,
    page: { type: 'auth', file: 'privacy.html', selector: '.modal-overlay--open' },
    bodyClass: 'layout layout--auth layout--legal-modal',
  },
  {
    pattern: /^\/404\/?$/,
    title: 'Страница не найдена',
    auth: false,
    page: { type: 'auth', file: '404.html', selector: '.auth' },
    bodyClass: 'layout layout--auth',
  },

  // Patient — nested
  {
    pattern: /^\/patient\/documents\/upload\/?$/,
    title: 'Загрузить документ',
    role: 'patient',
    page: { file: 'pages/patient/document-upload.html' },
  },
  {
    pattern: /^\/patient\/documents\/([^/]+)\/?$/,
    title: 'Документ',
    role: 'patient',
    page: { file: 'pages/patient/document-view.html' },
  },
  {
    pattern: /^\/patient\/appointments\/new\/success\/?$/,
    title: 'Запись создана',
    role: 'patient',
    page: { file: 'pages/patient/appointment-new.html', step: 'success' },
  },
  {
    pattern: /^\/patient\/appointments\/new\/specialty\/?$/,
    title: 'Выбор специализации',
    role: 'patient',
    page: { file: 'pages/patient/appointment-new.html', step: 'specialty' },
  },
  {
    pattern: /^\/patient\/appointments\/new\/doctor\/?$/,
    title: 'Выбор врача',
    role: 'patient',
    page: { file: 'pages/patient/appointment-new.html', step: 'doctor' },
  },
  {
    pattern: /^\/patient\/appointments\/new\/datetime\/?$/,
    title: 'Дата и время',
    role: 'patient',
    page: { file: 'pages/patient/appointment-new.html', step: 'datetime' },
  },
  {
    pattern: /^\/patient\/appointments\/new\/confirm\/?$/,
    title: 'Подтверждение записи',
    role: 'patient',
    page: { file: 'pages/patient/appointment-new.html', step: 'confirm' },
  },
  {
    pattern: /^\/patient\/appointments\/new\/?$/,
    title: 'Новая запись',
    role: 'patient',
    page: { file: 'pages/patient/appointment-new.html', step: 'form' },
  },
  {
    pattern: /^\/patient\/access\/grant\/?$/,
    title: 'Выдача доступа',
    role: 'patient',
    page: { file: 'pages/patient/access-grant.html' },
  },

  // Patient — main
  { pattern: /^\/patient\/home\/?$/, title: 'Главная', role: 'patient', page: { file: 'pages/patient/home.html' } },
  { pattern: /^\/patient\/documents\/?$/, title: 'Документы', role: 'patient', page: { file: 'pages/patient/documents.html' } },
  { pattern: /^\/patient\/appointments\/?$/, title: 'Записи', role: 'patient', page: { file: 'pages/patient/appointments.html' } },
  { pattern: /^\/patient\/family\/?$/, title: 'Семья', role: 'patient', page: { file: 'pages/patient/family.html' } },
  { pattern: /^\/patient\/ai-assistant\/?$/, title: 'ИИ-помощник', role: 'patient', page: { file: 'pages/patient/ai-assistant.html' } },
  { pattern: /^\/patient\/access\/?$/, title: 'Доступ', role: 'patient', page: { file: 'pages/patient/access.html' } },
  { pattern: /^\/patient\/profile\/?$/, title: 'Мой профиль', role: 'patient', page: { file: 'pages/patient/profile.html' } },
  { pattern: /^\/patient\/settings\/?$/, title: 'Настройки', role: 'patient', page: { file: 'pages/patient/settings.html' } },
  { pattern: /^\/patient\/notifications\/?$/, title: 'Уведомления', role: 'patient', page: { file: 'pages/patient/notifications.html' } },
  { pattern: /^\/patient\/help\/?$/, title: 'Помощь', role: 'patient', page: { file: 'pages/patient/help.html' } },

  // Doctor
  { pattern: /^\/doctor\/home\/?$/, title: 'Главная', role: 'doctor', page: { file: 'pages/doctor/home.html' } },
  {
    pattern: /^\/doctor\/access\/request\/?$/,
    title: 'Запрос доступа',
    role: 'doctor',
    page: { file: 'pages/doctor/access-request.html' },
  },
  { pattern: /^\/doctor\/access\/?$/, title: 'Доступ', role: 'doctor', page: { file: 'pages/doctor/access.html' } },
  { pattern: /^\/doctor\/work\/?$/, title: 'Работа', role: 'doctor', page: { file: 'pages/doctor/sessions.html' } },
  { pattern: /^\/doctor\/profile\/?$/, title: 'Профиль', role: 'doctor', page: { file: 'pages/doctor/profile.html' } },
  { pattern: /^\/doctor\/settings\/?$/, title: 'Настройки', role: 'doctor', page: { file: 'pages/doctor/settings.html' } },
  { pattern: /^\/doctor\/notifications\/?$/, title: 'Уведомления', role: 'doctor', page: { file: 'pages/doctor/notifications.html' } },
  { pattern: /^\/doctor\/help\/?$/, title: 'Помощь', role: 'doctor', page: { file: 'pages/doctor/help.html' } },
];

export function matchRoute(pathname) {
  const path = pathname.replace(/\/$/, '') || '/';
  for (const route of routes) {
    const m = path.match(route.pattern);
    if (m) return { route, params: m.slice(1) };
  }
  return null;
}

export const ROUTE_MAP = routes.map((r) => ({
  pattern: r.pattern.source,
  title: r.title,
  role: r.role || 'public',
  page: r.page?.file || r.page?.type,
}));
