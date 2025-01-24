# Build stage
FROM --platform=linux/amd64 node:18.19.0-alpine AS builder

# Add build dependencies and security updates
RUN apk update && \
    apk upgrade && \
    apk add --no-cache libc6-compat python3 make g++ && \
    rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Copy package files for better layer caching
COPY package*.json ./
COPY tsconfig.json ./
COPY next.config.js ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build && \
    ls -la .next/ && \
    echo "Checking standalone directory:" && \
    ls -la .next/standalone/ && \
    test -f .next/standalone/server.js && \
    npm prune --production

# Production stage
FROM --platform=linux/amd64 node:18.19.0-alpine AS runner

# Add production dependencies and security updates
RUN apk update && \
    apk upgrade && \
    apk add --no-cache curl && \
    rm -rf /var/cache/apk/*

WORKDIR /app

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/. ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1 \
    DOMAIN_NAME=veylaai.com \
    NEXT_PUBLIC_APP_URL=https://app.veylaai.com \
    DEBUG=*

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

# Switch to non-root user
USER nextjs

# Add Docker healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
