/**
 * UI Kit — интерактивные компоненты (табы, модалки, переключатели)
 */
const PASSWORD_EYE_OFF_SVG = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M16.8754 17.4999C16.7933 17.5 16.712 17.4839 16.6362 17.4525C16.5604 17.421 16.4915 17.3749 16.4336 17.3167L2.68361 3.56671C2.57134 3.44855 2.50968 3.29121 2.51177 3.12823C2.51386 2.96525 2.57953 2.80954 2.69478 2.69429C2.81003 2.57904 2.96574 2.51337 3.12872 2.51128C3.29169 2.5092 3.44904 2.57086 3.5672 2.68312L17.3172 16.4331C17.4046 16.5205 17.464 16.6319 17.4881 16.7531C17.5122 16.8743 17.4998 16.9999 17.4526 17.1141C17.4053 17.2282 17.3252 17.3258 17.2225 17.3945C17.1198 17.4632 16.999 17.4999 16.8754 17.4999Z" fill="currentColor"/><path d="M9.98652 15C8.36582 15 6.80293 14.5203 5.34121 13.5742C4.01035 12.7148 2.8123 11.484 1.87636 10.0195V10.0164C2.65527 8.90036 3.5084 7.95661 4.4248 7.19567C4.43309 7.18874 4.43985 7.18016 4.44466 7.17049C4.44947 7.16081 4.45222 7.15024 4.45273 7.13945C4.45324 7.12865 4.45151 7.11787 4.44765 7.10778C4.44378 7.09769 4.43787 7.08851 4.43027 7.08083L3.65215 6.30387C3.63832 6.28993 3.61975 6.28171 3.60013 6.28084C3.58052 6.27997 3.56129 6.28652 3.54629 6.29918C2.57285 7.1195 1.66933 8.12575 0.847849 9.30387C0.706515 9.50673 0.628677 9.74702 0.624226 9.99421C0.619774 10.2414 0.688911 10.4843 0.822849 10.6922C1.85449 12.3066 3.18222 13.6664 4.66191 14.6238C6.32793 15.7031 8.1209 16.25 9.98652 16.25C10.9935 16.2468 11.9934 16.0809 12.9475 15.7586C12.96 15.7543 12.9713 15.7469 12.9803 15.737C12.9892 15.7272 12.9954 15.7152 12.9985 15.7023C13.0015 15.6893 13.0011 15.6758 12.9975 15.6631C12.9938 15.6503 12.9869 15.6386 12.9775 15.6293L12.1346 14.7863C12.1152 14.7674 12.0912 14.7538 12.0649 14.747C12.0387 14.7401 12.0111 14.7402 11.985 14.7472C11.3321 14.9153 10.6607 15.0003 9.98652 15Z" fill="currentColor"/><path d="M19.1733 9.32031C18.1398 7.72188 16.7987 6.36406 15.2956 5.39336C13.6327 4.31836 11.7968 3.75 9.98663 3.75C8.99029 3.75177 8.00135 3.92119 7.06124 4.25117C7.04871 4.25553 7.0375 4.26301 7.02866 4.27289C7.01983 4.28278 7.01365 4.29476 7.01072 4.30769C7.00779 4.32063 7.0082 4.3341 7.01191 4.34683C7.01563 4.35956 7.02252 4.37114 7.03194 4.38047L7.87374 5.22227C7.89334 5.24153 7.91767 5.25528 7.94428 5.26214C7.97089 5.269 7.99883 5.26872 8.0253 5.26133C8.66474 5.08835 9.32421 5.00048 9.98663 5C11.5761 5 13.1343 5.48555 14.6175 6.44531C15.9733 7.32031 17.1855 8.55 18.1237 10C18.1244 10.0009 18.1248 10.002 18.1248 10.0031C18.1248 10.0043 18.1244 10.0054 18.1237 10.0063C17.4427 11.0785 16.5975 12.0372 15.6191 12.8473C15.6107 12.8542 15.6038 12.8627 15.5989 12.8724C15.5941 12.8821 15.5913 12.8927 15.5907 12.9036C15.5902 12.9144 15.5919 12.9253 15.5957 12.9354C15.5996 12.9456 15.6056 12.9548 15.6132 12.9625L16.3905 13.7395C16.4043 13.7533 16.4228 13.7616 16.4423 13.7625C16.4618 13.7634 16.481 13.757 16.496 13.7445C17.5405 12.865 18.4447 11.8313 19.1773 10.6789C19.3067 10.4758 19.3752 10.2399 19.3745 9.99904C19.3738 9.7582 19.304 9.52263 19.1733 9.32031Z" fill="currentColor"/><path d="M9.99955 6.25C9.71866 6.24985 9.43864 6.2813 9.16478 6.34375C9.15095 6.34662 9.13815 6.35319 9.12776 6.36276C9.11736 6.37233 9.10976 6.38453 9.10575 6.39808C9.10174 6.41163 9.10148 6.42601 9.105 6.43969C9.10851 6.45337 9.11568 6.46585 9.12572 6.47578L13.5238 10.8727C13.5337 10.8827 13.5462 10.8899 13.5599 10.8934C13.5735 10.8969 13.5879 10.8966 13.6015 10.8926C13.615 10.8886 13.6272 10.881 13.6368 10.8706C13.6464 10.8602 13.6529 10.8474 13.6558 10.8336C13.781 10.2844 13.7809 9.71403 13.6554 9.16488C13.53 8.61573 13.2825 8.1019 12.9312 7.66154C12.5799 7.22118 12.134 6.86562 11.6264 6.62125C11.1189 6.37688 10.5628 6.24999 9.99955 6.25Z" fill="currentColor"/><path d="M6.47559 9.12718C6.46566 9.11714 6.45319 9.10998 6.4395 9.10646C6.42582 9.10295 6.41144 9.10321 6.39789 9.10721C6.38435 9.11122 6.37214 9.11883 6.36257 9.12922C6.35301 9.13962 6.34644 9.15241 6.34356 9.16625C6.2019 9.78513 6.21969 10.4299 6.39526 11.04C6.57083 11.6501 6.89844 12.2057 7.34737 12.6546C7.79631 13.1036 8.35188 13.4312 8.96201 13.6067C9.57214 13.7823 10.2169 13.8001 10.8358 13.6584C10.8496 13.6556 10.8624 13.649 10.8728 13.6394C10.8832 13.6299 10.8908 13.6177 10.8948 13.6041C10.8988 13.5906 10.8991 13.5762 10.8955 13.5625C10.892 13.5488 10.8849 13.5363 10.8748 13.5264L6.47559 9.12718Z" fill="currentColor"/></svg>`;

