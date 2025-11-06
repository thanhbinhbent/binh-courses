"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Check, Lock } from "lucide-react"

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
        await axios.patch(`/api/quizzes/${quizId}/unpublish`)
        toast.success("Quiz unpublished")
      } else {
        await axios.patch(`/api/quizzes/${quizId}/publish`)
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
