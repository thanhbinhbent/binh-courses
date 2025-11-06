import { getCurrentUser } from "@/lib/current-user"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 })
    }

    // Get enrolled courses with progress
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
        const lessons = chapter.lessons || []
        totalLessons += lessons.length
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        completedLessons += lessons.filter((lesson: any) => 
          lesson.progress && lesson.progress.length > 0 && lesson.progress[0].isCompleted
        ).length
      })
      
      const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

      return {
        ...course,
        progress: Math.round(progress),
        completedLessons,
        totalLessons
      }
    })

    const inProgressCourses = coursesWithProgress.filter((c: { progress: number }) => c.progress > 0 && c.progress < 100)
    const completedCourses = coursesWithProgress.filter((c: { progress: number }) => c.progress === 100)

    // Get certificates
    const certificates = await db.certificate.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5
    })

    return NextResponse.json({
      enrollments,
      coursesWithProgress,
      inProgressCourses,
      completedCourses,
      certificates,
      stats: {
        totalCourses: enrollments.length,
        inProgress: inProgressCourses.length,
        completed: completedCourses.length,
        certificatesCount: certificates.length
      },
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    console.error("[STUDENT_DASHBOARD_GET]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
