import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/current-user"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ quizId: string; attemptId: string }> }
) {
  try {
    const { quizId, attemptId } = await params
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 })
    }

    const attempt = await db.quizAttempt.findUnique({
      where: {
        id: attemptId,
        userId: user.id,
        quizId: quizId
      },
      include: {
        quiz: {
          include: {
            questions: {
              orderBy: { order: "asc" },
              include: {
                options: {
                  orderBy: { order: "asc" }
                }
              }
            }
          }
        },
        answers: true
      }
    })

    if (!attempt) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 })
    }

    // If already completed, return redirect info
    if (attempt.completedAt) {
      return NextResponse.json({ 
        error: "COMPLETED",
        redirectTo: `/quizzes/${quizId}/results/${attemptId}`
      }, { status: 400 })
    }

    return NextResponse.json({
      attempt,
      quiz: attempt.quiz,
      questions: attempt.quiz.questions,
      existingAnswers: attempt.answers
    })
  } catch (error) {
    console.error("[QUIZ_TAKE_GET]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
