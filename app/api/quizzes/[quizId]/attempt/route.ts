import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/current-user"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { quizId } = await params

    const user = await getCurrentUser()

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check if quiz exists and is published
    const quiz = await db.quiz.findUnique({
      where: {
        id: quizId,
        isPublished: true
      }
    })

    if (!quiz) {
      return new NextResponse("Quiz not found", { status: 404 })
    }

    // Create quiz attempt
    const attempt = await db.quizAttempt.create({
      data: {
        userId: user.id,
        quizId: quizId,
        startedAt: new Date()
      }
    })

    return NextResponse.json({ attemptId: attempt.id })
  } catch (error) {
    console.error("[QUIZ_ATTEMPT]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
