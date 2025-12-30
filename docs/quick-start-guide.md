# Quick Start Guide - USA Spending Award Search

This guide covers the essential steps to install, configure, run, and maintain the USA Spending Award Search application.

## Prerequisites

Before you begin, ensure you have the following installed:

### Option 1: Native Installation
- **Node.js** (version 14.x or higher recommended)
- **npm** (comes with Node.js)
- A modern web browser (Chrome, Firefox, Safari, or Edge)

### Option 2: Docker Installation
- **Docker** (version 20.x or higher recommended)
- **Docker Compose** (optional, for easier container management)
- A modern web browser (Chrome, Firefox, Safari, or Edge)

## Installation

### 1. Navigate to Project Directory

```bash
cd /path/to/hosting/google/node
```

### 2. Install Dependencies

```bash
npm install
```

This installs the required packages:
- `express` - Web server framework
- `axios` - HTTP client for API requests

## Running the Application

### Start the Server

```bash
npm start
```

Or alternatively:

```bash
node server.js
```

You should see:
```
Server running at http://localhost:3000
```

### Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

### Stop the Server

Press `Ctrl + C` in the terminal where the server is running.

## Running with Docker

Docker provides an isolated, reproducible environment for running the application.

### Building the Docker Image

```bash
docker build -t usa-spending-app .
```

### Running with Docker (Manual)

```bash
docker run -d -p 3000:3000 --name awardSearch-googleCloud usa-spending-app
```

Flags explained:
- `-d` - Run container in detached mode (background)
- `-p 3000:3000` - Map port 3000 on host to port 3000 in container
- `--name awardSearch-googleCloud` - Assign a name to the container
- `usa-spending-app` - The image name

### Running with Docker Compose (Recommended)

Docker Compose simplifies container management:

```bash
# Start the application
docker compose up -d

# View logs
docker compose logs -f

# Stop the application
docker compose down
```

### Access the Dockerized Application

Open your browser and navigate to:
```
http://localhost:3000
```

### Managing Docker Containers

```bash
# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# Stop the container
docker stop awardSearch-googleCloud

# Start the container
docker start awardSearch-googleCloud

# Remove the container
docker rm awardSearch-googleCloud

# View logs
docker logs awardSearch-googleCloud

# Follow logs in real-time
docker logs -f awardSearch-googleCloud
```

### Rebuilding After Code Changes

If you modify the application code:

```bash
# Stop and remove the old container
docker compose down

# Rebuild the image
docker compose build

# Start with the new image
docker compose up -d
```

Or with manual Docker commands:

```bash
docker stop awardSearch-googleCloud
docker rm awardSearch-googleCloud
docker build -t usa-spending-app .
docker run -d -p 3000:3000 --name awardSearch-googleCloud usa-spending-app
```

## Configuration

### Port Configuration

**Native Installation:**

The application runs on **port 3000** by default. To change the port:

1. Open `server.js`
2. Modify line 5:
   ```javascript
   const port = 3000; // Change to your desired port
   ```
3. Restart the server

**Docker Installation:**

To change the port mapping:

```bash
# Using docker run (change host port, e.g., 8080:3000)
docker run -d -p 8080:3000 --name awardSearch-googleCloud usa-spending-app

# Using docker compose (edit docker-compose.yml)
# Change the ports section to:
#   ports:
#     - "8080:3000"
```

### API Endpoint

The application proxies requests to `https://api.usaspending.gov`. This is configured in `server.js`:

- Search endpoint: `/api/v2/search/spending_by_award/`
- Count endpoint: `/api/v2/search/spending_by_award_count/`

If the USA Spending API changes, update these URLs in the proxy endpoints.

## Project Structure

```
node/
├── server.js           # Express server with API proxy endpoints
├── package.json        # Project dependencies and scripts
├── Dockerfile          # Docker image configuration
├── docker-compose.yml  # Docker Compose orchestration
├── .dockerignore       # Files to exclude from Docker image
├── public/             # Static files served to browser
│   ├── index.html      # Main UI with search form
│   ├── script.js       # Client-side logic and API calls
│   └── style.css       # Styling
└── docs/               # Documentation
    └── quick-start-guide.md
```

## Administration Tasks

### Viewing Server Logs

