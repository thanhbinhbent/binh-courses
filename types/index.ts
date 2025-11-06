// Define enums manually to avoid Prisma client issues
export type UserRole = 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'
export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'

// Define base model types manually (matching Prisma schema)
export type User = {
  id: string
  name: string | null
  email: string
  emailVerified: Date | null
  password: string | null
  image: string | null
  role: UserRole
  bio: string | null
  createdAt: Date
  updatedAt: Date
}

export type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  createdAt: Date
  updatedAt: Date
}

export type Course = {
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  price: number | null
  isPublished: boolean
  categoryId: string | null
  instructorId: string
  level: CourseLevel
  language: string
  duration: number | null
  requirements: string | null
  whatYouWillLearn: string | null
  createdAt: Date
  updatedAt: Date
}

export type Chapter = {
  id: string
  title: string
  description: string | null
  videoUrl: string | null
  position: number
  isPublished: boolean
  isFree: boolean
  courseId: string
  duration: number | null
  createdAt: Date
  updatedAt: Date
}

export type Enrollment = {
  id: string
  userId: string
  courseId: string
  enrolledAt: Date
  completedAt: Date | null
  progress: number
}

export type Review = {
  id: string
  userId: string
  courseId: string
  rating: number
  comment: string | null
  createdAt: Date
  updatedAt: Date
}

export type Progress = {
  id: string
  userId: string
  chapterId: string
  isCompleted: boolean
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type Quiz = {
  id: string
  title: string
  description: string | null
  courseId: string | null
  instructorId: string
  isPublished: boolean
  timeLimit: number | null
  passingScore: number
  maxAttempts: number | null
  createdAt: Date
  updatedAt: Date
}

export type Question = {
  id: string
  quizId: string
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY'
  question: string
  points: number
  order: number
  explanation: string | null
  createdAt: Date
  updatedAt: Date
}

export type QuizAttempt = {
  id: string
  userId: string
  quizId: string
  startedAt: Date
  submittedAt: Date | null
  score: number | null
  totalPoints: number
  passed: boolean | null
  timeSpent: number | null
}

// Complex types for components
export type CourseWithDetails = Course & {
  category: Category | null
  chapters: Chapter[]
  instructor: User
  reviews: Review[]
  enrollments: Enrollment[]
  _count: {
    enrollments: number
    reviews: number
  }
}

export type ChapterWithProgress = Chapter & {
  userProgress: {
    isCompleted: boolean
  } | null
}

export type CourseWithProgress = Course & {
  category: Category | null
  chapters: ChapterWithProgress[]
  progress: number | null
}

export type DashboardCourses = {
  completedCourses: CourseWithProgress[]
  coursesInProgress: CourseWithProgress[]
}
