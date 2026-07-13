import { State } from '../state.js';
import { resolveFamilyPatientName } from '../user-display.js';
import { navigate } from '../router.js';
import {
  uploadDocument,
  createAppointment,
  saveSettings,
  getAiReply,
} from '../api.js';
import {
  initAppointmentCalendar,
  isBeforeToday,
  toISODate,
} from './appointment-calendar.js';
import { applyWizardDraftToPage } from './appointment-step.js';
import { bindSettingsControls } from '../theme.js';

export function bindScenarios(route, params) {
  bindDocumentUpload();
  bindAppointmentWizard();
  bindAiAssistant();
  bindDoctorAccess();
  bindDoctorAccessRequest();
  bindSettingsForm();
  bindProfileForm();
  bindChatForm();
  bindNotificationsPage();
  bindHelpSearch();
  bindGenericActions();
}

function bindDocumentUpload() {
  if (!location.hash.includes('/documents/upload')) return;

  const form = document.querySelector('[data-scenario="document-upload"]');
  if (!form || form.dataset.uploadBound) return;
  form.dataset.uploadBound = '1';

  const fileInput = form.querySelector('#document-file');
  const dropzone = form.querySelector('[data-upload-dropzone]');
  const pickBtn = form.querySelector('.document-upload-card__pick-btn');
  const titleEl = dropzone?.querySelector('.card__dropzone-title');
  const hintEl = dropzone?.querySelector('.card__dropzone-hint');
  const submitBtn = form.querySelector('.document-upload-card__submit');
  const maxBytes = 50 * 1024 * 1024;

  const OWNER_BY_TAB = {
    anna: () => resolveFamilyPatientName('mine'),
    ivan: () => resolveFamilyPatientName('ivan'),
    sofia: () => resolveFamilyPatientName('sofia'),
    misha: () => resolveFamilyPatientName('misha'),
  };

  const CATEGORY_BY_TAB = {
    analyses: 'tests',
    images: 'scans',
    prescriptions: 'prescriptions',
    reports: 'reports',
    vaccines: 'vaccines',
  };

  const getActiveTabId = (groupId) =>
    form.querySelector(`[data-tabs="${groupId}"] .tab--active`)?.dataset.tab || '';

  const openPicker = () => fileInput?.click();

  const clearFile = () => {
    if (fileInput) fileInput.value = '';
    dropzone?.classList.remove('document-upload-card__dropzone--has-file');
    if (titleEl) titleEl.textContent = 'Перетащите файл';
    if (hintEl) {
      hintEl.textContent = 'или нажмите для выбора';
      hintEl.hidden = false;
    }
    dropzone?.setAttribute('aria-label', 'Зона загрузки файла');
  };

  const applyFile = (file) => {
    if (!file) return;

    if (file.size > maxBytes) {
      window.UI?.toast('Файл больше 50 МБ', 'warning');
      clearFile();
      return;
    }

    dropzone?.classList.add('document-upload-card__dropzone--has-file');
    if (titleEl) titleEl.textContent = file.name;
    if (hintEl) hintEl.hidden = true;
    dropzone?.setAttribute('aria-label', `Выбран файл: ${file.name}`);
  };

  const readFileFromInput = () => {
    const file = fileInput?.files?.[0];
    if (file) applyFile(file);
    else clearFile();
  };

  pickBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openPicker();
  });

  dropzone?.addEventListener('click', () => openPicker());

  dropzone?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openPicker();
    }
  });

  fileInput?.addEventListener('change', readFileFromInput);

  dropzone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('document-upload-card__dropzone--dragover');
  });

  dropzone?.addEventListener('dragleave', () => {
    dropzone.classList.remove('document-upload-card__dropzone--dragover');
  });

  dropzone?.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('document-upload-card__dropzone--dragover');
    const file = e.dataTransfer?.files?.[0];
    if (!file || !fileInput) return;

    const dt = new DataTransfer();
    dt.items.add(file);
    fileInput.files = dt.files;
    applyFile(file);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const file = fileInput?.files?.[0];
    if (!file) {
      window.UI?.toast('Выберите файл для загрузки', 'warning');
      return;
    }

    const categoryTab = getActiveTabId('doc-upload-category');
    const ownerTab = getActiveTabId('doc-upload-owner');
    const category = CATEGORY_BY_TAB[categoryTab] || 'tests';
    const patientName = OWNER_BY_TAB[ownerTab]?.() || resolveFamilyPatientName('mine');

    if (submitBtn) submitBtn.disabled = true;

    try {
      await uploadDocument(file, { category, owner: ownerTab, patientName });
      window.UI?.toast('Документ успешно загружен', 'success');
      navigate('#/patient/documents');
    } catch (err) {
      window.UI?.toast(err.message || 'Не удалось загрузить файл', 'error');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

function syncAppointmentDatetime(form) {
  const date = form.querySelector('#date-step')?.value;
  const time = form.querySelector('#time-step')?.value;
  const dateInput = document.querySelector('[data-appointment-date-input]');

  if (dateInput && date) dateInput.value = date;
  if (!date || !time) return;

  const datetimeInput = form.querySelector('#datetime, [name="datetime"]');
  if (datetimeInput) datetimeInput.value = `${date}T${time}`;
}

function readFormDraft(form) {
  return {
    clinic: form.querySelector('#clinic, [name="clinic"]')?.value || '—',
    doctor: form.querySelector('#doctor, [name="doctor"]')?.value || '—',
    specialty: form.querySelector('#spec, [name="spec"]')?.value || '—',
    patient: form.querySelector('#patient, [name="patient"]')?.value || null,
  };
}

function saveFormDraft(form, extra = {}) {
  State.appointmentDraft = {
    ...(State.appointmentDraft || {}),
    ...readFormDraft(form),
    ...extra,
  };
}

function bindAppointmentWizard() {
  const form = document.getElementById('appointment-form');
  if (!form) return;

  const patientSelect = form.querySelector('#patient, [name="patient"]');
  if (patientSelect) {
    const names = ['mine', 'ivan', 'sofia', 'misha'].map((id) => resolveFamilyPatientName(id));
    patientSelect.innerHTML = names.map((name) => `<option>${name}</option>`).join('');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const hash = location.hash;

    if (hash.includes('/success')) {
      navigate('#/patient/appointments');
      return;
    }

    if (hash.includes('/confirm')) {
      const reason = document.querySelector('[data-appointment-reason]')?.value?.trim() || '';
      saveFormDraft(form, {
        date: State.appointmentDraft?.date,
        time: State.appointmentDraft?.time,
        reason,
      });

      try {
        await createAppointment(State.appointmentDraft || {});
        window.UI?.toast('Запись подтверждена', 'success');
        navigate('#/patient/appointments/new/success');
      } catch (err) {
        window.UI?.toast(err.message, 'error');
      }
      return;
    }

    if (hash.includes('/new/datetime')) {
      const date = document.querySelector('#date-step')?.value;
      const time = document.querySelector('#time-step')?.value;

      if (!date || !time) {
        window.UI?.toast('Выберите дату и время', 'warning');
        return;
      }

      if (isBeforeToday(date)) {
        window.UI?.toast('Нельзя выбрать прошедшую дату', 'warning');
        return;
      }

      syncAppointmentDatetime(form);
      saveFormDraft(form, { date, time });
      navigate('#/patient/appointments/new/confirm');
      return;
    }

    if (hash.includes('/new/doctor')) {
      saveFormDraft(form);
      navigate('#/patient/appointments/new/datetime');
      return;
    }

    if (hash.includes('/new/specialty')) {
      saveFormDraft(form);
      navigate('#/patient/appointments/new/doctor');
      return;
    }

    saveFormDraft(form);
    navigate('#/patient/appointments/new/specialty');
  });

  const requestSubmit = () => {
    if (typeof form.requestSubmit === 'function') {
      form.requestSubmit();
    } else {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }
  };

  document.querySelectorAll('[data-appointment-clinic]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const clinic = chip.dataset.appointmentClinic;
      const clinicSelect = form.querySelector('#clinic, [name="clinic"]');
      if (clinicSelect && clinic) clinicSelect.value = clinic;
      document.querySelectorAll('[data-appointment-clinic]').forEach((el) => {
        el.classList.toggle('appointment-facility-chip--selected', el === chip);
      });
      saveFormDraft(form, { clinic });
      requestSubmit();
    });
  });

  document.querySelectorAll('[data-appointment-specialty]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const specialty = chip.dataset.appointmentSpecialty;
      const specialtySelect = form.querySelector('#spec, [name="spec"]');
      if (specialtySelect && specialty) specialtySelect.value = specialty;
      document.querySelectorAll('[data-appointment-specialty]').forEach((el) => {
        el.classList.toggle('appointment-facility-chip--selected', el === chip);
      });
      saveFormDraft(form, { specialty });
      requestSubmit();
    });
  });

  document.querySelectorAll('[data-appointment-doctor]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const doctor = chip.dataset.appointmentDoctor;
      const doctorSelect = form.querySelector('#doctor, [name="doctor"]');
      if (doctorSelect && doctor) doctorSelect.value = doctor;
      document.querySelectorAll('[data-appointment-doctor]').forEach((el) => {
        el.classList.toggle('appointment-facility-chip--selected', el === chip);
      });
      saveFormDraft(form, { doctor });
      requestSubmit();
    });
  });

  applyWizardDraftToPage(document);

  const datetimePanel = document.querySelector('.appointment-step--datetime');
  if (datetimePanel) {
    const draft = State.appointmentDraft || {};
    const initialDate = draft.date && !isBeforeToday(draft.date)
      ? draft.date
      : toISODate(new Date());

    const calendar = initAppointmentCalendar(
      datetimePanel.querySelector('[data-appointment-calendar]'),
      {
        selectedDate: initialDate,
        onDateChange: (iso) => {
          const dateStep = form.querySelector('#date-step');
          const dateInput = datetimePanel.querySelector('[data-appointment-date-input]');
          if (dateStep) dateStep.value = iso;
          if (dateInput) dateInput.value = iso;
          saveFormDraft(form, { date: iso });
          syncAppointmentDatetime(form);
        },
      }
    );

    const dateStep = form.querySelector('#date-step');
    const dateInput = datetimePanel.querySelector('[data-appointment-date-input]');
    if (dateStep) dateStep.value = initialDate;
    if (dateInput) {
      dateInput.value = initialDate;
      dateInput.min = toISODate(new Date());
      dateInput.addEventListener('change', () => {
        const iso = dateInput.value;
        if (!iso || isBeforeToday(iso)) {
          window.UI?.toast('Нельзя выбрать прошедшую дату', 'warning');
          dateInput.value = dateStep?.value || initialDate;
          return;
        }
        if (dateStep) dateStep.value = iso;
        calendar?.setSelectedDate(iso);
        saveFormDraft(form, { date: iso });
        syncAppointmentDatetime(form);
      });
    }

    datetimePanel.querySelectorAll('[data-appointment-time]').forEach((btn) => {
      btn.addEventListener('click', () => {
        datetimePanel.querySelectorAll('[data-appointment-time]').forEach((slot) => {
          slot.classList.toggle('appointment-time-slot--active', slot === btn);
        });

        const timeInput = form.querySelector('#time-step');
        if (timeInput) timeInput.value = btn.dataset.appointmentTime || '';
        saveFormDraft(form, { time: btn.dataset.appointmentTime });
        syncAppointmentDatetime(form);
      });
    });

    if (draft.time) {
      datetimePanel.querySelectorAll('[data-appointment-time]').forEach((btn) => {
        btn.classList.toggle('appointment-time-slot--active', btn.dataset.appointmentTime === draft.time);
      });
      const timeInput = form.querySelector('#time-step');
      if (timeInput) timeInput.value = draft.time;
    }

    syncAppointmentDatetime(form);
  }

  const patientByTabId = {
    mine: () => resolveFamilyPatientName('mine'),
    ivan: () => resolveFamilyPatientName('ivan'),
    sofia: () => resolveFamilyPatientName('sofia'),
    misha: () => resolveFamilyPatientName('misha'),
  };
  const reasonInput = document.querySelector('[data-appointment-reason]');
  reasonInput?.addEventListener('input', () => {
    saveFormDraft(form, { reason: reasonInput.value });
  });

  const familyCards = document.querySelector('[data-tabs="family-cards"]');
  if (familyCards && !familyCards.dataset.patientSync) {
    familyCards.dataset.patientSync = '1';
    familyCards.addEventListener('tabchange', (e) => {
      if (e.detail.groupId !== 'family-cards') return;
      const val = patientByTabId[e.detail.tabId]?.();
      if (patientSelect && val) {
        patientSelect.value = val;
        saveFormDraft(form, { patient: val });
      }
    });
  }
}

