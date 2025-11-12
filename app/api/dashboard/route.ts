import { getCurrentUser } from "@/lib/current-user"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 })
    }

    // Handle different roles
    if (user.globalRoles.includes('SYSTEM_ADMIN')) {
      // System admins can use instructor dashboard for advanced features
      return NextResponse.json({ 
        error: "Use instructor dashboard API", 
        redirectTo: "/instructor" 
      }, { status: 403 })
    }

    // For students, get enrolled courses with progress
    const enrollments = await db.enrollment.findMany({
      where: { userId: user.id },
      include: {
        course: {
          include: {
            chapters: {
              orderBy: { position: "asc" },
              include: {
                lessons: {
                  where: { isPublished: true },
                  orderBy: { position: "asc" },
                  include: {
                    progress: {
                      where: { userId: user.id }
                    }
                  }
                }
              }
            },
            category: true,
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    // Calculate progress for each course based on lessons
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const coursesWithProgress = enrollments.map((enrollment: any) => {
      const course = enrollment.course
      
      // Count total lessons and completed lessons across all chapters
      let totalLessons = 0
      let completedLessons = 0
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      course.chapters.forEach((chapter: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        chapter.lessons.forEach((lesson: any) => {
          totalLessons++
          if (lesson.progress && lesson.progress.length > 0 && lesson.progress[0].isCompleted) {
            completedLessons++
          }
        })
      })

      // Calculate percentage
      const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        imageUrl: course.imageUrl,
        category: course.category?.name,
        progress: progressPercentage,
        totalLessons,
        completedLessons,
        isCompleted: progressPercentage === 100,
        enrolledAt: enrollment.createdAt,
      }
    })

    // Separate in-progress and completed courses
    const inProgressCourses = coursesWithProgress.filter(course => course.progress > 0 && course.progress < 100)
    const completedCourses = coursesWithProgress.filter(course => course.progress === 100)

    // Get certificates count
    const certificatesCount = await db.certificate.count({
      where: { userId: user.id }
    })

    // Prepare stats
    const stats = {
      totalCourses: coursesWithProgress.length,
      inProgressCount: inProgressCourses.length,
      completedCount: completedCourses.length,
      certificatesCount,
      totalLessons: coursesWithProgress.reduce((sum, course) => sum + course.totalLessons, 0),
      completedLessons: coursesWithProgress.reduce((sum, course) => sum + course.completedLessons, 0)
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        globalRoles: user.globalRoles
      },
      enrollments,
      inProgressCourses,
      completedCourses,
      stats
    })

  } catch (error) {
    console.error("Dashboard API Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}