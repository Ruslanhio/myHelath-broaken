import {
  mountAppShell,
  isShellMounted,
  getShellRole,
  updateShell,
  setPageContent,
} from '../components/layout.js';
import { loadPageContent, getActivePath } from './page-loader.js';
import { State } from '../state.js';
import { getDocuments, getAppointments, getAccessGrants, getNotifications } from '../api.js';
import { applyAppointmentStep } from './appointment-step.js';
import { patchUserFields } from '../user-display.js';

export async function renderAppPage(container, route, params) {
  const pathname = getActivePath(location.hash.slice(1).split('?')[0]);
  const role = route.role || 'patient';

  let contentHtml = loadPageContent(route.page.file, role);
  contentHtml = await enrichContent(contentHtml, route, params, pathname);

  const shellReady = isShellMounted() && getShellRole() === role;

  if (!shellReady) {
    mountAppShell(container, { role, title: route.title, activePath: pathname });
  } else {
    updateShell({ title: route.title, activePath: pathname, role });
  }

  setPageContent(contentHtml);
  patchUserFields();
}

async function enrichContent(html, route, params, pathname) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;

  if (pathname === '/patient/documents') {
    await injectDocumentsList(wrapper, pathname);
  }

  if (pathname === '/patient/appointments') {
    await injectAppointmentsList(wrapper);
  }

  if (pathname === '/patient/access') {
    await injectAccessList(wrapper);
  }

  if (pathname === '/patient/home') {
    await injectHomeStats(wrapper);
  }

  if (route.page.step) {
    applyAppointmentStep(wrapper, route.page.step);
  }

  if (params[0] && pathname.includes('/documents/') && !pathname.includes('upload')) {
    const docId = params[0];
    wrapper.querySelectorAll('[data-doc-title]').forEach((el) => {
      el.textContent = `Документ ${docId}`;
    });
  }

  return wrapper.innerHTML;
}

async function injectDocumentsList(wrapper, pathname) {
  const docs = await getDocuments();
  const grid = wrapper.querySelector('.doc-grid');
  const emptySlot = wrapper.querySelector('.empty-state');

  if (!docs.length) {
    if (grid) grid.innerHTML = '';
    if (!emptySlot) {
      const main = wrapper.querySelector('.card__body') || wrapper;
      main.insertAdjacentHTML(
        'beforeend',
        `<div class="empty-state"><p class="empty-state__title">Документов пока нет</p><p class="text text--muted">Загрузите первый документ</p></div>`
      );
    }
    return;
  }

  if (emptySlot) emptySlot.remove();

  if (grid) {
    grid.innerHTML = docs
      .map(
        (d) => `
      <a href="#/patient/documents/${d.id}" class="doc-card" data-nav>
        <div class="doc-card__head">
          <span class="doc-card__icon"><img src="${d.icon}" alt="" width="24" height="24"></span>
          <span class="status-badge status-badge--${d.status === 'success' ? 'success' : d.status === 'warning' ? 'warning' : 'neutral'}">${d.statusLabel}</span>
        </div>
        <div class="doc-card__body">
          <p class="doc-card__title">${d.title}</p>
          <p class="doc-card__meta">${d.lab} | ${d.dateLabel}</p>
        </div>
      </a>`
      )
      .join('');
  }

  const statValue = wrapper.querySelector('.stat-card__value');
  if (statValue && pathname === '/patient/home') {
    statValue.textContent = String(docs.length);
  }
}

async function injectAppointmentsList(wrapper) {
  const items = await getAppointments();
  const list = wrapper.querySelector('.visit-list');
  if (!items.length) {
    if (list) list.innerHTML = '<p class="text text--muted">Нет предстоящих записей</p>';
    return;
  }
  if (!list) return;

  list.innerHTML = items
    .map(
      (a) => `
    <article class="visit-card">
      <div class="visit-card__main">
        <p class="visit-card__doctor">${a.doctor}</p>
        <p class="visit-card__meta text text--muted">${a.specialty}</p>
      </div>
      <div class="visit-card__aside">
        <p class="visit-card__date">${a.dateLabel}</p>
        <p class="visit-card__time">${a.time}</p>
        <span class="status-badge status-badge--success">${a.statusLabel}</span>
      </div>
    </article>`
    )
    .join('');
}

async function injectNotifications(wrapper) {
  const items = await getNotifications();
  const list = wrapper.querySelector('#notifications-list, .card__body');
  if (!list) return;
  if (!items.length) {
    list.innerHTML = '<p class="text text--muted">Нет уведомлений</p>';
    return;
  }
  list.innerHTML = items
    .map(
      (n) => `
    <article class="list-item list-item--static list-item--notification ${n.read ? '' : 'list-item--unread'}">
      <span class="list-item__body">
        <span class="list-item__title">${n.title}</span>
        <span class="list-item__meta text text--muted">${n.text}</span>
        <time class="list-item__date text text--muted">${n.date}</time>
      </span>
    </article>`
    )
    .join('');
}

async function injectAccessList(wrapper) {
  const items = await getAccessGrants();
  const tbody = wrapper.querySelector('tbody');
  if (!tbody) return;

  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="text text--muted">Нет активных доступов</td></tr>`;
    return;
  }

  tbody.innerHTML = items
    .map(
      (a) => `
    <tr>
      <td>${a.name}</td>
      <td>${a.role}</td>
      <td>${a.scope}</td>
      <td><span class="status-badge status-badge--success">${a.statusLabel}</span></td>
    </tr>`
    )
    .join('');
}

async function injectHomeStats(wrapper) {
  const docs = await getDocuments();
  const apts = await getAppointments();
  const access = await getAccessGrants();

  const cards = wrapper.querySelectorAll('.stat-card__value');
  if (cards[0]) cards[0].textContent = String(docs.length);
  if (cards[1]) cards[1].textContent = String(apts.length);
  if (cards[2]) cards[2].textContent = String(access.length);
}
