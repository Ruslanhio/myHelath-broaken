/**
 * Контент страниц из встроенных шаблонов (js/generated/templates.js)
 */

import { parseHtmlDocument } from '../html-parse.js';
import { getPageTemplate, getAuthTemplate } from '../template-store.js';

const LINK_MAP_PATIENT = {
  'home.html': '#/patient/home',
  'patient/home.html': '#/patient/home',
  'documents.html': '#/patient/documents',
  'patient/documents.html': '#/patient/documents',
  'document-view.html': '#/patient/documents/doc-1',
  'patient/document-view.html': '#/patient/documents/doc-1',
  'document-upload.html': '#/patient/documents/upload',
  'patient/document-upload.html': '#/patient/documents/upload',
  'appointments.html': '#/patient/appointments',
  'patient/appointments.html': '#/patient/appointments',
  'appointment-new.html': '#/patient/appointments/new',
  'patient/appointment-new.html': '#/patient/appointments/new',
  'family.html': '#/patient/family',
  'patient/family.html': '#/patient/family',
  'ai-assistant.html': '#/patient/ai-assistant',
  'patient/ai-assistant.html': '#/patient/ai-assistant',
  'access.html': '#/patient/access',
  'patient/access.html': '#/patient/access',
  'access-grant.html': '#/patient/access/grant',
  'patient/access-grant.html': '#/patient/access/grant',
  'profile.html': '#/patient/profile',
  'patient/profile.html': '#/patient/profile',
  'settings.html': '#/patient/settings',
  'patient/settings.html': '#/patient/settings',
  'notifications.html': '#/patient/notifications',
  'patient/notifications.html': '#/patient/notifications',
  'help.html': '#/patient/help',
  'patient/help.html': '#/patient/help',
  '../index.html': '#/login',
  '../../index.html': '#/login',
  'index.html': '#/login',
  'register.html': '#/register',
  'register-doctor.html': '#/register/doctor',
  'password.html': '#/password',
  'terms.html': '#/terms',
  'privacy.html': '#/privacy',
};

const LINK_MAP_DOCTOR = {
  'home.html': '#/doctor/home',
  'doctor/home.html': '#/doctor/home',
  'access.html': '#/doctor/access',
  'doctor/access.html': '#/doctor/access',
  'access-request.html': '#/doctor/access/request',
  'doctor/access-request.html': '#/doctor/access/request',
  'sessions.html': '#/doctor/work',
  'doctor/sessions.html': '#/doctor/work',
  'profile.html': '#/doctor/profile',
  'doctor/profile.html': '#/doctor/profile',
  'settings.html': '#/doctor/settings',
  'doctor/settings.html': '#/doctor/settings',
  'notifications.html': '#/doctor/notifications',
  'doctor/notifications.html': '#/doctor/notifications',
  'help.html': '#/doctor/help',
  'doctor/help.html': '#/doctor/help',
  '../../index.html': '#/login',
  '../index.html': '#/login',
};

function rewriteHref(href, role) {
  if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:')) {
    return href;
  }
  const map = role === 'doctor' ? { ...LINK_MAP_PATIENT, ...LINK_MAP_DOCTOR } : LINK_MAP_PATIENT;

  const clean = href.replace(/^\.\//, '');
  if (map[clean]) return map[clean];
  if (map[href]) return map[href];

  if (clean.startsWith('document-view.html') || clean.startsWith('patient/document-view.html')) {
    return '#/patient/documents/doc-1';
  }

  return href;
}

function fixAssetPaths(html) {
  return html
    .replace(/src="\.\.\/\.\.\/\.\.\/images\//g, 'src="images/')
    .replace(/src="\.\.\/\.\.\/images\//g, 'src="images/')
    .replace(/src="\.\.\/images\//g, 'src="images/')
    .replace(/href="\.\.\/\.\.\/\.\.\/images\//g, 'href="images/')
    .replace(/href="\.\.\/\.\.\/images\//g, 'href="images/')
    .replace(/href="\.\.\/images\//g, 'href="images/')
    .replace(/href="\.\.\/css\//g, 'href="css/')
    .replace(/href="\.\.\/\.\.\/css\//g, 'href="css/');
}

function rewriteLinks(container, role) {
  container.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    const next = rewriteHref(href, role);
    if (next?.startsWith('#/')) {
      a.setAttribute('href', next);
      a.setAttribute('data-nav', '');
    }
  });
}

export function loadPageContent(file, role = 'patient') {
  const innerHtml = getPageTemplate(file);
  const wrapper = document.createElement('div');
  wrapper.innerHTML = fixAssetPaths(innerHtml);
  rewriteLinks(wrapper, role);
  return wrapper.innerHTML;
}

export function loadAuthContent(file, selector) {
  const html = getAuthTemplate(file);
  const doc = parseHtmlDocument(html);

  const selectors = selector.split(',').map((s) => s.trim());
  let node = null;
  for (const sel of selectors) {
    node = doc.querySelector(sel);
    if (node) break;
  }

  if (!node) {
    node = doc.body;
  }

  const wrapper = document.createElement('div');
  wrapper.innerHTML = fixAssetPaths(node.outerHTML || node.innerHTML);
  rewriteLinks(wrapper, 'patient');

  wrapper.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === 'index.html' || href === './index.html') a.setAttribute('href', '#/login');
    if (href === 'register.html') a.setAttribute('href', '#/register');
    if (href === 'register-doctor.html') a.setAttribute('href', '#/register/doctor');
    if (href === 'password.html') a.setAttribute('href', '#/password');
    if (href?.startsWith('#/')) a.setAttribute('data-nav', '');
  });

  return wrapper.innerHTML;
}

export function getActivePath(pathname) {
  return pathname.replace(/\/$/, '') || '/patient/home';
}
