(() => {
  const storageKey = 'satoClinicBookingDraft';
  const params = new URLSearchParams(location.search);
  const typeLabels = {
    general: '診療予約（一般診療・再診）',
    vaccine: '予防接種予約',
    checkup: '健康診断予約',
  };
  const readDraft = () => {
    try { return JSON.parse(sessionStorage.getItem(storageKey) || 'null'); } catch { return null; }
  };
  const writeDraft = (draft) => sessionStorage.setItem(storageKey, JSON.stringify(draft));
  const draft = readDraft() || {};
  const type = params.get('type') || draft.type || 'general';
  draft.type = type;
  const typeLabel = typeLabels[type] || 'Web予約';
  document.querySelectorAll('#back-to-date, #edit-information').forEach((link) => {
    link.href = `${link.getAttribute('href').split('?')[0]}?type=${encodeURIComponent(type)}`;
  });
  document.querySelectorAll('#booking-type-label').forEach((el) => { el.textContent = typeLabel; });
  const formatDate = (dateValue) => {
    if (!dateValue) return '未選択';
    const date = new Date(`${dateValue}T00:00:00`);
    if (Number.isNaN(date.getTime())) return '未選択';
    return new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }).format(date);
  };
  const displayBooking = () => {
    const appointment = draft.appointment || {};
    const values = {
      'summary-type': typeLabel,
      'summary-visit': type === 'general' ? '再診' : typeLabel.replace(/予約.*/, ''),
      'summary-date': formatDate(appointment.date),
      'summary-band': appointment.period === 'pm' ? '午後（13:00～18:00）' : appointment.period === 'am' ? '午前（9:00～12:00）' : '未選択',
      'summary-time': appointment.time || '未選択',
    };
    Object.entries(values).forEach(([id, value]) => document.querySelectorAll(`#${id}`).forEach((el) => { el.textContent = value; }));
  };
  displayBooking();

  const form = document.querySelector('#patient-form');
  if (form) {
    const yearSelect = form.elements.namedItem('birthYear');
    const monthSelect = form.elements.namedItem('birthMonth');
    const daySelect = form.elements.namedItem('birthDay');
    const addOptions = (select, start, end, suffix, descending = false) => {
      const values = Array.from({ length: Math.abs(end - start) + 1 }, (_, i) => start + i * (descending ? -1 : 1));
      values.forEach((n) => { const option = new Option(`${n}${suffix}`, String(n)); select.add(option); });
    };
    if (yearSelect) addOptions(yearSelect, new Date().getFullYear(), 1900, '年', true);
    if (monthSelect) addOptions(monthSelect, 1, 12, '月');
    if (daySelect) addOptions(daySelect, 1, 31, '日');
    Object.entries(draft.patient || {}).forEach(([name, value]) => {
      const field = form.elements.namedItem(name);
      if (!field) return;
      if (field instanceof RadioNodeList) {
        Array.from(field).forEach((radio) => { radio.checked = radio.value === value; });
      } else field.value = value;
    });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const patient = Object.fromEntries(new FormData(form).entries());
      draft.patient = patient;
      writeDraft(draft);
      location.href = `booking-confirmation.html?type=${encodeURIComponent(type)}`;
    });
  }

  if (location.pathname.endsWith('booking-complete.html')) {
    const patient = draft.patient || {};
    const setText = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value || '—'; };
    setText('completion-reference', draft.reference);
    setText('completion-name', patient.name);
  }
  if (location.pathname.endsWith('booking-confirmation.html')) {
    const patient = draft.patient || {};
    const setText = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value || '—'; };
    const birth = patient.birthYear && patient.birthMonth && patient.birthDay
      ? `${patient.birthYear}年${patient.birthMonth}月${patient.birthDay}日` : '';
    setText('patient-summary-name', patient.name);
    setText('patient-summary-kana', patient.kana);
    setText('patient-summary-email', patient.email);
    setText('patient-summary-phone', patient.phone);
    setText('patient-summary-birth', birth || '—');
    setText('patient-summary-gender', patient.gender);
    setText('patient-summary-insurance', patient.insurance);
    setText('patient-summary-notes', patient.notes);
    setText('confirmation-number', draft.reference || `SC-${Date.now().toString().slice(-8)}`);
    if (!draft.reference) { draft.reference = `SC-${Date.now().toString().slice(-8)}`; writeDraft(draft); }
    const message = document.querySelector('#confirmation-message');
    document.querySelector('#confirm-reservation')?.addEventListener('click', () => {
      draft.confirmedAt = new Date().toISOString();
      writeDraft(draft);
      location.href = `booking-complete.html?type=${encodeURIComponent(type)}`;
    });
    document.querySelector('#cancel-reservation')?.addEventListener('click', () => {
      if (message) { message.hidden = false; message.textContent = '予約キャンセルの送信機能はまだ接続されていません。キャンセルは医院へお電話ください。'; }
    });
  }
})();
