# Modern LMS Platform

A modern, scalable Learning Management System built with Next.js 15, TypeScript, Tailwind CSS, and PostgreSQL.

## Features

### 🎓 Core LMS Features
- **Course Management**: Create, edit, and organize courses with chapters
- **Video Streaming**: Integrated video hosting with progress tracking
- **Quizzes & Assessments**: Multiple question types (multiple choice, true/false, short answer, essay)
- **Progress Tracking**: Track student progress through courses
- **Certificates**: Generate certificates upon course completion
- **Reviews & Ratings**: Course review system
- **Comments & Discussions**: Chapter-level discussions

### 💰 E-commerce Features
- **Course Sales**: Sell courses with Stripe integration
- **Enrollment System**: Automatic enrollment after purchase
- **Pricing Management**: Flexible pricing options

### 👥 User Management
- **Role-based Access Control**: Admin, Instructor, and Student roles
- **Authentication**: Secure authentication with Clerk
- **User Profiles**: Customizable user profiles

### 📚 Content Management
- **Rich Text Editor**: Create engaging course content
- **File Attachments**: Upload course materials (PDFs, documents, etc.)
- **Resource Library**: Organize learning resources per chapter
- **Categories**: Organize courses by categories (AWS, Azure, ISTQB, etc.)

### 📊 Analytics & Reporting
- **Dashboard**: Comprehensive analytics for instructors
- **Progress Reports**: Track student performance
- **Revenue Analytics**: Monitor course sales

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Clerk
- **Payments**: Stripe
- **State Management**: Zustand
- **File Upload**: UploadThing
- **Video Streaming**: Mux

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Clerk account (for authentication)
- Stripe account (for payments)
- UploadThing account (for file uploads)
- Mux account (for video streaming)

### Installation

1. Clone the repository

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Fill in the required environment variables in `.env`

4. Set up the database:
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

```
modern-lms/
├── app/                      # Next.js app directory
│   ├── (auth)/              # Authentication routes
│   ├── (dashboard)/         # Dashboard routes
│   ├── (course)/            # Course routes
│   └── api/                 # API routes
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   └── ...                  # Custom components
├── lib/                     # Utility functions
├── prisma/                  # Database schema and migrations
├── actions/                 # Server actions
├── hooks/                   # Custom React hooks
├── stores/                  # Zustand stores
├── types/                   # TypeScript types
└── public/                  # Static assets
```

## License

MIT License - feel free to use this project for your own purposes.

