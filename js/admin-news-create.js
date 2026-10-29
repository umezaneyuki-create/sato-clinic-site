(() => {
  const form = document.querySelector('.admin-news-editor');
  const heading = document.querySelector('.admin-new-page-heading');
  const confirmation = document.querySelector('#news-confirmation');
  if (!form || !heading || !confirmation) return;
  const postButton = confirmation.querySelector('[data-news-post]');
  const submitStatus = confirmation.querySelector('#news-submit-status');

  const fields = {
    title: {
      control: form.elements.title,
      error: document.querySelector('#news-title-error'),
      invalid: (control) => !control.value.trim(),
    },
    category: {
      control: form.elements.category,
      error: document.querySelector('#news-category-error'),
      invalid: (control) => !control.value,
    },
    date: {
      control: form.elements.date,
      error: document.querySelector('#news-date-error'),
      invalid: (control) => !control.value,
    },
    status: {
      control: form.querySelector('.admin-editor-row--status'),
      error: document.querySelector('#news-status-error'),
      invalid: () => !form.querySelector('input[name="status"]:checked'),
      focus: () => form.querySelector('input[name="status"]'),
    },
    body: {
      control: form.elements.body,
      error: document.querySelector('#news-body-error'),
      invalid: (control) => !control.value.trim(),
    },
  };

  function setError(field, visible) {
    field.error.hidden = !visible;
    if (visible) {
      field.control.setAttribute('aria-invalid', 'true');
      field.control.setAttribute('aria-describedby', field.error.id);
    } else {
      field.control.removeAttribute('aria-invalid');
      field.control.removeAttribute('aria-describedby');
    }
  }

  function clearErrors() {
    Object.values(fields).forEach((field) => setError(field, false));
  }

  function validate() {
    clearErrors();
    let firstInvalid = null;
    Object.entries(fields).forEach(([name, field]) => {
      const isInvalid = field.invalid(field.control);
      if (isInvalid) {
        setError(field, true);
        firstInvalid ||= field.focus ? field.focus() : field.control;
      }
    });
    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  function showConfirmation() {
    const value = (name) => form.elements[name].value.trim();
    const selectedStatus = form.querySelector('input[name="status"]:checked');
    const values = {
      title: value('title'),
      category: form.elements.category.selectedOptions[0].textContent.trim(),
      date: value('date'),
      status: selectedStatus.value,
      body: value('body'),
      url: value('url'),
      thumbnail: form.elements.thumbnail.files[0]?.name || '',
    };
    const originalValues = form.dataset.originalValues
      ? JSON.parse(form.dataset.originalValues)
      : null;
    const comparableFields = ['title', 'category', 'date', 'status', 'body', 'url'];
    const normalize = (fieldName, value) => {
      const normalized = String(value ?? '').replace(/\r\n?/g, '\n').trim();
      return fieldName === 'date' ? normalized.replace(/[./]/g, '-') : normalized;
    };

    Object.entries(values).forEach(([name, text]) => {
      const output = confirmation.querySelector(`[data-confirm-field="${name}"]`);
      if (!output) return;
      output.textContent = text;
      const changed = originalValues && comparableFields.includes(name)
        && normalize(name, text) !== normalize(name, originalValues[name]);
      output.classList.toggle('is-changed', Boolean(changed));
    });
    confirmation.querySelector('[data-confirm-row="url"]').hidden = !values.url;
    confirmation.querySelector('[data-confirm-row="thumbnail"]').hidden = !values.thumbnail;
    heading.hidden = true;
    form.hidden = true;
    confirmation.hidden = false;
    confirmation.querySelector('#news-confirmation-title').focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.querySelectorAll('[data-news-register]').forEach((button) => {
    button.addEventListener('click', () => {
      if (validate()) showConfirmation();
    });
  });

  Object.entries(fields).forEach(([name, field]) => {
    const targets = name === 'status'
      ? form.querySelectorAll('input[name="status"]')
      : [field.control];
    targets.forEach((target) => {
      target.addEventListener('input', () => {
        if (!field.invalid(field.control)) setError(field, false);
      });
      target.addEventListener('change', () => {
        if (!field.invalid(field.control)) setError(field, false);
      });
    });
  });

  confirmation.querySelector('[data-news-back]').addEventListener('click', () => {
    confirmation.hidden = true;
    form.hidden = false;
    heading.hidden = false;
    heading.querySelector('h1').focus();
  });

  postButton.addEventListener('click', async () => {
    if (postButton.disabled) return;

    if (form.elements.thumbnail.files.length > 0) {
      submitStatus.textContent = 'サムネイル画像のアップロードはまだ利用できません。画像を選択せずに投稿してください。';
      submitStatus.dataset.state = 'error';
      submitStatus.hidden = false;
      return;
    }

    const recordId = form.dataset.recordId;
    const payload = {
      title: form.elements.title.value.trim(),
      body: form.elements.body.value.trim(),
      category: form.elements.category.value,
      date: form.elements.date.value,
      status: form.querySelector('input[name="status"]:checked')?.value,
      relatedUrl: form.elements.url.value.trim() || null,
      thumbnailPath: null,
    };
    const url = recordId
      ? `http://localhost:8080/api/admin/news/${encodeURIComponent(recordId)}`
      : 'http://localhost:8080/api/admin/news';
    const method = recordId ? 'PUT' : 'POST';

    postButton.disabled = true;
    postButton.setAttribute('aria-busy', 'true');
    submitStatus.textContent = recordId ? '更新しています…' : '投稿しています…';
    submitStatus.dataset.state = 'pending';
    submitStatus.hidden = false;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.detail || `保存に失敗しました（HTTP ${response.status}）。`);
      }

      submitStatus.textContent = recordId ? 'お知らせを更新しました。' : 'お知らせを投稿しました。';
      submitStatus.dataset.state = 'success';
      postButton.textContent = recordId ? '更新済み' : '投稿済み';
      window.setTimeout(() => {
        const savedAction = recordId ? 'updated' : 'created';
        window.location.replace(`admin-info.html?saved=${savedAction}#news-list`);
      }, 350);
    } catch (error) {
      console.error('お知らせを保存できませんでした。', error);
      const message = error.name === 'AbortError'
        ? 'APIから15秒以内に応答がありませんでした。保存済みの可能性もあるため、再送信する前に一覧APIで登録状況を確認してください。'
        : `${error.message} APIが起動中か、ローカルサーバーからページを開いているか確認してください。`;
      submitStatus.textContent = message;
      submitStatus.dataset.state = 'error';
      postButton.disabled = false;
    } finally {
      window.clearTimeout(timeoutId);
      postButton.removeAttribute('aria-busy');
    }
  });
})();
