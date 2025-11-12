import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get all published standalone quizzes (public access)
    const quizzes = await db.quiz.findMany({
      where: {
        isPublished: true,
        chapterId: null // Standalone quizzes only
      },
      include: {
        category: true,
        creator: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            questions: true,
            attempts: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    const categories = await db.category.findMany({
      where: {
        quizzes: {
          some: {
            isPublished: true,
            chapterId: null
          }
        }
      },
      orderBy: { name: "asc" }
    })

    return NextResponse.json({ quizzes, categories })
  } catch (error) {
    console.error("[PUBLIC_QUIZZES_GET]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
