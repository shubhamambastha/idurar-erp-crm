# Simple Dockerfile based on actual project setup
FROM node:20-alpine

WORKDIR /app

# Install basic dependencies
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for now)
RUN npm install

# Copy application code
COPY . .

# Copy and make entrypoint executable
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose port
EXPOSE 8888

# Set entrypoint
ENTRYPOINT ["docker-entrypoint.sh"]

# Command to run
CMD ["node", "src/server.js"]