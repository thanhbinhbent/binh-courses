"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Check, Lock } from "lucide-react"
import { instructorQuizService } from "@/lib/services"

interface QuizPublishButtonProps {
  quizId: string
  isPublished: boolean
  disabled: boolean
}

export function QuizPublishButton({
  quizId,
  isPublished,
  disabled,
}: QuizPublishButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const onClick = async () => {
    try {
      setIsLoading(true)

      if (isPublished) {
        await instructorQuizService.unpublishQuiz(quizId)
        toast.success("Quiz unpublished")
      } else {
        await instructorQuizService.publishQuiz(quizId)
        toast.success("Quiz published!")
      }

      router.refresh()
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={onClick}
      disabled={disabled || isLoading}
      variant={isPublished ? "outline" : "default"}
      size="sm"
    >
      {isPublished ? (
        <>
          <Lock className="mr-2 h-4 w-4" />
          Unpublish
        </>
      ) : (
        <>
          <Check className="mr-2 h-4 w-4" />
          Publish
        </>
      )}
    </Button>
  )
}
