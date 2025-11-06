"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { courseService } from "@/lib/services"

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
      await courseService.enrollInCourse(courseId)

      toast.success("Successfully enrolled!")
      router.refresh()
    } catch (error) {
      const err = error as Error
      if (err.message === 'UNAUTHORIZED') {
        toast.error("Please sign in to enroll")
      } else if (err.message === 'ALREADY_ENROLLED') {
        toast.error("You are already enrolled in this course")
      } else if (err.message === 'PURCHASE_REQUIRED') {
        toast.error("Please purchase this course first")
      } else {
        toast.error("Something went wrong")
      }
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
