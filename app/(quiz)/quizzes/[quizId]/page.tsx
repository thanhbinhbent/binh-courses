'use client'

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Clock, Award } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Container } from "@/components/ui/container"
import { PublicLayout } from "@/components/layout/public-layout"
import { StartQuizButton } from "./_components/start-quiz-button"
import { QuizAttemptsList } from "./_components/quiz-attempts-list"
import { quizService } from "@/lib/services/quiz.service"
import type { QuizDetailsResponse } from "@/lib/types"

export default function QuizDetailPage({
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
        const result = await quizService.getQuizDetails(quizId)
        setData(result)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        
        if (errorMessage === 'NOT_FOUND') {
          router.push('/quizzes')
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

  const { quiz, userAttempts, bestScore, totalPoints, user } = data

  return (
    <PublicLayout>
      <Container className="py-8">
        <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-4 flex items-center gap-2">
                {quiz.category && (
                  <Badge variant="secondary">{quiz.category.name}</Badge>
                )}
                {quiz.timeLimit && (
                  <Badge variant="outline">
                    <Clock className="mr-1 h-3 w-3" />
                    {quiz.timeLimit} minutes
                  </Badge>
                )}
              </div>

              <h1 className="mb-4 text-3xl font-bold">{quiz.title}</h1>

              {quiz.description && (
                <p className="mb-4 text-lg text-muted-foreground">
                  {quiz.description}
                </p>
              )}

              {quiz.instructor && (
                <p className="text-sm text-muted-foreground">
                  Created by {quiz.instructor.name}
                </p>
              )}
            </div>
          </div>

        <Separator className="my-8" />
        
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Quiz Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Questions</p>
                    <p className="text-2xl font-bold">{quiz._count?.questions || quiz.questions.length}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Points</p>
                    <p className="text-2xl font-bold">{totalPoints}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Passing Score</p>
                    <p className="text-2xl font-bold">{quiz.passingScore}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Time Limit</p>
                    <p className="text-2xl font-bold">
                      {quiz.timeLimit ? `${quiz.timeLimit} min` : "Unlimited"}
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="mb-2 font-semibold">Question Types</h3>
                  <div className="flex flex-wrap gap-2">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {Array.from(new Set(quiz.questions.map((q: any) => q.type))).map((type: any) => (
                      <Badge key={type} variant="outline">
                        {type.replace(/_/g, " ")}
                      </Badge>
                    ))}
                  </div>
                </div>

                {bestScore !== null && (
                  <>
                    <Separator />
                    <div className="rounded-lg bg-blue-50 p-4">
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-semibold text-blue-900">Your Best Score</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {bestScore.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {user && userAttempts.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Your Attempts</CardTitle>
                </CardHeader>
                <CardContent>
                  <QuizAttemptsList attempts={userAttempts} passingScore={quiz.passingScore} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <Card className="sticky top-4">
              <CardContent className="p-6">
                {user ? (
                  <StartQuizButton quizId={quiz.id} />
                ) : (
                  <Link href="/sign-in">
                    <Button className="w-full" size="lg">
                      Sign In to Take Quiz
                    </Button>
                  </Link>
                )}

                {user && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-2 text-sm">
                      <p className="font-semibold">Your Statistics</p>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Attempts:</span>
                        <span className="font-medium">{userAttempts.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Passed:</span>
                        <span className="font-medium">
                          {userAttempts.filter(a => a.isPassed).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Failed:</span>
                        <span className="font-medium">
                          {userAttempts.filter(a => !a.isPassed && a.completedAt).length}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                <Separator className="my-4" />

                <div className="text-center text-sm text-muted-foreground">
                  <p className="mb-2">
                    <strong>{quiz._count?.attempts || 0}</strong> people have taken this quiz
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </PublicLayout>
  )
}
