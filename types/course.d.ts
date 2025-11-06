import type { Chapter, Course } from "@prisma/client"

export interface Lesson {
  id: string
  title: string
  description: string | null
  type: 'VIDEO' | 'ARTICLE' | 'QUIZ' | 'EXERCISE'
  videoUrl?: string | null
  content?: string | null
  position: number
  duration?: number | null
  isPublished: boolean
  isFree: boolean
  chapterId: string
  progress?: { isCompleted: boolean }[]
  createdAt: Date
  updatedAt: Date
}

export interface ChapterWithLessons extends Chapter {
  lessons: Lesson[]
  userProgress?: { isCompleted: boolean }[]
}

export interface CourseWithChapters extends Course {
  category: {
    id: string
    name: string
    slug: string
  } | null
  instructor: {
    name: string | null
    image: string | null
    bio: string | null
  }
  chapters: ChapterWithLessons[]
  _count: {
    enrollments: number
    reviews: number
  }
}