const PASSWORD_EYE_ON_SVG = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M0.847994 9.30373C3.38966 5.66043 6.68521 3.75 9.98676 3.75C13.8643 3.75 17.2044 6.27608 19.1751 9.31969L19.176 9.32112C19.3064 9.52375 19.3757 9.75962 19.3757 10.0006C19.3757 10.2411 19.3067 10.4766 19.1767 10.6789C17.2078 13.7617 13.8892 16.25 9.98676 16.25C6.04275 16.25 2.78817 13.7669 0.824077 10.6931C0.690619 10.4859 0.621399 10.2438 0.625144 9.9973C0.628899 9.75021 0.705813 9.50976 0.846168 9.30636L0.847994 9.30373ZM1.87501 10.0163L1.87673 10.019C3.69084 12.8587 6.59844 15 9.98676 15C13.3371 15 16.3074 12.8496 18.1237 10.0054L18.1249 10.0035C18.1254 10.0027 18.1257 10.0016 18.1257 10.0006C18.1257 10.0001 18.1257 9.99971 18.1256 9.99928C18.1255 9.99875 18.1252 9.99823 18.1249 9.99775C16.3018 7.18262 13.3072 5 9.98676 5C7.19996 5 4.25021 6.61296 1.87501 10.0163Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5ZM6.25 10C6.25 7.92893 7.92893 6.25 10 6.25C12.0711 6.25 13.75 7.92893 13.75 10C13.75 12.0711 12.0711 13.75 10 13.75C7.92893 13.75 6.25 12.0711 6.25 10Z" fill="currentColor"/></svg>`;

