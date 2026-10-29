(() => {
  const existingHeader = document.querySelector('.site-header');
  if (existingHeader && !existingHeader.querySelector('.menu-toggle')) {
    existingHeader.innerHTML = `<div class="header-inner">
      <a class="site-logo" href="index.html" aria-label="菴占陸蛹ｻ髯｢ 繝医ャ繝励∈"><img src="assets/images/logo.png" alt="菴占陸蛹ｻ髯｢ Sato Clinic"></a>
      <button class="menu-toggle" type="button" aria-controls="global-nav" aria-expanded="false"><span class="menu-toggle__line"></span><span class="menu-toggle__line"></span><span class="menu-toggle__line"></span><span class="sr-only">繝｡繝九Η繝ｼ繧帝幕縺・/span></button>
      <div class="header-right"><nav class="global-nav" id="global-nav" aria-label="グローバルナビゲーション"><a href="index.html">トップ</a><a href="info.html">お知らせ</a><a href="kamoku.html">診療内容</a><a href="about.html">当院について</a><a href="access.html">診療時間・所在地</a><a href="faq.html">よくあるご質問</a></nav><a class="header-phone" href="tel:0000000000"><img src="assets/images/telno.png" alt="電話番号"></a><a class="reserve-button" href="index.html">Web予約はこちら</a></div>
    </div>`;
  }
  const footerInner = document.querySelector('.footer-inner');
  if (footerInner && !footerInner.querySelector('.admin-login-link')) {
    const adminLink = document.createElement('a');
    adminLink.className = 'admin-login-link';
    adminLink.href = 'admin.html';
    adminLink.textContent = '管理者ログイン';
    footerInner.append(adminLink);
  }

  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelectorAll('.global-nav a, .header-phone, .reserve-button');

  const infoList = document.querySelector('.info-page .info-list');
  const pagination = document.querySelector('.info-pagination');
  if (pagination) {
    pagination.querySelectorAll(':scope > a').forEach((link, index) => {
      if (index >= 5) link.hidden = true;
    });
    const match = window.location.pathname.match(/info(?:-(\d+))?\.html$/);
    const currentPage = match && match[1] ? Number(match[1]) : 1;
    const lastPage = 9;
    const makeControl = (label, href, className) => {
      const link = document.createElement('a');
      link.textContent = label;
      link.href = href;
      if (className) link.className = className;
      return link;
    };
    pagination.prepend(makeControl('譛譁ｰ', 'info.html', 'pagination-latest'));
    if (currentPage > 1) pagination.insertBefore(makeControl('笳', currentPage === 2 ? 'info.html' : `info-${currentPage - 1}.html`, 'pagination-prev'), pagination.children[1]);
    if (currentPage < lastPage) pagination.append(makeControl('笆ｶ', `info-${currentPage + 1}.html`, 'pagination-next'));
    if (currentPage < lastPage) pagination.append(makeControl('笆ｶ笆ｶ', `info-${lastPage}.html`, 'pagination-last'));
  }
  if (pagination) {
    const match = window.location.pathname.match(/info(?:-(\d+))?\.html$/);
    const currentPage = match && match[1] ? Number(match[1]) : 1;
    const lastPage = 9;
    const makePage = (label, href, className) => {
      const link = document.createElement('a');
      link.textContent = label;
      link.href = href;
      if (className) link.className = className;
      return link;
    };
    pagination.replaceChildren();
    if (currentPage > 1) pagination.append(makePage('譛譁ｰ', 'info.html', 'pagination-latest'));
    if (currentPage > 1) pagination.append(makePage('笳', currentPage === 2 ? 'info.html' : `info-${currentPage - 1}.html`, 'pagination-prev'));
    for (let i = currentPage - 2; i <= currentPage + 2; i += 1) {
      if (i < 1 || i > lastPage) {
        const blank = document.createElement('span');
        blank.className = 'pagination-blank';
        blank.textContent = '縲';
        pagination.append(blank);
      } else {
        const page = makePage(String(i), i === 1 ? 'info.html' : `info-${i}.html`, i === currentPage ? 'is-current' : '');
        if (i === currentPage) page.setAttribute('aria-current', 'page');
        pagination.append(page);
      }
    }
    if (currentPage < lastPage) {
      pagination.append(makePage('笆ｶ', `info-${currentPage + 1}.html`, 'pagination-next'));
      pagination.append(makePage('笆ｶ笆ｶ', `info-${lastPage}.html`, 'pagination-last'));
    }
  }

  if (infoList && !infoList.querySelector('.info-item:not(.info-item--featured)')) {
    for (let i = 0; i < 11; i += 1) {
      const item = document.createElement('article');
      item.className = 'info-item';
      item.innerHTML = '<time datetime="2026-00-00">2026.00.00</time><h2><a href="#topic-detail">繝・く繧ｹ繝医ユ繧ｭ繧ｹ繝医ユ繧ｭ繧ｹ繝医ユ繧ｭ繧ｹ繝・/a></h2>';
      infoList.appendChild(item);
    }
  }

  if (!header || !toggle) return;

  const setMenu = (open) => {
    header.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    const label = toggle.querySelector('.sr-only');
    if (label) label.textContent = open ? 'Menu closed' : 'Open menu';
  };

  toggle.addEventListener('click', () => {
    setMenu(!header.classList.contains('is-open'));
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (window.matchMedia('(max-width: 900px)').matches) setMenu(false);
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) setMenu(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenu(false);
  });
})();

