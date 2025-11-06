import { Chapter, Course, Category, Review, Lesson, LessonProgress, Resource, Quiz } from '@prisma/client'

/**
 * Course Domain Types
 * Centralized type definitions for course-related features
 */

// Basic Types (extending Prisma types)
export interface UserProgress {
  id: string
  userId: string
  chapterId: string
  isCompleted: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Enrollment {
  id: string
  userId: string
  courseId: string
  createdAt: Date
  updatedAt: Date
}

export interface Purchase {
  id: string
  userId: string
  courseId: string
  createdAt: Date
  updatedAt: Date
}

// Composite Types

export type CourseWithChaptersAndProgress = Course & {
  chapters: ChapterWithLessons[]
  category: Category | null
  reviews: Review[]
  progress: number // Calculated progress percentage
  isFavorite?: boolean
}

export type ChapterWithLessons = Chapter & {
  lessons: LessonWithProgress[]
  resources?: Resource[]
  quizzes?: Quiz[]
  userProgress?: { isCompleted: boolean }[]
  course?: Course
}

export type LessonWithProgress = Lesson & {
  progress?: LessonProgress[]
  resources?: Resource[]
  quizzes?: Quiz[]
}

// Extended types for detailed views
export type DetailedChapter = Chapter & {
  course: Course
  lessons: DetailedLesson[]
  resources: Resource[]
  quizzes: Quiz[]
  userProgress?: { isCompleted: boolean }[]
}

export type DetailedLesson = Lesson & {
  progress?: LessonProgress[]
  resources: Resource[]
  quizzes: Quiz[]
  chapter: {
    id: string
    title: string
    courseId: string
  }
}

export interface CourseWithEnrollmentCount extends Course {
  _count: {
    enrollments: number
    chapters: number
  }
}

// API Response Types
export interface CoursesListResponse {
  courses: (Course & {
    category: Category | null
    instructor: {
      name: string | null
      image: string | null
    }
    chapters: { id: string }[]
    _count: {
      enrollments: number
      reviews: number
    }
  })[]
  categories: Category[]
}

export interface CourseDetailsResponse {
  course: Course & {
    category: Category | null
    instructor: {
      name: string | null
      image: string | null
      bio: string | null
    }
    chapters: (Chapter & {
      lessons: (Lesson & {
        progress?: LessonProgress[]
      })[]
    })[]
    _count: {
      enrollments: number
      reviews: number
    }
  }
  enrollment: Enrollment | null
  isEnrolled: boolean
  isFree: boolean
  reviews: (Review & {
    user: {
      name: string | null
      image: string | null
    }
  })[]
  averageRating: number
  userReview: Review | null
  progress: number
  user: {
    id: string
    name: string | null
    email: string | null
  } | null
}

export interface ChapterViewResponse {
  chapter: Chapter & {
    course: {
      id: string
      title: string
      chapters: Chapter[]
    }
  }
  isEnrolled: boolean
  canAccess: boolean
  currentIndex: number
  previousChapter: Chapter | null
  nextChapter: Chapter | null
  isCompleted: boolean
  progress: number
}

export interface InstructorCoursesResponse {
  courses: CourseWithEnrollmentCount[]
}

export interface InstructorCourseDetailsResponse {
  course: Course
  categories: Category[]
}

export interface InstructorChapterDetailsResponse {
  chapter: Chapter
  course: {
    id: string
    title: string
  }
  muxData: {
    assetId: string
    playbackId: string | null
  } | null
}
