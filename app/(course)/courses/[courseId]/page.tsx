'use client'

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { Loader2, BookOpen, Award, CheckCircle2, PlayCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Container } from "@/components/ui/container"
import { PublicLayout } from "@/components/layout/public-layout"
import { EnrollButton } from "./_components/enroll-button"
// import { CourseReviews } from "./_components/course-reviews"  
// import { AddReviewForm } from "./_components/add-review-form"
import { CourseContent } from "./_components/course-content"
import { courseService, type CourseDetailsResponse } from "@/lib/services/course.service"
// import type { ChapterWithLessons } from "@/types/course.d" // Will be used later

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

  const { course, isEnrolled, isFree, progress, user } = data
  // const chapters = course.chapters as ChapterWithLessons[] // Will be used later
  // Removed unused variables: reviews, averageRating, userReview

  return (
    <PublicLayout>
      <Container className="py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left side on desktop, bottom on mobile */}
          <div className="lg:col-span-2 order-2 lg:order-1 space-y-8">
            {/* Course Image */}
            {course.imageUrl && (
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border shadow-sm">
                <Image
                  src={course.imageUrl}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Course Info */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {course.category && (
                    <Badge variant="secondary" className="px-3 py-1">
                      {course.category.name}
                    </Badge>
                  )}
                  <Badge variant="outline" className="px-3 py-1">
                    {course.level}
                  </Badge>
                </div>

                <h1 className="text-3xl lg:text-4xl font-bold leading-tight">
                  {course.title}
                </h1>

                {course.description && (
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {course.description}
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span className="font-medium">{course.chapters.length} chapters</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Award className="h-4 w-4" />
                  <span className="font-medium">{course._count?.enrollments || 0} students</span>
                </div>
              </div>
            </div>

            {/* Instructor */}
            {course.instructor && (
              <Card className="border-l-4 border-l-primary">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">Meet Your Instructor</h3>
                  <div className="flex items-start gap-4">
                    {course.instructor.image && (
                      <div className="relative h-16 w-16 overflow-hidden rounded-full ring-2 ring-muted">
                        <Image
                          src={course.instructor.image}
                          alt={course.instructor.name || "Instructor"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-lg">{course.instructor.name}</p>
                      <p className="text-sm text-muted-foreground">Course Instructor</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Course Content */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-xl font-semibold mb-4">Course Content</h3>
              {course.chapters && course.chapters.length > 0 ? (
                <CourseContent 
                  chapters={course.chapters}
                  isEnrolled={isEnrolled}
                />
              ) : (
                <p className="text-gray-600">No course content available yet.</p>
              )}
            </div>

            {/* Reviews Section */}
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Student Reviews</h2>
                <p className="text-muted-foreground">
                  See what other students are saying about this course
                </p>
              </div>
              
              {/* Add/Edit Review Form (only for enrolled students) */}
              {isEnrolled && user && (
                <Card className="border-dashed">
                  <CardContent className="pt-6">
                    <p className="text-gray-600">Review form will be here</p>
                  </CardContent>
                </Card>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                <p className="text-gray-600">Reviews will be displayed here</p>
              </div>
              {/* Reviews component commented out */}
            </div>
          </div>

          {/* Sidebar - Right side on desktop, top on mobile */}
          <div className="order-1 lg:order-2 space-y-6">
            <Card className="sticky top-6 shadow-lg border-2">
              <CardHeader className="pb-4">
                <CardTitle className="text-center">
                  {isEnrolled ? (
                    <div className="space-y-2">
                      <Badge className="bg-green-100 text-green-800 border-green-200 px-4 py-2">
                        ✓ Enrolled
                      </Badge>
                    </div>
                  ) : isFree ? (
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-green-600">Free</div>
                      <p className="text-sm text-muted-foreground font-normal">
                        No cost to start learning
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-primary">${course.price}</div>
                      <p className="text-sm text-muted-foreground font-normal">
                        One-time payment
                      </p>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {isEnrolled ? (
                  <>
                    {/* Progress */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Your Progress</span>
                        <span className="text-lg font-bold text-primary">{progress}%</span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-muted border">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        Keep going! You&apos;re doing great
                      </p>
                    </div>

                    {/* Continue Learning Button */}
                    <Link href={`/courses/${course.id}/learn?chapter=${course.chapters[0]?.id}`}>
                      <Button className="w-full h-12 text-base font-semibold" size="lg">
                        <PlayCircle className="mr-2 h-5 w-5" />
                        Continue Learning
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    {/* Enroll Button */}
                    {user ? (
                      <EnrollButton
                        courseId={course.id}
                        coursePrice={course.price}
                        isEnrolled={isEnrolled}
                        disabled={false}
                      />
                    ) : (
                      <Link href="/sign-in">
                        <Button className="w-full h-12 text-base font-semibold" size="lg">
                          Sign In to Enroll
                        </Button>
                      </Link>
                    )}
                  </>
                )}

                <Separator />

                {/* What's Included */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">This course includes:</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <span className="font-medium">{course.chapters.length} chapters</span>
                        <p className="text-xs text-muted-foreground">
                          Comprehensive curriculum
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <span className="font-medium">Lifetime access</span>
                        <p className="text-xs text-muted-foreground">
                          Learn at your own pace
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <span className="font-medium">Certificate of completion</span>
                        <p className="text-xs text-muted-foreground">
                          Validate your skills
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <span className="font-medium">Mobile friendly</span>
                        <p className="text-xs text-muted-foreground">
                          Learn anywhere, anytime
                        </p>
                      </div>
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
