(() => {
  const labels = {
    general: '診療予約（一般診療・再診）',
    vaccine: '予防接種予約（インフルエンザ・各種ワクチン）',
    checkup: '健康診断予約（健診・各種検査）',
  };
  const type = new URLSearchParams(window.location.search).get('type');
  const adminEdit = new URLSearchParams(window.location.search).get('adminEdit') === '1';
  const label = labels[type] || '予約';
  const target = document.querySelector('#booking-type-label');
  const monthLabel = document.querySelector('#booking-month-label');
  const calendarDays = document.querySelector('#booking-calendar-days');
  const timeBand = document.querySelector('#booking-time-band');
  const timeSlots = document.querySelector('#booking-time-slots');
  const selectedDateLabel = document.querySelector('#booking-selected-date');
  const nextButton = document.querySelector('.booking-date-next');
  const selected = { date: null, period: null, time: null };
  const today = new Date();
  let shownMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  try {
    const savedDraft = JSON.parse(sessionStorage.getItem(adminEdit ? 'booking-detail-date-draft' : 'satoClinicBookingDraft') || 'null');
    const savedAppointment = adminEdit ? savedDraft : savedDraft?.appointment;
    if (savedAppointment?.date) {
      selected.date = savedAppointment.date;
      selected.period = savedAppointment.period || null;
      selected.time = savedAppointment.time || null;
      const savedDate = new Date(`${savedAppointment.date}T00:00:00`);
      if (!Number.isNaN(savedDate.getTime())) shownMonth = new Date(savedDate.getFullYear(), savedDate.getMonth(), 1);
      if (selected.period && timeBand) timeBand.value = selected.period;
    }
  } catch { /* Ignore an invalid browser draft and start with a fresh selection. */ }

  const monthText = new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: 'long' });
  const updateSelectionStyles = () => {
    calendarDays?.querySelectorAll('.booking-day').forEach((button) => {
      const activeDate = button.dataset.date === selected.date;
      button.classList.toggle('is-selected', activeDate);
      button.setAttribute('aria-pressed', String(activeDate));
      button.querySelector('.booking-day-number')?.classList.toggle('is-selected', activeDate);
      button.querySelectorAll('.booking-day-period').forEach((period) => {
        period.classList.toggle('is-selected', activeDate && period.dataset.band === selected.period);
      });
    });
  };
  const selectPeriod = (button, band) => {
    selected.date = button.dataset.date;
    selected.period = band;
    selected.time = null;
    timeBand.value = band;
    createTimeSlots();
    updateSelectionStyles();
    updateSelectedDate();
    updateNextButton();
  };

  const createCalendar = () => {
    if (!monthLabel || !calendarDays) return;
    monthLabel.textContent = monthText.format(shownMonth);
    calendarDays.replaceChildren();

    const year = shownMonth.getFullYear();
    const month = shownMonth.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let row;
    let cellIndex = 0;
    const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
    for (let day = 1; day <= daysInMonth; day += 1) {
      while (cellIndex < firstWeekday + day - 1) {
        if (cellIndex % 7 === 0) row = calendarDays.insertRow();
        const emptyCell = row.insertCell();
        emptyCell.setAttribute('aria-hidden', 'true');
        cellIndex += 1;
      }
      if (cellIndex % 7 === 0) row = calendarDays.insertRow();
      const cell = row.insertCell();
      const date = new Date(year, month, day);
      const button = document.createElement('button');
      const weekday = date.getDay();
      button.type = 'button';
      button.className = 'booking-day';
      button.dataset.date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (weekday === 0) button.classList.add('is-sunday');
      if (weekday === 6) button.classList.add('is-saturday');
      const closed = weekday === 0 || weekday === 4;
      const past = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const openDay = !closed && !past;
      // Preview-only sample states until real reservation availability is connected.
      const periodStatus = {
        am: closed ? 'ー' : !openDay ? '×' : day % 13 === 0 ? '×' : day % 7 === 4 ? '△' : '○',
        pm: closed || weekday === 6 ? 'ー' : !openDay ? '×' : day % 11 === 0 ? '×' : day % 7 === 2 ? '△' : '○',
      };
      const available = Object.values(periodStatus).some((status) => status === '○' || status === '△');
      const dayNumber = document.createElement('span');
      dayNumber.className = 'booking-day-number';
      dayNumber.textContent = String(day);
      const availability = document.createElement('span');
      availability.className = 'booking-day-availability';
      [['午前', 'am'], ['午後', 'pm']].forEach(([period, band]) => {
        const statusSymbol = periodStatus[band];
        const row = document.createElement('span');
        row.className = `booking-day-period ${statusSymbol === '○' ? 'is-available' : statusSymbol === '△' ? 'is-limited' : statusSymbol === 'ー' ? 'is-closed' : 'is-unavailable'}`;
        row.dataset.band = band;
        row.dataset.status = statusSymbol;
        const name = document.createElement('span');
        name.textContent = period;
        const status = document.createElement('span');
        status.setAttribute('aria-hidden', 'true');
        status.textContent = statusSymbol;
        row.append(name, status);
        row.addEventListener('click', (event) => {
          event.stopPropagation();
          if (statusSymbol === '×' || statusSymbol === 'ー') {
            return;
          }
          selectPeriod(button, band);
        });
        availability.append(row);
      });
      button.append(dayNumber, availability);
      button.setAttribute('aria-label', `${year}年${month + 1}月${day}日、午前${periodStatus.am}、午後${periodStatus.pm}`);
      if (closed || past) {
        button.disabled = true;
        button.classList.add('is-unavailable');
      } else if (!available) {
        button.disabled = true;
        button.classList.add('is-no-slots');
      } else {
        button.addEventListener('click', () => {
          if (periodStatus.am === '○' || periodStatus.am === '△') selectPeriod(button, 'am');
        });
      }
      if (selected.date === button.dataset.date) {
        button.classList.add('is-selected');
        button.setAttribute('aria-pressed', 'true');
        dayNumber.classList.add('is-selected');
        availability.querySelector(`[data-band="${selected.period}"]`)?.classList.add('is-selected');
      } else if (!button.disabled) {
        button.setAttribute('aria-pressed', 'false');
      }
      cell.append(button);
      cellIndex += 1;
    }
    while (cellIndex < totalCells) {
      if (cellIndex % 7 === 0) row = calendarDays.insertRow();
      const emptyCell = row.insertCell();
      emptyCell.setAttribute('aria-hidden', 'true');
      cellIndex += 1;
    }
  };

  const updateNextButton = () => {
    if (nextButton) nextButton.disabled = !(selected.date && selected.period && selected.time);
  };

  nextButton?.addEventListener('click', () => {
    if (!selected.date || !selected.period || !selected.time) return;
    if (adminEdit) {
      const [hourText, minuteText] = selected.time.split(':');
      const endMinutes = Number(minuteText) + 30;
      const endTime = `${String(Number(hourText) + Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;
      sessionStorage.setItem('booking-detail-pending-appointment', JSON.stringify({ date: selected.date, period: selected.period === 'pm' ? 'afternoon' : 'morning', time: selected.time, endTime }));
      window.location.href = 'booking-detail.html';
      return;
    }
    const draftKey = 'satoClinicBookingDraft';
    let draft = {};
    try { draft = JSON.parse(sessionStorage.getItem(draftKey) || '{}'); } catch { draft = {}; }
    draft.type = type || 'general';
    draft.appointment = { date: selected.date, period: selected.period, time: selected.time };
    sessionStorage.setItem(draftKey, JSON.stringify(draft));
    window.location.href = `booking-information.html?type=${encodeURIComponent(draft.type)}`;
  });

  const updateSelectedDate = () => {
    if (!selectedDateLabel) return;
    if (!selected.date) {
      selectedDateLabel.textContent = '日付未選択';
      return;
    }
    const date = new Date(`${selected.date}T00:00:00`);
    selectedDateLabel.textContent = new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
    }).format(date);
  };

  const createTimeSlots = () => {
    if (!timeSlots || !timeBand) return;
    timeSlots.replaceChildren();
    const selectedDateButton = selected.date
      ? calendarDays?.querySelector(`.booking-day[data-date="${selected.date}"]`)
      : null;
    const selectedBandUnavailable = selectedDateButton
      ?.querySelector(`.booking-day-period[data-band="${timeBand.value}"]`)
      ?.classList.contains('is-unavailable') || false;
    const times = timeBand.value === 'am'
      ? ['9:00', '9:30', '10:00', '10:30', '11:00']
      : ['13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];
    times.forEach((time, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'booking-time-slot';
      const unavailable = selectedBandUnavailable || index === times.length - 1;
      const limited = !unavailable && index === 2;
      const status = document.createElement('span');
      status.className = `booking-time-status ${unavailable ? 'is-unavailable' : limited ? 'is-limited' : 'is-available'}`;
      status.setAttribute('aria-hidden', 'true');
      status.textContent = unavailable ? '×' : limited ? '△' : '○';
      const timeLabel = document.createElement('span');
      timeLabel.textContent = time;
      button.append(status, timeLabel);
      button.setAttribute('aria-label', `${time}、${unavailable ? '選択できません' : limited ? '選択できます、残り枠わずか' : '選択できます'}`);
      button.setAttribute('aria-pressed', 'false');
      if (unavailable) {
        button.disabled = true;
        button.classList.add('is-unavailable');
      } else {
        if (limited) button.classList.add('is-limited');
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
    const selectedButton = calendarDays?.querySelector(`.booking-day[data-date="${selected.date}"]`);
    const unavailable = selectedButton?.querySelector(`[data-band="${timeBand.value}"].is-unavailable`);
    selected.period = unavailable ? null : timeBand.value;
    updateSelectionStyles();
    updateSelectedDate();
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
  if (adminEdit) {
    if (nextButton) nextButton.innerHTML = '日時を確定する<span aria-hidden="true">➧</span>';
    const backLink = document.querySelector('.booking-date-back');
    if (backLink) backLink.href = 'booking-detail.html';
  }
  document.title = `${label}｜予約日時の選択 | 佐藤医院`;
  createCalendar();
  createTimeSlots();
  if (selected.time) {
    const activeSlot = Array.from(timeSlots?.querySelectorAll('.booking-time-slot') || []).find((slot) => slot.querySelector('span:last-child')?.textContent === selected.time);
    activeSlot?.classList.add('is-selected');
    activeSlot?.setAttribute('aria-pressed', 'true');
  }
  updateSelectionStyles();
  updateSelectedDate();
  updateNextButton();
})();
