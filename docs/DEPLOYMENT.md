# Deployment configuration — 14 พฤศจิกายน 2569

รอบแก้ไขนี้เก็บโค้ดไว้ในเครื่อง ยังไม่ได้ push หรือ deploy

## ตั้งค่าสำหรับ hosting

- Build: npm run build; Output: build; Root: root ของ FE repository
- ตั้ง REACT_APP_API_URL เป็น HTTPS URL ของ backend ที่ตรงกับ FE รุ่นนี้
- ไม่ตั้ง GM_ALLOW_LOCAL_API บน hosting; flag นี้มีไว้สำหรับ isolated/local QA
- ไม่มี DB password, JWT secret หรือ Steam private key ใน frontend environment
- vercel.json มี SPA rewrite เพื่อเปิด/refresh dynamic route ได้

prebuild ใช้ scripts/validate-env.cjs โหลด environment ด้วยวิธีของ CRA และหยุดเมื่อ URL หาย/ไม่ถูกต้อง/ใช้ HTTP กับ host ภายนอก หรือใช้ localhost โดยไม่มี local QA opt-in. API transport มี fallback localhost เฉพาะ development/test

## สถานะที่ยืนยันไว้ก่อนแก้

[เว็บที่เผยแพร่](https://gamematch-projectweb-befe.vercel.app) และ [API](https://gamematch-api-hzv6.onrender.com) ผ่าน public smoke วันที่ 14 พฤศจิกายน 2569 ก่อนคำขอให้แก้ทั้งหมด ดู [GitHub run เดิม](https://github.com/nonthawat2548/GameMatch_FE_Project/actions/runs/43338377679). ผลนั้นไม่รับรองข้อแก้ไขใหม่ที่ยังอยู่ในเครื่อง

ก่อนเผยแพร่เมื่อมีคำสั่ง ให้ตรวจ login/register/profile/password, member ownership, Admin role/CRUD, CORS และ route refresh กับ backend/DB รุ่นที่ตรงกัน การทดสอบใน context fixtures ไม่แทนผล DB จริง
