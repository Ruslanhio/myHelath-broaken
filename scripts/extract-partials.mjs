import fs from 'fs';
import path from 'path';

function extractSidebar(html) {
  const start = html.indexOf('<div class="sidebar">');
  const end = html.indexOf('<div class="layout__main">');
  if (start === -1 || end === -1) throw new Error('sidebar not found');
  return html.slice(start, end).trim();
}

const family = fs.readFileSync('pages/patient/family.html', 'utf8');
const doctorHome = fs.readFileSync('pages/doctor/home.html', 'utf8');

fs.mkdirSync('partials', { recursive: true });

const patientSidebar = extractSidebar(family).replace(/\.\.\/images\//g, 'images/');
const doctorSidebar = extractSidebar(doctorHome).replace(/\.\.\/\.\.\/images\//g, 'images/');

fs.writeFileSync('partials/sidebar-patient.html', patientSidebar);
fs.writeFileSync('partials/sidebar-doctor.html', doctorSidebar);

const pageFiles = [];

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.html') && f !== 'sidebar.html') pageFiles.push(p);
  }
}

walk('pages');

for (const file of pageFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const open = '<main class="layout__content">';
  const start = html.indexOf(open);
  const end = html.indexOf('</main>', start);
  if (start === -1 || end === -1) {
    console.warn('SKIP (no main):', file);
    continue;
  }
  const out = html.slice(start, end + '</main>'.length) + '\n';
  fs.writeFileSync(file, out);
  console.log('OK:', file);
}