function bindAiAssistant() {
  const root = document.querySelector('[data-ai-assistant]');
  if (!root) return;

  const MODE_COPY = {
    decode: {
      title: 'Привет! Режим «Расшифровка» активен.',
      text: 'Прикрепите документ с анализом или заключением — объясню простым языком без медицинского жаргона.',
      placeholder: 'Вставьте текст анализа или заключения — объясню простым языком…',
    },
    translate: {
      title: 'Привет! Режим «Перевод» активен.',
      text: 'Вставьте медицинский текст — переведу на понятный русский язык.',
      placeholder: 'Вставьте текст для перевода…',
    },
    prepare: {
      title: 'Привет! Режим «Подготовка к врачу» активен.',
      text: 'Расскажите о симптомах и цели визита — помогу собрать список вопросов и заметок для приёма.',
      placeholder: 'Опишите симптомы, цель визита или прикрепите документы…',
    },
    questions: {
      title: 'Привет! Режим «Вопросы на приём» активен.',
      text: 'Укажите специализацию врача и повод визита — предложу список вопросов для консультации.',
      placeholder: 'Например: кардиолог, повторный приём, боли в груди…',
    },
  };

  const greetingTitle = root.querySelector('[data-ai-greeting-title]');
  const greetingText = root.querySelector('[data-ai-greeting-text]');
  const greetingTime = root.querySelector('.ai-assistant__time');
  const input = root.querySelector('#chat-input');
  const messages = root.querySelector('#chat-messages');
  const form = root.querySelector('#chat-form');
  const tabs = root.querySelector('[data-tabs="ai-modes"]');

  const formatTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  const applyMode = (modeId) => {
    const copy = MODE_COPY[modeId] || MODE_COPY.decode;
    if (greetingTitle) greetingTitle.textContent = copy.title;
    if (greetingText) greetingText.textContent = copy.text;
    if (input) input.placeholder = copy.placeholder;
    if (greetingTime) {
      const time = formatTime();
      greetingTime.textContent = time;
      greetingTime.setAttribute('datetime', time);
    }
  };

  applyMode('decode');

  tabs?.addEventListener('tabchange', (e) => {
    if (e.detail.groupId !== 'ai-modes') return;
    applyMode(e.detail.tabId);
  });

  root.querySelector('[data-ai-refresh]')?.addEventListener('click', () => {
    if (!messages) return;
    messages.querySelectorAll('.chat__message').forEach((el) => el.remove());
    const activeTab = tabs?.querySelector('.tab--active')?.dataset.tab || 'decode';
    applyMode(activeTab);
    window.UI?.toast('Диалог обновлён', 'success');
  });

  root.querySelector('[data-ai-history]')?.addEventListener('click', () => {
    window.UI?.toast('История диалогов скоро будет доступна', 'info');
  });

  root.querySelector('[data-ai-attach]')?.addEventListener('click', () => {
    window.UI?.toast('Прикрепление документов скоро будет доступно', 'info');
  });

  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form?.requestSubmit?.() || form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }
  });
}

