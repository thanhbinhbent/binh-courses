/**
 * Student Service
 * Handles API calls for student dashboard and learning progress
 */

import type { StudentDashboardResponse } from "@/lib/types"

// Helper function to get base URL for fetch calls
const getBaseUrl = () => {
  if (typeof window !== 'undefined') return '' // Client side
  return process.env.NEXTAUTH_URL || 'http://localhost:3000' // Server side
}

export const studentService = {
  /**
   * Get student dashboard data with progress
   */
  async getDashboard(): Promise<StudentDashboardResponse> {
    const res = await fetch(`${getBaseUrl()}/api/student/dashboard`, {
      credentials: 'include',
      cache: 'no-store'
    })
    
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('UNAUTHORIZED')
      }
      throw new Error('Failed to fetch dashboard')
    }
    
    return res.json()
  }
}
