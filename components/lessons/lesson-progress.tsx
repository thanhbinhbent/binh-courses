'use client'

import { CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface LessonProgressProps {
  lessonId: string
  courseId: string
  chapterId: string
  isCompleted?: boolean
}

export const LessonProgress = ({
  lessonId,
  courseId,
  chapterId,
  isCompleted
}: LessonProgressProps) => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const onClick = async () => {
    try {
      setIsLoading(true)

      await fetch(`/api/lessons/${lessonId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isCompleted: !isCompleted
        })
      })

      toast.success('Progress updated')
      router.refresh()
    } catch {
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-x-2">
      <Button
        onClick={onClick}
        disabled={isLoading}
        variant={isCompleted ? 'outline' : 'default'}
        className="w-full md:w-auto"
      >
        {isCompleted ? (
          <>
            <XCircle className="h-4 w-4 mr-2" />
            Mark as incomplete
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark as complete
          </>
        )}
      </Button>
    </div>
  )
}