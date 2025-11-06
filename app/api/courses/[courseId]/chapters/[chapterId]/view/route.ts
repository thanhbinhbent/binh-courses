import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/current-user"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  try {
    const { courseId, chapterId } = await params
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 })
    }

    // Get chapter with course info
    const chapter = await db.chapter.findUnique({
      where: {
        id: chapterId,
        courseId: courseId
      },
      include: {
        course: {
          include: {
            chapters: {
              where: { isPublished: true },
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
            }
          }
        },
        lessons: {
          where: { isPublished: true },
          orderBy: { position: "asc" },
          include: {
            progress: {
              where: { userId: user.id }
            }
          }
        },
        resources: true
      }
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chapterWithCourse = chapter as any
    if (!chapter || !chapterWithCourse.course) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 })
    }

    // Check if user is enrolled or chapter is free
    const enrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId
        }
      }
    })

    const isEnrolled = !!enrollment
    const canAccess = isEnrolled || chapter.isFree

    if (!canAccess) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 })
    }

    // Get current chapter index and navigation
    const currentIndex = chapterWithCourse.course.chapters.findIndex((c: { id: string }) => c.id === chapterId)
    const previousChapter = currentIndex > 0 ? chapterWithCourse.course.chapters[currentIndex - 1] : null
    const nextChapter = currentIndex < chapterWithCourse.course.chapters.length - 1 
      ? chapterWithCourse.course.chapters[currentIndex + 1] 
      : null

    // Calculate chapter completion based on lessons
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chapterLessons = (chapterWithCourse as any).lessons || []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const completedLessons = chapterLessons.filter((lesson: any) => 
      lesson.progress && lesson.progress.length > 0 && lesson.progress[0].isCompleted
    ).length
    const isCompleted = chapterLessons.length > 0 && completedLessons === chapterLessons.length

    // Calculate course progress based on lessons
    let totalLessons = 0
    let totalCompletedLessons = 0
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chapterWithCourse.course.chapters.forEach((c: any) => {
      const lessons = c.lessons || []
      totalLessons += lessons.length
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      totalCompletedLessons += lessons.filter((l: any) => 
        l.progress && l.progress.length > 0 && l.progress[0].isCompleted
      ).length
    })
    
    const progress = totalLessons > 0 ? Math.round((totalCompletedLessons / totalLessons) * 100) : 0

    return NextResponse.json({
      chapter,
      isEnrolled,
      canAccess,
      currentIndex,
      previousChapter,
      nextChapter,
      isCompleted,
      progress
    })
  } catch (error) {
    console.error("[CHAPTER_VIEW_GET]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
