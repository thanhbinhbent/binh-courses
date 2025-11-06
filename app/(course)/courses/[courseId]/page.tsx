import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/current-user"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { BookOpen, Clock, Award, CheckCircle2, PlayCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { EnrollButton } from "./_components/enroll-button"

export default async function CourseDetailPage({
  params
}: {
  params: { courseId: string }
}) {
  const user = await getCurrentUser()
  
  const course = await db.course.findUnique({
    where: { 
      id: params.courseId,
      isPublished: true
    },
    include: {
      category: true,
      instructor: {
        select: {
          name: true,
          image: true,
          bio: true
        }
      },
      chapters: {
        where: { isPublished: true },
        orderBy: { position: "asc" },
        include: {
          userProgress: user ? {
            where: { userId: user.id }
          } : false
        }
      },
      _count: {
        select: {
          enrollments: true,
          reviews: true
        }
      }
    }
  })

  if (!course) {
    redirect("/courses")
  }

  // Check if user is enrolled
  const enrollment = user ? await db.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId: course.id
      }
    }
  }) : null

  const isEnrolled = !!enrollment
  const isFree = !course.price || course.price === 0

  // Calculate progress if enrolled
  let progress = 0
  if (isEnrolled && course.chapters.length > 0) {
    const completedChapters = course.chapters.filter(
      chapter => chapter.userProgress?.[0]?.isCompleted
    ).length
    progress = Math.round((completedChapters / course.chapters.length) * 100)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/courses" className="flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              <span className="text-xl font-bold">Modern LMS</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Image */}
            {course.imageUrl && (
              <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-lg">
                <Image
                  src={course.imageUrl}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Course Info */}
            <div className="mb-6">
              <div className="mb-4 flex items-center gap-2">
                {course.category && (
                  <Badge variant="secondary">{course.category.name}</Badge>
                )}
                <Badge variant="outline">{course.level}</Badge>
              </div>

              <h1 className="mb-4 text-3xl font-bold">{course.title}</h1>

              {course.description && (
                <p className="mb-6 text-lg text-muted-foreground">
                  {course.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{course.chapters.length} chapters</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  <span>{course._count.enrollments} students</span>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Instructor */}
            <div className="mb-6">
              <h2 className="mb-4 text-xl font-semibold">Instructor</h2>
              <div className="flex items-start gap-4">
                {course.instructor.image && (
                  <div className="relative h-16 w-16 overflow-hidden rounded-full">
                    <Image
                      src={course.instructor.image}
                      alt={course.instructor.name || "Instructor"}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="font-semibold">{course.instructor.name}</p>
                  {course.instructor.bio && (
                    <p className="text-sm text-muted-foreground">
                      {course.instructor.bio}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Chapters */}
            <div>
              <h2 className="mb-4 text-xl font-semibold">Course Content</h2>
              <div className="space-y-2">
                {course.chapters.map((chapter, index) => (
                  <Card key={chapter.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{chapter.title}</p>
                          {chapter.duration && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{Math.round(chapter.duration / 60)} min</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {chapter.isFree && (
                          <Badge variant="outline" className="text-xs">
                            Preview
                          </Badge>
                        )}
                        {isEnrolled && chapter.userProgress?.[0]?.isCompleted && (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        )}
                        {(isEnrolled || chapter.isFree) && (
                          <Link href={`/courses/${course.id}/chapters/${chapter.id}`}>
                            <Button size="sm" variant="ghost">
                              <PlayCircle className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>
                  {isEnrolled ? (
                    <div className="text-green-600">Enrolled</div>
                  ) : isFree ? (
                    <div className="text-2xl font-bold">Free</div>
                  ) : (
                    <div className="text-2xl font-bold">${course.price}</div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEnrolled ? (
                  <>
                    {/* Progress */}
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span>Your Progress</span>
                        <span className="font-semibold">{progress}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full bg-green-600"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Continue Learning Button */}
                    <Link href={`/courses/${course.id}/chapters/${course.chapters[0]?.id}`}>
                      <Button className="w-full" size="lg">
                        Continue Learning
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    {/* Enroll Button */}
                    {user ? (
                      <EnrollButton courseId={course.id} isFree={isFree} />
                    ) : (
                      <Link href="/sign-in">
                        <Button className="w-full" size="lg">
                          Sign In to Enroll
                        </Button>
                      </Link>
                    )}
                  </>
                )}

                <Separator />

                {/* What's Included */}
                <div>
                  <h3 className="mb-3 font-semibold">This course includes:</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>{course.chapters.length} chapters</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Lifetime access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Certificate of completion</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
