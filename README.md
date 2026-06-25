# MyHealth — клиентское SPA

Стек: HTML / CSS / JavaScript (без фреймворков). Точка входа — `login.html`, маршрутизация через hash (`#/...`).

## Запуск

**Открывайте `index.html` через локальный HTTP-сервер.**

```bash
# После правок в pages/ или partials/ — пересобрать шаблоны:
node scripts/build-templates.mjs

npx serve .
# или: python -m http.server 8080
```

Перейдите на `http://localhost:3000/index.html#/login` (порт зависит от сервера).

## Архитектура

- **SPA shell** — sidebar и header монтируются один раз, меняется только `#page-content`.
- **Без runtime-fetch** — HTML из `pages/` и `partials/` встраивается в `js/generated/templates.js` при сборке.
- **Роутер** — `js/router.js` + `js/routes.js` (hash `#/patient/home` и т.д.).
- **Моки** — `js/mock/data.js`, `js/api.js`.

## Структура

```
index.html              — точка входа SPA (#app)
js/generated/templates.js — встроенные шаблоны (генерируется)
scripts/build-templates.mjs — сборка templates.js из HTML
partials/               — исходники sidebar (patient / doctor)
pages/                  — исходники экранов (<main class="layout__content">…</main>)
auth/login.html         — экран входа и др. auth-файлы
css/core.scss           — общие стили → core.css (везде)
css/auth.scss           — авторизация → auth.css
css/app.scss            — дашборд SPA → app.css
css/_ui-kit.scss        — переиспользуемые компоненты (Figma UI Kit)
css/_responsive.scss    — адаптив по wireframe «Макеты»
docs/FIGMA-REFERENCE.md — соответствие фреймам Figma
```

> **Семья = «Склад» из ТЗ.** Маршрут `#/patient/family`, пункт меню «Семья».

> После изменения любого файла в `pages/` или `partials/` выполните `node scripts/build-templates.mjs`.

## Карта маршрутов

### Авторизация

| Hash | Экран |
|------|--------|
| `#/login` | Вход |
| `#/register` | Регистрация пациента |
| `#/register/doctor` | Регистрация врача |
| `#/register/success` | Успешная регистрация |
| `#/password` | Восстановление пароля |
| `#/404` | Страница не найдена |
| `#/terms` | Условия использования |
| `#/privacy` | Политика конфиденциальности |

### Пациент

| Hash | Экран | Файл-источник |
|------|--------|----------------|
| `#/patient/home` | Главная | `pages/home.html` |
| `#/patient/documents` | Документы | `pages/documents.html` |
| `#/patient/documents/upload` | Загрузка | `pages/document-upload.html` |
| `#/patient/documents/:id` | Просмотр | `pages/document-view.html` |
| `#/patient/appointments` | Записи | `pages/appointments.html` |
| `#/patient/appointments/new` | Новая запись | `pages/appointment-new.html` |
| `#/patient/appointments/new/confirm` | Подтверждение | (генерируется JS) |
| `#/patient/appointments/new/success` | Успех | (генерируется JS) |
| `#/patient/family` | Семья (склад в ТЗ) | `pages/family.html` |
| `#/patient/ai-assistant` | ИИ-помощник | `pages/ai-assistant.html` |
| `#/patient/access` | Доступ | `pages/access.html` |
| `#/patient/access/grant` | Выдача доступа | `pages/access-grant.html` |
| `#/patient/profile` | Мой профиль (4 вкладки + модалка) | `pages/profile.html` |
| `#/patient/settings` | Настройки | `pages/settings.html` |
| `#/patient/notifications` | Уведомления | `pages/notifications.html` |
| `#/patient/help` | Помощь | `pages/help.html` |

### Врач

| Hash | Экран | Файл-источник |
|------|--------|----------------|
| `#/doctor/home` | Главная | `pages/doctor/home.html` |
| `#/doctor/access` | Доступ | `pages/access.html` |
| `#/doctor/work` | Работа | `pages/doctor/sessions.html` |
| `#/doctor/profile` | Профиль | `pages/profile.html` |
| `#/doctor/settings` | Настройки | `pages/doctor/settings.html` |
| `#/doctor/notifications` | Уведомления | `pages/doctor/notifications.html` |
| `#/doctor/help` | Помощь | `pages/doctor/help.html` |

## Моковые сценарии

| Действие | Результат |
|----------|-----------|
| Вход (пациент / врач) | `#/patient/home` или `#/doctor/home` |
| Навигация по sidebar | без перезагрузки страницы |
| Загрузить документ | toast success → `#/patient/documents` |
| Новая запись → Подтвердить | `#/confirm` → `#/success` |
| Сохранить в настройках (модалка) | toast «Настройки сохранены» |
| ИИ-чат | моковые ответы из `api.js` |
| Неизвестный hash | `#/404` |

### Флаги для тестирования (в консоли)

```javascript
import { State } from './js/state.js';
State.flags.documentsEmpty = true;  // пустой список документов
State.flags.uploadSimulateError = true;
State.save();
```

## Сборка

```bash
# HTML → js/generated/templates.js (обязательно после правок pages/ или partials/)
node scripts/build-templates.mjs

# SCSS → CSS (три бандла)
npm run build:css

# Или по отдельности:
# npx sass css/core.scss css/core.css
# npx sass css/auth.scss css/auth.css
# npx sass css/app.scss css/app.css

# Полный бандл (legacy, как раньше style.css):
# npx sass css/style.scss css/style.css

# Или всё сразу
npm run build
```

## Подключение backend

Замените функции в `js/api.js` на реальные `fetch`-запросы. Структура данных — в `js/mock/data.js`.
