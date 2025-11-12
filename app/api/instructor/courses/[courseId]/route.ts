import { getCurrentUser } from "@/lib/current-user"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params
    const user = await getCurrentUser()

    // Check authentication and role
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Fetch course with all related data first
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        chapters: {
          orderBy: { position: "asc" }
        },
        category: true,
        _count: {
          select: { enrollments: true }
        }
      }
    })

    if (!course) {
      return new NextResponse("Course not found", { status: 404 })
    }

    // Check access: System admin or course owner or user with instructor role in this course
    const hasAccess = user.globalRoles.includes("SYSTEM_ADMIN") || course.ownerId === user.id

    if (!hasAccess) {
      // Check if user has instructor role in this course
      const courseRole = await db.courseRole.findFirst({
        where: {
          userId: user.id,
          courseId: courseId,
          role: { in: ['INSTRUCTOR', 'TEACHING_ASSISTANT'] },
          isActive: true,
          permissions: { has: 'MANAGE_CONTENT' }
        }
      })

      if (!courseRole) {
        return new NextResponse("Forbidden - No access to this course", { status: 403 })
      }
    }

    // Fetch categories for course settings
    const categories = await db.category.findMany({
      orderBy: { name: "asc" }
    })

    // Calculate completion status
    const isComplete = !!(
      course.title &&
      course.description &&
      course.imageUrl &&
      course.categoryId &&
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      course.chapters.some((chapter: any) => chapter.isPublished)
    )

    return NextResponse.json({
      course,
      categories,
      isComplete
    })
  } catch (error) {
    console.error("[INSTRUCTOR_COURSE_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
