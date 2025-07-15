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

# Ensure script has Unix line endings
RUN apk add --no-cache dos2unix && \
    dos2unix /usr/local/bin/docker-entrypoint.sh && \
    apk del dos2unix

# Expose port
EXPOSE 8888

# Set entrypoint
ENTRYPOINT ["/bin/sh", "/usr/local/bin/docker-entrypoint.sh"]

# Command to run
CMD ["node", "src/server.js"]