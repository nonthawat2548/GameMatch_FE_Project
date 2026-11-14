function validateApiUrl(value, allowLocal = false) {
  if (!value?.trim()) throw new Error('ตั้ง REACT_APP_API_URL ก่อน build เช่น https://api.example.com');
  let url;
  try { url = new URL(value.trim()); } catch { throw new Error('REACT_APP_API_URL ต้องเป็น URL เต็ม'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new Error('REACT_APP_API_URL ต้องเป็น HTTP(S) URL โดยไม่มี credentials, query หรือ hash');
  }
  const host = url.hostname.toLowerCase();
  const local = host === 'localhost' || host.endsWith('.localhost') || host === '[::1]' || /^127\./.test(host) || host === '0.0.0.0';
  if (local && !allowLocal) throw new Error('localhost ใช้ได้เฉพาะ build ทดสอบในเครื่อง: ตั้ง GM_ALLOW_LOCAL_API=1');
  if (!local && url.protocol !== 'https:') throw new Error('Production API ต้องใช้ HTTPS');
  return url.href.replace(/\/+$/, '');
}

if (require.main === module) {
  process.env.NODE_ENV = 'production';
  require('react-scripts/config/env');
  try {
    validateApiUrl(process.env.REACT_APP_API_URL, process.env.GM_ALLOW_LOCAL_API === '1');
    console.log('API URL configuration passed');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { validateApiUrl };
