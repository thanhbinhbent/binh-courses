import { Course, Category, Chapter, User, Enrollment, Purchase, Review } from '@prisma/client'

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

export type UserRole = 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'

export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
