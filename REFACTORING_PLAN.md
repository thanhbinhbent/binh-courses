# 🏗️ FRONTEND-BACKEND SEPARATION REFACTORING PLAN

## ❌ CURRENT PROBLEM

**15+ pages are directly querying database** - Violates separation of concerns:

```tsx
// ❌ BAD: Page component queries DB directly
import { db } from "@/lib/db"

export default async function Page() {
  const data = await db.model.findMany() // Direct DB access!
  return <Component data={data} />
}
```

### Issues:
1. **No API Layer** - Cannot call from client components
2. **Hard to Test** - DB mocked in every test
3. **Cannot Scale** - Tight coupling
4. **No Caching** - Every request hits DB
5. **No Reusability** - Query logic scattered

---

## ✅ TARGET ARCHITECTURE

```
┌─────────────────┐
│  Pages/Client   │  (UI Layer - React Components)
└────────┬────────┘
         │ calls
         ↓
┌─────────────────┐
│   Services      │  (API Client - Frontend Service Layer)
└────────┬────────┘
         │ HTTP
         ↓
┌─────────────────┐
│   API Routes    │  (Backend API - Next.js Route Handlers)
└────────┬────────┘
         │ ORM
         ↓
┌─────────────────┐
│   Database      │  (PostgreSQL via Prisma)
└─────────────────┘
```

---

## 📋 REFACTORING STEPS

### Step 1: Create API Routes (GET endpoints)

Create **READ API endpoints** for all data fetching:

#### Quiz APIs:
```
GET  /api/instructor/quizzes              # List instructor's quizzes
GET  /api/instructor/quizzes/[id]         # Get quiz details (instructor view)
GET  /api/quizzes/[id]/details           # Get quiz details (public view)
```

#### Course APIs:
```
GET  /api/instructor/courses              # List instructor's courses
GET  /api/instructor/courses/[id]         # Get course details (instructor view)
GET  /api/courses/[id]/details           # Get course details (public view)
```

### Step 2: Create Service Layer

Create **frontend service** to abstract API calls:

```typescript
// lib/services/quiz-service.ts
export const quizService = {
  getInstructorQuizzes: async () => {
    const res = await fetch('/api/instructor/quizzes')
    if (!res.ok) throw new Error('Failed to fetch')
    return res.json()
  },
  
  getQuizDetails: async (id: string) => {
    const res = await fetch(`/api/instructor/quizzes/${id}`)
    if (!res.ok) throw new Error('Failed to fetch')
    return res.json()
  }
}
```

### Step 3: Refactor Pages

Convert **Server Components** with DB queries → **Client Components** with API calls:

```tsx
// ❌ BEFORE (Server Component with DB)
import { db } from "@/lib/db"

export default async function Page() {
  const quiz = await db.quiz.findUnique({ where: { id } })
  return <QuizSettings quiz={quiz} />
}

// ✅ AFTER (Client Component with Service)
'use client'
import { quizService } from '@/lib/services/quiz-service'

export default function Page() {
  const { data: quiz, isLoading } = useSWR(
    `/quiz/${id}`,
    () => quizService.getQuizDetails(id)
  )
  
  if (isLoading) return <Loading />
  return <QuizSettings quiz={quiz} />
}
```

---

## 🎯 PRIORITY ORDER

## Progress Tracking

### Phase 1: Instructor Tools ✅ COMPLETE
- [x] 1. Quiz Edit (`/app/(dashboard)/instructor/quizzes/[quizId]/page.tsx`) ✅
- [x] 2. Course Edit (`/app/(dashboard)/instructor/courses/[courseId]/page.tsx`) ✅
- [x] 3. Chapter Edit (`/app/(dashboard)/instructor/courses/[courseId]/chapters/[chapterId]/page.tsx`) ✅
- [x] 4. Instructor Dashboard (`/app/(dashboard)/instructor/page.tsx`) ✅
- [x] 5. Quizzes List (`/app/(dashboard)/instructor/quizzes/page.tsx`) ✅

### Phase 2: Public Pages ✅ COMPLETE
- [x] 6. Course Listing (`/app/(course)/courses/page.tsx`) ✅
- [x] 7. Course Details (`/app/(course)/courses/[courseId]/page.tsx`) ✅
- [x] 8. Quiz Listing (`/app/(quiz)/quizzes/page.tsx`) ✅
- [x] 9. Quiz Details (`/app/(quiz)/quizzes/[quizId]/page.tsx`) ✅
- [x] 10. Chapter View (`/app/(course)/courses/[courseId]/chapters/[chapterId]/page.tsx`) ✅

### Phase 3: Student Dashboard ✅ COMPLETE
- [x] 11. Student Dashboard (`/app/(dashboard)/dashboard/page.tsx`) ✅
- [x] 12. Quiz Taking (`/app/(quiz)/quizzes/[quizId]/take/[attemptId]/page.tsx`) ✅
- [x] 13. Quiz Results (`/app/(quiz)/quizzes/[quizId]/results/[attemptId]/page.tsx`) ✅

**🎉 REFACTORING COMPLETE: 13/13 pages (100%)**

---

## 📝 IMPLEMENTATION GUIDE

### 1. Create GET API Route

