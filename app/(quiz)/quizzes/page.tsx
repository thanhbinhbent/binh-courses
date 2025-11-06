'use client'

import { useEffect, useState } from "react"
import { Loader2, BookOpen, Clock, Award, Filter } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-8">
          <h1 className="mb-2 text-3xl font-bold">Practice Quizzes</h1>
          <p className="text-muted-foreground">
            Test your knowledge with our comprehensive quiz library
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="mb-8 flex items-center gap-4">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <div className="flex flex-wrap gap-2">
            <Link href="/quizzes">
              <Badge variant="default" className="cursor-pointer">
                All
              </Badge>
            </Link>
            {categories.map((category) => (
              <Link key={category.id} href={`/quizzes?category=${category.slug || category.id}`}>
                <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                  {category.name}
                </Badge>
              </Link>
            ))}
          </div>
        </div>

        {/* Quiz Grid */}
        {quizzes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No quizzes available yet</h3>
              <p className="text-center text-muted-foreground">
                Check back later for new practice quizzes
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between">
                    {quiz.category && (
                      <Badge variant="secondary" className="text-xs">
                        {quiz.category.name}
                      </Badge>
                    )}
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

                  {quiz.instructor && (
                    <p className="text-sm text-muted-foreground">
                      by {quiz.instructor.name}
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
      </div>
    </div>
  )
}
