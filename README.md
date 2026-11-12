# GameMatch Frontend

Set `REACT_APP_API_URL` in a local `.env` (see `.env.example`) to the GameMatch backend URL. Never put API secrets in React configuration.

The Admin page imports from Steam only. It checks the authenticated `GET /api/admin/sync/status` for `steamConfigured`, then calls `POST /api/admin/sync/steam`. The backend uses a Steam Web API key for catalog IDs and Steam Store for pictures, descriptions, and tags. Imports inspect up to 12 candidates ordered by AppID per batch, rather than newest releases; some candidates may be skipped. Click **นำเข้าชุดถัดไป** to continue. Reloading the page restarts the sequence; the backend deduplicates by Steam ID.

Get a key from https://steamcommunity.com/dev/apikey, set `STEAM_API_KEY` in the backend `.env` or hosting environment, and restart the backend. Click **ตรวจสอบสถานะ Steam อีกครั้ง** after configuring it. Key presence does not guarantee validity or remaining quota. Catalog editing is available even without a key or if the status check fails. Deploy the matching backend update before deploying this frontend.

Install dependencies using `npm ci` for this React Scripts dependency tree. Run `npm test -- --watchAll=false --runInBand` and `npm run build` to verify changes.

## Course structure
React dependencies and lockfile use MovieHub's version snapshot (excluding direct Express/CORS mock-server dependencies). AdminLayout, AdminGameForm and AdminGameList separate navigation, form rendering and table rendering from Admin's state and API calls. Tailwind utility classes and @apply handle common layout, with custom CSS retained for theme/animation. Run npm run check for tests and build.

Shared navigation and footer are separated into Navbar.jsx and Footer.jsx; Shell retains routing and session/theme state. Common layout declarations now use Tailwind @apply with the existing selectors. Custom colors, exact sizing, cinematic animation and responsive overrides remain in CSS to preserve the design.

### Motion previews on Home
The featured carousel uses Steam's public six-second microtrailers for the ten mapped app IDs (`src/utils/heroVideos.js`), via native muted inline HTML video. Only the active clip is loaded; HD artwork remains underneath and serves as fallback. The motion toggle and pause button control playback; reduced-motion/data-saving preferences use still artwork. Gameplay-focused previews are preferred for CS2, Dota 2, Phantom Blade Zero, Slay the Spire 2 and Apex Legends; the previous assets remain codec/source fallbacks. Video slides allow 12 seconds from playback start, with an 8-second loading/stall timeout. Other games retain their official previews. Clips are linked to the original Steam CDN, not copied into the repository; availability and resolution depend on the publisher/Steam. No extra application dependency.
