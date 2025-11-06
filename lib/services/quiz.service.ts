/**
 * Quiz Service
 * Handles API calls for public quiz browsing
 */

import type {
  QuizzesListResponse,
  QuizDetailsResponse,
  QuizTakeResponse,
  QuizResultsResponse
} from "@/lib/types"

export const quizService = {
  /**
   * Get all published quizzes with categories
   */
  async getQuizzes(): Promise<QuizzesListResponse> {
    const res = await fetch('/api/quizzes/public', {
      cache: 'no-store'
    })
    
    if (!res.ok) {
      throw new Error('Failed to fetch quizzes')
    }
    
    return res.json()
  },

  /**
   * Get quiz details with user attempts
   */
  async getQuizDetails(quizId: string): Promise<QuizDetailsResponse> {
    const res = await fetch(`/api/quizzes/${quizId}/details`, {
      cache: 'no-store'
    })
    
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('NOT_FOUND')
      }
      throw new Error('Failed to fetch quiz')
    }
    
    return res.json()
  },

  /**
   * Get quiz attempt for taking
   */
  async getQuizAttempt(quizId: string, attemptId: string): Promise<QuizTakeResponse> {
    const res = await fetch(`/api/quizzes/${quizId}/take/${attemptId}`, {
      credentials: 'include',
      cache: 'no-store'
    })
    
    if (!res.ok) {
      const errorData = await res.json()
      
      if (res.status === 401) {
        throw new Error('UNAUTHORIZED')
      }
      if (res.status === 404) {
        throw new Error('NOT_FOUND')
      }
      if (errorData.error === 'COMPLETED' && errorData.redirectTo) {
        throw new Error(`COMPLETED:${errorData.redirectTo}`)
      }
      throw new Error('Failed to fetch quiz attempt')
    }
    
    return res.json()
  },

  /**
   * Get quiz results for completed attempt
   */
  async getQuizResults(quizId: string, attemptId: string): Promise<QuizResultsResponse> {
    const res = await fetch(`/api/quizzes/${quizId}/results/${attemptId}`, {
      credentials: 'include',
      cache: 'no-store'
    })
    
    if (!res.ok) {
      const errorData = await res.json()
      
      if (res.status === 401) {
        throw new Error('UNAUTHORIZED')
      }
      if (res.status === 404) {
        throw new Error('NOT_FOUND')
      }
      if (errorData.error === 'NOT_COMPLETED' && errorData.redirectTo) {
        throw new Error(`NOT_COMPLETED:${errorData.redirectTo}`)
      }
      throw new Error('Failed to fetch quiz results')
    }
    
    return res.json()
  }
}
