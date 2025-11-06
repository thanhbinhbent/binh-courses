import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/current-user"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params
    const user = await getCurrentUser()
    
    const course = await db.course.findUnique({
      where: { 
        id: courseId,
        isPublished: true
      },
      include: {
        category: true,
        instructor: {
          select: {
            name: true,
            image: true,
            bio: true
          }
        },
        chapters: {
          where: { isPublished: true },
          orderBy: { position: "asc" },
          include: {
            lessons: {
              where: { isPublished: true },
              orderBy: { position: "asc" },
              include: {
                progress: user ? {
                  where: { userId: user.id }
                } : false
              }
            }
          }
        },
        _count: {
          select: {
            enrollments: true,
            reviews: true
          }
        }
      }
    })

    if (!course) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 })
    }

    // Check if user is enrolled
    const enrollment = user ? await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: course.id
        }
      }
    }) : null

    // Get reviews
    const reviews = await db.review.findMany({
      where: {
        courseId: course.id
      },
      include: {
        user: {
          select: {
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    // Calculate average rating
    const averageRating = reviews.length > 0
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length
      : 0

    // Check if user has reviewed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userReview = user ? reviews.find((r: any) => r.userId === user.id) : null

    // Calculate progress if enrolled
    let progress = 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const courseWithChapters = course as any
    if (enrollment && courseWithChapters.chapters && courseWithChapters.chapters.length > 0) {
      // Count total lessons across all chapters
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const totalLessons = courseWithChapters.chapters.reduce((acc: number, chapter: any) => acc + (chapter.lessons?.length || 0), 0)
      
      if (totalLessons > 0) {
        // Count completed lessons
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const completedLessons = courseWithChapters.chapters.reduce((acc: number, chapter: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const chapterCompleted = chapter.lessons?.filter((lesson: any) => 
            lesson.progress && lesson.progress.length > 0 && lesson.progress[0].isCompleted
          ).length || 0
          return acc + chapterCompleted
        }, 0)
        
        progress = Math.round((completedLessons / totalLessons) * 100)
      }
    }

    return NextResponse.json({
      course,
      enrollment,
      isEnrolled: !!enrollment,
      isFree: !course.price || course.price === 0,
      reviews,
      averageRating,
      userReview,
      progress,
      user: user ? { id: user.id, name: user.name, email: user.email } : null
    })
  } catch (error) {
    console.error("[COURSE_DETAIL_GET]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
