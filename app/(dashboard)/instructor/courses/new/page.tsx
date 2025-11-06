import { requireInstructor } from "@/lib/current-user"
import { db } from "@/lib/db"
import { CreateCourseForm } from "./_components/create-course-form"

export default async function NewCoursePage() {
  await requireInstructor()

  // Get all categories
  const categories = await db.category.findMany({
    orderBy: {
      name: "asc"
    }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-3xl font-bold">Create New Course</h1>
        <p className="mb-8 text-muted-foreground">
          Fill in the basic information to create your course. You can add chapters and content later.
        </p>

        <CreateCourseForm categories={categories} />
      </div>
    </div>
  )
}
