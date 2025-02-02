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

# First copy only package.json to leverage Docker cache
COPY package.json ./

# Install all dependencies (including dev dependencies)
RUN npm install --legacy-peer-deps && \
    npm cache clean --force

# Copy the entire project
COPY . .

# Verify file structure
RUN ls -la && \
    echo "Checking app directory:" && \
    ls -la app && \
    echo "Checking components directory:" && \
    ls -la components

# Build application
RUN npm run build

# Production stage
FROM --platform=linux/amd64 node:20.11.0-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set runtime environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# Install production dependencies only
COPY package.json ./
RUN npm install --omit=dev --legacy-peer-deps && \
    npm cache clean --force

# Copy necessary files from builder
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/postcss.config.js ./
COPY --from=builder /app/tailwind.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "server.js"]
