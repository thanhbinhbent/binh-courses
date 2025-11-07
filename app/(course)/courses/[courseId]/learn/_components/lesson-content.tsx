"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { VideoPlayer } from "@/components/ui/video-player"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Play, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle2,
  Clock,
  FileText,
  Download,
  Bookmark,
  MessageCircle,
  Users
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



interface LessonWithChapter extends Lesson {
  chapterId: string
  chapterTitle: string
}

interface LessonContentProps {
  lesson: Lesson
  chapter: Chapter
  courseId: string
  chapterId: string
  lessonId: string
  allLessonsFlat: LessonWithChapter[]
  currentIndex: number
}

export function LessonContent({
  lesson,
  chapter,
  courseId,
  chapterId,
  lessonId,
  allLessonsFlat,
  currentIndex
}: LessonContentProps) {
  const router = useRouter()
  const [isCompleted, setIsCompleted] = useState(
    lesson.progress?.[0]?.isCompleted ?? false
  )

  const hasVideo = lesson.videoUrl && lesson.videoUrl.trim() !== ''
  const isVideoLesson = lesson.type?.toLowerCase() === 'video' || lesson.type === 'VIDEO'

  // Navigation helpers
  const previousLesson = currentIndex > 0 ? allLessonsFlat[currentIndex - 1] : null
  const nextLesson = currentIndex < allLessonsFlat.length - 1 ? allLessonsFlat[currentIndex + 1] : null

  const navigateToLesson = (targetLesson: LessonWithChapter) => {
    router.push(`/courses/${courseId}/learn?chapter=${targetLesson.chapterId}&lesson=${targetLesson.id}`)
  }

  const toggleComplete = () => {
    // TODO: Call API to update completion status
    setIsCompleted(!isCompleted)
  }

  return (
    <div className="w-full bg-white">
      
      {/* ========== MAIN CONTENT AREA ========== */}
      
      {/* Video Player Section (only if has video) */}
      {hasVideo && (
        <div className="bg-black">
          <div className="aspect-video w-full max-h-[60vh]">
            <VideoPlayer
              videoUrl={lesson.videoUrl!}
              courseId={courseId}
              chapterId={chapterId}
              lessonId={lessonId}
              isCompleted={isCompleted}
              title={lesson.title}
            />
          </div>
        </div>
      )}

      {/* Lesson Header & Info Bar */}
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            {/* Lesson Type & Duration */}
            <div className="flex items-center gap-3 mb-3">
              <Badge 
                variant={isVideoLesson ? "default" : "secondary"} 
                className={`text-xs font-medium ${
                  isVideoLesson 
                    ? "bg-blue-100 text-blue-800" 
                    : "bg-purple-100 text-purple-800"
                }`}
              >
                {isVideoLesson ? (
                  <>
                    <Play className="h-3 w-3 mr-1" />
                    VIDEO
                  </>
                ) : (
                  <>
                    <FileText className="h-3 w-3 mr-1" />
                    ARTICLE
                  </>
                )}
              </Badge>
              
              {lesson.duration && (
                <span className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {lesson.duration} min
                </span>
              )}
            </div>
            
            {/* Lesson Title & Chapter Info */}
            <h1 className="text-2xl font-bold text-gray-900 mb-1 leading-tight">
              {lesson.title}
            </h1>
            <p className="text-sm text-gray-500">{chapter.title}</p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Button
              onClick={toggleComplete}
              variant={isCompleted ? "secondary" : "default"}
              size="sm"
              className={isCompleted 
                ? "bg-green-600 text-white hover:bg-green-700" 
                : "bg-blue-600 hover:bg-blue-700 text-white"
              }
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {isCompleted ? "Completed" : "Mark Complete"}
            </Button>
            
            <Button variant="ghost" size="sm">
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1">
        <div className="max-w-4xl mx-auto px-6 py-8 pb-32">
          
          {/* Content Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="content">
                {hasVideo ? "Notes" : "Content"}
              </TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="discussions">
                <MessageCircle className="h-4 w-4 mr-1" />
                Q&A
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6">
              {hasVideo && lesson.description && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">About this lesson</h2>
                  <div className="prose prose-gray max-w-none">
                    <MarkdownRenderer content={lesson.description} />
                  </div>
                </div>
              )}

              {!hasVideo && lesson.content && (
                <div className="prose prose-lg prose-gray max-w-none">
                  <MarkdownRenderer content={lesson.content} />
                </div>
              )}

              {/* Learning Objectives */}
              <div className="bg-blue-50 p-6 rounded-lg mt-6">
                <h3 className="text-md font-semibold text-blue-900 mb-3">
                  What you&apos;ll learn
                </h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    Understanding the key concepts of {lesson.title}
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    Practical application techniques
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    Best practices and common pitfalls to avoid
                  </li>
                </ul>
              </div>
            </TabsContent>

            {/* Content/Notes Tab */}
            <TabsContent value="content" className="mt-6">
              {lesson.content && (
                <div className="prose prose-gray max-w-none">
                  <MarkdownRenderer content={lesson.content} />
                </div>
              )}
            </TabsContent>

            {/* Resources Tab */}
            <TabsContent value="resources" className="mt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Download Resources</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="justify-start h-auto p-4">
                      <Download className="h-4 w-4 mr-3 flex-shrink-0" />
                      <div className="text-left">
                        <div className="font-medium">Lesson Notes</div>
                        <div className="text-sm text-gray-500">PDF • 2.3 MB</div>
                      </div>
                    </Button>
                    
                    <Button variant="outline" className="justify-start h-auto p-4">
                      <FileText className="h-4 w-4 mr-3 flex-shrink-0" />
                      <div className="text-left">
                        <div className="font-medium">Exercise Files</div>
                        <div className="text-sm text-gray-500">ZIP • 1.8 MB</div>
                      </div>
                    </Button>
                  </div>
                </div>

                {/* Additional Resources */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Related Links</h3>
                  <div className="space-y-3">
                    <a href="#" className="block p-4 border rounded-lg hover:bg-gray-50">
                      <div className="font-medium text-blue-600">Official Documentation</div>
                      <div className="text-sm text-gray-500">External reference materials</div>
                    </a>
                    <a href="#" className="block p-4 border rounded-lg hover:bg-gray-50">
                      <div className="font-medium text-blue-600">Practice Exercises</div>
                      <div className="text-sm text-gray-500">Additional practice problems</div>
                    </a>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Discussions Tab */}
            <TabsContent value="discussions" className="mt-6">
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions yet</h3>
                <p className="text-gray-500 mb-6">
                  Be the first to ask a question about this lesson!
                </p>
                <Button>Start Discussion</Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* ========== NAVIGATION BAR (Bottom) - Fixed on Desktop ========== */}
      <div className="border-t bg-white/95 backdrop-blur-sm px-6 py-4 fixed bottom-0 left-0 right-0 lg:right-80 z-50 shadow-lg lg:shadow-none lg:border-t lg:bg-gray-50 lg:backdrop-blur-none">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Previous Lesson */}
          {previousLesson ? (
            <Button
              onClick={() => navigateToLesson(previousLesson)}
              variant="ghost"
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="h-4 w-4" />
              <div className="text-left">
                <div className="text-xs text-gray-500">Previous</div>
                <div className="text-sm font-medium truncate max-w-32">
                  {previousLesson.title}
                </div>
              </div>
            </Button>
          ) : (
            <div /> // Empty placeholder
          )}

          {/* Progress Indicator */}
          <div className="text-center">
            <div className="text-sm text-gray-500">
              Lesson {currentIndex + 1} of {allLessonsFlat.length}
            </div>
            <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / allLessonsFlat.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Next Lesson */}
          {nextLesson ? (
            <Button
              onClick={() => navigateToLesson(nextLesson)}
              variant="ghost"
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
            >
              <div className="text-right">
                <div className="text-xs text-gray-500">Next</div>
                <div className="text-sm font-medium truncate max-w-32">
                  {nextLesson.title}
                </div>
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={() => router.push(`/courses/${courseId}`)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Course Complete!
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}