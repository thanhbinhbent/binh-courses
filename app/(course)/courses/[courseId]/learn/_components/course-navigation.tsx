"use client"

import { useRouter } from "next/navigation"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ChevronRight, PlayCircle, FileText, CheckCircle2, Lock } from "lucide-react"
import { CourseDetailsResponse } from '@/lib/services/course.service'

type Course = CourseDetailsResponse['course']
type Chapter = Course['chapters'][0]
type Lesson = Chapter['lessons'][0]

interface CourseNavigationProps {
  course: Course
  currentChapterId?: string | null
  currentLessonId?: string | null
  courseId: string
}

export function CourseNavigation({ course, currentChapterId, currentLessonId, courseId }: CourseNavigationProps) {
  const router = useRouter()

  const onChapterClick = (chapterId: string) => {
    router.push(`/courses/${courseId}/learn?chapter=${chapterId}`)
  }

  const onLessonClick = (chapterId: string, lessonId: string) => {
    router.push(`/courses/${courseId}/learn?chapter=${chapterId}&lesson=${lessonId}`)
  }

  return (
    <div className="h-full bg-slate-50 flex flex-col">
      {/* Course Header */}
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold">{course.title}</h1>
        <p className="text-sm text-muted-foreground">
          {course.chapters.length} chapters • {course._count.lessons} lessons
        </p>
      </div>

      {/* Chapter List */}
      <div className="flex-1 overflow-y-auto">
        {course.chapters.map((chapter) => (
          <Collapsible 
            key={chapter.id}
            defaultOpen={chapter.id === currentChapterId}
          >
            <CollapsibleTrigger className="flex items-center gap-2 w-full p-4 hover:bg-slate-100">
              <ChevronRight className="h-4 w-4 shrink-0" />
              <div className="flex-1 text-sm">
                <p className="font-semibold">{chapter.title}</p>
                <p className="text-xs text-muted-foreground">
                  {chapter.lessons.length} lessons
                </p>
              </div>
              {chapter.userProgress?.[0]?.isCompleted && (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              )}
              {!chapter.isFree && (
                <Lock className="h-4 w-4 text-slate-500" />
              )}
            </CollapsibleTrigger>

            <CollapsibleContent>
              {chapter.lessons.map((lesson) => (
                <Card
                  key={lesson.id}
                  className={cn(
                    "flex items-center gap-2 p-4 hover:bg-slate-100 cursor-pointer border-0 rounded-none",
                    lesson.id === currentLessonId && "bg-slate-200"
                  )}
                  onClick={() => onLessonClick(chapter.id, lesson.id)}
                >
                  {lesson.type === 'VIDEO' && <PlayCircle className="h-4 w-4 shrink-0" />}
                  {lesson.type === 'ARTICLE' && <FileText className="h-4 w-4 shrink-0" />}
                  
                  <div className="flex-1 text-sm">
                    <p className="line-clamp-1">{lesson.title}</p>
                    {lesson.duration && (
                      <p className="text-xs text-muted-foreground">
                        {Math.ceil(lesson.duration / 60)} min
                      </p>
                    )}
                  </div>

                  {lesson.progress?.[0]?.isCompleted && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  )}
                  {!lesson.isFree && (
                    <Lock className="h-4 w-4 text-slate-500" />
                  )}
                </Card>
              ))}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  )
}