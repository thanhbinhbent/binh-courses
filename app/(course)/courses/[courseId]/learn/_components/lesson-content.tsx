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
    <div className="w-full bg-card">
      
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
      <div className="border-b bg-card px-6 py-4">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            {/* Lesson Type & Duration */}
            <div className="flex items-center gap-3 mb-3">
              <Badge 
                variant={isVideoLesson ? "default" : "secondary"} 
                className={`text-xs font-medium ${
                  isVideoLesson 
                    ? "status-info" 
                    : "bg-muted text-muted-foreground"
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
                <span className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  {lesson.duration} min
                </span>
              )}
            </div>
            
            {/* Lesson Title & Chapter Info */}
            <h1 className="text-2xl font-bold text-foreground mb-1 leading-tight">
              {lesson.title}
            </h1>
            <p className="text-sm text-muted-foreground">{chapter.title}</p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Button
              onClick={toggleComplete}
              variant={isCompleted ? "secondary" : "default"}
              size="sm"
              className={isCompleted 
                ? "bg-success text-white hover:bg-success/90" 
                : "bg-primary hover:bg-primary/90 text-white"
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
          
          {/* Content Layout - Conditional Tabs or Direct Content */}
          {hasVideo ? (
            // Video lessons: Show tabs with description and content separated
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">About</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="discussions">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Q&A
                </TabsTrigger>
              </TabsList>

              {/* About/Description Tab */}
              <TabsContent value="description" className="mt-6">
                {lesson.description && (
                  <div className="prose prose-gray max-w-none">
                    <MarkdownRenderer content={lesson.description} />
                  </div>
                )}
                
                {lesson.content && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Notes & Additional Content</h3>
                    <div className="prose prose-gray max-w-none">
                      <MarkdownRenderer content={lesson.content} />
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Resources Tab */}
              <TabsContent value="resources" className="mt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-md font-medium text-foreground mb-4">Download Resources</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button variant="outline" className="justify-start h-auto p-4">
                        <Download className="h-4 w-4 mr-3 flex-shrink-0" />
                        <div className="text-left">
                          <div className="font-medium">Lesson Notes</div>
                          <div className="text-sm text-muted-foreground">PDF • 2.3 MB</div>
                        </div>
                      </Button>
                      
                      <Button variant="outline" className="justify-start h-auto p-4">
                        <FileText className="h-4 w-4 mr-3 flex-shrink-0" />
                        <div className="text-left">
                          <div className="font-medium">Exercise Files</div>
                          <div className="text-sm text-muted-foreground">ZIP • 1.8 MB</div>
                        </div>
                      </Button>
                    </div>
                  </div>

                  {/* Additional Resources */}
                  <div>
                    <h3 className="text-md font-medium text-foreground mb-4">Related Links</h3>
                    <div className="space-y-3">
                      <a href="#" className="block p-4 border rounded-lg hover:bg-muted/50">
                        <div className="font-medium text-primary">Official Documentation</div>
                        <div className="text-sm text-muted-foreground">External reference materials</div>
                      </a>
                      <a href="#" className="block p-4 border rounded-lg hover:bg-muted/50">
                        <div className="font-medium text-primary">Practice Exercises</div>
                        <div className="text-sm text-muted-foreground">Additional practice problems</div>
                      </a>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Discussions Tab */}
              <TabsContent value="discussions" className="mt-6">
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No discussions yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Be the first to ask a question about this lesson!
                  </p>
                  <Button>Start Discussion</Button>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            // Non-video lessons: Show content directly without tabs to avoid duplication
            <div className="w-full">
              {lesson.content && (
                <div className="prose prose-lg prose-gray max-w-none">
                  <MarkdownRenderer content={lesson.content} />
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ========== NAVIGATION BAR (Bottom) - Fixed on Desktop ========== */}
      <div className="border-t bg-card/95 backdrop-blur-sm px-6 py-4 fixed bottom-0 left-0 right-0 lg:right-80 z-50 shadow-lg lg:shadow-none lg:border-t lg:bg-muted/50 lg:backdrop-blur-none">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Previous Lesson */}
          {previousLesson ? (
            <Button
              onClick={() => navigateToLesson(previousLesson)}
              variant="ghost"
              className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg"
            >
              <ChevronLeft className="h-4 w-4" />
              <div className="text-left">
                <div className="text-xs text-muted-foreground">Previous</div>
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
            <div className="text-sm text-muted-foreground">
              Lesson {currentIndex + 1} of {allLessonsFlat.length}
            </div>
            <div className="w-32 bg-muted rounded-full h-2 mt-1">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / allLessonsFlat.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Next Lesson */}
          {nextLesson ? (
            <Button
              onClick={() => navigateToLesson(nextLesson)}
              variant="ghost"
              className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg"
            >
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Next</div>
                <div className="text-sm font-medium truncate max-w-32">
                  {nextLesson.title}
                </div>
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={() => router.push(`/courses/${courseId}`)}
              className="bg-success hover:bg-success/90 text-white"
            >
              Course Complete!
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}