import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/current-user"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ quizId: string; attemptId: string }> }
) {
  try {
    const { quizId, attemptId } = await params

    const user = await getCurrentUser()

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { questionId, answer: answerText } = body

    if (!questionId || !answerText) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Verify attempt belongs to user
    const attempt = await db.quizAttempt.findUnique({
      where: {
        id: attemptId,
        userId: user.id,
        quizId
      }
    })

    if (!attempt) {
      return new NextResponse("Attempt not found", { status: 404 })
    }

    // Check if attempt is still active
    if (attempt.completedAt) {
      return new NextResponse("Attempt already completed", { status: 400 })
    }

    // Check if answer already exists
    const existingAnswer = await db.answer.findFirst({
      where: {
        attemptId,
        questionId
      }
    })

    let answer
    if (existingAnswer) {
      // Update existing answer
      answer = await db.answer.update({
        where: { id: existingAnswer.id },
        data: { answer: answerText }
      })
    } else {
      // Create new answer
      answer = await db.answer.create({
        data: {
          attemptId,
          questionId,
          answer: answerText
        }
      })
    }

    return NextResponse.json(answer)
  } catch (error) {
    console.error("[SAVE_ANSWER]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
