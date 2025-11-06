#!/bin/bash

# Binh Courses - Simple Database Stop
echo "🛑 Stopping PostgreSQL database..."

docker-compose stop postgres

echo "✅ Database stopped!"