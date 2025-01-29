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
    FROM base AS deps
    
    # Copy only package files
    COPY package.json package-lock.json* ./
    
    # Install only prod + dev dependencies here
    # We do a full install so we can run build steps
    RUN npm ci
    
    # -----------------------------
    # 3) Builder stage
    # -----------------------------
    FROM base AS builder
    
    # Copy the lockfiles and package files from the deps stage
    COPY --from=deps /app/node_modules ./node_modules
    
    # Copy the rest of the dashboard source
    COPY . .
    
    # Build the application
    # Next.js collects anonymous telemetry by default. We disable it.
    ENV NEXT_TELEMETRY_DISABLED=1
    
    RUN npm run build
    
    # Remove dev dependencies now
    RUN npm prune --production
    
    # -----------------------------
    # 4) Production stage
    # -----------------------------
    FROM node:18-alpine AS runner
    
    WORKDIR /app
    
    # Add production dependencies (npm ci --production was already done in builder)
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app/public ./public
    COPY --from=builder /app/.next/standalone ./
    COPY --from=builder /app/.next/static ./.next/static
    
    # Environment variables needed at runtime
    ARG NEXT_PUBLIC_SUPABASE_URL
    ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
    ARG NEXT_PUBLIC_APP_URL
    
    ENV NODE_ENV=production
    ENV PORT=3000
    ENV HOSTNAME=0.0.0.0
    ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
    ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
    ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
    ENV NEXT_TELEMETRY_DISABLED=1
    
    # (Optional) Non-root user for security
    RUN addgroup --system --gid 1001 nodejs && \
        adduser --system --uid 1001 nextjs
    
    USER nextjs
    
    EXPOSE 3000
    
    # Healthcheck
    HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
      CMD wget -qO- http://localhost:3000/api/health || exit 1
    
    CMD ["node", "server.js"]    