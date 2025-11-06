import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/current-user"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { quizId } = await params
    const user = await getCurrentUser()

    const quiz = await db.quiz.findUnique({
      where: {
        id: quizId,
        isPublished: true
      },
      include: {
        category: true,
        instructor: {
          select: {
            name: true,
            image: true
          }
        },
        questions: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            type: true,
            points: true
          }
        },
        _count: {
          select: {
            questions: true,
            attempts: true
          }
        }
      }
    })

    if (!quiz) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 })
    }

    // Get user's attempts if logged in
    const userAttempts = user ? await db.quizAttempt.findMany({
      where: {
        userId: user.id,
        quizId: quiz.id
      },
      orderBy: { startedAt: "desc" },
      take: 5
    }) : []

    const bestScore = userAttempts.length > 0 
      ? Math.max(...userAttempts.map((a: { score: number | null }) => a.score || 0))
      : null

    const totalPoints = quiz.questions.reduce((sum: number, q: { points: number }) => sum + q.points, 0)

    return NextResponse.json({
      quiz,
      userAttempts,
      bestScore,
      totalPoints,
      user: user ? { id: user.id, name: user.name, email: user.email } : null
    })
  } catch (error) {
    console.error("[QUIZ_DETAIL_GET]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
