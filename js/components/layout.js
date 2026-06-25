import { loadSidebarElement, updateSidebarActive, repairSidebarIfNeeded } from './sidebar.js';
import { renderTopbar, updateTopbarTitle, patchTopbarUser } from './topbar.js';
import { State } from '../state.js';

let shellRole = null;
let layoutBound = false;

export function isShellMounted() {
  return Boolean(document.querySelector('#app #page-content'));
}

export function getShellRole() {
  return shellRole;
}

export function destroyShell() {
  shellRole = null;
}

export function mountAppShell(container, { role, title, activePath }) {
  const sidebar = loadSidebarElement(role, activePath);

  const layout = document.createElement('div');
  layout.className = 'layout';

  const overlay = document.createElement('div');
  overlay.className = 'layout__overlay';
  overlay.setAttribute('aria-hidden', 'true');

  const mainWrap = document.createElement('div');
  mainWrap.className = 'layout__main';
  mainWrap.insertAdjacentHTML('beforeend', renderTopbar(title));

  const pageBg = document.createElement('div');
  pageBg.className = 'layout__content-bg';

  const pageContent = document.createElement('main');
  pageContent.className = 'layout__content';
  pageContent.id = 'page-content';
  pageBg.appendChild(pageContent);
  mainWrap.appendChild(pageBg);

  layout.appendChild(overlay);
  layout.appendChild(sidebar);
  layout.appendChild(mainWrap);

  container.replaceChildren(layout);
  shellRole = role;
  bindLayoutOnce();
}

export function updateShell({ title, activePath, role }) {
  repairSidebarIfNeeded(role, activePath);
  updateTopbarTitle(title);
  updateSidebarActive(activePath, role);
  patchTopbarUser();
  closeMobileSidebar();
}

export function setPageContent(html) {
  const el = document.getElementById('page-content');
  if (!el) return;
  el.innerHTML = html;
  window.scrollTo(0, 0);
}

function closeMobileSidebar() {
  document.querySelector('.layout')?.classList.remove('layout--sidebar-open');
  document.body.classList.remove('layout-sidebar-open');
  const toggle = document.getElementById('sidebar-toggle');
  toggle?.setAttribute('aria-expanded', 'false');
  toggle?.setAttribute('aria-label', 'Открыть меню');
}

function openMobileSidebar() {
  document.querySelector('.layout')?.classList.add('layout--sidebar-open');
  document.body.classList.add('layout-sidebar-open');
  const toggle = document.getElementById('sidebar-toggle');
  toggle?.setAttribute('aria-expanded', 'true');
  toggle?.setAttribute('aria-label', 'Закрыть меню');
}

function suppressSidebarHoverUntilLeave(link) {
  const sidebar = link.closest('#app-sidebar');
  if (!sidebar) return;

  sidebar.classList.add('sidebar--suppress-hover');

  const clear = () => {
    sidebar.classList.remove('sidebar--suppress-hover');
    document.removeEventListener('pointermove', onPointerMove, true);
  };

  const onPointerMove = () => {
    if (!link.matches(':hover')) clear();
  };

  link.addEventListener('pointerleave', clear, { once: true });
  link.addEventListener('blur', clear, { once: true });
  document.addEventListener('pointermove', onPointerMove, true);
}

function bindLayoutOnce() {
  if (layoutBound) return;
  layoutBound = true;

  document.addEventListener('click', (e) => {
    const logout = e.target.closest('[data-action="logout"]');
    if (logout) {
      e.preventDefault();
      State.logout();
      import('../router.js').then(({ navigate }) => navigate('#/login'));
      return;
    }

    const navLink = e.target.closest('#app-sidebar a.sidebar__link[data-nav]');
    if (navLink && shellRole) {
      suppressSidebarHoverUntilLeave(navLink);
      const href = navLink.getAttribute('href');
      if (href?.startsWith('#/')) {
        const path = href.slice(1).split('?')[0].replace(/\/$/, '') || `/${shellRole}/home`;
        updateSidebarActive(path, shellRole);
        closeMobileSidebar();
      }
    }

    const toggle = e.target.closest('#sidebar-toggle');
    if (toggle) {
      const layout = document.querySelector('.layout');
      const willOpen = !layout?.classList.contains('layout--sidebar-open');
      if (willOpen) openMobileSidebar();
      else closeMobileSidebar();
      return;
    }

    if (e.target.closest('.layout__overlay')) {
      closeMobileSidebar();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileSidebar();
  });

  window.addEventListener('resize', () => {
    if (window.matchMedia('(min-width: 768px)').matches) closeMobileSidebar();
  });
}
