import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { VideoPlayer } from '@/components/ui/video-player'
import { LessonProgress } from '@/components/lessons/lesson-progress'
import { LessonResources } from '@/components/lessons/lesson-resources'
import { LessonQuizzes } from '@/components/lessons/lesson-quizzes'
import { CourseSidebar } from '@/components/course/course-sidebar'
import { Separator } from '@/components/ui/separator'
import { db } from '@/lib/db'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'

interface LessonIdPageProps {
  params: {
    courseId: string
    chapterId: string
    lessonId: string
  }
}

const LessonIdPage = async ({
  params
}: LessonIdPageProps) => {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return redirect('/')
  }

  const lesson = await db.lesson.findUnique({
    where: {
      id: params.lessonId,
    },
    include: {
      chapter: {
        include: {
          course: true,
        },
      },
      progress: {
        where: {
          userId,
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
    },
  })

  if (!lesson) {
    return redirect('/')
  }

  const isCompleted = lesson.progress?.[0]?.isCompleted

  return (
    <div className="flex h-screen">
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-4 text-2xl font-bold">
            {lesson.title}
          </h1>
          
          {lesson.type === 'VIDEO' && lesson.videoUrl && (
            <div className="mb-4 aspect-video overflow-hidden rounded-lg">
              <VideoPlayer
                videoUrl={lesson.videoUrl}
                courseId={params.courseId}
                chapterId={params.chapterId}
                lessonId={lesson.id}
                isCompleted={isCompleted}
                title={lesson.title}
              />
            </div>
          )}

          {lesson.type === 'ARTICLE' && lesson.content && (
            <div className="prose prose-sm dark:prose-invert max-w-none mb-4">
              <MarkdownRenderer content={lesson.content} />
            </div>
          )}

          <LessonProgress
            lessonId={lesson.id}
            courseId={params.courseId}
            chapterId={params.chapterId}
            isCompleted={isCompleted}
          />

          <Separator className="my-4" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LessonResources resources={lesson.resources} />
            <LessonQuizzes 
              quizzes={lesson.quizzes}
              courseId={params.courseId}
              chapterId={params.chapterId}
            />
          </div>
        </div>
      </div>

      {lesson.chapter.course && (
        <CourseSidebar 
          course={lesson.chapter.course}
          currentChapterId={params.chapterId}
          currentLessonId={lesson.id}
          isEnrolled={true} // TODO: Check enrollment status
        />
      )}
    </div>
  )
}

export default LessonIdPage