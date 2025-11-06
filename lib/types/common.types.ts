/**
 * Shared Types
 * Common types used across the application
 */

export enum UserRole {
  STUDENT = "STUDENT",
  INSTRUCTOR = "INSTRUCTOR",
  ADMIN = "ADMIN"
}

export interface User {
  id: string
  email: string | null
  name: string | null
  role: UserRole
  image: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ApiErrorResponse {
  error: string
  message?: string
}

export type ApiResponse<T> = T | ApiErrorResponse

// Type guards
export function isApiError(response: unknown): response is ApiErrorResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'error' in response
  )
}
