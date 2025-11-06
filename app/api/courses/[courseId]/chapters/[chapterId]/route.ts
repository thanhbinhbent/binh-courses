import { getCurrentUser } from "@/lib/current-user"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  try {
    const { courseId, chapterId } = await params

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
      where: { id: courseId }
    })

    if (!course) {
      return new NextResponse("Course not found", { status: 404 })
    }

    if (course.instructorId !== user.id && user.role !== "ADMIN") {
      return new NextResponse("Forbidden - Not your course", { status: 403 })
    }

    const body = await req.json()

    // Update chapter
    const chapter = await db.chapter.update({
      where: {
        id: chapterId,
        courseId: courseId
      },
      data: body
    })

    return NextResponse.json(chapter)
  } catch (error) {
    console.error("[CHAPTER_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  try {
    const { courseId, chapterId } = await params

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
      where: { id: courseId }
    })

    if (!course) {
      return new NextResponse("Course not found", { status: 404 })
    }

    if (course.instructorId !== user.id && user.role !== "ADMIN") {
      return new NextResponse("Forbidden - Not your course", { status: 403 })
    }

    // Delete chapter
    await db.chapter.delete({
      where: {
        id: chapterId,
        courseId: courseId
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[CHAPTER_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
