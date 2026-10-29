(() => {
  const body = document.querySelector('#recent-news-tbody');
  const publicCount = document.querySelector('[data-news-public-count]');
  if (!body || typeof loadAdminNewsRecords !== 'function') return;

  loadAdminNewsRecords().then((records) => {
    const published = records.filter((record) => record.status === '公開');
    if (publicCount) publicCount.textContent = String(published.length);
    body.replaceChildren();
    records.slice(0, 5).forEach((record) => {
      const row = document.createElement('tr');
      [record.date.replaceAll('.', '/'), record.title, record.category].forEach((value) => {
        const cell = document.createElement('td');
        cell.textContent = value || '—';
        row.append(cell);
      });
      const statusCell = document.createElement('td');
      const status = document.createElement('span');
      status.className = record.status === '公開' ? 'admin-status is-public' : 'admin-status is-private';
      status.textContent = record.status === '公開' ? '公開中' : '非公開';
      statusCell.append(status);
      row.append(statusCell);
      const updatedCell = document.createElement('td');
      updatedCell.textContent = record.updatedAt || '—';
      row.append(updatedCell);
      const operationCell = document.createElement('td');
      const edit = document.createElement('a');
      edit.className = 'admin-edit-button';
      edit.href = 'admin-info-edit.html?id=' + encodeURIComponent(record.id);
      edit.textContent = '編集';
      operationCell.append(edit);
      row.append(operationCell);
      body.append(row);
    });
  });
})();

