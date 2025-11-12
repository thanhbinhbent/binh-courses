import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/current-user"
import { db } from "@/lib/db"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is enrolled in this course
    const enrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId
        }
      }
    })

    if (!enrollment) {
      return NextResponse.json({ error: "You are not enrolled in this course" }, { status: 404 })
    }

    // Delete enrollment and related progress
    await db.enrollment.delete({
      where: {
        id: enrollment.id
      }
    })

    // Also delete related progress records
    await db.progress.deleteMany({
      where: {
        userId: user.id,
        chapter: {
          courseId: courseId
        }
      }
    })

    // Delete lesson progress
    await db.lessonProgress.deleteMany({
      where: {
        userId: user.id,
        lesson: {
          chapter: {
            courseId: courseId
          }
        }
      }
    })

    return NextResponse.json({ message: "Successfully unenrolled from course" })

  } catch (error) {
    console.error("[COURSE_UNENROLL]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}