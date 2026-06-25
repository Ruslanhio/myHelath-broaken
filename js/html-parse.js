/**
 * Парсинг HTML-строк в DOM (без сетевых запросов).
 */

export function parseHtmlDocument(html) {
  const trimmed = html.trim();
  if (/^<!DOCTYPE/i.test(trimmed) || /^<html[\s>]/i.test(trimmed)) {
    return new DOMParser().parseFromString(html, 'text/html');
  }
  return new DOMParser().parseFromString(
    `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${trimmed}</body></html>`,
    'text/html'
  );
}

export function parseHtmlFragment(html) {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  return tpl.content;
}

export function queryInHtml(html, selector) {
  const trimmed = html.trim();
  if (/^<!DOCTYPE/i.test(trimmed) || /^<html[\s>]/i.test(trimmed)) {
    return parseHtmlDocument(html).querySelector(selector);
  }
  return parseHtmlFragment(html).querySelector(selector);
}
