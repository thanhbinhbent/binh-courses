"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface EnrollButtonProps {
  courseId: string
  isFree: boolean
}

export function EnrollButton({ courseId, isFree }: EnrollButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleEnroll = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST"
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to enroll")
      }

      toast.success("Successfully enrolled!")
      router.refresh()
    } catch (error) {
      const err = error as Error
      toast.error(err.message || "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      className="w-full"
      size="lg"
      onClick={handleEnroll}
      disabled={isLoading}
    >
      {isLoading ? "Enrolling..." : isFree ? "Enroll for Free" : "Buy Now"}
    </Button>
  )
}
