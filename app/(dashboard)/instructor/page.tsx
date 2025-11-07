'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, BookOpen, Users, DollarSign, Plus } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Container } from "@/components/ui/container"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { instructorCourseService, type InstructorCoursesResponse } from "@/lib/services/instructor-course.service"

export default function InstructorDashboard() {
  const router = useRouter()
  const [data, setData] = useState<InstructorCoursesResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function loadCoursesData() {
      try {
        setIsLoading(true)
        const result = await instructorCourseService.getInstructorCourses()
        setData(result)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        
        // Handle specific errors
        if (errorMessage === 'UNAUTHORIZED') {
          router.push('/sign-in')
        } else if (errorMessage === 'FORBIDDEN') {
          router.push('/')
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadCoursesData()
  }, [router])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !data) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-destructive">Failed to load dashboard</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  const { courses, stats } = data

  return (
    <DashboardLayout showBrowseCoursesButton={false}>
      <Container className="py-8">
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Instructor Dashboard</h1>
          <p className="text-muted-foreground">Manage your courses and track student progress</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Link href="/instructor/quizzes" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">
              <BookOpen className="mr-2 h-4 w-4" />
              Quizzes
            </Button>
          </Link>
          <Link href="/instructor/courses/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Create Course
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              {stats.publishedCount} published
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
            <Users className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Across all courses
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From all enrollments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Courses List */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Your Courses</h2>
          {courses.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {courses.length} course{courses.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        {courses.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <BookOpen className="h-12 w-12 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">No courses yet</h3>
              <p className="mb-4 text-center text-muted-foreground max-w-md">
                Create your first course to start teaching and sharing your knowledge with students
              </p>
              <Link href="/instructor/courses/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Course
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.map(course => (
              <Card key={course.id}>
                <CardContent className="p-4">
                  <div className="mb-3">
                    <div className="mb-3 h-40 w-full rounded-lg bg-muted overflow-hidden">
                      {course.imageUrl ? (
                        <img
                          src={course.imageUrl}
                          alt={course.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-primary/10">
                          <div className="text-center">
                            <BookOpen className="h-8 w-8 mx-auto text-primary/60 mb-2" />
                            <p className="text-xs text-muted-foreground font-medium px-2 line-clamp-2">{course.title}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mb-2 flex items-start justify-between">
                      <h3 className="font-semibold">{course.title}</h3>
                      <Badge variant={course.isPublished ? "default" : "secondary"}>
                        {course.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    {course.categoryId && (
                      <Badge variant="outline" className="mb-2">
                        {course.categoryId}
                      </Badge>
                    )}
                  </div>

                  <div className="mb-4 space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>Students:</span>
                      <span className="font-medium">{course._count.enrollments}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Chapters:</span>
                      <span className="font-medium">{course._count?.chapters || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Price:</span>
                      <span className="font-medium">
                        {course.price ? `$${course.price}` : "Free"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/instructor/courses/${course.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/courses/${course.id}`} className="flex-1">
                      <Button variant="ghost" className="w-full">
                        View
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </DashboardLayout>
  )
}
