(() => {
  const emptyMessage = document.querySelector('#booking-detail-empty');
  const nextButton = document.querySelector('#next-reservation');
  const cancelButton = document.querySelector('#cancel-reservation');
  const reactivateButton = document.querySelector('#reactivate-reservation');
  const editButton = document.querySelector('#edit-reservation');
  let records = [];
  let index = -1;
  let editing = false;
  let draft = null;

  try {
    records = JSON.parse(sessionStorage.getItem('booking-detail-records') || '[]');
    index = Number(sessionStorage.getItem('booking-detail-index'));
    const pending = JSON.parse(sessionStorage.getItem('booking-detail-pending-appointment') || 'null');
    if (pending && records[index]) {
      records[index].date = pending.date;
      records[index].period = pending.period;
      records[index].time = `${pending.time} ～ ${pending.endTime}`;
      sessionStorage.removeItem('booking-detail-pending-appointment');
      sessionStorage.setItem('booking-detail-records', JSON.stringify(records));
    }
    editing = sessionStorage.getItem('booking-detail-editing') === 'true';
  } catch {
    records = [];
  }

  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value || '—';
  };
  const statusLabels = { received: '受付済', scheduled: '来院予定', complete: '完了', cancelled: 'キャンセル' };
  const typeLabels = { '一般診療': '一般診療', '予防接種': '予防接種', '健康診断': '健康診断' };
  const getStatusKey = (record) => record.statusKey || (
    record.status?.includes('キャンセル') ? 'cancelled'
      : record.status?.includes('完了') ? 'complete'
        : record.status?.includes('来院予定') ? 'scheduled' : 'received'
  );
  const formatDate = (dateValue) => {
    if (!dateValue) return '—';
    const date = new Date(`${dateValue}T00:00:00`);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }).format(date);
  };
  const getStartTime = (value = '') => value.match(/\d{1,2}:\d{2}/)?.[0] || '';
  const setEditing = (enabled) => {
    editing = enabled;
    sessionStorage.setItem('booking-detail-editing', String(enabled));
    const record = records[index];
    draft = enabled && record ? { ...record } : null;
    document.querySelectorAll('[data-editable]').forEach((dd) => {
      const field = dd.dataset.editable;
      if (field === 'appointment') {
        dd.classList.toggle('is-editable', enabled);
        dd.setAttribute('role', enabled ? 'button' : '');
        dd.setAttribute('aria-label', enabled ? `${dd.id === 'detail-date' ? '診療日' : '予約時間'}を変更` : '');
        if (enabled) dd.tabIndex = 0;
        else dd.removeAttribute('tabindex');
        return;
      }
      if (!enabled) {
        const value = record?.[field];
        dd.textContent = value || '—';
        dd.removeAttribute('data-editing');
        return;
      }
      const original = record?.[field] || '';
      let control;
      if (field === 'type' || field === 'visit' || field === 'gender' || field === 'insurance') {
        control = document.createElement('select');
        const options = field === 'type' ? [['一般診療', '一般診療'], ['予防接種', '予防接種'], ['健康診断', '健康診断']]
          : field === 'visit' ? [['再診', '再診'], ['初診', '初診'], ['予防接種', '予防接種'], ['健診', '健診']]
            : field === 'gender' ? [['男性', '男性'], ['女性', '女性'], ['その他', 'その他']]
              : [['あり', 'あり'], ['なし', 'なし']];
        options.forEach(([value, label]) => {
          const option = document.createElement('option');
          option.value = value;
          option.textContent = label;
          control.append(option);
        });
        control.value = original;
      } else if (field === 'notes') {
        control = document.createElement('textarea');
        control.rows = 3;
        control.value = original;
      } else {
        control = document.createElement('input');
        control.type = field === 'email' ? 'email' : field === 'birth' ? 'date' : field === 'phone' ? 'tel' : 'text';
        control.value = original;
      }
      control.dataset.editField = field;
      control.setAttribute('aria-label', dd.parentElement.querySelector('dt').textContent);
      dd.replaceChildren(control);
      dd.dataset.editing = 'true';
    });
    if (editButton) editButton.textContent = enabled ? '変更を保存' : '予約内容の変更';
    if (cancelButton) cancelButton.disabled = enabled;
    if (reactivateButton) reactivateButton.disabled = enabled;
    if (nextButton) nextButton.disabled = enabled || index >= records.length - 1;
  };
  const showReservation = () => {
    const record = records[index];
    if (!record) {
      if (emptyMessage) emptyMessage.hidden = false;
      if (nextButton) nextButton.disabled = true;
      return;
    }
    const hour = Number(record.time?.match(/\d{1,2}/)?.[0]);
    const statusKey = getStatusKey(record);
    setText('detail-status', statusLabels[statusKey] || record.status);
    setText('detail-type', record.type);
    setText('detail-visit', record.visit || (record.typeKey === '一般診療' ? '再診' : record.typeKey || '—'));
    setText('detail-date', formatDate(record.date));
    setText('detail-period', record.period === 'afternoon' || hour >= 12 ? '午後（13:00～18:00）' : '午前（9:00～12:00）');
    setText('detail-time', record.time);
    setText('detail-number', record.number);
    setText('detail-received-at', record.receivedAt);
    setText('detail-updated-at', record.updatedAt);
    setText('detail-name', record.name);
    setText('detail-kana', record.kana);
    setText('detail-email', record.email);
    setText('detail-phone', record.phone);
    setText('detail-birth', record.birth);
    setText('detail-gender', record.gender);
    setText('detail-insurance', record.insurance);
    setText('detail-notes', record.notes);
    if (cancelButton) cancelButton.hidden = statusKey === 'cancelled';
    if (reactivateButton) reactivateButton.hidden = statusKey !== 'cancelled';
    if (emptyMessage) emptyMessage.hidden = true;
    if (nextButton) nextButton.disabled = editing || index >= records.length - 1;
    document.title = `${record.name} 様の予約詳細 | 佐藤医院 管理者`;
    if (editing) setEditing(true);
  };

  showReservation();
  nextButton?.addEventListener('click', () => {
    if (editing || index >= records.length - 1) return;
    index += 1;
    sessionStorage.setItem('booking-detail-index', String(index));
    showReservation();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const startDateEdit = () => {
    if (!editing || !draft) return;
    sessionStorage.setItem('booking-detail-editing', 'true');
    sessionStorage.setItem('booking-detail-date-draft', JSON.stringify({
      date: draft.date,
      period: draft.period === 'afternoon' || draft.period === 'pm' || Number(getStartTime(draft.time).split(':')[0]) >= 12 ? 'pm' : 'am',
      time: getStartTime(draft.time),
      type: draft.typeKey || 'general'
    }));
    window.location.href = `booking-date.html?adminEdit=1&type=${encodeURIComponent(draft.typeKey || 'general')}`;
  };
  ['detail-date', 'detail-time'].forEach((id) => document.getElementById(id)?.addEventListener('click', startDateEdit));
  ['detail-date', 'detail-time'].forEach((id) => document.getElementById(id)?.addEventListener('keydown', (event) => {
    if (editing && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); startDateEdit(); }
  }));

  editButton?.addEventListener('click', () => {
    if (!editing) {
      setEditing(true);
      return;
    }
    const record = records[index];
    const updated = { ...record };
    document.querySelectorAll('[data-edit-field]').forEach((control) => {
      updated[control.dataset.editField] = control.value.trim();
    });
    updated.typeKey = updated.type;
    updated.type = typeLabels[updated.type] || updated.type;
    updated.period = updated.period || (Number(getStartTime(updated.time).split(':')[0]) >= 12 ? 'afternoon' : 'morning');
    updated.updatedAt = new Intl.DateTimeFormat('ja-JP', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date());
    records[index] = updated;
    try {
      sessionStorage.setItem('booking-detail-records', JSON.stringify(records));
      const edits = JSON.parse(sessionStorage.getItem('booking-list-edit-overrides') || '{}');
      edits[record.rowKey] = { ...updated };
      sessionStorage.setItem('booking-list-edit-overrides', JSON.stringify(edits));
      const times = JSON.parse(sessionStorage.getItem('booking-list-update-times') || '{}');
      times[record.rowKey] = updated.updatedAt;
      sessionStorage.setItem('booking-list-update-times', JSON.stringify(times));
      sessionStorage.removeItem('booking-detail-editing');
    } catch {
      window.alert('予約内容を保存できませんでした。ブラウザーの保存設定をご確認ください。');
      return;
    }
    setEditing(false);
    showReservation();
  });

  const changeStatusAndReturn = (statusKey, message) => {
    const record = records[index];
    if (!record || editing) return;
    const rowKey = record.rowKey || [record.date, record.time, record.name].join('|');
    try {
      const overrides = JSON.parse(sessionStorage.getItem('booking-list-status-overrides') || '{}');
      overrides[rowKey] = statusKey;
      sessionStorage.setItem('booking-list-status-overrides', JSON.stringify(overrides));
      const updatedAt = JSON.parse(sessionStorage.getItem('booking-list-update-times') || '{}');
      updatedAt[rowKey] = new Intl.DateTimeFormat('ja-JP', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date());
      sessionStorage.setItem('booking-list-update-times', JSON.stringify(updatedAt));
      sessionStorage.setItem('booking-list-announcement-text', message);
      window.location.href = 'booking-list.html';
    } catch {
      window.alert('予約状況を変更できませんでした。ブラウザーの保存設定をご確認ください。');
    }
  };
  cancelButton?.addEventListener('click', () => changeStatusAndReturn('cancelled', '予約をキャンセルにしました'));
  reactivateButton?.addEventListener('click', () => changeStatusAndReturn('scheduled', '予約を有効に戻しました'));
})();
