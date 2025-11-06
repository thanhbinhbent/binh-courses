import { getCurrentUser } from "@/lib/current-user"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check if user is instructor or admin
    if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN") {
      return new NextResponse("Forbidden - Instructor access required", { status: 403 })
    }

    // Get course to verify ownership
    const course = await db.course.findUnique({
      where: { id: params.courseId }
    })

    if (!course) {
      return new NextResponse("Course not found", { status: 404 })
    }

    if (course.instructorId !== user.id && user.role !== "ADMIN") {
      return new NextResponse("Forbidden - Not your course", { status: 403 })
    }

    const body = await req.json()
    const { title } = body

    if (!title) {
      return new NextResponse("Title is required", { status: 400 })
    }

    // Get last chapter position
    const lastChapter = await db.chapter.findFirst({
      where: { courseId: params.courseId },
      orderBy: { position: "desc" }
    })

    const newPosition = lastChapter ? lastChapter.position + 1 : 0

    // Create chapter
    const chapter = await db.chapter.create({
      data: {
        title,
        courseId: params.courseId,
        position: newPosition,
        isPublished: false,
        isFree: false
      }
    })

    return NextResponse.json(chapter)
  } catch (error) {
    console.error("[CHAPTERS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
