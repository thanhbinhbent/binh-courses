import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/current-user"
import { db } from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ quizId: string; attemptId: string }> }
) {
  try {
    const { quizId, attemptId } = await params
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
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
                options: true
              }
            }
          }
        },
        answers: true
      }
    })

    if (!attempt) {
      return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
    }

    // If not completed, redirect to take quiz
    if (!attempt.completedAt) {
      return NextResponse.json(
        { 
          error: 'NOT_COMPLETED',
          redirectTo: `/quizzes/${quizId}/take/${attemptId}`
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      attempt,
      totalQuestions: attempt.quiz.questions.length,
      answeredQuestions: attempt.answers.length,
      correctAnswers: attempt.answers.filter((a: { isCorrect: boolean | null }) => a.isCorrect === true).length,
      totalPoints: attempt.quiz.questions.reduce((sum: number, q: { points: number }) => sum + q.points, 0)
    })
  } catch (error) {
    console.error('[QUIZ_RESULTS_GET]', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
