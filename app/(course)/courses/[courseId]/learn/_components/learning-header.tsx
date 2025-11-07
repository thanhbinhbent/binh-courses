"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Menu, MoreVertical, BookOpen, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { PaymentStatusBadge } from "@/components/payment-status-badge"

interface Course {
  id: string
  title: string
  chapters?: Chapter[]
}

interface Chapter {
  id: string
  title: string
  lessons?: Lesson[]
}

interface Lesson {
  id: string
  title: string
  progress?: { isCompleted: boolean }[]
}

interface LearningHeaderProps {
  course: Course
  currentChapterId?: string | null
  currentLessonId?: string | null
  onToggleNav: () => void
}

export function LearningHeader({ 
  course, 
  currentChapterId, 
  currentLessonId, 
  onToggleNav 
}: LearningHeaderProps) {
  const router = useRouter()

  // Find current lesson and chapter for title
  const currentChapter = course.chapters?.find((ch) => ch.id === currentChapterId)
  const currentLesson = currentChapter?.lessons?.find((lesson) => lesson.id === currentLessonId)

  // Calculate progress
  const totalLessons = course.chapters?.reduce((acc: number, chapter) => acc + (chapter.lessons?.length || 0), 0) || 0
  const completedLessons = course.chapters?.reduce((acc: number, chapter) => {
    return acc + (chapter.lessons?.filter((lesson) => lesson.progress?.[0]?.isCompleted).length || 0)
  }, 0) || 0
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

  const handleBackToCourse = () => {
    router.push(`/courses/${course.id}`)
  }

  return (
    <header className="learning-header">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleNav}
            className="lg:hidden text-foreground hover:bg-accent"
          >
            <Menu className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToCourse}
            className="text-foreground hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to course
          </Button>

          <div className="hidden md:block w-px h-6 bg-border" />

          <div className="hidden md:flex items-center gap-3">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <div className="min-w-0">
              <h1 className="text-sm font-medium truncate max-w-xs">
                {course.title}
              </h1>
              {currentLesson && (
                <p className="text-xs text-muted-foreground truncate max-w-xs">
                  {currentLesson.title}
                </p>
              )}
            </div>
            <PaymentStatusBadge variant="dark" />
          </div>
        </div>

        {/* Center - Progress (Desktop only) */}
        <div className="hidden lg:flex items-center gap-3 flex-1 max-w-md mx-8">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Course progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-1.5 bg-muted"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
            <Users className="h-3 w-3" />
            <span>0</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-muted-foreground/90"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile progress bar */}
      <div className="lg:hidden px-4 pb-3">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
          <span>{completedLessons} of {totalLessons} lessons</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <Progress 
          value={progressPercentage} 
          className="h-1.5 bg-muted"
        />
      </div>
    </header>
  )
}