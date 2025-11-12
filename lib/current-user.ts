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

export async function requireSystemAdmin() {
  const user = await requireUser()
  
  if (!user.globalRoles.includes("SYSTEM_ADMIN")) {
    throw new Error("Forbidden: System admin access required")
  }
  
  return user
}

export async function getUserCourseRole(userId: string, courseId: string) {
  const courseRole = await db.courseRole.findFirst({
    where: {
      userId,
      courseId,
      isActive: true
    }
  })
  
  return courseRole
}

export async function requireCoursePermission(
  courseId: string, 
  requiredPermissions: string[]
) {
  const user = await requireUser()
  
  // System admin has all permissions
  if (user.globalRoles.includes("SYSTEM_ADMIN")) {
    return user
  }
  
  // Check if user is course owner
  const course = await db.course.findUnique({
    where: { id: courseId }
  })
  
  if (course?.ownerId === user.id) {
    return user
  }
  
  // Check course-specific roles
  const courseRole = await getUserCourseRole(user.id, courseId)
  
  if (!courseRole) {
    throw new Error("Forbidden: No access to this course")
  }
  
  // Check if user has required permissions
  const hasPermissions = requiredPermissions.every(permission => 
    courseRole.permissions.includes(permission as any)
  )
  
  if (!hasPermissions) {
    throw new Error("Forbidden: Insufficient permissions")
  }
  
  return user
}

export async function requireQuizAccess(quizId: string) {
  const user = await requireUser()
  
  // System admin has all access
  if (user.globalRoles.includes("SYSTEM_ADMIN")) {
    return user
  }
  
  // Check if user is quiz creator
  const quiz = await db.quiz.findUnique({
    where: { id: quizId }
  })
  
  if (!quiz) {
    throw new Error("Quiz not found")
  }
  
  if (quiz.creatorId === user.id) {
    return user
  }
  
  // If quiz is attached to a course, check course permissions
  if (quiz.chapterId) {
    const chapter = await db.chapter.findUnique({
      where: { id: quiz.chapterId },
      include: { course: true }
    })
    
    if (chapter) {
      return await requireCoursePermission(chapter.courseId, ["MANAGE_CONTENT"])
    }
  }
  
  throw new Error("Forbidden: No access to this quiz")
}
