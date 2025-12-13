# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Node.js/Express application that provides a web interface for searching award data from the USA Spending API. The application uses Express as a proxy server to handle CORS and API requests, serving static HTML/CSS/JS files from the `public` directory.

## Repository

**GitHub Repository**: https://github.com/WebDev70/hosting-google.git

**Cloning the Repository**
```bash
git clone https://github.com/WebDev70/hosting-google.git
cd hosting-google/node
npm install
npm start
```

**Git Workflow Guidelines for AI Assistants**
- The repository is a standalone Node.js project without submodules
- Main branch is the primary development and deployment branch
- All changes should be committed with clear, descriptive messages
- Include relevant file names in commit messages when multiple files are changed
- Before pushing changes, ensure:
  - All dependencies are properly listed in `package.json`
  - No sensitive information (API keys, credentials) is committed
  - `.gitignore` prevents `node_modules/` and environment files from being tracked
- When working on features or bug fixes, create descriptive commit messages that explain the "why" behind changes

**Important Files to Preserve**
- `CLAUDE.md` and `GEMINI.md` - AI assistant guidance documents (update these when changing project patterns)
- `CHANGELOG.md` - Version history (update when making significant changes)
- `docker-compose.yml` and `Dockerfile` - Container configuration
- `package.json` and `package-lock.json` - Dependency management

## Project Structure

```
node/
├── CLAUDE.md                   # AI assistant guidance document (this file)
├── CHANGELOG.md                # Version history and updates
├── GEMINI.md                   # Gemini AI assistant guidance
├── Dockerfile                  # Docker container configuration (Node 18 Alpine)
├── docker-compose.yml          # Docker Compose setup with health checks
├── .dockerignore                # Docker build exclude patterns
├── server.js                   # Express server with API proxy endpoints
├── package.json                # Project dependencies and scripts
├── package-lock.json           # Locked dependency versions
├── public/                     # Static files served to browser
│   ├── index.html             # Main UI with search form
│   ├── script.js              # Client-side logic and API calls
│   └── style.css              # Styling
├── docs/                       # Project documentation
│   ├── DEPLOYMENT.md           # Cloud platform deployment guides (AWS, GCP)
│   └── quick-start-guide.md    # Installation, configuration, and troubleshooting
└── node_modules/              # Installed dependencies
```

## Architecture

**Server (Node.js + Express)**
- `server.js` - Express server that:
  - Reads PORT from environment variable or defaults to 3000: `const port = process.env.PORT || 3000;`
  - Serves static files from `public/` directory
  - Proxies API requests to `https://api.usaspending.gov` via two endpoints:
    - `POST /api/search` - Proxies to `/api/v2/search/spending_by_award/`
    - `POST /api/count` - Proxies to `/api/v2/search/spending_by_award_count/`
  - Dynamic port configuration enables compatibility with cloud platforms (Cloud Run, Elastic Beanstalk, Heroku)

**Client (Vanilla JavaScript)**
- `public/index.html` - Form-based UI with search filters for awards
- `public/script.js` - Client-side logic that:
  - Builds filter objects from form inputs (keywords, agency, dates, award types, etc.)
  - Fetches total record count via `/api/count`
  - Fetches paginated results via `/api/search`
  - Renders results in a table with links to usaspending.gov
  - Handles pagination (10 records per page)
- `public/style.css` - Styling for the application

**Key Data Flow**
1. User submits search form with filters
2. `buildFilters()` constructs filters object from form inputs
3. `fetchTotalCount()` gets total matching records
4. `fetchResults()` gets paginated results with specified fields
5. `renderResults()` populates table with recipient names, award IDs, types, descriptions, and amounts
6. Dynamic URLs generated for each recipient based on selected filters

## Port Configuration and Environment Variables

**PORT Environment Variable**
The server uses `process.env.PORT || 3000` for dynamic port configuration. This is critical for cloud platform compatibility:
- **Local Development**: Defaults to port 3000 when PORT env var is not set
- **Docker Containers**: Can be overridden via environment variables in compose files or container run commands
- **Cloud Platforms**:
  - Google Cloud Run: Dynamically assigns PORT (typically 8080) - application automatically adapts
  - AWS Elastic Beanstalk: Can set via environment properties
  - AWS ECS/Fargate: Can set via task definition environment variables
  - Heroku: Assigns PORT dynamically - application adapts automatically

This design ensures the same codebase works across different deployment environments without modification.

## Docker Configuration

**Overview**
The project includes containerization support using Docker for consistent deployment across environments. Docker Compose is the recommended method for running the application.

**Dockerfile Details**
- **Base Image**: `node:18-alpine` - Official Node.js LTS on lightweight Alpine Linux
- **Multi-stage Best Practices**: Package files copied first to leverage Docker layer caching
- **Security**: Runs as non-root `node` user instead of root
- **Production Dependencies**: Uses `npm ci --only=production` for faster, deterministic installs
- **Port**: Containerized via PORT environment variable (app defaults to 3000, compatible with Cloud Run and other platforms)
- **Image Size**: Alpine-based images are significantly smaller than full Node.js images

