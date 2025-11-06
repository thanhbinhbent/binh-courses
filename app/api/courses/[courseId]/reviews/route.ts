import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/current-user"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params

    const user = await getCurrentUser()

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check if user is enrolled
    const enrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId
        }
      }
    })

    if (!enrollment) {
      return new NextResponse("Must be enrolled to review", { status: 403 })
    }

    // Check if user already reviewed
    const existingReview = await db.review.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId
        }
      }
    })

    if (existingReview) {
      return new NextResponse("Already reviewed", { status: 400 })
    }

    const { rating, comment } = await req.json()

    const review = await db.review.create({
      data: {
        userId: user.id,
        courseId: courseId,
        rating,
        comment
      }
    })

    return NextResponse.json(review)
  } catch (error) {
    console.error("[REVIEWS]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params

    const reviews = await db.review.findMany({
      where: {
        courseId: courseId
      },
      include: {
        user: {
          select: {
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error("[REVIEWS]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
