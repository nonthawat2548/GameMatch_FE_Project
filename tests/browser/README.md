# Browser QA ในเครื่อง

ชุดหลัก `verify.cjs` เปิด production build บน localhost และ browser context ใหม่แบบ headless. API และภาพเกมเป็น Demo fixtures ภายใน context เท่านั้น; ไม่เขียนข้อมูลบน backend/DB จริง และไม่ใช้ browser profile ของผู้ใช้

## เตรียม

ตั้ง .env.local ตาม .env.example และใช้ Node >=20. ติดตั้ง Playwright แยกใน temporary directory:

```powershell
$taskQa = Join-Path $env:TEMP 'gamematch-browser-qa-tools'
npm install --prefix $taskQa --no-save --package-lock=false playwright@1.65.0
$env:GM_PLAYWRIGHT_MODULE = Join-Path $taskQa 'node_modules/playwright'
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $taskQa 'browsers'
node (Join-Path $taskQa 'node_modules/playwright/cli.js') install chromium --only-shell
npm run build
node tests/browser/verify.cjs
```

ผล default อยู่ docs/evidence/frontend-browser/. ตั้ง GM_QA_OUTPUT_DIR เพื่อเลือกที่เก็บแยกได้. report.json ต้องเป็น passed และ pageErrors เป็น array ว่าง; exit code ไม่เป็นศูนย์เมื่อ assertion ล้มเหลว

ครอบคลุม 1366/390/320px, Home/Discover/Quiz/Detail, filtering โดยไม่ fetch ซ้ำ, Login return, Favorite reload, Preference restore, Profile/password cleanup, Admin CRUD/publication/Steam failure, native role dialog focus/Escape/คืน focus, review-vote retry, cross-tab logout, Loading/Empty/Error และชื่อสมาชิกยาว

ข้อมูล mock persistence หลัง reload ยืนยันได้เฉพาะ fixture store ไม่ใช่ PostgreSQL. Native dialog และ focus ใช้ Chromium จริง ไม่ใช้ jsdom polyfill. UI assertions ใช้ form/button/radio ตามหน้า Quiz ปัจจุบัน

## ชุดอื่น

- ci-browser.cjs: โหมด isolated ใช้ Go/PostgreSQL แบบ disposable ตาม .github/workflows/browser-qa.yml; โหมด production ใช้ GM_QA_MODE=production และตรวจเฉพาะข้อมูลสาธารณะของ hosting เดิม
- live.cjs: อาจสร้างบัญชี/เกม QA และเปลี่ยนข้อมูลผ่าน backend ที่กำหนด จึงไม่ใช้ในงานที่ขอเก็บเฉพาะในเครื่อง; อ่านสคริปต์และกำหนดขอบเขตการเขียนข้อมูลก่อนใช้งาน
- steam-gallery.cjs / steam-rating.cjs / trailer-metadata.cjs: ตรวจ third-party metadata/media ตามขอบเขตแต่ละไฟล์; ไม่ใช่ผลยืนยันของโค้ด local โดยอัตโนมัติ

งานแก้วันที่ 14 พฤศจิกายน 2569 ใช้ verify.cjs และการตรวจ tooling ในเครื่อง ผลล่าสุดดู [VALIDATION.md](../../docs/VALIDATION.md)
