import { Link } from 'react-router-dom';

export default function About() {
  return (
    <article className="about-page">
      <h1>เกี่ยวกับ GameMatch</h1>
      <p className="muted">เว็บไซต์ค้นหา เปรียบเทียบ และแนะนำเกมจากข้อมูล Steam</p>
      <section className="panel">
        <h2>เริ่มใช้งาน</h2>
        <ol className="about-steps">
          <li>ดูเกมได้เลย ไม่ต้องสมัครสมาชิก</li>
          <li>ตอบ 3 ข้อ แล้วดูเกมที่น่าจะถูกใจ พร้อมเหตุผลว่าทำไมถึงแนะนำ</li>
          <li>เข้าสู่ระบบเพื่อเก็บเกมโปรดและบันทึกความชอบไว้ใช้ครั้งต่อไป</li>
        </ol>
        <Link className="button" to="/match">
          เริ่มเลือกเกม
        </Link>
      </section>
      <section className="about-section">
        <h2>วิธีคิดคะแนน</h2>
        <p>
          เราเทียบคำตอบของคุณกับข้อมูลเกม โดยให้แนวเกม 45 คะแนน เล่นกับใคร 25 คะแนน และฟีลเกม 30 คะแนน
          แล้วเลือกเกมที่ได้คะแนนสูงสุดมาให้ดูได้ถึง 10 เกม
        </p>
        <p className="muted">
          ถ้ายังไม่มีข้อมูลตรงกับคำตอบข้อนั้น เราจะไม่ให้คะแนนเพิ่ม คะแนนเป็นแค่ตัวช่วยเลือกเกม
          สุดท้ายคุณเป็นคนเลือกเองว่าเกมไหนน่าเล่น
        </p>
      </section>
      <section className="about-section">
        <h2>แหล่งข้อมูล</h2>
        <p>
          คลังยอดนิยมคัดจาก{' '}
          <a
            className="inline-link"
            href="https://store.steampowered.com/charts/mostplayed"
            target="_blank"
            rel="noreferrer"
          >
            Steam Most Played
          </a>{' '}
          และ{' '}
          <a
            className="inline-link"
            href="https://store.steampowered.com/search/?filter=topsellers&category1=998&cc=th"
            target="_blank"
            rel="noreferrer"
          >
            Top Sellers ในประเทศไทย
          </a>{' '}
          เลือกเฉพาะเกมที่ข้อมูลครบ ไม่ใช่อันดับรวมแบบสดหรือการรับประกันความชอบ
        </p>
        <p>
          รายชื่อเกมจาก Steam Web API ส่วนภาพ วันที่วางจำหน่าย และแท็กจาก{' '}
          <a
            className="inline-link"
            href="https://store.steampowered.com/"
            target="_blank"
            rel="noreferrer"
          >
            Steam Store
          </a>{' '}
          อัปเดตโดยผู้ดูแล การนำเข้าปัจจุบันใช้ Steam เท่านั้น และยังแสดงแหล่งที่มาของข้อมูลเดิมจาก{' '}
          <a className="inline-link" href="https://rawg.io" target="_blank" rel="noreferrer">
            RAWG
          </a>{' '}
          ส่วนคำอธิบายเพิ่มเติมจัดการโดยผู้ดูแล GameMatch
        </p>
        <p className="muted">
          คลังแสดงชุดยอดนิยมก่อน และเลือกเรียงตามวันที่วางจำหน่ายที่แหล่งข้อมูลระบุได้
          ไม่ครอบคลุมเกมทั้งหมดหรืออัปเดตอัตโนมัติ GameMatch เป็นโปรเจกต์อิสระ
          ข้อมูลและภาพเป็นของเจ้าของสิทธิ์แต่ละเกม
        </p>
        <p className="muted">
          รายการที่ขึ้นต้นด้วย Demo: เป็นเกมสมมติสำหรับทดสอบระบบ ไม่ใช่ข้อมูลเกมจริง
          เราไม่แสดงราคาหรือเวลาเล่นที่ยังไม่ได้ตรวจสอบ
        </p>
      </section>
    </article>
  );
}
