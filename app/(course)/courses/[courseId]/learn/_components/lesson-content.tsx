"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { VideoPlayer } from "@/components/ui/video-player"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import { 
  Play, 
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

interface Lesson {
  id: string
  title: string
  type: string
  videoUrl?: string
  content?: string
  description?: string
  duration?: number
  progress?: { isCompleted: boolean }[]
}

interface Chapter {
  id: string
  title: string
  lessons?: Lesson[]
}

interface Course {
  chapters?: Chapter[]
}

interface LessonWithChapter extends Lesson {
  chapterId: string
  chapterTitle: string
}

interface LessonContentProps {
  lesson: Lesson
  chapter: Chapter
  course: Course
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
  
  // More flexible video detection
  const hasVideo = (lesson.type?.toLowerCase() === 'video' || lesson.type === 'VIDEO') && 
                   lesson.videoUrl && 
                   lesson.videoUrl.trim() !== ''
  
  // Debug logging
  console.log('Lesson data:', { 
    type: lesson.type, 
    videoUrl: lesson.videoUrl, 
    hasVideo,
    title: lesson.title 
  })
  
  // Find previous and next lessons across all chapters
  const allLessons: LessonWithChapter[] = []
  course.chapters?.forEach((ch) => {
    ch.lessons?.forEach((l) => {
      allLessons.push({ ...l, chapterId: ch.id, chapterTitle: ch.title })
    })
  })

  const currentIndex = allLessons.findIndex(l => l.id === lessonId)
  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  const navigateToLesson = (targetLesson: LessonWithChapter) => {
    router.push(`/courses/${courseId}/learn?chapter=${targetLesson.chapterId}&lesson=${targetLesson.id}`)
  }

  const toggleComplete = async () => {
    // TODO: Implement API call to mark lesson as complete
    setIsCompleted(!isCompleted)
  }

  // Check if it's a video lesson (even without URL)
  const isVideoLesson = lesson.type?.toLowerCase() === 'video' || lesson.type === 'VIDEO'

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Video Section - Prioritized at top */}
      {hasVideo ? (
        <div className="bg-black relative">
          <div className="aspect-video w-full">
            <VideoPlayer
              videoUrl={lesson.videoUrl!}
              courseId={courseId}
              chapterId={chapterId}  
              lessonId={lessonId}
              isCompleted={isCompleted}
              title={lesson.title}
            />
          </div>

          {/* Video Controls Overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
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
                    className="bg-blue-600 hover:bg-blue-700 text-white"
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
                {isCompleted ? "Completed" : "Mark Complete"}
              </Button>
            </div>
          </div>
        </div>
      ) : isVideoLesson ? (
        /* Video lesson without URL - Show placeholder */
        <div className="bg-gray-900 relative">
          <div className="aspect-video w-full flex items-center justify-center">
            <div className="text-center text-white p-8">
              <Play className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">Video Coming Soon</h3>
              <p className="text-gray-300">This video lesson will be available shortly.</p>
            </div>
          </div>

          {/* Video Controls Overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
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
                    className="bg-blue-600 hover:bg-blue-700 text-white"
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
                {isCompleted ? "Completed" : "Mark Complete"}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Non-video content - Centered layout */
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="w-full max-w-4xl mx-auto px-8 py-12 text-center">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
                <FileText className="h-4 w-4" />
                {lesson.type}
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{lesson.title}</h1>
              <p className="text-lg text-gray-600 mb-8">{chapter.title}</p>
            </div>

            {lesson.content && (
              <div className="prose prose-lg max-w-none mb-12 text-left">
                <MarkdownRenderer content={lesson.content} />
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-4">
              {previousLesson && (
                <Button
                  onClick={() => navigateToLesson(previousLesson)}
                  variant="outline"
                >
                  <SkipBack className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              )}

              <Button
                onClick={toggleComplete}
                variant={isCompleted ? "secondary" : "default"}
                className={isCompleted ? "bg-green-600 hover:bg-green-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {isCompleted ? "Completed" : "Mark Complete"}
              </Button>
              
              {nextLesson && (
                <Button
                  onClick={() => navigateToLesson(nextLesson)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Next
                  <SkipForward className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lesson Description Panel - Below video/content */}
      <div className="bg-white border-t">
        <div className="max-w-4xl mx-auto p-6">
          {/* Lesson Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
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

          {/* Enhanced Navigation */}
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
  )
}