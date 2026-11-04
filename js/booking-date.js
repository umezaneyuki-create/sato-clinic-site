(() => {
  const labels = {
    general: '診療予約（一般診療・再診）',
    vaccine: '予防接種予約（インフルエンザ・各種ワクチン）',
    checkup: '健康診断予約（健診・各種検査）',
  };
  const type = new URLSearchParams(window.location.search).get('type');
  const label = labels[type] || '予約';
  const target = document.querySelector('#booking-type-label');
  const monthLabel = document.querySelector('#booking-month-label');
  const calendarDays = document.querySelector('#booking-calendar-days');
  const timeBand = document.querySelector('#booking-time-band');
  const timeSlots = document.querySelector('#booking-time-slots');
  const nextButton = document.querySelector('.booking-date-next');
  const selected = { date: null, time: null };
  const today = new Date();
  let shownMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const monthText = new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: 'long' });
  const createCalendar = () => {
    if (!monthLabel || !calendarDays) return;
    monthLabel.textContent = monthText.format(shownMonth);
    calendarDays.replaceChildren();

    const year = shownMonth.getFullYear();
    const month = shownMonth.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let blank = 0; blank < firstWeekday; blank += 1) {
      const empty = document.createElement('span');
      empty.className = 'booking-day-empty';
      empty.setAttribute('aria-hidden', 'true');
      calendarDays.append(empty);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month, day);
      const button = document.createElement('button');
      const weekday = date.getDay();
      button.type = 'button';
      button.className = 'booking-day';
      button.textContent = String(day);
      button.dataset.date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      button.setAttribute('aria-label', `${year}年${month + 1}月${day}日`);
      if (weekday === 0) button.classList.add('is-sunday');
      if (weekday === 6) button.classList.add('is-saturday');
      const closed = weekday === 0 || weekday === 4;
      const past = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      if (closed || past) {
        button.disabled = true;
        button.classList.add('is-unavailable');
      } else {
        button.addEventListener('click', () => {
          selected.date = button.dataset.date;
          calendarDays.querySelectorAll('.booking-day').forEach((item) => {
            const active = item === button;
            item.classList.toggle('is-selected', active);
            item.setAttribute('aria-pressed', String(active));
          });
          updateNextButton();
        });
      }
      if (selected.date === button.dataset.date) {
        button.classList.add('is-selected');
        button.setAttribute('aria-pressed', 'true');
      } else if (!button.disabled) {
        button.setAttribute('aria-pressed', 'false');
      }
      calendarDays.append(button);
    }
  };

  const updateNextButton = () => {
    if (nextButton) nextButton.disabled = !(selected.date && selected.time);
  };

  const createTimeSlots = () => {
    if (!timeSlots || !timeBand) return;
    timeSlots.replaceChildren();
    const times = timeBand.value === 'am'
      ? ['9:00', '9:30', '10:00', '10:30', '11:00']
      : ['13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];
    times.forEach((time, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'booking-time-slot';
      button.textContent = time;
      button.setAttribute('aria-pressed', 'false');
      if (index === times.length - 1) {
        button.disabled = true;
        button.classList.add('is-unavailable');
      } else {
        button.addEventListener('click', () => {
          selected.time = time;
          timeSlots.querySelectorAll('.booking-time-slot').forEach((item) => {
            const active = item === button;
            item.classList.toggle('is-selected', active);
            item.setAttribute('aria-pressed', String(active));
          });
          updateNextButton();
        });
      }
      timeSlots.append(button);
    });
  };

  document.querySelector('#booking-month-prev')?.addEventListener('click', () => {
    shownMonth = new Date(shownMonth.getFullYear(), shownMonth.getMonth() - 1, 1);
    createCalendar();
  });
  document.querySelector('#booking-month-next')?.addEventListener('click', () => {
    shownMonth = new Date(shownMonth.getFullYear(), shownMonth.getMonth() + 1, 1);
    createCalendar();
  });
  timeBand?.addEventListener('change', () => {
    selected.time = null;
    createTimeSlots();
    updateNextButton();
  });
  document.querySelector('#date-filter-tab')?.addEventListener('click', () => {
    document.querySelector('#calendar-tab')?.classList.remove('is-active');
    document.querySelector('#calendar-tab')?.setAttribute('aria-selected', 'false');
    document.querySelector('#date-filter-tab')?.classList.add('is-active');
    document.querySelector('#date-filter-tab')?.setAttribute('aria-selected', 'true');
    document.querySelector('.booking-calendar')?.classList.add('is-date-filter');
  });
  document.querySelector('#calendar-tab')?.addEventListener('click', () => {
    document.querySelector('#date-filter-tab')?.classList.remove('is-active');
    document.querySelector('#date-filter-tab')?.setAttribute('aria-selected', 'false');
    document.querySelector('#calendar-tab')?.classList.add('is-active');
    document.querySelector('#calendar-tab')?.setAttribute('aria-selected', 'true');
    document.querySelector('.booking-calendar')?.classList.remove('is-date-filter');
  });

  if (target) target.textContent = label;
  document.title = `${label}｜予約日時の選択 | 佐藤医院`;
  createCalendar();
  createTimeSlots();
})();
