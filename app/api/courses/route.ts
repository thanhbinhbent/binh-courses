import { getCurrentUser } from "@/lib/current-user"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get all published courses (public access)
    const courses = await db.course.findMany({
      where: { isPublished: true },
      include: {
        category: true,
        instructor: {
          select: {
            name: true,
            image: true,
          }
        },
        chapters: {
          where: { isPublished: true },
          select: { id: true }
        },
        _count: {
          select: {
            enrollments: true,
            reviews: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    // Get all categories
    const categories = await db.category.findMany({
      orderBy: { name: "asc" }
    })

    return NextResponse.json({ courses, categories })
  } catch (error) {
    console.error("[COURSES_GET]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check if user is instructor or admin
    if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN") {
      return new NextResponse("Forbidden - Instructor access required", { status: 403 })
    }

    const body = await req.json()
    const { title, description, categoryId, price } = body

    if (!title || !description || !categoryId) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Create course
    const course = await db.course.create({
      data: {
        title,
        description,
        categoryId,
        price: price ? parseFloat(price) : null,
        instructorId: user.id,
        isPublished: false
      }
    })

    return NextResponse.json(course)
  } catch (error) {
    console.error("[COURSES_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
