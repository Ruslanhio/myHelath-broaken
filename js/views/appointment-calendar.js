const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

const MONTH_NAMES_GENITIVE = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

export function formatDateRu(iso) {
  if (!iso?.includes('-')) return iso || '';
  const [year, month, day] = iso.split('-');
  return `${day}.${month}.${year}`;
}

export function formatConfirmDateTime(iso, time) {
  if (!iso?.includes('-')) return time ? `${iso}, ${time}` : (iso || '—');
  const [, month, day] = iso.split('-').map(Number);
  const monthName = MONTH_NAMES_GENITIVE[month - 1] || '';
  const datePart = monthName ? `${day} ${monthName}` : iso;
  return time ? `${datePart}, ${time}` : datePart;
}

export function formatPatientShort(fullName) {
  if (!fullName) return '—';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) return fullName;
  return `${parts[0]} ${parts[1][0]}.`;
}

export function parseDateRu(value) {
  const match = String(value).trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
}

export function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isBeforeToday(iso) {
  const date = startOfDay(new Date(iso));
  const today = startOfDay(new Date());
  return date < today;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

export function initAppointmentCalendar(container, options = {}) {
  const grid = container.querySelector('[data-appointment-calendar-grid]');
  const title = container.querySelector('[data-appointment-calendar-title]');
  const btnPrev = container.querySelector('[data-appointment-calendar-prev]');
  const btnNext = container.querySelector('[data-appointment-calendar-next]');
  if (!grid || !title) return null;

  let selectedDate = options.selectedDate || null;
  const onDateChange = options.onDateChange || (() => {});

  const today = startOfDay(new Date());
  const initial = selectedDate && !isBeforeToday(selectedDate)
    ? new Date(selectedDate)
    : today;

  let viewYear = initial.getFullYear();
  let viewMonth = initial.getMonth();

  function render() {
    title.textContent = `${MONTH_NAMES[viewMonth]} ${viewYear}`;
    grid.innerHTML = '';

    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const startOffset = (firstOfMonth.getDay() + 6) % 7;
    const gridStart = new Date(viewYear, viewMonth, 1 - startOffset);

    for (let i = 0; i < 42; i += 1) {
      const cellDate = new Date(gridStart);
      cellDate.setDate(gridStart.getDate() + i);

      const iso = toISODate(cellDate);
      const isOutside = cellDate.getMonth() !== viewMonth;
      const isToday = isSameDay(cellDate, today);
      const isSelected = selectedDate === iso;
      const isDisabled = isBeforeToday(iso);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'appointment-calendar__day';
      btn.textContent = String(cellDate.getDate());
      btn.dataset.appointmentDate = iso;
      btn.setAttribute('role', 'gridcell');
      btn.setAttribute('aria-selected', String(isSelected));

      if (isOutside) btn.classList.add('appointment-calendar__day--outside');
      if (isToday) btn.classList.add('appointment-calendar__day--today');
      if (isSelected) btn.classList.add('appointment-calendar__day--selected');
      if (isDisabled) {
        btn.classList.add('appointment-calendar__day--disabled');
        btn.disabled = true;
      }

      if (!isDisabled) {
        btn.addEventListener('click', () => {
          selectedDate = iso;
          onDateChange(iso);
          render();
        });
      }

      grid.appendChild(btn);
    }
  }

  btnPrev?.addEventListener('click', () => {
    viewMonth -= 1;
    if (viewMonth < 0) {
      viewMonth = 11;
      viewYear -= 1;
    }
    render();
  });

  btnNext?.addEventListener('click', () => {
    viewMonth += 1;
    if (viewMonth > 11) {
      viewMonth = 0;
      viewYear += 1;
    }
    render();
  });

  function setSelectedDate(iso) {
    if (iso && isBeforeToday(iso)) return;
    selectedDate = iso || null;
    if (iso) {
      const d = new Date(iso);
      viewYear = d.getFullYear();
      viewMonth = d.getMonth();
    }
    render();
  }

  function getSelectedDate() {
    return selectedDate;
  }

  render();

  return { setSelectedDate, getSelectedDate, render };
}
