# Repository Guidelines

## Project Structure & Module Organization
- `server.js` hosts the Express proxy that forwards `/api/search` and `/api/count` to the USA Spending API; keep new endpoints co-located here or split into modules under `server/` if it grows.
- `public/` contains the client (HTML/CSS/JS) served by Express; prefer adding new UI assets here and keep shared utilities in `public/script.js`.
- `docs/` holds quick-start guides; add contributor-facing walkthroughs here.
- Containerization lives in `Dockerfile` and `docker-compose.yml` (port 3000 by default).

## Build, Test, and Development Commands
- `npm install` (or `npm ci` in CI/containers) installs dependencies.
- `npm start` runs the Express server on `PORT` (defaults to `3000`) and serves `public/`.
- `docker compose up --build` builds the image and runs the app as `usa-spending-app`; useful for parity with deployment.
- `npm test` currently fails by design; replace with real tests before enabling in CI.

## Coding Style & Naming Conventions
- JavaScript uses CommonJS modules, single quotes, semicolons, and 2–4 space indentation; match the surrounding file.
- Keep route handlers small; extract shared request/response helpers into modules when logic repeats.
- Name files and variables in `camelCase`; keep directory names kebab-case (e.g., `api-helpers/` if added).
- Add brief comments only when intent is non-obvious (e.g., describing proxy payloads or edge cases).

## Testing Guidelines
- No automated tests exist yet; add Jest + Supertest for `server.js` endpoints and DOM/unit tests for `public/script.js`.
- Place tests in `__tests__/` or alongside sources with `.test.js` suffix; mirror file names (`server.test.js`).
- Target key behaviors: successful proxying, error handling when upstream fails, and pagination/render logic in the UI.
- Update `npm test` to run the real suite once added; gate PRs on it locally before submitting.

## Commit & Pull Request Guidelines
- Use concise, imperative commit subjects (e.g., `Add proxy error handling`) and include scope when helpful.
- PRs should summarize the change, note affected endpoints/UI areas, link any tracking issue, and add before/after screenshots for UI tweaks.
- Call out risk areas (proxying, pagination, date filters) and how you verified them (manual steps or tests).
- Keep PRs focused; prefer smaller, reviewable changes over large batches.

## Security & Configuration
- No secrets are required; never hardcode API keys. Rely on `PORT` for server binding and keep all other configuration in environment variables when added.
- Validate and sanitize any new request payloads before forwarding to upstream APIs to avoid accidental misuse.
