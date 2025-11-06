"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Pencil, Trash2, GripVertical } from "lucide-react"
import { QuestionBuilder } from "./question-builder"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { QuizQuestion } from "@/lib/types"
import { instructorQuizService } from "@/lib/services"

interface QuestionsListProps {
  quiz: {
    id: string
  }
  questions: QuizQuestion[]
}

export function QuestionsList({ quiz, questions }: QuestionsListProps) {
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) {
      return
    }

    try {
      setDeletingId(questionId)
      await instructorQuizService.deleteQuestion(quiz.id, questionId)
      toast.success("Question deleted")
      router.refresh()
    } catch (error) {
      toast.error("Failed to delete question")
    } finally {
      setDeletingId(null)
    }
  }

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "MULTIPLE_CHOICE":
        return "Multiple Choice"
      case "TRUE_FALSE":
        return "True/False"
      case "SHORT_ANSWER":
        return "Short Answer"
      case "ESSAY":
        return "Essay"
      default:
        return type
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Questions</CardTitle>
            <p className="text-sm text-muted-foreground">
              {questions.length} question{questions.length !== 1 ? "s" : ""}
            </p>
          </div>
          {!isAdding && !editingId && (
            <Button size="sm" onClick={() => setIsAdding(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isAdding && (
          <QuestionBuilder
            quizId={quiz.id}
            onCancel={() => setIsAdding(false)}
            onSuccess={() => {
              setIsAdding(false)
              router.refresh()
            }}
          />
        )}

        {questions.length === 0 && !isAdding && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No questions yet. Add your first question to get started.
          </div>
        )}

        {questions.map((question, index) => {
          if (editingId === question.id) {
            return (
              <QuestionBuilder
                key={question.id}
                quizId={quiz.id}
                question={question}
                onCancel={() => setEditingId(null)}
                onSuccess={() => {
                  setEditingId(null)
                  router.refresh()
                }}
              />
            )
          }

          return (
            <div
              key={question.id}
              className="rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 cursor-move pt-1">
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">
                        Question {index + 1}
                        <span className="ml-2 text-sm font-normal text-muted-foreground">
                          ({question.points} {question.points === 1 ? "point" : "points"})
                        </span>
                      </p>
                      <p className="text-sm text-muted-foreground">{question.question}</p>
                    </div>
                    <Badge variant="outline">{getQuestionTypeLabel(question.type)}</Badge>
                  </div>

                  {(question.type === "MULTIPLE_CHOICE" || question.type === "TRUE_FALSE") && (
                    <div className="space-y-1">
                      {question.options.map((option) => (
                        <div
                          key={option.id}
                          className={`text-xs ${
                            option.isCorrect
                              ? "font-medium text-green-600"
                              : "text-muted-foreground"
                          }`}
                        >
                          {option.isCorrect ? "✓ " : "○ "}
                          {option.text}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingId(question.id)}
                      disabled={!!editingId || isAdding}
                    >
                      <Pencil className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(question.id)}
                      disabled={deletingId === question.id || !!editingId || isAdding}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
