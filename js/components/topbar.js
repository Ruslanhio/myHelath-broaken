import { State } from '../state.js';
import { getUserHeaderRole } from '../user-display.js';
import { users } from '../mock/data.js';

function getDisplayUser() {
  return State.user || users[State.role] || users.patient;
}

export function renderTopbar(title) {
  const user = getDisplayUser();
  const rolePrefix = State.role === 'doctor' ? 'doctor' : 'patient';
  const notifyHref = `#/${rolePrefix}/notifications`;

  return `
    <header class="header">
      <button type="button" class="layout__burger" id="sidebar-toggle" aria-label="Открыть меню" aria-expanded="false" aria-controls="app-sidebar">
        <svg class="icon" width="24" height="24" aria-hidden="true"><use href="images/icons.svg#icon-list"/></svg>
      </button>
      <h1 class="header__title">${title}</h1>
      <div class="header__actions">
        <a href="${notifyHref}" class="header__notify" data-nav aria-label="Уведомления">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M9.99214 4.09068C10.3555 2.87021 11.4213 1.625 13 1.625C14.5791 1.625 15.6438 2.87026 16.01 4.08843C16.9707 4.50213 18.0524 5.10652 18.8984 6.21307C19.7512 7.32852 20.3059 8.87698 20.3059 11.0373C20.3059 13.1913 20.5331 14.3724 20.8678 15.1833C21.1612 15.8942 21.5471 16.3616 22.0961 17.0266C22.1763 17.1237 22.26 17.225 22.3473 17.332C23.3594 18.5717 22.4039 20.3125 20.8452 20.3125H5.15989C3.60405 20.3125 2.63243 18.5805 3.6527 17.332C3.74013 17.225 3.82386 17.1235 3.90411 17.0264C4.45306 16.3615 4.83895 15.8941 5.13263 15.1831C5.46758 14.3721 5.69537 13.191 5.69665 11.0373M13 3.25C12.3745 3.25 11.777 3.77164 11.5458 4.56705C11.3962 5.07702 10.9834 5.45613 10.5697 5.62629C9.79339 5.94601 8.9999 6.40714 8.3943 7.19899C7.7954 7.9821 7.32165 9.16575 7.32165 11.0373C7.32035 13.284 7.08655 14.7091 6.63455 15.8034C6.24132 16.7554 5.69239 17.417 5.14775 18.0734C5.06861 18.1688 4.98955 18.2641 4.91107 18.3601C4.87868 18.3998 4.86964 18.4322 4.86742 18.4567C4.86492 18.4843 4.87013 18.5174 4.88752 18.5515C4.91772 18.6107 4.9929 18.6875 5.15989 18.6875H20.8452C21.0061 18.6875 21.0801 18.6132 21.1109 18.5525C21.1439 18.4874 21.1398 18.4226 21.0889 18.3601C21.0105 18.2641 20.9315 18.1689 20.8524 18.0736C20.3077 17.4171 19.7587 16.7554 19.3657 15.8032C18.914 14.7087 18.6809 13.2835 18.6809 11.0373C18.6809 9.16814 18.2068 7.98406 17.6074 7.20004C17.0013 6.4072 16.2074 5.94519 15.4329 5.62632C15.0146 5.45427 14.6062 5.06985 14.458 4.57037C14.2232 3.77126 13.6256 3.25 13 3.25Z" fill="black"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M9.75 18.6875C10.1987 18.6875 10.5625 19.0513 10.5625 19.5V20.3125C10.5625 20.959 10.8193 21.579 11.2764 22.0361C11.7335 22.4932 12.3535 22.75 13 22.75C13.6465 22.75 14.2665 22.4932 14.7236 22.0361C15.1807 21.579 15.4375 20.959 15.4375 20.3125V19.5C15.4375 19.0513 15.8013 18.6875 16.25 18.6875C16.6987 18.6875 17.0625 19.0513 17.0625 19.5V20.3125C17.0625 21.3899 16.6345 22.4233 15.8726 23.1851C15.1108 23.947 14.0774 24.375 13 24.375C11.9226 24.375 10.8892 23.947 10.1274 23.1851C9.36551 22.4233 8.9375 21.3899 8.9375 20.3125V19.5C8.9375 19.0513 9.30127 18.6875 9.75 18.6875Z" fill="black"/>
          </svg>
          <span class="badge badge--dot" aria-hidden="true"></span>
        </a>
        <div class="header__user">
          <div class="avatar" aria-hidden="true">${user.initials || '?'}</div>
          <div class="header__user-info">
            <p class="header__user-name">${user.shortName || ''}</p>
            <p class="header__user-role">${getUserHeaderRole(user, State.role) || ''}</p>
          </div>
        </div>
      </div>
    </header>
  `;
}

export function updateTopbarTitle(title) {
  const el = document.querySelector('.header__title');
  if (el) el.textContent = title;
}

export function patchTopbarUser() {
  const user = getDisplayUser();
  if (!user) return;

  const rolePrefix = State.role === 'doctor' ? 'doctor' : 'patient';

  document.querySelector('.header__user-name') && (document.querySelector('.header__user-name').textContent = user.shortName);
  document.querySelector('.header__user-role') && (document.querySelector('.header__user-role').textContent = getUserHeaderRole(user));

  const avatar = document.querySelector('.header .avatar');
  if (avatar) avatar.textContent = user.initials;

  const notify = document.querySelector('.header__notify');
  if (notify) notify.setAttribute('href', `#/${rolePrefix}/notifications`);
}
