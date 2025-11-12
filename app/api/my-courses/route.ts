import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/current-user"
import { db } from "@/lib/db"
import type { MyCoursesResponse, MyCourse } from "@/lib/services/my-courses.service"
import type { CourseLevel } from "@prisma/client"

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get enrolled courses (for all users)
    const enrolledCourses = await db.enrollment.findMany({
      where: {
        userId: user.id,
        course: {
          isPublished: true
        }
      },
      include: {
        course: {
          include: {
            category: true,
            owner: {
              select: {
                id: true,
                name: true,
                image: true
              }
            },
            chapters: {
              select: { id: true },
              where: { isPublished: true }
            },
            _count: {
              select: {
                enrollments: true,
                chapters: true
              }
            }
          }
        }
      }
    })

    // Define types for owned courses
    type OwnedCourse = {
      id: string
      title: string
      description: string | null
      imageUrl: string | null
      price: number | null
      isPublished: boolean
      level: string
      categoryId: string | null
      ownerId: string
      createdAt: Date
      updatedAt: Date
      category: any
      owner: any
      chapters: any[]
      _count: any
    }

    let ownedCourses: OwnedCourse[] = []
    
    // Get courses owned by user (where they are the creator/owner)
    const directlyOwnedCourses = await db.course.findMany({
      where: {
        ownerId: user.id
      },
      include: {
        category: true,
        owner: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        chapters: {
          select: { id: true }
        },
        _count: {
          select: {
            enrollments: true,
            chapters: true
          }
        }
      }
    })

    // Get courses where user has INSTRUCTOR role (assigned by others)
    const instructorRoles = await db.courseRole.findMany({
      where: {
        userId: user.id,
        role: 'INSTRUCTOR',
        isActive: true
      },
      include: {
        course: {
          include: {
            category: true,
            owner: {
              select: {
                id: true,
                name: true,
                image: true
              }
            },
            chapters: {
              select: { id: true }
            },
            _count: {
              select: {
                enrollments: true,
                chapters: true
              }
            }
          }
        }
      }
    })

    // Combine owned courses and instructor role courses
    ownedCourses = [
      ...directlyOwnedCourses,
      ...instructorRoles.map(role => role.course)
    ]

    // Remove duplicates (in case user owns and has instructor role for same course)
    const uniqueOwnedCourses = ownedCourses.filter((course, index, self) => 
      index === self.findIndex(c => c.id === course.id)
    )

    // Process enrolled courses with progress
    const enrolledCoursesWithProgress: MyCourse[] = await Promise.all(
      enrolledCourses.map(async (enrollment) => {
        const course = enrollment.course
        
        // Get user progress for this course
        const progress = await db.progress.findMany({
          where: {
            userId: user.id,
            chapter: {
              courseId: course.id
            }
          }
        })

        const totalChapters = course.chapters.length
        const completedChapters = progress.filter(p => p.isCompleted).length
        const progressPercentage = totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0

        return {
          id: course.id,
          title: course.title,
          description: course.description,
          imageUrl: course.imageUrl,
          price: course.price,
          level: course.level as CourseLevel,
          createdAt: course.createdAt,
          updatedAt: course.updatedAt,
          isPublished: course.isPublished,
          categoryId: course.categoryId,
          category: course.category,
          
          // Map owner to instructor for backward compatibility
          ownerId: course.ownerId,
          owner: course.owner,
          
          chapters: course.chapters,
          _count: course._count,
          relationshipType: "ENROLLED" as const,
          progress: {
            totalChapters,
            completedChapters,
            progressPercentage: Math.round(progressPercentage)
          },
          availableActions: {
            canView: true,
            canEdit: false,
            canDelete: false,
            canEnroll: false,
            canUnenroll: true,
            canViewAnalytics: false
          }
        }
      })
    )

    // Process owned courses
    const ownedCoursesFormatted: MyCourse[] = await Promise.all(
      uniqueOwnedCourses.map(async (course) => {
        const totalChapters = course.chapters.length
        
        return {
          id: course.id,
          title: course.title,
          description: course.description,
          imageUrl: course.imageUrl,
          price: course.price,
          level: course.level as CourseLevel,
          createdAt: course.createdAt,
          updatedAt: course.updatedAt,
          isPublished: course.isPublished,
          categoryId: course.categoryId,
          category: course.category,
          
          // Map owner to instructor for backward compatibility
          ownerId: course.ownerId,
          owner: course.owner,
          
          chapters: course.chapters,
          _count: course._count,
          relationshipType: "OWNED" as const,
          progress: {
            totalChapters,
            completedChapters: totalChapters, // Assume owner has full access
            progressPercentage: 100
          },
          availableActions: {
            canView: true,
            canEdit: true,
            canDelete: true,
            canEnroll: false,
            canUnenroll: false,
            canViewAnalytics: true
          }
        }
      })
    )

    // Combine all courses
    const allCourses = [...enrolledCoursesWithProgress, ...ownedCoursesFormatted]
    
    // Sort by most recent activity
    allCourses.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    const response: MyCoursesResponse = {
      courses: allCourses,
      stats: {
        totalCourses: allCourses.length,
        enrolledCourses: enrolledCoursesWithProgress.length,
        ownedCourses: uniqueOwnedCourses.length,
        completedCourses: enrolledCoursesWithProgress.filter(c => c.progress?.progressPercentage === 100).length,
        inProgressCourses: enrolledCoursesWithProgress.filter(c => c.progress && c.progress.progressPercentage > 0 && c.progress.progressPercentage < 100).length
      },
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        globalRoles: user.globalRoles,
        image: user.image
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error("[MY_COURSES_GET]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}