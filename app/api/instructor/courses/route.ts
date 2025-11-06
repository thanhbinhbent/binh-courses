import { getCurrentUser } from "@/lib/current-user"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const user = await getCurrentUser()

    // Check authentication
    if (!user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 })
    }

    // Check authorization
    if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 })
    }

    // Get all courses created by this instructor
    const courses = await db.course.findMany({
      where: {
        instructorId: user.id
      },
      include: {
        _count: {
          select: {
            enrollments: true,
            chapters: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    // Calculate stats
    const totalStudents = courses.reduce(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (acc: number, course: any) => acc + course._count.enrollments,
      0
    )
    const totalRevenue = courses.reduce(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (acc: number, course: any) => acc + (course.price || 0) * course._count.enrollments,
      0
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const publishedCount = courses.filter((c: any) => c.isPublished).length

    return NextResponse.json({
      courses,
      stats: {
        totalCourses: courses.length,
        publishedCount,
        totalStudents,
        totalRevenue
      }
    })
  } catch (error) {
    console.error("[INSTRUCTOR_COURSES_GET]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
