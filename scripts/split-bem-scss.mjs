/**
 * One-time split of css/pages/_all.scss into logical partials.
 * Run: node scripts/split-bem-scss.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'css', 'pages', '_all.scss');
const outDir = path.join(root, 'css', 'pages');

const lines = fs.readFileSync(src, 'utf8').split(/\r?\n/);

const chunks = [
  ['_shell.scss', 5, 142],
  ['_legal.scss', 143, 248],
  ['_auth-pages.scss', 249, 685],
  ['_forms.scss', 686, 750],
  ['_dashboard.scss', 751, 807],
  ['_documents.scss', 808, 1226],
  ['_appointments.scss', 1227, 1541],
  ['_settings.scss', 1542, 1747],
  ['_help.scss', 1748, 1816],
  ['_notifications.scss', 1817, 1933],
  ['_ai-assistant.scss', 1934, 2268],
  ['_misc.scss', 2269, 2377],
  ['_doctor.scss', 2378, 2903],
  ['_appointment-wizard.scss', 2904, lines.length],
];

for (const [name, start, end] of chunks) {
  const body = lines.slice(start - 1, end).join('\n').trimEnd();
  fs.writeFileSync(path.join(outDir, name), `${body}\n`, 'utf8');
}

fs.unlinkSync(src);
console.log(`Split ${chunks.length} SCSS partials into css/pages/`);
