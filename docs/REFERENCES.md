# แหล่งอ้างอิงและขอบเขต — 14 พฤศจิกายน 2569

## MovieHub เป็นหลักฐานด้านรูปแบบโค้ด

ตรวจ main ที่ commit [30a72f482fbf396b0d8eccb44285b876e00e432f](https://github.com/nonthawat2548/moviehub-670710207/tree/30a72f482fbf396b0d8eccb44285b876e00e432f). ใช้ SHA นี้เมื่ออธิบาย snapshot ไม่ถือว่า main ในอนาคตจะเหมือนเดิม

| หลักการ | ต้นแบบ MovieHub | GameMatch |
|---|---|---|
| Native fetch + endpoint functions | src/api/backend.js | src/api/backend.js + src/api/endpoints.js |
| Context/session | src/auth/AuthContext.jsx | src/auth/AuthContext.jsx; เพิ่ม /api/me และ guards ป้องกันคำขอเก่า |
| Controlled Form | src/pages/Login.jsx, Register.jsx, components/ReviewForm.jsx | Login/Profile/Admin/Quiz/GameReviews |
| โหลดรายการแล้วกรองใน state | src/pages/Movies.jsx | Discover.jsx, Home.jsx |
| Router/role UX | App.jsx, ProtectedRoute.jsx, RequireRole.jsx | App.jsx, ProtectedRoute.jsx รวม admin flag |
| Admin create/edit/validation | pages/admin/AdminMovieForm.jsx | pages/Admin.jsx และ components/AdminGameForm.jsx |
| Jest/RTL | api/backend.test.js, setupTests.js และ component/page tests | src/tests/ |
| SPA rewrite | vercel.json | vercel.json |

แยก endpoints.js ออกจาก transport เพื่อรวมชื่อ endpoint ในจุดเดียวและคง tests ของ transport เดิม เป็นโมดูลฟังก์ชันธรรมดา ไม่เพิ่ม service/repository framework

## การปรับเฉพาะงานนี้

Controlled forms, API extraction และ UI recovery เป็นงานที่ผู้ใช้ขอแก้ วันที่ 14 พฤศจิกายน 2569. useRef/native dialog ใช้จัด focus และ cancellation ใช้ AbortController; ไม่อ้างว่าเทคนิคทั้งหมดปรากฏใน MovieHub. Security overrides ของ build tooling เป็นการแก้ dependencies เดิมตามงานนี้ ดู [SECURITY.md](SECURITY.md)

React/Router/CRA/Tailwind declared application stack คงเดิม; Node minimum ขยับเป็น 20 ตาม serialize-javascript ที่แก้ช่องโหว่ ไม่มีหลักฐานให้สรุปว่านโยบาย UI ทุกข้อหรือรายการห้ามใน writing-block.md เป็นคำสั่งต้นฉบับของอาจารย์

## ข้อมูลและ media

- [Steam Most Played](https://store.steampowered.com/charts/mostplayed), [Steam Top Sellers TH](https://store.steampowered.com/search/?filter=topsellers&category1=998&cc=th)
- [Steam trailers](https://partner.steamgames.com/doc/store/trailer), [Library assets](https://partner.steamgames.com/doc/store/assets/libraryassets)
- [RAWG API](https://rawg.io/apidocs) สำหรับข้อมูลเดิมที่ยังมี rawgId; UI ให้เครดิตตาม source จริง

ลิงก์เหล่านี้อธิบายที่มาของข้อมูล/asset ไม่ใช่การรับรองสิทธิ์ภาพทุกชิ้นหรือคำรับรองความพร้อมของ upstream. ประวัติการสร้าง/Deploy ก่อนแยก repo ดู [repo ต้นทาง](https://github.com/nonthawat2548/GameMatch_ProjectWeb_BEFE); หลักฐานรอบปัจจุบันอยู่ใน [VALIDATION.md](VALIDATION.md)
