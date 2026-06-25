const THEME_KEY = 'myhealth_theme';
const SETTINGS_KEY = 'myhealth_settings';

export function getTheme() {
  return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
}

export function applyTheme(theme) {
  const isDark = theme === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
}

export function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme === 'dark' ? 'dark' : 'light');
  applyTheme(theme);
  syncThemeCheckboxes();
}

export function initTheme() {
  applyTheme(getTheme());
}

export function syncThemeCheckboxes() {
  const isDark = getTheme() === 'dark';
  document.querySelectorAll('[data-theme-toggle]').forEach((input) => {
    input.checked = isDark;
  });
}

export function getSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveSettings(patch) {
  const next = { ...getSettings(), ...patch };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
}

export function bindSettingsControls(root = document) {
  root.querySelectorAll('[data-theme-toggle]').forEach((input) => {
    if (input.dataset.themeBound) return;
    input.dataset.themeBound = '1';
    input.checked = getTheme() === 'dark';
    input.addEventListener('change', () => {
      setTheme(input.checked ? 'dark' : 'light');
    });
  });

  root.querySelectorAll('[data-setting]').forEach((input) => {
    if (input.dataset.settingBound) return;
    input.dataset.settingBound = '1';
    const key = input.dataset.setting;
    const saved = getSettings()[key];
    if (typeof saved === 'boolean') input.checked = saved;
    input.addEventListener('change', () => {
      saveSettings({ [key]: input.checked });
    });
  });
}