const UI = {
  init() {
    this.initTabs();
    this.initModals();
    this.initPasswordToggle();
    this.initDocCategoryFilter();
    this.initRoleToggle();
    this.initSegmented();
    this.initLanguageList();
    this.initViewToggle();
    this.initInteractiveStates();
  },

  getTabScope(tabsContainer, groupId) {
    const root = tabsContainer.closest('[data-tab-root]');
    if (root) return root;
    const parent = tabsContainer.parentElement;
    if (parent?.querySelector(`[data-tab-panel="${groupId}"]`)) return parent;
    return document;
  },

  activateTab(groupId, tabId, { root = document, silent = false } = {}) {
    const tabsContainer = root.querySelector(`[data-tabs="${groupId}"]`);
    if (!tabsContainer || !tabId) return;

    const scope = this.getTabScope(tabsContainer, groupId);
    const tabs = tabsContainer.querySelectorAll('[data-tab]');
    const panels = scope.querySelectorAll(`[data-tab-panel="${groupId}"]`);

    tabs.forEach((tab) => {
      const isActive = tab.getAttribute('data-tab') === tabId;
      tab.classList.toggle('tab--active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
    });

    panels.forEach((panel) => {
      const isActive = panel.getAttribute('data-panel') === tabId;
      panel.classList.toggle('tab-panel--active', isActive);
      panel.toggleAttribute('hidden', !isActive);
    });

    if (!silent) {
      tabsContainer.dispatchEvent(
        new CustomEvent('tabchange', { detail: { groupId, tabId }, bubbles: true })
      );
    }
  },

  initTabs() {
    document.querySelectorAll('[data-tabs]:not([data-tabs-init])').forEach((container) => {
      const groupId = container.getAttribute('data-tabs');
      if (!groupId) return;

      container.setAttribute('data-tabs-init', '');

      container.querySelectorAll('[data-tab]').forEach((tab) => {
        tab.addEventListener('click', () => {
          const href = tab.dataset.tabHref;
          if (href) {
            const hash = href.startsWith('#') ? href : `#${href}`;
            if (location.hash !== hash) location.hash = hash;
            return;
          }

          const targetId = tab.getAttribute('data-tab');
          if (targetId) this.activateTab(groupId, targetId);
        });
      });
    });
  },

  initModals() {
    document.querySelectorAll('[data-modal-open]').forEach((trigger) => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const id = trigger.dataset.modalOpen;
        this.openModal(id);
      });
    });

    document.querySelectorAll('[data-modal-close]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const overlay = btn.closest('.modal-overlay');
        if (overlay) this.closeModal(overlay.id);
      });
    });

    document.querySelectorAll('[data-modal-next]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const overlay = btn.closest('.modal-overlay');
        const nextId = btn.dataset.modalNext;
        if (overlay) this.closeModal(overlay.id);
        if (nextId) this.openModal(nextId);
      });
    });

    document.querySelectorAll('.modal-overlay').forEach((overlay) => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.closeModal(overlay.id);
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay--open').forEach((o) => {
          this.closeModal(o.id);
        });
      }
    });

    document.querySelectorAll('.modal-overlay--open').forEach(() => {
      document.body.style.overflow = 'hidden';
    });
  },

  openModal(id) {
    const overlay = document.getElementById(id);
    if (!overlay) return;
    overlay.classList.add('modal-overlay--open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const openCount = document.querySelectorAll('.modal-overlay--open').length;
    overlay.style.zIndex = String(1000 + openCount);
  },

  closeModal(id) {
    const overlay = document.getElementById(id);
    if (!overlay) return;
    const redirect = overlay.dataset.modalRedirect;
    overlay.classList.remove('modal-overlay--open');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.zIndex = '';
    if (!document.querySelector('.modal-overlay--open')) {
      document.body.style.overflow = '';
    }
    if (redirect) {
      window.location.href = redirect;
    }
  },

  setPasswordToggleIcon(btn, isVisible) {
    btn.setAttribute('aria-label', isVisible ? 'Скрыть пароль' : 'Показать пароль');
    btn.classList.toggle('form-input-wrap__toggle--visible', isVisible);
    btn.innerHTML = isVisible ? PASSWORD_EYE_ON_SVG : PASSWORD_EYE_OFF_SVG;
  },

  filterDocCategory(root, category) {
    root.querySelectorAll('[data-doc-category]').forEach((el) => {
      const match = category === 'all' || el.dataset.docCategory === category;
      el.hidden = !match;
    });
  },

  initDocCategoryFilter() {
    document.querySelectorAll('[data-tabs="doc-categories"]:not([data-doc-categories-init])').forEach((tabsContainer) => {
      tabsContainer.setAttribute('data-doc-categories-init', '');
      const root = tabsContainer.closest('.documents-card') || document;

      const apply = (category) => this.filterDocCategory(root, category);

      tabsContainer.addEventListener('tabchange', (e) => {
        apply(e.detail.tabId);
      });

      const activeTab = tabsContainer.querySelector('.tab--active')?.getAttribute('data-tab') || 'all';
      apply(activeTab);
    });
  },

  initPasswordToggle() {
    document.querySelectorAll('[data-password-toggle]:not([data-password-toggle-init])').forEach((btn) => {
      btn.setAttribute('data-password-toggle-init', '');

      const input = btn.closest('.form-input-wrap, .field__wrap')?.querySelector('input');
      if (input) {
        this.setPasswordToggleIcon(btn, input.type === 'text');
      }

      btn.addEventListener('click', () => {
        if (btn.disabled) return;

        const fieldInput = btn.closest('.form-input-wrap, .field__wrap')?.querySelector('input');
        if (!fieldInput || fieldInput.disabled) return;

        const willBeVisible = fieldInput.type === 'password';
        fieldInput.type = willBeVisible ? 'text' : 'password';
        this.setPasswordToggleIcon(btn, willBeVisible);
      });
    });
  },

  initRoleToggle() {
    document.querySelectorAll('[data-role-toggle]').forEach((container) => {
      const btns = container.querySelectorAll('[data-role]');
      btns.forEach((btn) => {
        btn.addEventListener('click', () => {
          btns.forEach((b) => b.classList.toggle('role-toggle__btn--active', b === btn));
          const role = btn.dataset.role;
          container.dispatchEvent(new CustomEvent('rolechange', { detail: { role } }));
        });
      });
    });
  },

  initSegmented() {
    document.querySelectorAll('[data-segmented]').forEach((container) => {
      const btns = container.querySelectorAll('[data-segment]');
      btns.forEach((btn) => {
        btn.addEventListener('click', () => {
          btns.forEach((b) => {
            const isActive = b === btn;
            if (b.classList.contains('role-pill')) {
              b.classList.toggle('role-pill--active', isActive);
              b.classList.toggle('role-pill--not-active', !isActive);
            } else {
              b.classList.toggle('segmented__btn--active', isActive);
            }
          });
        });
      });
    });
  },

  initLanguageList() {
    document.querySelectorAll('[data-language-list]').forEach((container) => {
      const options = container.querySelectorAll('.settings-language-option');
      options.forEach((btn) => {
        btn.addEventListener('click', () => {
          options.forEach((b) => b.classList.toggle('settings-language-option--active', b === btn));
        });
      });
    });
  },

  initViewToggle() {
    document.querySelectorAll('[data-view-toggle]').forEach((container) => {
      const btns = container.querySelectorAll('[data-view]');
      const target = container.dataset.viewToggle;
      btns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const view = btn.dataset.view;
          btns.forEach((b) => b.classList.toggle('view-toggle__btn--active', b === btn));
          document.querySelectorAll(`[data-view-target="${target}"]`).forEach((el) => {
            el.hidden = el.dataset.viewMode !== view;
          });
        });
      });
    });
  },

  initInteractiveStates() {
    document.querySelectorAll('[data-state-toggle]:not([data-state-toggle-init])').forEach((item) => {
      item.setAttribute('data-state-toggle-init', '');

      item.addEventListener('click', (event) => {
        if (item.matches('[aria-disabled="true"], :disabled') || item.classList.contains('is-disabled')) {
          event.preventDefault();
          return;
        }

        const href = item.getAttribute('href');
        if (href === '#' || item.closest('.uikit-page')) event.preventDefault();

        item.classList.toggle('is-active');
      });
    });
  },

  toast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `alert alert--${type}`;
    toast.textContent = message;
    toast.style.cssText = 'min-width:17.5rem;box-shadow:0 0.25rem 0.75rem rgba(0,0,0,0.15);animation:fadeIn 0.3s ease;';
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  },
};

window.UI = UI;
