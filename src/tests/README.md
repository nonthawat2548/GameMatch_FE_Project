# React tests

Tests are grouped here by feature: `api/`, `auth/`, `components/`, `pages/`.
`App.test.jsx` exercises complete frontend journeys through the actual Router, Context and fetch helper, mocking HTTP responses only. It does not certify the live Go API, database or browser layout.
Session tests dispatch simulated storage events to check cross-tab UI behavior, including hiding previous member data. These do not replace a real browser multi-tab check.
This folder stays inside `src/` so Create React App discovers tests without ejecting or overriding Jest configuration.

Run from the FE repository root: `npm test -- --watchAll=false --runInBand`.
Run `npm run check` to run all tests and the production build in sequence.
Shared Jest setup remains at `src/setupTests.js`, the CRA convention.

API endpoint functions live in `src/api/endpoints.js` and call the mocked transport from `src/api/backend.js` in component tests. Native dialog methods are minimally provided by setupTests because CRA's jsdom has no showModal/close implementation; focus containment and Escape are checked separately in Chromium. Build-configuration cases use the existing Jest runner in `config/`.
