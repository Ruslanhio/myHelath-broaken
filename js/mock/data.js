/** Моковые данные — готово к замене на API */

export const users = {
  patient: {
    id: 'u-patient-1',
    role: 'patient',
    firstName: 'Анна',
    lastName: 'Морозова',
    fullName: 'Анна Морозова',
    greetingName: 'Анна Морозова',
    shortName: 'Анна М.',
    initials: 'AM',
    roleLabel: 'Пациент',
    email: 'anna.morozova@gmail.com',
  },
  doctor: {
    id: 'u-doctor-1',
    role: 'doctor',
    firstName: 'Анатолий',
    patronymic: 'Сергеевич',
    lastName: 'Ныч',
    fullName: 'Ныч Анатолий Сергеевич',
    greetingName: 'Анатолий Сергеевич',
    shortName: 'Ныч А.С.',
    initials: 'АН',
    roleLabel: 'Врач',
    specialty: 'Кардиолог',
    email: 'doctor@clinic.by',
  },
};

/** Имена членов семьи (кроме текущего пользователя — берётся из users.patient / State.user) */
export const familyRoster = {
  ivan: 'Иван Петров',
  sofia: 'София Морозова',
  misha: 'Миша Морозов',
};

export const documents = [
  {
    id: 'doc-1',
    title: 'Общий анализ крови',
    category: 'tests',
    lab: 'Хеликс',
    date: '2026-04-08',
    dateLabel: '8 апреля 2026',
    status: 'success',
    statusLabel: 'Норма',
    icon: 'images/icon-blood.svg',
  },
  {
    id: 'doc-2',
    title: 'Рентген грудной клетки',
    category: 'scans',
    lab: 'МедСкан',
    date: '2026-03-15',
    dateLabel: '15 марта 2026',
    status: 'neutral',
    statusLabel: 'Просмотрен',
    icon: 'images/icon-xray.svg',
  },
  {
    id: 'doc-3',
    title: 'Рецепт на амоксициллин',
    category: 'prescriptions',
    lab: 'Поликлиника №3',
    date: '2026-02-20',
    dateLabel: '20 февраля 2026',
    status: 'warning',
    statusLabel: 'Активен',
    icon: 'images/icon-prescription.svg',
  },
  {
    id: 'doc-4',
    title: 'Справка о прививке',
    category: 'vaccines',
    lab: 'Городская больница',
    date: '2026-01-10',
    dateLabel: '10 января 2026',
    status: 'success',
    statusLabel: 'Норма',
    icon: 'images/icon-vaccine.svg',
  },
];

export const appointments = [
  {
    id: 'apt-1',
    doctor: 'Иванова Е.П.',
    specialty: 'Педиатр',
    date: '2026-05-25',
    dateLabel: '25 мая 2026',
    time: '10:30',
    status: 'upcoming',
    statusLabel: 'Предстоящий',
  },
  {
    id: 'apt-2',
    doctor: 'Петров А.В.',
    specialty: 'Кардиолог',
    date: '2026-06-04',
    dateLabel: '4 июня 2026',
    time: '14:00',
    status: 'upcoming',
    statusLabel: 'Предстоящий',
  },
];

export const notifications = [
  {
    id: 'n-1',
    title: 'Напоминание о визите',
    text: 'Завтра приём у педиатра в 10:30',
    date: '2026-05-24',
    read: false,
  },
  {
    id: 'n-2',
    title: 'Новый документ',
    text: 'Загружен общий анализ крови',
    date: '2026-04-08',
    read: true,
  },
  {
    id: 'n-3',
    title: 'Доступ предоставлен',
    text: 'Врачу Соколову Д.А. открыт доступ к документам',
    date: '2026-03-01',
    read: true,
  },
];

export const accessGrants = [
  {
    id: 'acc-1',
    name: 'Соколов Дмитрий А.',
    role: 'Врач',
    scope: 'Документы, записи',
    status: 'active',
    statusLabel: 'Активен',
  },
  {
    id: 'acc-2',
    name: 'Клиника «Здоровье+»',
    role: 'Организация',
    scope: 'Анализы',
    status: 'active',
    statusLabel: 'Активен',
  },
];

export const doctorTasks = [
  {
    id: 'task-1',
    patient: 'Морозова А.И.',
    type: 'Консультация',
    time: '10:30',
    status: 'pending',
    statusLabel: 'Ожидает',
  },
  {
    id: 'task-2',
    patient: 'Козлов И.П.',
    type: 'Повторный приём',
    time: '12:00',
    status: 'in-progress',
    statusLabel: 'В работе',
  },
  {
    id: 'task-3',
    patient: 'Сидорова М.В.',
    type: 'Анализ результатов',
    time: '15:30',
    status: 'done',
    statusLabel: 'Завершено',
  },
];

export const familyMembers = [
  { id: 'mine', label: 'Моя' },
  { id: 'ivan', label: 'Иван (муж)' },
  { id: 'sofia', label: 'София (дочь)' },
  { id: 'misha', label: 'Миша (сын)' },
];
