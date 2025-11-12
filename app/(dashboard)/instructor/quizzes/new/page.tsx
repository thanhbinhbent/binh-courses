import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/current-user"
import { redirect } from "next/navigation"
import { Container } from "@/components/ui/container"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { CreateQuizForm } from "./_components/create-quiz-form"

export default async function NewQuizPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/sign-in")
  }

  // In new system, all authenticated users can create quizzes

  const categories = await db.category.findMany({
    orderBy: { name: "asc" }
  })

  return (
    <DashboardLayout showBrowseCoursesButton={false}>
      <Container className="py-6" size="md">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Create New Quiz</h1>
          <p className="text-sm text-muted-foreground">
            Fill in the basic information to create your quiz
          </p>
        </div>

        <CreateQuizForm categories={categories} />
      </Container>
    </DashboardLayout>
  )
}
