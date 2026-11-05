(() => {
  const form = document.querySelector('#booking-filters');
  const table = document.querySelector('.booking-list-table');
  const resultCount = document.querySelector('[data-result-count]');
  const rows = [...table.querySelectorAll('tbody tr[data-type]')];
  const emptyRow = table.querySelector('.booking-list-empty');
  const customSelects = [];
  const statusDisplays = {
    received: { label: '受付済', className: 'status-received', icon: '<b>✓</b>' },
    scheduled: { label: '来院予定', className: 'status-scheduled', icon: '<img src="assets/images/icon-calendar-check.png" alt="">' },
    complete: { label: '完了', className: 'status-complete', icon: '<b>✓</b>' },
    cancelled: { label: 'キャンセル', className: 'status-cancelled', icon: '<b>×</b>' }
  };
  const getRowKey = (row) => row.dataset.bookingKey || [row.dataset.date, row.dataset.time, row.cells[1].textContent.trim()].join('|');
  const getRowStatus = (row) => row.dataset.status || [...row.querySelector('.booking-status').classList]
    .find((className) => className.startsWith('status-'))?.slice('status-'.length) || 'scheduled';
  const applyRowStatus = (row, statusKey) => {
    const display = statusDisplays[statusKey];
    const status = row.querySelector('.booking-status');
    if (!display || !status) return;
    row.dataset.status = statusKey;
    status.className = `booking-status ${display.className}`;
    status.innerHTML = `${display.icon}${display.label}`;
  };
  let statusOverrides = {};
  let updateTimeOverrides = {};
  let editOverrides = {};
  try {
    statusOverrides = JSON.parse(sessionStorage.getItem('booking-list-status-overrides') || '{}');
    updateTimeOverrides = JSON.parse(sessionStorage.getItem('booking-list-update-times') || '{}');
    editOverrides = JSON.parse(sessionStorage.getItem('booking-list-edit-overrides') || '{}');
  } catch {
    statusOverrides = {};
    updateTimeOverrides = {};
    editOverrides = {};
  }
  rows.forEach((row) => {
    row.dataset.bookingKey ||= [row.dataset.date, row.dataset.time, row.cells[1].textContent.trim()].join('|');
    const edit = editOverrides[getRowKey(row)];
    if (edit) {
      if (edit.date) row.dataset.date = edit.date;
      if (edit.period) row.dataset.period = edit.period;
      if (edit.time) {
        row.dataset.time = edit.time.replace(/\s/g, '').replace('～', '-').replace(/(^|-)\d(?=:)/g, (_match, prefix) => `${prefix}0`);
        const pill = row.cells[0].querySelector('.time-pill');
        if (pill) {
          const icon = pill.querySelector('img');
          pill.replaceChildren(...(icon ? [icon] : []), document.createTextNode(edit.time));
        }
      }
      if (edit.name) row.cells[1].textContent = `${edit.name} 様`;
      if (edit.phone) {
        const phone = row.cells[3].querySelector('.booking-phone');
        row.cells[3].replaceChildren(...(phone ? [phone] : []), document.createTextNode(edit.phone));
      }
      if (edit.typeKey) {
        row.dataset.type = edit.typeKey;
        const type = row.cells[2].querySelector('.booking-type');
        if (type) {
          const typeMap = {
            '一般診療': ['type-general', 'assets/images/icon-stethoscope.png'],
            '予防接種': ['type-vaccine', 'assets/images/icon-syringe.png'],
            '健康診断': ['type-checkup', 'assets/images/icon-heart.png']
          };
          const [className, iconPath] = typeMap[edit.typeKey] || typeMap['一般診療'];
          type.className = `booking-type ${className}`;
          const icon = document.createElement('img');
          icon.src = iconPath;
          icon.alt = '';
          type.replaceChildren(icon, document.createTextNode(edit.typeKey));
        }
      }
    }
    applyRowStatus(row, statusOverrides[getRowKey(row)] || getRowStatus(row));
  });
  const announcement = document.querySelector('#booking-list-announcement');
  try {
    const message = sessionStorage.getItem('booking-list-announcement-text');
    if (message && announcement) {
      announcement.textContent = message;
      announcement.hidden = false;
      sessionStorage.removeItem('booking-list-announcement-text');
    }
  } catch {
    // Keep the list usable if session storage is unavailable.
  }

  document.querySelectorAll('.booking-list-filters select, .booking-list-pagination select').forEach((select, index) => {
    const root = document.createElement('div');
    root.className = 'booking-custom-select';
    const trigger = document.createElement('button');
    const listboxId = `booking-select-options-${index + 1}`;
    trigger.type = 'button';
    trigger.className = 'booking-custom-select-trigger';
    trigger.setAttribute('role', 'combobox');
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', listboxId);
    trigger.setAttribute('aria-label', select.getAttribute('aria-label') || select.closest('label')?.querySelector('span')?.textContent || '選択');

    const listbox = document.createElement('div');
    listbox.className = 'booking-custom-select-listbox';
    listbox.id = listboxId;
    listbox.setAttribute('role', 'listbox');
    listbox.hidden = true;
    const options = [...select.options].map((option) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'booking-custom-select-option';
      button.setAttribute('role', 'option');
      button.dataset.value = option.value;
      button.textContent = option.textContent;
      button.addEventListener('click', () => {
        select.value = option.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        refresh();
        close();
        trigger.focus();
      });
      button.addEventListener('keydown', (event) => {
        const siblings = [...listbox.querySelectorAll('[role="option"]')];
        const currentIndex = siblings.indexOf(button);
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          siblings[(currentIndex + (event.key === 'ArrowDown' ? 1 : siblings.length - 1)) % siblings.length].focus();
        } else if (event.key === 'Home' || event.key === 'End') {
          event.preventDefault();
          siblings[event.key === 'Home' ? 0 : siblings.length - 1].focus();
        } else if (event.key === 'Escape') {
          event.preventDefault();
          close();
          trigger.focus();
        }
      });
      listbox.append(button);
      return { option, button };
    });

    function refresh() {
      const selected = options.find(({ option }) => option.value === select.value) || options[0];
      trigger.textContent = selected?.option.textContent || '';
      options.forEach(({ option, button }) => button.setAttribute('aria-selected', String(option.value === select.value)));
    }
    function close() {
      listbox.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      root.classList.remove('is-open');
    }
    function open() {
      document.querySelectorAll('.booking-custom-select.is-open').forEach((other) => {
        if (other !== root) {
          other.classList.remove('is-open');
          other.querySelector('.booking-custom-select-listbox').hidden = true;
          other.querySelector('.booking-custom-select-trigger').setAttribute('aria-expanded', 'false');
        }
      });
      listbox.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      root.classList.add('is-open');
      (options.find(({ option }) => option.value === select.value)?.button || options[0]?.button)?.focus();
    }

    trigger.addEventListener('click', () => listbox.hidden ? open() : close());
    trigger.addEventListener('keydown', (event) => {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        if (listbox.hidden) open();
      } else if (event.key === 'Escape') {
        close();
      }
    });
    select.addEventListener('change', refresh);
    select.classList.add('booking-native-select');
    select.tabIndex = -1;
    select.setAttribute('aria-hidden', 'true');
    select.parentNode.insertBefore(root, select);
    root.append(trigger, listbox);
    customSelects.push({ refresh });
    refresh();
  });

  document.addEventListener('pointerdown', (event) => {
    if (!event.target.closest('.booking-custom-select')) {
      document.querySelectorAll('.booking-custom-select.is-open').forEach((root) => {
        root.classList.remove('is-open');
        root.querySelector('.booking-custom-select-listbox').hidden = true;
        root.querySelector('.booking-custom-select-trigger').setAttribute('aria-expanded', 'false');
      });
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      document.querySelectorAll('.booking-custom-select.is-open').forEach((root) => {
        root.classList.remove('is-open');
        root.querySelector('.booking-custom-select-listbox').hidden = true;
        root.querySelector('.booking-custom-select-trigger').setAttribute('aria-expanded', 'false');
      });
    }
  });
  const statusMenus = [...table.querySelectorAll('.booking-status-actions')];
  const closeStatusMenus = (except = null) => {
    statusMenus.forEach((menu) => {
      if (menu !== except) menu.open = false;
    });
  };
  const closeTimers = new WeakMap();

  statusMenus.forEach((menu) => {
    menu.addEventListener('pointerenter', () => window.clearTimeout(closeTimers.get(menu)));
    menu.addEventListener('pointerleave', () => {
      closeTimers.set(menu, window.setTimeout(() => { menu.open = false; }, 350));
    });
    menu.addEventListener('toggle', () => {
      if (menu.open) closeStatusMenus(menu);
    });
  });

  document.addEventListener('pointerdown', (event) => {
    if (!event.target.closest('.booking-status-actions')) closeStatusMenus();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeStatusMenus();
  });

  const filterRows = () => {
    const values = new FormData(form);
    const date = values.get('date');
    const keyword = String(values.get('keyword') || '').trim().toLowerCase();
    const type = values.get('type');
    const slot = values.get('period');
    const isDefault = date === '2026-11-05' && !keyword && type === 'all' && slot === 'all';
    let visible = 0;

    rows.forEach((row) => {
      const searchableText = `${row.cells[1].textContent} ${row.cells[3].textContent}`.toLowerCase();
      const matches = (row.dataset.date === date)
        && (type === 'all' || row.dataset.type === type)
        && (slot === 'all' || row.dataset.time === slot)
        && (!keyword || searchableText.includes(keyword));
      row.hidden = !matches;
      if (matches) visible += 1;
    });

    emptyRow.hidden = visible > 0;
    resultCount.textContent = isDefault ? '（全23件）' : `（全${visible}件）`;
  };


  table.addEventListener('click', (event) => {
    const menuAction = event.target.closest('.booking-status-menu button');
    if (menuAction) {
      const row = menuAction.closest('tr');
      const nextStatus = menuAction.dataset.status;
      if (statusDisplays[nextStatus]) {
        applyRowStatus(row, nextStatus);
        statusOverrides[getRowKey(row)] = nextStatus;
        const updatedAt = new Intl.DateTimeFormat('ja-JP', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date());
        updateTimeOverrides[getRowKey(row)] = updatedAt;
        try {
          sessionStorage.setItem('booking-list-status-overrides', JSON.stringify(statusOverrides));
          sessionStorage.setItem('booking-list-update-times', JSON.stringify(updateTimeOverrides));
        } catch {}
        menuAction.closest('details').open = false;
      }
      return;
    }

    const detail = event.target.closest('.booking-row-detail');
    if (detail) {
      const row = detail.closest('tr');
      const visibleRows = rows.filter((bookingRow) => !bookingRow.hidden);
      const records = visibleRows.map((bookingRow) => {
        const rowKey = getRowKey(bookingRow);
        return {
          ...(editOverrides[rowKey] || {}),
          date: bookingRow.dataset.date,
          time: bookingRow.cells[0].textContent.trim(),
          name: bookingRow.cells[1].textContent.trim().replace(/\s*様$/, ''),
          type: bookingRow.cells[2].textContent.trim(),
          typeKey: bookingRow.dataset.type,
          phone: bookingRow.cells[3].textContent.trim().replace(/^☎\s*/, ''),
          status: bookingRow.cells[4].textContent.trim(),
          statusKey: getRowStatus(bookingRow),
          updatedAt: updateTimeOverrides[rowKey] || bookingRow.dataset.updatedAt || '',
          rowKey
        };
      });
      try {
        sessionStorage.setItem('booking-detail-records', JSON.stringify(records));
        sessionStorage.setItem('booking-detail-index', String(visibleRows.indexOf(row)));
        window.location.href = 'booking-detail.html';
      } catch {
        window.alert('予約詳細を開けませんでした。ブラウザーの保存設定をご確認ください。');
      }
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    filterRows();
  });
  form.addEventListener('reset', () => window.setTimeout(() => {
    customSelects.forEach(({ refresh }) => refresh());
    filterRows();
  }, 0));
})();
