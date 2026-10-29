(() => {
  const form = document.querySelector('.admin-news-editor');
  const error = document.querySelector('#news-edit-load-error');
  if (!form || !error || typeof loadAdminNewsRecords !== 'function') return;

  const params = new URLSearchParams(window.location.search);
  const recordId = params.get('id');
  const titleQuery = params.get('title');
  const registerButtons = document.querySelectorAll('[data-news-register]');

  function setLoading(isLoading) {
    form.querySelectorAll('input, select, textarea').forEach((control) => { control.disabled = isLoading; });
    registerButtons.forEach((button) => { button.disabled = isLoading; });
  }

  setLoading(true);

  function showLoadError() {
    error.hidden = false;
    form.hidden = true;
    document.querySelectorAll('[data-news-register]').forEach((button) => { button.disabled = true; });
  }

  function toInputDate(value) {
    const text = String(value || '').trim();
    const match = text.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})/);
    if (match) return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
    const googleDate = text.match(/^Date\((\d{4}),(\d{1,2}),(\d{1,2})\)$/);
    if (googleDate) return `${googleDate[1]}-${String(Number(googleDate[2]) + 1).padStart(2, '0')}-${googleDate[3].padStart(2, '0')}`;
    return '';
  }

  loadAdminNewsRecords().then((records) => {
    const record = recordId
      ? records.find((item) => item.id === recordId)
      : titleQuery
        ? records.find((item) => item.title === titleQuery)
        : null;
    if (!record) {
      showLoadError();
      return;
    }

    form.dataset.recordId = record.id;
    const originalDate = toInputDate(record.date);
    form.dataset.originalValues = JSON.stringify({
      title: record.title || '',
      category: record.category || '',
      date: originalDate,
      status: record.status || '',
      body: record.body || '',
      url: record.relatedUrl || '',
    });
    form.elements.title.value = record.title || '';
    form.elements.date.value = originalDate;
    form.elements.body.value = record.body || '';
    form.elements.url.value = record.relatedUrl || '';
    const categorySelect = form.elements.category;
    if (record.category && ![...categorySelect.options].some((option) => option.value === record.category)) {
      categorySelect.add(new Option(record.category, record.category));
    }
    categorySelect.value = record.category || '';
    const statusRadio = [...form.querySelectorAll('input[name="status"]')].find((radio) => radio.value === record.status);
    if (statusRadio) statusRadio.checked = true;
    setLoading(false);
  }).catch((loadError) => {
    console.error('お知らせの編集データを読み込めませんでした。', loadError);
    showLoadError();
  });
})();
