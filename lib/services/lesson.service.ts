import { db } from '@/lib/db'

export const LessonService = {
  async getLessonsByChapterId(chapterId: string) {
    return await db.lesson.findMany({
      where: { chapterId },
      orderBy: { position: 'asc' },
      include: {
        resources: true,
        quizzes: true,
      },
    })
  },

  async getLessonById(lessonId: string, userId?: string) {
    return await db.lesson.findUnique({
      where: { id: lessonId },
      include: {
        resources: true,
        quizzes: {
          include: {
            questions: {
              include: {
                options: true,
              },
            },
          },
        },
        progress: userId ? {
          where: { userId },
        } : false,
        chapter: {
          select: {
            id: true,
            title: true,
            courseId: true,
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    })
  },

  async updateLessonProgress(lessonId: string, userId: string, isCompleted: boolean) {
    const existingProgress = await db.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
    })

    if (existingProgress) {
      return await db.lessonProgress.update({
        where: {
          userId_lessonId: {
            userId,
            lessonId,
          },
        },
        data: { isCompleted },
      })
    }

    return await db.lessonProgress.create({
      data: {
        userId,
        lessonId,
        isCompleted,
      },
    })
  },

  async getChapterProgress(chapterId: string, userId: string) {
    const lessons = await db.lesson.findMany({
      where: { chapterId },
      include: {
        progress: {
          where: { userId },
        },
      },
    })

    const completedLessons = lessons.filter(
      (lesson) => lesson.progress.some((p) => p.isCompleted)
    )

    return {
      totalLessons: lessons.length,
      completedLessons: completedLessons.length,
      progress: lessons.length > 0 ? (completedLessons.length / lessons.length) * 100 : 0,
    }
  },
}