import { PAGE_TEMPLATES, SIDEBAR_TEMPLATES, AUTH_TEMPLATES } from './generated/templates.js';

export function getPageTemplate(file) {
  const html = PAGE_TEMPLATES[file];
  if (html == null) {
    throw new Error(`Шаблон страницы не найден: ${file}. Запустите: node scripts/build-templates.mjs`);
  }
  return html;
}

export function getSidebarTemplate(role) {
  const html = SIDEBAR_TEMPLATES[role];
  if (html == null) {
    throw new Error(`Шаблон sidebar не найден: ${role}`);
  }
  return html;
}

export function getAuthTemplate(file) {
  const html = AUTH_TEMPLATES[file];
  if (html == null) {
    throw new Error(`Шаблон auth не найден: ${file}. Запустите: node scripts/build-templates.mjs`);
  }
  return html;
}
