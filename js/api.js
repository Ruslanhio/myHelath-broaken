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

const delay = (ms = 280) => new Promise((r) => setTimeout(r, ms));

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

export async function uploadDocument(_file) {
  await delay(500);
  if (State.flags.uploadSimulateError) {
    throw new Error('Не удалось загрузить файл. Попробуйте снова.');
  }
  return {
    id: `doc-${Date.now()}`,
    title: 'Новый документ',
    status: 'success',
    statusLabel: 'Загружен',
  };
}

export async function getAppointments() {
  await delay();
  if (State.flags.appointmentsEmpty) return [];
  return [...appointments];
}

export async function createAppointment(draft) {
  await delay(400);
  return {
    id: `apt-${Date.now()}`,
    ...draft,
    status: 'upcoming',
    statusLabel: 'Подтверждён',
  };
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
