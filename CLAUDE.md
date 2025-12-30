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
  - `.gitignore` prevents `node_modules/`, `.env` files, IDE configurations, and log files from being tracked
  - `.env.example` is kept up-to-date when adding new environment variables
- When working on features or bug fixes, create descriptive commit messages that explain the "why" behind changes
- Never commit `.env` files - they contain local/deployment-specific configuration and are in `.gitignore`

**Important Files to Preserve**
- `CLAUDE.md` and `GEMINI.md` - AI assistant guidance documents (update these when changing project patterns)
- `AGENTS.md` - Repository guidelines for coding style, testing, commits, and security
- `CHANGELOG.md` - Version history (update when making significant changes)
- `docker-compose.yml` and `Dockerfile` - Container configuration
- `cloudbuild.yaml` - Google Cloud Build CI/CD configuration
- `GKE_DEPLOYMENT_GUIDE.md` - Google Kubernetes Engine deployment instructions
- `package.json` and `package-lock.json` - Dependency management

## Project Structure

```
node/
├── CLAUDE.md                   # AI assistant guidance document (this file)
├── CHANGELOG.md                # Version history and updates
├── GEMINI.md                   # Gemini AI assistant guidance
├── AGENTS.md                   # Repository guidelines (coding style, testing, commits, security)
├── .gitignore                  # Git ignore patterns (node_modules, .env, IDE files, logs, etc.)
├── .env.example                # Environment variables template (copy to .env for local development)
├── Dockerfile                  # Docker container configuration (Node 18 Alpine)
├── docker-compose.yml          # Docker Compose setup with health checks
├── .dockerignore               # Docker build exclude patterns
├── cloudbuild.yaml             # Google Cloud Build CI/CD configuration for Cloud Run
├── GKE_DEPLOYMENT_GUIDE.md     # Google Kubernetes Engine deployment instructions
├── server.js                   # Express server with API proxy endpoints
├── package.json                # Project dependencies and scripts
├── package-lock.json           # Locked dependency versions
├── .claude/                    # Claude Code custom agents and skills
│   ├── agents/                # Custom agents for automation
│   │   ├── changelog-maintainer.md
│   │   ├── claude-md-updater.md
│   │   ├── quickstart-updater.md
│   │   ├── docker-config-validator.md
│   │   └── conversation-logger.md
│   └── skills/                # Custom skills for domain knowledge
│       ├── usaspending-api-helper/
│       └── env-var-manager/
├── public/                     # Static files served to browser
│   ├── index.html             # Main UI with search form
│   ├── script.js              # Client-side logic and API calls
│   └── style.css              # Styling
├── docs/                       # Project documentation
│   ├── ENVIRONMENT-VARIABLES.md # Environment variables guide and setup instructions
│   ├── DEPLOYMENT.md           # Cloud platform deployment guides (AWS, GCP)
│   ├── quick-start-guide.md    # Installation, configuration, and troubleshooting
│   ├── quick-start-guide2.md   # Alternative simplified quick start guide
│   └── logs/                   # Log files directory
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

## Environment Variables

The application uses environment variables for configuration. See `docs/ENVIRONMENT-VARIABLES.md` for comprehensive documentation.

**Currently Supported Variables:**
- `PORT` (optional, defaults to 3000) - Server port. Useful for local development or platform-specific configurations
- `NODE_ENV` (optional) - Node environment: `development`, `production`, or `test`

**Setup Instructions:**

1. **Local Development**: Copy `.env.example` to `.env` and customize as needed
   ```bash
   cp .env.example .env
   ```

2. **Important**: `.env` files are in `.gitignore` and should never be committed to the repository

3. **Default Behavior**: When no `.env` file exists, the server uses:
   - PORT: 3000
   - NODE_ENV: (unset)

**Cloud Deployment**: Each platform has its own method for setting environment variables securely. See `docs/ENVIRONMENT-VARIABLES.md` for platform-specific instructions (AWS Elastic Beanstalk, ECS/Fargate, Google Cloud Run, App Engine, Heroku, and Docker).

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
docker compose up                 # Build and start container with health checks
docker compose up -d              # Start in detached mode (background)
docker compose down               # Stop and remove container
docker compose logs -f            # Follow container logs
docker compose ps                 # Show running containers

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

**ENVIRONMENT-VARIABLES.md** - Environment variables setup and configuration guide containing:
- List of currently supported environment variables (PORT, NODE_ENV)
- Local development setup options (with .env file, terminal variables, inline with npm start)
- Platform-specific environment variable setup instructions:
  - AWS Elastic Beanstalk (console and EB CLI methods)
  - AWS ECS/Fargate (task definition format)
  - Google Cloud Run (gcloud command and Cloud Console)
  - Google App Engine (app.yaml configuration)
  - Heroku (CLI and dashboard methods)
  - Docker and Docker Compose
- Security best practices and organization guidelines
- Future considerations for adding new environment variables
- Troubleshooting section (variables not being read, port conflicts, production issues)
- Platform-specific notes (Cloud Run auto-PORT, Elastic Beanstalk port handling, etc.)

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

When setting up the application or adding environment variables, refer to ENVIRONMENT-VARIABLES.md. When deploying to cloud platforms, refer to DEPLOYMENT.md for detailed instructions. For general configuration, troubleshooting, and maintenance, refer to quick-start-guide.md.

**quick-start-guide2.md** - Alternative simplified quick start guide containing:
- Streamlined installation instructions
- Basic prerequisites (Node.js, Git, npm)
- Quick setup commands (clone, install, start)
- First steps for accessing the application
- Common troubleshooting issues

## Additional Project Files

**AGENTS.md** - Repository guidelines for contributors and AI assistants containing:
- Project structure and module organization principles
- Build, test, and development commands
- Coding style and naming conventions (CommonJS, camelCase, semicolons)
- Testing guidelines (currently no tests, recommendations for Jest + Supertest)
- Commit and pull request best practices
- Security and configuration standards
- Emphasis on validating request payloads before proxying to upstream APIs

**cloudbuild.yaml** - Google Cloud Build CI/CD configuration containing:
- Automated Docker image build steps using `gcr.io/cloud-builders/docker`
- Container image push to Google Container Registry (GCR)
- Automated deployment to Google Cloud Run using gcloud SDK
- Substitution variables for service name (`award-search`) and region (`us-central1`)
- Platform configuration for managed Cloud Run with unauthenticated access
- Cloud logging configuration

**GKE_DEPLOYMENT_GUIDE.md** - Google Kubernetes Engine deployment guide containing:
- One-time Google Cloud and local environment setup
- GKE cluster creation instructions (2-node e2-medium cluster)
- Artifact Registry repository creation for Docker images
- Docker authentication configuration for Artifact Registry
- Instructions for converting docker-compose.yml to Kubernetes manifests using kompose
- Kubernetes deployment and service manifest creation for Node.js app
- Build and push workflows for Docker images to Artifact Registry
- kubectl commands for deploying to GKE and verifying deployments
- Service exposure via LoadBalancer for public access
- Note: This guide also references Drupal applications which may be part of a larger multi-app deployment strategy

When setting up CI/CD, refer to cloudbuild.yaml for Cloud Build configuration. For Kubernetes deployments, refer to GKE_DEPLOYMENT_GUIDE.md. For general repository conventions and coding standards, refer to AGENTS.md.

## Custom AI Agents

This project includes custom Claude agents defined in `.claude/agents/` directory that automate documentation, validation, and logging tasks. These agents enhance development workflow by automatically maintaining documentation accuracy and validating configurations.

### Agent Overview

| Agent | Purpose | Trigger |
|-------|---------|---------|
| **changelog-maintainer** | Updates CHANGELOG.md with code changes | After feature implementation, bug fixes, dependency updates |
| **claude-md-updater** | Updates CLAUDE.md with architecture/structure changes | After creating files, changing patterns, adding dependencies |
| **quickstart-updater** | Updates docs/quick-start-guide.md with setup/installation changes | After modifying setup procedures or dependencies |
| **docker-config-validator** | Validates Dockerfile and docker-compose.yml match application requirements | After code changes affecting Docker configs, new dependencies |
| **cloudbuild-updater** | Updates cloudbuild.yaml to align with project changes | After dependency updates, Docker config changes, environment variables, build scripts |
| **conversation-logger** | Archives conversation sessions with timestamps and structured summaries | After significant work sessions, on user request |

### 1. changelog-maintainer

**File**: `.claude/agents/changelog-maintainer.md`

**Purpose**: Automatically updates `CHANGELOG.md` to document all significant code changes.

**Invokes When**:
- New features or functionality is implemented
- Bug fixes are completed
- Dependencies are added, updated, or removed
- Breaking changes are introduced
- Code is refactored with user-facing impact
- Performance improvements are made
- Security patches are applied

**How It Works**:
- Reviews conversation history and file modifications
- Identifies all changes worthy of documentation
- Follows Keep a Changelog format with categories: Added, Changed, Deprecated, Removed, Fixed, Security
- Maintains [Unreleased] section at the top with newest changes
- Adds entries with clear imperative language and relevant context
- Preserves existing changelog structure and version history

**Output Format**: Entries in CHANGELOG.md under appropriate categories with descriptions, affected components, and references when applicable.

### 2. claude-md-updater

**File**: `.claude/agents/claude-md-updater.md`

**Purpose**: Maintains CLAUDE.md as the definitive source of truth for project context, standards, and conventions.

**Invokes When**:
- New files or directories are created in the project
- Existing files are modified in ways that affect structure or conventions
- New dependencies are added or removed
- Coding patterns or best practices are established
- New tools or workflows are introduced
- Project architecture evolves
- Configuration files are updated

**How It Works**:
- Analyzes changes to project structure, dependencies, and patterns
- Reads current CLAUDE.md to understand existing documentation
- Determines which sections need updates (architecture, conventions, patterns, tools, etc.)
- Drafts specific, actionable updates with examples
- Removes outdated information that conflicts with new changes
- Maintains consistent formatting and logical organization

**Output Format**: Structured updates to CLAUDE.md sections with clear headings, code examples, and explanations of the "why" behind decisions.

### 3. quickstart-updater

**File**: `.claude/agents/quickstart-updater.md`

**Purpose**: Ensures `docs/quick-start-guide.md` reflects current installation and setup procedures.

**Invokes When**:
- Installation or setup procedures change
- New prerequisites are required
- Dependency versions are updated
- Build or development environment changes
- Packaging or package manager is switched (e.g., npm to pnpm)
- Configuration steps are modified
- After significant pull requests affecting user setup

**How It Works**:
- Reviews changes for impact on new user onboarding
- Maintains focus on essential setup only (not advanced features)
- Updates steps with specific, copy-pasteable commands
- Verifies code examples are tested and accurate
- Removes outdated information
- Preserves clear, imperative language ("Run this command", "Create this file")

**Output Format**: Updated sections in docs/quick-start-guide.md with clear step-by-step instructions, exact command syntax, and specific file paths.

### 4. docker-config-validator

**File**: `.claude/agents/docker-config-validator.md`

**Purpose**: Validates that Dockerfile and docker-compose.yml remain aligned with application requirements.

**Invokes When**:
- Code changes that affect Docker configurations
- New dependencies are added to package.json
- Service configurations or infrastructure requirements change
- Application ports or environment variables are modified
- Before committing changes to application structure
- After refactoring affecting service architecture
- When reviewing pull requests with application changes

**How It Works**:
- Analyzes code changes to identify Docker configuration impacts
- Validates Dockerfile integrity (base image, layers, security, build process)
- Validates docker-compose.yml configuration (services, ports, volumes, environment, networking)
- Identifies discrepancies and security concerns
- Provides specific configuration snippets for corrections
- Prioritizes issues by severity (critical, important, optimization)

**Output Format**: Structured validation report with detected changes, current state assessment, detailed findings, and corrected configuration files if needed.

### 5. conversation-logger

**File**: `.claude/agents/conversation-logger.md`

**Purpose**: Creates timestamped archives of significant work sessions for future reference.

**Invokes When**:
- Substantial work sessions or problem-solving conclude
- Important decisions or technical solutions are reached
- User explicitly requests session logging or archiving
- A session covers material worth preserving

**How It Works**:
- Extracts key themes, decisions, and code changes from conversation
- Generates markdown-formatted logs with precise ISO 8601 timestamps
- Structures entries with summary, key topics, decisions, code changes, action items
- Maintains organized logs in `conversation-logs/` directory
- Uses filename format: `conversation-log-YYYY-MM.md`
- Preserves technical accuracy while remaining concise

**Output Format**: Markdown files in `conversation-logs/` with structured session records including timestamps, summaries, decisions, changes, action items, and full conversation transcript.

### Agent Activation and Best Practices

**Proactive Invocation**: These agents are designed to be invoked proactively after completing work. When an assistant completes implementation, bug fixes, or significant changes, it should consider whether any of these agents should be triggered.

**Model Usage**:
- `changelog-maintainer`, `claude-md-updater`, `quickstart-updater`, `cloudbuild-updater`, `conversation-logger`: Run on Haiku model
- `docker-config-validator`: Runs on Opus model for deeper analysis

**Benefits**:
- Prevents documentation from becoming stale
- Reduces manual documentation burden
- Ensures consistency across documentation
- Maintains accurate project context for future AI assistance
- Creates searchable records of technical decisions

### 6. cloudbuild-updater

**File**: `.claude/agents/cloudbuild-updater.md`

**Purpose**: Maintains `cloudbuild.yaml` in perfect alignment with project requirements for Google Cloud Build CI/CD pipeline.

**Invokes When**:
- Project dependencies are added, updated, or removed in package.json
- Build processes, scripts, or compilation steps are modified
- Deployment configurations change (Docker, environment variables, port settings)
- New files or directories are added that affect the build pipeline
- Testing frameworks or test scripts are updated
- Static asset handling or public directory structure changes
- Application startup commands or entry points are modified
- Docker configurations (Dockerfile, docker-compose.yml) are updated
- Environment variable requirements change
- Cloud platform deployment settings are adjusted

**How It Works**:
- Analyzes project changes to identify build pipeline impacts
- Leverages `google-cloud-build-expert` skill for Cloud Build expertise
- Reviews current cloudbuild.yaml configuration
- Determines required updates for build steps, environment variables, deployment settings
- Ensures consistency with Dockerfile, docker-compose.yml, and package.json
- Validates Cloud Run deployment configurations and health checks
- Implements Cloud Build best practices (caching, timeouts, substitution variables)
- Provides verification checklist to ensure completeness

**Output Format**: Analysis summary, required updates with rationale, complete updated cloudbuild.yaml with comments, and verification checklist.

**Note**: When working with these agents, focus on accuracy and comprehensiveness. The agents should be invoked even if changes seem minor, as small structural changes can benefit from being documented.

## Custom Skills

This project includes custom Claude skills defined in `.claude/skills/` directory that provide specialized domain knowledge and functionality. Skills are model-invoked (Claude automatically decides when to use them) based on the task at hand.

### Skill Overview

| Skill | Purpose | Auto-Activates When |
|-------|---------|---------------------|
| **usaspending-api-helper** | Expert knowledge of USA Spending API integration | Modifying API requests, adding filters, debugging API responses, extending search functionality |
| **env-var-manager** | Environment variable management across all project files | Adding environment variables, updating configuration, modifying deployment settings |
| **google-cloud-build-expert** | Expert knowledge of Google Cloud Build CI/CD pipelines | Working with cloudbuild.yaml, build steps, Cloud Run deployment, troubleshooting pipelines |
| **docker-containerization-expert** | Expert knowledge of Docker containerization and optimization | Working with Dockerfile, docker-compose.yml, container builds, debugging containers, deploying to container platforms |
| **express-nodejs-expert** | Expert knowledge of Express.js and Node.js web applications | Working with server.js, adding routes, implementing middleware, debugging Express issues, optimizing API endpoints |
| **web-security-expert** | Expert knowledge of web application security and OWASP Top 10 | Implementing security features, reviewing code for vulnerabilities, adding authentication, validating input, addressing security concerns |
| **testing-best-practices** | Expert knowledge of testing Node.js/Express applications | Writing tests, setting up Jest/Supertest, debugging test failures, adding test coverage, configuring CI/CD testing |
| **frontend-api-integration** | Expert knowledge of vanilla JavaScript for frontend API integration | Working with public/script.js, adding UI features, debugging client-side API issues, implementing forms, managing client-side state |

### 1. usaspending-api-helper

**File**: `.claude/skills/usaspending-api-helper/SKILL.md`

**Purpose**: Provides comprehensive expert knowledge of the USA Spending API integration, including filter building logic, award type codes, agency tiers, API endpoints, and response field mappings.

**Auto-Activates When**:
- Modifying API request structures or proxy endpoints
- Adding new search filters to the UI
- Debugging API response issues or errors
- Extending search functionality with new fields
- Working with award type codes or agency filtering
- Updating pagination or result rendering logic
- Testing API queries or building test cases

**Key Knowledge Provided**:
- **API Endpoints**: Production base URL and proxied endpoints structure
- **Award Type Codes**: Complete mapping of contracts (A-D), grants (02-05), and IDVs (IDV_A through IDV_E)
- **Filter Building Logic**: Agency tier filtering (toptier/subtier), date ranges, award types, keywords
- **Response Fields**: Standard fields requested from API and their purpose
- **Common Tasks**: Step-by-step guidance for adding filters, modifying response fields, debugging issues
- **Implementation Patterns**: Error handling, pagination, dynamic URL generation
- **Best Practices**: Input validation, default values, error logging, edge case handling
- **File Locations**: Exact line references for key functionality in server.js and script.js

**Benefits**:
- Ensures consistent handling of USA Spending API integration patterns
- Reduces errors when modifying filter logic or API requests
- Provides quick reference for award type codes and agency filtering
- Maintains knowledge of complex buildFilters() conditional logic
- Accelerates debugging of API-related issues

**Usage**: Simply ask questions or request modifications related to the USA Spending API integration, and Claude will automatically use this skill to provide accurate, context-aware assistance.

### 2. env-var-manager

**File**: `.claude/skills/env-var-manager/SKILL.md`

**Purpose**: Ensures environment variables are properly added, documented, and configured across all project files and deployment platforms with comprehensive checklists and security guidelines.

**Auto-Activates When**:
- Adding new environment variables to the project
- Updating PORT or NODE_ENV configuration
- Modifying deployment configurations for cloud platforms
- Documenting configuration requirements
- Setting up environment-specific settings
- Implementing feature flags or API configuration
- Troubleshooting environment variable issues

**Key Knowledge Provided**:
- **Files to Update**: Complete list of files requiring updates (.env.example, server.js, docs, CLAUDE.md, Docker configs)
- **Complete Checklist**: Step-by-step verification checklist for adding environment variables
- **Security Rules**: Guidelines for handling sensitive vs non-sensitive values, secret management by platform
- **Platform-Specific Considerations**: Cloud Run auto-PORT, Elastic Beanstalk, ECS/Fargate, Heroku, Docker
- **Common Patterns**: Feature flags, API configuration, database configuration, multi-environment setup
- **Testing Procedures**: Local testing with/without .env, testing required variables, validation
- **Documentation Standards**: Formats for .env.example and ENVIRONMENT-VARIABLES.md
- **Troubleshooting**: Variable not being read, Docker issues, wrong defaults
- **Quick Reference Commands**: Environment variable commands for all platforms

**Benefits**:
- Ensures no files are missed when adding environment variables
- Maintains consistency across documentation and implementation
- Enforces security best practices for sensitive data
- Provides platform-specific guidance for cloud deployments
- Reduces errors from incomplete environment variable setup
- Standardizes documentation format across the project

**Usage**: When adding or modifying environment variables, Claude will automatically use this skill to ensure all necessary files are updated, documentation is complete, and security best practices are followed.

### 3. google-cloud-build-expert

**File**: `.claude/skills/google-cloud-build-expert/SKILL.md`

**Purpose**: Provides comprehensive expert knowledge of Google Cloud Build for CI/CD pipeline configuration, Docker image building, and automated deployment to Google Cloud services.

**Auto-Activates When**:
- Working with cloudbuild.yaml configuration files
- Troubleshooting Cloud Build pipelines or deployment issues
- Configuring build steps and builder images
- Setting up Cloud Run deployments via Cloud Build
- Implementing substitution variables or build triggers
- Configuring secrets and environment variables in builds
- Optimizing build performance with caching strategies
- Debugging build failures or timeout issues

**Key Knowledge Provided**:
- **cloudbuild.yaml Syntax**: Complete file format, structure, and configuration options
- **Build Steps**: Common builder images (docker, gcloud, npm, git), step dependencies with waitFor
- **Substitution Variables**: Built-in variables ($PROJECT_ID, $COMMIT_SHA) and custom substitutions
- **Docker Image Building**: Build patterns, multi-tagging, Artifact Registry, build arguments
- **Cloud Run Deployment**: Deployment configurations, environment variables, secrets, resource limits
- **Build Optimization**: Caching strategies, parallel builds, timeout management
- **Secrets Management**: Secret Manager integration, encrypted variables
- **Build Triggers**: GitHub triggers, conditional steps, branch/tag filtering
- **Service Accounts**: IAM roles required for builds and deployments
- **Best Practices**: Specific image tags, fail-fast strategies, appropriate timeouts, logging configuration
- **Common Patterns**: Multi-environment deployments, shell scripts, testing before deploy
- **Troubleshooting**: Common errors, debugging techniques, local testing

**Benefits**:
- Ensures correct Cloud Build syntax and configuration
- Provides comprehensive deployment patterns for Cloud Run
- Accelerates troubleshooting of build pipeline issues
- Maintains Cloud Build best practices across the project
- Referenced by cloudbuild-updater agent for expert knowledge

**Usage**: Simply work with Cloud Build configurations or ask questions about Google Cloud Build, and Claude will automatically use this skill to provide accurate, expert guidance. The cloudbuild-updater agent leverages this skill when analyzing and updating cloudbuild.yaml.

### 4. docker-containerization-expert

**File**: `.claude/skills/docker-containerization-expert/SKILL.md`

**Purpose**: Provides comprehensive expert knowledge of Docker containerization for Node.js applications, with emphasis on production-ready configurations, security best practices, and cloud platform deployment.

**Auto-Activates When**:
- Working with Dockerfile or docker-compose.yml files
- Building or optimizing Docker images
- Debugging container issues or failures
- Implementing health checks or security configurations
- Deploying to container platforms (Cloud Run, GKE, ECS)
- Troubleshooting container networking or volumes
- Optimizing image size or build performance
- Configuring container registries (GCR, Artifact Registry, Docker Hub)

**Key Knowledge Provided**:
- **Dockerfile Best Practices**: Multi-stage builds, layer caching, Alpine Linux specifics, security patterns
- **docker-compose.yml Configuration**: Service definitions, health checks, restart policies, volumes, networks, resource limits
- **Alpine Linux**: Package management (apk), common issues, native dependencies, shell compatibility
- **Security**: Non-root users, image scanning, minimal images, read-only filesystems, runtime security options
- **npm Optimization**: npm ci vs install, caching strategies, production dependencies
- **Health Checks**: HTTP/TCP/custom checks, interval tuning, readiness vs liveness probes
- **Container Registry**: GCR, Artifact Registry, Docker Hub, private registries, authentication
- **Cloud Platform Deployment**: Cloud Run PORT behavior, GKE manifests, ECS task definitions
- **Debugging**: Common issues (exits, ports, permissions, OOM), interactive debugging, build debugging
- **Performance Optimization**: Image size reduction, build speed, runtime performance, resource allocation
- **Best Practices**: Complete checklist for Dockerfile, docker-compose, security, and cloud deployment

**Benefits**:
- Ensures Docker configurations follow industry best practices
- Provides security-first containerization patterns
- Optimizes image size and build performance
- Accelerates debugging of container issues
- Maintains consistency across local development and cloud deployments
- Referenced by docker-config-validator agent for container expertise

**Usage**: Work with Docker files or ask about containerization, and Claude will automatically use this skill to provide expert guidance on Docker best practices, security, and optimization tailored to Node.js applications.

### 5. express-nodejs-expert

**File**: `.claude/skills/express-nodejs-expert/SKILL.md`

**Purpose**: Provides comprehensive expert knowledge of Express.js web framework and Node.js runtime for building robust, secure, and performant web applications and API servers.

**Auto-Activates When**:
- Working with server.js or Express application files
- Adding or modifying API routes and endpoints
- Implementing middleware or request handlers
- Debugging Express-related issues or errors
- Optimizing API performance or response times
- Configuring security headers or CORS
- Implementing error handling patterns
- Setting up proxy endpoints with axios
- Testing Express applications

**Key Knowledge Provided**:
- **Express Application Structure**: Setup, middleware ordering, production-ready configurations
- **Middleware Patterns**: Built-in middleware (json, urlencoded, static), custom middleware, async middleware, error handling
- **Routing Best Practices**: Route organization, parameter handling, RESTful patterns, router modules
- **Async/Await Error Handling**: Try-catch patterns, async wrapper utilities, express-async-errors, custom error classes
- **Request/Response Patterns**: Request properties, response methods, status codes, headers management
- **Proxy Patterns with Axios**: Basic proxying, header forwarding, retry logic, request validation
- **Security Best Practices**: Helmet configuration, CORS setup, rate limiting, input validation, parameter pollution prevention
- **Performance Optimization**: Compression, caching headers, connection pooling, response time tracking
- **Production Configuration**: Environment-based config, graceful shutdown, logging (Winston, Morgan)
- **Testing**: Jest and Supertest setup, API testing patterns, mocking external APIs
- **Common Issues**: Headers already sent, middleware ordering, CORS errors, body parser configuration, next() forgotten

**Benefits**:
- Ensures Express applications follow framework best practices
- Provides production-ready security and error handling patterns
- Accelerates debugging of common Express issues
- Optimizes API performance and reliability
- Maintains consistent code quality across routes and middleware
- Comprehensive proxy pattern knowledge for API integration

**Usage**: Work with Express code, add routes, or debug API issues, and Claude will automatically use this skill to provide expert guidance on Express.js and Node.js best practices, security patterns, and performance optimization.

### 6. web-security-expert

**File**: `.claude/skills/web-security-expert/SKILL.md`

**Purpose**: Provides comprehensive expert knowledge of web application security for Node.js/Express applications, with emphasis on preventing common vulnerabilities, implementing defense-in-depth strategies, and following security best practices.

**Auto-Activates When**:
- Implementing authentication or authorization features
- Reviewing code for security vulnerabilities
- Adding input validation or sanitization
- Implementing API security (API keys, rate limiting)
- Configuring security headers or CORS
- Managing secrets and credentials
- Addressing security concerns or incidents
- Validating user input before proxying requests
- Setting up session management
- Implementing password policies

**Key Knowledge Provided**:
- **OWASP Top 10 Vulnerabilities**: Complete coverage with prevention patterns for each vulnerability including broken access control, cryptographic failures, injection attacks, insecure design, security misconfiguration, vulnerable components, authentication failures, software integrity failures, logging failures, and SSRF
- **Input Validation and Sanitization**: express-validator, Joi schemas, XSS prevention, SQL/NoSQL injection prevention, command injection protection
- **Authentication and Authorization**: JWT implementation, session management, password hashing (bcrypt), secure token generation, password reset flows, role-based access control
- **Secrets Management**: Environment variables, cloud secret managers (Google Secret Manager, AWS Secrets Manager), key rotation, secure storage
- **Security Headers**: Complete Helmet configuration, CSP directives, HSTS, referrer policy, frame options
- **API Security**: API key management, rate limiting per key, request validation, CORS configuration
- **Cryptography**: Password hashing, data encryption/decryption, secure random generation, algorithm selection
- **Session Security**: httpOnly/secure/sameSite cookies, Redis-based sessions, session invalidation
- **Proxy Security**: URL validation, SSRF prevention, allowlist patterns, request sanitization before proxying
- **Security Testing**: Test patterns for SQL injection, XSS, authentication, authorization, rate limiting
- **Security Checklist**: Complete pre-deployment security verification checklist

**Benefits**:
- Ensures applications follow OWASP security guidelines
- Prevents common vulnerabilities (injection, XSS, broken auth, etc.)
- Provides production-ready security implementations
- Accelerates security code reviews
- Maintains defense-in-depth approach
- Critical for API proxy applications that forward user input

**Usage**: Work on security features, validate user input, or review code for vulnerabilities, and Claude will automatically use this skill to provide expert security guidance aligned with OWASP standards and industry best practices. Particularly important for this project's API proxy patterns where user input is forwarded to external APIs.

### 7. testing-best-practices

**File**: `.claude/skills/testing-best-practices/SKILL.md`

**Purpose**: Provides comprehensive expert knowledge of testing Node.js/Express applications with emphasis on Jest and Supertest, test organization, mocking strategies, and achieving comprehensive test coverage.

**Auto-Activates When**:
- Writing unit, integration, or E2E tests
- Setting up Jest or Supertest testing framework
- Debugging test failures or flaky tests
- Adding test coverage to existing code
- Mocking external APIs or databases
- Configuring CI/CD test pipelines
- Organizing test suites and fixtures
- Testing async operations or promises
- Implementing TDD (Test-Driven Development)

**Key Knowledge Provided**:
- **Jest Configuration**: Setup, jest.config.js options, test environment, coverage thresholds, test patterns
- **Supertest for API Testing**: HTTP request testing, authentication testing, status code assertions, response validation
- **Test Directory Structure**: Separate test directories, co-located tests, __tests__ conventions
- **Mocking Strategies**: Mocking axios/external APIs, database mocking, environment variable mocking, module mocking
- **Test Types**: Unit tests (isolated functions), integration tests (multiple components), E2E tests (full workflows with Puppeteer)
- **Test Organization**: Describe blocks, beforeAll/afterAll/beforeEach/afterEach hooks, test fixtures, AAA pattern
- **Async Testing**: Testing promises, async/await patterns, callback testing, handling rejections
- **Code Coverage**: Generating reports, coverage configuration, thresholds, HTML reports, LCOV for CI
- **Testing Proxy Endpoints**: Mocking axios, testing success/error cases, validating request forwarding
- **Best Practices**: Naming conventions, testing one thing, avoiding interdependence, meaningful assertions, edge cases
- **CI/CD Integration**: GitHub Actions workflows, npm scripts for CI, coverage upload to Codecov
- **Jest Matchers**: Equality, truthiness, numbers, strings, arrays, objects, functions, custom matchers
- **Testing Checklist**: Comprehensive pre-deployment test verification

**Benefits**:
- Ensures code reliability through comprehensive testing
- Provides production-ready test patterns for Express APIs
- Accelerates test writing with proven examples
- Maintains high code coverage standards
- Critical for projects currently lacking tests (AGENTS.md notes "no automated tests exist yet")
- Integrates seamlessly with CI/CD pipelines

**Usage**: Write tests, set up testing framework, or debug test issues, and Claude will automatically use this skill to provide expert guidance on Jest/Supertest best practices, mocking strategies, and test organization patterns tailored to Express applications and API proxies.

### 8. frontend-api-integration

**File**: `.claude/skills/frontend-api-integration/SKILL.md`

**Purpose**: Provides comprehensive expert knowledge of vanilla JavaScript for frontend API integration, with emphasis on modern async patterns, form handling, DOM manipulation, and user experience best practices.

**Auto-Activates When**:
- Working with public/script.js or frontend JavaScript files
- Adding UI features or components
- Debugging client-side API integration issues
- Implementing form validation and submission
- Managing pagination or infinite scroll
- Handling loading states and user feedback
- Building query parameters or filter objects
- Implementing debouncing or throttling
- Managing client-side state with localStorage/sessionStorage
- Creating dynamic URLs

**Key Knowledge Provided**:
- **Fetch API Patterns**: Modern fetch with async/await, authentication headers, timeout handling, retry logic
- **Async/Await Error Handling**: Try-catch patterns, error display, retry mechanisms, promise chaining
- **Form Handling**: Form validation, submission, real-time validation, extracting FormData, preventing double submission
- **Pagination Implementation**: Basic pagination, page number rendering, offset calculations, button state management
- **Loading States**: Spinner patterns, skeleton screens, progress indicators, UX feedback
- **DOM Manipulation**: Creating elements, template literals, table rendering, escaping HTML for XSS prevention
- **Event Listeners**: Event delegation, debouncing user input, throttling scroll events, cleanup
- **Query Parameter Building**: URLSearchParams, building filter objects from form inputs, handling arrays and empty values
- **Dynamic URL Generation**: Building parameterized URLs, fiscal year calculations, recipient links
- **Error Handling**: Toast notifications, modal dialogs, global error handlers
- **Local Storage**: Saving/loading state, session storage, persisting user preferences
- **Best Practices**: Caching DOM elements, event delegation, memory leak prevention, progressive enhancement
- **Performance Optimization**: Lazy loading images, virtual scrolling, IntersectionObserver

**Benefits**:
- Ensures modern JavaScript patterns without frameworks
- Provides production-ready vanilla JS implementations
- Optimizes user experience with proper loading states
- Prevents common pitfalls (memory leaks, XSS, race conditions)
- Directly applicable to public/script.js patterns
- Comprehensive form and pagination patterns

**Usage**: Work with frontend JavaScript, add UI features, or debug client-side issues, and Claude will automatically use this skill to provide expert guidance on vanilla JavaScript best practices, async patterns, and modern DOM manipulation techniques tailored to API-driven single-page applications.

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
