import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: { lessonId: string } }
) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    const lesson = await db.lesson.findUnique({
      where: {
        id: params.lessonId,
      },
      include: {
        chapter: {
          select: {
            id: true,
            title: true,
            courseId: true,
            course: {
              select: {
                id: true,
                title: true,
                chapters: {
                  select: {
                    id: true,
                    title: true,
                    position: true,
                    lessons: {
                      select: {
                        id: true,
                        title: true,
                        position: true,
                        type: true,
                        isFree: true,
                        progress: userId ? {
                          where: { userId }
                        } : false,
                      },
                      orderBy: {
                        position: 'asc',
                      },
                    },
                  },
                  orderBy: {
                    position: 'asc',
                  },
                },
              },
            },
          },
        },
        resources: true,
        quizzes: {
          include: {
            questions: {
              include: {
                options: true,
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
        progress: userId ? {
          where: { userId }
        } : false,
      },
    })

    if (!lesson) {
      return new NextResponse('Lesson not found', { status: 404 })
    }

    return NextResponse.json(lesson)
  } catch (error) {
    console.error('[LESSON_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { lessonId: string } }
) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const values = await req.json()

    // Update lesson progress
    const lessonProgress = await db.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId: params.lessonId,
        },
      },
      create: {
        userId,
        lessonId: params.lessonId,
        isCompleted: true,
      },
      update: {
        isCompleted: values.isCompleted,
      },
    })

    return NextResponse.json(lessonProgress)
  } catch (error) {
    console.error('[LESSON_PROGRESS]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}