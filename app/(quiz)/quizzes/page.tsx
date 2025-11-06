'use client'

import { useEffect, useState } from "react"
import { Loader2, BookOpen, Clock, Award } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"
import { PublicLayout } from "@/components/layout/public-layout"
import { quizService } from "@/lib/services/quiz.service"
import type { QuizzesListResponse } from "@/lib/types"

export default function QuizzesPage() {
  const [data, setData] = useState<QuizzesListResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadQuizzesData() {
      try {
        setIsLoading(true)
        const result = await quizService.getQuizzes()
        setData(result)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    loadQuizzesData()
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading quizzes...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !data) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-destructive">Failed to load quizzes</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  const { quizzes, categories } = data

  return (
    <PublicLayout>

      <Container className="py-8">
        {/* Page Header */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Practice Quizzes</h1>
          <p className="text-muted-foreground max-w-2xl">
            Test your knowledge with our comprehensive quiz library across various subjects and difficulty levels
          </p>
        </div>
        
        {/* Categories */}
        {categories.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-foreground">Browse by Category</h2>
            <div className="flex flex-wrap gap-2">
              <Link href="/quizzes">
                <Badge variant="default" className="cursor-pointer px-4 py-2 text-sm hover:bg-primary/90 transition-colors">
                  All Quizzes
                </Badge>
              </Link>
              {categories.map((category) => (
                <Link key={category.id} href={`/quizzes?category=${category.slug || category.id}`}>
                  <Badge variant="outline" className="cursor-pointer px-4 py-2 text-sm hover:bg-secondary transition-colors">
                    {category.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quiz Grid */}
        {quizzes.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <BookOpen className="h-12 w-12 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">No quizzes available yet</h3>
              <p className="text-center text-muted-foreground max-w-md">
                We&apos;re working hard to bring you amazing practice quizzes. Check back soon!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="group transition-all hover:shadow-lg hover:scale-[1.02] border-border bg-card">
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      {/* Standalone quiz category */}
                      {quiz.category && (
                        <Badge variant="secondary" className="text-xs w-fit">
                          {quiz.category.name}
                        </Badge>
                      )}
                      {/* Course-related quiz */}
                      {quiz.chapter?.course && (
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className="text-xs w-fit">
                            {quiz.chapter.course.title}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Chapter: {quiz.chapter.title}
                          </span>
                        </div>
                      )}
                    </div>
                    {quiz.timeLimit && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{quiz.timeLimit} min</span>
                      </div>
                    )}
                  </div>

                  <CardTitle className="line-clamp-2 text-lg">
                    {quiz.title}
                  </CardTitle>

                  {/* Show instructor from quiz directly or from course */}
                  {(quiz.instructor?.name || quiz.chapter?.course?.instructor?.name) && (
                    <p className="text-sm text-muted-foreground">
                      by {quiz.instructor?.name || quiz.chapter?.course?.instructor?.name}
                    </p>
                  )}
                </CardHeader>

                <CardContent>
                  {quiz.description && (
                    <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                      {quiz.description}
                    </p>
                  )}

                  <div className="mb-4 space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>Questions:</span>
                      <span className="font-medium">{quiz._count?.questions || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Passing Score:</span>
                      <span className="font-medium">{quiz.passingScore}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Attempts:</span>
                      <span className="font-medium">{quiz._count?.attempts || 0}</span>
                    </div>
                  </div>

                  <Link href={`/quizzes/${quiz.id}`} className="block">
                    <Button className="w-full">
                      <Award className="mr-2 h-4 w-4" />
                      Start Quiz
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </PublicLayout>
  )
}
