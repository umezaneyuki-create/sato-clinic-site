(() => {
  const apiBase = `${window.location.protocol}//${window.location.hostname}:8080`;
  const loginPage = window.location.pathname.endsWith('/admin.html') || window.location.pathname.endsWith('admin.html');
  if (!loginPage && document.body.classList.contains('admin-dashboard')) {
    fetch(`${apiBase}/api/admin/session`, { credentials: 'include' })
      .then((response) => response.json())
      .then((state) => {
        if (!state.authenticated) {
          const next = `${window.location.pathname.split('/').pop()}${window.location.search}${window.location.hash}`;
          window.location.replace(`admin.html?next=${encodeURIComponent(next)}`);
        }
      })
      .catch(() => {
        document.body.insertAdjacentHTML('afterbegin', '<p role="alert" class="admin-session-error">管理サーバーに接続できません。Docker Desktopとバックエンドを起動してください。</p>');
      });
  }
  document.addEventListener('click', async (event) => {
    const logout = event.target.closest('.admin-logout');
    if (!logout) return;
    event.preventDefault();
    try {
      await fetch(`${apiBase}/api/admin/logout`, { method: 'POST', credentials: 'include' });
    } finally {
      window.location.href = 'admin.html';
    }
  });
})();
