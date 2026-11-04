(() => {
  const tbody = document.querySelector('#inquiry-table-body');
  const filters = document.querySelector('#inquiry-filters');
  const count = document.querySelector('#inquiry-count');
  const pagination = document.querySelector('#inquiry-pagination');
  const feedback = document.querySelector('#inquiry-feedback');
  const pageSize = 6;
  const params = new URLSearchParams(window.location.search);
  const view = ['all', 'sent', 'drafts', 'deleted'].includes(params.get('view')) ? params.get('view') : 'all';
  let page = 1;
  let records = [];
  let appliedKeyword = '';
  if (!tbody || !filters || !window.inquiryApi) return;

  document.addEventListener('click', (event) => {
    document.querySelectorAll('.inquiry-actions[open]').forEach((menu) => {
      if (!menu.contains(event.target)) menu.open = false;
    });
  });

  const announce = (message) => {
    feedback.textContent = message;
    feedback.hidden = false;
    window.clearTimeout(announce.timer);
    announce.timer = window.setTimeout(() => { feedback.hidden = true; }, 3500);
  };
  const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };
  const viewRecords = () => {
    const category = filters.elements.category.value;
    const status = filters.elements.status.value;
    const sort = filters.elements.sort.value;
    return records.filter((record) => {
      const text = `${record.name} ${record.email || ''} ${record.subject} ${record.content || ''} ${record.category}`.toLocaleLowerCase('ja');
      return (!appliedKeyword || text.includes(appliedKeyword))
        && (!category || record.category === category)
        && (view === 'drafts' || !status || record.status === status);
    }).sort((a, b) => {
      const aDate = view === 'sent' ? a.sentAt : view === 'drafts' ? a.createdAt : a.receivedAt;
      const bDate = view === 'sent' ? b.sentAt : view === 'drafts' ? b.createdAt : b.receivedAt;
      return sort === 'oldest' ? aDate.localeCompare(bDate) : bDate.localeCompare(aDate);
    });
  };
  const statusClass = (status) => status === '未対応' ? 'is-unhandled' : status === '対応中' ? 'is-progress' : 'is-done';
  const makeCell = (text) => {
    const cell = document.createElement('td');
    cell.textContent = text || '—';
    return cell;
  };
  const linkForRecord = (record) => {
    const detailParams = new URLSearchParams({ id: record.id, sort: filters.elements.sort.value });
    const appliedQuery = appliedKeyword ? String(filters.elements.q.value || '').trim() : '';
    if (appliedQuery) detailParams.set('q', appliedQuery);
    if (filters.elements.category.value) detailParams.set('category', filters.elements.category.value);
    if (filters.elements.status.value) detailParams.set('status', filters.elements.status.value);
    if (view !== 'all') detailParams.set('view', view);
    return `admin-inquiry-detail.html?${detailParams.toString()}`;
  };
  const actionButton = (label, handler, className = '') => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    if (className) button.className = className;
    button.addEventListener('click', handler);
    return button;
  };
  const update = async (action, message) => {
    try {
      await action();
      await load();
      announce(message);
    } catch (error) { announce(error.message); }
  };
  const renderPagination = (total, pages) => {
    pagination.replaceChildren();
    if (!total) return;
    for (let index = 1; index <= pages; index += 1) {
      const button = actionButton(String(index), () => { page = index; render(); });
      if (index === page) { button.className = 'is-current'; button.setAttribute('aria-current', 'page'); }
      pagination.append(button);
    }
    const next = actionButton('次へ ›', () => { page = Math.min(pages, page + 1); render(); }, 'next');
    next.disabled = page >= pages;
    pagination.append(next);
  };
  const render = () => {
    const found = viewRecords();
    const pages = Math.max(1, Math.ceil(found.length / pageSize));
    page = Math.min(page, pages);
    const start = (page - 1) * pageSize;
    const current = found.slice(start, start + pageSize);
    document.querySelector('[data-stat="all"]').textContent = String(records.length);
    document.querySelector('[data-stat="unhandled"]').textContent = String(records.filter((record) => record.status === '未対応').length);
    document.querySelector('[data-stat="done"]').textContent = String(records.filter((record) => record.status === '対応済み').length);
    document.querySelector('#inquiry-sort-label').textContent = filters.elements.sort.value === 'oldest' ? '受付日の古い順で表示中' : '受付日の新しい順で表示中';
    count.textContent = found.length ? `${found.length}件中 ${start + 1}-${start + current.length}件を表示` : '該当するお問い合わせはありません';
    if (view === 'drafts') document.querySelector('#inquiry-sort-label').textContent = filters.elements.sort.value === 'oldest' ? '保存日の古い順で表示中' : '保存日の新しい順で表示中';
    tbody.replaceChildren();
    if (!current.length) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 7;
      cell.className = 'inquiry-empty';
      cell.textContent = '該当するお問い合わせはありません。';
      if (view === 'drafts') cell.textContent = '保存済みの下書きはありません。';
      row.append(cell);
      tbody.append(row);
    }
    current.forEach((record) => {
      const row = document.createElement('tr');
      const recordDate = view === 'sent' ? record.sentAt : view === 'drafts' ? record.createdAt : record.receivedAt;
      row.append(makeCell(formatDate(recordDate)), makeCell(record.name), makeCell(record.category), makeCell(record.subject));
      const statusCell = document.createElement('td');
      const status = document.createElement('span');
      status.className = ['sent', 'drafts'].includes(view) ? '' : `inquiry-status ${statusClass(record.status)}`;
      status.textContent = ['sent', 'drafts'].includes(view) ? '—' : record.status;
      statusCell.append(status);
      row.append(statusCell);
      const replyCell = document.createElement('td');
      const reply = document.createElement('span');
      const hasReply = view === 'sent' || record.replied;
      reply.className = `inquiry-reply ${view === 'drafts' ? 'is-draft' : hasReply ? 'is-sent' : 'is-waiting'}`;
      reply.textContent = view === 'drafts' ? '下書き' : hasReply ? '返信済み' : '未返信';
      replyCell.append(reply);
      row.append(replyCell);
      const operationCell = document.createElement('td');
      const actions = document.createElement('div');
      actions.className = 'inquiry-row-actions';
      const detail = document.createElement('a');
      detail.className = 'inquiry-detail-button';
      detail.href = view === 'drafts'
        ? `admin-inquiry-reply.html?id=${encodeURIComponent(record.inquiryId)}&view=drafts`
        : linkForRecord(view === 'sent' ? { ...record, id: record.inquiryId } : record);
      detail.textContent = view === 'drafts' ? '編集' : '詳細';
      actions.append(detail);
      if (view === 'drafts' || view === 'sent') {
        // Each sent reply is shown as its own row; actions are available on the related inquiry.
      } else if (view === 'deleted') {
        actions.append(actionButton('復元', () => update(() => window.inquiryApi.restore(record.id), 'お問い合わせを復元しました。')));
        actions.append(actionButton('完全削除', () => {
          if (window.confirm('このお問い合わせと返信履歴を完全に削除します。この操作は元に戻せません。')) {
            update(() => window.inquiryApi.remove(record.id, true), 'お問い合わせを完全削除しました。');
          }
        }));
      } else {
        const menu = document.createElement('details');
        menu.className = 'inquiry-actions';
        const summary = document.createElement('summary');
        summary.textContent = '…';
        summary.setAttribute('aria-label', `${record.name} の操作`);
        const menuItems = document.createElement('div');
        menuItems.className = 'inquiry-action-menu';
        const runMenuAction = (action, message) => {
          menu.open = false;
          update(action, message);
        };
        ['未対応', '対応中', '対応済み'].forEach((nextStatus) => menuItems.append(actionButton(`${nextStatus}にする`, () => runMenuAction(
          () => window.inquiryApi.updateStatus(record.id, nextStatus), '対応状況を更新しました。'))));
        menuItems.append(actionButton('削除済みに移動', () => runMenuAction(
          () => window.inquiryApi.remove(record.id), '削除済みメッセージへ移動しました。')));
        menu.append(summary, menuItems);
        actions.append(menu);
      }
      operationCell.append(actions);
      row.append(operationCell);
      tbody.append(row);
    });
    renderPagination(found.length, pages);
  };
  const load = async () => {
    try {
      records = await window.inquiryApi.list(view);
      render();
      if (params.get('saved') === '1') {
        announce('下書きを保存しました。');
        const cleanParams = new URLSearchParams(window.location.search);
        cleanParams.delete('saved');
        const query = cleanParams.toString();
        window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`);
      }
    } catch (error) {
      announce(error.message);
      tbody.innerHTML = '<tr><td colspan="7" class="inquiry-empty">問い合わせを読み込めませんでした。</td></tr>';
    }
  };

  filters.addEventListener('submit', (event) => {
    event.preventDefault();
    appliedKeyword = String(filters.elements.q.value || '').trim().toLocaleLowerCase('ja');
    page = 1;
    render();
  });
  ['category', 'status', 'sort'].forEach((name) => filters.elements[name].addEventListener('change', () => { page = 1; render(); }));
  filters.addEventListener('reset', () => window.setTimeout(() => { appliedKeyword = ''; page = 1; render(); }, 0));
  document.querySelector('#show-unhandled').addEventListener('click', () => {
    filters.elements.status.value = '未対応';
    page = 1;
    render();
    document.querySelector('#inquiry-list').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  filters.elements.q.value = params.get('q') || '';
  appliedKeyword = filters.elements.q.value.trim().toLocaleLowerCase('ja');
  filters.elements.category.value = params.get('category') || '';
  filters.elements.status.value = params.get('status') || '';
  filters.elements.sort.value = params.get('sort') || 'newest';
  const listTitle = document.querySelector('#inquiry-list-title');
  listTitle.lastChild.textContent = view === 'deleted' ? '削除済みメッセージ' : view === 'sent' ? '送信済みメッセージ' : 'お問い合わせ一覧';
  if (view === 'drafts') {
    listTitle.lastChild.textContent = '下書きメッセージ';
    document.querySelector('.admin-inquiry-stats').hidden = true;
    filters.elements.status.closest('label').hidden = true;
    document.querySelector('#inquiry-date-heading').textContent = '保存日';
    filters.elements.sort.options[0].textContent = '保存日（新しい順）';
    filters.elements.sort.options[1].textContent = '保存日（古い順）';
    document.querySelector('#inquiry-sort-label').textContent = '保存日の新しい順で表示中';
  }
  document.querySelectorAll('.admin-nav-items a').forEach((link) => {
    const linkUrl = new URL(link.href, window.location.href);
    const isInquiryLink = linkUrl.pathname.endsWith('/admin-inquiry.html');
    const linkView = linkUrl.searchParams.get('view') || 'all';
    const isCurrent = isInquiryLink && linkView === view;
    link.classList.toggle('is-current', isCurrent);
    if (isCurrent) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  if (view !== 'all') document.querySelector('#show-unhandled').hidden = true;
  if (view === 'deleted') filters.hidden = true;
  load();
})();
