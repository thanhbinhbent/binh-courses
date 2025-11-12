/**
 * My Courses Service
 * Handles API calls for user's courses (both enrolled and owned)
 */

import type { Course, Category } from "@prisma/client"

// Helper function to get base URL for fetch calls
const getBaseUrl = () => {
  if (typeof window !== 'undefined') return '' // Client side
  return process.env.NEXTAUTH_URL || 'http://localhost:3000' // Server side
}

export interface MyCourse extends Course {
  category: Category | null
  owner: {
    id: string
    name: string | null
    image: string | null
  }
  chapters: { id: string }[]
  _count: {
    enrollments: number
    chapters: number
  }
  // For enrolled courses
  enrollment?: {
    id: string
    enrolledAt: Date
    progress: number
    lastAccessedAt: Date | null
    completedAt: Date | null
  }
  // Progress data
  progress?: {
    totalChapters: number
    completedChapters: number
    progressPercentage: number
  }
  // Relationship type
  relationshipType: 'ENROLLED' | 'OWNED'
  // Actions available for this course
  availableActions: {
    canView: boolean
    canEdit: boolean
    canDelete: boolean
    canEnroll: boolean
    canUnenroll: boolean
    canViewAnalytics: boolean
  }
}

export interface MyCoursesResponse {
  user: {
    id: string
    name: string | null
    email: string | null
    globalRoles: ('SYSTEM_ADMIN' | 'USER')[]
    image: string | null
  }
  courses: MyCourse[]
  stats: {
    totalCourses: number
    enrolledCourses: number
    ownedCourses: number
    completedCourses: number
    inProgressCourses: number
  }
}

export const myCoursesService = {
  /**
   * Get all courses related to current user (enrolled + owned)
   */
  async getMyCourses(): Promise<MyCoursesResponse> {
    const res = await fetch(`${getBaseUrl()}/api/my-courses`, {
      credentials: 'include',
      cache: 'no-store'
    })
    
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('UNAUTHORIZED')
      }
      if (res.status === 403) {
        throw new Error('FORBIDDEN')
      }
      throw new Error('Failed to fetch courses')
    }
    
    return res.json()
  },

  /**
   * Delete a course (only for owners)
   */
  async deleteCourse(courseId: string): Promise<void> {
    const res = await fetch(`${getBaseUrl()}/api/my-courses/${courseId}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('UNAUTHORIZED')
      }
      if (res.status === 403) {
        throw new Error('FORBIDDEN')
      }
      throw new Error('Failed to delete course')
    }
  },

  /**
   * Unenroll from a course (only for enrolled students)
   */
  async unenrollCourse(courseId: string): Promise<void> {
    const res = await fetch(`${getBaseUrl()}/api/my-courses/${courseId}/unenroll`, {
      method: 'POST',
      credentials: 'include'
    })
    
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('UNAUTHORIZED')
      }
      if (res.status === 403) {
        throw new Error('FORBIDDEN')
      }
      throw new Error('Failed to unenroll from course')
    }
  }
}