**Docker Compose Configuration**
- **Service Name**: `usa-spending-app` with container name `usa-spending-search`
- **Health Checks**:
  - Test: HTTP GET to `http://localhost:3000` using wget
  - Interval: 30 seconds between checks
  - Timeout: 10 seconds per check
  - Retries: 3 failed checks before marking unhealthy
  - Start Period: 40 seconds before first check (allows app startup time)
- **Restart Policy**: `unless-stopped` - automatically restarts if container crashes
- **Environment**: Sets `NODE_ENV=production` and `PORT=3000`

**.dockerignore Exclusions**
The `.dockerignore` file prevents unnecessary files from being copied into the Docker image, reducing image size and build time:
- `node_modules/` - Reinstalled during build with `npm ci`
- Documentation files (*.md, docs/)
- Git files (.git, .gitignore)
- IDE configurations (.vscode, .idea)
- OS files (.DS_Store, Thumbs.db)
- Log files and environment files (.env)
- Docker files themselves (Dockerfile, docker-compose.yml)

**Deployment Considerations**
- The health check ensures the container is actually serving requests, making orchestration platforms (Kubernetes, Docker Swarm) aware of container state
- Non-root user execution improves security by limiting potential damage if the Node.js process is compromised
- Production environment variable ensures the Express server runs in optimized production mode
- Alpine Linux base reduces attack surface and resource consumption compared to full Linux distributions
- Dynamic PORT configuration enables seamless deployment to cloud platforms that assign ports dynamically

## Common Commands

**Development (Local)**
```bash
npm start              # Start the Express server on port 3000
node server.js         # Alternative way to start the server
npm install            # Install dependencies (express, axios)
```

**Docker (Containerized)**
```bash
# Build and run with Docker Compose (recommended)
docker-compose up                 # Build and start container with health checks
docker-compose up -d              # Start in detached mode (background)
docker-compose down               # Stop and remove container
docker-compose logs -f            # Follow container logs
docker-compose ps                 # Show running containers

# Manual Docker build and run
docker build -t usa-spending-app . # Build image with tag
docker run -p 3000:3000 usa-spending-app # Run container
docker run -p 3000:3000 -d usa-spending-app # Run in detached mode
```

**Access the application**
- Server runs at: `http://localhost:3000`
- No build process required - static files served directly
- Docker health checks run every 30 seconds, allowing 40s startup period

## Documentation

The `docs/` directory contains comprehensive project documentation for users and administrators:

**DEPLOYMENT.md** - Cloud deployment reference guide containing:
- AWS Elastic Beanstalk deployment (Node.js platform, no Docker required)
- AWS ECS/Fargate deployment (Docker-based, with ALB integration)
- ECS Task Execution Role setup (console and CLI methods)
- AWS CodePipeline and GitHub Actions CI/CD examples
- Google Cloud Run deployment (serverless, auto-scaling, dynamic PORT handling)
- Google App Engine deployment (Flexible Environment)
- Google Cloud Build CI/CD workflow
- Security best practices (credentials, AWS Secrets Manager)
- Cost management guidelines (stopping unused resources)
- Port configuration notes for Cloud Run and Elastic Beanstalk

**quick-start-guide.md** - Primary reference guide containing:
- Prerequisites and installation instructions
- Running and configuring the application
- Administration tasks (viewing logs, monitoring, updating dependencies, backups)
- Deployment considerations (process managers, reverse proxies, environment variables)
- Security considerations for production use
- Troubleshooting section covering common issues:
  - Server startup problems (port conflicts)
  - API connection errors
  - No search results returned
  - Dependency installation issues
- Maintenance guidelines and regular task schedules
- Support resources and help contacts

When deploying to cloud platforms, refer to DEPLOYMENT.md for detailed instructions. For general configuration, troubleshooting, and maintenance, refer to quick-start-guide.md.

## Important Implementation Details

**Filter Building Logic**
- The `buildFilters()` function in `script.js` handles complex conditional logic for agency filters:
  - Supports both top-tier and sub-tier agency filtering
  - Handles awarding vs funding agency distinction
  - Has fallback defaults (e.g., contracts A-D if no award type selected)
- Default date range is last 180 days if not specified

**Award Type Codes**
- Contracts: A (BPA), B (Purchase Order), C (Delivery Order), D (Definitive Contract)
- Grants: 02 (Block), 03 (Formula), 04 (Project), 05 (Cooperative Agreement)
- IDVs: IDV_A (GWAC), IDV_B through IDV_E (various IDV types)

**API Response Fields**
The application fetches these fields from USA Spending API:
- Awarding/Funding Agency info (name, code, sub-agency)
- Award ID, Amount, Type, Description
- Infrastructure Outlays/Obligations
- Recipient Name, UEI, IDs
- Place of Performance, Last Modified Date, Base Obligation Date

**Error Handling**
- Server-side errors logged to console with API response details
- Client-side displays loader during requests, hides on completion
- Detailed error logging includes status codes, status text, and error messages
