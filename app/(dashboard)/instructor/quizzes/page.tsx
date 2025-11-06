'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, PlusCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { QuizzesList } from "./_components/quizzes-list"
import { instructorQuizService } from "@/lib/services/instructor-quiz.service"
import type { QuizWithRelations } from "@/lib/types/instructor-quiz.types"

export default function InstructorQuizzesPage() {
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<QuizWithRelations[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadQuizzesData() {
      try {
        setIsLoading(true)
        const result = await instructorQuizService.getInstructorQuizzes()
        setQuizzes(result.quizzes)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        
        // Handle specific errors
        if (errorMessage === 'UNAUTHORIZED') {
          router.push('/sign-in')
        } else if (errorMessage === 'FORBIDDEN') {
          router.push('/')
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadQuizzesData()
  }, [router])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading quizzes...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-destructive">Failed to load quizzes</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout showBrowseCoursesButton={false}>
      <Container className="py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Your Quizzes</h1>
            <p className="text-sm text-muted-foreground">
              Create and manage quizzes for your students
            </p>
          </div>
          <Button asChild>
            <Link href="/instructor/quizzes/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Quiz
            </Link>
          </Button>
        </div>

        <QuizzesList quizzes={quizzes} />
      </Container>
    </DashboardLayout>
  )
}
