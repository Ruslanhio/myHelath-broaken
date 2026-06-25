import { PAGE_TEMPLATES, SIDEBAR_TEMPLATES } from '../js/generated/templates.js';

const family = PAGE_TEMPLATES['pages/patient/family.html'];
const cards = (family.match(/<article class="family-card">/g) || []).length;
const navLinks = (SIDEBAR_TEMPLATES.patient.match(/class="sidebar__link"/g) || []).length;

console.log('family.html inner length:', family.length);
console.log('family-card count:', cards);
console.log('has Sofia:', family.includes('София'));
console.log('sidebar patient links:', navLinks);

if (cards !== 4) process.exit(1);
if (navLinks < 10) process.exit(1);
