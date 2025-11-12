import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/current-user"

export async function PATCH(
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
        id: quizId,
        creatorId: user.id
      }
    })

    if (!quiz) {
      return new NextResponse("Not found", { status: 404 })
    }

    const { title, description, categoryId, timeLimit, passingScore } = await req.json()

    const updatedQuiz = await db.quiz.update({
      where: {
        id: quizId
      },
      data: {
        title,
        description,
        categoryId,
        timeLimit,
        passingScore
      }
    })

    return NextResponse.json(updatedQuiz)
  } catch (error) {
    console.error("[QUIZ_ID]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(
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
        id: quizId,
        creatorId: user.id
      }
    })

    if (!quiz) {
      return new NextResponse("Not found", { status: 404 })
    }

    await db.quiz.delete({
      where: {
        id: quizId
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[QUIZ_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
