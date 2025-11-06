import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/current-user"

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "INSTRUCTOR") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { title, description, categoryId, timeLimit, passingScore } = await req.json()

    const quiz = await db.quiz.create({
      data: {
        title,
        description,
        categoryId,
        instructorId: user.id,
        timeLimit,
        passingScore,
        isPublished: false
      }
    })

    return NextResponse.json(quiz)
  } catch (error) {
    console.error("[QUIZZES]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "INSTRUCTOR") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const quizzes = await db.quiz.findMany({
      where: {
        instructorId: user.id
      },
      include: {
        category: true,
        _count: {
          select: {
            questions: true,
            attempts: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(quizzes)
  } catch (error) {
    console.error("[QUIZZES]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
