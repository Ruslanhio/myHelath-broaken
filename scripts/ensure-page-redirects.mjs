/**
 * Добавляет редирект в pages/*.html — при прямом открытии файла на сервере
 * переход на index.html#/… (SPA). Скрипт не попадает в templates.js (вне <main>).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

/** @type {Record<string, string>} */
const PAGE_HASH = {
  'pages/patient/home.html': '#/patient/home',
  'pages/patient/documents.html': '#/patient/documents',
  'pages/patient/document-upload.html': '#/patient/documents/upload',
  'pages/patient/document-view.html': '#/patient/documents/doc-1',
  'pages/patient/appointments.html': '#/patient/appointments',
  'pages/patient/appointment-new.html': '#/patient/appointments/new',
  'pages/patient/family.html': '#/patient/family',
  'pages/patient/ai-assistant.html': '#/patient/ai-assistant',
  'pages/patient/access.html': '#/patient/access',
  'pages/patient/access-grant.html': '#/patient/access/grant',
  'pages/patient/profile.html': '#/patient/profile',
  'pages/patient/settings.html': '#/patient/settings',
  'pages/patient/notifications.html': '#/patient/notifications',
  'pages/patient/help.html': '#/patient/help',
  'pages/doctor/home.html': '#/doctor/home',
  'pages/doctor/access.html': '#/doctor/access',
  'pages/doctor/access-request.html': '#/doctor/access/request',
  'pages/doctor/sessions.html': '#/doctor/work',
  'pages/doctor/profile.html': '#/doctor/profile',
  'pages/doctor/settings.html': '#/doctor/settings',
  'pages/doctor/notifications.html': '#/doctor/notifications',
  'pages/doctor/help.html': '#/doctor/help',
};

const REDIRECT_RE = /<script>\s*location\.replace\('\.\.\/\.\.\/index\.html#[^']+'\);\s*<\/script>\s*/;

function redirectSnippet(hash) {
  return `<script>location.replace('../../index.html${hash}');</script>\n`;
}

let updated = 0;

for (const [relPath, hash] of Object.entries(PAGE_HASH)) {
  const fullPath = path.join(root, relPath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`skip (missing): ${relPath}`);
    continue;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const snippet = redirectSnippet(hash);
  const stripped = content.replace(REDIRECT_RE, '');
  const next = stripped.startsWith('<script>location.replace') ? stripped : snippet + stripped;

  if (next !== content) {
    fs.writeFileSync(fullPath, next);
    updated += 1;
    console.log(`updated: ${relPath}`);
  }
}

console.log(`Done. ${updated} page redirect(s).`);
