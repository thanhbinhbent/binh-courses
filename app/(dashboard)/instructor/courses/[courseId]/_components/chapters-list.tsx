"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, GripVertical, Pencil, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Chapter {
  id: string
  title: string
  position: number
  isPublished: boolean
  isFree: boolean
}

interface ChaptersListProps {
  courseId: string
  chapters: Chapter[]
}

export function ChaptersList({ courseId, chapters }: ChaptersListProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [newChapterTitle, setNewChapterTitle] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newChapterTitle.trim()) {
      toast.error("Please enter a chapter title")
      return
    }

    try {
      setIsLoading(true)

      const response = await fetch(`/api/courses/${courseId}/chapters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: newChapterTitle
        })
      })

      if (!response.ok) {
        throw new Error("Failed to create chapter")
      }

      toast.success("Chapter created successfully!")
      setNewChapterTitle("")
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm("Are you sure you want to delete this chapter?")) {
      return
    }

    try {
      setDeletingId(chapterId)

      const response = await fetch(`/api/courses/${courseId}/chapters/${chapterId}`, {
        method: "DELETE"
      })

      if (!response.ok) {
        throw new Error("Failed to delete chapter")
      }

      toast.success("Chapter deleted successfully!")
      router.refresh()
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
      console.error(error)
    } finally {
      setDeletingId(null)
    }
  }

  const handleTogglePublish = async (chapterId: string, isPublished: boolean) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/chapters/${chapterId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          isPublished: !isPublished
        })
      })

      if (!response.ok) {
        throw new Error("Failed to update chapter")
      }

      toast.success(`Chapter ${!isPublished ? "published" : "unpublished"}!`)
      router.refresh()
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
      console.error(error)
    }
  }

  return (
    <div className="space-y-4">
      {/* Add Chapter Button */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="w-full" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Chapter
          </Button>
        </DialogTrigger>
        <DialogContent>
          <form onSubmit={handleCreateChapter}>
            <DialogHeader>
              <DialogTitle>Add New Chapter</DialogTitle>
              <DialogDescription>
                Create a new chapter for your course. You can edit the details later.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="chapter-title">Chapter Title</Label>
              <Input
                id="chapter-title"
                placeholder="e.g., Introduction to AWS"
                value={newChapterTitle}
                onChange={(e) => setNewChapterTitle(e.target.value)}
                disabled={isLoading}
                className="mt-2"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Chapter"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Chapters List */}
      {chapters.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No chapters yet. Add your first chapter to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {chapters.map((chapter) => (
            <div
              key={chapter.id}
              className="flex items-center gap-2 rounded-lg border bg-white p-3"
            >
              <div className="cursor-grab text-muted-foreground">
                <GripVertical className="h-5 w-5" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{chapter.title}</span>
                  {chapter.isPublished ? (
                    <Badge variant="default" className="text-xs">
                      Published
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      Draft
                    </Badge>
                  )}
                  {chapter.isFree && (
                    <Badge variant="outline" className="text-xs">
                      Free
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTogglePublish(chapter.id, chapter.isPublished)}
                >
                  {chapter.isPublished ? "Unpublish" : "Publish"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push(`/instructor/courses/${courseId}/chapters/${chapter.id}`)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteChapter(chapter.id)}
                  disabled={deletingId === chapter.id}
                >
                  {deletingId === chapter.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-red-500" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {chapters.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Drag chapters to reorder them
        </p>
      )}
    </div>
  )
}
