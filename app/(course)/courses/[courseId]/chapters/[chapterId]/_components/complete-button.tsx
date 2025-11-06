"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { courseService } from "@/lib/services"

interface CompleteButtonProps {
  chapterId: string
}

export function CompleteButton({ chapterId }: CompleteButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleComplete = async () => {
    try {
      setIsLoading(true)

      await courseService.markChapterComplete(chapterId)

      toast.success("Chapter marked as complete!")
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
      onClick={handleComplete}
      disabled={isLoading}
      className="gap-2"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Marking...
        </>
      ) : (
        <>
          <CheckCircle2 className="h-4 w-4" />
          Mark as Complete
        </>
      )}
    </Button>
  )
}