function bindSettingsForm() {
  if (location.hash.includes('/settings')) {
    bindSettingsControls();
  }

  document.querySelectorAll('.modal__footer .btn--primary').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!location.hash.includes('/settings')) return;
      try {
        await saveSettings({});
        window.UI?.toast('Настройки сохранены', 'success');
      } catch (err) {
        window.UI?.toast(err.message, 'error');
      }
    });
  });
}

function bindProfileForm() {
  const form = document.getElementById('profile-edit-form');
  if (!form) return;

  document.querySelectorAll('[data-profile-doctor]').forEach((el) => {
    el.hidden = State.role !== 'doctor';
  });

  const hash = location.hash;
  if (hash.includes('/profile') && hash.includes('edit=1')) {
    requestAnimationFrame(() => window.UI?.openModal('modal-edit-profile'));
  }

  form.addEventListener('submit', async (e) => {
    if (!location.hash.includes('/profile')) return;
    e.preventDefault();
    window.UI?.toast('Профиль сохранён', 'success');
  });
}

function bindChatForm() {
  const form = document.getElementById('chat-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    const messages = document.getElementById('chat-messages');
    if (!input?.value.trim() || !messages) return;

    const question = input.value.trim();
    messages.insertAdjacentHTML(
      'beforeend',
      `<article class="chat__message chat__message--user"><p class="text">${escapeHtml(question)}</p></article>`
    );
    input.value = '';
    messages.scrollTop = messages.scrollHeight;

    setTimeout(() => {
      messages.insertAdjacentHTML(
        'beforeend',
        `<article class="chat__message chat__message--bot"><p class="text">${escapeHtml(getAiReply(question))}</p></article>`
      );
      messages.scrollTop = messages.scrollHeight;
    }, 800);
  });
}

