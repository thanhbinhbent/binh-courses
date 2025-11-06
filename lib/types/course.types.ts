/**
 * Course Domain Types
 * Centralized type definitions for course-related features
 */

export interface CourseCategory {
  id: string
  name: string
  slug?: string
}

export interface CourseAttachment {
  id: string
  name: string
  url: string
}

export interface Review {
  id: string
  rating: number
  comment: string | null
  userId: string
  courseId: string
  user: {
    name: string | null
    image: string | null
  }
  createdAt: Date
  updatedAt: Date
}

export interface Chapter {
  id: string
  title: string
  description: string | null
  videoUrl: string | null
  position: number
  isPublished: boolean
  isFree: boolean
  courseId: string
  duration?: number | null
  resources?: Array<{
    id: string
    name: string
    url: string
  }>
  course?: {
    id: string
    title: string
    chapters?: Chapter[]
  }
}

export interface Course {
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  price: number | null
  isPublished: boolean
  categoryId: string | null
  category: CourseCategory | null
  instructorId: string
  level?: string | null
  chapters: Chapter[]
  attachments: CourseAttachment[]
  instructor?: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  }
  _count?: {
    enrollments: number
    chapters: number
  }
  createdAt: Date
  updatedAt: Date
}

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
export interface ChapterWithProgress extends Chapter {
  userProgress: UserProgress | null
}

export interface CourseWithProgress extends Course {
  chapters: ChapterWithProgress[]
  enrollment: Enrollment | null
  purchase: Purchase | null
}

export interface CourseWithEnrollmentCount extends Course {
  _count: {
    enrollments: number
    chapters: number
  }
}

// API Response Types
export interface CoursesListResponse {
  courses: Course[]
  categories: CourseCategory[]
}

export interface CourseDetailsResponse {
  course: CourseWithProgress
  progressPercentage: number
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
  categories: CourseCategory[]
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
