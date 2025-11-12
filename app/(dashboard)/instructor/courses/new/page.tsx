import { requireUser } from "@/lib/current-user"
import { db } from "@/lib/db"
import { Container } from "@/components/ui/container"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { CreateCourseForm } from "./_components/create-course-form"

export default async function NewCoursePage() {
  // In new system, any authenticated user can create courses
  await requireUser()

  // Get all categories
  const categories = await db.category.findMany({
    orderBy: {
      name: "asc"
    }
  })

  return (
    <DashboardLayout showBrowseCoursesButton={false}>
      <Container className="py-8" size="sm">
        <h1 className="mb-2 text-3xl font-bold">Create New Course</h1>
        <p className="mb-8 text-muted-foreground">
          Fill in the basic information to create your course. You can add chapters and content later.
        </p>

        <CreateCourseForm categories={categories} />
      </Container>
    </DashboardLayout>
  )
}
