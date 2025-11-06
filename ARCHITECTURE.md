# Modern LMS - Project Architecture & Implementation Guide

## 🎯 Project Overview

A full-featured Learning Management System (LMS) combining the best of Moodle and Udemy, built with modern technologies for scalability and security.

## 📊 Database Architecture

### Core Models

#### User Management
- **User**: Central user model with role-based access (ADMIN, INSTRUCTOR, STUDENT)
- Integrated with Clerk for authentication
- Supports profiles, bios, and avatars

#### Course Structure
- **Course**: Main course entity with metadata
  - Links to Category, Instructor, Chapters
  - Pricing, levels (BEGINNER to EXPERT)
  - Publication status
  
- **Chapter**: Course content units
  - Ordered by position
  - Video content, descriptions
  - Can be marked as free preview
  - Duration tracking

- **Category**: Course organization
  - Pre-populated: AWS, Azure, ISTQB, DevOps, etc.
  
#### Learning Features
- **Progress**: Track chapter completion per user
- **Enrollment**: Student-course relationships
- **Purchase**: Payment records for paid courses

#### Assessment System
- **Quiz**: Chapter-level assessments
  - Passing scores, time limits
  - Multiple question types
  
- **Question**: Quiz questions
  - Types: MULTIPLE_CHOICE, TRUE_FALSE, SHORT_ANSWER, ESSAY
  - Points-based scoring
  
- **QuestionOption**: Answer choices for multiple choice
- **QuizAttempt**: Student quiz submissions
- **Answer**: Individual question responses

#### Social Features
- **Review**: Course ratings and comments
- **Comment**: Chapter discussions (with nested replies)

#### Certificates
- **Certificate**: Auto-generated upon course completion
  - Unique certificate ID
  - Downloadable/sharable

#### Content Management
- **Attachment**: Course-level files
- **Resource**: Chapter-level materials (PDFs, videos, links, documents)

## 🏗️ Application Structure

```
modern-lms/
├── app/
│   ├── (auth)/                      # Authentication group
│   │   ├── sign-in/[[...sign-in]]/ # Clerk sign-in
│   │   └── sign-up/[[...sign-up]]/ # Clerk sign-up
│   │
│   ├── (dashboard)/                 # Protected dashboard routes
│   │   ├── dashboard/              # Main dashboard
│   │   ├── instructor/             # Instructor panel
│   │   │   ├── courses/           # Manage courses
│   │   │   ├── analytics/         # Revenue & stats
│   │   │   └── settings/          # Instructor settings
│   │   └── student/                # Student panel
│   │       ├── courses/           # Enrolled courses
│   │       ├── progress/          # Learning progress
│   │       └── certificates/      # Earned certificates
│   │
│   ├── (course)/                    # Public course routes
│   │   ├── courses/                # Browse all courses
│   │   │   ├── [courseId]/        # Course detail
│   │   │   └── [courseId]/chapter/[chapterId]/ # Watch chapter
│   │   └── search/                 # Course search
│   │
│   ├── api/                         # API routes
│   │   ├── webhook/
│   │   │   ├── clerk/             # User sync webhook
│   │   │   └── stripe/            # Payment webhook
│   │   ├── courses/                # Course CRUD
│   │   ├── uploadthing/            # File uploads
│   │   └── stripe/                 # Payment processing
│   │
│   ├── layout.tsx                   # Root layout (ClerkProvider)
│   └── page.tsx                     # Landing page
│
├── components/
│   ├── ui/                          # shadcn components
│   ├── courses/                     # Course-related components
│   │   ├── course-card.tsx
│   │   ├── course-list.tsx
│   │   ├── chapter-player.tsx
│   │   └── quiz-player.tsx
│   ├── dashboard/                   # Dashboard components
│   │   ├── sidebar.tsx
│   │   ├── navbar.tsx
│   │   └── stats-cards.tsx
│   └── providers/                   # Context providers
│
├── actions/                         # Server actions
│   ├── course-actions.ts           # Course CRUD operations
│   ├── chapter-actions.ts          # Chapter operations
│   ├── enrollment-actions.ts       # Enrollment logic
│   ├── progress-actions.ts         # Progress tracking
│   └── quiz-actions.ts             # Quiz operations
│
├── lib/
│   ├── db.ts                       # Prisma client
│   ├── utils.ts                    # Utility functions
│   ├── stripe.ts                   # Stripe client
│   └── uploadthing.ts              # File upload config
│
├── hooks/                           # Custom React hooks
│   ├── use-debounce.ts
│   ├── use-user.ts
│   └── use-confetti.ts (for celebrations)
│
├── stores/                          # Zustand stores
│   ├── use-user-store.ts
│   └── use-cart-store.ts
│
├── types/                           # TypeScript types
│   └── index.ts
│
└── prisma/
    ├── schema.prisma               # Database schema
    └── migrations/                 # Migration files
```

