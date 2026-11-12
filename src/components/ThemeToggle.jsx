export default function ThemeToggle({ theme, onToggle }) {
  const dark = theme === 'dark';
  const label = dark ? 'สลับเป็นธีมสว่าง' : 'สลับเป็นธีมมืด';
  return (
    <button type="button" className="theme-toggle" onClick={onToggle} aria-label={label} title={label}>
      {dark ? (
        <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
        </svg>
      ) : (
        <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.5 14.4A8.8 8.8 0 0 1 9.6 3.5 8.8 8.8 0 1 0 20.5 14.4Z" />
        </svg>
      )}
    </button>
  );
}
