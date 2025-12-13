# Use official Node.js LTS (Long Term Support) image
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY server.js ./
COPY public ./public

# Expose port 3000
EXPOSE 3000

# Set environment variable for port (can be overridden)
ENV PORT=3000

# Run as non-root user for security
USER node

# Start the application
CMD ["node", "server.js"]