## 🔐 Security Implementation

### Authentication Flow
1. **Clerk Integration**
   - Sign up/Sign in handled by Clerk
   - Session management automatic
   - JWT tokens for API authentication

2. **Middleware Protection**
   ```typescript
   // middleware.ts
   - Public routes: /, /courses, /search
   - Protected: Everything else
   - Role-based access in API routes
   ```

3. **User Sync**
   - Webhook from Clerk → Database sync
   - Creates/updates/deletes users automatically

### Authorization Patterns
```typescript
// Example: Instructor-only action
const user = await getCurrentUser();
if (user.role !== 'INSTRUCTOR') {
  throw new Error('Unauthorized');
}
```

### Data Security
- Prisma prevents SQL injection
- Input validation with Zod
- Server actions for data mutations
- Protected API routes

## 💳 Payment Integration

### Stripe Flow
1. **Course Purchase**
   ```
   Student → Add to Cart → Checkout
   → Stripe Hosted Checkout
   → Payment Success
   → Webhook → Create Purchase + Enrollment
   ```

2. **Webhook Handler**
   - Verifies payment
   - Creates Purchase record
   - Auto-enrolls student
   - Sends confirmation email (future)

### Revenue Tracking
- Purchase records with amounts
- Instructor dashboard analytics
- Admin revenue reports

## 📹 Video Streaming (Mux Integration)

### Video Upload Flow
1. Instructor uploads video via UploadThing
2. Video URL saved to Chapter
3. Alternative: Mux for advanced features
   - Adaptive streaming
   - Analytics
   - DRM protection

### Progress Tracking
```typescript
// Video player marks chapter complete at 90%
onProgress={(percent) => {
  if (percent > 90) markComplete();
}}
```

## 📝 Quiz System Architecture

### Question Types
1. **Multiple Choice**
   - Multiple options, one correct
   - Auto-graded

2. **True/False**
   - Binary choice
   - Auto-graded

3. **Short Answer**
   - Text input
   - Manual or keyword grading

4. **Essay**
   - Long-form text
   - Manual grading

### Quiz Attempt Flow
```
Student starts quiz
→ Create QuizAttempt (startedAt)
→ Answer each question
→ Submit quiz
→ Calculate score
→ Update QuizAttempt (score, isPassed, completedAt)
→ Show results
```

### Grading Logic
- Auto-grade: Multiple choice, True/false
- Manual grade: Short answer, Essay
- Passing score threshold (default 70%)

## 🎓 Certificate Generation

### Trigger
- Course completion = All chapters completed
- All quizzes passed

### Implementation
```typescript
// After final quiz pass or chapter complete
if (isFullyComplete) {
  await generateCertificate({
    userId,
    courseName,
    instructorName,
    completionDate: new Date()
  });
}
```

### Certificate Features
- Unique certificate ID
- PDF generation (using react-pdf)
- Shareable link
- Verification page

## 📊 Analytics & Dashboards

### Student Dashboard
- Enrolled courses
- Progress percentage per course
- Upcoming deadlines
- Certificates earned

### Instructor Dashboard
- Total students
- Total revenue
- Course analytics
  - Enrollment count
  - Completion rate
  - Average rating
  - Popular chapters

### Admin Dashboard
- Platform-wide stats
- User management
- Course moderation
- Revenue reports

## 🔄 State Management

### Zustand Stores
```typescript
// use-user-store.ts
- Current user data
- Role
- Preferences

// use-cart-store.ts (future)
- Cart items
- Total price
```

### Server State
- React Query / SWR (future)
- Optimistic updates
- Cache invalidation

## 🚀 API Routes

### Course Management
```
GET    /api/courses              # List courses
POST   /api/courses              # Create course (instructor)
GET    /api/courses/[id]         # Get course details
PATCH  /api/courses/[id]         # Update course
DELETE /api/courses/[id]         # Delete course
POST   /api/courses/[id]/publish # Publish course
```

