# Changelog

## [Unreleased]

### Fixed
- Critical deployment compatibility issues resolved for improved cross-platform support:
  - `server.js` now reads port from `process.env.PORT` environment variable (defaults to 3000) for compatibility with Cloud Run, Heroku, and AWS Elastic Beanstalk dynamic port assignment
  - `package.json` main field corrected from "script.js" to "server.js" for proper module resolution
- Enhanced ECS deployment configuration in `docs/DEPLOYMENT.md`:
  - Added `executionRoleArn` to ECS task definition for proper IAM permissions
  - Added CloudWatch logging configuration to ECS task definition for centralized log management
  - Added comprehensive "ECS Task Execution Role Setup" section with both AWS Console and CLI methods
  - Added CloudWatch log group creation instructions and verification steps

### Changed
- Updated `docs/DEPLOYMENT.md` with deployment best practices and corrections:
  - Removed Dockerfile requirement from Elastic Beanstalk Node.js deployment instructions (uses native Node.js runtime)
  - Updated GitHub Actions workflow to use `actions/checkout@v4` (latest stable version)
  - Added important note about Cloud Run's dynamic PORT environment variable assignment
  - Added "Important Notes" section covering port configuration, security practices, and cost management guidance

### Added
- GitHub repository at https://github.com/WebDev70/hosting-google.git for version control and public collaboration
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
