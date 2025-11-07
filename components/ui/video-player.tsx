"use client"

import { cn } from "@/lib/utils"

interface VideoPlayerProps {
  videoUrl: string
  courseId: string
  chapterId: string
  lessonId: string
  isCompleted?: boolean
  title?: string
  className?: string
}

export function VideoPlayer({ 
  videoUrl, 
  className
}: VideoPlayerProps) {
  return (
    <video 
      controls 
      className={cn("w-full aspect-video bg-muted", className)}
      src={videoUrl}
    >
      Your browser does not support the video tag.
    </video>
  )
}
