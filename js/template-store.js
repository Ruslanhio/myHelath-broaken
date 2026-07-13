import { PAGE_TEMPLATES, PAGE_CONTENT_META, SIDEBAR_TEMPLATES, TOPBAR_TEMPLATE, AUTH_TEMPLATES } from './generated/templates.js';

export function getPageTemplate(file) {
  const html = PAGE_TEMPLATES[file];
  if (html == null) {
    throw new Error(`Шаблон страницы не найден: ${file}. Запустите: node scripts/build-templates.mjs`);
  }
  return html;
}

export function getPageContentMeta(file) {
  return PAGE_CONTENT_META[file] || { contentClass: 'layout__content', dataAttrs: {} };
}

export function getSidebarTemplate(role) {
  const html = SIDEBAR_TEMPLATES[role];
  if (html == null) {
    throw new Error(`Шаблон sidebar не найден: ${role}`);
  }
  return html;
}

export function getTopbarTemplate() {
  if (TOPBAR_TEMPLATE == null) {
    throw new Error('Шаблон topbar не найден. Запустите: node scripts/build-templates.mjs');
  }
  return TOPBAR_TEMPLATE;
}

export function getAuthTemplate(file) {
  const html = AUTH_TEMPLATES[file];
  if (html == null) {
    throw new Error(`Шаблон auth не найден: ${file}. Запустите: node scripts/build-templates.mjs`);
  }
  return html;
}
