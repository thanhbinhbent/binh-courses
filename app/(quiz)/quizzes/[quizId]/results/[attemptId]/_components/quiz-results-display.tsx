'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, XCircle, Clock, RotateCcw } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import type { QuizAttemptWithQuiz, QuizQuestion, QuizAnswer, QuizOption } from "@/lib/types"

interface QuizResultsDisplayProps {
  attempt: QuizAttemptWithQuiz
  totalQuestions: number
  answeredQuestions: number
  correctAnswers: number
  totalPoints: number
  quizId: string
}

export function QuizResultsDisplay({
  attempt,
  totalQuestions,
  answeredQuestions,
  correctAnswers,
  quizId
}: QuizResultsDisplayProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="mb-4 flex items-center justify-center">
              {attempt.isPassed ? (
                <div className="rounded-full bg-green-100 p-4">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
              ) : (
                <div className="rounded-full bg-red-100 p-4">
                  <XCircle className="h-12 w-12 text-red-600" />
                </div>
              )}
            </div>

            <h1 className="mb-2 text-3xl font-bold">
              {attempt.isPassed ? "Congratulations!" : "Quiz Completed"}
            </h1>

            <p className="text-lg text-muted-foreground">
              {attempt.isPassed
                ? "You have passed this quiz!"
                : `You need ${attempt.quiz.passingScore}% to pass. Keep practicing!`}
            </p>

            <div className="mt-6">
              <div className="text-5xl font-bold">
                {attempt.score?.toFixed(1)}%
              </div>
              <Badge
                variant={attempt.isPassed ? "default" : "destructive"}
                className="mt-2"
              >
                {attempt.isPassed ? "Passed" : "Failed"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Quiz Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Score</p>
                  <p className="text-2xl font-bold">{attempt.score?.toFixed(1)}%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Correct</p>
                  <p className="text-2xl font-bold text-green-600">
                    {correctAnswers}/{totalQuestions}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Questions</p>
                  <p className="text-2xl font-bold">{answeredQuestions}/{totalQuestions}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="text-2xl font-bold">
                    {Math.round(
                      (new Date(attempt.completedAt!).getTime() - 
                       new Date(attempt.startedAt).getTime()) / 60000
                    )} min
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

              <p className="text-sm text-muted-foreground">
                Completed {formatDistanceToNow(new Date(attempt.completedAt!), { addSuffix: true })}
              </p>
            </CardContent>
          </Card>

          {/* Question Review */}
          <Card>
            <CardHeader>
              <CardTitle>Question Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {attempt.quiz.questions.map((question: QuizQuestion, index: number) => {
                const answer = attempt.answers.find((a: QuizAnswer) => a.questionId === question.id)
                const isCorrect = answer?.isCorrect === true
                const isPending = answer?.isCorrect === null

                return (
                  <div key={question.id} className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {isPending ? (
                          <Clock className="h-5 w-5 text-amber-600" />
                        ) : isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <p className="font-semibold">
                            Question {index + 1}
                            <span className="ml-2 text-sm font-normal text-muted-foreground">
                              ({question.points} {question.points === 1 ? "point" : "points"})
                            </span>
                          </p>
                          {isPending && (
                            <Badge variant="outline">Pending Review</Badge>
                          )}
                        </div>

                        <p className="text-sm">{question.question}</p>

                        {/* For multiple choice and true/false */}
                        {(question.type === "MULTIPLE_CHOICE" || question.type === "TRUE_FALSE") && (
                          <div className="space-y-2">
                            {question.options.map((option: QuizOption) => {
                              const isSelected = option.id === answer?.answer
                              const isCorrectOption = option.isCorrect

                              return (
                                <div
                                  key={option.id}
                                  className={`rounded-lg border p-3 ${
                                    isSelected && isCorrectOption
                                      ? "border-green-600 bg-green-50"
                                      : isSelected && !isCorrectOption
                                      ? "border-red-600 bg-red-50"
                                      : isCorrectOption
                                      ? "border-green-600 bg-green-50"
                                      : ""
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    {isCorrectOption && (
                                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    )}
                                    {isSelected && !isCorrectOption && (
                                      <XCircle className="h-4 w-4 text-red-600" />
                                    )}
                                    <span className="text-sm">{option.text}</span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {/* For text answers */}
                        {(question.type === "SHORT_ANSWER" || question.type === "ESSAY") && answer?.answer && (
                          <div className="rounded-lg border bg-muted p-3">
                            <p className="text-sm font-medium">Your Answer:</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {answer.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {index < attempt.quiz.questions.length - 1 && (
                      <Separator />
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-center gap-4">
            <Button asChild variant="outline">
              <Link href="/quizzes">
                Browse More Quizzes
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/quizzes/${quizId}`}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Retake Quiz
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
