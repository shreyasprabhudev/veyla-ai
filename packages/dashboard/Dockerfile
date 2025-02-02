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
ARG PORT=3001

# Set environment variables for build time
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
    NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    PORT=$PORT \
    HOSTNAME=0.0.0.0

# First copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code and config files
COPY . .

# Verify Next.js config
RUN cat next.config.js && \
    echo "\nChecking tsconfig.json:" && \
    cat tsconfig.json

# Verify critical paths exist
RUN echo "Verifying paths:" && \
    ls -la components/ui && \
    ls -la app/features/chat/components && \
    ls -la app/features/chat

# Build application
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Clean install production dependencies
RUN rm -rf node_modules && \
    npm install --omit=dev

# Production stage
FROM --platform=linux/amd64 node:20.11.0-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set runtime environment variables
ENV NODE_ENV=production \
    PORT=3001 \
    HOSTNAME=0.0.0.0

# Copy production files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/server.js ./server.js

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "server.js"]
