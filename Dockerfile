# Full Track POS - Docker Image
# Build: docker build -t brasa-pos-web .
# Run: docker run -p 3000:3000 -v brasa-pos-data:/app/data brasa-pos-web

FROM node:18-alpine

WORKDIR /app

# Copy server files
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install --production

# Copy public (frontend) files
WORKDIR /app
COPY public ./public

# Copy server code
COPY server/server.js ./server/

# Create data directory with correct permissions
RUN mkdir -p /app/data && chmod 755 /app/data

# Expose port
EXPOSE 3000

# Set working directory back to server
WORKDIR /app/server

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start server
CMD ["npm", "start"]
