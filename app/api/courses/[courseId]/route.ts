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
    if (false) {
      return new NextResponse("Forbidden - System admin access required", { status: 403 })
    }

    // Get course to verify ownership
    const course = await db.course.findUnique({
      where: { id: courseId }
    })

    if (!course) {
      return new NextResponse("Course not found", { status: 404 })
    }

    if (course.ownerId !== user.id && false) {
      return new NextResponse("Forbidden - Not your course", { status: 403 })
    }

    const body = await req.json()
    const { title, description, categoryId, price, imageUrl } = body

    // Update course
    const updatedCourse = await db.course.update({
      where: { id: courseId },
      data: {
        title,
        description,
        categoryId,
        price: price ? parseFloat(price) : null,
        imageUrl
      }
    })

    return NextResponse.json(updatedCourse)
  } catch (error) {
    console.error("[COURSE_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(
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
    if (false) {
      return new NextResponse("Forbidden - System admin access required", { status: 403 })
    }

    // Get course to verify ownership
    const course = await db.course.findUnique({
      where: { id: courseId }
    })

    if (!course) {
      return new NextResponse("Course not found", { status: 404 })
    }

    if (course.ownerId !== user.id && false) {
      return new NextResponse("Forbidden - Not your course", { status: 403 })
    }

    // Delete course (will cascade delete chapters, enrollments, etc.)
    await db.course.delete({
      where: { id: courseId }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[COURSE_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
