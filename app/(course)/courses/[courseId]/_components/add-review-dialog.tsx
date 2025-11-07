"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"
import { courseService } from "@/lib/services/course.service"
import { toast } from "sonner"

interface AddReviewDialogProps {
  courseId: string
  existingReview?: {
    id: string
    rating: number
    comment: string
  }
  onReviewAdded?: () => void
  children: React.ReactNode
}

export function AddReviewDialog({ 
  courseId, 
  existingReview, 
  onReviewAdded,
  children 
}: AddReviewDialogProps) {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [comment, setComment] = useState(existingReview?.comment || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating")
      return
    }

    if (!comment.trim()) {
      toast.error("Please write a review comment")
      return
    }

    try {
      setIsSubmitting(true)
      await courseService.addReview(courseId, rating, comment.trim())
      
      toast.success(existingReview ? "Review updated successfully!" : "Review added successfully!")
      setOpen(false)
      onReviewAdded?.()
      
      // Reset form if it's a new review
      if (!existingReview) {
        setRating(0)
        setComment("")
      }
    } catch (error) {
      console.error('Failed to submit review:', error)
      toast.error("Failed to submit review. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    // Reset to original values when closing
    setRating(existingReview?.rating || 0)
    setComment(existingReview?.comment || "")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {existingReview ? "Edit Your Review" : "Write a Review"}
          </DialogTitle>
          <DialogDescription>
            Share your experience with other students. Your feedback helps improve the course.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                  type="button"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= rating
                        ? "fill-warning text-warning"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {rating > 0 && `${rating} star${rating > 1 ? 's' : ''}`}
              </span>
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Review</label>
            <Textarea
              placeholder="Tell other students about your experience with this course..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {comment.length}/500 characters
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>Submitting...</>
            ) : (
              existingReview ? "Update Review" : "Submit Review"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}