function bindDoctorAccess() {
  const root = document.querySelector('[data-doctor-access]');
  if (!root) return;

  const search = root.querySelector('[data-doctor-access-search]');
  search?.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    root.querySelectorAll('.doctor-access-row').forEach((row) => {
      const haystack = (row.getAttribute('data-search') || row.textContent || '').toLowerCase();
      row.hidden = q.length > 0 && !haystack.includes(q);
    });
  });

  root.addEventListener('click', (e) => {
    const accept = e.target.closest('[data-action="doctor-access-accept"]');
    const decline = e.target.closest('[data-action="doctor-access-decline"]');
    if (accept) {
      const row = accept.closest('.doctor-access-row');
      row?.remove();
      window.UI?.toast('Доступ принят', 'success');
    }
    if (decline) {
      const row = decline.closest('.doctor-access-row');
      row?.remove();
      window.UI?.toast('Запрос отклонён', 'info');
    }
  });
}

function bindDoctorAccessRequest() {
  const form = document.querySelector('[data-doctor-access-request-form]');
  if (!form) return;

  form.querySelector('[data-action="doctor-access-pick-doc"]')?.addEventListener('click', () => {
    window.UI?.toast('Выбор документа будет доступен в следующей версии', 'info');
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const patient = form.querySelector('#patient-access-id')?.value.trim();
    if (!patient) {
      window.UI?.toast('Укажите email пациента или код доступа', 'error');
      return;
    }
    window.UI?.toast('Запрос на доступ отправлен пациенту', 'success');
    navigate('#/doctor/access');
  });
}

