# GameMatch Frontend

Set `REACT_APP_API_URL` in a local `.env` (see `.env.example`) to the GameMatch backend URL. Never put API secrets in React configuration.

The Admin page imports from Steam only. It checks the authenticated `GET /api/admin/sync/status` for `steamConfigured`, then calls `POST /api/admin/sync/steam`. The backend uses a Steam Web API key for catalog IDs and Steam Store for pictures, descriptions, and tags. Imports inspect up to 12 candidates ordered by AppID per batch, rather than newest releases; some candidates may be skipped. Click **นำเข้าชุดถัดไป** to continue. Reloading the page restarts the sequence; the backend deduplicates by Steam ID.

Get a key from https://steamcommunity.com/dev/apikey, set `STEAM_API_KEY` in the backend `.env` or hosting environment, and restart the backend. Click **ตรวจสอบสถานะ Steam อีกครั้ง** after configuring it. Key presence does not guarantee validity or remaining quota. Catalog editing is available even without a key or if the status check fails. Deploy the matching backend update before deploying this frontend.

Install dependencies using `npm ci --legacy-peer-deps` for this React Scripts dependency tree. Run `npm test -- --watchAll=false --runInBand` and `npm run build` to verify changes.
