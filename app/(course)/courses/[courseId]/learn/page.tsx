import { redirect } from "next/navigation"
import { courseService } from "@/lib/services"
import { LessonContent } from "./_components/lesson-content"
import { ChapterContent } from "./_components/chapter-content"

interface PageProps {
  params: Promise<{
    courseId: string
  }>
  searchParams: Promise<{
    chapter?: string
    lesson?: string
  }>
}

export default async function Page({ params, searchParams }: PageProps) {
  // Await params and searchParams (Next.js 15 requirement)
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  
  // Fetch course data
  const response = await courseService.getCourseDetails(resolvedParams.courseId)
  if (!response?.course) {
    return redirect("/courses")
  }

  const { course } = response
  const { chapter: chapterId, lesson: lessonId } = resolvedSearchParams

  // If no chapter selected, show first chapter
  if (!chapterId) {
    const firstChapter = course.chapters[0]
    if (!firstChapter) return redirect("/courses")
    
    return redirect(`/courses/${resolvedParams.courseId}/learn?chapter=${firstChapter.id}`)
  }

  // Find current chapter
  const currentChapter = course.chapters.find(c => c.id === chapterId)
  if (!currentChapter) {
    return redirect(`/courses/${resolvedParams.courseId}/learn`)
  }

  // If lesson selected, show lesson content 
  if (lessonId) {
    const currentLesson = currentChapter.lessons.find(l => l.id === lessonId)
    if (!currentLesson) {
      return redirect(`/courses/${resolvedParams.courseId}/learn?chapter=${currentChapter.id}`)
    }

    return (
      <LessonContent
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        course={course as any}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any  
        chapter={currentChapter as any}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        lesson={currentLesson as any}
        courseId={resolvedParams.courseId}
        chapterId={chapterId}
        lessonId={lessonId}
      />
    )
  }

  // Show chapter overview
  return (
    <ChapterContent
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      course={course as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      chapter={currentChapter as any}
      courseId={resolvedParams.courseId}
      chapterId={chapterId} 
    />
  )
}