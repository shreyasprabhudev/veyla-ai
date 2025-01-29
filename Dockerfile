# -----------------------------
# 1) Base stage
# -----------------------------
FROM node:18-alpine AS base

WORKDIR /app
ENV NODE_ENV=production
    
# Combine updates & dependencies in one step
RUN apk update && \
    apk upgrade && \
    apk add --no-cache \
      libc6-compat \
      python3 \
      make \
      g++ && \
    rm -rf /var/cache/apk/*

# -----------------------------
# 2) Dependencies stage
# -----------------------------
FROM node:18-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy only package files
COPY package.json package-lock.json* ./
# Install only prod + dev dependencies here
# We do a full install so we can run build steps
RUN npm ci

# -----------------------------
# 3) Builder stage
# -----------------------------
FROM node:18-alpine AS builder
WORKDIR /app
# Copy the lockfiles and package files from the deps stage
COPY --from=deps /app/node_modules ./node_modules
# Copy the rest of the dashboard source
COPY . .

# Set production environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Build the application
# Next.js collects anonymous telemetry by default. We disable it.
RUN npm run build

# Remove dev dependencies now
RUN npm prune --production

# -----------------------------
# 4) Production stage
# -----------------------------
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Add production dependencies (npm ci --production was already done in builder)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Environment variables needed at runtime
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_APP_URL

ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

USER nextjs

EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]