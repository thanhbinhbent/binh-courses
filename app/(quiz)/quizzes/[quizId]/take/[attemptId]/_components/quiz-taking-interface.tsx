"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { Clock, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react"
import { QuestionDisplay } from "./question-display"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { quizService } from "@/lib/services"

interface Answer {
  id: string
  questionId: string
  answer: string // Can be optionId for multiple choice, or text for open-ended
  isCorrect: boolean | null
  points: number
}

interface QuizTakingInterfaceProps {
  attempt: {
    id: string
    startedAt: Date
  }
  quiz: {
    id: string
    title: string
    timeLimit: number | null
  }
  questions: Array<{
    id: string
    type: string
    question: string // Changed from 'text' to 'question'
    order: number
    points: number
    options: Array<{
      id: string
      text: string
      order: number
    }>
  }>
  existingAnswers: Answer[]
}

export function QuizTakingInterface({
  attempt,
  quiz,
  questions,
  existingAnswers
}: QuizTakingInterfaceProps) {
  const router = useRouter()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Map<string, Answer>>(
    new Map(existingAnswers.map(a => [a.questionId, a]))
  )
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)

  const currentQuestion = questions[currentQuestionIndex]

  const handleAnswerChange = async (
    questionId: string,
    answer: { selectedOptionId?: string; textAnswer?: string }
  ) => {
    const newAnswer: Answer = {
      id: answers.get(questionId)?.id || "",
      questionId,
      answer: answer.selectedOptionId || answer.textAnswer || "",
      isCorrect: null,
      points: 0
    }

    setAnswers(new Map(answers.set(questionId, newAnswer)))

    // Auto-save answer
    try {
      await quizService.saveQuizAnswers(quiz.id, attempt.id, [{
        questionId,
        answer: answer.selectedOptionId || answer.textAnswer || ""
      }])
    } catch (err) {
      console.error("Failed to save answer:", err)
    }
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      await quizService.submitQuizAttempt(quiz.id, attempt.id)

      toast.success("Quiz submitted successfully!")
      router.push(`/quizzes/${quiz.id}/results/${attempt.id}`)
    } catch {
      toast.error("Failed to submit quiz")
      setIsSubmitting(false)
    }
  }

  const handleAutoSubmit = async () => {
    toast.info("Time's up! Submitting your quiz...")
    await handleSubmit()
  }

  // Initialize timer
  useEffect(() => {
    if (!quiz.timeLimit) return

    const startTime = new Date(attempt.startedAt).getTime()
    const endTime = startTime + quiz.timeLimit * 60 * 1000
    
    const updateTimer = () => {
      const now = Date.now()
      const remaining = Math.max(0, endTime - now)
      setTimeRemaining(remaining)

      if (remaining === 0) {
        handleAutoSubmit()
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz.timeLimit, attempt.startedAt])

  const answeredCount = answers.size
  const progress = (answeredCount / questions.length) * 100

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold">{quiz.title}</h1>
              <p className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {timeRemaining !== null && (
                <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
                  <Clock className={`h-4 w-4 ${timeRemaining < 300000 ? "text-red-600" : ""}`} />
                  <span className={`font-mono font-semibold ${timeRemaining < 300000 ? "text-red-600" : ""}`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              )}

              <Button
                variant="outline"
                onClick={() => setShowSubmitDialog(true)}
                disabled={isSubmitting}
              >
                Submit Quiz
              </Button>
            </div>
          </div>

          <Progress value={progress} className="mt-4" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle>
                  Question {currentQuestionIndex + 1}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({currentQuestion.points} {currentQuestion.points === 1 ? "point" : "points"})
                  </span>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <QuestionDisplay
                question={currentQuestion}
                answer={answers.get(currentQuestion.id)}
                onAnswerChange={(answer: { selectedOptionId?: string; textAnswer?: string }) => 
                  handleAnswerChange(currentQuestion.id, answer)
                }
              />

              {/* Navigation */}
              <div className="mt-8 flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                  disabled={currentQuestionIndex === 0}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                <div className="text-sm text-muted-foreground">
                  {answeredCount} of {questions.length} answered
                </div>

                {currentQuestionIndex < questions.length - 1 ? (
                  <Button
                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                  >
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => setShowSubmitDialog(true)}
                    disabled={isSubmitting}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Review & Submit
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Question Overview */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Question Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-10 gap-2">
                {questions.map((question, index) => {
                  const isAnswered = answers.has(question.id)
                  const isCurrent = index === currentQuestionIndex

                  return (
                    <button
                      key={question.id}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`
                        aspect-square rounded-lg border-2 text-sm font-semibold transition-colors
                        ${isCurrent ? "border-blue-600 bg-blue-100 text-blue-900" : ""}
                        ${!isCurrent && isAnswered ? "border-green-600 bg-green-100 text-green-900" : ""}
                        ${!isCurrent && !isAnswered ? "border-gray-300 bg-white hover:bg-gray-100" : ""}
                      `}
                    >
                      {index + 1}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              {answeredCount < questions.length ? (
                <span className="text-amber-600">
                  You have answered {answeredCount} out of {questions.length} questions.{" "}
                  <strong>{questions.length - answeredCount} questions are unanswered.</strong>
                </span>
              ) : (
                <span>
                  You have answered all {questions.length} questions.
                </span>
              )}
              <br /><br />
              Once submitted, you cannot change your answers. Are you sure you want to submit?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Quiz"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
