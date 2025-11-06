"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PlayCircle, Clock, FileText, CheckCircle2 } from "lucide-react"

interface ChapterContentProps {
  chapter: {
    id: string
    title: string
    description?: string | null
    lessons: Array<{
      id: string
      title: string
      type: 'VIDEO' | 'ARTICLE' | 'QUIZ' | 'EXERCISE'
      duration?: number | null
      isFree: boolean
      progress?: Array<{ isCompleted: boolean }>
    }>
    userProgress?: Array<{ isCompleted: boolean }>
  }
  course: any
  courseId: string
  chapterId: string
}

export function ChapterContent({ chapter, courseId, chapterId }: ChapterContentProps) {
  const totalDuration = chapter.lessons?.reduce((total: number, lesson: any) => total + (lesson.duration || 0), 0) || 0
  const isCompleted = chapter.userProgress?.[0]?.isCompleted

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center gap-2 mb-4">
        <h1 className="text-2xl font-bold">{chapter.title}</h1>
        {isCompleted && (
          <Badge variant="secondary">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Completed
          </Badge>
        )}
      </div>

      <p className="text-sm text-muted-foreground mb-4">{chapter.description}</p>
      
      <div className="flex items-center gap-4 mb-8">
        <Badge variant="outline">
          <Clock className="h-4 w-4 mr-2" />
          {Math.ceil(totalDuration / 60)} min
        </Badge>
        <Badge variant="outline">
          {chapter.lessons?.length || 0} lessons
        </Badge>
      </div>

      <div className="grid gap-4">
        {chapter.lessons?.map((lesson: any) => (
          <Card key={lesson.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{lesson.title}</h3>
                    {lesson.progress?.[0]?.isCompleted && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {lesson.type === 'VIDEO' && (
                    <Badge variant="secondary">
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Video
                    </Badge>
                  )}
                  {lesson.type === 'ARTICLE' && (
                    <Badge variant="secondary">
                      <FileText className="h-4 w-4 mr-2" />
                      Article
                    </Badge>
                  )}
                  {lesson.duration && (
                    <Badge variant="outline">
                      <Clock className="h-4 w-4 mr-2" />
                      {Math.ceil(lesson.duration / 60)} min
                    </Badge>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-4"
                    asChild
                  >
                    <a href={`/courses/${courseId}/learn?chapter=${chapterId}&lesson=${lesson.id}`}>
                      Start Lesson
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}