"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { VideoPlayer } from "@/components/ui/video-player"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle2,
  Clock,
  FileText,
  Download,
  Bookmark
} from "lucide-react"

interface LessonContentProps {
  lesson: any
  chapter: any
  course: any
  courseId: string
  chapterId: string
  lessonId: string
}

export function LessonContent({ 
  lesson, 
  chapter, 
  course, 
  courseId, 
  chapterId, 
  lessonId 
}: LessonContentProps) {
  const router = useRouter()
  const [isCompleted, setIsCompleted] = useState(lesson.progress?.[0]?.isCompleted || false)
  
  // Find previous and next lessons across all chapters
  const allLessons: any[] = []
  course.chapters?.forEach((ch: any) => {
    ch.lessons?.forEach((l: any) => {
      allLessons.push({ ...l, chapterId: ch.id, chapterTitle: ch.title })
    })
  })

  const currentIndex = allLessons.findIndex(l => l.id === lessonId)
  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  const navigateToLesson = (targetLesson: any) => {
    router.push(`/courses/${courseId}/learn?chapter=${targetLesson.chapterId}&lesson=${targetLesson.id}`)
  }

  const toggleComplete = async () => {
    // TODO: Implement API call to mark lesson as complete
    setIsCompleted(!isCompleted)
  }

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Video/Content Player */}
        <div className="bg-black relative">
          {lesson.type === 'VIDEO' && lesson.videoUrl && (
            <div className="aspect-video w-full">
              <VideoPlayer
                videoUrl={lesson.videoUrl}
                courseId={courseId}
                chapterId={chapterId}
                lessonId={lessonId}
                isCompleted={isCompleted}
                title={lesson.title}
              />
            </div>
          )}
          
          {lesson.type === 'ARTICLE' && (
            <div className="bg-white min-h-[400px] p-8">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">{lesson.title}</h1>
                {lesson.content && <MarkdownRenderer content={lesson.content} />}
              </div>
            </div>
          )}

          {/* Navigation Controls Overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {previousLesson && (
                  <Button
                    onClick={() => navigateToLesson(previousLesson)}
                    variant="secondary"
                    size="sm"
                    className="bg-white/90 text-black hover:bg-white"
                  >
                    <SkipBack className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                )}
                
                {nextLesson && (
                  <Button
                    onClick={() => navigateToLesson(nextLesson)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Next
                    <SkipForward className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>

              <Button
                onClick={toggleComplete}
                variant={isCompleted ? "secondary" : "default"}
                size="sm"
                className={isCompleted 
                  ? "bg-green-600 text-white hover:bg-green-700" 
                  : "bg-white/90 text-black hover:bg-white"
                }
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {isCompleted ? "Completed" : "Mark as complete"}
              </Button>
            </div>
          </div>
        </div>

        {/* Lesson Info Panel */}
        <div className="bg-white border-t flex-shrink-0">
          <div className="max-w-4xl mx-auto p-6">
            {/* Lesson Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {lesson.type === 'VIDEO' && <Play className="h-3 w-3 mr-1" />}
                    {lesson.type === 'ARTICLE' && <FileText className="h-3 w-3 mr-1" />}
                    {lesson.type}
                  </Badge>
                  
                  {lesson.duration && (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {Math.ceil(lesson.duration / 60)} min
                    </Badge>
                  )}

                  {isCompleted && (
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {lesson.title}
                </h2>
                
                <p className="text-sm text-gray-600">
                  {chapter.title}
                </p>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Button variant="ghost" size="sm">
                  <Bookmark className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator className="mb-6" />

            {/* Lesson Description */}
            {lesson.description && (
              <div className="prose max-w-none mb-6">
                <h3 className="text-lg font-semibold mb-3">About this lesson</h3>
                <p className="text-gray-700 leading-relaxed">{lesson.description}</p>
              </div>
            )}

            {/* Navigation between lessons */}
            <div className="flex items-center justify-between pt-6 border-t">
              <div className="flex-1">
                {previousLesson && (
                  <Button
                    onClick={() => navigateToLesson(previousLesson)}
                    variant="ghost"
                    className="p-0 h-auto flex items-start gap-3 hover:bg-gray-50 rounded-lg p-3 -m-3"
                  >
                    <ChevronLeft className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div className="text-left">
                      <p className="text-xs text-gray-500 mb-1">Previous lesson</p>
                      <p className="font-medium text-sm line-clamp-2">{previousLesson.title}</p>
                    </div>
                  </Button>
                )}
              </div>

              <div className="flex-1 flex justify-end">
                {nextLesson && (
                  <Button
                    onClick={() => navigateToLesson(nextLesson)}
                    variant="ghost"
                    className="p-0 h-auto flex items-start gap-3 hover:bg-gray-50 rounded-lg p-3 -m-3"
                  >
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Next lesson</p>
                      <p className="font-medium text-sm line-clamp-2">{nextLesson.title}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}