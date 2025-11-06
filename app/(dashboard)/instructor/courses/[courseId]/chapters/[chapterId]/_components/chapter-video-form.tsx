"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Video } from "lucide-react"
import { toast } from "sonner"

interface ChapterVideoFormProps {
  courseId: string
  chapterId: string
  initialData: {
    videoUrl: string
    duration: number
  }
}

export function ChapterVideoForm({
  courseId,
  chapterId,
  initialData
}: ChapterVideoFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState(initialData)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.videoUrl) {
      toast.error("Video URL is required")
      return
    }

    try {
      setIsLoading(true)

      const response = await fetch(
        `/api/courses/${courseId}/chapters/${chapterId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            videoUrl: formData.videoUrl,
            duration: formData.duration
          })
        }
      )

      if (!response.ok) {
        throw new Error("Failed to update chapter video")
      }

      toast.success("Video updated successfully!")
      router.refresh()
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="videoUrl">
          Video URL <span className="text-red-500">*</span>
        </Label>
        <Input
          id="videoUrl"
          type="url"
          placeholder="https://example.com/video.mp4"
          value={formData.videoUrl}
          onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
          disabled={isLoading}
          required
        />
        <p className="text-xs text-muted-foreground">
          Enter a direct video URL (MP4, WebM, etc.)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="duration">Duration (seconds)</Label>
        <Input
          id="duration"
          type="number"
          min="0"
          placeholder="e.g., 600 (10 minutes)"
          value={formData.duration}
          onChange={(e) =>
            setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })
          }
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          Video duration in seconds (optional)
        </p>
      </div>

      {formData.videoUrl && (
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Video className="h-4 w-4" />
            <span>Preview:</span>
          </div>
          <video
            src={formData.videoUrl}
            controls
            className="mt-2 w-full rounded-lg"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Video"
        )}
      </Button>
    </form>
  )
}
