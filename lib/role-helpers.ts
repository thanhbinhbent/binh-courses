import { db } from "@/lib/db"

/**
 * Check if user can create/manage quizzes
 * In new system: System admins and users who own courses can create quizzes
 */
export async function canManageQuizzes(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId }
  })
  
  if (!user) return false
  
  // System admins can manage any quiz
  if (user.globalRoles.includes("SYSTEM_ADMIN")) {
    return true
  }
  
  // Regular users can create standalone quizzes (practice quizzes)
  // They can also create quizzes for courses they own or have instructor role in
  return user.globalRoles.includes("USER")
}

/**
 * Check if user can access/modify a specific quiz
 */
export async function canAccessQuiz(userId: string, quizId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId }
  })
  
  if (!user) return false
  
  // System admin can access any quiz
  if (user.globalRoles.includes("SYSTEM_ADMIN")) {
    return true
  }
  
  const quiz = await db.quiz.findUnique({
    where: { id: quizId },
    include: {
      chapter: {
        include: { course: true }
      }
    }
  })
  
  if (!quiz) return false
  
  // Quiz creator can access their quiz
  if (quiz.creatorId === userId) {
    return true
  }
  
  // If quiz is part of a course, check course permissions
  if (quiz.chapter?.course) {
    const courseId = quiz.chapter.course.id
    
    // Course owner can access
    if (quiz.chapter.course.ownerId === userId) {
      return true
    }
    
    // Check if user has instructor role in this course
    const courseRole = await db.courseRole.findFirst({
      where: {
        userId,
        courseId,
        role: { in: ['INSTRUCTOR', 'TEACHING_ASSISTANT'] },
        isActive: true,
        permissions: {
          has: 'MANAGE_CONTENT'
        }
      }
    })
    
    return !!courseRole
  }
  
  return false
}

/**
 * Middleware to check if user can manage courses
 */
export async function canManageCourses(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId }
  })
  
  if (!user) return false
  
  // System admin can manage any course
  if (user.globalRoles.includes("SYSTEM_ADMIN")) {
    return true
  }
  
  // Regular users can create and manage their own courses
  return user.globalRoles.includes("USER")
}

/**
 * Check if user can access/modify a specific course
 */
export async function canAccessCourse(userId: string, courseId: string, requiredPermissions: Array<'MANAGE_COURSE' | 'MANAGE_CONTENT' | 'MANAGE_USERS' | 'GRADE_ASSIGNMENTS' | 'VIEW_ANALYTICS' | 'MODERATE_COMMENTS'> = []): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId }
  })
  
  if (!user) return false
  
  // System admin can access any course
  if (user.globalRoles.includes("SYSTEM_ADMIN")) {
    return true
  }
  
  const course = await db.course.findUnique({
    where: { id: courseId }
  })
  
  if (!course) return false
  
  // Course owner has full access
  if (course.ownerId === userId) {
    return true
  }
  
  // Check course-specific roles
  const courseRole = await db.courseRole.findFirst({
    where: {
      userId,
      courseId,
      isActive: true
    }
  })
  
  if (!courseRole) return false
  
  // If no specific permissions required, any active role is sufficient
  if (requiredPermissions.length === 0) {
    return true
  }
  
  // Check if user has all required permissions
  return requiredPermissions.every(permission => 
    courseRole.permissions.includes(permission)
  )
}