#!/bin/bash

# Binh Courses - Quick Setup
echo "🚀 Binh Courses - Quick Setup"
echo "=========================="

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Start database
echo "🗄️ Starting database..."
./scripts/db-start.sh

# Setup database
echo "🔧 Setting up database..."
npx prisma generate
npx prisma db push

# Seed data (optional)
if [ -f "prisma/seed.js" ] || [ -f "prisma/seed.ts" ]; then
    echo "🌱 Seeding database..."
    npx prisma db seed
fi

echo ""
echo "✅ Setup complete!"
echo "🚀 To start development, please run: npm run dev"