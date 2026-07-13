import {
  mountAppShell,
  isShellMounted,
  getShellRole,
  updateShell,
  setPageContent,
} from '../components/layout.js';
import { loadPageContent, getActivePath } from './page-loader.js';
import { getPageContentMeta } from '../template-store.js';
import { State } from '../state.js';
import { getDocuments, getDocument, getAppointments, getAccessGrants, getNotifications } from '../api.js';
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

  setPageContent(contentHtml, getPageContentMeta(route.page.file));
  patchUserFields();
  bindDocumentViewInteractions();
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

  if (params[0] && pathname.match(/^\/patient\/documents\/[^/]+$/) && !pathname.includes('upload')) {
    await injectDocumentView(wrapper, params[0]);
  }

  return wrapper.innerHTML;
}

async function injectDocumentsList(wrapper, pathname) {
  const docs = await getDocuments();
  const grid = wrapper.querySelector('.doc-grid');
  const list = wrapper.querySelector('.doc-list');
  const emptySlot = wrapper.querySelector('.empty-state');

  if (!docs.length) {
    if (grid) grid.innerHTML = '';
    if (list) list.innerHTML = '';
    if (!emptySlot) {
      const main = wrapper.querySelector('.card__body') || wrapper;
      main.insertAdjacentHTML(
        'beforeend',
        renderEmptyState('Документов пока нет', 'Загрузите первый документ')
      );
    }
    return;
  }

  if (emptySlot) emptySlot.remove();

  if (grid) {
    grid.innerHTML = docs.map(renderDocumentCard).join('');
  }

  if (list) {
    list.innerHTML = docs.map(renderDocumentListItem).join('');
  }

  const statValue = wrapper.querySelector('.stat-card__value');
  if (statValue && pathname === '/patient/home') {
    statValue.textContent = String(docs.length);
  }
}

async function injectAppointmentsList(wrapper) {
  const items = await getAppointments();
  const upcomingCount = items.filter((item) => item.status === 'upcoming').length;
  const statValue = wrapper.querySelector('.appointments-stat__value');
  if (statValue) statValue.textContent = String(upcomingCount);

  wrapper.querySelectorAll('.appointment-list').forEach((list) => {
    const panelId = list.closest('[data-panel]')?.dataset.panel || 'all';
    const filtered = filterAppointmentsForPanel(items, panelId);

    if (!filtered.length) {
      list.innerHTML = '<p class="text text--muted">Нет записей</p>';
      return;
    }

    list.innerHTML = filtered.map(renderAppointmentItem).join('');
  });
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
    .map(renderNotificationItem)
    .join('');
}

async function injectAccessList(wrapper) {
  const items = await getAccessGrants();
  const lists = {
    active: wrapper.querySelector('[data-access-list="active"]'),
    incoming: wrapper.querySelector('[data-access-list="incoming"]'),
    expired: wrapper.querySelector('[data-access-list="expired"]'),
  };

  Object.entries(lists).forEach(([tab, list]) => {
    if (!list) return;
    const tabItems = items.filter((item) => item.tab === tab);
    if (!tabItems.length) {
      list.innerHTML = '<p class="text text--muted">Нет записей</p>';
      return;
    }
    list.innerHTML = tabItems.map((item) => renderAccessCard(item)).join('');
  });

  const activeCount = items.filter((item) => item.tab === 'active').length;
  const countEl = wrapper.querySelector('.summary-stat__number');
  const countText = wrapper.querySelector('.summary-stat__text');
  if (countEl) countEl.textContent = String(activeCount);
  if (countText) {
    countText.textContent = activeCount === 1 ? 'активный доступ' : 'активных доступа';
  }
}

const ACCESS_EYE_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 21s7-4.5 7-10a7 7 0 10-14 0c0 5.5 7 10 7 10z"/><circle cx="12" cy="11" r="2.5"/></svg>`;

