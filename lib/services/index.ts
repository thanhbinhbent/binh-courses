/**
 * Services Index
 * Central export point for all service modules
 */

export { courseService } from './course.service'
export { quizService } from './quiz.service'
export { studentService } from './student.service'
export { instructorCourseService } from './instructor-course.service'
export { instructorQuizService } from './instructor-quiz.service'
export { authService } from './auth.service'

// Re-export types
export type { RegisterData } from './auth.service'