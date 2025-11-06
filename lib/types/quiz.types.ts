/**
 * Quiz Domain Types
 * Centralized type definitions for quiz-related features
 */

export enum QuizType {
  PRACTICE = "PRACTICE",
  GRADED = "GRADED",
  SURVEY = "SURVEY"
}

export enum QuestionType {
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  TRUE_FALSE = "TRUE_FALSE",
  SHORT_ANSWER = "SHORT_ANSWER",
  ESSAY = "ESSAY"
}

export interface QuizOption {
  id: string
  text: string
  isCorrect: boolean
  order: number
}

export interface QuizQuestion {
  id: string
  type: QuestionType
  question: string
  points: number
  order: number
  options: QuizOption[]
}

export interface QuizCategory {
  id: string
  name: string
  slug?: string
}

export interface Quiz {
  id: string
  title: string
  description: string | null
  isPublished: boolean
  isFree: boolean
  categoryId: string | null
  category: QuizCategory | null
  instructorId: string
  timeLimit: number | null
  passingScore: number
  allowRetake: boolean
  showCorrectAnswers: boolean
  questions: QuizQuestion[]
  instructor?: {
    id: string
    name: string | null
    email: string | null
  }
  _count?: {
    questions: number
    attempts: number
  }
  createdAt: Date
  updatedAt: Date
}

export interface QuizAnswer {
  id: string
  questionId: string
  answer: string
  isCorrect: boolean | null
  points: number
  createdAt: Date
  updatedAt: Date
}

export interface QuizAttempt {
  id: string
  quizId: string
  userId: string
  startedAt: Date
  completedAt: Date | null
  score: number | null
  isPassed: boolean
  answers: QuizAnswer[]
}

export interface QuizAttemptWithQuiz extends QuizAttempt {
  quiz: Quiz
}

// API Response Types
export interface QuizzesListResponse {
  quizzes: Quiz[]
  categories: QuizCategory[]
}

export interface QuizDetailsResponse {
  quiz: Quiz
  userAttempts: QuizAttempt[]
  bestScore: number | null
  totalPoints: number
  user: {
    id: string
    name: string | null
    email: string | null
  } | null
}

export interface QuizTakeResponse {
  attempt: QuizAttempt
  quiz: Quiz
  questions: QuizQuestion[]
  existingAnswers: QuizAnswer[]
}

export interface QuizResultsResponse {
  attempt: QuizAttemptWithQuiz
  totalQuestions: number
  answeredQuestions: number
  correctAnswers: number
  totalPoints: number
}
