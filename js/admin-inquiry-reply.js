(() => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const form = document.querySelector('#inquiry-reply-form');
  const error = document.querySelector('#reply-error');
  const feedback = document.querySelector('#reply-feedback');
  const backTop = document.querySelector('#reply-back-top');
  const cancel = document.querySelector('#reply-cancel');
  const message = document.querySelector('#reply-message');
  const messageError = document.querySelector('#reply-message-error');
  const saveDraftButton = document.querySelector('#reply-save-draft');
  const confirmation = document.querySelector('#reply-confirmation');
  const editButton = document.querySelector('#reply-edit');
  const sendButton = document.querySelector('#reply-record');
  if (!form || !window.inquiryApi) return;

  let record;
  let draftId = null;
  const detailParams = new URLSearchParams(params);
  detailParams.set('id', id || '');
  const detailUrl = `admin-inquiry-detail.html?${detailParams.toString()}`;
  const backUrl = params.get('view') === 'drafts' ? 'admin-inquiry.html?view=drafts#inquiry-list' : detailUrl;
  backTop.href = backUrl;
  cancel.href = backUrl;
  if (params.get('view') === 'drafts') backTop.lastChild.textContent = '下書き一覧へ戻る';
  document.querySelectorAll('.admin-nav-items a').forEach((link) => {
    const linkUrl = new URL(link.href, window.location.href);
    const linkView = linkUrl.searchParams.get('view') || 'all';
    const isCurrent = linkUrl.pathname.endsWith('/admin-inquiry.html') && linkView === (params.get('view') || 'all');
    link.classList.toggle('is-current', isCurrent);
    if (isCurrent) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  const draftPayload = (action) => ({
    id: draftId,
    subject: document.querySelector('#reply-subject').value.trim(),
    content: message.value.trim(),
    action
  });
  const notifyError = (text) => {
    feedback.textContent = text;
    feedback.hidden = false;
  };
  const saveDraft = async () => {
    if (!message.value.trim()) {
      messageError.textContent = '下書きに保存する本文を入力してください。';
      messageError.hidden = false;
      message.focus();
      return;
    }
    messageError.hidden = true;
    try {
      await window.inquiryApi.saveReply(id, draftPayload('下書き'));
      window.location.href = 'admin-inquiry.html?view=drafts&saved=1#inquiry-list';
    } catch (reason) { notifyError(reason.message); }
  };

  window.inquiryApi.get(id).then((item) => {
    record = item;
    document.querySelector('#reply-recipient').textContent = record.email
      ? `${record.name || '—'}（${record.email}）`
      : `${record.name || '—'}（返信先メールアドレスがありません）`;
    document.querySelector('#reply-subject').value = `Re: ${record.subject || ''}`;
    document.querySelector('#reply-original-message').textContent = record.content || '—';
    const latestDraft = record.replies?.find((reply) => reply.status === '下書き');
    if (latestDraft) {
      draftId = latestDraft.id;
      document.querySelector('#reply-subject').value = latestDraft.subject;
      message.value = latestDraft.content;
    }
    saveDraftButton.addEventListener('click', saveDraft);

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!message.value.trim()) {
        messageError.textContent = '返信メッセージを入力してください。';
        messageError.hidden = false;
        message.focus();
        return;
      }
      if (!record.email) {
        notifyError('返信先のメールアドレスがありません。');
        return;
      }
      messageError.hidden = true;
      document.querySelector('#confirm-recipient').textContent = `${record.name || '—'}（${record.email}）`;
      document.querySelector('#confirm-subject').textContent = document.querySelector('#reply-subject').value;
      document.querySelector('#confirm-message').textContent = message.value.trim();
      form.hidden = true;
      confirmation.hidden = false;
      document.querySelector('#reply-confirmation-title').focus();
    });

    editButton.addEventListener('click', () => {
      confirmation.hidden = true;
      form.hidden = false;
      message.focus();
    });

    sendButton.addEventListener('click', async () => {
      sendButton.disabled = true;
      try {
        await window.inquiryApi.saveReply(id, draftPayload('送信'));
        detailParams.delete('view');
        detailParams.set('saved', '1');
        window.location.href = `admin-inquiry-detail.html?${detailParams.toString()}`;
      } catch (reason) {
        sendButton.disabled = false;
        confirmation.hidden = true;
        form.hidden = false;
        notifyError(reason.message);
      }
    });
  }).catch(() => {
    form.hidden = true;
    error.hidden = false;
  });
})();
