#!/bin/bash

# Binh Courses - Simple Database Start
echo "🚀 Starting PostgreSQL database..."

# Start database
docker-compose up -d postgres

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
for i in {1..30}; do
    if docker-compose exec postgres pg_isready -U postgres -d modern_lms >/dev/null 2>&1; then
        echo "✅ Database is ready!"
        echo "📝 Run migrations: npm run db:migrate"
        echo "🚀 Start development: npm run dev"
        exit 0
    fi
    echo "  Attempt $i/30..."
    sleep 2
done

echo "❌ Database failed to start after 60 seconds"
exit 1