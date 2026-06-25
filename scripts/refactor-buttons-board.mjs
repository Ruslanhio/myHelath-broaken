/**
 * Убирает дубли состояний (hover/click/disabled) в buttons.html.
 * Оставляет одну интерактивную кнопку/таб на вариант — состояния через CSS :hover/:active/:disabled.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(root, 'buttons.html');

const STATE_CLASSES = new Set([
  'is-click',
  'uikit-button-state__hover',
  'uikit-button-state__active',
  'tab--active',
  'btn--loading-text',
  'list-item--click',
  'list-item--disabled',
  'visit-card--hover',
  'visit-card--click',
  'visit-card--disabled',
  'question-item--click',
  'link-upload--hover',
  'link-upload--click',
  'link-upload--disabled',
  'quick-actions__btn--hover',
  'quick-actions__btn--disabled',
  'nav-item--hover-demo',
  'sidebar__link--hover-demo',
  'sidebar__link--active',
  'role-pill--active',
  'role-pill--active-accent',
  'role-pill--not-active',
  'role-pill--solid',
]);

const VARIANT_CLASSES = new Set([
  'btn--primary-pink',
  'btn--not-active',
  'btn--success',
  'btn--danger-soft',
  'btn--error',
  'btn--loading-text',
  'btn--loading',
  'btn--outline',
  'btn--ghost',
  'btn--danger',
  'btn--danger-outline',
  'btn--secondary',
  'btn--icon',
  'btn--primary',
  'btn--action',
  'btn--demo',
  'btn--md',
  'btn--sm',
  'btn--auto',
  'btn--full',
  'tab-chip',
  'role-pill',
  'tab',
]);

function normalizeClasses(classAttr) {
  return classAttr
    .split(/\s+/)
    .filter(Boolean)
    .filter((c) => !STATE_CLASSES.has(c))
    .sort()
    .join(' ');
}

function variantKey(classAttr) {
  const classes = classAttr.split(/\s+/).filter(Boolean);
  const variants = classes.filter((c) => VARIANT_CLASSES.has(c) || c.startsWith('btn--'));
  return [...new Set(variants)].sort().join(' ');
}

function extractButtonFromSlot(slotHtml) {
  const tabsMatch = slotHtml.match(/<div class="tabs[^"]*"[^>]*>[\s\S]*?<\/div>/);
  if (tabsMatch) return { type: 'tabs', html: tabsMatch[0] };

  const btnMatch = slotHtml.match(/<button\b[^>]*class="([^"]*)"[^>]*>[\s\S]*?<\/button>/);
  if (btnMatch) {
    return {
      type: 'button',
      classes: btnMatch[1],
      html: btnMatch[0],
      disabled: /\bdisabled\b/.test(btnMatch[0]),
      text: btnMatch[0].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(),
    };
  }
  return null;
}

function isStateOnlyDuplicate(a, b) {
  if (!a || !b || a.type !== 'button' || b.type !== 'button') return false;
  if (variantKey(a.classes) !== variantKey(b.classes)) return false;
  if (normalizeClasses(a.classes) !== normalizeClasses(b.classes)) return false;
  const aText = a.text.replace(/\.\.\./g, '').trim();
  const bText = b.text.replace(/\.\.\./g, '').trim();
  if (aText !== bText && !(aText.includes('Загрузка') && bText.includes('Загрузка'))) return false;
  return true;
}

function pickCanonicalButton(entries) {
  const enabled = entries.filter((e) => !e.disabled && !e.classes.includes('btn--loading-text'));
  if (enabled.length) {
    return enabled.sort((a, b) => normalizeClasses(a.classes).length - normalizeClasses(b.classes).length)[0];
  }
  return entries[0];
}

function cleanButtonHtml(html) {
  return html
    .replace(/\s+is-click/g, '')
    .replace(/\s+uikit-button-state__hover/g, '')
    .replace(/\s+uikit-button-state__active/g, '')
    .replace(/\s+tab--active/g, '')
    .replace(/\s+disabled(?=\s|>)/g, '')
    .replace(/\s+aria-busy="true"/g, '');
}

function processComponentSet(setHtml) {
  const statesMatch = setHtml.match(/<div class="component-set__states">([\s\S]*?)<\/div>\s*<\/div>/);
  if (!statesMatch) return setHtml;

  const statesInner = statesMatch[1];
  const slotRegex = /<div class="component-state">\s*<div class="component-state__slot[^"]*">([\s\S]*?)<\/div>\s*<\/div>/g;
  const slots = [];
  let m;
  while ((m = slotRegex.exec(statesInner)) !== null) {
    slots.push({ full: m[0], inner: m[1], item: extractButtonFromSlot(m[1]) });
  }

  if (!slots.length) return setHtml;

  const allButtons = slots.every((s) => s.item?.type === 'button');
  const allTabs = slots.every((s) => s.item?.type === 'tabs');
  if (!allButtons && !allTabs) return setHtml;

  if (allTabs) {
    const uniqueTabs = [];
    const seen = new Set();
    for (const slot of slots) {
      const key = slot.item.html.replace(/\s+tab--active/g, '');
      if (!seen.has(key)) {
        seen.add(key);
        uniqueTabs.push(slot);
      }
    }
    if (uniqueTabs.length === slots.length) return setHtml;
    slots.length = 0;
    slots.push(...uniqueTabs);
  }

  if (allButtons) {
    const groups = new Map();
    for (const slot of slots) {
      const key = variantKey(slot.item.classes) || normalizeClasses(slot.item.classes);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(slot);
    }

    const kept = [];
    for (const group of groups.values()) {
      if (group.length === 1) {
        kept.push(group[0]);
        continue;
      }
      const allDupes = group.every((slot, _, arr) =>
        arr.every((other) => isStateOnlyDuplicate(slot.item, other.item))
      );
      if (allDupes) {
        const canonical = pickCanonicalButton(group.map((s) => s.item));
        const slot = group.find((s) => s.item.html === canonical.html) || group[0];
        kept.push({
          ...slot,
          inner: slot.inner.replace(canonical.html, cleanButtonHtml(canonical.html)),
        });
      } else {
        kept.push(...group);
      }
    }

    if (kept.length === slots.length) return setHtml;

    const newStates = kept
      .map((slot) => {
        let inner = slot.inner;
        const item = extractButtonFromSlot(inner);
        if (item?.type === 'button') {
          inner = inner.replace(item.html, cleanButtonHtml(item.html));
        }
        const slotClass = slot.full.includes('component-state__slot--visit')
          ? 'component-state__slot component-state__slot--visit'
          : 'component-state__slot';
        return `                    <div class="component-state">
                        <div class="${slotClass}">
                            ${inner.trim()}
                        </div>
                    </div>`;
      })
      .join('\n');

    return setHtml.replace(
      /<div class="component-set__states">[\s\S]*?<\/div>\s*(?=<\/div>)/,
      `<div class="component-set__states">\n${newStates}\n                `
    );
  }

  return setHtml;
}

let html = fs.readFileSync(file, 'utf8');

const setRegex = /<div class="component-set[^"]*">[\s\S]*?<\/div>\s*<\/div>/g;
html = html.replace(setRegex, (match) => {
  if (!match.includes('component-set__states')) return match;
  if (!match.includes('class="btn ') && !match.includes('class="tab') && !match.includes('class="tabs')) {
    return match;
  }
  return processComponentSet(match);
});

// «Последние документы» — одна группа табов как на home
html = html.replace(
  /<!-- Button: Последние документы -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/,
  `<!-- Tabs: Последние документы / визиты -->
            <div class="component-set component-set--wide">
                <span class="component-set__name">Tabs</span>
                <div class="component-set__states">
                    <div class="component-state">
                        <div class="component-state__slot">
                            <div class="tabs" data-tabs="buttons-last-docs">
                                <button type="button" class="tab tab--active" data-tab="documents"><span class="tab__label">Последние<br>документы</span></button>
                                <button type="button" class="tab" data-tab="visits"><span class="tab__label">Последние<br>визиты</span></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`
);

// Медучереждение — один таб
html = html.replace(
  /<!-- Button: Медучереждение -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/,
  `<!-- Tab: Медучереждение -->
            <div class="component-set">
                <span class="component-set__name">Tab</span>
                <div class="component-set__states">
                    <div class="component-state">
                        <div class="component-state__slot">
                            <div class="tabs tabs--settings-single">
                                <button type="button" class="tab">Медучереждение</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`
);

// Заключения — один таб
html = html.replace(
  /<!-- Button: Заключения -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/,
  `<!-- Tab: Заключения -->
            <div class="component-set">
                <span class="component-set__name">Tab</span>
                <div class="component-set__states">
                    <div class="component-state">
                        <div class="component-state__slot">
                            <button type="button" class="tab">Заключения</button>
                        </div>
                    </div>
                </div>
            </div>`
);

if (!html.includes('buttons-board.js')) {
  html = html.replace(
    '</body>',
    `    <script src="js/ui.js"></script>\n    <script src="js/buttons-board.js"></script>\n</body>`
  );
}

fs.writeFileSync(file, html);
console.log('OK: buttons.html refactored');
