'use client'

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  ChevronDown, 
  ChevronRight, 
  Play, 
  FileText, 
  Clock,
  Lock,
  CheckCircle2
} from "lucide-react"

interface Lesson {
  id: string
  title: string
  type: "VIDEO" | "ARTICLE" | "QUIZ" | "EXERCISE"
  duration?: number | null
  progress?: { isCompleted: boolean }[]
  isFree: boolean
}

interface Chapter {
  id: string
  title: string
  description: string | null
  lessons: Lesson[]
}

interface CourseContentProps {
  chapters: Chapter[]
  isEnrolled: boolean
}

export function CourseContent({ chapters, isEnrolled }: CourseContentProps) {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set())

  const toggleChapter = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters)
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId)
    } else {
      newExpanded.add(chapterId)
    }
    setExpandedChapters(newExpanded)
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-- min'
    const minutes = Math.ceil(seconds / 60)
    return `${minutes} min`
  }

  const getTotalLessons = () => {
    return chapters.reduce((total, chapter) => total + chapter.lessons.length, 0)
  }

  const getTotalDuration = () => {
    const totalSeconds = chapters.reduce((total, chapter) => {
      return total + chapter.lessons.reduce((chapterTotal, lesson) => {
        return chapterTotal + (lesson.duration ?? 0)
      }, 0)
    }, 0)
    
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  return (
    <div className="space-y-4">
      {/* Course Stats */}
      <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span>{getTotalLessons()} lessons</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>{getTotalDuration()} total length</span>
        </div>
      </div>

      {/* Chapters */}
      <div className="space-y-2">
        {chapters.map((chapter, index) => {
          const isExpanded = expandedChapters.has(chapter.id)
          const completedLessons = chapter.lessons.filter(lesson => 
            lesson.progress?.[0]?.isCompleted
          ).length
          
          return (
            <Card key={chapter.id} className="overflow-hidden">
              <div 
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleChapter(chapter.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-semibold text-gray-900">
                          Chapter {index + 1}: {chapter.title}
                        </h4>
                        {isEnrolled && completedLessons > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {completedLessons}/{chapter.lessons.length} completed
                          </Badge>
                        )}
                      </div>
                      {chapter.description && (
                        <p className="text-sm text-gray-600">{chapter.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {chapter.lessons.length} lessons
                  </div>
                </div>
              </div>

              {isExpanded && (
                <CardContent className="pt-0 pb-4 px-4">
                  <div className="border-t pt-4">
                    <div className="space-y-2">
                      {chapter.lessons.map((lesson, lessonIndex) => {
                        const canAccess = isEnrolled || lesson.isFree
                        
                        return (
                          <div 
                            key={lesson.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border ${
                              canAccess 
                                ? 'hover:bg-gray-50 cursor-pointer border-gray-200' 
                                : 'bg-gray-50 border-gray-100'
                            }`}
                          >
                            <div className="flex-shrink-0">
                              {lesson.type === 'VIDEO' ? (
                                <Play className={`h-4 w-4 ${canAccess ? 'text-blue-600' : 'text-gray-400'}`} />
                              ) : (
                                <FileText className={`h-4 w-4 ${canAccess ? 'text-green-600' : 'text-gray-400'}`} />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className={`font-medium truncate ${
                                  canAccess ? 'text-gray-900' : 'text-gray-500'
                                }`}>
                                  {lessonIndex + 1}. {lesson.title}
                                </h5>
                                
                                {lesson.isFree && (
                                  <Badge variant="outline" className="text-xs">
                                    Free Preview
                                  </Badge>
                                )}
                                
                                {lesson.progress?.[0]?.isCompleted && isEnrolled && (
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                )}
                              </div>
                              
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span className="capitalize">{lesson.type.toLowerCase()}</span>
                                {lesson.duration && (
                                  <>
                                    <span>•</span>
                                    <span>{formatDuration(lesson.duration)}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex-shrink-0">
                              {!canAccess && (
                                <Lock className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {/* Call to Action */}
      {!isEnrolled && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-center">
            <h4 className="font-semibold text-blue-900 mb-2">
              Get Full Access to All Lessons
            </h4>
            <p className="text-blue-700 text-sm mb-4">
              Enroll now to unlock all {getTotalLessons()} lessons and start learning today!
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Enroll Now
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}