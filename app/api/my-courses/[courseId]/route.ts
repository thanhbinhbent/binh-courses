import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/current-user"
import { db } from "@/lib/db"

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if course exists and user owns it
    const course = await db.course.findUnique({
      where: {
        id: courseId,
        ownerId: user.id
      }
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found or you don't have permission" }, { status: 404 })
    }

    // Delete course (this will cascade delete related records)
    await db.course.delete({
      where: {
        id: courseId
      }
    })

    return NextResponse.json({ message: "Course deleted successfully" })

  } catch (error) {
    console.error("[COURSE_DELETE]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}