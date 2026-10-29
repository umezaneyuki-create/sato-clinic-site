(() => {
  const list = document.querySelector('.news-list');
  if (!list || typeof loadNewsRecords !== 'function') return;

  const topicHref = (index) => `info.html?topic=${index + 1}#topic-detail`;

  const createLink = (record, index) => {
    const link = document.createElement('a');
    link.href = topicHref(index);
    link.textContent = record.title;
    return link;
  };

  loadNewsRecords().then((records) => {
    list.replaceChildren();

    records.slice(0, 5).forEach((record, index) => {
      const item = document.createElement('article');
      item.className = 'news-item';

      const date = document.createElement('time');
      date.textContent = record.date;
      item.append(date, createLink(record, index));

      const more = document.createElement('a');
      more.className = 'more-pill';
      more.href = topicHref(index);
      more.textContent = '詳しくはこちら';
      const arrow = document.createElement('img');
      arrow.className = 'button-arrow';
      arrow.src = 'assets/images/Polygon 1.png';
      arrow.alt = '';
      more.append(arrow);
      item.append(more);

      list.append(item);
    });
  });
})();
