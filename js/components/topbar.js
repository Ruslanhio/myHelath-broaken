import { State } from '../state.js';
import { queryInHtml } from '../html-parse.js';
import { getTopbarTemplate } from '../template-store.js';
import { patchUserFields } from '../user-display.js';

function getRolePrefix(role = State.role) {
  return role === 'doctor' ? 'doctor' : 'patient';
}

function setTopbarNotifyHref(root, role = State.role) {
  const notify = root.querySelector('.header__notify');
  if (notify) notify.setAttribute('href', `#/${getRolePrefix(role)}/notifications`);
}

function prepareTopbar(header, { title, role }) {
  const titleEl = header.querySelector('.header__title');
  if (titleEl) titleEl.textContent = title;
  setTopbarNotifyHref(header, role);
  patchUserFields(header);
  return header;
}

export function loadTopbarElement(title, role = State.role) {
  const html = getTopbarTemplate();
  const header = queryInHtml(html, '.header');
  if (!header) throw new Error('Topbar partial not found');
  return prepareTopbar(header.cloneNode(true), { title, role });
}

export function updateTopbarTitle(title) {
  const el = document.querySelector('.header__title');
  if (el) el.textContent = title;
}

export function patchTopbarUser() {
  const header = document.querySelector('.header');
  if (!header) return;
  setTopbarNotifyHref(header);
  patchUserFields(header);
}
