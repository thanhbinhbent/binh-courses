import { getCurrentUser } from "@/lib/current-user"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

/**
 * Standard authentication middleware for API routes
 */
export async function requireAuth() {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new NextResponse("Unauthorized", { status: 401 })
  }
  
  return user
}

/**
 * Check if user can access/modify a course
 */
export async function requireCourseAccess(courseId: string, userId: string, requiredPermissions: Array<'MANAGE_COURSE' | 'MANAGE_CONTENT' | 'MANAGE_USERS' | 'GRADE_ASSIGNMENTS' | 'VIEW_ANALYTICS' | 'MODERATE_COMMENTS'> = []) {
  // Check if course exists
  const course = await db.course.findUnique({
    where: { id: courseId }
  })
  
  if (!course) {
    throw new NextResponse("Course not found", { status: 404 })
  }
  
  const user = await db.user.findUnique({
    where: { id: userId }
  })
  
  if (!user) {
    throw new NextResponse("User not found", { status: 404 })
  }
  
  // System admin has full access
  if (user.globalRoles.includes("SYSTEM_ADMIN")) {
    return { course, user, hasAccess: true }
  }
  
  // Course owner has full access
  if (course.ownerId === userId) {
    return { course, user, hasAccess: true }
  }
  
  // Check course-specific roles
  const courseRole = await db.courseRole.findFirst({
    where: {
      userId,
      courseId,
      isActive: true
    }
  })
  
  if (!courseRole) {
    throw new NextResponse("Forbidden - No access to this course", { status: 403 })
  }
  
  // Check permissions if required
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requiredPermissions.every(permission => 
      courseRole.permissions.includes(permission)
    )
    
    if (!hasRequiredPermissions) {
      throw new NextResponse("Forbidden - Insufficient permissions", { status: 403 })
    }
  }
  
  return { course, user, hasAccess: true, courseRole }
}

/**
 * Check if user can access/modify a quiz
 */
export async function requireQuizAccess(quizId: string, userId: string) {
  const quiz = await db.quiz.findUnique({
    where: { id: quizId },
    include: {
      chapter: {
        include: { course: true }
      }
    }
  })
  
  if (!quiz) {
    throw new NextResponse("Quiz not found", { status: 404 })
  }
  
  const user = await db.user.findUnique({
    where: { id: userId }
  })
  
  if (!user) {
    throw new NextResponse("User not found", { status: 404 })
  }
  
  // System admin has full access
  if (user.globalRoles.includes("SYSTEM_ADMIN")) {
    return { quiz, user, hasAccess: true }
  }
  
  // Quiz creator has access
  if (quiz.creatorId === userId) {
    return { quiz, user, hasAccess: true }
  }
  
  // If quiz belongs to a course, check course permissions
  if (quiz.chapter?.course) {
    const course = quiz.chapter.course
    
    // Course owner has access
    if (course.ownerId === userId) {
      return { quiz, user, hasAccess: true }
    }
    
    // Check course instructor role
    const courseRole = await db.courseRole.findFirst({
      where: {
        userId,
        courseId: course.id,
        role: { in: ['INSTRUCTOR', 'TEACHING_ASSISTANT'] },
        isActive: true,
        permissions: { has: 'MANAGE_CONTENT' }
      }
    })
    
    if (courseRole) {
      return { quiz, user, hasAccess: true, courseRole }
    }
  }
  
  throw new NextResponse("Forbidden - No access to this quiz", { status: 403 })
}