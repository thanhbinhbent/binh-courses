'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, BookOpen, Award, Clock, TrendingUp } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Container } from "@/components/ui/container"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { AuthGuard } from "@/components/auth-guard"
import { dashboardService } from "@/lib/services/dashboard.service"
import type { StudentDashboardResponse } from "@/lib/types"

export default function Dashboard() {
  const router = useRouter()
  const [data, setData] = useState<StudentDashboardResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setIsLoading(true)
        const result = await dashboardService.getDashboard()
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

  const { enrollments, inProgressCourses, completedCourses, stats, user } = data
  // Removed unused variable: certificates

  return (
    <AuthGuard>
      <DashboardLayout>

      <Container className="py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">Welcome back, {user.name}! 👋</h1>
            <Badge variant={user.globalRoles.includes('SYSTEM_ADMIN') ? 'default' : 'secondary'}>
              {user.globalRoles.includes('SYSTEM_ADMIN') ? 'Admin' : 'User'}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {user.globalRoles.includes('SYSTEM_ADMIN') ? 'Admin dashboard' : 'Your learning dashboard'}
          </p>
          {!user.globalRoles.includes('SYSTEM_ADMIN') && (
            <p className="text-sm text-blue-600 mt-2">
              Visit <Link href="/my-courses" className="font-medium hover:underline">My Courses</Link> to see all your enrolled courses
            </p>
          )}
          {user.globalRoles.includes('SYSTEM_ADMIN') && (
            <p className="text-sm text-green-600 mt-2">
              Go to your <Link href="/instructor" className="font-medium hover:underline">Instructor Panel</Link> to manage courses and students
            </p>
          )}
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalCourses}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Enrolled courses
              </p>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Currently learning
              </p>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.completed}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Courses finished
              </p>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Certificates</CardTitle>
              <Award className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.certificatesCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Earned certificates
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Courses in Progress */}
        {inProgressCourses.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Continue Learning</h2>
              <Link href="/my-courses">
                <Button variant="outline" size="sm">
                  View All Courses
                </Button>
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {inProgressCourses.map((course: any) => (
                <Link key={course.id} href={`/courses/${course.id}`}>
                  <Card className="group cursor-pointer transition-all hover:shadow-lg">
                    <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
                      {course.imageUrl && !imageErrors.has(course.id) ? (
                        <Image
                          src={course.imageUrl}
                          alt={course.title}
                          width={300}
                          height={200}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          onError={() => setImageErrors(prev => new Set(prev).add(course.id))}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-primary/10">
                          <div className="text-center">
                            <BookOpen className="h-12 w-12 mx-auto text-primary/60 mb-2" />
                            <p className="text-xs text-muted-foreground font-medium px-2 line-clamp-2">{course.title}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                      {/* Category name will be loaded from API */}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Course progress</span>
                          <span className="font-medium">--</span>
                        </div>
                        <Progress value={0} />
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Completed Courses</h2>
              <Link href="/my-courses">
                <Button variant="outline" size="sm">
                  View All Courses
                </Button>
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completedCourses.map((course: any) => (
                <Link key={course.id} href={`/courses/${course.id}`}>
                  <Card className="group cursor-pointer transition-all hover:shadow-lg">
                    <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
                      {course.imageUrl && !imageErrors.has(course.id) ? (
                        <Image
                          src={course.imageUrl}
                          alt={course.title}
                          width={300}
                          height={200}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          onError={() => setImageErrors(prev => new Set(prev).add(course.id))}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-primary/10">
                          <div className="text-center">
                            <BookOpen className="h-12 w-12 mx-auto text-primary/60 mb-2" />
                            <p className="text-xs text-muted-foreground font-medium px-2 line-clamp-2">{course.title}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                      {/* Category name will be loaded from API */}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-success">
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
      </Container>
    </DashboardLayout>
    </AuthGuard>
  )
}
