(() => {
  const apiBase = `${window.location.protocol}//${window.location.hostname}:8080`;

  const request = async (path, options = {}) => {
    const response = await fetch(`${apiBase}${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    });
    if (response.status === 401) {
      const next = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      window.location.href = `admin.html?next=${encodeURIComponent(next)}`;
      throw new Error('管理者ログインが必要です。');
    }
    if (!response.ok) {
      const problem = await response.json().catch(() => ({}));
      throw new Error(problem.message || 'サーバーとの通信に失敗しました。');
    }
    return response.status === 204 ? null : response.json();
  };

  window.inquiryApi = {
    request,
    list: (view = 'all') => request(view === 'sent'
      ? '/api/admin/inquiries/sent-replies'
      : view === 'drafts'
        ? '/api/admin/inquiries/draft-replies'
        : `/api/admin/inquiries?view=${encodeURIComponent(view)}`),
    get: (id) => request(`/api/admin/inquiries/${encodeURIComponent(id)}`),
    updateStatus: (id, status) => request(`/api/admin/inquiries/${encodeURIComponent(id)}/status`, {
      method: 'PATCH', body: JSON.stringify({ status })
    }),
    saveReply: (id, data) => request(`/api/admin/inquiries/${encodeURIComponent(id)}/replies`, {
      method: 'POST', body: JSON.stringify(data)
    }),
    remove: (id, permanent = false) => request(`/api/admin/inquiries/${encodeURIComponent(id)}${permanent ? '/permanent' : ''}`, {
      method: 'DELETE'
    }),
    restore: (id) => request(`/api/admin/inquiries/${encodeURIComponent(id)}/restore`, { method: 'POST' })
  };
})();
