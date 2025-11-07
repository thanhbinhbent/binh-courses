"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { instructorCourseService } from "@/lib/services"

interface ChapterDetailsFormProps {
  courseId: string
  chapterId: string
  initialData: {
    title: string
    description: string
  }
}

export function ChapterDetailsForm({
  courseId,
  chapterId,
  initialData
}: ChapterDetailsFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState(initialData)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title) {
      toast.error("Title is required")
      return
    }

    try {
      setIsLoading(true)

      await instructorCourseService.updateChapter(courseId, chapterId, formData)

      toast.success("Chapter updated successfully!")
      router.refresh()
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'UNAUTHORIZED') {
          toast.error("You are not authorized to update chapters")
        } else if (error.message === 'FORBIDDEN') {
          toast.error("Access denied")
        } else {
          toast.error(error.message || "Something went wrong. Please try again.")
        }
      } else {
        toast.error("Something went wrong. Please try again.")
      }
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">
          Chapter Title <span className="text-error">*</span>
        </Label>
        <Input
          id="title"
          placeholder="e.g., Introduction to AWS EC2"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          disabled={isLoading}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Chapter Description</Label>
        <Textarea
          id="description"
          placeholder="What will students learn in this chapter?"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          disabled={isLoading}
          rows={5}
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Changes"
        )}
      </Button>
    </form>
  )
}
