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
- Custom Claude skill `usaspending-api-helper` in `.claude/skills/` directory:
  - Provides expert knowledge of USA Spending API integration patterns
  - Auto-activates when working with API requests, filters, award types, or debugging API responses
  - Includes comprehensive documentation of award type codes (contracts A-D, grants 02-05, IDVs)
  - Documents filter building logic for agency tiers, date ranges, and award types
  - Provides implementation patterns, best practices, and exact file location references
  - Updated `CLAUDE.md` with Custom Skills section documenting skill purpose, activation triggers, and benefits
- Custom Claude skill `env-var-manager` in `.claude/skills/` directory:
  - Manages environment variable additions across all project files with comprehensive checklists
  - Auto-activates when adding environment variables, updating configuration, or modifying deployment settings
  - Provides complete file update checklist (.env.example, server.js, docs, CLAUDE.md, Docker configs)
  - Includes security rules for handling sensitive vs non-sensitive values by platform
  - Documents platform-specific considerations (Cloud Run, Elastic Beanstalk, ECS/Fargate, Heroku, Docker)
  - Provides common patterns (feature flags, API config, database config), testing procedures, and troubleshooting
  - Includes quick reference commands for all supported deployment platforms
  - Updated `CLAUDE.md` Custom Skills section with env-var-manager documentation
- GitHub repository at https://github.com/WebDev70/hosting-google.git for version control and public collaboration
- Docker containerization support for improved deployment consistency and ease of use:
  - `Dockerfile` for building optimized Node.js application images
  - `.dockerignore` to exclude unnecessary files from Docker builds, reducing image size
  - `docker-compose.yml` for simplified multi-container orchestration and local development
- Updated `docs/quick-start-guide.md` with comprehensive Docker instructions covering building images, running containers, managing container lifecycle, and troubleshooting Docker-related issues
- Environment variable management infrastructure for consistent configuration across development and production environments:
  - `.gitignore` file to prevent committing sensitive files (node_modules, .env, logs, IDE files, build artifacts, Elastic Beanstalk files)
  - `.env.example` template documenting all environment variables (PORT, NODE_ENV) with inline comments for configuration reference
  - `docs/ENVIRONMENT-VARIABLES.md` comprehensive guide covering environment variable setup, local development (3 setup options), production deployment instructions for all supported platforms (AWS EB, ECS, Cloud Run, App Engine, Heroku, Docker), security best practices, troubleshooting, and platform-specific notes about automatic PORT assignment

## 1.0.0 - 2025-12-12

### Added
- Initial conversion of static HTML/CSS/JS project to a Node.js Express application.
- `package.json` for dependency management.
- `express` and `axios` dependencies.
- `server.js` to serve static files and proxy USA Spending API requests.
- `public` directory to host `index.html`, `style.css`, and `script.js`.

### Changed
- `script.js` updated to use local server endpoints (`/api/search`, `/api/count`) instead of direct USA Spending API URLs.
