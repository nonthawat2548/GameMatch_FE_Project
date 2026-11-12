export default function Footer() {
  return (
      <footer>
        <div className="footer-inner">
          <span>GameMatch</span>
          <p>
            แหล่งข้อมูล{' '}
            <a href="https://store.steampowered.com/explore/new/" target="_blank" rel="noreferrer">
              Steam
            </a>
            {' · '}
            <a href="https://rawg.io" target="_blank" rel="noreferrer">
              RAWG
            </a>
          </p>
          <small>รายการที่ขึ้นต้นด้วย Demo: เป็นข้อมูลตัวอย่าง</small>
        </div>
      </footer>
  );
}
