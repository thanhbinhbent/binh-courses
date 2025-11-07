"use client"

import { useState, useEffect } from "react"
import { Star, MoreVertical, ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AddReviewDialog } from "./add-review-dialog"
import { courseService } from "@/lib/services/course.service"
import { toast } from "sonner"

interface Review {
  id: string
  rating: number
  comment: string | null
  userId: string
  createdAt?: string
  user: {
    name: string | null
    image?: string | null
  }
}

interface CourseReviewsProps {
  courseId: string
  isEnrolled: boolean
}

export function CourseReviews({ courseId, isEnrolled }: CourseReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [userReview, setUserReview] = useState<Review | null>(null)
  const [averageRating, setAverageRating] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const fetchReviews = async () => {
    try {
      const data = await courseService.getCourseDetails(courseId)
      if (data) {
        setReviews(data.reviews || [])
        setUserReview(data.userReview || null)
        setAverageRating(data.averageRating || 0)
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
      toast.error("Failed to load reviews")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId])

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete your review?")) return

    try {
      await courseService.deleteReview(courseId, reviewId)
      toast.success("Review deleted successfully")
      await fetchReviews() // Refresh reviews
    } catch (error) {
      console.error('Failed to delete review:', error)
      toast.error("Failed to delete review")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Student Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="h-10 w-10 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Student Reviews</CardTitle>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold ml-1">{averageRating}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                </span>
              </div>
            )}
          </div>

          {/* Add Review Button (only for enrolled students without existing review) */}
          {isEnrolled && !userReview && (
            <AddReviewDialog 
              courseId={courseId} 
              onReviewAdded={fetchReviews}
            >
              <Button>Write a Review</Button>
            </AddReviewDialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">{/* Reviews will go here */}

        {/* User's Existing Review */}
        {userReview && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">Your Review</Badge>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= userReview.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {userReview.createdAt && formatDate(userReview.createdAt)}
                    </span>
                  </div>
                  <p className="text-foreground">{userReview.comment}</p>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <AddReviewDialog 
                      courseId={courseId} 
                      existingReview={userReview ? {
                        id: userReview.id,
                        rating: userReview.rating,
                        comment: userReview.comment || ""
                      } : undefined}
                      onReviewAdded={fetchReviews}
                    >
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        Edit Review
                      </DropdownMenuItem>
                    </AddReviewDialog>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteReview(userReview.id)}
                      className="text-error"
                    >
                      Delete Review
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </>
        )}

        {/* Other Reviews */}
        {reviews.length > 0 ? (
          <>
            <Separator />
            <div className="space-y-4">
              {reviews
                .filter(review => review.id !== userReview?.id)
                .map((review) => (
                  <div key={review.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    {/* User Avatar */}
                    <Avatar>
                      <AvatarFallback>
                        {review.user.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-3">
                      {/* Review Header */}
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{review.user.name || 'Anonymous'}</span>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {review.createdAt && formatDate(review.createdAt)}
                        </span>
                      </div>

                      {/* Review Content */}
                      <p className="text-foreground leading-relaxed">{review.comment || 'No comment provided.'}</p>

                      {/* Review Actions */}
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="text-muted-foreground h-8 px-2">
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          Helpful
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </>
        ) : !userReview ? (
          <>
            <Separator />
            <div className="text-center py-8">
              <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to share your experience with this course!
              </p>
              {isEnrolled && (
                <AddReviewDialog 
                  courseId={courseId} 
                  onReviewAdded={fetchReviews}
                >
                  <Button>Write the First Review</Button>
                </AddReviewDialog>
              )}
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}