(() => {
  const panel = document.querySelector('.info-panel');
  if (!panel || typeof loadNewsRecords !== 'function') return;
  const list = panel.querySelector('.info-list');
  const pagination = panel.querySelector('.info-pagination');
  const params = new URLSearchParams(window.location.search);
  const pageMatch = params.get('page');
  const topicIndex = Math.max(0, Number.parseInt(params.get('topic') || '0', 10) - 1);
  const currentPage = Math.max(1, Number.parseInt(pageMatch || '1', 10) || 1);
  const perPage = window.matchMedia('(max-width: 900px)').matches ? 5 : 10;

  const link = (label, href, className = '') => {
    const element = document.createElement('a');
    element.textContent = label;
    element.href = href;
    if (className) element.className = className;
    return element;
  };

  loadNewsRecords().then((records) => {
    const pageCount = Math.max(1, Math.ceil(records.length / perPage));
    const page = Math.min(params.has('topic') ? Math.floor(topicIndex / perPage) + 1 : currentPage, pageCount);
    const visible = records.slice((page - 1) * perPage, page * perPage);
    const featured = (params.has('topic') && records[topicIndex]) || visible[0] || records[0];
    if (!featured) return;
    list.replaceChildren();
    const featuredItem = document.createElement('article');
    featuredItem.className = 'info-item info-item--featured';
    featuredItem.id = 'topic-detail';
    featuredItem.innerHTML = `<div class="info-item__heading"><time></time><h2></h2></div><p></p>`;
    featuredItem.querySelector('time').textContent = featured.date;
    featuredItem.querySelector('h2').textContent = featured.title;
    featuredItem.querySelector('p').textContent = featured.body;
    list.append(featuredItem);
    visible.forEach((record) => {
      const item = document.createElement('article');
      item.className = 'info-item';
      item.innerHTML = `<time></time><h2><a href="#topic-detail"></a></h2>`;
      item.querySelector('time').textContent = record.date;
      const titleLink = item.querySelector('a');
      titleLink.textContent = record.title;
      titleLink.addEventListener('click', () => {
        featuredItem.querySelector('time').textContent = record.date;
        featuredItem.querySelector('h2').textContent = record.title;
        featuredItem.querySelector('p').textContent = record.body;
      });
      list.append(item);
    });
    pagination.replaceChildren();
    if (page > 1) pagination.append(link('最新', 'info.html', 'pagination-latest'), link('◀', page === 2 ? 'info.html?page=1' : `info.html?page=${page - 1}`, 'pagination-prev'));
    for (let number = Math.max(1, page - 2); number <= Math.min(pageCount, page + 2); number += 1) {
      const pageLink = link(String(number), number === 1 ? 'info.html' : `info.html?page=${number}`, number === page ? 'is-current' : '');
      if (number === page) pageLink.setAttribute('aria-current', 'page');
      pagination.append(pageLink);
    }
    if (page < pageCount) pagination.append(link('▶', `info.html?page=${page + 1}`, 'pagination-next'), link('▶▶', `info.html?page=${pageCount}`, 'pagination-last'));
  });
})();
