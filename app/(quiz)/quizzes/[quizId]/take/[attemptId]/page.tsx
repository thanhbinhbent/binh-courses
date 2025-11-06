'use client'

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { QuizTakingInterface } from "./_components/quiz-taking-interface"
import { quizService } from "@/lib/services/quiz.service"
import type { QuizTakeResponse } from "@/lib/types"

export default function TakeQuizPage({
  params
}: {
  params: Promise<{ quizId: string; attemptId: string }>
}) {
  const { quizId, attemptId } = use(params)
  const router = useRouter()
  const [data, setData] = useState<QuizTakeResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadQuizAttempt() {
      try {
        setIsLoading(true)
        const result = await quizService.getQuizAttempt(quizId, attemptId)
        setData(result)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        
        if (errorMessage === 'UNAUTHORIZED') {
          router.push('/sign-in')
        } else if (errorMessage === 'NOT_FOUND') {
          router.push('/quizzes')
        } else if (errorMessage.startsWith('COMPLETED:')) {
          const redirectUrl = errorMessage.split(':')[1]
          router.push(redirectUrl)
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadQuizAttempt()
  }, [quizId, attemptId, router])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
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
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-destructive">Failed to load quiz</p>
          <Button onClick={() => router.push('/quizzes')} variant="outline">
            Back to Quizzes
          </Button>
        </div>
      </div>
    )
  }

  const { attempt, quiz, questions, existingAnswers } = data

  return (
    <div className="container mx-auto py-6">
      <QuizTakingInterface
        attempt={attempt}
        quiz={quiz}
        questions={questions}
        existingAnswers={existingAnswers}
      />
    </div>
  )
}
