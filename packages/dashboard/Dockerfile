# Build stage
FROM --platform=linux/amd64 node:20.11.0-alpine AS builder

# Add build dependencies and security updates
RUN apk update && \
    apk upgrade && \
    apk add --no-cache libc6-compat python3 make g++ && \
    rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Define build arguments for environment variables
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_APP_URL
ARG PORT=3000

# Set environment variables for build time
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
    NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    PORT=$PORT \
    NODE_ENV=production \
    HOSTNAME=0.0.0.0

# Copy package files
COPY package*.json ./

# Copy configuration files
COPY tsconfig*.json ./
COPY next.config.js ./
COPY postcss.config.js ./
COPY tailwind.config.js ./

# Clean install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application with explicit NODE_ENV
RUN NODE_ENV=production npm run build

# Production stage
FROM --platform=linux/amd64 node:20.11.0-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/postcss.config.js ./
COPY --from=builder /app/tailwind.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set runtime environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "server.js"]
