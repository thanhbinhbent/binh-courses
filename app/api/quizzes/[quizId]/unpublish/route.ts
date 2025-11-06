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

    const unpublishedQuiz = await db.quiz.update({
      where: {
        id: quizId
      },
      data: {
        isPublished: false
      }
    })

    return NextResponse.json(unpublishedQuiz)
  } catch (error) {
    console.error("[QUIZ_UNPUBLISH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
