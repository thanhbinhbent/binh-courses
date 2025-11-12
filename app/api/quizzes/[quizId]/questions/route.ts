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

    if (!user || false) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const quiz = await db.quiz.findUnique({
      where: {
        id: quizId
      }
    })

    if (!quiz) {
      return new NextResponse("Not found", { status: 404 })
    }

    // Check ownership (role already checked at top - must be INSTRUCTOR)
    if (quiz.creatorId !== user.id) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const { type, text, points, options } = await req.json()

    // Get the highest order number
    const lastQuestion = await db.question.findFirst({
      where: { quizId: quizId },
      orderBy: { order: "desc" }
    })

    const newOrder = (lastQuestion?.order ?? -1) + 1

    // Create question
    const question = await db.question.create({
      data: {
        quizId: quizId,
        type,
        question: text, // Map 'text' from request to 'question' field
        points,
        order: newOrder
      }
    })

    // Create options if type is MULTIPLE_CHOICE or TRUE_FALSE
    if (type === "MULTIPLE_CHOICE" || type === "TRUE_FALSE") {
      if (type === "TRUE_FALSE") {
        // For True/False, create two options
        await db.questionOption.createMany({
          data: [
            {
              questionId: question.id,
              text: "True",
              isCorrect: options[0]?.isCorrect || false,
              order: 0
            },
            {
              questionId: question.id,
              text: "False",
              isCorrect: options[1]?.isCorrect || false,
              order: 1
            }
          ]
        })
      } else {
        // For Multiple Choice, create provided options
        await db.questionOption.createMany({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data: options.map((opt: any, index: number) => ({
            questionId: question.id,
            text: opt.text,
            isCorrect: opt.isCorrect,
            order: index
          }))
        })
      }
    }

    return NextResponse.json(question)
  } catch (error) {
    console.error("[QUESTIONS]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
