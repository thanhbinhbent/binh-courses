import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function getCurrentUser() {
  const session = await auth()
  
  if (!session?.user?.email) {
    return null
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email }
  })

  return user
}

export async function requireUser() {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error("Unauthorized")
  }
  
  return user
}

export async function requireInstructor() {
  const user = await requireUser()
  
  if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN") {
    throw new Error("Forbidden: Instructor access required")
  }
  
  return user
}

export async function requireAdmin() {
  const user = await requireUser()
  
  if (user.role !== "ADMIN") {
    throw new Error("Forbidden: Admin access required")
  }
  
  return user
}
