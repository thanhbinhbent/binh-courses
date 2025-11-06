"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, Eye, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Quiz } from "@/lib/types"
import { instructorQuizService } from "@/lib/services"

interface QuizzesListProps {
  quizzes: Quiz[]
}

export function QuizzesList({ quizzes }: QuizzesListProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (quizId: string) => {
    if (!confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) {
      return
    }

    try {
      setDeletingId(quizId)
      await instructorQuizService.deleteQuiz(quizId)
      toast.success("Quiz deleted successfully")
      router.refresh()
    } catch (error) {
      toast.error("Failed to delete quiz")
    } finally {
      setDeletingId(null)
    }
  }

  if (quizzes.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No quizzes yet</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Create your first quiz to get started
          </p>
          <Button asChild>
            <Link href="/instructor/quizzes/new">Create Quiz</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {quizzes.map((quiz) => (
        <Card key={quiz.id} className="flex flex-col">
          <CardHeader>
            <div className="mb-2 flex items-center justify-between">
              <Badge variant={quiz.isPublished ? "default" : "secondary"}>
                {quiz.isPublished ? "Published" : "Draft"}
              </Badge>
              {quiz.category && (
                <Badge variant="outline">{quiz.category.name}</Badge>
              )}
            </div>
            <CardTitle className="line-clamp-2">{quiz.title}</CardTitle>
            {quiz.description && (
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {quiz.description}
              </p>
            )}
          </CardHeader>

          <CardContent className="flex-1">
            <div className="mb-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                <span>{quiz._count?.questions || 0} questions</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>{quiz._count?.attempts || 0} attempts</span>
              </div>
              {quiz.timeLimit && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{quiz.timeLimit} minutes</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button asChild size="sm" variant="outline" className="flex-1">
                <Link href={`/instructor/quizzes/${quiz.id}`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(quiz.id)}
                disabled={deletingId === quiz.id}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
