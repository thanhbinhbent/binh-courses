"use client"

import { useEffect, useState, use } from "react"
import { LearningNavigation } from "./_components/learning-navigation"
import { LearningHeader } from "./_components/learning-header"
import { useSearchParams } from "next/navigation"
import { courseService } from "@/lib/services/course.service"

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [course, setCourse] = useState<any>(null)
  const [isNavOpen, setIsNavOpen] = useState(false)

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const response = await courseService.getCourseDetails(resolvedParams.courseId)
        if (response?.course) {
          setCourse(response.course)
        }
      } catch (error) {
        console.error('Failed to load course:', error)
      }
    }
    loadCourse()
  }, [resolvedParams.courseId])

  if (!course) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-black">
      {/* Course Navigation Sidebar - Udemy Style */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-white border-r transform transition-transform duration-300 ease-in-out
        ${isNavOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <LearningNavigation
          course={course}
          currentChapterId={chapterId}
          currentLessonId={lessonId}
          courseId={resolvedParams.courseId}
          onClose={() => setIsNavOpen(false)}
        />
      </div>

      {/* Overlay for mobile */}
      {isNavOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsNavOpen(false)}
        />
      )}

      {/* Main Learning Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header with controls */}
        <LearningHeader
          course={course}
          currentChapterId={chapterId}
          currentLessonId={lessonId}
          onToggleNav={() => setIsNavOpen(!isNavOpen)}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}