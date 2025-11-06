"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, ChevronRight, PlayCircle, Clock, CheckCircle2, Lock } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { ChapterWithLessons } from "@/types/course.d"

interface CourseContentProps {
  chapters: ChapterWithLessons[]
  courseId: string
  isEnrolled: boolean
}

export function CourseContent({ chapters, courseId, isEnrolled }: CourseContentProps) {
  const [openChapters, setOpenChapters] = useState<Set<string>>(new Set([chapters[0]?.id]))

  const toggleChapter = (chapterId: string) => {
    const newOpenChapters = new Set(openChapters)
    if (newOpenChapters.has(chapterId)) {
      newOpenChapters.delete(chapterId)
    } else {
      newOpenChapters.add(chapterId)
    }
    setOpenChapters(newOpenChapters)
  }

  const totalLessons = chapters.reduce((total, chapter) => total + (chapter.lessons?.length || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <h2 className="text-2xl font-bold">Course Content</h2>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="font-medium">{chapters.length} chapters</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="font-medium">{totalLessons} lessons</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="font-medium">
              {Math.round(
                chapters.reduce((total, chapter) => 
                  total + (chapter.lessons?.reduce((lessonTotal, lesson) => 
                    lessonTotal + (lesson.duration || 0), 0
                  ) || 0), 0
                ) / 60
              )} min total
            </span>
          </div>
        </div>
      </div>

      {/* Chapters */}
      <div className="space-y-3">
        {chapters.map((chapter, index) => {
          const isOpen = openChapters.has(chapter.id)
          const chapterDuration = chapter.lessons?.reduce((total, lesson) => total + (lesson.duration || 0), 0) || 0
          const isCompleted = isEnrolled && chapter.userProgress?.[0]?.isCompleted

          return (
            <Card key={chapter.id} className={`overflow-hidden border-2 transition-all duration-200 ${
              isOpen ? 'border-primary/30 shadow-lg' : 'border-border hover:border-primary/20'
            }`}>
              <Collapsible open={isOpen} onOpenChange={() => toggleChapter(chapter.id)}>
                <CollapsibleTrigger asChild>
                  <div className="w-full cursor-pointer">
                    <div className={`p-6 transition-colors ${
                      isOpen 
                        ? 'bg-gradient-to-r from-primary/5 to-primary/10 border-b' 
                        : 'hover:bg-muted/50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-4">
                          {/* Chapter Number */}
                          <div className={`flex h-12 w-12 items-center justify-center rounded-xl font-bold text-white shadow-sm ${
                            isCompleted 
                              ? 'bg-green-500' 
                              : isOpen 
                                ? 'bg-primary' 
                                : 'bg-muted-foreground'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle2 className="h-6 w-6" />
                            ) : (
                              <span className="text-sm">{index + 1}</span>
                            )}
                          </div>

                          {/* Chapter Info */}
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-bold text-lg leading-tight text-left">
                                {chapter.title}
                              </h3>
                              {chapter.isFree && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                                  Preview
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <PlayCircle className="h-4 w-4" />
                                <span className="font-medium">
                                  {chapter.lessons?.length || 0} lessons
                                </span>
                              </div>
                              {chapterDuration > 0 && (
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-4 w-4" />
                                  <span className="font-medium">
                                    {Math.round(chapterDuration / 60)} min
                                  </span>
                                </div>
                              )}
                              {isCompleted && (
                                <div className="flex items-center gap-1.5 text-green-600">
                                  <CheckCircle2 className="h-4 w-4" />
                                  <span className="font-medium">Completed</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                          {(isEnrolled || chapter.isFree) && (
                            <Link href={`/courses/${courseId}/learn?chapter=${chapter.id}`}>
                              <Button 
                                size="sm" 
                                variant={isOpen ? "default" : "outline"}
                                className="gap-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <PlayCircle className="h-4 w-4" />
                                Start
                              </Button>
                            </Link>
                          )}
                          
                          {/* Expand/Collapse Icon */}
                          <div className="p-2">
                            {isOpen ? (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CollapsibleTrigger>

                {/* Lessons List */}
                <CollapsibleContent>
                  {chapter.lessons && chapter.lessons.length > 0 ? (
                    <div className="bg-gradient-to-b from-muted/30 to-muted/10">
                      <div className="px-6 py-2">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          Lessons in this chapter
                        </div>
                        <div className="space-y-2">
                          {chapter.lessons.map((lesson, lessonIndex) => {
                            const canAccess = isEnrolled || lesson.isFree
                            
                            return (
                              <div
                                key={lesson.id}
                                className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                                  canAccess 
                                    ? 'bg-background hover:bg-muted/50 hover:shadow-sm border-border' 
                                    : 'bg-muted/30 border-dashed border-muted-foreground/30'
                                }`}
                              >
                                <div className="flex items-center gap-4">
                                  {/* Lesson Number */}
                                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold ${
                                    canAccess 
                                      ? 'bg-primary/10 text-primary border border-primary/20' 
                                      : 'bg-muted text-muted-foreground border'
                                  }`}>
                                    {lessonIndex + 1}
                                  </div>

                                  {/* Lesson Info */}
                                  <div className="space-y-1">
                                    <p className={`font-medium leading-tight ${
                                      canAccess ? 'text-foreground' : 'text-muted-foreground'
                                    }`}>
                                      {lesson.title}
                                    </p>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                      {lesson.duration && lesson.duration > 0 && (
                                        <div className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          <span>{Math.round(lesson.duration / 60)} min</span>
                                        </div>
                                      )}
                                      {lesson.isFree && (
                                        <Badge variant="outline" className="text-xs px-2 py-0.5">
                                          Free
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Lesson Actions */}
                                <div className="flex items-center gap-2">
                                  {canAccess ? (
                                    <Link href={`/courses/${courseId}/learn?chapter=${chapter.id}&lesson=${lesson.id}`}>
                                      <Button size="sm" variant="ghost" className="gap-2 text-xs">
                                        <PlayCircle className="h-3 w-3" />
                                        Play
                                      </Button>
                                    </Link>
                                  ) : (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <Lock className="h-4 w-4" />
                                      <span className="text-xs font-medium">Locked</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="px-6 py-8 text-center text-muted-foreground">
                      <PlayCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No lessons in this chapter yet</p>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </Card>
          )
        })}
      </div>
    </div>
  )
}