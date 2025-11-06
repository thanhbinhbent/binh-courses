/**
 * Instructor Quiz Service
 * Handles API calls for instructor quiz management
 */

import type {
  QuizDetailsResponse,
  InstructorQuizzesResponse
} from "@/lib/types/instructor-quiz.types"

export const instructorQuizService = {
  /**
   * Get quiz details with categories for editing
   */
  async getQuizWithDetails(quizId: string): Promise<QuizDetailsResponse> {
    const res = await fetch(`/api/instructor/quizzes/${quizId}`, {
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
      
      throw new Error(errorText || 'Failed to fetch quiz')
    }
    
    return res.json()
  },

  /**
   * Get list of instructor's quizzes
   */
  async getInstructorQuizzes(): Promise<InstructorQuizzesResponse> {
    const res = await fetch('/api/instructor/quizzes', {
      credentials: 'include',
      cache: 'no-store'
    })
    
    if (!res.ok) {
      if (res.status === 401) throw new Error('UNAUTHORIZED')
      if (res.status === 403) throw new Error('FORBIDDEN')
      throw new Error('Failed to fetch quizzes')
    }
    
    return res.json()
  }
}
