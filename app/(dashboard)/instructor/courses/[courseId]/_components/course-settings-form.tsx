"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Upload } from "lucide-react"
import { toast } from "sonner"
import { instructorCourseService } from "@/lib/services"

interface CourseSettingsFormProps {
  course: {
    id: string
    title: string
    description: string | null
    imageUrl: string | null
    categoryId: string | null
    price: number | null
  }
  categories: Array<{
    id: string
    name: string
  }>
}

export function CourseSettingsForm({ course, categories }: CourseSettingsFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: course.title,
    description: course.description || "",
    categoryId: course.categoryId || "",
    price: course.price?.toString() || "",
    imageUrl: course.imageUrl || ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.description || !formData.categoryId) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setIsLoading(true)

      await instructorCourseService.updateCourse(course.id, {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : undefined
      })

      toast.success("Course updated successfully!")
      router.refresh()
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'UNAUTHORIZED') {
          toast.error("You are not authorized to update this course")
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
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Course Title <span className="text-error">*</span>
        </Label>
        <Input
          id="title"
          placeholder="e.g., Complete AWS Solutions Architect Certification"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          disabled={isLoading}
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">
          Description <span className="text-error">*</span>
        </Label>
        <Textarea
          id="description"
          placeholder="Describe what students will learn in this course..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          disabled={isLoading}
          required
          rows={5}
        />
      </div>

      {/* Image URL */}
      <div className="space-y-2">
        <Label htmlFor="imageUrl">
          Course Image URL
        </Label>
        <div className="flex gap-2">
          <Input
            id="imageUrl"
            type="url"
            placeholder="https://example.com/image.jpg"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            disabled={isLoading}
          />
          <Button type="button" variant="outline" size="icon" disabled>
            <Upload className="h-4 w-4" />
          </Button>
        </div>
        {formData.imageUrl && (
          <div className="mt-2">
            <img
              src={formData.imageUrl}
              alt="Course preview"
              className="h-32 w-full rounded-lg object-cover"
            />
          </div>
        )}
        <p className="text-sm text-muted-foreground">
          Recommended size: 1280x720px
        </p>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">
          Category <span className="text-error">*</span>
        </Label>
        <Select
          value={formData.categoryId}
          onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
          disabled={isLoading}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price */}
      <div className="space-y-2">
        <Label htmlFor="price">
          Price (USD)
        </Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00 (Leave empty for free course)"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          disabled={isLoading}
        />
        <p className="text-sm text-muted-foreground">
          Leave empty to make this course free
        </p>
      </div>

      {/* Submit Button */}
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
