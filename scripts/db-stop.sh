#!/bin/bash

# Modern LMS - Simple Database Stop
echo "🛑 Stopping PostgreSQL database..."

docker-compose stop postgres

echo "✅ Database stopped!"