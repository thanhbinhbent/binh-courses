"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface UseAuthRedirectOptions {
  redirectTo?: string
  checkEnrolledCourses?: boolean
}

export function useAuthRedirect({ 
  redirectTo,
  checkEnrolledCourses = false 
}: UseAuthRedirectOptions = {}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    // If user is not authenticated and we have a redirect target
    if (!session && redirectTo) {
      router.push(redirectTo)
      return
    }

    // If user is authenticated and we should check for courses
    if (session?.user && checkEnrolledCourses) {
      // Determine default route based on role
      // In new system, all users go to dashboard by default
      router.push("/dashboard")
    }
  }, [session, status, router, redirectTo, checkEnrolledCourses])

  return { session, status, isAuthenticated: !!session }
}

// Helper hook to get the correct dashboard route for a user
export function useUserDashboard() {
  const { data: session } = useSession()
  
  const getDashboardRoute = () => {
    if (!session?.user) return "/sign-in"
    
    // In new system, all users use student dashboard by default
    return "/dashboard"
  }

  return getDashboardRoute()
}