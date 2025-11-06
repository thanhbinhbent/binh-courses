"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { PlayCircle } from "lucide-react"

interface StartQuizButtonProps {
  quizId: string
}

export function StartQuizButton({ quizId }: StartQuizButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const onClick = async () => {
    try {
      setIsLoading(true)

      const response = await axios.post(`/api/quizzes/${quizId}/attempt`)
      
      toast.success("Quiz started!")
      router.push(`/quizzes/${quizId}/take/${response.data.attemptId}`)
    } catch (error) {
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
