# ผลตรวจหลังแก้ในเครื่อง — 14 พฤศจิกายน 2569

แก้ตามคำขอผู้ใช้โดยยึด MovieHub main snapshot 30a72f482fbf396b0d8eccb44285b876e00e432f ไม่มีการ push/deploy หรือเขียนข้อมูลบนบริการจริงในรอบนี้

## ผลทดสอบ

- ผลในรายงานนี้รันใหม่จาก `C:\Users\nonth\.gemini\antigravity\scratch\GameMatch_FE_Project` หลังนำชุดแก้ทั้งหมดมาใช้กับพาธที่ผู้ใช้ระบุ
- คงหน้า Login แบบสองคอลัมน์และปุ่มแสดงรหัสผ่าน, Navbar/Footer, grid เกมสี่คอลัมน์ และ Login test ที่มีอยู่ในโฟลเดอร์นี้
- ปรับ Jest testMatch ให้ค้นหา tests ได้เมื่อโปรเจกต์อยู่ใต้ `.gemini` บน Windows; ไม่ลดจำนวน tests และไม่ใช้ passWithNoTests
- Clean npm ci --ignore-scripts ผ่าน; Jest/RTL 28 suites / 184 tests ผ่าน; npm run check และ production build ผ่าน
- Headless Chromium 15 กลุ่มผ่าน, 57 screenshots และไม่มี uncaught page errors
- Quiz ทุกขั้นและผลลัพธ์ผ่านที่ 1366/390/320px ทั้งธีมมืด/สว่าง รวม 24 จุดวัด
- Native role dialog รับ focus, ไม่ให้ focus ไปปุ่มหลัง modal, Escape ปิดและคืน focus; โหวตรีวิว retry แล้วโหวตได้โดยไม่โหลด review list ซ้ำ
- Profile/password, login return, Favorites, preference restore, Admin CRUD/Steam failure, cross-tab logout และ Loading/Empty/Error ผ่านด้วย API fixtures
- ทดสอบ CRA dev server กับ middleware override ได้ HTTP 200 และ SVG loader chain compile ผ่าน
- prebuild CLI ปฏิเสธ API URL ที่หายจริง และยอมรับ HTTPS; ตัวอย่าง API ใน writing-block.md คง status ทั้ง HTML/JSON null/nested error
- ตรวจด้วย parser ไม่เหลือคอมเมนต์ในไฟล์โค้ด 95 ไฟล์; ไม่รวม dependencies, build ที่สร้างอัตโนมัติ และเอกสาร

## สถานะรายการจาก review

| รายการ | ผลหลังแก้ |
|---|---|
| C1 Dependencies | ลด 45 → 17: Critical 0 / High 0 / Moderate 4 / Low 13; ยังมีข้อจำกัด upstream ดู SECURITY.md |
| C2 Forms | Login/Register/Password เป็น controlled; คง validation/autofill/return path |
| C3 Endpoint functions | รวมชื่อ endpoint ใน api/endpoints.js และใช้ครบใน pages/components/AuthContext |
| C4 Review votes | retry แยกสำหรับสถานะโหวต พร้อม regression unit/browser tests |
| C5 Modal | native dialog + Escape/busy guard/focus restoration; ตรวจด้วย Chromium จริง |
| C6 Build URL | validate-env.cjs, production runtime guard, local QA opt-in และ CI env |
| C7 Docs | API/REFERENCES/HANDOFF/DEPLOYMENT/RUBRIC/README ปรับเป็นสถานะปัจจุบัน |
| D1–D7 writing-block.md | แก้ API example, SHA/date, semver, ที่มาของกฎ, API scope, authentication adaptation และเกณฑ์วัดผล |
| พบเพิ่มระหว่าง Browser QA | แก้ข้อความสำเร็จหลังเปลี่ยนรหัสผ่านหาย และ Hero placeholder ทับปุ่ม Retry เมื่อไม่มีข้อมูล |

## หลักฐาน

- [Tests/build](evidence/local-fixes-2026-11-14/check.log), [Clean install](evidence/local-fixes-2026-11-14/install.log)
- [Browser report](evidence/local-fixes-2026-11-14/browser-report.json), [Browser log](evidence/local-fixes-2026-11-14/browser.log)
- [Modal screenshot](evidence/local-fixes-2026-11-14/mobile-role-dialog.png), [Recovered vote](evidence/local-fixes-2026-11-14/mobile-review-vote-recovered.png)
- [Audit ก่อน](evidence/local-fixes-2026-11-14/audit-before.json) / [หลัง](evidence/local-fixes-2026-11-14/audit-after.json), [ข้อจำกัด](SECURITY.md)
- [Dev-server log](evidence/local-fixes-2026-11-14/dev-server.log), [Build configuration และตัวอย่างเอกสาร](evidence/local-fixes-2026-11-14/configuration-and-doc-checks.json)
- [แหล่งที่มาของผลและ hash lockfile](evidence/local-fixes-2026-11-14/provenance.json), [Tooling](evidence/local-fixes-2026-11-14/tooling.log), [Audit threshold](evidence/local-fixes-2026-11-14/audit-threshold.log)

Audit ก่อนแก้เป็นบันทึกจากการตรวจรอบเดิม โดยยืนยัน SHA-256 ของ package-lock.json ก่อนแก้ในโฟลเดอร์นี้ว่าตรงกับ baseline ทุก byte; audit หลังแก้รันใหม่จากพาธข้างต้น

## ขอบเขตและข้อจำกัด

Browser รอบนี้จำลอง HTTP/API และภาพเกมเฉพาะใน context ทดสอบ ไม่ใช่ผลยืนยัน private production flows, PostgreSQL persistence หรือเกณฑ์รายวิชาทั้งหมด. jsdom polyfill dialog ใช้เฉพาะ unit tests; keyboard/focus ตรวจด้วย Chromium แยก

npm audit ยังมี 17 Low/Moderate findings และออก non-zero; npm audit --audit-level=high ผ่านตาม threshold ที่ระบุ ไม่อ้างว่า audit เป็นศูนย์. Router/CRA รุ่นเดิมและ deepmerge เป็นข้อจำกัดที่บันทึกไว้พร้อม applicability และหลักฐาน upstream

writing-block.md ฉบับแก้อยู่ C:/Users/nonth/Downloads/writing-block.md; รายงานตรวจแรกถูกระบุเป็นประวัติก่อนแก้แล้ว. สำรองก่อนแก้เก็บไว้นอก repo ที่:

`C:\Users\nonth\AppData\Local\Temp\gamematch-correct-location-before-1794627675640`

ค่าที่เตรียมใน .env.local ใช้ localhost:8080 สำหรับ local backend/QA และถูก Git ignore. ก่อนเผยแพร่ให้ใช้ HTTPS API URL และ backend รุ่นที่ตรงกันตาม DEPLOYMENT.md
