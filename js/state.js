/**
 * Глобальное состояние приложения (мок-сессия, UI-флаги)
 */
export const State = {
  role: null,
  user: null,
  flags: {
    documentsEmpty: false,
    appointmentsEmpty: false,
    accessEmpty: false,
    uploadSimulateError: false,
    settingsSimulateError: false,
  },
  appointmentDraft: null,

  load() {
    try {
      const raw = sessionStorage.getItem('myhealth_session');
      if (!raw) return;
      const data = JSON.parse(raw);
      this.role = data.role || null;
      this.user = data.user || null;
      if (data.flags) Object.assign(this.flags, data.flags);
    } catch {
      /* ignore */
    }
  },

  save() {
    sessionStorage.setItem(
      'myhealth_session',
      JSON.stringify({
        role: this.role,
        user: this.user,
        flags: this.flags,
      })
    );
  },

  login(role, user) {
    this.role = role;
    this.user = user;
    this.save();
  },

  logout() {
    this.role = null;
    this.user = null;
    this.appointmentDraft = null;
    sessionStorage.removeItem('myhealth_session');
  },

  isAuthenticated() {
    return Boolean(this.role && this.user);
  },

  homeRoute() {
    return this.role === 'doctor' ? '#/doctor/home' : '#/patient/home';
  },
};

State.load();
