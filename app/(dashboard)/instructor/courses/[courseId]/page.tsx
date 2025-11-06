import { requireInstructor } from "@/lib/current-user"
import { db } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { BookOpen, FileText, Settings, Eye } from "lucide-react"
import Link from "next/link"
import { CourseSettingsForm } from "./_components/course-settings-form"
import { ChaptersList } from "./_components/chapters-list"
import { PublishButton } from "./_components/publish-button"

export default async function CourseEditPage({
  params
}: {
  params: { courseId: string }
}) {
  const user = await requireInstructor()

  // Get course with chapters
  const course = await db.course.findUnique({
    where: {
      id: params.courseId
    },
    include: {
      chapters: {
        orderBy: { position: "asc" }
      },
      category: true,
      _count: {
        select: { enrollments: true }
      }
    }
  })

  if (!course) {
    notFound()
  }

  // Check if user is the instructor of this course
  if (course.instructorId !== user.id && user.role !== "ADMIN") {
    redirect("/instructor")
  }

  // Get all categories for the settings form
  const categories = await db.category.findMany({
    orderBy: { name: "asc" }
  })

  // Check if course is complete and can be published
  const isComplete = !!(
    course.title &&
    course.description &&
    course.imageUrl &&
    course.categoryId &&
    course.chapters.some(chapter => chapter.isPublished)
  )

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
            {course._count.enrollments > 0 && (
              <Badge variant="outline">
                {course._count.enrollments} student{course._count.enrollments !== 1 ? "s" : ""}
              </Badge>
            )}
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
        <Card className="mb-8 border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <p className="text-sm text-yellow-800">
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
              <ChaptersList courseId={course.id} chapters={course.chapters} />
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
