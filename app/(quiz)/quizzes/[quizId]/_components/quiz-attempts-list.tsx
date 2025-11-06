import { formatDistanceToNow } from "date-fns"
import { CheckCircle2, XCircle, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface QuizAttemptsListProps {
  attempts: Array<{
    id: string
    score: number | null
    isPassed: boolean
    startedAt: Date
    completedAt: Date | null
  }>
  passingScore: number
}

export function QuizAttemptsList({ attempts, passingScore }: QuizAttemptsListProps) {
  return (
    <div className="space-y-3">
      {attempts.map((attempt) => {
        const isCompleted = attempt.completedAt !== null
        const isPassed = attempt.isPassed && isCompleted

        return (
          <div
            key={attempt.id}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <div className="flex items-center gap-3">
              {isCompleted ? (
                isPassed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )
              ) : (
                <Clock className="h-5 w-5 text-amber-600" />
              )}

              <div>
                <p className="text-sm font-medium">
                  {formatDistanceToNow(new Date(attempt.startedAt), {
                    addSuffix: true
                  })}
                </p>
                {isCompleted && (
                  <p className="text-xs text-muted-foreground">
                    Completed{" "}
                    {formatDistanceToNow(new Date(attempt.completedAt!), {
                      addSuffix: true
                    })}
                  </p>
                )}
              </div>
            </div>

            <div className="text-right">
              {isCompleted && attempt.score !== null ? (
                <>
                  <p className="text-lg font-bold">
                    {attempt.score.toFixed(1)}%
                  </p>
                  <Badge
                    variant={isPassed ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {isPassed ? "Passed" : "Failed"}
                  </Badge>
                </>
              ) : (
                <Badge variant="outline">In Progress</Badge>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
