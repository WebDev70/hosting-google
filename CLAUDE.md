# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Node.js/Express application that provides a web interface for searching award data from the USA Spending API. The application uses Express as a proxy server to handle CORS and API requests, serving static HTML/CSS/JS files from the `public` directory.

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
│   └── quick-start-guide.md    # Installation, deployment, and troubleshooting
└── node_modules/              # Installed dependencies
```

## Architecture

**Server (Node.js + Express)**
- `server.js` - Express server that:
  - Serves static files from `public/` directory
  - Proxies API requests to `https://api.usaspending.gov` via two endpoints:
    - `POST /api/search` - Proxies to `/api/v2/search/spending_by_award/`
    - `POST /api/count` - Proxies to `/api/v2/search/spending_by_award_count/`

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

## Docker Configuration

**Overview**
The project includes containerization support using Docker for consistent deployment across environments. Docker Compose is the recommended method for running the application.

**Dockerfile Details**
- **Base Image**: `node:18-alpine` - Official Node.js LTS on lightweight Alpine Linux
- **Multi-stage Best Practices**: Package files copied first to leverage Docker layer caching
- **Security**: Runs as non-root `node` user instead of root
- **Production Dependencies**: Uses `npm ci --only=production` for faster, deterministic installs
- **Port**: Exposes port 3000 (configurable via PORT environment variable)
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

When working on features, maintenance tasks, or addressing user issues, refer to the quick-start-guide.md for context on deployment, configuration, and troubleshooting procedures.

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
