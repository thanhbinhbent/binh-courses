/**
 * Authentication Service
 * Handles user authentication operations
 */

export interface RegisterData {
  name: string
  email: string
  password: string
  role: 'STUDENT' | 'INSTRUCTOR'
}

export const authService = {
  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<{ message: string }> {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    
    if (!res.ok) {
      const errorData = await res.json()
      if (res.status === 400) {
        throw new Error(errorData.error || 'INVALID_DATA')
      }
      if (res.status === 409) {
        throw new Error('USER_EXISTS')
      }
      throw new Error('REGISTRATION_FAILED')
    }
    
    return res.json()
  }
}