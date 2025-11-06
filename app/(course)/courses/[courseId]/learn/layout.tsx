"use client"

import { useEffect, useState, use } from "react"
import { CourseNavigation } from "./_components/course-navigation"
import { useSearchParams } from "next/navigation"
import { courseService } from "@/lib/services"

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{
    courseId: string
  }>
}

export default function Layout({ children, params }: LayoutProps) {
  const resolvedParams = use(params)
  const searchParams = useSearchParams()
  const chapterId = searchParams.get("chapter")
  const lessonId = searchParams.get("lesson")
  const [course, setCourse] = useState<any>(null)

  useEffect(() => {
    const loadCourse = async () => {
      const response = await courseService.getCourseDetails(resolvedParams.courseId)
      if (response?.course) {
        setCourse(response.course)
      }
    }
    loadCourse()
  }, [resolvedParams.courseId])

  if (!course) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex h-full">
      {/* Course Navigation */}
      <div className="hidden lg:flex h-full w-80 flex-col fixed inset-y-0 z-50">
        <CourseNavigation
          course={course}
          currentChapterId={chapterId}
          currentLessonId={lessonId}
          courseId={resolvedParams.courseId}
        />
      </div>

      {/* Main Content */}
      <main className="h-full lg:pl-80 w-full overflow-y-auto">
        <div className="h-full">
          {children}
        </div>
      </main>
    </div>
  )
}