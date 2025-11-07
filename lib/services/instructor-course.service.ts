/**
 * Instructor Course Service
 * Handles API calls for instructor course management
 */

import type { Course, Category as CourseCategory, Chapter } from "@prisma/client"
import type { CourseWithEnrollmentCount } from "@/lib/types"

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
  },

  /**
   * Update course details
   */
  async updateCourse(courseId: string, data: {
    title?: string
    description?: string
    imageUrl?: string
    price?: number
    categoryId?: string
  }): Promise<void> {
    const res = await fetch(`/api/courses/${courseId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    })
    
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('UNAUTHORIZED')
      }
      if (res.status === 403) {
        throw new Error('FORBIDDEN')
      }
      throw new Error('Failed to update course')
    }
  },

  /**
   * Create new chapter
   */
  async createChapter(courseId: string, title: string): Promise<{ id: string }> {
    const res = await fetch(`/api/courses/${courseId}/chapters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ title }),
    })
    
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('UNAUTHORIZED')
      }
      if (res.status === 403) {
        throw new Error('FORBIDDEN')
      }
      throw new Error('Failed to create chapter')
    }
    
    return res.json()
  },

  /**
   * Update chapter details
   */
  async updateChapter(courseId: string, chapterId: string, data: {
    title?: string
    description?: string
    videoUrl?: string
    isFree?: boolean
    isPublished?: boolean
  }): Promise<void> {
    const res = await fetch(`/api/courses/${courseId}/chapters/${chapterId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    })
    
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('UNAUTHORIZED')
      }
      if (res.status === 403) {
        throw new Error('FORBIDDEN')
      }
      throw new Error('Failed to update chapter')
    }
  },

  /**
   * Delete chapter
   */
  async deleteChapter(courseId: string, chapterId: string): Promise<void> {
    const res = await fetch(`/api/courses/${courseId}/chapters/${chapterId}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('UNAUTHORIZED')
      }
      if (res.status === 403) {
        throw new Error('FORBIDDEN')
      }
      throw new Error('Failed to delete chapter')
    }
  },

  /**
   * Publish/unpublish course
   */
  async toggleCoursePublish(courseId: string): Promise<void> {
    const res = await fetch(`/api/courses/${courseId}/publish`, {
      method: 'PATCH',
      credentials: 'include',
    })
    
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('UNAUTHORIZED')
      }
      if (res.status === 403) {
        throw new Error('FORBIDDEN')
      }
      if (res.status === 400) {
        throw new Error('INVALID_COURSE_STATE')
      }
      throw new Error('Failed to publish/unpublish course')
    }
  },

  /**
   * Create new course
   */
  async createCourse(title: string): Promise<{ id: string }> {
    const res = await fetch("/api/courses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include',
      body: JSON.stringify({ title }),
    })
    
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('UNAUTHORIZED')
      }
      if (res.status === 403) {
        throw new Error('FORBIDDEN')
      }
      throw new Error('Failed to create course')
    }
    
    return res.json()
  }
}
