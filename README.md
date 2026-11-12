# GameMatch Frontend

Set `REACT_APP_API_URL` in a local `.env` (see `.env.example`) to the GameMatch backend URL. Never put API secrets in React configuration.

The Admin page imports from Steam only. It checks the authenticated `GET /api/admin/sync/status` for `steamConfigured`, then calls `POST /api/admin/sync/steam`. The backend uses a Steam Web API key for catalog IDs and Steam Store for pictures, descriptions, and tags. Imports inspect up to 12 candidates ordered by AppID per batch, rather than newest releases; some candidates may be skipped. Click **นำเข้าชุดถัดไป** to continue. Reloading the page restarts the sequence; the backend deduplicates by Steam ID.

Get a key from https://steamcommunity.com/dev/apikey, set `STEAM_API_KEY` in the backend `.env` or hosting environment, and restart the backend. Click **ตรวจสอบสถานะ Steam อีกครั้ง** after configuring it. Key presence does not guarantee validity or remaining quota. Catalog editing is available even without a key or if the status check fails. Deploy the matching backend update before deploying this frontend.

Install dependencies using `npm ci` for this React Scripts dependency tree. Run `npm test -- --watchAll=false --runInBand` and `npm run build` to verify changes.

## Course structure
React dependencies and lockfile use MovieHub's version snapshot (excluding direct Express/CORS mock-server dependencies). AdminLayout, AdminGameForm and AdminGameList separate navigation, form rendering and table rendering from Admin's state and API calls. Tailwind utility classes and @apply handle common layout, with custom CSS retained for theme/animation. Run npm run check for tests and build.

Shared navigation and footer are separated into Navbar.jsx and Footer.jsx; Shell retains routing and session/theme state. Common layout declarations now use Tailwind @apply with the existing selectors. Custom colors, exact sizing, cinematic animation and responsive overrides remain in CSS to preserve the design.

### Motion previews on Home
The featured carousel uses Steam's public six-second microtrailers for the ten mapped app IDs (`src/utils/heroVideos.js`), via native muted inline HTML video. Only the active clip is loaded; HD artwork remains underneath and serves as fallback. The motion toggle and pause button control playback; reduced-motion/data-saving preferences use still artwork. Gameplay-focused previews are preferred for CS2, Dota 2, Phantom Blade Zero, Slay the Spire 2 and Apex Legends; the previous assets remain codec/source fallbacks. Video slides allow 12 seconds from the first playback event, with an 8-second initial loading timeout. Subsequent loop, buffering, stalled and fallback-source events never reset the deadline. Other games retain their official previews. Clips are linked to the original Steam CDN, not copied into the repository; availability and resolution depend on the publisher/Steam. No extra application dependency.

### Game detail trailers (course stack only)
React fetches /api/games/{id}/trailers on a Steam game's detail page. Go queries the published game Steam ID and Steam Store metadata. Native HTML video supports controls, fullscreen, muted autoplay and source fallback. Current Steam adaptive-only assets use their short official preview rather than adding a streaming library; a link opens the full trailer on Steam. No extra npm packages, no video rehosting or DB migration. RAWG/manual games without a Steam ID retain the image.

### Steam player review score
Game detail fetches /api/games/{id}/steam-rating independently of the member review section and match score. Displays positive percentage (calculated from Steam counts), Steam review description, total and positive/negative counts. Uses Steam's published default purchase filter, all languages, all review types, and default off-topic exclusion. Empty reviews and upstream failures have distinct states. No new package or schema change.

### Mobile layout
At widths up to 760px, Navbar uses a React state-controlled collapsible navigation (same links and authorization checks); the theme button remains accessible in the single-row header. The existing hero video/cover is shown before the search and actions, with compact stats and responsive touch controls. Catalog cards retain two columns, matching results stay readable in one column on small phones, and admin/compare tables scroll inside their container. CSS/Tailwind only, no new packages or API changes.
