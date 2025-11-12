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
      },
      include: {
        questions: true
      }
    })

    if (!quiz) {
      return new NextResponse("Not found", { status: 404 })
    }

    if (!quiz.title || !quiz.categoryId || quiz.questions.length === 0) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const publishedQuiz = await db.quiz.update({
      where: {
        id: quizId
      },
      data: {
        isPublished: true
      }
    })

    return NextResponse.json(publishedQuiz)
  } catch (error) {
    console.error("[QUIZ_PUBLISH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
