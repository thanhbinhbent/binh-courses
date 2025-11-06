'use client'

import Link from 'next/link'
import { CheckCircle2, Lock, BookOpen, Play, FileText, HelpCircle, Target } from 'lucide-react'

interface Lesson {
  id: string
  title: string
  type: 'VIDEO' | 'ARTICLE' | 'QUIZ' | 'EXERCISE'
  duration?: number | null
  isFree: boolean
  progress?: { isCompleted: boolean }[]
}

interface Chapter {
  id: string
  title: string
  isFree: boolean
  lessons?: Lesson[]
  resources?: { id: string; name: string; url: string }[]
}

interface Course {
  id: string
  title: string
  chapters?: Chapter[]
}

interface CourseSidebarProps {
  course: Course
  currentChapterId: string
  currentLessonId?: string
  isEnrolled: boolean
}

export const CourseSidebar = ({
  course,
  currentChapterId,
  currentLessonId,
  isEnrolled
}: CourseSidebarProps) => {
  return (
    <div className="hidden w-80 border-l bg-card lg:block">
      <div className="sticky top-0 h-screen overflow-y-auto p-4">
        <h3 className="mb-4 font-semibold text-foreground">Course Content</h3>
        <div className="space-y-2">
          {course.chapters?.map((chapter, index) => {
            const isCurrentChapter = chapter.id === currentChapterId
            const hasLessons = chapter.lessons && chapter.lessons.length > 0
            const hasResources = chapter.resources && chapter.resources.length > 0

            // Calculate chapter progress if lessons exist
            const completedLessons = chapter.lessons?.filter(lesson => 
              lesson.progress?.some(p => p.isCompleted)
            )?.length || 0
            const totalLessons = chapter.lessons?.length || 0
            const chapterProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

            return (
              <div key={chapter.id} className="space-y-1">
                {/* Chapter Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                      isCurrentChapter
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <h4 className={`text-sm font-medium ${
                      isCurrentChapter ? 'text-primary' : 'text-foreground'
                    }`}>
                      {chapter.title}
                    </h4>
                  </div>
                  {totalLessons > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span>{completedLessons}/{totalLessons}</span>
                      {chapterProgress === 100 && (
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                      )}
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                {totalLessons > 0 && (
                  <div className="ml-8 w-full bg-secondary rounded-full h-1">
                    <div 
                      className="bg-primary h-1 rounded-full transition-all duration-300"
                      style={{ width: `${chapterProgress}%` }}
                    />
                  </div>
                )}

                {/* Lessons List */}
                {hasLessons && (
                  <div className="ml-8 space-y-1 border-l-2 border-muted pl-3">
                    {chapter.lessons?.map((lesson, lessonIndex) => {
                      const isLessonCompleted = lesson.progress?.some(p => p.isCompleted)
                      const isLessonLocked = !isEnrolled && !lesson.isFree
                      
                      return (
                        <Link
                          key={lesson.id}
                          href={isLessonLocked ? '#' : `/courses/${course.id}/chapters/${chapter.id}/lessons/${lesson.id}`}
                          className={`block ${isLessonLocked ? 'cursor-not-allowed opacity-50' : ''}`}
                        >
                          <div className={`flex items-center gap-2 rounded-lg p-2 text-sm transition-colors ${
                            lesson.id === currentLessonId 
                              ? 'bg-primary/10 text-primary' 
                              : 'hover:bg-secondary'
                          }`}>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {lessonIndex + 1}.
                              </span>
                              {lesson.type === 'VIDEO' && <Play className="h-3 w-3" />}
                              {lesson.type === 'ARTICLE' && <FileText className="h-3 w-3" />}
                              {lesson.type === 'QUIZ' && <HelpCircle className="h-3 w-3" />}
                              {lesson.type === 'EXERCISE' && <Target className="h-3 w-3" />}
                            </div>
                            <span className="flex-1 truncate">{lesson.title}</span>
                            <div className="flex items-center gap-1">
                              {lesson.duration && (
                                <span className="text-xs text-muted-foreground">
                                  {Math.round(lesson.duration / 60)}m
                                </span>
                              )}
                              {isLessonLocked && <Lock className="h-3 w-3" />}
                              {isLessonCompleted && (
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                              )}
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}

                {/* Chapter Resources */}
                {isCurrentChapter && hasResources && (
                  <div className="ml-8 space-y-1 border-l-2 border-muted pl-3">
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      Chapter Resources
                    </div>
                    {chapter.resources?.map((resource) => (
                      <a
                        key={resource.id}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg p-2 text-sm text-muted-foreground hover:bg-secondary"
                      >
                        <BookOpen className="h-3 w-3" />
                        <span className="flex-1 truncate">{resource.name}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}