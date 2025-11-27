# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install dependencies for better-sqlite3 runtime
RUN apk add --no-cache python3 make g++

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy seed data and scripts for initial setup
COPY --from=builder /app/seed ./seed
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/scripts ./scripts

# Reinstall production dependencies (needed for better-sqlite3, drizzle-kit, tsx)
RUN npm ci --omit=dev

# Make startup script executable
RUN chmod +x ./scripts/docker-start.sh

# Create data directory for SQLite
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data

# Set permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_PATH="/app/data/conduct-log.db"

# Start the application with init script
CMD ["./scripts/docker-start.sh"]
