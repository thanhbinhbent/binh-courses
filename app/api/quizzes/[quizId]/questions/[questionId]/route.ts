import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/current-user"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ quizId: string; questionId: string }> }
) {
  try {
    const { quizId, questionId } = await params

    const user = await getCurrentUser()

    if (!user || user.role !== "INSTRUCTOR") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const quiz = await db.quiz.findUnique({
      where: {
        id: quizId,
        instructorId: user.id
      }
    })

    if (!quiz) {
      return new NextResponse("Not found", { status: 404 })
    }

    const { type, text, points, options } = await req.json()

    // Update question
    const question = await db.question.update({
      where: {
        id: questionId
      },
      data: {
        question: text, // Map 'text' from request to 'question' field
        points
      }
    })

    // Update options if type is MULTIPLE_CHOICE or TRUE_FALSE
    if (type === "MULTIPLE_CHOICE" || type === "TRUE_FALSE") {
      // Delete existing options
      await db.questionOption.deleteMany({
        where: {
          questionId: questionId
        }
      })

      // Create new options
      if (type === "TRUE_FALSE") {
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
    console.error("[QUESTION_ID]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ quizId: string; questionId: string }> }
) {
  try {
    const { quizId, questionId } = await params

    const user = await getCurrentUser()

    if (!user || user.role !== "INSTRUCTOR") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const quiz = await db.quiz.findUnique({
      where: {
        id: quizId,
        instructorId: user.id
      }
    })

    if (!quiz) {
      return new NextResponse("Not found", { status: 404 })
    }

    await db.question.delete({
      where: {
        id: questionId
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[QUESTION_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
