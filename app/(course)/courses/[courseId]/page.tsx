'use client'

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { Loader2, BookOpen, Clock, Award, CheckCircle2, PlayCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Container } from "@/components/ui/container"
import { PublicLayout } from "@/components/layout/public-layout"
import { EnrollButton } from "./_components/enroll-button"
import { CourseReviews } from "./_components/course-reviews"
import { AddReviewForm } from "./_components/add-review-form"
import { courseService, type CourseDetailsResponse } from "@/lib/services/course.service"

export default function CourseDetailPage({
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
        const result = await courseService.getCourseDetails(courseId)
        setData(result)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        
        if (errorMessage === 'NOT_FOUND') {
          router.push('/courses')
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
      <div className="flex h-screen items-center justify-center">
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
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-destructive">Failed to load course</p>
          <Button onClick={() => router.push('/courses')} variant="outline">
            Back to Courses
          </Button>
        </div>
      </div>
    )
  }

  const { course, isEnrolled, isFree, reviews, averageRating, userReview, progress, user } = data

  return (
    <PublicLayout>
      <Container className="py-8">
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
                  <span>{course._count?.enrollments || 0} students</span>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Instructor */}
            {course.instructor && (
              <>
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
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />
              </>
            )}

            {/* Chapters */}
            <div>
              <h2 className="mb-4 text-xl font-semibold">Course Content</h2>
              <div className="space-y-2">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {course.chapters.map((chapter: any, index: number) => (
                  <Card key={chapter.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
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
                          <CheckCircle2 className="h-5 w-5 text-success" />
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

            {/* Reviews Section */}
            <div>
              <h2 className="mb-4 text-xl font-semibold">Student Reviews</h2>
              
              {/* Add/Edit Review Form (only for enrolled students) */}
              {isEnrolled && user && (
                <div className="mb-6">
                  <AddReviewForm courseId={course.id} existingReview={userReview || undefined} />
                </div>
              )}

              {/* Reviews List */}
              <CourseReviews
                reviews={reviews as Array<{
                  id: string
                  rating: number
                  comment: string | null
                  userId: string
                  user: {
                    name: string | null
                    image: string | null
                  }
                  createdAt: Date
                }>}
                averageRating={averageRating}
                totalReviews={reviews.length}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>
                  {isEnrolled ? (
                    <div className="text-success">Enrolled</div>
                  ) : isFree ? (
                    <div className="text-2xl font-bold text-foreground">Free</div>
                  ) : (
                    <div className="text-2xl font-bold text-foreground">${course.price}</div>
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
                      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full bg-success"
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
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <span>{course.chapters.length} chapters</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <span>Lifetime access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <span>Certificate of completion</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </PublicLayout>
  )
}
