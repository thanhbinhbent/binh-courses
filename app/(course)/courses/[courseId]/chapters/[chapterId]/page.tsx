'use client'

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { Loader2, BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Lock } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { VideoPlayer } from "./_components/video-player"
import { CompleteButton } from "./_components/complete-button"
import { courseService, type ChapterViewResponse } from "@/lib/services/course.service"
import type { Chapter } from "@/lib/types"

export default function ChapterPage({
  params
}: {
  params: Promise<{ courseId: string; chapterId: string }>
}) {
  const { courseId, chapterId } = use(params)
  const router = useRouter()
  const [data, setData] = useState<ChapterViewResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadChapterData() {
      try {
        setIsLoading(true)
        const result = await courseService.getChapterView(courseId, chapterId)
        setData(result)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        
        if (errorMessage === 'UNAUTHORIZED') {
          router.push('/sign-in')
        } else if (errorMessage === 'FORBIDDEN' || errorMessage === 'NOT_FOUND') {
          router.push(`/courses/${courseId}`)
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadChapterData()
  }, [courseId, chapterId, router])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading chapter...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !data) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-destructive">Failed to load chapter</p>
          <Button onClick={() => router.push(`/courses/${courseId}`)} variant="outline">
            Back to Course
          </Button>
        </div>
      </div>
    )
  }

  const { chapter, isEnrolled, isCompleted, previousChapter, nextChapter, progress } = data

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="w-full border-b bg-card">
        <div className="flex items-center justify-between py-4 px-4 sm:px-6 lg:px-8">
          <Link href={`/courses/${courseId}`} className="flex items-center gap-2">
            <ChevronLeft className="h-5 w-5" />
            <span className="font-medium">{chapter.course?.title || 'Course'}</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Progress: <span className="font-semibold">{progress}%</span>
            </div>
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Video Player */}
          {chapter.videoUrl && (
            <div className="aspect-video w-full bg-muted">
              <VideoPlayer
                chapterId={chapter.id}
                videoUrl={chapter.videoUrl}
                isCompleted={isCompleted}
              />
            </div>
          )}

          {/* Chapter Content */}
          <div className="py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h1 className="mb-2 text-3xl font-bold text-foreground">{chapter.title}</h1>
                {isCompleted && (
                  <Badge variant="default" className="bg-success text-success-foreground">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Completed
                  </Badge>
                )}
              </div>
              {!isCompleted && (
                <CompleteButton chapterId={chapter.id} />
              )}
            </div>

            <Separator className="my-6" />

            {/* Description */}
            {chapter.description && (
              <div className="mb-8">
                <h2 className="mb-4 text-xl font-semibold">About this chapter</h2>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {chapter.description}
                </p>
              </div>
            )}

            {/* Resources */}
            {chapter.resources && chapter.resources.length > 0 && (
              <div className="mb-8">
                <h2 className="mb-4 text-xl font-semibold">Resources</h2>
                <div className="space-y-2">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {chapter.resources.map((resource: any) => (
                    <Card key={resource.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-5 w-5 text-muted-foreground" />
                          <span>{resource.name}</span>
                        </div>
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm">
                            Open
                          </Button>
                        </a>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              {previousChapter ? (
                <Link href={`/courses/${courseId}/chapters/${previousChapter.id}`}>
                  <Button variant="outline">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                </Link>
              ) : (
                <div />
              )}

              {nextChapter ? (
                <Link href={`/courses/${courseId}/chapters/${nextChapter.id}`}>
                  <Button>
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link href={`/courses/${courseId}`}>
                  <Button variant="outline">Back to Course</Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Chapter List */}
        <div className="hidden w-80 border-l bg-card lg:block">
          <div className="sticky top-0 h-screen overflow-y-auto p-4">
            <h3 className="mb-4 font-semibold text-foreground">Course Content</h3>
            <div className="space-y-1">
              {chapter.course?.chapters?.map((courseChapter: Chapter, index: number) => {
                const isCurrentChapter = courseChapter.id === chapterId
                const isChapterCompleted = false // Progress info not included in this response
                const isLocked = !isEnrolled && !courseChapter.isFree

                return (
                  <Link
                    key={courseChapter.id}
                    href={isLocked ? '#' : `/courses/${courseId}/chapters/${courseChapter.id}`}
                    className={`block ${isLocked ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    <div
                      className={`flex items-center gap-3 rounded-lg p-3 transition-colors ${
                        isCurrentChapter
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-secondary'
                      }`}
                    >
                      <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                        isCurrentChapter
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          isCurrentChapter ? 'text-primary' : 'text-foreground'
                        }`}>
                          {courseChapter.title}
                        </p>
                        {courseChapter.duration && (
                          <p className="text-xs text-muted-foreground">
                            {Math.round(courseChapter.duration / 60)} min
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                        {isChapterCompleted && (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
