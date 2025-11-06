"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { VideoPlayer } from "@/components/ui/video-player"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import { PlayCircle, Clock, FileText, CheckCircle2 } from "lucide-react"

import { CourseDetailsResponse } from '@/lib/services/course.service'

type Course = CourseDetailsResponse['course']
type Chapter = Course['chapters'][0]
type Lesson = Chapter['lessons'][0]

interface LessonContentProps {
  lesson: Lesson
  chapter: Chapter
  course: Course
  courseId: string
  chapterId: string
  lessonId: string
}

export function LessonContent({ lesson, chapter, course, courseId, chapterId, lessonId }: LessonContentProps) {
  const isCompleted = lesson.progress?.[0]?.isCompleted

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">{lesson.title}</h1>
          <p className="text-sm text-muted-foreground">
            {chapter.title} • Lesson {lesson.position}
          </p>
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
          {isCompleted && (
            <Badge variant="success">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Completed
            </Badge>
          )}
        </div>
      </div>

      <Card className="mb-4">
        <div className="p-4">
          {lesson.type === 'VIDEO' && lesson.videoUrl && (
            <VideoPlayer
              videoUrl={lesson.videoUrl || ''}
              courseId={courseId}
              chapterId={chapterId}
              lessonId={lessonId}
              isCompleted={lesson.progress?.[0]?.isCompleted}
              title={lesson.title}
            />
          )}
          {lesson.type === 'ARTICLE' && lesson.content && (
            <MarkdownRenderer content={lesson.content} />
          )}
        </div>
      </Card>

      {lesson.description && (
        <Card>
          <div className="p-4">
            <h3 className="font-semibold mb-2">About this lesson</h3>
            <p className="text-sm text-muted-foreground">{lesson.description}</p>
          </div>
        </Card>
      )}
    </div>
  )
}