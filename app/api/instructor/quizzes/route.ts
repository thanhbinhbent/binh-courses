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

    // In new system, all authenticated users can manage their own quizzes
    // System admins can see all quizzes
    
    const whereClause = user.globalRoles.includes("SYSTEM_ADMIN") 
      ? {} // System admin sees all quizzes
      : { creatorId: user.id } // Regular users see only their own quizzes

    // Get quizzes based on access level
    const quizzes = await db.quiz.findMany({
      where: whereClause,
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
