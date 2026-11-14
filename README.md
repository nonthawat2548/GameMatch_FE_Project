# GameMatch Frontend

**GameMatch — ระบบค้นหา เปรียบเทียบ และแนะนำเกมตามความชอบของผู้ใช้งาน**

Term Project รายวิชา CLIENT SIDE WEB PROGRAMMING – SERVER SIDE WEB PROGRAMMING  
สาขาวิชาเทคโนโลยีสารสนเทศ คณะวิทยาศาสตร์ มหาวิทยาลัยศิลปากร

GameMatch เป็นเว็บแอปพลิเคชันสำหรับค้นหาและสำรวจเกม เปรียบเทียบข้อมูลเกม อ่านและเขียนรีวิว รวมถึงแนะนำเกมตามแนวเกม รูปแบบการเล่น และสไตล์ที่ผู้ใช้งานชอบ โดย repository นี้เป็นส่วน Frontend ที่พัฒนาด้วย React และ Fetch API เชื่อมต่อกับ REST API ของ Backend ซึ่งพัฒนาด้วย Go

## ทีมผู้พัฒนา

| ชื่อ–นามสกุล | รหัสนักศึกษา |
| --- | --- |
| นายนลธวัช ปฐมชัยคุปต์ | 670710207 |
| นายรวมพล จิโนต๋า | 670710983 |

## เว็บไซต์และ Repository

| ส่วน | ลิงก์ |
| --- | --- |
| เว็บไซต์ GameMatch | [gamematch-projectweb-befe.vercel.app](https://gamematch-projectweb-befe.vercel.app/) |
| Frontend (React) | [GameMatch_FE_Project](https://github.com/nonthawat2548/GameMatch_FE_Project) |
| Backend (Go) | [GameMatch_BE_Project](https://github.com/nonthawat2548/GameMatch_BE_Project) |
| Backend API | [Health Check](https://gamematch-api-hzv6.onrender.com/healthz) |
| ผลการทดสอบ Frontend | [GitHub Actions](https://github.com/nonthawat2548/GameMatch_FE_Project/actions) |

## เทคโนโลยีที่ใช้

- **React 19** — พัฒนา UI ด้วย Function Components, Props, State, Hooks และ Context
- **React Router 6** — จัดการเส้นทางของเว็บไซต์และหน้าที่ต้องเข้าสู่ระบบ
- **Fetch API / JSON** — รับส่งข้อมูลกับ Go REST API
- **CSS / Tailwind CSS 3** — จัดรูปแบบเว็บไซต์ โดยมี `src/styles.css` และ `tailwind.config.js`
- **Create React App (react-scripts 5)** — Development server, Build และ Jest
- **Jest / React Testing Library** — ทดสอบ Component, หน้าเว็บ และพฤติกรรมของผู้ใช้งาน
- **Node.js 22.x / npm** — สภาพแวดล้อมสำหรับติดตั้งและ Build ตาม `package.json`
- **Vercel** — Deploy Frontend จาก GitHub

Backend ใช้ Go บน Render และ PostgreSQL บน Supabase 
