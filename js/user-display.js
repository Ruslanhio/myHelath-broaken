import { State } from './state.js';
import { users, familyRoster } from './mock/data.js';

export function getUserFullName(user) {
  if (!user) return '';
  if (user.fullName) return user.fullName;
  return [user.firstName, user.patronymic, user.lastName].filter(Boolean).join(' ').trim()
    || `${user.firstName} ${user.lastName}`.trim();
}

export function getUserGreeting(user) {
  if (!user) return 'Добрый день!';
  const name = user.greetingName || getUserFullName(user);
  return `Добрый день, ${name}!`;
}

export function getUserHeaderRole(user, role = State.role) {
  if (!user) return '';
  if (role === 'doctor' && user.specialty) return user.specialty;
  return user.roleLabel || '';
}

export function resolveFamilyPatientName(tabId, user = State.user) {
  if (tabId === 'mine') {
    return getUserFullName(user) || getUserFullName(users.patient);
  }
  return familyRoster[tabId] || '';
}

export function buildPatientToTabMap(user = State.user) {
  return Object.fromEntries(
    Object.keys(familyRoster).concat('mine').map((tabId) => [
      resolveFamilyPatientName(tabId, user),
      tabId,
    ])
  );
}

const USER_FIELD_RESOLVERS = {
  greeting: getUserGreeting,
  fullName: getUserFullName,
  shortName: (user) => user.shortName || '',
  initials: (user) => user.initials || '',
  role: getUserHeaderRole,
  roleLabel: (user) => user.roleLabel || '',
  email: (user) => user.email || '',
  specialty: (user) => user.specialty || '',
};

export function patchUserFields(root = document) {
  const user = State.user || users[State.role] || users.patient;
  if (!user) return;

  root.querySelectorAll('[data-user]').forEach((el) => {
    const key = el.getAttribute('data-user');
    const resolver = USER_FIELD_RESOLVERS[key];
    if (!resolver) return;
    const value = resolver(user);
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      el.value = value;
    } else {
      el.textContent = value;
    }
  });

  root.querySelectorAll('.greeting__title:not([data-user])').forEach((el) => {
    el.textContent = getUserGreeting(user);
  });
}
