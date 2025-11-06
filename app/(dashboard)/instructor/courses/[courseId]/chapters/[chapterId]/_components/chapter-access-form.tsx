"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { instructorCourseService } from "@/lib/services"

interface ChapterAccessFormProps {
  courseId: string
  chapterId: string
  initialData: {
    isFree: boolean
    isPublished: boolean
  }
}

export function ChapterAccessForm({
  courseId,
  chapterId,
  initialData
}: ChapterAccessFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState(initialData)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsLoading(true)

      await instructorCourseService.updateChapter(courseId, chapterId, formData)

      toast.success("Settings updated successfully!")
      router.refresh()
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'UNAUTHORIZED') {
          toast.error("You are not authorized to update chapter settings")
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="isFree">Free Preview</Label>
          <p className="text-sm text-muted-foreground">
            Make this chapter free for everyone to preview
          </p>
        </div>
        <Switch
          id="isFree"
          checked={formData.isFree}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, isFree: checked })
          }
          disabled={isLoading}
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="isPublished">Published</Label>
          <p className="text-sm text-muted-foreground">
            Make this chapter visible in the course
          </p>
        </div>
        <Switch
          id="isPublished"
          checked={formData.isPublished}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, isPublished: checked })
          }
          disabled={isLoading}
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Settings"
        )}
      </Button>
    </form>
  )
}
