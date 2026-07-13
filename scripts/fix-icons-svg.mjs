/**
 * Замена <use href="...icons.svg#..."> на inline SVG из отдельных файлов.
 * Запуск: node scripts/fix-icons-svg.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const ICONS = {
  'icon-close': '<svg class="icon" aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  'icon-mail': '<svg class="icon" aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M2 7l10 7 10-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  'icon-arrow-back': '<svg class="icon" aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  'icon-device': '<svg class="icon" aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M8 21h8M12 17v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  'icon-phone': '<svg class="icon" aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M12 18h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  'icon-map-pin': '<svg class="icon" aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 21s7-4.35 7-10a7 7 0 10-14 0c0 5.65 7 10 7 10z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="11" r="2.5" stroke="currentColor" stroke-width="1.5"/></svg>',
  'icon-handset': '<svg class="icon" aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  'icon-chevron-right': '<svg class="icon" aria-hidden="true" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.375 12.75L10.625 8.5L6.375 4.25" stroke="currentColor" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

const USE_IN_SVG = /<svg([^>]*)>\s*<use\s+href="[^"]*icons\.svg#(icon-[\w-]+)"\s*\/?>\s*<\/svg>/gi;

const FILES = [
  'pages/patient/settings.html',
  'pages/doctor/settings.html',
  'pages/patient/profile.html',
  'pages/doctor/profile.html',
  'pages/patient/access-grant.html',
  'register.html',
  'register-doctor.html',
  'privacy.html',
  'terms.html',
  'ui-kit.html',
];

let total = 0;

for (const rel of FILES) {
  const file = path.join(root, rel);
  let html = fs.readFileSync(file, 'utf8');
  const before = html;

  html = html.replace(USE_IN_SVG, (match, _attrs, id) => {
    const svg = ICONS[id];
    if (!svg) {
      console.warn(`WARN: unknown icon ${id} in ${rel}`);
      return match;
    }
    return svg;
  });

  if (html !== before) {
    fs.writeFileSync(file, html, 'utf8');
    const count = (before.match(/icons\.svg/g) || []).length - (html.match(/icons\.svg/g) || []).length;
    console.log(`OK: ${rel} (${count} replaced)`);
    total += count;
  }
}

const left = FILES.flatMap((rel) => {
  const html = fs.readFileSync(path.join(root, rel), 'utf8');
  const m = html.match(/icons\.svg/g);
  return m ? [`${rel}: ${m.length}`] : [];
});

if (left.length) {
  console.warn('Remaining icons.svg refs:', left);
  process.exit(1);
}

console.log(`Done: ${total} replacements`);
