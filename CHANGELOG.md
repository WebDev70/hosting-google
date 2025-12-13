# Changelog

## [Unreleased]

### Added
- Docker containerization support for improved deployment consistency and ease of use:
  - `Dockerfile` for building optimized Node.js application images
  - `.dockerignore` to exclude unnecessary files from Docker builds, reducing image size
  - `docker-compose.yml` for simplified multi-container orchestration and local development
- Updated `docs/quick-start-guide.md` with comprehensive Docker instructions covering building images, running containers, managing container lifecycle, and troubleshooting Docker-related issues

## 1.0.0 - 2025-12-12

### Added
- Initial conversion of static HTML/CSS/JS project to a Node.js Express application.
- `package.json` for dependency management.
- `express` and `axios` dependencies.
- `server.js` to serve static files and proxy USA Spending API requests.
- `public` directory to host `index.html`, `style.css`, and `script.js`.

### Changed
- `script.js` updated to use local server endpoints (`/api/search`, `/api/count`) instead of direct USA Spending API URLs.
