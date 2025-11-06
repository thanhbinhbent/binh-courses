"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface PublishButtonProps {
  courseId: string
  isPublished: boolean
  isComplete: boolean
}

export function PublishButton({ courseId, isPublished, isComplete }: PublishButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleTogglePublish = async () => {
    if (!isComplete && !isPublished) {
      toast.error("Please complete all required fields before publishing")
      return
    }

    try {
      setIsLoading(true)

      const response = await fetch(`/api/courses/${courseId}/publish`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          isPublished: !isPublished
        })
      })

      if (!response.ok) {
        throw new Error("Failed to update course")
      }

      toast.success(`Course ${!isPublished ? "published" : "unpublished"} successfully!`)
      router.refresh()
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleTogglePublish}
      disabled={isLoading || (!isComplete && !isPublished)}
      variant={isPublished ? "outline" : "default"}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isPublished ? "Unpublishing..." : "Publishing..."}
        </>
      ) : (
        <>{isPublished ? "Unpublish" : "Publish Course"}</>
      )}
    </Button>
  )
}
