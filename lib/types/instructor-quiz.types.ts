/**
 * Instructor Quiz Management Types
 */

import type { Quiz, QuizCategory } from "./quiz.types"

// Re-export Quiz for backward compatibility
export type { Quiz as QuizWithRelations } from "./quiz.types"

export interface QuizCompletion {
  total: number
  completed: number
  isComplete: boolean
}

export interface QuizDetailsResponse {
  quiz: Quiz
  categories: QuizCategory[]
  completion: QuizCompletion
}

export interface InstructorQuizzesResponse {
  quizzes: Quiz[]
}
