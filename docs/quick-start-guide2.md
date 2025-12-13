# Quick Start Guide

Get up and running with this Express.js application in just a few minutes.

## Prerequisites

Before you begin, make sure you have the following installed on your system:

- **Node.js** (version 14 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **npm** (comes bundled with Node.js)

Verify your installation by running:

```bash
node --version
npm --version
git --version
```

## Installation

### Step 1: Clone the Repository

Clone the project from GitHub:

```bash
git clone https://github.com/WebDev70/hosting-google.git
cd hosting-google/node
```

### Step 2: Install Dependencies

Install all required npm packages:

```bash
npm install
```

This will install the following dependencies:
- **express** - Web framework for building the API
- **axios** - HTTP client for proxying requests

## Running the Application

Start the server with:

```bash
npm start
```

You should see the following output:

```
Server running at http://localhost:3000
```

The application is now running and ready to handle requests.

## First Steps

1. **Access the application**: Open your web browser and navigate to [http://localhost:3000](http://localhost:3000)

2. **View static files**: The application serves static files from the `public` directory. You should see the frontend interface.

3. **Test the API**: The application exposes two endpoints for proxying requests to the USA Spending API:
   - `POST /api/search` - Search for spending data by award
   - `POST /api/count` - Get count of spending records

## Project Structure

```
node/
├── server.js           # Main Express application
├── package.json        # Project dependencies and scripts
├── public/             # Static files served by the application
├── node_modules/       # Installed dependencies
└── quick-start-guide.md # This file
```

## Stopping the Server

To stop the server, press `Ctrl+C` in your terminal.

## Common Issues

**Port 3000 already in use**: If port 3000 is already in use on your system, modify the `port` variable in `server.js` to a different port number (e.g., 3001, 3002).

**Module not found errors**: Make sure you've run `npm install` in the project directory.

**Connection errors to USA Spending API**: The application requires internet connectivity to reach the USA Spending API at `api.usaspending.gov`. Check your network connection if you see proxy errors.

## Next Steps

- Explore the `public` directory to see the frontend code
- Review `server.js` to understand how the API endpoints are structured
- Check out the [GitHub repository](https://github.com/WebDev70/hosting-google.git) for more information and updates

## Getting Help & Support

### GitHub Resources

- **Repository**: [https://github.com/WebDev70/hosting-google.git](https://github.com/WebDev70/hosting-google.git)
- **Issues**: Report bugs or request features on the [GitHub Issues page](https://github.com/WebDev70/hosting-google/issues)
- **Contributions**: We welcome contributions! See the repository for contribution guidelines

### Developer Documentation

For more detailed information about the project structure and features, refer to the documentation in the `docs` directory.

## Summary

You now have the application running locally and ready for development. Happy coding!
