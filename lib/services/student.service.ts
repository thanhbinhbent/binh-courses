/**
 * Student Service
 * Handles API calls for student dashboard and learning progress
 */

import type { StudentDashboardResponse } from "@/lib/types"

export const studentService = {
  /**
   * Get student dashboard data with progress
   */
  async getDashboard(): Promise<StudentDashboardResponse> {
    const res = await fetch('/api/student/dashboard', {
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
