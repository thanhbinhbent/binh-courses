/**
 * Instructor Course Service
 * Handles API calls for instructor course management
 */

import type {
  Course,
  CourseCategory,
  Chapter,
  CourseWithEnrollmentCount
} from "@/lib/types"

export interface CourseDetailsResponse {
  course: Course
  categories: CourseCategory[]
  isComplete: boolean
}

export interface ChapterDetailsResponse {
  chapter: Chapter
  completion: {
    total: number
    completed: number
  }
}

export interface InstructorCoursesResponse {
  courses: CourseWithEnrollmentCount[]
  stats: {
    totalCourses: number
    publishedCount: number
    totalStudents: number
    totalRevenue: number
  }
}

export const instructorCourseService = {
  /**
   * Get course details with categories for editing
   */
  async getCourseWithDetails(courseId: string): Promise<CourseDetailsResponse> {
    const res = await fetch(`/api/instructor/courses/${courseId}`, {
      credentials: 'include',
      cache: 'no-store' // Always get fresh data
    })
    
    if (!res.ok) {
      const errorText = await res.text()
      
      // Handle specific error cases
      if (res.status === 401) {
        throw new Error('UNAUTHORIZED')
      }
      if (res.status === 403) {
        throw new Error('FORBIDDEN')
      }
      if (res.status === 404) {
        throw new Error('NOT_FOUND')
      }
      
      throw new Error(errorText || 'Failed to fetch course')
    }
    
    return res.json()
  },

  /**
   * Get chapter details for editing
   */
  async getChapterWithDetails(courseId: string, chapterId: string): Promise<ChapterDetailsResponse> {
    const res = await fetch(`/api/instructor/courses/${courseId}/chapters/${chapterId}`, {
      credentials: 'include',
      cache: 'no-store'
    })
    
    if (!res.ok) {
      const errorText = await res.text()
      
      if (res.status === 401) {
        throw new Error('UNAUTHORIZED')
      }
      if (res.status === 403) {
        throw new Error('FORBIDDEN')
      }
      if (res.status === 404) {
        throw new Error('NOT_FOUND')
      }
      
      throw new Error(errorText || 'Failed to fetch chapter')
    }
    
    return res.json()
  },

  /**
   * Get list of instructor's courses with stats
   */
  async getInstructorCourses(): Promise<InstructorCoursesResponse> {
    const res = await fetch('/api/instructor/courses', {
      credentials: 'include',
      cache: 'no-store'
    })
    
    if (!res.ok) {
      if (res.status === 401) throw new Error('UNAUTHORIZED')
      if (res.status === 403) throw new Error('FORBIDDEN')
      throw new Error('Failed to fetch courses')
    }
    
    return res.json()
  }
}