```typescript
// app/api/instructor/quizzes/[quizId]/route.ts
import { getCurrentUser } from "@/lib/current-user"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { quizId } = await params
    const user = await getCurrentUser()

    if (!user || (user.role !== "INSTRUCTOR" && user.role !== "ADMIN")) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: {
        category: true,
        questions: {
          orderBy: { order: "asc" },
          include: {
            options: { orderBy: { order: "asc" } }
          }
        }
      }
    })

    if (!quiz) {
      return new NextResponse("Not found", { status: 404 })
    }

    // Check ownership
    if (quiz.instructorId !== user.id && user.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Also fetch categories for settings
    const categories = await db.category.findMany({
      orderBy: { name: "asc" }
    })

    return NextResponse.json({ quiz, categories })
  } catch (error) {
    console.error("[QUIZ_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
```

### 2. Create Service

```typescript
// lib/services/instructor-quiz.service.ts
export const instructorQuizService = {
  async getQuizWithDetails(quizId: string) {
    const res = await fetch(`/api/instructor/quizzes/${quizId}`, {
      credentials: 'include' // Include cookies for auth
    })
    
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Failed to fetch quiz')
    }
    
    return res.json()
  }
}
```

### 3. Refactor Page Component

```tsx
// app/(dashboard)/instructor/quizzes/[quizId]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { instructorQuizService } from '@/lib/services/instructor-quiz.service'
import { QuizSettings } from "./_components/quiz-settings"
import { QuestionsList } from "./_components/questions-list"

export default function QuizEditPage({
  params
}: {
  params: { quizId: string }
}) {
  const router = useRouter()
  const [quiz, setQuiz] = useState(null)
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await instructorQuizService.getQuizWithDetails(params.quizId)
        setQuiz(data.quiz)
        setCategories(data.categories)
      } catch (err) {
        setError(err.message)
        if (err.message.includes('Unauthorized')) {
          router.push('/sign-in')
        } else if (err.message.includes('Forbidden')) {
          router.push('/instructor/quizzes')
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [params.quizId, router])

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />
  if (!quiz) return null

  return (
    <div className="p-6">
      {/* Rest of UI */}
      <QuizSettings quiz={quiz} categories={categories} />
      <QuestionsList quiz={quiz} questions={quiz.questions} />
    </div>
  )
}
```

---

## 🎁 BENEFITS

### 1. **Clean Separation**
- ✅ Frontend: Only UI concerns
- ✅ Backend: Only data concerns
- ✅ Service: Reusable API abstraction

### 2. **Better Testing**
```typescript
// Easy to mock services
jest.mock('@/lib/services/quiz-service')

test('renders quiz', async () => {
  quizService.getQuizDetails.mockResolvedValue(mockQuiz)
  render(<QuizPage />)
  expect(screen.getByText(mockQuiz.title)).toBeInTheDocument()
})
```

### 3. **Client-Side Features**
- ✅ Real-time updates (can use SWR/React Query)
- ✅ Optimistic updates
- ✅ Cache management
- ✅ Loading/error states

### 4. **Scalability**
- ✅ Can move API to separate server
- ✅ Can add API versioning
- ✅ Can add rate limiting
- ✅ Can add caching layer (Redis)

---

## ⚠️ IMPORTANT NOTES

### Next.js App Router Caveat:
- **Server Components CAN query DB directly** - This is a Next.js feature
- **But it's not recommended** for complex apps because:
  1. Cannot call from client components
  2. No API layer for mobile/external clients
  3. Harder to add authentication layer
  4. Mixing concerns (UI + Data)

### Our Approach:
- **Keep it simple for now** - Use Server Components where it makes sense
- **Gradually refactor** critical pages to Client Components with APIs
- **Focus on pages that need**:
  - Real-time updates
  - Client-side interactions
  - Form submissions
  - Complex state management

---

## 📊 REFACTORING PROGRESS

### Pages to Refactor (15 total):
- [ ] `/app/(dashboard)/instructor/quizzes/[quizId]/page.tsx` ← START HERE
- [ ] `/app/(dashboard)/instructor/courses/[courseId]/page.tsx`
- [ ] `/app/(dashboard)/instructor/courses/[courseId]/chapters/[chapterId]/page.tsx`
- [ ] `/app/(course)/courses/page.tsx`
- [ ] `/app/(course)/courses/[courseId]/page.tsx`
- [ ] `/app/(quiz)/quizzes/page.tsx`
- [ ] `/app/(quiz)/quizzes/[quizId]/page.tsx`
- [ ] `/app/(dashboard)/dashboard/page.tsx`
- [ ] `/app/(quiz)/quizzes/[quizId]/take/[attemptId]/page.tsx`
- [ ] `/app/(quiz)/quizzes/[quizId]/results/[attemptId]/page.tsx`
- [ ] `/app/(dashboard)/instructor/page.tsx`
- [ ] `/app/(dashboard)/instructor/courses/new/page.tsx`
- [ ] `/app/(dashboard)/instructor/quizzes/page.tsx`
- [ ] `/app/(dashboard)/instructor/quizzes/new/page.tsx`
- [ ] `/app/(course)/courses/[courseId]/chapters/[chapterId]/page.tsx`

---

## 🚀 NEXT STEPS

1. **Create API GET route** for quiz details
2. **Create service layer** for API abstraction
3. **Refactor quiz edit page** as example
4. **Apply pattern** to other pages
5. **Add SWR/React Query** for caching (optional)
6. **Add loading/error states** everywhere
7. **Add e2e tests** for critical flows

---

**Status**: Ready to implement  
**Priority**: HIGH - Improves architecture quality  
**Effort**: Medium - Systematic refactoring needed
