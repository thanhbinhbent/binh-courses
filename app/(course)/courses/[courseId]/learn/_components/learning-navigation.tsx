"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { X, ChevronDown, ChevronRight, Play, FileText, CheckCircle2, Lock, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge" // Unused import
import { Progress } from "@/components/ui/progress"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

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
  type: string
  isFree?: boolean
  duration?: number
  progress?: { isCompleted: boolean }[]
}

interface LearningNavigationProps {
  course: Course
  currentChapterId?: string | null
  currentLessonId?: string | null
  courseId: string
  onClose: () => void
}

export function LearningNavigation({ 
  course, 
  currentChapterId, 
  currentLessonId, 
  courseId,
  onClose 
}: LearningNavigationProps) {
  const router = useRouter()
  const [openChapters, setOpenChapters] = useState<Set<string>>(new Set([currentChapterId || '']))

  const onLessonClick = (chapterId: string, lessonId: string) => {
    router.push(`/courses/${courseId}/learn?chapter=${chapterId}&lesson=${lessonId}`)
    onClose()
  }

  const toggleChapter = (chapterId: string) => {
    const newOpenChapters = new Set(openChapters)
    if (newOpenChapters.has(chapterId)) {
      newOpenChapters.delete(chapterId)
    } else {
      newOpenChapters.add(chapterId)
    }
    setOpenChapters(newOpenChapters)
  }

  // Calculate progress
  const totalLessons = course.chapters?.reduce((acc: number, chapter) => acc + (chapter.lessons?.length || 0), 0) || 0
  const completedLessons = course.chapters?.reduce((acc: number, chapter) => {
    return acc + (chapter.lessons?.filter((lesson) => lesson.progress?.[0]?.isCompleted).length || 0)
  }, 0) || 0
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="p-4 border-b bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-foreground truncate">
              {course.title}
            </h2>
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>{completedLessons} of {totalLessons} complete</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-1" />
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden ml-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Course Content */}
      <div className="flex-1 overflow-y-auto">
        {course.chapters?.map((chapter, chapterIndex: number) => {
          const isChapterOpen = openChapters.has(chapter.id)
          const chapterLessons = chapter.lessons || []
          const completedChapterLessons = chapterLessons.filter((lesson) => lesson.progress?.[0]?.isCompleted).length
          const chapterProgress = chapterLessons.length > 0 ? (completedChapterLessons / chapterLessons.length) * 100 : 0
          
          return (
            <div key={chapter.id} className="border-b">
              <Collapsible open={isChapterOpen} onOpenChange={() => toggleChapter(chapter.id)}>
                <CollapsibleTrigger asChild>
                  <button className="w-full p-4 text-left hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      {isChapterOpen ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-muted-foreground">
                            Section {chapterIndex + 1}
                          </span>
                          {chapterProgress === 100 && (
                            <CheckCircle2 className="h-3 w-3 text-success" />
                          )}
                        </div>
                        <h3 className="font-medium text-sm text-foreground truncate">
                          {chapter.title}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>{completedChapterLessons}/{chapterLessons.length} lessons</span>
                          {chapterProgress > 0 && chapterProgress < 100 && (
                            <span>{Math.round(chapterProgress)}% complete</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="pb-2">
                    {chapterLessons.length > 0 ? (
                      chapterLessons.map((lesson, lessonIndex: number) => {
                        const isActive = lesson.id === currentLessonId
                        const isCompleted = lesson.progress?.[0]?.isCompleted
                        const isLocked = !lesson.isFree // You might want to add more complex logic here

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => !isLocked && onLessonClick(chapter.id, lesson.id)}
                            disabled={isLocked}
                            className={`
                              w-full text-left p-3 pl-12 hover:bg-muted/50 transition-colors border-l-2
                              ${isActive ? 'bg-primary/5 border-l-primary' : 'border-l-transparent'}
                              ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-xs text-muted-foreground font-mono">
                                  {lessonIndex + 1}.
                                </span>
                                
                                {lesson.type === 'VIDEO' && <Play className="h-3 w-3 text-muted-foreground" />}
                                {lesson.type === 'ARTICLE' && <FileText className="h-3 w-3 text-muted-foreground" />}
                                
                                {isLocked && <Lock className="h-3 w-3 text-gray-400" />}
                                {isCompleted && <CheckCircle2 className="h-3 w-3 text-success" />}
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className={`text-sm truncate ${isActive ? 'font-medium text-primary' : 'text-foreground'}`}>
                                  {lesson.title}
                                </p>
                                {lesson.duration && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Clock className="h-3 w-3 text-gray-400" />
                                    <span className="text-xs text-muted-foreground">
                                      {Math.ceil(lesson.duration / 60)} min
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        )
                      })
                    ) : (
                      <div className="p-3 pl-12 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>No lessons in this section</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )
        })}
      </div>
    </div>
  )
}