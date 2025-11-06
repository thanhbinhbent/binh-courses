/**
 * Student Domain Types
 * Centralized type definitions for student dashboard and progress
 */

import type { Course, Chapter, Enrollment } from "./course.types"
import type { Quiz, QuizAttempt } from "./quiz.types"

export interface EnrollmentWithCourse extends Enrollment {
  course: Course & {
    chapters: Chapter[]
  }
}

export interface QuizAttemptWithDetails extends QuizAttempt {
  quiz: Quiz
}

export interface DashboardStats {
  enrolledCourses: number
  completedCourses: number
  inProgressCourses: number
  quizzesTaken: number
  // Legacy field names (for backward compatibility)
  totalCourses: number
  inProgress: number
  completed: number
  certificatesCount: number
}

export interface StudentDashboardResponse {
  user: {
    id: string
    name: string | null
    email: string | null
  }
  stats: DashboardStats
  recentEnrollments: EnrollmentWithCourse[]
  recentQuizAttempts: QuizAttemptWithDetails[]
  // Legacy fields (for backward compatibility)
  enrollments: EnrollmentWithCourse[]
  inProgressCourses: Array<Course & { progress?: number }>
  completedCourses: Array<Course & { progress?: number }>
  certificates: Array<{
    id: string
    courseId: string
    issuedAt: Date
  }>
}
