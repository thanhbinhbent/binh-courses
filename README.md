# Binh Courses Platform 🎓

A comprehensive Learning Management System built with modern technologies.

## Features ✨

### For Students
- 📚 Course enrollment and progress tracking
- 🧠 Interactive quizzes with instant feedback  
- 📊 Progress analytics and certificates
- 🎯 User-friendly dashboard

### For Instructors  
- 📝 Course creation and management
- ❓ Quiz builder with multiple question types
- 👥 Student progress monitoring
- 📁 Content management tools

### For Administrators
- 👤 User management system
- 📈 Platform analytics
- ✅ Course approval workflow
- ⚙️ System configuration

## Tech Stack 🛠️

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **UI Components**: Shadcn/ui, Radix UI
- **Charts**: Recharts
- **Icons**: Lucide React

## Quick Start 🚀

### Prerequisites
- Node.js 18+
- Docker (for database)

### 1. Clone and Install
```bash
git clone <repository-url>
cd modern-lms
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env.local
# Edit .env.local with your database URL:
# DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/modern_lms"
```

### 3. Quick Setup (Recommended)
```bash
# This will: install deps, start DB, run migrations, seed data
npm run setup
```

### 4. Start Development
```bash
npm run dev
```

🌐 **Open**: [http://localhost:3000](http://localhost:3000)

## Manual Setup (Alternative) ⚙️

If you prefer step-by-step setup:

```bash
# 1. Start database
npm run db:start

# 2. Setup database schema
npx prisma generate
npx prisma db push

# 3. Seed initial data (optional)
npx prisma db seed

# 4. Start development
npm run dev
```

## Database Management 🗄️

```bash
npm run db:start      # Start PostgreSQL database
npm run db:stop       # Stop database
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema changes
npm run db:migrate    # Run migrations
npm run db:seed       # Seed database
npm run db:studio     # Open Prisma Studio
```

## Production Deployment 🚀

For production, use external database (AWS RDS, Google Cloud SQL, etc.):

```bash
# 1. Set production DATABASE_URL in .env
DATABASE_URL="postgresql://user:pass@your-prod-db:5432/dbname"

# 2. Build application
npm run build

# 3. Start production server
npm start
```

## Project Structure 📁

```
modern-lms/
├── app/                    # Next.js App Router
│   ├── (dashboard)/       # Dashboard layouts
│   ├── api/              # API routes
│   ├── auth/             # Authentication pages
│   └── globals.css       # Global styles
├── components/           # Reusable components
│   ├── ui/              # UI components (shadcn/ui)
│   ├── forms/           # Form components
│   └── charts/          # Chart components
├── lib/                 # Utilities
│   ├── services/        # API service layer
│   ├── utils.ts         # Helper functions
│   └── validations.ts   # Schema validations
├── prisma/              # Database schema
│   ├── schema.prisma    # Prisma schema
│   └── migrations/      # Database migrations
└── scripts/             # Utility scripts
    ├── db-start.sh      # Start database
    ├── db-stop.sh       # Stop database
    └── setup.sh         # Quick setup
```

## Environment Variables 🔐

Create `.env.local` file:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/modern_lms"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Optional: Redis for caching
REDIS_URL="redis://localhost:6379"
```

## Development Commands 💻

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint

# Database
npm run setup           # Complete setup (recommended)
npm run db:start        # Start PostgreSQL
npm run db:stop         # Stop PostgreSQL
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema to database
npm run db:migrate      # Run migrations
npm run db:seed         # Seed initial data
npm run db:studio       # Open Prisma Studio
```

## Docker Setup 🐳

Simple Docker setup for database only:

```bash
# Start database container
docker-compose up -d

# Stop database container  
docker-compose down
```

The `docker-compose.yml` only includes PostgreSQL - the app runs with `npm run dev` for faster development.

## Contributing 🤝

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Happy Learning! 🚀📚**