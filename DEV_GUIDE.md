# Development Guide 🚀

## Quick Start (3 steps)

```bash
# 1. Setup everything (one command)
npm run setup

# 2. Start development
npm run dev

# 3. Open browser
open http://localhost:3000
```

## Manual Setup (if needed)

```bash
# Install dependencies
npm install

# Copy environment file
cp env.local.example .env.local

# Start database
npm run db:start

# Setup database
npx prisma generate
npx prisma db push

# Start development
npm run dev
```

## Daily Commands

```bash
npm run dev         # Start development server
npm run db:start    # Start database
npm run db:stop     # Stop database
npm run db:studio   # Open database admin
```

## File Structure

```
modern-lms/
├── app/            # Next.js pages & API
├── components/     # React components  
├── lib/services/   # API service layer
├── prisma/         # Database schema
├── scripts/        # Helper scripts
└── docker-compose.yml  # Database only
```

## Production

Use external database (AWS RDS, PlanetScale, etc.) and set `DATABASE_URL` in production environment.

No Docker needed for production app - just `npm run build` and `npm start`.