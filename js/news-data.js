/* Googleスプレッドシートをお知らせデータの唯一の管理元として利用します。 */
const NEWS_SHEET_ID = '1_8sD1hLMBHQEbS3j95tBcl63_yIME7H3-ZRBMuHYApo';
const NEWS_SHEET_NAME = 'シート1';

const NEWS_FALLBACK = [
  { date: '2026.00.00', title: 'インフルエンザ予防接種について', body: '今年もインフルエンザの予防接種を開始いたしました。予約制となっておりますので、お電話または受付にてご予約をお願いいたします。例年、予約が集中しやすいため、早めのご予約をおすすめいたします。' },
  { date: '2026.00.00', title: '年末年始の休診について', body: '年末年始の休診日は、12月29日（金）〜1月4日（木）となります。年始は1月5日（金）より通常診療を再開いたします。皆様にはご不便をおかけしますが、何卒ご了承くださいますようお願いいたします。' },
  { date: '2026.00.00', title: '健康診断のご案内', body: '今年も健康診断を実施しております。定期的な健康チェックは、病気の早期発見・予防にとても重要です。各種健康診断メニューをご用意しておりますので、ご希望の方はお電話にてお申し込みください。' },
  { date: '2026.00.00', title: '新型コロナウイルス対策について', body: '当院では引き続き、新型コロナウイルス感染症対策を徹底しております。ご来院の際には、マスクの着用、手指消毒にご協力をお願いいたします。また、発熱や風邪症状のある方は、事前にお電話でご相談ください。' },
  { date: '2026.00.00', title: 'オンライン診療の導入について', body: '2024年より、オンライン診療を一部導入いたしました。通院が難しい方や、遠方にお住まいの方にご利用いただけます。ご希望の方は、当院スタッフまでお問い合わせください。' }
];

async function loadNewsRecords() {
  const query = encodeURIComponent('select A,B,C where A is not null offset 1');
  const url = `https://docs.google.com/spreadsheets/d/${NEWS_SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(NEWS_SHEET_NAME)}&tq=${query}`;
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    const json = JSON.parse(text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1));
    const rows = json.table?.rows || [];
    const records = rows.map((row) => row.c || []).map((cells) => ({ date: cells[0]?.v ?? '', title: cells[1]?.v ?? '', body: cells[2]?.v ?? '' })).filter((record) => record.title && record.title !== 'title' && record.date !== 'date');
    return records.length ? records : NEWS_FALLBACK;
  } catch (error) {
    console.warn('Googleスプレッドシートを取得できないため、バックアップデータを使用します。', error);
    return NEWS_FALLBACK;
  }
}
