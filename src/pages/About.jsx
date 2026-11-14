import { Link } from 'react-router-dom';

export default function About() {
  return (
    <article className="about-page">
      <h1>เกี่ยวกับ GameMatch</h1>
      <p>
        โปรเจกต์รายวิชา CLIENT SIDE WEB PROGRAMMING–SERVER SIDE WEB PROGRAMMING
        สาขาวิชาเทคโนโลยีสารสนเทศ คณะวิทยาศาสตร์ มหาวิทยาลัยศิลปากร
      </p>
      <p className="muted">
        พัฒนาเพื่อค้นหา เปรียบเทียบ อ่าน/เขียนรีวิว และแนะนำเกมที่ตรงกับความชอบ
      </p>

      <section className="panel">
        <h2>ทีมผู้พัฒนา</h2>
        <ul className="about-team-list">
          <li>นายนลธวัช ปฐมชัยคุปต์ (670710207)</li>
          <li>นายรวมพล จิโนต๋า (670710983)</li>
        </ul>
      </section>

      <section className="about-section">
        <h2>เริ่มใช้งาน & วิธีคิดคะแนน</h2>
        <ol className="about-steps">
          <li>สำรวจ ค้นหา เปรียบเทียบ และดูรายละเอียดเกมได้ทันทีโดยไม่ต้องสมัครสมาชิก</li>
          <li>ตอบคำถาม 3 ขั้นตอนในหน้าแนะนำเกม (แนวเกม 45 คะแนน · เล่นกับใคร 25 คะแนน · ฟีลเกม 30 คะแนน)</li>
          <li>เข้าสู่ระบบเพื่อบันทึกเกมโปรด เก็บความชอบ เขียนรีวิว และโหวตรีวิวที่มีประโยชน์</li>
        </ol>
        <Link className="button" to="/match">
          เริ่มเลือกเกม
        </Link>
      </section>

      <section className="about-section">
        <h2>แหล่งที่มาของข้อมูล</h2>
        <p>
          ข้อมูลเกม ราคา แท็ก คะแนนรีวิว และสื่อตัวอย่างอ้างอิงจาก{' '}
          <a
            className="inline-link"
            href="https://store.steampowered.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Steam
          </a>{' '}
          (Steam Store / Steam Web API) และ{' '}
          <a className="inline-link" href="https://rawg.io" target="_blank" rel="noopener noreferrer">
            RAWG
          </a>{' '}
          เพื่อการศึกษาและการพัฒนาซอฟต์แวร์เท่านั้น
        </p>
        <p className="muted">
          เว็บไซต์นี้เป็นโปรเจกต์เพื่อการศึกษา ไม่ได้มีส่วนเกี่ยวข้องหรือได้รับการรับรองจาก Valve,
          Steam หรือ RAWG ข้อมูลและภาพทั้งหมดเป็นสิทธิ์ของเจ้าของผลงานแต่ละเกม
        </p>
      </section>
    </article>
  );
}
