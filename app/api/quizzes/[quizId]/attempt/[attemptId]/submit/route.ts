import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/current-user"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ quizId: string; attemptId: string }> }
) {
  try {
    const { quizId, attemptId } = await params

    const user = await getCurrentUser()

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Verify attempt belongs to user
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
      return new NextResponse("Attempt not found", { status: 404 })
    }

    // Check if already completed
    if (attempt.completedAt) {
      return new NextResponse("Attempt already completed", { status: 400 })
    }

    // Calculate score for auto-gradable questions
    let totalPoints = 0
    let earnedPoints = 0

    for (const question of attempt.quiz.questions) {
      totalPoints += question.points

      // Only grade MULTIPLE_CHOICE and TRUE_FALSE automatically
      if (question.type === "MULTIPLE_CHOICE" || question.type === "TRUE_FALSE") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const answer = attempt.answers.find((a: any) => a.questionId === question.id)
        
        if (answer?.answer) {
          const selectedOption = question.options.find(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (opt: any) => opt.id === answer.answer
          )
          
          if (selectedOption?.isCorrect) {
            earnedPoints += question.points

            // Mark answer as correct
            await db.answer.update({
              where: { id: answer.id },
              data: { 
                isCorrect: true,
                points: question.points
              }
            })
          } else {
            await db.answer.update({
              where: { id: answer.id },
              data: { 
                isCorrect: false,
                points: 0
              }
            })
          }
        }
      }
      // SHORT_ANSWER and ESSAY require manual grading
      else if (question.type === "SHORT_ANSWER" || question.type === "ESSAY") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const answer = attempt.answers.find((a: any) => a.questionId === question.id)
        
        if (answer) {
          await db.answer.update({
            where: { id: answer.id },
            data: { 
              isCorrect: null, // Null means pending manual review
              points: 0
            }
          })
        }
      }
    }

    // Calculate score percentage
    const scorePercentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0

    // Determine if passed
    const isPassed = scorePercentage >= attempt.quiz.passingScore

    // Update attempt
    const updatedAttempt = await db.quizAttempt.update({
      where: { id: attemptId },
      data: {
        completedAt: new Date(),
        score: scorePercentage,
        isPassed
      }
    })

    return NextResponse.json(updatedAttempt)
  } catch (error) {
    console.error("[SUBMIT_QUIZ]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
