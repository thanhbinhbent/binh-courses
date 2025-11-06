'use client'

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { QuizSettings } from "./_components/quiz-settings"
import { QuestionsList } from "./_components/questions-list"
import { QuizPublishButton } from "./_components/quiz-publish-button"
import { instructorQuizService } from "@/lib/services/instructor-quiz.service"
import type { QuizDetailsResponse } from "@/lib/types/instructor-quiz.types"

export default function QuizEditPage({
  params
}: {
  params: Promise<{ quizId: string }>
}) {
  const { quizId } = use(params)
  const router = useRouter()
  const [data, setData] = useState<QuizDetailsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadQuizData() {
      try {
        setIsLoading(true)
        const result = await instructorQuizService.getQuizWithDetails(quizId)
        setData(result)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        
        // Handle specific errors
        if (errorMessage === 'UNAUTHORIZED') {
          router.push('/sign-in')
        } else if (errorMessage === 'FORBIDDEN' || errorMessage === 'NOT_FOUND') {
          router.push('/instructor/quizzes')
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadQuizData()
  }, [quizId, router])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !data) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-destructive">
            {error === 'NOT_FOUND' ? 'Quiz not found' : 'Failed to load quiz'}
          </p>
          <Button asChild variant="outline">
            <Link href="/instructor/quizzes">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Quizzes
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const { quiz, categories, completion } = data
  const completionText = `(${completion.completed}/${completion.total})`

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/instructor/quizzes">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Quiz Setup</h1>
            <p className="text-sm text-muted-foreground">
              Complete all fields {completionText}
            </p>
          </div>
        </div>

        <QuizPublishButton
          quizId={quiz.id}
          isPublished={quiz.isPublished}
          disabled={!completion.isComplete}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <QuizSettings quiz={quiz} categories={categories} />
        </div>

        <div>
          <QuestionsList quiz={quiz} questions={quiz.questions} />
        </div>
      </div>
    </div>
  )
}
