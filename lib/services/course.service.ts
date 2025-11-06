/**
 * Course Service
 * Handles API calls for public course browsing
 */

import type {
  Chapter,
  Course,
  Category,
  Enrollment,
} from "@prisma/client"

export interface CoursesListResponse {
  courses: (Course & {
    category: Category | null
    instructor: {
      name: string | null
      image: string | null
    }
    chapters: { id: string }[]
    _count: {
      enrollments: number
      reviews: number
    }
  })[]
  categories: Category[]
}

export interface CourseDetailsResponse {
  course: Course & {
    category: Category | null
    instructor: {
      name: string | null
      image: string | null
      bio: string | null
    }
    chapters: (Chapter & {
      lessons: {
        id: string
        title: string
        type: 'VIDEO' | 'ARTICLE' | 'QUIZ' | 'EXERCISE'
        duration?: number | null
        isFree: boolean
        progress?: { isCompleted: boolean }[]
      }[]
      userProgress?: { isCompleted: boolean }[]
    })[]
    _count: {
      enrollments: number
      reviews: number
    }
  }
  enrollment: Enrollment | null
  isEnrolled: boolean
  isFree: boolean
  reviews: Array<{
    id: string
    rating: number
    comment: string | null
    userId: string
    user: {
      name: string | null
      image: string | null
    }
  }>
  averageRating: number
  userReview: {
    id: string
    rating: number
    comment: string | null
  } | null
  progress: number
  user: {
    id: string
    name: string | null
    email: string | null
  } | null
}

export interface ChapterViewResponse {
  chapter: Chapter & {
    resources?: {
      id: string
      name: string
      url: string
      type: string
    }[]
    course: {
      id: string
      title: string
      chapters: (Chapter & {
        lessons: {
          id: string
          title: string
          type: 'VIDEO' | 'ARTICLE' | 'QUIZ' | 'EXERCISE'
          videoUrl?: string | null
          duration?: number | null
          isFree: boolean
          progress?: { isCompleted: boolean }[]
        }[]
      })[]
    }
    lessons: {
      id: string
      title: string
      type: 'VIDEO' | 'ARTICLE' | 'QUIZ' | 'EXERCISE'
      videoUrl?: string | null
      duration?: number | null
      isFree: boolean
      progress?: { isCompleted: boolean }[]
    }[]
  }
  isEnrolled: boolean
  canAccess: boolean
  currentIndex: number
  previousChapter: Chapter | null
  nextChapter: Chapter | null
  isCompleted: boolean
  progress: number
}

export const courseService = {
  /**
   * Get all published courses with categories
   */
  async getCourses(): Promise<CoursesListResponse> {
    const res = await fetch('/api/courses', {
      cache: 'no-store'
    })
    
    if (!res.ok) {
      throw new Error('Failed to fetch courses')
    }
    
    return res.json()
  },

  /**
   * Get course details with enrollment and reviews
   */
  async getCourseDetails(courseId: string): Promise<CourseDetailsResponse> {
    const res = await fetch(`/api/courses/${courseId}/details`, {
      cache: 'no-store'
    })
    
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('NOT_FOUND')
      }
      throw new Error('Failed to fetch course')
    }
    
    return res.json()
  },

  /**
   * Get chapter view data with navigation
   */
  async getChapterView(courseId: string, chapterId: string): Promise<ChapterViewResponse> {
    const res = await fetch(`/api/courses/${courseId}/chapters/${chapterId}/view`, {
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
      if (res.status === 404) {
        throw new Error('NOT_FOUND')
      }
      throw new Error('Failed to fetch chapter')
    }
    
    return res.json()
  },

  /**
   * Enroll in a course
   */
  async enrollInCourse(courseId: string): Promise<void> {
    const res = await fetch(`/api/courses/${courseId}/enroll`, {
      method: 'POST',
      credentials: 'include',
    })
    
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('UNAUTHORIZED')
      }
      if (res.status === 400) {
        throw new Error('ALREADY_ENROLLED')
      }
      if (res.status === 402) {
        throw new Error('PURCHASE_REQUIRED')
      }
      throw new Error('Failed to enroll in course')
    }
  },

  /**
   * Mark chapter as complete
   */
  async markChapterComplete(chapterId: string): Promise<void> {
    const res = await fetch(`/api/chapters/${chapterId}/progress`, {
      method: 'POST',
      credentials: 'include',
    })
    
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('UNAUTHORIZED')
      }
      if (res.status === 403) {
        throw new Error('FORBIDDEN')
      }
      throw new Error('Failed to mark chapter as complete')
    }
  },

  /**
   * Add or update course review
   */
  async addReview(courseId: string, rating: number, comment: string): Promise<void> {
    const res = await fetch(`/api/courses/${courseId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ rating, comment }),
    })
    
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('UNAUTHORIZED')
      }
      throw new Error('Failed to add review')
    }
  },

  /**
   * Update course review
   */
  async updateReview(courseId: string, reviewId: string, rating: number, comment: string): Promise<void> {
    const res = await fetch(`/api/courses/${courseId}/reviews/${reviewId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ rating, comment }),
    })
    
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('UNAUTHORIZED')
      }
      throw new Error('Failed to update review')
    }
  }
}
