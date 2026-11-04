(() => {
  const form = document.querySelector('.admin-login-form');
  const message = document.querySelector('#admin-login-message');
  if (!form || !message) return;
  const apiBase = `${window.location.protocol}//${window.location.hostname}:8080`;
  const params = new URLSearchParams(window.location.search);
  const requestedNext = params.get('next') || '';
  const next = /^(admin-[a-z0-9-]+\.html|admin-top\.html)(\?.*)?(#.*)?$/i.test(requestedNext)
    ? requestedNext : 'admin-top.html';

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    message.hidden = false;
    message.textContent = 'ログインしています…';
    const data = new FormData(form);
    try {
      const response = await fetch(`${apiBase}/api/admin/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: data.get('username'), password: data.get('password') })
      });
      if (!response.ok) {
        const problem = await response.json().catch(() => ({}));
        throw new Error(problem.message || 'ログインできませんでした。');
      }
      window.location.href = next;
    } catch (error) {
      message.textContent = error.message === 'Failed to fetch'
        ? '管理サーバーに接続できません。Docker Desktopとバックエンドを起動してください。'
        : error.message;
    }
  });
})();
