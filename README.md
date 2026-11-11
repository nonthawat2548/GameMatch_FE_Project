# GameMatch Frontend

React 19, Create React App/react-scripts, React Router 6, Tailwind CSS 3 and native fetch/JSON. Go handles authentication, authorization and PostgreSQL access.

Backend: https://github.com/nonthawat2548/GameMatch_BE_Project

## Local setup

Use Node 22 and run from this repository root:

```powershell
npm ci --legacy-peer-deps
Copy-Item .env.example .env.local
npm start
```

Set REACT_APP_API_URL=http://localhost:8080 in .env.local. Start Go separately and open http://localhost:3000. CRA environment variables are public build-time values: never add DATABASE_URL, JWT_SECRET or RAWG_API_KEY to React.

Run npm run check for formatting, React assertions and production build. Optional isolated headless checks: [browser instructions](tests/browser/README.md). Set GM_BACKEND_DIR to the backend clone path for live cross-repo QA (default: sibling ../GameMatch_BE_Project).

## Vercel settings

- Repository: nonthawat2548/GameMatch_FE_Project, branch main.
- Root Directory: repository root (.), no frontend subdirectory.
- Framework: Create React App; Node 22.
- Install: npm ci --legacy-peer-deps; Build: npm run build; Output: build.
- Set REACT_APP_API_URL to the verified Render API origin, then rebuild.
- vercel.json handles SPA routes; verify direct nested-route refresh.
- Set the exact Vercel origin in the backend ALLOWED_ORIGINS.

Existing hosting used the old combined repo. This source transfer does not reconnect or redeploy hosting. See [split validation](REPOSITORY_SPLIT.md).

## Scope and limitations

Guest discovery and rules-based matching (45/25/30), member authentication/favorites/preferences/profile and Admin game management/import UI. Go enforces roles and ownership. JWT localStorage follows the course pattern and is susceptible to XSS; do not render unsafe HTML. RAWG needs a server-side key and attribution. Demo fixtures are fictional; Steam data is a manually refreshed snapshot. Historical validation, dependency advisories and submission limitations: [validation](docs/VALIDATION.md).
