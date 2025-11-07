'use client'

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { Loader2, BookOpen, FileText, Settings, Eye } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CourseSettingsForm } from "./_components/course-settings-form"
// import { ChaptersList } from "./_components/chapters-list" // Removed component
import { PublishButton } from "./_components/publish-button"
import { instructorCourseService } from "@/lib/services/instructor-course.service"
import type { CourseDetailsResponse } from "@/lib/services/instructor-course.service"

export default function CourseEditPage({
  params
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = use(params)
  const router = useRouter()
  const [data, setData] = useState<CourseDetailsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCourseData() {
      try {
        setIsLoading(true)
        const result = await instructorCourseService.getCourseWithDetails(courseId)
        setData(result)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        
        // Handle specific errors
        if (errorMessage === 'UNAUTHORIZED') {
          router.push('/sign-in')
        } else if (errorMessage === 'FORBIDDEN' || errorMessage === 'NOT_FOUND') {
          router.push('/instructor/courses')
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadCourseData()
  }, [courseId, router])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading course...</p>
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
            {error === 'NOT_FOUND' ? 'Course not found' : 'Failed to load course'}
          </p>
          <Button asChild variant="outline">
            <Link href="/instructor/courses">Back to Courses</Link>
          </Button>
        </div>
      </div>
    )
  }

  const { course, categories, isComplete } = data

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">{course.title}</h1>
          <div className="flex items-center gap-2">
            <Badge variant={course.isPublished ? "default" : "secondary"}>
              {course.isPublished ? "Published" : "Draft"}
            </Badge>
            {/* Enrollment count will be added later */}
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/courses/${course.id}`} target="_blank">
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
          </Link>
          <PublishButton
            courseId={course.id}
            isPublished={course.isPublished}
            isComplete={isComplete}
          />
        </div>
      </div>

      {!isComplete && (
        <Card className="mb-8">
          <CardContent className="p-4">
            <p className="text-sm text-warning-foreground">
              <strong>Complete your course:</strong> Add an image, ensure you have a published chapter, 
              and verify all required fields are filled before publishing.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Course Settings */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Course Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CourseSettingsForm course={course} categories={categories} />
            </CardContent>
          </Card>
        </div>

        {/* Chapters */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Course Chapters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Chapters management coming soon...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Additional Features (For Future Implementation) */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Quizzes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Quiz management coming soon...
            </p>
          </CardContent>
        </Card>

        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Course-wide resources coming soon...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
