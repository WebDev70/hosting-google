# GEMINI.md

## Project Overview

This project is a web application with a Node.js backend that allows users to search for award data from the USA Spending API. The frontend is built with vanilla HTML, CSS, and JavaScript, and it communicates with a backend server that acts as a proxy to the USA Spending API. This setup helps in managing API requests and keeping any sensitive information (like API keys, though none are used currently) on the server side.

The application provides a user interface with various filters to refine the search and displays the results in a paginated table.

## Building and Running

To run this application, you need to have Node.js and npm installed.

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Start the server:**
    ```bash
    node server.js
    ```

3.  Open your web browser and navigate to `http://localhost:3000`.

## Development Conventions

The project follows a client-server structure:

*   **`server.js`**: This file contains the Node.js Express server. It has two main endpoints (`/api/search` and `/api/count`) that proxy requests to the USA Spending API. This is done to avoid potential CORS issues and to have a backend layer for future enhancements.

*   **`public/`**: This directory contains all the frontend files.
    *   **`index.html`**: Defines the structure and layout of the user interface, including the search form with various filters.
    *   **`style.css`**: Contains all the styles for the application.
    *   **`script.js`**: Handles all the client-side logic, including:
        *   Event handling for the search form and pagination buttons.
        *   Building the API request payload based on user input from a comprehensive set of filters (including keywords, award types, agencies, dates, and more).
        *   Fetching data from the backend proxy endpoints (`/api/search` and `/api/count`).
        *   Rendering the search results dynamically in the HTML table.
        *   Handling pagination and displaying the total number of records.
        *   Displaying error messages and a loading indicator.