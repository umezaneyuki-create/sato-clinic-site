/* Keep the dedicated about page's staff section identical to the top page. */
document.addEventListener('DOMContentLoaded', async () => {
  const target = document.querySelector('#about-staff');
  if (!target) return;
  const familyPhoto = document.querySelector('img[src*="patient_7.jpg"]');
  if (familyPhoto) familyPhoto.src = 'assets/images/patient_10.jpg';
  try {
    const response = await fetch('index.html', { cache: 'no-cache' });
    if (!response.ok) return;
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const source = doc.querySelector('#staff');
    if (source) target.replaceWith(document.importNode(source, true));
  } catch (error) {
    console.warn('スタッフ紹介の同期に失敗しました', error);
  }
});
