/**
 * API-слой (заглушки).
 */
import { State } from './state.js';
import {
  documents,
  appointments,
  notifications,
  accessGrants,
  doctorTasks,
  users,
} from './mock/data.js';
import { formatPatientShort } from './views/appointment-calendar.js';

const delay = (ms = 280) => new Promise((r) => setTimeout(r, ms));

function formatAppointmentDateLabel(iso) {
  if (!iso) return '—';
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day) return '—';
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDoctorName(doctor) {
  if (!doctor) return '—';
  const parts = doctor.trim().split(/\s+/);
  if (parts.length > 2) return parts.slice(1).join(' ');
  return doctor;
}

function formatClinicLabel(clinic) {
  if (!clinic) return '—';
  if (/^клиника/i.test(clinic.trim())) return clinic;
  return clinic;
}

export async function login(email, password, role) {
  await delay();
  if (!email || !password) {
    throw new Error('Введите email и пароль');
  }
  const user = role === 'doctor' ? { ...users.doctor } : { ...users.patient };
  user.email = email;
  return { user, role };
}

export async function getDocuments() {
  await delay();
  if (State.flags.documentsEmpty) return [];
  return [...documents];
}

export async function getDocument(id) {
  await delay();
  const doc = documents.find((d) => d.id === id);
  if (!doc) throw new Error('Документ не найден');
  return { ...doc };
}

const DOC_ICON_BY_CATEGORY = {
  tests: 'images/icon-blood.svg',
  scans: 'images/icon-xray.svg',
  prescriptions: 'images/icon-prescription.svg',
  reports: 'images/icon-doctor.svg',
  vaccines: 'images/icon-vaccine.svg',
};

function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) return '—';
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

function titleFromFileName(name) {
  if (!name) return 'Новый документ';
  return name.replace(/\.[^.]+$/, '') || name;
}

export async function uploadDocument(file, meta = {}) {
  await delay(500);
  if (State.flags.uploadSimulateError) {
    throw new Error('Не удалось загрузить файл. Попробуйте снова.');
  }

  const category = meta.category || 'tests';
  const fileName = file?.name || 'document.pdf';
  const today = new Date();
  const iso = today.toISOString().slice(0, 10);
  const dateLabel = today.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const entry = {
    id: `doc-${Date.now()}`,
    title: titleFromFileName(fileName),
    category,
    lab: 'Загружено',
    date: iso,
    dateLabel,
    status: 'info',
    statusLabel: 'Новое',
    icon: DOC_ICON_BY_CATEGORY[category] || 'images/icon-pdf-preview.svg',
    owner: meta.owner || 'anna',
    patientName: meta.patientName || '',
    pdf: {
      fileName,
      size: formatFileSize(file?.size),
    },
  };

  documents.unshift(entry);
  return { ...entry };
}

export async function getAppointments() {
  await delay();
  if (State.flags.appointmentsEmpty) return [];
  return [...appointments];
}

export async function createAppointment(draft) {
  await delay(400);
  const entry = {
    id: `apt-${Date.now()}`,
    doctorTitle: draft.doctor || `${draft.specialty || '—'} ${formatDoctorName(draft.doctor)}`,
    specialty: draft.specialty || '—',
    doctor: formatDoctorName(draft.doctor),
    clinic: formatClinicLabel(draft.clinic),
    patient: formatPatientShort(draft.patient),
    reason: draft.reason?.trim() || '',
    date: draft.date,
    dateLabel: formatAppointmentDateLabel(draft.date),
    time: draft.time,
    status: 'upcoming',
    statusLabel: 'Предстоящий',
  };
  appointments.unshift(entry);
  return entry;
}

export async function getNotifications() {
  await delay();
  return [...notifications];
}

export async function getAccessGrants() {
  await delay();
  if (State.flags.accessEmpty) return [];
  return [...accessGrants];
}

export async function getDoctorTasks() {
  await delay();
  return [...doctorTasks];
}

export async function saveSettings(_data) {
  await delay(350);
  if (State.flags.settingsSimulateError) {
    throw new Error('Ошибка сохранения настроек');
  }
  return { ok: true };
}

export function getAiReply(question) {
  const q = question.toLowerCase();
  if (q.includes('анализ') || q.includes('кров')) {
    return 'Ваш последний общий анализ крови от 05.05.2026 в норме. Гемоглобин — 135 г/л, лейкоциты — 6.2×10⁹/л.';
  }
  if (q.includes('запис') || q.includes('врач') || q.includes('приём')) {
    return 'У вас 2 предстоящих визита. Перейдите в раздел «Записи» для новой записи.';
  }
  if (q.includes('документ') || q.includes('загруз')) {
    return 'Нажмите «Загрузить документ» в разделе «Документы». Поддерживаются PDF, JPG и PNG до 10 МБ.';
  }
  return 'Спасибо за вопрос! Уточните, пожалуйста, что именно вас интересует.';
}
