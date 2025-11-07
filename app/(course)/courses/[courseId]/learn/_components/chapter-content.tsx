"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Play, 
  FileText, 
  Clock, 
  CheckCircle2, 
  Lock,
  ArrowRight,
  BookOpen
} from "lucide-react"

interface ChapterContentProps {
  chapter: any
  course: any
  courseId: string
  chapterId: string
}

export function ChapterContent({ chapter, course, courseId, chapterId }: ChapterContentProps) {
  const router = useRouter()

  const lessons = chapter.lessons || []
  const completedLessons = lessons.filter((lesson: any) => lesson.progress?.[0]?.isCompleted).length
  const totalDuration = lessons.reduce((acc: number, lesson: any) => acc + (lesson.duration || 0), 0)
  const progressPercentage = lessons.length > 0 ? (completedLessons / lessons.length) * 100 : 0

  const startLesson = (lessonId: string) => {
    router.push(`/courses/${courseId}/learn?chapter=${chapterId}&lesson=${lessonId}`)
  }

  const startFirstIncompleteLesson = () => {
    const firstIncomplete = lessons.find((lesson: any) => !lesson.progress?.[0]?.isCompleted)
    if (firstIncomplete) {
      startLesson(firstIncomplete.id)
    } else if (lessons.length > 0) {
      startLesson(lessons[0].id)
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-muted/50">
      <div className="max-w-4xl mx-auto p-8">
        {/* Chapter Header */}
        <div className="bg-card rounded-lg shadow-sm border p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-6 w-6 text-primary" />
            <Badge variant="outline" className="text-sm">
              Chapter Overview
            </Badge>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-4">
            {chapter.title}
          </h1>

          {chapter.description && (
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              {chapter.description}
            </p>
          )}

          {/* Chapter Stats */}
          <div className="flex flex-wrap items-center gap-6 mb-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" />
              <span>{completedLessons} of {lessons.length} lessons completed</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{Math.ceil(totalDuration / 60)} minutes total</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Chapter Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Action Button */}
          <Button 
            onClick={startFirstIncompleteLesson}
            size="lg" 
            className="bg-primary hover:bg-primary/90"
            disabled={lessons.length === 0}
          >
            <Play className="h-4 w-4 mr-2" />
            {completedLessons === lessons.length 
              ? "Review Chapter" 
              : completedLessons > 0 
                ? "Continue Learning" 
                : "Start Chapter"
            }
          </Button>
        </div>

        {/* Lessons List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Lessons in this chapter
          </h2>

          {lessons.map((lesson: any, index: number) => {
            const isCompleted = lesson.progress?.[0]?.isCompleted
            const isLocked = !lesson.isFree

            return (
              <Card 
                key={lesson.id} 
                className={`
                  transition-all duration-200 hover:shadow-md cursor-pointer
                  ${isLocked ? 'opacity-60' : ''}
                  ${isCompleted ? 'border-success/20 bg-success/5' : ''}
                `}
                onClick={() => !isLocked && startLesson(lesson.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    {/* Lesson Number & Type Icon */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                        ${isCompleted 
                          ? 'bg-success/10 text-success' 
                          : 'bg-muted text-muted-foreground'
                        }
                      `}>
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          index + 1
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {lesson.type === 'VIDEO' && (
                          <Play className="h-4 w-4 text-primary" />
                        )}
                        {lesson.type === 'ARTICLE' && (
                          <FileText className="h-4 w-4 text-accent" />
                        )}
                        {isLocked && (
                          <Lock className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Lesson Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground text-lg mb-2 line-clamp-2">
                            {lesson.title}
                          </h3>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <Badge variant="secondary" className="text-xs">
                              {lesson.type}
                            </Badge>
                            
                            {lesson.duration && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{Math.ceil(lesson.duration / 60)} min</span>
                              </div>
                            )}

                            {isCompleted && (
                              <Badge variant="secondary" className="text-xs">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                            )}

                            {isLocked && (
                              <Badge variant="secondary" className="text-xs">
                                <Lock className="h-3 w-3 mr-1" />
                                Premium
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Action Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-shrink-0"
                          disabled={isLocked}
                        >
                          {isCompleted ? "Review" : "Start"}
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {lessons.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No lessons yet</h3>
              <p className="text-muted-foreground">
                This chapter doesn't have any lessons available yet.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}