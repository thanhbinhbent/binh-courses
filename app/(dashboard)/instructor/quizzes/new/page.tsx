import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/current-user"
import { redirect } from "next/navigation"
import { CreateQuizForm } from "./_components/create-quiz-form"

export default async function NewQuizPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "INSTRUCTOR") {
    redirect("/")
  }

  const categories = await db.category.findMany({
    orderBy: { name: "asc" }
  })

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create New Quiz</h1>
        <p className="text-sm text-muted-foreground">
          Fill in the basic information to create your quiz
        </p>
      </div>

      <CreateQuizForm categories={categories} />
    </div>
  )
}