function bindNotificationsPage() {
  document.querySelector('[data-action="mark-notifications-read"]')?.addEventListener('click', () => {
    document.querySelectorAll('.notification-item--request').forEach((el) => {
      el.classList.remove('notification-item--request');
    });
    window.UI?.toast('Все уведомления отмечены прочитанными', 'success');
  });

  document.querySelectorAll('.notification-item__actions .btn--primary').forEach((btn) => {
    btn.addEventListener('click', () => {
      const row = btn.closest('.notification-item');
      row?.classList.remove('notification-item--request');
      row?.classList.add('notification-item--access');
      const title = row?.querySelector('.notification-item__title');
      if (title) title.textContent = 'Доступ предоставлен';
      row?.querySelector('.notification-item__actions')?.remove();
      window.UI?.toast('Запрос принят', 'success');
    });
  });

  document.querySelectorAll('.notification-item__actions .btn--outline').forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.closest('.notification-item')?.remove();
      window.UI?.toast('Запрос отклонён', 'info');
    });
  });
}

function bindHelpSearch() {
  const input = document.querySelector('[data-help-search]');
  if (!input) return;

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    document.querySelectorAll('[data-help-item]').forEach((item) => {
      const text = item.textContent?.toLowerCase() || '';
      item.hidden = q.length > 0 && !text.includes(q);
    });
  });
}

function bindGenericActions() {
  document.querySelector('[data-action="access-grant"]')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.UI?.toast('Доступ предоставлен', 'success');
    navigate('#/patient/access');
  });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
