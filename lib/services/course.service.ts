/**
 * Course Service
 * Handles API calls for public course browsing
 */

import type {
  Course,
  CourseCategory,
  Chapter,
  Enrollment,
  UserProgress
} from "@/lib/types"

export interface CoursesListResponse {
  courses: Course[]
  categories: CourseCategory[]
}

export interface CourseDetailsResponse {
  course: Course & {
    chapters: (Chapter & {
      userProgress: UserProgress | null
    })[]
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
  chapter: Chapter
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
  }
}
