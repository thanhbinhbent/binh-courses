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
                userProgress: {
                  where: { userId: user.id }
                }
              }
            }
          }
        },
        userProgress: {
          where: { userId: user.id }
        },
        resources: true
      }
    })

    if (!chapter || !chapter.course) {
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
    const currentIndex = chapter.course.chapters.findIndex((c: { id: string }) => c.id === chapterId)
    const previousChapter = currentIndex > 0 ? chapter.course.chapters[currentIndex - 1] : null
    const nextChapter = currentIndex < chapter.course.chapters.length - 1 
      ? chapter.course.chapters[currentIndex + 1] 
      : null

    const isCompleted = !!chapter.userProgress?.[0]?.isCompleted

    // Calculate course progress
    const completedChapters = chapter.course.chapters.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (c: any) => c.userProgress?.[0]?.isCompleted
    ).length
    const progress = Math.round((completedChapters / chapter.course.chapters.length) * 100)

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