const ACCESS_DOCTOR_ICON = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function renderAccessCard(item) {
  const statusClass = item.status === 'incoming'
    ? ' access-grant-card__status--waiting'
    : item.status === 'expired'
      ? ' access-grant-card__status--expired'
      : '';
  const cardModifier = item.status === 'incoming' ? ' access-grant-card--incoming' : '';
  const patientClass = item.patientAccent ? ' person-name--accent' : '';
  const tags = (item.documentScopes || [])
    .map((scope) => `<span class="doc-scope-tag">${scope}</span>`)
    .join('');
  const note = item.clinic || item.scopeNote || '';
  const viewRow = item.lastView
    ? `<p class="access-grant-card__view">${ACCESS_EYE_ICON}Последний просмотр: ${item.lastView}</p>`
    : '';
  const periodDate = item.accessFrom && !String(item.accessUntil || '').startsWith('Истёк') && !String(item.accessUntil || '').startsWith('Запрос')
    ? `${item.accessFrom} - ${item.accessUntil}`
    : item.accessUntil;
  const actions = item.status === 'incoming'
    ? `<div class="access-grant-card__actions">
        <button type="button" class="btn btn--primary btn--compact btn--auto">Принять</button>
        <button type="button" class="btn btn--neutral-outline btn--auto">Отклонить</button>
      </div>`
    : item.status === 'expired'
      ? `<div class="access-grant-card__actions">
          <a href="#/patient/access/grant" class="btn btn--primary btn--compact btn--auto" data-nav>Запросить снова</a>
        </div>`
      : `<div class="access-grant-card__actions">
          <button type="button" class="btn btn--primary btn--compact btn--auto">Изменить срок</button>
          <button type="button" class="btn btn--neutral-outline btn--auto">Отозвать</button>
        </div>`;

  return `
    <article class="access-grant-card${cardModifier}">
      <div class="access-grant-card__row">
        <div class="access-grant-card__lead">
          <span class="access-grant-card__icon" aria-hidden="true">${ACCESS_DOCTOR_ICON}</span>
          <div class="access-grant-card__identity">
            <div class="access-grant-card__head">
              <h2 class="access-grant-card__doctor">${item.doctorTitle}</h2>
              <span class="access-grant-card__status${statusClass}">${item.statusLabel}</span>
            </div>
            ${note ? `<p class="access-grant-card__note">${note}</p>` : ''}
            ${viewRow}
          </div>
        </div>
        <div class="access-grant-card__period">
          <span class="access-grant-card__label">Доступ:</span>
          <span class="access-grant-card__date">${periodDate || ''}</span>
        </div>
        <div class="access-grant-card__docs">
          <span class="access-grant-card__label">Используемые документы:</span>
          <div class="access-grant-card__tags">${tags}</div>
        </div>
        <span class="person-name${patientClass}">${item.patientName || ''}</span>
      </div>
      ${actions}
    </article>`;
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

const DOC_CATEGORY_LABELS = {
  tests: 'Анализы',
  scans: 'Снимки',
  prescriptions: 'Рецепты',
  reports: 'Заключения',
  vaccines: 'Прививки',
};

const INDICATOR_STATUS_ICON = {
  success: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.25"/><path d="M6.25 10.25L8.75 12.75L13.75 7.75" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  warning: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.25"/><path d="M10 6.5V11M10 13.25V13.35" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/></svg>`,
  danger: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.25"/><path d="M7.25 7.25L12.75 12.75M12.75 7.25L7.25 12.75" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/></svg>`,
};

async function injectDocumentView(wrapper, docId) {
  const root = wrapper.querySelector('[data-doc-view]');
  if (!root) return;

  let doc;
  try {
    doc = await getDocument(docId);
  } catch {
    return;
  }

  const categoryLabel = DOC_CATEGORY_LABELS[doc.category] || doc.category;

  root.querySelector('[data-doc-icon]')?.setAttribute('src', doc.icon);
  root.querySelector('[data-doc-category]') && (root.querySelector('[data-doc-category]').textContent = categoryLabel);
  root.querySelector('[data-doc-status]') && (root.querySelector('[data-doc-status]').textContent = doc.statusLabel || '');
  root.querySelector('[data-doc-title]') && (root.querySelector('[data-doc-title]').textContent = doc.title);
  root.querySelector('[data-doc-meta]') && (root.querySelector('[data-doc-meta]').textContent = `${doc.lab} | ${doc.dateLabel}`);

  const accessNote = root.querySelector('[data-doc-access-note]');
  if (accessNote && doc.doctor && doc.reviewedAt) {
    accessNote.textContent = `Последний доступ: ${doc.doctor} | ${doc.reviewedAt}`;
  }

  const pdfMeta = root.querySelector('[data-doc-pdf-meta]');
  if (pdfMeta && doc.pdf) {
    pdfMeta.textContent = `${doc.pdf.fileName} | ${doc.pdf.size}`;
  }

  const aiSummary = root.querySelector('[data-doc-ai-summary]');
  if (aiSummary && doc.aiSummary) {
    aiSummary.textContent = doc.aiSummary;
  }

  const indicatorsEl = root.querySelector('[data-doc-indicators]');
  if (indicatorsEl && doc.indicators?.length) {
    indicatorsEl.innerHTML = doc.indicators.map(renderDocIndicator).join('');
  }

  const viewersEl = root.querySelector('[data-doc-viewers]');
  if (viewersEl && doc.viewers?.length) {
    viewersEl.innerHTML = doc.viewers.map(renderDocViewer).join('');
  }
}

function renderDocIndicator(item) {
  const status = ['success', 'warning', 'danger'].includes(item.status) ? item.status : 'success';
  return `
    <li class="doc-view__indicator doc-view__indicator--${status}">
      <div class="doc-view__indicator-body">
        <p class="doc-view__indicator-name">${item.name}</p>
        <p class="doc-view__indicator-norm">Норма: ${item.norm}</p>
      </div>
      <div class="doc-view__indicator-value-wrap">
        <span class="doc-view__indicator-value">${item.value}</span>
        <span class="doc-view__indicator-unit">${item.unit}</span>
        <span class="doc-view__indicator-status doc-view__indicator-status--${status}" aria-label="В норме">
          ${INDICATOR_STATUS_ICON[status]}
        </span>
      </div>
    </li>`;
}

function renderDocViewer(viewer) {
  return `
    <li class="doc-view__viewer">
      <span class="doc-view__viewer-avatar" aria-hidden="true">${viewer.initials}</span>
      <div class="doc-view__viewer-body">
        <p class="doc-view__viewer-name">${viewer.name}</p>
        <p class="doc-view__viewer-date">${viewer.viewedAt}</p>
      </div>
    </li>`;
}

function renderEmptyState(title, text) {
  return `<div class="empty-state"><p class="empty-state__title">${title}</p><p class="text text--muted">${text}</p></div>`;
}

const DOC_CARD_EYE_ICON = `<svg class="doc-card__footer-icon" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M0.508796 5.58224C2.0338 3.39626 4.01112 2.25 5.99205 2.25C8.31856 2.25 10.3227 3.76565 11.505 5.59181L11.5056 5.59267C11.5838 5.71425 11.6254 5.85577 11.6254 6.00035C11.6254 6.14467 11.584 6.28594 11.506 6.40736C10.3247 8.25705 8.33353 9.75 5.99205 9.75C3.62565 9.75 1.6729 8.26015 0.494446 6.41586C0.414371 6.29152 0.37284 6.14627 0.375087 5.99838C0.377339 5.85012 0.423488 5.70586 0.507701 5.58382L0.508796 5.58224ZM1.125 6.00978L1.12604 6.0114C2.21451 7.71522 3.95907 9 5.99205 9C8.00226 9 9.78444 7.70976 10.8742 6.00325L10.8749 6.00213C10.8753 6.0016 10.8754 6.00098 10.8754 6.00035C10.8754 6.00009 10.8754 5.99982 10.8753 5.99957C10.8753 5.99925 10.8751 5.99894 10.875 5.99865C9.78105 4.30957 7.9843 3 5.99205 3C4.31997 3 2.55012 3.96778 1.125 6.00978Z" fill="currentColor" /><path fill-rule="evenodd" clip-rule="evenodd" d="M6 4.5C5.17157 4.5 4.5 5.17157 4.5 6C4.5 6.82843 5.17157 7.5 6 7.5C6.82843 7.5 7.5 6.82843 7.5 6C7.5 5.17157 6.82843 4.5 6 4.5ZM3.75 6C3.75 4.75736 4.75736 3.75 6 3.75C7.24264 3.75 8.25 4.75736 8.25 6C8.25 7.24264 7.24264 8.25 6 8.25C4.75736 8.25 3.75 7.24264 3.75 6Z" fill="currentColor" /></svg>`;

const DOC_CARD_SHIELD_ICON = `<svg class="doc-card__footer-icon" width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.09576 0.0332366C5.19389 -0.0110789 5.30633 -0.0110789 5.40446 0.0332366C7.26886 0.875234 8.1058 1.14425 10.1702 1.51456C10.3402 1.54506 10.4674 1.6877 10.4783 1.86006C10.8746 8.14162 5.77689 10.3171 5.3902 10.4729C5.30031 10.509 5.19991 10.509 5.11002 10.4729C4.72333 10.3171 -0.374381 8.14162 0.0219474 1.86006C0.0328222 1.6877 0.160005 1.54506 0.329993 1.51456C2.39442 1.14425 3.23136 0.875234 5.09576 0.0332366ZM0.756182 2.1992C0.579363 7.31545 4.41437 9.33771 5.25011 9.71672C6.08585 9.33771 9.92086 7.31545 9.74404 2.1992C7.87845 1.85287 6.97609 1.55957 5.25011 0.786203C3.52412 1.55957 2.62176 1.85287 0.756182 2.1992Z" fill="currentColor" /></svg>`;

function renderDocumentCardFooter(d) {
  if (d.accessAlert) {
    return `<p class="doc-card__footer doc-card__footer--alert">${DOC_CARD_SHIELD_ICON}Предоставьте доступ врачу</p>`;
  }

  const doctorLabel = d.doctor ? `Врач: ${d.doctor}` : '';
  const footerText = d.reviewedAt ? `${doctorLabel}, ${d.reviewedAt}` : doctorLabel;

  if (d.reviewedAt) {
    return `<p class="doc-card__footer">${DOC_CARD_EYE_ICON}${footerText}</p>`;
  }

  return `<p class="doc-card__footer">${footerText}</p>`;
}

const DOC_LIST_TAG_BY_STATUS = {
  success: { text: 'Готово', modifier: '' },
  danger: { text: 'Срочно', modifier: ' list-item__tag--danger' },
  info: { text: 'Новое', modifier: ' list-item__tag--info' },
  warning: { text: 'На проверке', modifier: ' list-item__tag--warning' },
};

const DOC_LIST_ARROW_ICON = `<span class="doc-list__arrow"><svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M0.292893 0.292893C-0.0976315 0.683417 -0.0976315 1.31658 0.292893 1.70711L5.58579 7L0.292893 12.2929C-0.0976315 12.6834 -0.0976315 13.3166 0.292893 13.7071C0.683417 14.0976 1.31658 14.0976 1.70711 13.7071L7.70711 7.70711C8.09763 7.31658 8.09763 6.68342 7.70711 6.29289L1.70711 0.292893C1.31658 -0.0976311 0.683417 -0.0976311 0.292893 0.292893Z" fill="#156B6A" /></svg></span>`;

function renderDocumentCard(d) {
  const status = ['success', 'warning', 'danger', 'info'].includes(d.status) ? d.status : 'success';
  return `
      <a href="#/patient/documents/${d.id}" class="doc-card" data-nav data-doc-category="${d.category}">
        <div class="doc-card__head">
          <span class="doc-card__icon"><img src="${d.icon}" alt="" width="24" height="24"></span>
          <span class="status-badge status-badge--${status}">${d.statusLabel}</span>
        </div>
        <div class="doc-card__body">
          <p class="doc-card__title">${d.title}</p>
          <p class="doc-card__meta">${d.lab} | ${d.dateLabel}</p>
        </div>
        ${renderDocumentCardFooter(d)}
      </a>`;
}

function renderDocumentListItem(d) {
  const status = ['success', 'warning', 'danger', 'info'].includes(d.status) ? d.status : 'success';
  const categoryLabel = DOC_CATEGORY_LABELS[d.category] || d.category;
  const tag = DOC_LIST_TAG_BY_STATUS[status] || DOC_LIST_TAG_BY_STATUS.success;

  return `
    <a href="#/patient/documents/${d.id}" class="doc-list__item" data-nav data-doc-category="${d.category}">
      <span class="doc-list__icon"><img src="${d.icon}" alt="" width="24" height="24"></span>
      <span class="doc-list__body">
        <span class="doc-list__title">${d.title}</span>
        <span class="doc-list__meta">${categoryLabel} | ${d.lab} | ${d.dateLabel}</span>
      </span>
      <span class="doc-list__badge doc-list__badge--accent">Анна М.</span>
      <span class="list-item__tag${tag.modifier}">${tag.text}</span>
      ${DOC_LIST_ARROW_ICON}
    </a>`;
}

const APPOINTMENT_MONTH_LABELS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

const APPOINTMENT_TIME_ICON = '<svg class="icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>';
const APPOINTMENT_LOCATION_ICON = '<svg class="icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 21s7-4.5 7-10a7 7 0 10-14 0c0 5.5 7 10 7 10z"/><circle cx="12" cy="11" r="2.5"/></svg>';

function filterAppointmentsForPanel(items, panelId) {
  if (panelId === 'upcoming') return items.filter((item) => item.status === 'upcoming');
  if (panelId === 'past') return items.filter((item) => item.status === 'past');
  return items;
}

function getAppointmentDateParts(iso) {
  const [year, month, day] = String(iso || '').split('-').map(Number);
  if (!year || !month || !day) return { day: '—', month: '—' };
  return {
    day: String(day),
    month: APPOINTMENT_MONTH_LABELS[month - 1] || '',
  };
}

function renderAppointmentItem(a) {
  const { day, month } = getAppointmentDateParts(a.date);
  const isPast = a.status === 'past';
  const badgeClass = isPast ? 'status-badge--past' : 'status-badge--upcoming';
  const patientClass = a.patientAccent ? ' appointment-item__patient--accent' : '';
  const doctorTitle = a.doctorTitle || `${a.specialty || ''} ${a.doctor || ''}`.trim();
  const reason = a.reason ? `Причина: ${escapeHtml(a.reason)}` : '';
  const actions = isPast
    ? `<div class="appointment-item__actions">
        <button type="button" class="btn btn--action btn--sm btn--auto">Повторить запись</button>
        <button type="button" class="btn btn--action btn--sm btn--auto">Заключение врача</button>
      </div>`
    : `<div class="appointment-item__actions">
        <button type="button" class="btn btn--primary btn--sm btn--auto">Перенести запись</button>
        <button type="button" class="btn btn--action btn--sm btn--auto">Отменить</button>
      </div>`;

  return `
    <article class="appointment-item">
      <div class="appointment-item__date${isPast ? ' appointment-item__date--past' : ''}">
        <span class="appointment-item__day">${day}</span>
        <span class="appointment-item__month">${month}</span>
      </div>
      <div class="appointment-item__body">
        <div class="appointment-item__head">
          <h2 class="appointment-item__doctor">${escapeHtml(doctorTitle)}</h2>
          <div class="appointment-item__aside">
            <span class="appointment-item__patient${patientClass}">${escapeHtml(a.patient || '—')}</span>
            <span class="status-badge ${badgeClass}">${escapeHtml(a.statusLabel || '')}</span>
          </div>
        </div>
        <div class="appointment-item__meta">
          <span>${APPOINTMENT_TIME_ICON} ${escapeHtml(a.time || '—')}</span>
          <span>${APPOINTMENT_LOCATION_ICON} ${escapeHtml(a.clinic || '—')}</span>
        </div>
        ${reason ? `<p class="appointment-item__reason">${reason}</p>` : ''}
        ${actions}
      </div>
    </article>`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderNotificationItem(n) {
  return `
    <article class="list-item list-item--static list-item--notification ${n.read ? '' : 'list-item--unread'}">
      <span class="list-item__body">
        <span class="list-item__title">${n.title}</span>
        <span class="list-item__meta text text--muted">${n.text}</span>
        <time class="list-item__date text text--muted">${n.date}</time>
      </span>
    </article>`;
}

function bindDocumentViewInteractions() {
  const expandBtn = document.querySelector('[data-doc-ai-expand]');
  const summary = document.querySelector('[data-doc-ai-summary]');
  if (!expandBtn || !summary) return;

  expandBtn.addEventListener('click', () => {
    const expanded = expandBtn.getAttribute('aria-expanded') === 'true';
    expandBtn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    summary.classList.toggle('doc-view__ai-card-text--expanded', !expanded);
    expandBtn.textContent = expanded ? 'Развернуть текст >' : 'Свернуть текст <';
  });
}