### Chapter Management
```
POST   /api/courses/[id]/chapters           # Create chapter
PATCH  /api/courses/[id]/chapters/[chapterId] # Update
DELETE /api/courses/[id]/chapters/[chapterId] # Delete
POST   /api/courses/[id]/chapters/reorder   # Reorder
```

### Enrollment & Progress
```
POST   /api/courses/[id]/enroll        # Enroll (free course)
POST   /api/courses/[id]/checkout      # Purchase (paid course)
POST   /api/chapters/[id]/progress     # Mark complete
GET    /api/courses/[id]/progress      # Get progress
```

### Quizzes
```
GET    /api/chapters/[id]/quiz          # Get quiz
POST   /api/chapters/[id]/quiz/attempt # Start attempt
POST   /api/quizzes/[id]/submit        # Submit answers
GET    /api/quizzes/attempts/[id]      # Get results
```

## 📱 Responsive Design

### Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Mobile-First Approach
```typescript
// Tailwind classes
className="
  flex-col        // Mobile
  md:flex-row     // Tablet+
  lg:grid-cols-3  // Desktop
"
```

## 🧪 Testing Strategy (Future)

### Unit Tests
- Utility functions
- Server actions
- Component logic

### Integration Tests
- API routes
- Database operations
- Auth flows

### E2E Tests (Playwright)
- User journeys
- Purchase flow
- Course completion

## 🚀 Deployment

### Environment Variables Required
```env
# Database
DATABASE_URL=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# Stripe
STRIPE_API_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# UploadThing
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=

# Mux (optional)
MUX_TOKEN_ID=
MUX_TOKEN_SECRET=

# App
NEXT_PUBLIC_APP_URL=
```

### Deployment Steps (Vercel)
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy
5. Set up Clerk webhooks
6. Set up Stripe webhooks

### Database Migration
```bash
# Production
npx prisma migrate deploy

# Or use Prisma Cloud
```

## 🎨 Design System

### Colors
- Primary: Blue (courses, CTAs)
- Success: Green (completed, passed)
- Warning: Yellow (in progress)
- Error: Red (failed)
- Neutral: Gray (text, borders)

### Typography
- Headings: Font weight 600-700
- Body: Font weight 400
- Small text: Font weight 400, text-sm

### Components
- All from shadcn/ui
- Consistent spacing (4, 8, 16, 24, 32px)
- Rounded corners (sm, md, lg)

## 📈 Performance Optimization

### Image Optimization
- Next.js Image component
- Lazy loading
- WebP format

### Code Splitting
- Dynamic imports
- Route-based splitting
- Component lazy loading

### Database Optimization
- Indexed fields
- Pagination
- Select only needed fields
- Eager loading with include

### Caching
- Static pages: ISR
- Dynamic pages: Streaming
- API routes: Cache headers

## 🔮 Future Enhancements

### Phase 1 (MVP) - Current
✅ Core LMS features
✅ Course management
✅ Payment integration
✅ Quiz system
✅ Progress tracking

### Phase 2
- [ ] Live classes (WebRTC)
- [ ] Real-time chat
- [ ] Discussion forums
- [ ] Assignment submissions

### Phase 3
- [ ] Mobile app
- [ ] AI recommendations
- [ ] Gamification
- [ ] Badges & achievements

### Phase 4
- [ ] Multi-language
- [ ] White-labeling
- [ ] API for integrations
- [ ] Advanced analytics

## 🤝 Contributing Guidelines

1. Fork the repository
2. Create feature branch
3. Follow code style (ESLint + Prettier)
4. Write tests
5. Update documentation
6. Submit PR

## 📝 Code Standards

### TypeScript
- Strict mode enabled
- No `any` types
- Interfaces for props
- Types for API responses

### React
- Functional components
- Hooks over classes
- Server/Client component separation
- Error boundaries

### Naming Conventions
- Components: PascalCase
- Files: kebab-case
- Functions: camelCase
- Constants: UPPER_CASE

---

## 🎉 You're Ready!

This architecture provides:
- ✅ Scalability (horizontal & vertical)
- ✅ Security (auth, authorization, data protection)
- ✅ Performance (optimized queries, caching)
- ✅ Maintainability (clean code, documentation)
- ✅ Extensibility (modular architecture)

Start building your MVP features and iterate based on user feedback!
