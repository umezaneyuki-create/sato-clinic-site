(() => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const card = document.querySelector('#inquiry-detail-card');
  const fields = document.querySelector('#inquiry-detail-fields');
  const error = document.querySelector('#inquiry-detail-error');
  const feedback = document.querySelector('#inquiry-detail-feedback');
  const backLink = document.querySelector('#inquiry-back-top');
  const backButton = document.querySelector('#inquiry-back-bottom');
  const nextButton = document.querySelector('#next-inquiry');
  const replyButton = document.querySelector('#reply-inquiry');
  if (!card || !fields || !window.inquiryApi) return;

  const query = (params.get('q') || '').trim().toLocaleLowerCase('ja');
  const category = params.get('category') || '';
  const status = params.get('status') || '';
  const sort = params.get('sort') === 'oldest' ? 'oldest' : 'newest';
  const view = ['sent', 'deleted'].includes(params.get('view')) ? params.get('view') : 'all';
  const listUrl = () => {
    const listParams = new URLSearchParams();
    if (params.get('q')) listParams.set('q', params.get('q'));
    if (category) listParams.set('category', category);
    if (status) listParams.set('status', status);
    if (view !== 'all') listParams.set('view', view);
    listParams.set('sort', sort);
    return `admin-inquiry.html${listParams.size ? `?${listParams.toString()}` : ''}#inquiry-list`;
  };
  const detailUrl = (nextRecord) => {
    const nextParams = new URLSearchParams(params);
    nextParams.delete('saved');
    nextParams.set('id', nextRecord.id);
    return `admin-inquiry-detail.html?${nextParams.toString()}`;
  };
  backLink.href = listUrl();
  backButton.href = listUrl();
  const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };
  const renderStatus = (description, value, key) => {
    const badge = document.createElement('span');
    badge.className = key === 'reply'
      ? `inquiry-reply ${value === '返信済み' ? 'is-sent' : 'is-waiting'}`
      : `inquiry-status ${value === '未対応' ? 'is-unhandled' : value === '対応中' ? 'is-progress' : 'is-done'}`;
    badge.textContent = value;
    description.replaceChildren(badge);
  };
  const appendRow = (label, value, key = '') => {
    const row = document.createElement('div');
    const term = document.createElement('dt');
    term.textContent = label;
    const description = document.createElement('dd');
    description.dataset.field = key;
    if (key === 'status' || key === 'reply') renderStatus(description, value, key);
    else description.textContent = value || '—';
    row.append(term, description);
    if (key === 'content') row.classList.add('inquiry-detail-body-row');
    fields.append(row);
  };

  window.inquiryApi.get(id).then(async (record) => {
    const list = await window.inquiryApi.list(view === 'deleted' ? 'deleted' : 'all');
    const filtered = list.filter((item) => {
      const text = `${item.name} ${item.email || ''} ${item.subject} ${item.content || ''} ${item.category}`.toLocaleLowerCase('ja');
      return (!query || text.includes(query)) && (!category || item.category === category) && (!status || item.status === status);
    }).sort((a, b) => sort === 'oldest' ? a.receivedAt.localeCompare(b.receivedAt) : b.receivedAt.localeCompare(a.receivedAt));
    const currentIndex = filtered.findIndex((item) => item.id === (record.inquiryId || record.id));
    const nextRecord = filtered[currentIndex + 1];
    if (record.deletedAt) {
      nextButton.hidden = true;
      replyButton.hidden = true;
    }
    nextButton.disabled = !nextRecord;
    nextButton.addEventListener('click', () => { if (nextRecord) window.location.href = detailUrl(nextRecord); });
    replyButton.addEventListener('click', () => {
      const replyParams = new URLSearchParams(params);
      replyParams.delete('saved');
      replyParams.set('id', record.id);
      window.location.href = `admin-inquiry-reply.html?${replyParams.toString()}`;
    });
    if (params.get('saved') === '1') {
      feedback.textContent = '返信メールをローカル受信箱Mailpitへ送信し、履歴に保存しました。';
      feedback.hidden = false;
    }
    appendRow('受付日', formatDate(record.receivedAt), 'receivedAt');
    appendRow('氏名', record.name, 'name');
    appendRow('メールアドレス', record.email, 'email');
    appendRow('電話番号', record.phone, 'phone');
    appendRow('お問い合わせ種別', record.category, 'category');
    appendRow('件名', record.subject, 'subject');
    const statusRow = document.createElement('div');
    statusRow.className = 'inquiry-detail-status-row';
    fields.append(statusRow);
    const statusTerm = document.createElement('dt');
    statusTerm.textContent = '対応状況';
    const statusDescription = document.createElement('dd');
    renderStatus(statusDescription, record.status, 'status');
    const replyTerm = document.createElement('dt');
    replyTerm.textContent = '返信状況';
    const replyDescription = document.createElement('dd');
    renderStatus(replyDescription, record.replied ? '返信済み' : '未返信', 'reply');
    statusRow.append(statusTerm, statusDescription, replyTerm, replyDescription);
    appendRow('本文', record.content, 'content');
    if (record.replies?.length) {
      const history = document.createElement('div');
      history.className = 'inquiry-detail-reply-history';
      const heading = document.createElement('dt');
      heading.textContent = '返信履歴';
      history.append(heading);
      record.replies.forEach((item) => {
        const entry = document.createElement('dd');
        entry.textContent = `${item.status === '送信済み' ? formatDate(item.sentAt) : '下書き'}　${item.subject}\n${item.content}`;
        history.append(entry);
      });
      fields.append(history);
    }
  }).catch(() => {
    card.hidden = true;
    error.hidden = false;
  });
})();
