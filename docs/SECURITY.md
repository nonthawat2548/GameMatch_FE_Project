# Dependency remediation — 14 พฤศจิกายน 2569

## ผล audit

ก่อนแก้: 45 package findings (Critical 1 / High 18 / Moderate 10 / Low 16). หลังอัปเดตที่ตรวจแล้ว: 17 package findings (Critical 0 / High 0 / Moderate 4 / Low 13). ตัวเลขรวมผลกระทบต่อเนื่องของ dependency ไม่ใช่จำนวน advisory อิสระ

npm audit ยังออก non-zero ตามปกติเมื่อมี findings. ไม่เพิ่ม ignore/suppression และไม่อ้างว่าแก้ช่องโหว่ทุกตัวหมดแล้ว. npm audit --audit-level=high ใช้เป็นเกณฑ์ป้องกัน Critical/High กลับมา โดยยังแสดง Low/Moderate ในรายงาน

## สิ่งที่เปลี่ยน

รัน npm audit fix แบบไม่ใช้ force เพื่ออัปเดตรุ่นที่เข้ากันได้ รวม shell-quote ที่มี Critical. จากนั้นกำหนด overrides สำหรับ dependencies ของเครื่องมือเดิม:

| Package | Override | เหตุผล |
|---|---|---|
| resolve-url-loader | 5.0.0 | ใช้ PostCSS 8 แทน nested PostCSS 7 ที่มี advisory |
| serialize-javascript | 7.1.4 | รุ่นแก้ serialization advisories; ต้องใช้ Node >=20 |
| @svgr/webpack | 8.1.0 | เอาสาย SVGO 1/nth-check เก่าออก; CRA ใช้ svgo:false และคง loader interface |
| @tootallnate/once | 2.0.1 | แก้ Incorrect Control Flow Scoping |
| sockjs → uuid | 11.1.1 | รุ่นแก้ buffer bounds; คง CommonJS v4 API ที่ sockjs ใช้ |
| webpack-dev-middleware | 7.4.5 | รุ่นแก้ publicPath traversal; ตรวจ CRA dev-server compatibility แยกจาก production build |

ไม่เปลี่ยน React Router เป็น 7 ไม่แทน react-scripts ด้วย 0.0.0 และไม่เปลี่ยน CRA เป็น Vite. ช่วงเวอร์ชัน direct React/DOM/Router/Tailwind ของ MovieHub คงเดิม; lockfile ของ tooling จึงต่างจาก snapshot ต้นแบบโดยมีเหตุผลด้าน security

## รายการที่ยังคงอยู่และขอบเขต

| Package | สถานะ upstream / การใช้ใน GameMatch |
|---|---|
| react-router 6.30.6 | Open-redirect advisory แก้ upstream ที่ 7.18.0; GameMatch จำกัด login return path เป็น route allowlist และปฏิเสธ backslash/encoded path; ไม่ส่ง URL ผู้ใช้ตรงเข้า navigate |
| react-router SSR hydration | GameMatch ใช้ BrowserRouter/Routes แบบ declarative ไม่มี SSR/hydration; advisory ระบุว่า Declarative Mode ไม่ได้รับผลจากเส้นทางนี้ |
| webpack-dev-server 4.15.2 | อยู่ใน CRA development server; ไม่ใช่ server ของ static production build. .env.example/.env.local ตั้ง HOST=localhost เพื่อ bind เฉพาะ loopback; ไม่เผยแพร่ dev server เป็นเว็บจริง. ยังมี moderate advisories ของ upstream และ loopback ไม่ได้แก้ทุกเส้นทางของ advisory |
| deepmerge 4.3.1 | upstream ยังไม่มี patched release; พบใน Jest/webpack tooling ไม่ได้ import ใน application source และไม่มี merge กับ API/user data ในแอป |

การลดขอบเขตหรือไม่ใช้เส้นทางที่ได้รับผลไม่ทำให้แพ็กเกจนั้นกลายเป็น patched version จึงคง findings ไว้ตามจริง การย้าย Router major/CRA architecture ต้องเป็นงานที่กำหนดขอบเขตใหม่ ไม่ทำเงียบ ๆ เพื่อให้ตัวเลข audit เป็นศูนย์

แหล่งหลัก:

- [shell-quote](https://github.com/advisories/GHSA-pqg4-j6r4-53mv)
- [Router open redirect](https://github.com/advisories/GHSA-wrjc-x8rr-h8h6)
- [Router SSR hydration](https://github.com/advisories/GHSA-337j-9hxr-rhxg)
- [deepmerge — ไม่มี patched release](https://github.com/advisories/GHSA-gcqx-w48m-w2h4)

ผลในเครื่องและ raw audit JSON ดู [VALIDATION.md](VALIDATION.md)
