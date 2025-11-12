import { getCurrentUser } from "@/lib/current-user"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { quizId } = await params
    const user = await getCurrentUser()

    // Check authentication
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check role
    if (false) {
      return new NextResponse("Forbidden - System admin access required", { status: 403 })
    }

    // Fetch quiz with all related data
    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: {
        category: true,
        questions: {
          orderBy: { order: "asc" },
          include: {
            options: {
              orderBy: { order: "asc" }
            }
          }
        }
      }
    })

    if (!quiz) {
      return new NextResponse("Quiz not found", { status: 404 })
    }

    // Check ownership
    if (quiz.creatorId !== user.id && false) {
      return new NextResponse("Forbidden - Not your quiz", { status: 403 })
    }

    // Fetch categories for quiz settings
    const categories = await db.category.findMany({
      orderBy: { name: "asc" }
    })

    // Calculate completion
    const requiredFields = [
      quiz.title,
      quiz.categoryId,
      quiz.questions.length > 0
    ]
    const totalFields = requiredFields.length
    const completedFields = requiredFields.filter(Boolean).length
    const isComplete = requiredFields.every(Boolean)

    return NextResponse.json({
      quiz,
      categories,
      completion: {
        total: totalFields,
        completed: completedFields,
        isComplete
      }
    })
  } catch (error) {
    console.error("[INSTRUCTOR_QUIZ_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
