"use client"

import { useSession } from "next-auth/react"

export function useUserRole() {
  const { data: session } = useSession()
  
  return {
    role: session?.user?.role || null,
    isStudent: session?.user?.role === 'STUDENT',
    isInstructor: session?.user?.role === 'INSTRUCTOR' || session?.user?.role === 'ADMIN',
    isAdmin: session?.user?.role === 'ADMIN',
    isAuthenticated: !!session
  }
}