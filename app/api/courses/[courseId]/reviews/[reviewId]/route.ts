import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/current-user"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string; reviewId: string }> }
) {
  try {
    const { reviewId } = await params

    const user = await getCurrentUser()

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const review = await db.review.findUnique({
      where: {
        id: reviewId,
        userId: user.id
      }
    })

    if (!review) {
      return new NextResponse("Not found", { status: 404 })
    }

    const { rating, comment } = await req.json()

    const updatedReview = await db.review.update({
      where: {
        id: reviewId
      },
      data: {
        rating,
        comment
      }
    })

    return NextResponse.json(updatedReview)
  } catch (error) {
    console.error("[REVIEW_UPDATE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ courseId: string; reviewId: string }> }
) {
  try {
    const { reviewId } = await params

    const user = await getCurrentUser()

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const review = await db.review.findUnique({
      where: {
        id: reviewId,
        userId: user.id
      }
    })

    if (!review) {
      return new NextResponse("Not found", { status: 404 })
    }

    await db.review.delete({
      where: {
        id: reviewId
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[REVIEW_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
