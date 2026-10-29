const NEWS_API_BASE = 'http://localhost:8080/api';

function formatNewsDate(value) {
  const text = String(value || '').trim();
  const match = text.match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})/);
  return match
    ? `${match[1]}.${match[2].padStart(2, '0')}.${match[3].padStart(2, '0')}`
    : text;
}

function formatNewsUpdatedAt(value) {
  const text = String(value || '').trim();
  const match = text.match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})(?:[T ](\d{1,2}):(\d{2}))?/);
  if (!match) return text;
  const date = `${match[1]}/${match[2].padStart(2, '0')}/${match[3].padStart(2, '0')}`;
  return match[4] ? `${date} ${match[4].padStart(2, '0')}:${match[5]}` : date;
}

async function fetchNewsRecords(endpoint) {
  const response = await fetch(`${NEWS_API_BASE}/${endpoint}`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const records = await response.json();
  if (!Array.isArray(records)) throw new Error('API response is not a list');
  return records;
}

async function loadNewsRecords() {
  try {
    return (await fetchNewsRecords('news')).map((record) => ({
      ...record,
      date: formatNewsDate(record.date),
    }));
  } catch (error) {
    console.error('お知らせをバックエンドから読み込めませんでした。', error);
    return [];
  }
}

async function loadAdminNewsRecords() {
  try {
    return (await fetchNewsRecords('admin/news')).map((record) => ({
      ...record,
      date: formatNewsDate(record.date),
      updatedAt: formatNewsUpdatedAt(record.updatedAt),
    }));
  } catch (error) {
    console.error('管理用のお知らせをバックエンドから読み込めませんでした。', error);
    return [];
  }
}

