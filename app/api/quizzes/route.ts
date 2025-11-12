import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/current-user"



export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user || false) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { title, description, categoryId, timeLimit, passingScore } = await req.json()

    const quiz = await db.quiz.create({
      data: {
        title,
        description,
        categoryId,
        creatorId: user.id,
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
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') // 'instructor' or 'public'

    // If requesting instructor quizzes
    if (type === 'instructor') {
      if (!user || false) {
        return new NextResponse("Unauthorized", { status: 401 })
      }

      const quizzes = await db.quiz.findMany({
        where: {
          creatorId: user.id
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
    }

    // Public access - get all published quizzes (standalone or course-related)
    const quizzes = await db.quiz.findMany({
      where: { isPublished: true },
      include: {
        // For quizzes that are part of a course chapter
        chapter: {
          select: {
            title: true,
            course: {
              select: {
                title: true,
                owner: {
                  select: {
                    name: true,
                    image: true,
                  }
                }
              }
            }
          }
        },
        // For standalone quizzes
        category: {
          select: {
            name: true,
            slug: true
          }
        },
        // Quiz instructor (for both standalone and course quizzes)
        creator: {
          select: {
            name: true,
            image: true,
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

    // Get all categories that have quizzes (standalone or through courses)
    const categories = await db.category.findMany({
      where: {
        OR: [
          {
            quizzes: {
              some: {
                isPublished: true
              }
            }
          },
          {
            courses: {
              some: {
                chapters: {
                  some: {
                    quizzes: {
                      some: {
                        isPublished: true
                      }
                    }
                  }
                }
              }
            }
          }
        ]
      },
      orderBy: { name: "asc" }
    })

    return NextResponse.json({ quizzes, categories })
  } catch (error) {
    console.error("[QUIZZES]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
