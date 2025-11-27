#!/bin/sh
set -e

DB_PATH="${DATABASE_PATH:-/app/data/conduct-log.db}"

# Check if database exists, if not, initialize it
if [ ! -f "$DB_PATH" ]; then
    echo "🗄️  Database not found. Initializing..."

    # Push schema
    echo "📋 Creating database schema..."
    npx drizzle-kit push

    # Seed data
    echo "🌱 Seeding database..."
    npx tsx seed/seed.ts

    echo "✅ Database initialized!"
fi

# Start the application
echo "🚀 Starting application..."
exec node server.js
