(() => {
  const body = document.querySelector('#recent-inquiries-tbody');
  const unrepliedCount = document.querySelector('[data-inquiry-unreplied-count]');
  if (!body || !window.inquiryApi) return;

  const formatReceivedAt = (value) => {
    const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    return match ? `${match[1]}/${match[2]}/${match[3]} ${match[4]}:${match[5]}` : value || '—';
  };

  const statusClass = (status) => ({
    '未対応': 'is-unhandled',
    '対応中': 'is-progress',
    '対応済み': 'is-done',
  }[status] || 'is-unhandled');

  const addCell = (row, value) => {
    const cell = document.createElement('td');
    cell.textContent = value || '—';
    row.append(cell);
  };

  window.inquiryApi.list('all').then((records) => {
    const sorted = [...records].sort((a, b) => String(b.receivedAt || '').localeCompare(String(a.receivedAt || '')));
    if (unrepliedCount) {
      unrepliedCount.textContent = String(records.filter((record) => !record.replied).length);
    }

    body.replaceChildren();
    if (sorted.length === 0) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 4;
      cell.textContent = 'お問い合わせはありません。';
      row.append(cell);
      body.append(row);
      return;
    }

    sorted.slice(0, 5).forEach((record) => {
      const row = document.createElement('tr');
      addCell(row, formatReceivedAt(record.receivedAt));
      addCell(row, record.name);
      addCell(row, record.subject);
      const statusCell = document.createElement('td');
      const status = document.createElement('span');
      status.className = `admin-status ${statusClass(record.status)}`;
      status.textContent = record.status || '未対応';
      statusCell.append(status);
      row.append(statusCell);
      body.append(row);
    });
  }).catch(() => {
    if (unrepliedCount) unrepliedCount.textContent = '—';
    body.replaceChildren();
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 4;
    cell.textContent = '問い合わせを読み込めませんでした。';
    row.append(cell);
    body.append(row);
  });
})();
