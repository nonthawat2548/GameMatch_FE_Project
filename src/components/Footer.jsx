export default function Footer() {
  return (
      <footer>
        <div className="footer-inner">
          <span>GameMatch</span>
          <p>
            แหล่งข้อมูล{' '}
            <a href="https://store.steampowered.com/explore/new/" target="_blank" rel="noopener noreferrer">
              Steam
            </a>
            {' · '}
            <a href="https://rawg.io" target="_blank" rel="noopener noreferrer">
              RAWG
            </a>
          </p>
          <small>เว็บไซต์อิสระ · ไม่ได้เป็นส่วนหนึ่งของ Valve</small>
        </div>
      </footer>
  );
}
