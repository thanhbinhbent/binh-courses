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
  },

  /**
   * Create new quiz
   */
  async createQuiz(data: {
    title: string
    description?: string
    categoryId?: string
    timeLimit?: number
    passingScore: number
    allowRetake: boolean
    showCorrectAnswers: boolean
  }): Promise<{ id: string }> {
    const res = await fetch("/api/quizzes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
      throw new Error('Failed to create quiz')
    }
    
    return res.json()
  },

  /**
   * Update quiz settings
   */
  async updateQuiz(quizId: string, data: {
    title?: string
    description?: string
    categoryId?: string
    timeLimit?: number
    passingScore?: number
    allowRetake?: boolean
    showCorrectAnswers?: boolean
  }): Promise<void> {
    const res = await fetch(`/api/quizzes/${quizId}`, {
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
      throw new Error('Failed to update quiz')
    }
  },

  /**
   * Delete quiz
   */
  async deleteQuiz(quizId: string): Promise<void> {
    const res = await fetch(`/api/quizzes/${quizId}`, {
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
      throw new Error('Failed to delete quiz')
    }
  },

  /**
   * Publish quiz
   */
  async publishQuiz(quizId: string): Promise<void> {
    const res = await fetch(`/api/quizzes/${quizId}/publish`, {
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
      throw new Error('Failed to publish quiz')
    }
  },

  /**
   * Unpublish quiz
   */
  async unpublishQuiz(quizId: string): Promise<void> {
    const res = await fetch(`/api/quizzes/${quizId}/unpublish`, {
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
      throw new Error('Failed to unpublish quiz')
    }
  },

  /**
   * Create question
   */
  async createQuestion(quizId: string, data: {
    type: string
    text: string
    points: number
    options?: Array<{
      text: string
      isCorrect: boolean
    }>
  }): Promise<{ id: string }> {
    const res = await fetch(`/api/quizzes/${quizId}/questions`, {
      method: 'POST',
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
      throw new Error('Failed to create question')
    }
    
    return res.json()
  },

  /**
   * Update question
   */
  async updateQuestion(quizId: string, questionId: string, data: {
    type?: string
    text?: string
    points?: number
    options?: Array<{
      text: string
      isCorrect: boolean
    }>
  }): Promise<void> {
    const res = await fetch(`/api/quizzes/${quizId}/questions/${questionId}`, {
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
      throw new Error('Failed to update question')
    }
  },

  /**
   * Delete question
   */
  async deleteQuestion(quizId: string, questionId: string): Promise<void> {
    const res = await fetch(`/api/quizzes/${quizId}/questions/${questionId}`, {
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
      throw new Error('Failed to delete question')
    }
  }
}
