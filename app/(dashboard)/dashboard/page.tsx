'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, BookOpen, Award, Clock, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { studentService } from "@/lib/services/student.service"
import type { StudentDashboardResponse } from "@/lib/types"

export default function StudentDashboard() {
  const router = useRouter()
  const [data, setData] = useState<StudentDashboardResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setIsLoading(true)
        const result = await studentService.getDashboard()
        setData(result)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        
        if (errorMessage === 'UNAUTHORIZED') {
          router.push('/sign-in')
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [router])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
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
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-destructive">Failed to load dashboard</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  const { enrollments, inProgressCourses, completedCourses, certificates, stats, user } = data

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              <span className="text-xl font-bold">Modern LMS</span>
            </div>
            <Link href="/courses">
              <Button>Browse Courses</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome back, {user.name}! 👋</h1>
          <p className="text-muted-foreground">Continue your learning journey</p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Certificates</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.certificatesCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Courses in Progress */}
        {inProgressCourses.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-bold">Continue Learning</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {inProgressCourses.map(course => (
                <Link key={course.id} href={`/courses/${course.id}`}>
                  <Card className="group cursor-pointer transition-all hover:shadow-lg">
                    {course.imageUrl && (
                      <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                        <img
                          src={course.imageUrl}
                          alt={course.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                      {course.category && (
                        <p className="text-sm text-muted-foreground">{course.category.name}</p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>{course.completedChapters} / {course.totalChapters} chapters</span>
                          <span className="font-medium">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Completed Courses */}
        {completedCourses.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-bold">Completed Courses</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completedCourses.map(course => (
                <Link key={course.id} href={`/courses/${course.id}`}>
                  <Card className="group cursor-pointer transition-all hover:shadow-lg">
                    {course.imageUrl && (
                      <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                        <img
                          src={course.imageUrl}
                          alt={course.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                      {course.category && (
                        <p className="text-sm text-muted-foreground">{course.category.name}</p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-green-600">
                        <Award className="h-4 w-4" />
                        <span className="text-sm font-medium">Completed</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {enrollments.length === 0 && (
          <Card className="p-12 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-semibold">No courses yet</h3>
            <p className="mb-4 text-muted-foreground">
              Start your learning journey by enrolling in a course
            </p>
            <Link href="/courses">
              <Button>Browse Courses</Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  )
}
