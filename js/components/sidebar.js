import { queryInHtml } from '../html-parse.js';
import { getSidebarTemplate } from '../template-store.js';

const PATIENT_HREF_MAP = {
  'home.html': '#/patient/home',
  'patient/home.html': '#/patient/home',
  'documents.html': '#/patient/documents',
  'patient/documents.html': '#/patient/documents',
  'appointments.html': '#/patient/appointments',
  'patient/appointments.html': '#/patient/appointments',
  'family.html': '#/patient/family',
  'patient/family.html': '#/patient/family',
  'ai-assistant.html': '#/patient/ai-assistant',
  'patient/ai-assistant.html': '#/patient/ai-assistant',
  'access.html': '#/patient/access',
  'patient/access.html': '#/patient/access',
  'profile.html': '#/patient/profile',
  'patient/profile.html': '#/patient/profile',
  'notifications.html': '#/patient/notifications',
  'patient/notifications.html': '#/patient/notifications',
  'settings.html': '#/patient/settings',
  'patient/settings.html': '#/patient/settings',
  'help.html': '#/patient/help',
  'patient/help.html': '#/patient/help',
  '../index.html': '#/login',
  'index.html': '#/login',
};

const PATIENT_PATH_BY_HREF = {
  'home.html': '/patient/home',
  'patient/home.html': '/patient/home',
  'documents.html': '/patient/documents',
  'patient/documents.html': '/patient/documents',
  'appointments.html': '/patient/appointments',
  'patient/appointments.html': '/patient/appointments',
  'family.html': '/patient/family',
  'patient/family.html': '/patient/family',
  'ai-assistant.html': '/patient/ai-assistant',
  'patient/ai-assistant.html': '/patient/ai-assistant',
  'access.html': '/patient/access',
  'patient/access.html': '/patient/access',
  'profile.html': '/patient/profile',
  'patient/profile.html': '/patient/profile',
  'notifications.html': '/patient/notifications',
  'patient/notifications.html': '/patient/notifications',
  'settings.html': '/patient/settings',
  'patient/settings.html': '/patient/settings',
  'help.html': '/patient/help',
  'patient/help.html': '/patient/help',
};

const DOCTOR_HREF_MAP = {
  'home.html': '#/doctor/home',
  'doctor/home.html': '#/doctor/home',
  'access.html': '#/doctor/access',
  'doctor/access.html': '#/doctor/access',
  'sessions.html': '#/doctor/work',
  'doctor/sessions.html': '#/doctor/work',
  'profile.html': '#/doctor/profile',
  'doctor/profile.html': '#/doctor/profile',
  'notifications.html': '#/doctor/notifications',
  'doctor/notifications.html': '#/doctor/notifications',
  'settings.html': '#/doctor/settings',
  'doctor/settings.html': '#/doctor/settings',
  'help.html': '#/doctor/help',
  'doctor/help.html': '#/doctor/help',
  '../../index.html': '#/login',
  '../index.html': '#/login',
};

const DOCTOR_PATH_BY_HREF = {
  'home.html': '/doctor/home',
  'doctor/home.html': '/doctor/home',
  'access.html': '/doctor/access',
  'doctor/access.html': '/doctor/access',
  'sessions.html': '/doctor/work',
  'doctor/sessions.html': '/doctor/work',
  'profile.html': '/doctor/profile',
  'doctor/profile.html': '/doctor/profile',
  'notifications.html': '/doctor/notifications',
  'doctor/notifications.html': '/doctor/notifications',
  'settings.html': '/doctor/settings',
  'doctor/settings.html': '/doctor/settings',
  'help.html': '/doctor/help',
  'doctor/help.html': '/doctor/help',
};

const NAV_LINKS_MIN = { patient: 10, doctor: 7 };

function isActivePath(linkPath, activePath) {
  if (!linkPath) return false;
  if (activePath === linkPath) return true;
  if (linkPath.endsWith('/home')) return false;
  return activePath.startsWith(linkPath + '/');
}

function resolveLinkPath(raw, hrefMap, pathByHref) {
  if (pathByHref[raw]) return pathByHref[raw];
  if (raw?.startsWith('#/')) {
    return raw.slice(1).split('?')[0].replace(/\/$/, '') || null;
  }
  const hash = hrefMap[raw];
  if (hash?.startsWith('#/')) {
    return hash.slice(1).split('?')[0].replace(/\/$/, '') || null;
  }
  return null;
}

function applySidebarLinks(sidebar, hrefMap, pathByHref, activePath) {
  sidebar.querySelectorAll('.sidebar__nav a.sidebar__link').forEach((a) => {
    const raw = a.getAttribute('href');
    const hash = hrefMap[raw];
    if (hash) {
      a.setAttribute('href', hash);
      a.setAttribute('data-nav', '');
    }
    a.classList.remove('sidebar__link--active');
    a.removeAttribute('aria-current');
    const linkPath = resolveLinkPath(raw, hrefMap, pathByHref);
    if (isActivePath(linkPath, activePath)) {
      a.classList.add('sidebar__link--active');
      a.setAttribute('aria-current', 'page');
    }
  });

  const logout = sidebar.querySelector('.sidebar__logout a');
  if (logout) {
    logout.setAttribute('href', '#/login');
    logout.setAttribute('data-action', 'logout');
    logout.removeAttribute('data-nav');
  }
}

function applySidebarLinksForRole(sidebar, role, activePath) {
  if (role === 'doctor') {
    applySidebarLinks(sidebar, DOCTOR_HREF_MAP, DOCTOR_PATH_BY_HREF, activePath);
  } else {
    applySidebarLinks(sidebar, PATIENT_HREF_MAP, PATIENT_PATH_BY_HREF, activePath);
  }
}

function prepareSidebar(sidebar, role, activePath) {
  sidebar.id = 'app-sidebar';
  sidebar.setAttribute('aria-label', 'Боковое меню');
  applySidebarLinksForRole(sidebar, role, activePath);
  return sidebar;
}

export function loadSidebarElement(role, activePath) {
  const html = getSidebarTemplate(role);
  const sidebar = queryInHtml(html, '.sidebar');
  if (!sidebar) throw new Error('Sidebar partial not found');
  return prepareSidebar(sidebar.cloneNode(true), role, activePath);
}

export function renderSidebar(role, activePath) {
  return loadSidebarElement(role, activePath).outerHTML;
}

export function updateSidebarActive(activePath, role) {
  const sidebar = document.getElementById('app-sidebar');
  if (!sidebar) return;
  applySidebarLinksForRole(sidebar, role, activePath);
}

export function countNavLinks(sidebar) {
  return sidebar?.querySelectorAll('.sidebar__nav a.sidebar__link').length ?? 0;
}

export function repairSidebarIfNeeded(role, activePath) {
  const sidebar = document.getElementById('app-sidebar');
  const min = NAV_LINKS_MIN[role] ?? 10;
  if (sidebar && countNavLinks(sidebar) >= min) return;

  const fresh = loadSidebarElement(role, activePath);
  if (sidebar) {
    sidebar.replaceWith(fresh);
  }
}
