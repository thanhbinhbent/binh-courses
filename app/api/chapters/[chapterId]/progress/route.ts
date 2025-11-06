import { getCurrentUser } from "@/lib/current-user"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  try {
    const { chapterId } = await params
    const user = await getCurrentUser()

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get chapter to verify it exists
    const chapter = await db.chapter.findUnique({
      where: {
        id: chapterId,
        isPublished: true
      }
    })

    if (!chapter) {
      return new NextResponse("Chapter not found", { status: 404 })
    }

    // Check if user is enrolled in the course
    const enrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: chapter.courseId
        }
      }
    })

    if (!enrollment && !chapter.isFree) {
      return new NextResponse("Not enrolled in course", { status: 403 })
    }

    // Create or update progress
    const progress = await db.progress.upsert({
      where: {
        userId_chapterId: {
          userId: user.id,
          chapterId: chapterId
        }
      },
      update: {
        isCompleted: true
      },
      create: {
        userId: user.id,
        chapterId: chapterId,
        isCompleted: true
      }
    })

    // Check if all chapters in the course are completed
    const allChapters = await db.chapter.findMany({
      where: {
        courseId: chapter.courseId,
        isPublished: true
      }
    })

    const completedChapters = await db.progress.count({
      where: {
        userId: user.id,
        chapterId: {
          in: allChapters.map((c: { id: string }) => c.id)
        },
        isCompleted: true
      }
    })

    const isAllCompleted = completedChapters === allChapters.length

    // If all chapters completed, check if certificate should be awarded
    if (isAllCompleted && enrollment) {
      // Check by certificateId pattern (since we don't have courseId in Certificate model)
      const certificateIdPattern = `CERT-${chapter.courseId.substring(0, 8)}-${user.id.substring(0, 8)}`
      
      const existingCertificate = await db.certificate.findFirst({
        where: {
          userId: user.id,
          certificateId: {
            startsWith: certificateIdPattern
          }
        }
      })

      if (!existingCertificate) {
        // Fetch course and instructor details for certificate
        const course = await db.course.findUnique({
          where: { id: chapter.courseId },
          include: {
            instructor: true
          }
        })

        if (course) {
          // Generate a unique certificate ID
          const certificateId = `CERT-${chapter.courseId.substring(0, 8)}-${user.id.substring(0, 8)}-${Date.now()}`

          await db.certificate.create({
            data: {
              certificateId,
              userId: user.id,
              courseName: course.title,
              instructorName: course.instructor.name || 'Unknown Instructor',
              completionDate: new Date()
            }
          })
        }
      }
    }

    return NextResponse.json(progress)
  } catch (error) {
    console.error("[CHAPTER_PROGRESS]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
