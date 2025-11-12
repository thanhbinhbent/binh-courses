"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { PlayCircle } from "lucide-react"
import { quizService } from "@/lib/services"

interface StartQuizButtonProps {
  quizId: string
}

export function StartQuizButton({ quizId }: StartQuizButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const onClick = async () => {
    try {
      setIsLoading(true)

      const response = await quizService.startQuizAttempt(quizId)
      
      toast.success("Quiz started!")
      router.push(`/quizzes/${quizId}/take/${response.attemptId}`)
    } catch {
      toast.error("Failed to start quiz")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      size="lg"
      className="w-full"
    >
      <PlayCircle className="mr-2 h-5 w-5" />
      {isLoading ? "Starting..." : "Start Quiz"}
    </Button>
  )
}
