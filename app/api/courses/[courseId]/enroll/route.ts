import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/current-user"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params

    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if course exists and is published
    const course = await db.course.findUnique({
      where: {
        id: courseId,
        isPublished: true
      }
    })

    if (!course) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      )
    }

    // Check if already enrolled
    const existingEnrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId
        }
      }
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { message: "Already enrolled" },
        { status: 400 }
      )
    }

    // For paid courses, check if purchased
    if (course.price && course.price > 0) {
      const purchase = await db.purchase.findUnique({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: courseId
          }
        }
      })

      if (!purchase) {
        return NextResponse.json(
          { message: "Course not purchased. Please purchase first." },
          { status: 403 }
        )
      }
    }

    // Create enrollment
    const enrollment = await db.enrollment.create({
      data: {
        userId: user.id,
        courseId: courseId
      }
    })

    return NextResponse.json(enrollment, { status: 201 })
  } catch (error) {
    console.error("[COURSE_ENROLL_ERROR]", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
