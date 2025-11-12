'use client'

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Loader2, BookOpen, Clock, Award, Play, CheckCircle2, Edit, Trash2, BarChart3, UserX, Eye, Plus, Search, Filter, Grid, List, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Container } from "@/components/ui/container"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { AuthGuard } from "@/components/auth-guard"
import { myCoursesService, type MyCoursesResponse, type MyCourse } from "@/lib/services/my-courses.service"

export default function MyCoursesPage() {
  const router = useRouter()
  const [data, setData] = useState<MyCoursesResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'enrolled' | 'owned' | 'completed' | 'in-progress'>('all')
  const [sortBy, setSortBy] = useState<'title' | 'date' | 'progress'>('date')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9

  useEffect(() => {
    async function loadCoursesData() {
      try {
        setIsLoading(true)
        const result = await myCoursesService.getMyCourses()
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

  // Filter and search logic
  const filteredCourses = useMemo(() => {
    if (!data?.courses) return []
    
    let filtered = data.courses

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.owner.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      switch (filterStatus) {
        case 'enrolled':
          filtered = filtered.filter(course => course.relationshipType === 'ENROLLED')
          break
        case 'owned':
          filtered = filtered.filter(course => course.relationshipType === 'OWNED')
          break
        case 'completed':
          filtered = filtered.filter(course => 
            course.relationshipType === 'ENROLLED' && course.enrollment?.completedAt
          )
          break
        case 'in-progress':
          filtered = filtered.filter(course => 
            course.relationshipType === 'ENROLLED' && 
            !course.enrollment?.completedAt && 
            (course.enrollment?.progress || 0) > 0
          )
          break
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'progress':
          const aProgress = a.enrollment?.progress || 0
          const bProgress = b.enrollment?.progress || 0
          return bProgress - aProgress
        case 'date':
        default:
          const aDate = a.enrollment?.enrolledAt || a.createdAt
          const bDate = b.enrollment?.enrolledAt || b.createdAt
          return new Date(bDate).getTime() - new Date(aDate).getTime()
      }
    })

    return filtered
  }, [data?.courses, searchQuery, filterStatus, sortBy])

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage)
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleImageError = (courseId: string) => {
    setImageErrors(prev => new Set(prev).add(courseId))
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return
    
    try {
      await myCoursesService.deleteCourse(courseId)
      // Reload data
      const result = await myCoursesService.getMyCourses()
      setData(result)
    } catch (error) {
      console.error('Failed to delete course:', error)
    }
  }

  const handleUnenroll = async (courseId: string) => {
    if (!confirm('Are you sure you want to unenroll from this course?')) return
    
    try {
      await myCoursesService.unenrollCourse(courseId)
      // Reload data
      const result = await myCoursesService.getMyCourses()
      setData(result)
    } catch (error) {
      console.error('Failed to unenroll from course:', error)
    }
  }

  const renderCourseCard = (course: MyCourse) => (
    <Card key={course.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
      <CardHeader className="p-0">
        <div className="aspect-video relative overflow-hidden rounded-t-lg bg-gradient-to-br from-blue-50 to-indigo-100">
          {course.imageUrl && !imageErrors.has(course.id) ? (
            <Image
              src={course.imageUrl}
              alt={course.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              onError={() => handleImageError(course.id)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
              <BookOpen className="h-16 w-16 text-blue-300" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                {course.title}
              </h3>
              <div className="flex gap-2">
                <Badge variant={course.relationshipType === 'OWNED' ? 'default' : 'secondary'}>
                  {course.relationshipType === 'OWNED' ? 'Owner' : 
                   course.enrollment?.completedAt ? 'Completed' : 'Enrolled'}
                </Badge>
              </div>
            </div>
            
            {course.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {course.description}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>{course._count?.chapters || 0} chapters</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{course._count?.chapters || 0} chapters</span>
              </div>
              <div className="flex items-center gap-1">
                <span>by {course.owner.name}</span>
              </div>
            </div>

            {course.enrollment && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{course.enrollment.progress}%</span>
                </div>
                <Progress value={course.enrollment.progress} className="h-2" />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {/* View/Continue button */}
            <Button asChild className="flex-1">
              <Link href={`/courses/${course.id}`}>
                <div className="flex items-center gap-2">
                  {course.enrollment?.completedAt ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Review
                    </>
                  ) : course.relationshipType === 'OWNED' ? (
                    <>
                      <Eye className="h-4 w-4" />
                      View Course
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Continue Learning
                    </>
                  )}
                </div>
              </Link>
            </Button>

            {/* Action buttons based on permissions */}
            {course.availableActions.canEdit && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/instructor/courses/${course.id}`}>
                  <Edit className="h-4 w-4" />
                </Link>
              </Button>
            )}
            
            {course.availableActions.canViewAnalytics && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/instructor/courses/${course.id}/analytics`}>
                  <BarChart3 className="h-4 w-4" />
                </Link>
              </Button>
            )}

            {course.availableActions.canUnenroll && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleUnenroll(course.id)}
                className="text-orange-600 border-orange-200 hover:bg-orange-50"
              >
                <UserX className="h-4 w-4" />
              </Button>
            )}

            {course.availableActions.canDelete && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDeleteCourse(course.id)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderTableView = () => (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">Image</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Instructor</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedCourses.map((course) => (
            <TableRow key={course.id} className="group">
              {/* Course Image */}
              <TableCell>
                <div className="w-12 h-12 relative overflow-hidden rounded bg-gradient-to-br from-blue-50 to-indigo-100">
                  {course.imageUrl && !imageErrors.has(course.id) ? (
                    <Image
                      src={course.imageUrl}
                      alt={course.title}
                      fill
                      className="object-cover"
                      onError={() => handleImageError(course.id)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-blue-300" />
                    </div>
                  )}
                </div>
              </TableCell>

              {/* Course Info */}
              <TableCell className="min-w-[300px]">
                <div className="space-y-1">
                  <Link 
                    href={`/courses/${course.id}`}
                    className="font-semibold hover:text-blue-600 transition-colors block"
                  >
                    {course.title}
                  </Link>
                  {course.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {course.description}
                    </p>
                  )}
                </div>
              </TableCell>

              {/* Type/Status */}
              <TableCell>
                <div className="flex flex-col gap-1">
                  <Badge variant={course.relationshipType === 'OWNED' ? 'default' : 'secondary'}>
                    {course.relationshipType === 'OWNED' ? 'Owner' : 
                     course.enrollment?.completedAt ? 'Completed' : 'Enrolled'}
                  </Badge>
                  {course.enrollment?.enrolledAt && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(course.enrollment.enrolledAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </TableCell>

              {/* Progress */}
              <TableCell className="w-[120px]">
                {course.enrollment ? (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{course.enrollment.progress}%</span>
                    </div>
                    <Progress value={course.enrollment.progress} className="h-2" />
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">N/A</span>
                )}
              </TableCell>

              {/* Content Stats */}
              <TableCell>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{course._count?.chapters || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{course._count?.chapters || 0}</span>
                  </div>
                </div>
              </TableCell>

              {/* Instructor */}
              <TableCell>
                <span className="text-sm">{course.owner.name}</span>
              </TableCell>

              {/* Actions */}
              <TableCell className="text-right">
                <div className="flex gap-1 justify-end">
                  {/* View/Continue button */}
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/courses/${course.id}`}>
                      {course.enrollment?.completedAt ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : course.relationshipType === 'OWNED' ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Link>
                  </Button>

                  {/* Edit button */}
                  {course.availableActions.canEdit && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/instructor/courses/${course.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                  
                  {/* Analytics button */}
                  {course.availableActions.canViewAnalytics && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/instructor/courses/${course.id}/analytics`}>
                        <BarChart3 className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}

                  {/* Unenroll button */}
                  {course.availableActions.canUnenroll && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUnenroll(course.id)}
                      className="text-orange-600 border-orange-200 hover:bg-orange-50"
                    >
                      <UserX className="h-4 w-4" />
                    </Button>
                  )}

                  {/* Delete button */}
                  {course.availableActions.canDelete && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteCourse(course.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )

  if (isLoading) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <Container className="py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading your courses...</p>
              </div>
            </div>
          </Container>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  if (error) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <Container className="py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">Something went wrong</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
              </div>
            </div>
          </Container>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  if (!data) {
    return null
  }



  return (
    <AuthGuard>
      <DashboardLayout>
        <Container className="py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">My Courses</h1>
                <p className="text-muted-foreground">
                  Manage all courses you own or are enrolled in
                </p>
                <div className="mt-2 flex gap-2">
                  {data.user.globalRoles.map((role) => (
                    <Badge key={role} variant="outline" className="text-blue-600 border-blue-600">
                      {role}
                    </Badge>
                  ))}
                  <Badge variant="secondary">
                    {data.user.name}
                  </Badge>
                </div>
              </div>
              
              {/* Create course button - all authenticated users can create courses */}
              <Button asChild>
                <Link href="/instructor/courses/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Course
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{data.stats.totalCourses}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Enrolled</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{data.stats.enrolledCourses}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Owned</CardTitle>
                <Award className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{data.stats.ownedCourses}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{data.stats.completedCourses}</div>
              </CardContent>
            </Card>
          </div>

          {data.courses.length === 0 ? (
            /* Empty State */
            <Card className="text-center py-16">
              <CardContent>
                <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No courses yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start your learning journey by enrolling in courses or create your own to teach others
                </p>
                <div className="flex gap-4 justify-center">
                  <Link href="/courses">
                    <Button variant="outline">Browse Courses</Button>
                  </Link>
                  <Link href="/instructor/courses/create">
                    <Button>Create Course</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* Search and Filter Bar */}
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search courses by title, description, or instructor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select value={filterStatus} onValueChange={(value: typeof filterStatus) => setFilterStatus(value)}>
                    <SelectTrigger className="w-40">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      <SelectItem value="enrolled">Enrolled</SelectItem>
                      <SelectItem value="owned">Owned</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={(value: typeof sortBy) => setSortBy(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Recent</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="progress">Progress</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  >
                    {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Results Info */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {paginatedCourses.length} of {filteredCourses.length} courses
                </p>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Courses Grid/List */}
              {filteredCourses.length === 0 ? (
                <Card className="text-center py-16">
                  <CardContent>
                    <Search className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">No courses found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search criteria or filters
                    </p>
                  </CardContent>
                </Card>
              ) : viewMode === 'grid' ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {paginatedCourses.map(course => renderCourseCard(course))}
                </div>
              ) : (
                renderTableView()
              )}

              {/* Pagination Footer */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    
                    {/* Page numbers */}
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => 
                          page === 1 || 
                          page === totalPages || 
                          Math.abs(page - currentPage) <= 1
                        )
                        .map((page, index, array) => (
                          <div key={page} className="flex items-center">
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className="px-2 text-muted-foreground">...</span>
                            )}
                            <Button
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </Button>
                          </div>
                        ))
                      }
                    </div>
                    
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Container>
      </DashboardLayout>
    </AuthGuard>
  )
}