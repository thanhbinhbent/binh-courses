// Public Quiz Service - for browsing and taking quizzes

export interface PublicQuizItem {
  id: string
  title: string
  description: string | null
  timeLimit: number | null
  passingScore: number | null
  course: {
    title: string
    instructor: {
      name: string | null
      image: string | null
    }
  } | null
  _count: {
    questions: number
    attempts: number
  }
}

export interface PublicQuizzesResponse {
  quizzes: PublicQuizItem[]
}

export const publicQuizService = {
  async getPublicQuizzes(): Promise<PublicQuizzesResponse> {
    const response = await fetch('/api/quizzes', {
      method: 'GET',
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error('Failed to fetch quizzes')
    }

    return response.json()
  },

  async getQuizDetails(quizId: string) {
    const response = await fetch(`/api/quizzes/${quizId}`, {
      method: 'GET',
      cache: 'no-store'
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('NOT_FOUND')
      }
      throw new Error('Failed to fetch quiz details')
    }

    return response.json()
  },

  async startQuizAttempt(quizId: string) {
    const response = await fetch(`/api/quizzes/${quizId}/attempts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('UNAUTHORIZED')
      }
      throw new Error('Failed to start quiz attempt')
    }

    return response.json()
  }
}