All server activity is logged to the console. To view:

- **Successful requests**: Status codes and response data
- **Errors**: Error messages with full API response details

Logs include:
- Proxy request errors
- API response status codes
- Detailed error messages from USA Spending API

### Monitoring

Monitor the server console for:

- `Error proxying search request:` - Issues with search API calls
- `Error proxying count request:` - Issues with count API calls
- HTTP status codes (200 = success, 4xx = client errors, 5xx = server errors)

### Updating Dependencies

Check for outdated packages:

```bash
npm outdated
```

Update all dependencies:

```bash
npm update
```

Update specific package:

```bash
npm update express
npm update axios
```

### Backup

Important files to back up:
- `server.js` - Server configuration
- `public/` directory - All client-side code
- `package.json` - Dependency configuration

## Deployment Considerations

### Production Deployment

For production environments:

1. **Use a process manager** like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "usa-spending-app"
   pm2 save
   pm2 startup
   ```

2. **Set up reverse proxy** (NGINX or Apache) to handle:
   - SSL/TLS certificates
   - Load balancing
   - Static file caching

3. **Environment variables** - Consider using `.env` file for configuration:
   ```bash
   PORT=3000
   API_BASE_URL=https://api.usaspending.gov
   ```

4. **Enable logging** to files instead of console only

### Security Considerations

- The server proxies all requests to USA Spending API (CORS bypass)
- No authentication is currently implemented
- Consider adding rate limiting for production use
- Keep dependencies updated for security patches

## Troubleshooting

### Server Won't Start

**Problem**: `Error: listen EADDRINUSE`

**Solution**: Port 3000 is already in use. Either:
- Stop the other process using port 3000
- Change the port in `server.js`

### Can't Connect to API

**Problem**: `Error proxying search request`

**Solutions**:
- Check internet connection
- Verify USA Spending API is operational: https://api.usaspending.gov
- Check console logs for specific error details

### No Results Returned

**Problem**: Search returns no results

**Solutions**:
- Verify search filters (keyword must be at least 3 characters)
- Check that award type is selected (required field)
- Try broader search criteria
- Check console logs for API error messages

### Dependencies Won't Install

**Problem**: `npm install` fails

**Solutions**:
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`, then run `npm install` again
- Ensure you have the latest version of npm: `npm install -g npm@latest`

### Docker Container Won't Start

**Problem**: `docker: Error response from daemon: Conflict. The container name "/awardSearch-googleCloud" is already in use`

**Solution**:
```bash
# Remove the existing container
docker rm awardSearch-googleCloud

# Or remove and restart
docker rm -f awardSearch-googleCloud
docker compose up -d
```

### Docker Build Fails

**Problem**: Docker build fails or takes too long

**Solutions**:
- Ensure Docker is running: `docker version`
- Clear Docker cache: `docker builder prune`
- Check `.dockerignore` to ensure `node_modules` is excluded
- Rebuild without cache: `docker build --no-cache -t usa-spending-app .`

### Can't Access Application in Docker

**Problem**: Application running in Docker but not accessible at `localhost:3000`

**Solutions**:
- Check container is running: `docker ps`
- Verify port mapping is correct: `docker port awardSearch-googleCloud`
- Check container logs: `docker logs awardSearch-googleCloud`
- Ensure no firewall is blocking port 3000
- Try accessing via container IP: `docker inspect awardSearch-googleCloud | grep IPAddress`

## Maintenance

### Regular Tasks

- **Weekly**: Check server logs for errors or unusual activity
- **Monthly**: Update dependencies (`npm update`)
- **Quarterly**: Review and update Node.js version if needed

### Logs and Monitoring

The application logs to console. For production, consider:
- Implementing file-based logging (using `winston` or `morgan`)
- Setting up monitoring tools (New Relic, Datadog, etc.)
- Creating alerts for error conditions

## Support Resources

- **USA Spending API Documentation**: https://api.usaspending.gov
- **Express.js Documentation**: https://expressjs.com
- **Node.js Documentation**: https://nodejs.org/docs

## Getting Help

If you encounter issues:

1. Check the console logs for detailed error messages
2. Review the troubleshooting section above
3. Check the USA Spending API status
4. Verify all dependencies are correctly installed
