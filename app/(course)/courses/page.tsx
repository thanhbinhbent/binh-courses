'use client'

import { useEffect, useState } from "react"
import { Loader2, BookOpen, Clock, Star } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"
import { PublicLayout } from "@/components/layout/public-layout"
import { courseService, type CoursesListResponse } from "@/lib/services/course.service"

export default function CoursesPage() {
  const [data, setData] = useState<CoursesListResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCoursesData() {
      try {
        setIsLoading(true)
        const result = await courseService.getCourses()
        setData(result)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    loadCoursesData()
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading courses...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !data) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-destructive">Failed to load courses</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  const { courses, categories } = data

  return (
    <PublicLayout>

      <Container className="py-8">
        {/* Page Header */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="mb-2 text-4xl font-bold text-foreground">Explore Courses</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Choose from {courses.length} expertly crafted courses to advance your career and achieve your learning goals
          </p>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-foreground">Browse by Category</h2>
            <div className="flex flex-wrap gap-2">
              <Link href="/courses">
                <Badge variant="default" className="cursor-pointer px-4 py-2 text-sm hover:bg-primary/90 transition-colors">
                  All Courses
                </Badge>
              </Link>
              {categories.map(category => (
                <Link key={category.id} href={`/courses?category=${category.slug}`}>
                  <Badge variant="outline" className="cursor-pointer px-4 py-2 text-sm hover:bg-secondary transition-colors">
                    {category.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Courses Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map(course => (
            <Link key={course.id} href={`/courses/${course.id}`}>
              <Card className="group h-full cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] bg-card border-border">
                {/* Course Image */}
                <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
                  {course.imageUrl ? (
                    <Image
                      src={course.imageUrl}
                      alt={course.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <CardHeader>
                  {/* Category & Level */}
                  <div className="mb-2 flex items-center justify-between">
                    {course.category && (
                      <Badge variant="secondary" className="text-xs">
                        {course.category.name}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {course.level}
                    </Badge>
                  </div>

                  {/* Title */}
                  <CardTitle className="line-clamp-2 text-lg">
                    {course.title}
                  </CardTitle>

                  {/* Instructor */}
                  {course.instructor && (
                    <p className="text-sm text-muted-foreground">
                      by {course.instructor.name}
                    </p>
                  )}
                </CardHeader>

                <CardContent>
                  {/* Description */}
                  {course.description && (
                    <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                      {course.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.chapters.length} chapters</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{course._count?.enrollments || 0} students</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mt-4 flex items-center justify-between">
                    {course.price && course.price > 0 ? (
                      <p className="text-lg font-bold">${course.price}</p>
                    ) : (
                      <Badge variant="default" className="bg-green-600">
                        FREE
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {courses.length === 0 && (
          <Card className="p-12 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-semibold">No courses available</h3>
            <p className="text-muted-foreground">
              Check back later for new courses
            </p>
          </Card>
        )}
      </Container>
    </PublicLayout>
  )
}
