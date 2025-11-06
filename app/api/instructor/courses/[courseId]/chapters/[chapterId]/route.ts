import { getCurrentUser } from "@/lib/current-user"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  try {
    const { courseId, chapterId } = await params
    const user = await getCurrentUser()

    // Check authentication and role
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN") {
      return new NextResponse("Forbidden - Instructor access required", { status: 403 })
    }

    // Fetch chapter with course
    const chapter = await db.chapter.findUnique({
      where: {
        id: chapterId,
        courseId: courseId
      },
      include: {
        course: true,
        resources: true
      }
    })

    if (!chapter) {
      return new NextResponse("Chapter not found", { status: 404 })
    }

    // Check ownership
    if (chapter.course.instructorId !== user.id && user.role !== "ADMIN") {
      return new NextResponse("Forbidden - Not your course", { status: 403 })
    }

    // Calculate completion
    const requiredFields = [
      chapter.title,
      chapter.description,
      chapter.videoUrl
    ]
    const totalFields = requiredFields.length
    const completedFields = requiredFields.filter(Boolean).length

    return NextResponse.json({
      chapter,
      completion: {
        total: totalFields,
        completed: completedFields
      }
    })
  } catch (error) {
    console.error("[INSTRUCTOR_CHAPTER_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
