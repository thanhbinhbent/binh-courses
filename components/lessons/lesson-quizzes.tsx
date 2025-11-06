import { Quiz } from '@prisma/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface LessonQuizzesProps {
  quizzes: Quiz[]
  courseId: string
  chapterId: string
}

export const LessonQuizzes = ({
  quizzes,
  courseId,
  chapterId,
}: LessonQuizzesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          Practice Quizzes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {quizzes.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No quizzes available for this lesson.
          </p>
        )}
        <div className="space-y-2">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <h4 className="font-medium">{quiz.title}</h4>
                {quiz.description && (
                  <p className="text-sm text-muted-foreground">
                    {quiz.description}
                  </p>
                )}
              </div>
              <Button
                asChild
                variant="secondary"
                size="sm"
              >
                <Link
                  href={`/courses/${courseId}/chapters/${chapterId}/quizzes/${quiz.id}`}
                >
                  Start Quiz
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}