document.addEventListener('DOMContentLoaded', () => {
  const faqList = document.querySelector('.faq-page .faq-group .faq-list');
  if (faqList) {
    faqList.innerHTML = [
      ['\u8a3a\u7642\u306f\u4e88\u7d04\u5236\u3067\u3059\u304b\uff1f', '\u4e00\u822c\u8a3a\u7642\u306f\u4e88\u7d04\u306a\u3057\u3067\u3082\u53d7\u3051\u4ed8\u3051\u3066\u3044\u307e\u3059\u304c\u3001\u4e88\u7d04\u512a\u5148\u5236\u3068\u306a\u3063\u3066\u304a\u308a\u307e\u3059\u3002<br>\u4e88\u9632\u63a5\u7a2e\u3084\u5065\u5eb7\u8a3a\u65ad\u306a\u3069\u306f\u5b8c\u5168\u4e88\u7d04\u5236\u3067\u3059\u3002\u304a\u96fb\u8a71\u307e\u305f\u306fWeb\u4e88\u7d04\u3092\u3054\u5229\u7528\u304f\u3060\u3055\u3044\u3002'],
      ['\u521d\u8a3a\u6642\u306b\u5fc5\u8981\u306a\u3082\u306e\u306f\u4f55\u3067\u3059\u304b\uff1f', '\u5065\u5eb7\u4fdd\u967a\u8a3c\u3001\u304a\u85ac\u624b\u5e33\uff08\u304a\u6301\u3061\u306e\u65b9\uff09\u3001\u8a3a\u7642\u60c5\u5831\u63d0\u4f9b\u66f8\uff08\u7d39\u4ecb\u72b6\uff09\u304c\u3042\u308c\u3070\u3054\u6301\u53c2\u304f\u3060\u3055\u3044\u3002\u307e\u305f\u3001\u554f\u8a3a\u7968\u3092\u4e8b\u524d\u306b\u3054\u8a18\u5165\u3044\u305f\u3060\u3051\u308b\u3068\u53d7\u4ed8\u304c\u30b9\u30e0\u30fc\u30ba\u3067\u3059\u3002'],
      ['\u8a3a\u5bdf\u306b\u306f\u3069\u308c\u304f\u3089\u3044\u6642\u9593\u304c\u304b\u304b\u308a\u307e\u3059\u304b\uff1f', '\u75c7\u72b6\u3084\u6df7\u96d1\u72b6\u6cc1\u306b\u3088\u308a\u307e\u3059\u304c\u3001\u76ee\u5b89\u3068\u3057\u306630\u5206\uff5e1\u6642\u9593\u7a0b\u5ea6\u3067\u3059\u3002\u4e8b\u524d\u306b\u6df7\u96d1\u72b6\u6cc1\u3092\u304a\u554f\u3044\u5408\u308f\u305b\u3044\u305f\u3060\u304f\u3053\u3068\u3092\u304a\u52e7\u3081\u3057\u307e\u3059\u3002']
    ].map(([q, a]) => `<article><h3><b>Q.</b>${q}</h3><p><b>A.</b>${a}</p></article>`).join('');
  }
  const faqPage = document.querySelector('.faq-page');
  if (faqPage && !faqPage.querySelector('.faq-footer-note')) {
    const note = document.createElement('p');
    note.className = 'faq-footer-note';
    note.textContent = '\u305d\u306e\u4ed6\u306e\u3054\u8cea\u554f\u3084\u8a73\u7d30\u306b\u3064\u3044\u3066\u306f\u3001\u30b9\u30bf\u30c3\u30d5\u307e\u3067\u304a\u6c17\u8efd\u306b\u304a\u554f\u3044\u5408\u308f\u305b\u304f\u3060\u3055\u3044\u3002';
    faqPage.appendChild(note);
  }
  if (!document.querySelector('.access-page')) return;
  const grid = document.querySelector('.access-bottom-grid');
  let map = grid?.children[0]?.tagName === 'IMG' ? grid.children[0] : null;
  const locationCard = grid?.children[1]?.classList.contains('access-card') ? grid.children[1] : null;
  if (map && locationCard) {
    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d809.9084366368471!2d139.7780904877139!3d35.71062948671602!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60188f7848579a79%3A0xb20e4a90c82d37a4!2z44ixRURJWCDkuIrph47mlZnlrqQ!5e0!3m2!1sja!2sjp!4v1788931711991!5m2!1sja!2sjp';
    iframe.className = 'access-map';
    iframe.title = '菴占陸蛹ｻ髯｢縺ｮ謇蝨ｨ蝨ｰ';
    iframe.loading = 'lazy';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    map.replaceWith(iframe);
    map = iframe;
    locationCard.insertBefore(map, locationCard.firstChild);
    locationCard.classList.add('access-location-card');
    grid.classList.add('has-access-map');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const page = document.querySelector('.faq-page');
  if (!page || page.querySelector('.faq-footer-note')) return;
  const note = document.createElement('p');
  note.className = 'faq-footer-note';
  note.textContent = '\u305d\u306e\u4ed6\u306e\u3054\u8cea\u554f\u3084\u8a73\u7d30\u306b\u3064\u3044\u3066\u306f\u3001\u30b9\u30bf\u30c3\u30d5\u307e\u3067\u304a\u6c17\u8efd\u306b\u304a\u554f\u3044\u5408\u308f\u305b\u304f\u3060\u3055\u3044\u3002';
  page.appendChild(note);
});

document.addEventListener('DOMContentLoaded', () => {
  const secondFaqAnswer = document.querySelector('.faq-page .faq-group .faq-list article:nth-child(2) p');
  if (secondFaqAnswer) {
    secondFaqAnswer.replaceChildren();
    const label = document.createElement('b');
    label.textContent = 'A.';
    secondFaqAnswer.append(label, document.createTextNode('\u5065\u5eb7\u4fdd\u967a\u8a3c\u3001\u304a\u85ac\u624b\u5e33\uff08\u304a\u6301\u3061\u306e\u65b9\uff09\u3001\u8a3a\u7642\u60c5\u5831\u63d0\u4f9b\u66f8\uff08\u7d39\u4ecb\u72b6\uff09\u304c\u3042\u308c\u3070\u3054\u6301\u53c2\u304f\u3060\u3055\u3044\u3002\u307e\u305f\u3001\u554f\u8a3a\u7968\u3092\u4e8b\u524d\u306b\u3054\u8a18\u5165\u3044\u305f\u3060\u3051\u308b\u3068\u53d7\u4ed8\u304c\u30b9\u30e0\u30fc\u30ba\u3067\u3059\u3002'));
  }
  if (document.querySelector('.faq-page')) {
    const answer = document.querySelector('.faq-page .faq-group .faq-list article:first-child p');
    if (answer) {
      answer.replaceChildren();
      const label = document.createElement('b');
      label.textContent = 'A.';
      answer.append(label, document.createTextNode('\u4e00\u822c\u8a3a\u7642\u306f\u4e88\u7d04\u306a\u3057\u3067\u3082\u53d7\u3051\u4ed8\u3051\u3066\u3044\u307e\u3059\u304c\u3001\u4e88\u7d04\u512a\u5148\u5236\u3068\u306a\u3063\u3066\u304a\u308a\u307e\u3059\u3002'), document.createElement('br'), document.createTextNode('\u4e88\u9632\u63a5\u7a2e\u3084\u5065\u5eb7\u8a3a\u65ad\u306a\u3069\u306f\u5b8c\u5168\u4e88\u7d04\u5236\u3067\u3059\u3002\u304a\u96fb\u8a71\u307e\u305f\u306fWeb\u4e88\u7d04\u3092\u3054\u5229\u7528\u304f\u3060\u3055\u3044\u3002'));
    }
  }
  const mapImage = document.querySelector('#access img[src*="map.jpg"]');
  if (!mapImage) return;
  const iframe = document.createElement('iframe');
  iframe.src = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d809.9084366368471!2d139.7780904877139!3d35.71062948671602!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60188f7848579a79%3A0xb20e4a90c82d37a4!2z44ixRURJWCDkuIrph47mlZnlrqQ!5e0!3m2!1sja!2sjp!4v1788931711991!5m2!1sja!2sjp';
  iframe.className = 'access-photo';
  iframe.title = '菴占陸蛹ｻ髯｢縺ｮ謇蝨ｨ蝨ｰ';
  iframe.loading = 'lazy';
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  mapImage.replaceWith(iframe);
});
