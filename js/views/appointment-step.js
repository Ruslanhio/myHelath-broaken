import { State } from '../state.js';
import { buildPatientToTabMap } from '../user-display.js';
import {
  formatConfirmDateTime,
  formatPatientShort,
  isBeforeToday,
  toISODate,
} from './appointment-calendar.js';

const STEP_TO_TAB = {
  form: 'facility',
  specialty: 'specialty',
  doctor: 'doctor',
  datetime: 'datetime',
  confirm: 'confirm',
};

function formatConfirmClinic(clinic) {
  if (!clinic) return '—';
  if (/^клиника/i.test(clinic.trim())) return clinic;
  return `Клиника «${clinic}»`;
}

function fillAppointmentConfirm(wrapper, draft) {
  const set = (sel, val) => {
    const el = wrapper.querySelector(sel);
    if (el) el.textContent = val || '—';
  };
  set('[data-confirm-doctor]', draft.doctor);
  set('[data-confirm-clinic]', formatConfirmClinic(draft.clinic));
  set('[data-confirm-datetime]', formatConfirmDateTime(draft.date, draft.time));
  set('[data-confirm-patient]', formatPatientShort(draft.patient));

  const reasonInput = wrapper.querySelector('[data-appointment-reason]');
  if (reasonInput && draft.reason != null) reasonInput.value = draft.reason;
}

function setSelectValue(form, selector, value) {
  const el = form.querySelector(selector);
  if (!el || !value) return;
  const option = [...el.options].find((opt) => opt.value === value || opt.text === value);
  if (option) el.value = option.value;
}

export function applyWizardDraftToPage(root) {
  const draft = State.appointmentDraft;
  if (!draft) return;

  const scope = root || document;
  const form = scope.querySelector('#appointment-form') || document.getElementById('appointment-form');
  if (!form) return;

  setSelectValue(form, '#clinic, [name="clinic"]', draft.clinic);
  setSelectValue(form, '#spec, [name="spec"]', draft.specialty);
  setSelectValue(form, '#doctor, [name="doctor"]', draft.doctor);
  setSelectValue(form, '#patient, [name="patient"]', draft.patient);

  scope.querySelectorAll('[data-appointment-clinic]').forEach((chip) => {
    chip.classList.toggle(
      'appointment-facility-chip--selected',
      chip.dataset.appointmentClinic === draft.clinic
    );
  });

  scope.querySelectorAll('[data-appointment-specialty]').forEach((chip) => {
    chip.classList.toggle(
      'appointment-facility-chip--selected',
      chip.dataset.appointmentSpecialty === draft.specialty
    );
  });

  scope.querySelectorAll('[data-appointment-doctor]').forEach((chip) => {
    chip.classList.toggle(
      'appointment-facility-chip--selected',
      chip.dataset.appointmentDoctor === draft.doctor
    );
  });

  const patientToTab = buildPatientToTabMap();
  const tabId = patientToTab[draft.patient];
  if (tabId && window.UI) {
    window.UI.activateTab('family-cards', tabId, { root: scope, silent: true });
  }

  if (draft.date) {
    const dateStep = form.querySelector('#date-step');
    if (dateStep) dateStep.value = draft.date;
    const dateInput = scope.querySelector('[data-appointment-date-input]');
    if (dateInput) dateInput.value = draft.date;
  }

  if (draft.time) {
    const timeStep = form.querySelector('#time-step');
    if (timeStep) timeStep.value = draft.time;
    scope.querySelectorAll('[data-appointment-time]').forEach((btn) => {
      btn.classList.toggle('appointment-time-slot--active', btn.dataset.appointmentTime === draft.time);
    });
  }

  const reasonInput = scope.querySelector('[data-appointment-reason]');
  if (reasonInput && draft.reason != null) reasonInput.value = draft.reason;
}

export function applyDatetimeSelection(wrapper, date, time) {
  const dateInput = wrapper.querySelector('#date-step');
  const timeInput = wrapper.querySelector('#time-step');
  const datetimeInput = wrapper.querySelector('#datetime');
  const dateField = wrapper.querySelector('[data-appointment-date-input]');

  const safeDate = date && !isBeforeToday(date) ? date : toISODate(new Date());

  if (dateInput) dateInput.value = safeDate;
  if (dateField) dateField.value = safeDate;
  if (timeInput) timeInput.value = time || '';
  if (datetimeInput && safeDate && time) datetimeInput.value = `${safeDate}T${time}`;

  wrapper.querySelectorAll('[data-appointment-time]').forEach((btn) => {
    const isActive = Boolean(time) && btn.dataset.appointmentTime === time;
    btn.classList.toggle('appointment-time-slot--active', isActive);
  });
}

export function applyAppointmentStep(wrapper, step) {
  const wizardShell = wrapper.querySelector('[data-appointment-wizard-shell]');
  const wizard = wrapper.querySelector('[data-appointment-wizard]');
  const successBlock = wrapper.querySelector('[data-appointment-success]');
  const familyTop = wrapper.querySelector('.appointment-new__top');
  if (!wizard && !wizardShell) return;

  if (step === 'success') {
    if (wizardShell) wizardShell.hidden = true;
    if (successBlock) successBlock.hidden = false;
    return;
  }

  if (wizardShell) wizardShell.hidden = false;
  if (successBlock) successBlock.hidden = true;

  const tabId = STEP_TO_TAB[step] || 'facility';
  window.UI?.activateTab('appointment-wizard', tabId, { root: wrapper, silent: true });

  applyWizardDraftToPage(wrapper);

  if (step === 'confirm') {
    const draft = State.appointmentDraft || {};
    fillAppointmentConfirm(wrapper, draft);
  }

  if (step === 'datetime') {
    const draft = State.appointmentDraft || {};
    const defaultDate = draft.date && !isBeforeToday(draft.date)
      ? draft.date
      : toISODate(new Date());
    applyDatetimeSelection(wrapper, defaultDate, draft.time || '');
  }
}
