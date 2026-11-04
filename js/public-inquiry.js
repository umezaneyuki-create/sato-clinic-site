(() => {
  const form = document.querySelector('#public-inquiry-form');
  const status = document.querySelector('#inquiry-form-status');
  const successActions = document.querySelector('#inquiry-success-actions');
  if (!form || !status) return;
  const apiBase = `${window.location.protocol}//${window.location.hostname}:8080`;
  const showError = (name, text) => {
    const target = form.querySelector(`[data-error="${name}"]`);
    if (target) target.textContent = text;
  };
  const required = ['name', 'email', 'category', 'subject', 'content'];
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    required.forEach((name) => showError(name, ''));
    showError('consent', '');
    const data = new FormData(form);
    const payload = Object.fromEntries(['name', 'email', 'phone', 'category', 'subject', 'content', 'website'].map((key) => [key, String(data.get(key) || '').trim()]));
    payload.consent = data.get('consent') === 'on';
    let invalid = false;
    required.forEach((name) => {
      if (!payload[name]) { showError(name, '入力してください。'); invalid = true; }
    });
    if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) { showError('email', 'メールアドレスの形式を確認してください。'); invalid = true; }
    if (!payload.consent) { showError('consent', '個人情報の取扱いへの同意が必要です。'); invalid = true; }
    if (invalid) {
      status.hidden = true;
      form.querySelector('.field-error:not(:empty)')?.previousElementSibling?.focus?.();
      return;
    }
    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;
    status.classList.remove('is-error');
    status.hidden = false;
    status.textContent = '送信しています…';
    try {
      const response = await fetch(`${apiBase}/api/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || '送信に失敗しました。入力内容をご確認ください。');
      form.hidden = true;
      form.closest('.inquiry-form-page')?.classList.add('is-success');
      if (successActions) successActions.hidden = false;
      status.textContent = result.receiptSent
        ? 'お問い合わせを受け付けました。受付完了メールをご確認ください。'
        : 'お問い合わせを受け付けましたが、受付完了メールを送信できませんでした。お急ぎの場合はお電話でお問い合わせください。';
      status.tabIndex = -1;
      status.focus?.();
    } catch (error) {
      status.classList.add('is-error');
      status.textContent = error.message === 'Failed to fetch'
        ? '受付サーバーに接続できません。時間をおいて再度お試しください。'
        : error.message;
    } finally { submit.disabled = false; }
  });
})();
