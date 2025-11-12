/**
 * Dashboard Service
 * Handles API calls for unified dashboard data
 */

import type { StudentDashboardResponse } from "@/lib/types"

// Helper function to get base URL for fetch calls
const getBaseUrl = () => {
  if (typeof window !== 'undefined') return '' // Client side
  return process.env.NEXTAUTH_URL || 'http://localhost:3000' // Server side
}

export const dashboardService = {
  /**
   * Get dashboard data based on user role
   */
  async getDashboard(): Promise<StudentDashboardResponse> {
    const res = await fetch(`${getBaseUrl()}/api/dashboard`, {
      credentials: 'include',
      cache: 'no-store'
    })
    
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('UNAUTHORIZED')
      }
      if (res.status === 403) {
        throw new Error('FORBIDDEN')
      }
      throw new Error('Failed to fetch dashboard')
    }
    
    return res.json()
  }
}