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

    // Get all quizzes created by this instructor
    const quizzes = await db.quiz.findMany({
      where: {
        instructorId: user.id
      },
      include: {
        category: true,
        _count: {
          select: {
            questions: true,
            attempts: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json({ quizzes })
  } catch (error) {
    console.error("[INSTRUCTOR_QUIZZES_GET]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
