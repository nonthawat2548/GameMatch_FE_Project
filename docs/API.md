# API ที่ GameMatch Frontend ใช้งาน

อัปเดต 14 พฤศจิกายน 2569 จาก src/api/endpoints.js และพฤติกรรม frontend เอกสารนี้ระบุสิ่งที่ FE ต้องการ ไม่รับรองว่า backend clone ทุกชุดหรือ deployment ทุกตัวอยู่รุ่นเดียวกัน

Base URL: REACT_APP_API_URL; JSON request/response; wrapper เติม Authorization: Bearer เมื่อมี token. Backend เป็นผู้บังคับ authentication/authorization/ownership จริง

## สมาชิก

| Method | Path | Request / response ที่ frontend ใช้ |
|---|---|---|
| POST | /api/auth/register | {email,password,displayName}; success แล้ว FE login ให้อัตโนมัติ |
| POST | /api/auth/login | {email,password}; email อาจเป็น legacy username; คืน {token,user} |
| POST | /api/auth/logout | ยกเลิก session ฝั่ง backend; FE ล้าง session ของบัญชีที่ตรงกับคำขอ |
| GET | /api/me | user: id,email,username?,displayName,role |
| PUT | /api/me | {displayName} แล้ว FE refresh /api/me |
| PUT | /api/me/password | {currentPassword,newPassword}; สำเร็จแล้วกลับ Login |
| GET/PUT | /api/me/preferences | {genre,mode,style} |
| GET | /api/me/favorites | Game[] ของบัญชีที่ยืนยันแล้ว |
| PUT/DELETE | /api/me/favorites/{gameId} | เพิ่ม/ลบ favorite; FE เปลี่ยน state หลัง API สำเร็จ |
| GET | /api/me/recommendations | Game[] จากเกมโปรด |
| GET | /api/me/review-votes/{gameId} | review ID[] ที่โหวตแล้ว; มีปุ่ม retry เฉพาะคำขอนี้ |

ชื่อที่แสดง 1–50 Unicode code points; รหัสผ่านใหม่อย่างน้อย 8 ตัวอักษรและไม่เกิน 72 UTF-8 bytes. Backend ต้องตรวจซ้ำเสมอ

## เกมและคำแนะนำ

| Method | Path | Response |
|---|---|---|
| GET | /api/games | Game[] ทั้งชุดที่เผยแพร่; FE กรอง/เรียงและแบ่งหน้า 24 เกมในเครื่อง |
| GET | /api/games/{id} | Game; URL อ่านง่ายใช้ numeric ID เดิมเรียก API |
| GET | /api/games/{id}/similar | Game[] |
| GET | /api/games/{id}/metadata | Optional Steam metadata เช่น headerImage, screenshots, developers, publishers, releaseDate, price |
| GET | /api/games/{id}/trailers | [{id,title,thumbnail?,sources:URL[]}] |
| GET | /api/games/{id}/steam-rating | คะแนน/จำนวนรีวิว Steam; แยกจากสมาชิก GameMatch |
| POST | /api/recommendations | body {genre,mode,style}; Game[] พร้อม matchScore/reasons/matchBreakdown ถ้ามี |

FE ไม่กำหนดจำนวนผลแนะนำตายตัว: ผลตรวจ API สาธารณะก่อนแก้รอบนี้คืน 10 เกม ขณะที่ fixtures บางชุดคืน 5 เกม ทั้งสองรูปแบบแสดงได้โดยไม่สร้างคะแนนเพิ่มเอง

Quiz ส่ง genre ตาม options ปัจจุบัน: rpg, action, strategy, simulation, adventure, indie, casual, sports, racing, massively-multiplayer, early-access, free-to-play, fps, survival, horror, puzzle, moba; mode: solo/coop/pvp; style: story/competitive/relax/challenge

ผลตรวจสาธารณะวันที่ 14 พฤศจิกายน 2569: rpg/indie/fps/free-to-play ตอบ 200. Backend clone เก่าบางชุดยังรับเพียง 5 genres จึงต้องใช้ backend รุ่นที่ตรงกับ FE เมื่อทดสอบในเครื่อง ไม่เปลี่ยน options โดยอาศัย clone เก่าเพียงอย่างเดียว

Game ที่ UI ใช้มี id,title,description?,descriptionTh?,imageUrl?,genres[],tags[],platforms[],isPublished?,steamId?,rawgId?,releaseDate? และ popularityOrder/popularitySource/popularityUpdatedAt? การจัดอันดับยอดนิยมเป็น catalog snapshot จาก backend ไม่ใช่ live player count

## รีวิว

| Method | Path | Contract |
|---|---|---|
| GET | /api/games/{id}/reviews | Review[] หรือ {reviews:Review[]} สำหรับการอ่าน |
| POST | /api/games/{id}/reviews | {rating,comment}; Member; คืน Review ที่บันทึก |
| PUT | /api/games/{id}/reviews/{reviewId} | {rating,comment}; Owner; คืน Review |
| DELETE | /api/games/{id}/reviews/{reviewId} | Owner/Admin; FE ลบจาก state เมื่อสำเร็จ |
| PUT/DELETE | /api/games/{id}/reviews/{reviewId}/helpful | โหวต/ถอน; คืน {voted,helpfulCount} |

Review มี id,memberId,displayName,rating,comment,createdAt?,helpfulCount?. rating 1–5; comment อย่างน้อย 10 ตัวอักษรและสูงสุด 2000 UTF-8 bytes. สถานะโหวตอ่านไม่ได้จะปิดปุ่มโหวตไว้และให้ retry โดยไม่โหลดรีวิวทั้งหมดซ้ำ

## Admin

| Method | Path | Contract |
|---|---|---|
| GET/POST | /api/admin/games | Game[] / fields ของเกมใหม่ |
| PUT/DELETE | /api/admin/games/{id} | fields ที่แก้ไขได้ / ลบเกม |
| GET | /api/admin/stats | สถิติที่ backend คำนวณ |
| GET | /api/admin/members | Member[] |
| PUT | /api/admin/members/{id}/role | {role:admin/member}; คืน Member ที่อัปเดต |
| GET | /api/admin/sync/status | {steamConfigured:boolean} |
| POST | /api/admin/sync/steam?after={AppID} | {imported,nextAppId,hasMore,note?} |

Create/Edit ส่งเฉพาะ title,description,descriptionTh,imageUrl,genres,tags,platforms,isPublished. ชื่อเกมไม่เกิน 250 UTF-8 bytes; imageUrl ถ้ามีต้องเป็น HTTPS. หลัง write สำเร็จแต่ reload ล้มเหลว การ retry รายการทำ GET โดยไม่เขียนซ้ำ

Steam import ตรวจไม่เกิน 12 candidates ต่อ batch เรียงตาม AppID; จำนวนที่นำเข้าสำเร็จอาจน้อยกว่า 12. Cursor เป็น state ของหน้า ไม่มีการเรียก RAWG จาก Admin UI ปัจจุบัน

## Errors และ session

ปกติ backend คืน {error:string} หรือ {error:{message:string}}; proxy/default handler อาจคืน text/HTML. Wrapper คง HTTP status แม้อ่าน JSON ไม่ได้, รองรับ JSON null, คืน null สำหรับ 204 และคง AbortError

Protected 401 ล้าง token เฉพาะเมื่อยังตรงกับ token ที่เริ่มคำขอ; login 401 และ role 403 ไม่ล้าง session ที่ใช้อยู่. Restore 5xx เก็บ token และให้ retry. Storage event ซ่อนข้อมูลบัญชีเดิมแล้วตรวจ /api/me ใหม่
