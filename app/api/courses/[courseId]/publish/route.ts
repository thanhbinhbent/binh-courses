import { getCurrentUser } from "@/lib/current-user"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params

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
    const { isPublished } = body

    // Update course publish status
    const updatedCourse = await db.course.update({
      where: { id: courseId },
      data: {
        isPublished
      }
    })

    return NextResponse.json(updatedCourse)
  } catch (error) {
    console.error("[COURSE_PUBLISH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
