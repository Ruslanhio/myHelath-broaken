import { State } from './state.js';
import { matchRoute } from './routes.js';
import { renderAuthPage } from './views/auth-page.js';
import { renderAppPage } from './views/app-page.js';
import { destroyShell } from './components/layout.js';

let resolveId = 0;

export function navigate(hash) {
  if (!hash.startsWith('#')) hash = `#${hash}`;
  if (location.hash !== hash) location.hash = hash;
  else resolve();
}

export function initRouter() {
  window.addEventListener('hashchange', () => resolve());
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-nav], a[href^="#/"]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href?.startsWith('#/')) return;
    e.preventDefault();
    navigate(href);
  });

  if (!location.hash || location.hash === '#') {
    navigate(State.isAuthenticated() ? State.homeRoute() : '#/login');
  } else {
    resolve();
  }
}

function isStale(id) {
  return id !== resolveId;
}

async function resolve() {
  const id = ++resolveId;

  try {
    const raw = location.hash.slice(1) || '/login';
    const pathname = raw.split('?')[0];
    const matched = matchRoute(pathname);

    if (!matched) {
      if (pathname !== '/404') {
        navigate('#/404');
        return;
      }
    }

    const { route, params } = matched || {
      route: { pattern: /^\/404/, title: '404', auth: false, page: { type: 'auth', file: '404.html', selector: '.auth' }, bodyClass: 'layout layout--auth' },
      params: [],
    };

    const needsAuth = route.role != null;
    if (needsAuth && !State.isAuthenticated()) {
      if (!isStale(id)) navigate('#/login');
      return;
    }
    if (route.role && State.role !== route.role) {
      if (!isStale(id)) navigate(State.homeRoute());
      return;
    }
    if (route.auth === false && State.isAuthenticated() && pathname === '/login') {
      if (!isStale(id)) navigate(State.homeRoute());
      return;
    }

    if (isStale(id)) return;

    document.title = `${route.title} — MyHealth`;
    document.body.className = route.bodyClass || '';

    const app = document.getElementById('app');
    if (!app) return;

    if (route.page?.type === 'auth' || route.bodyClass?.includes('auth')) {
      destroyShell();
      app.innerHTML = '';
      await renderAuthPage(app, route, pathname);
    } else {
      await renderAppPage(app, route, params);
    }

    if (isStale(id)) return;

    if (window.UI) window.UI.init();
    const { bindScenarios } = await import('./views/scenarios.js');
    bindScenarios(route, params);
  } catch (err) {
    if (!isStale(id)) {
      console.error(err);
      destroyShell();
      const app = document.getElementById('app');
      if (app) {
        app.innerHTML = `<div class="layout__content"><p class="text text--muted">Не удалось загрузить страницу.</p></div>`;
      }
    }
  }
}

export const Router = { navigate, init: initRouter, resolve };
