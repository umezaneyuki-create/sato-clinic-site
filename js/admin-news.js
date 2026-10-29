(() => {
  const page = document.querySelector('.admin-info-main');
  if (!page || typeof loadAdminNewsRecords !== 'function') return;

  const tableBody = page.querySelector('#admin-info-table-body');
  const countLabel = page.querySelector('#admin-info-count');
  const pagination = page.querySelector('.admin-info-pagination');
  const searchForm = page.querySelector('.admin-news-filters');
  const categorySelect = searchForm?.querySelector('[name="category"]');
  const statusSelect = searchForm?.querySelector('[name="status"]');
  const sortSelect = searchForm?.querySelector('[name="sort"]');
  const keywordInput = searchForm?.querySelector('[name="q"]');
  const statAll = page.querySelector('[data-stat="all"]');
  const statPublic = page.querySelector('[data-stat="public"]');
  const statPrivate = page.querySelector('[data-stat="private"]');
  const bulkButton = page.querySelector('#admin-info-bulk-button');
  const bulkCancel = page.querySelector('#admin-info-bulk-cancel');
  const bulkResult = page.querySelector('#admin-info-bulk-result');
  const bulkReview = page.querySelector('#admin-info-bulk-review');
  const perPage = () => window.matchMedia('(max-width: 900px)').matches ? 5 : 10;
  const query = new URLSearchParams(window.location.search);
  let bulkMode = query.get('bulk') === '1';
  let confirmationMode = false;
  let isSavingBulk = false;
  const selectedIds = new Set();
  let records = [];
  let currentPage = 1;

  if (bulkMode) {
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.hash}`);
  }

  const savedAction = new URLSearchParams(window.location.search).get('saved');
  const feedback = page.querySelector('#admin-info-feedback');
  if (feedback && (savedAction === 'created' || savedAction === 'updated')) {
    feedback.textContent = savedAction === 'created'
      ? 'お知らせを投稿し、一覧に反映しました。'
      : 'お知らせを更新し、一覧に反映しました。';
    feedback.hidden = false;
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.hash}`);
  }

  const statusLabel = (status) => status === '公開' ? '公開中' : status || '未設定';

  const dateValue = (value) => String(value || '').replace(/[./]/g, '-');
  const sortRecords = (items, sort) => [...items].sort((a, b) => {
    const key = sort === '投稿日（古い順）' ? 'date' : sort === '更新日時（新しい順）' ? 'updatedAt' : 'date';
    const result = dateValue(b[key]).localeCompare(dateValue(a[key]), 'ja');
    return sort === '投稿日（古い順）' ? -result : result;
  });

  const createCell = (text, className = '') => {
    const cell = document.createElement('td');
    if (className) cell.className = className;
    cell.textContent = text || '—';
    return cell;
  };

  const categoryClass = (category) => {
    if (category === '診療案内') return 'admin-category-badge--guide';
    if (category === '健診・予防接種') return 'admin-category-badge--health';
    if (category === '休診情報') return 'admin-category-badge--closed';
    if (category === 'お知らせ') return 'admin-category-badge--notice';
    return 'admin-category-badge--default';
  };

  const renderPagination = (pageNumber, pageCount) => {
    pagination.replaceChildren();
    for (let number = 1; number <= pageCount; number += 1) {
      const link = document.createElement('a');
      link.href = '#news-list';
      link.textContent = String(number);
      if (number === pageNumber) {
        link.className = 'is-current';
        link.setAttribute('aria-current', 'page');
      }
      link.addEventListener('click', (event) => {
        event.preventDefault();
        currentPage = number;
        render();
        page.querySelector('#news-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      pagination.append(link);
    }
    if (pageCount > 1 && pageNumber < pageCount) {
      const next = document.createElement('a');
      next.className = 'next';
      next.href = '#news-list';
      next.innerHTML = '次へ <span aria-hidden="true">›</span>';
      next.addEventListener('click', (event) => {
        event.preventDefault();
        currentPage += 1;
        render();
        page.querySelector('#news-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      pagination.append(next);
    }
  };

  const render = () => {
    const keyword = keywordInput?.value.trim().toLowerCase() || '';
    const selectedCategory = categorySelect?.value || 'すべて';
    const selectedStatus = statusSelect?.value || 'すべて';
    const selectedSort = sortSelect?.value || '投稿日（新しい順）';
    const filtered = sortRecords(records.filter((record) => {
      const matchesKeyword = !keyword || `${record.title} ${record.body}`.toLowerCase().includes(keyword);
      const matchesCategory = selectedCategory === 'すべて' || record.category === selectedCategory;
      const matchesStatus = selectedStatus === 'すべて' || statusLabel(record.status) === selectedStatus;
      return matchesKeyword && matchesCategory && matchesStatus;
    }), selectedSort);
    const rowsToRender = confirmationMode
      ? records.filter((record) => selectedIds.has(String(record.id)))
      : filtered;
    const displayRecords = confirmationMode ? rowsToRender : filtered;
    const pageSize = confirmationMode ? Math.max(1, displayRecords.length) : perPage();
    const pageCount = Math.max(1, Math.ceil(displayRecords.length / pageSize));
    currentPage = Math.min(Math.max(1, currentPage), pageCount);
    const start = (currentPage - 1) * pageSize;
    const visible = displayRecords.slice(start, start + pageSize);

    tableBody.replaceChildren();
    const table = tableBody.closest('table');
    table?.classList.toggle('is-bulk-mode', bulkMode);
    const headRow = table?.querySelector('thead tr');
    if (headRow) {
      headRow.replaceChildren();
      if (bulkMode) {
        const selectionHeading = document.createElement('th');
        selectionHeading.className = 'admin-bulk-select-cell';
        selectionHeading.scope = 'col';
        selectionHeading.textContent = '選択';
        headRow.append(selectionHeading);
      }
      ['投稿日', 'タイトル', 'カテゴリー', '公開状況', '更新日時', '操作'].forEach((label) => {
        const heading = document.createElement('th');
        heading.scope = 'col';
        heading.textContent = label;
        headRow.append(heading);
      });
    }
    visible.forEach((record) => {
      const row = document.createElement('tr');
      if (confirmationMode) row.classList.add('is-pending-bulk-change');
      if (bulkMode) {
        const selectionCell = document.createElement('td');
        selectionCell.className = 'admin-bulk-select-cell';
        const checkbox = document.createElement('input');
        checkbox.className = 'admin-bulk-checkbox';
        checkbox.type = 'checkbox';
        checkbox.checked = selectedIds.has(String(record.id));
        checkbox.disabled = confirmationMode || isSavingBulk;
        checkbox.setAttribute('aria-label', `${record.title}を一括変更の対象にする`);
        checkbox.dataset.recordId = String(record.id);
        selectionCell.append(checkbox);
        row.append(selectionCell);
      }
      row.append(createCell(record.date), createCell(record.title));
      const categoryCell = document.createElement('td');
      const categoryBadge = document.createElement('span');
      categoryBadge.className = `admin-category-badge ${categoryClass(record.category)}`;
      categoryBadge.textContent = record.category || '未分類';
      categoryCell.append(categoryBadge);
      row.append(categoryCell);
      const statusCell = document.createElement('td');
      const status = document.createElement('span');
      const targetStatus = record.status === '公開' ? '非公開' : '公開';
      const shownStatus = confirmationMode ? targetStatus : record.status;
      status.className = shownStatus === '公開' ? 'admin-status is-public' : 'admin-status is-private';
      status.textContent = confirmationMode ? `${statusLabel(shownStatus)}に変更` : statusLabel(shownStatus);
      statusCell.append(status);
      row.append(statusCell, createCell(record.updatedAt));
      const operationCell = document.createElement('td');
      const edit = document.createElement('a');
      edit.className = 'admin-edit-button';
      edit.href = `admin-info-edit.html?id=${encodeURIComponent(record.id)}`;
      edit.textContent = '編集';
      operationCell.append(edit);
      row.append(operationCell);
      tableBody.append(row);
    });

    countLabel.textContent = displayRecords.length ? `${displayRecords.length}件中 ${start + 1}-${Math.min(start + visible.length, displayRecords.length)}件を表示` : '0件';
    statAll.textContent = `${records.length}`;
    statPublic.textContent = `${records.filter((record) => record.status === '公開').length}`;
    statPrivate.textContent = `${records.filter((record) => record.status !== '公開').length}`;
    if (bulkButton) {
      bulkButton.hidden = !bulkMode;
      bulkButton.disabled = isSavingBulk || (!confirmationMode && selectedIds.size === 0);
      bulkButton.textContent = confirmationMode ? '変更を確定' : '一括変更';
    }
    if (bulkCancel) bulkCancel.hidden = !bulkMode || !confirmationMode || isSavingBulk;
    if (bulkReview) {
      const selected = records.filter((record) => selectedIds.has(String(record.id)));
      const toPrivate = selected.filter((record) => record.status === '公開').length;
      const toPublic = selected.length - toPrivate;
      bulkReview.textContent = confirmationMode
        ? `選択した${selected.length}件を確認してください（公開→非公開：${toPrivate}件、非公開→公開：${toPublic}件）。`
        : '';
      bulkReview.hidden = !confirmationMode;
    }
    renderPagination(currentPage, pageCount);
  };

  tableBody?.addEventListener('change', (event) => {
    const checkbox = event.target.closest('.admin-bulk-checkbox');
    if (!checkbox || confirmationMode) return;
    if (checkbox.checked) selectedIds.add(checkbox.dataset.recordId);
    else selectedIds.delete(checkbox.dataset.recordId);
    render();
  });

  bulkButton?.addEventListener('click', async () => {
    if (!confirmationMode) {
      if (!selectedIds.size) return;
      confirmationMode = true;
      currentPage = 1;
      render();
      return;
    }

    const selectedRecords = records.filter((record) => selectedIds.has(String(record.id)));
    if (!selectedRecords.length || isSavingBulk) return;
    isSavingBulk = true;
    if (bulkResult) {
      bulkResult.hidden = true;
      bulkResult.textContent = '';
    }
    render();

    const results = await Promise.allSettled(selectedRecords.map(async (record) => {
      const targetStatus = record.status === '公開' ? '非公開' : '公開';
      const response = await fetch(`${NEWS_API_BASE}/admin/news/${encodeURIComponent(record.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: record.title,
          body: record.body,
          category: record.category,
          date: dateValue(record.date),
          status: targetStatus,
          relatedUrl: record.relatedUrl || null,
          thumbnailPath: record.thumbnailPath || null,
        }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return { id: String(record.id), from: record.status, to: targetStatus };
    }));

    const succeeded = results.filter((result) => result.status === 'fulfilled').map((result) => result.value);
    const failedCount = results.length - succeeded.length;
    const madePublic = succeeded.filter((result) => result.to === '公開').length;
    const madePrivate = succeeded.filter((result) => result.to === '非公開').length;
    const successfulById = new Map(succeeded.map((result) => [result.id, result.to]));
    records = records.map((record) => successfulById.has(String(record.id))
      ? { ...record, status: successfulById.get(String(record.id)) }
      : record);

    try {
      const refreshed = await loadAdminNewsRecords();
      if (refreshed.length) records = refreshed;
    } catch (error) {
      console.error('一括変更後の一覧を再読み込みできませんでした。', error);
    }

    const messages = [];
    if (madePublic) messages.push(`${madePublic}件を公開にしました。`);
    if (madePrivate) messages.push(`${madePrivate}件を非公開にしました。`);
    if (failedCount) messages.push(`${failedCount}件の変更に失敗しました。`);
    if (bulkResult && messages.length) {
      bulkResult.textContent = messages.join(' ');
      bulkResult.hidden = false;
    }
    selectedIds.clear();
    confirmationMode = false;
    isSavingBulk = false;
    bulkMode = false;
    currentPage = 1;
    render();
  });

  bulkCancel?.addEventListener('click', () => {
    confirmationMode = false;
    render();
  });

  searchForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    currentPage = 1;
    render();
  });
  searchForm?.addEventListener('reset', () => {
    window.setTimeout(() => {
      currentPage = 1;
      render();
    });
  });
  [categorySelect, statusSelect, sortSelect].forEach((control) => control?.addEventListener('change', () => {
    currentPage = 1;
    render();
  }));

  loadAdminNewsRecords().then((loadedRecords) => {
    records = loadedRecords;
    const categories = [...new Set(records.map((record) => record.category).filter(Boolean))];
    if (categorySelect) {
      categorySelect.replaceChildren(new Option('すべて', 'すべて'), ...categories.map((category) => new Option(category, category)));
    }
    render();
  });
})();
