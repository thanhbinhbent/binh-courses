import { requireInstructor } from "@/lib/current-user"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, DollarSign, Plus } from "lucide-react"
import Link from "next/link"

export default async function InstructorDashboard() {
  const user = await requireInstructor()

  // Get all courses created by this instructor
  const courses = await db.course.findMany({
    where: {
      instructorId: user.id
    },
    include: {
      _count: {
        select: {
          enrollments: true,
          chapters: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  })

  // Calculate total students and revenue
  const totalStudents = courses.reduce((acc, course) => acc + course._count.enrollments, 0)
  const totalRevenue = courses.reduce((acc, course) => {
    return acc + (course.price || 0) * course._count.enrollments
  }, 0)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
        <Link href="/instructor/courses/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
            <p className="text-xs text-muted-foreground">
              {courses.filter(c => c.isPublished).length} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Across all courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From all enrollments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Courses List */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Your Courses</h2>
        {courses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No courses yet</h3>
              <p className="mb-4 text-center text-muted-foreground">
                Create your first course to start teaching
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
                    {course.imageUrl && (
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="mb-3 h-40 w-full rounded-lg object-cover"
                      />
                    )}
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
                      <span className="font-medium">{course._count.chapters}</span>
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
      </div>
    </div>
  )
}
