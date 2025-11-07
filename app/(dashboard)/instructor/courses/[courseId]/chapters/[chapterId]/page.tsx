'use client'

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChapterDetailsForm } from "./_components/chapter-details-form"
// import { ChapterVideoForm } from "./_components/chapter-video-form" // Removed component
import { ChapterAccessForm } from "./_components/chapter-access-form"
import { instructorCourseService } from "@/lib/services/instructor-course.service"
import type { ChapterDetailsResponse } from "@/lib/services/instructor-course.service"

export default function ChapterEditPage({
  params
}: {
  params: Promise<{ courseId: string; chapterId: string }>
}) {
  const { courseId, chapterId } = use(params)
  const router = useRouter()
  const [data, setData] = useState<ChapterDetailsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadChapterData() {
      try {
        setIsLoading(true)
        const result = await instructorCourseService.getChapterWithDetails(
          courseId,
          chapterId
        )
        setData(result)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        
        // Handle specific errors
        if (errorMessage === 'UNAUTHORIZED') {
          router.push('/sign-in')
        } else if (errorMessage === 'FORBIDDEN' || errorMessage === 'NOT_FOUND') {
          router.push(`/instructor/courses/${courseId}`)
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
      <div className="flex h-[80vh] items-center justify-center">
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
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-destructive">
            {error === 'NOT_FOUND' ? 'Chapter not found' : 'Failed to load chapter'}
          </p>
          <Button asChild variant="outline">
            <Link href={`/instructor/courses/${courseId}`}>
              Back to Course
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const { chapter, completion } = data
  const completionText = `(${completion.completed}/${completion.total})`

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/instructor/courses/${courseId}`}
          className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to course setup
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Chapter Setup</h1>
            <p className="text-muted-foreground">
              Complete all fields {completionText}
            </p>
          </div>
          <Badge variant={chapter.isPublished ? "default" : "secondary"}>
            {chapter.isPublished ? "Published" : "Draft"}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chapter Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chapter Details</CardTitle>
            </CardHeader>
            <CardContent>
              <ChapterDetailsForm
                courseId={courseId}
                chapterId={chapterId}
                initialData={{
                  title: chapter.title,
                  description: chapter.description || ""
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Access Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <ChapterAccessForm
                courseId={courseId}
                chapterId={chapterId}
                initialData={{
                  isFree: chapter.isFree,
                  isPublished: chapter.isPublished
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Video & Resources */}
        <div className="space-y-6">
          {/* Video management moved to lesson level */}
          <Card>
            <CardHeader>
              <CardTitle>Chapter Lessons</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Lesson management coming soon. Videos are managed at lesson level.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chapter Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Resource management coming soon...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex justify-end gap-4">
        <Link href={`/instructor/courses/${courseId}`}>
          <Button variant="outline">Done</Button>
        </Link>
      </div>
    </div>
  )
}
