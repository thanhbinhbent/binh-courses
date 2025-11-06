import { formatDistanceToNow } from "date-fns"
import { Star, User } from "lucide-react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: Date
  user: {
    name: string | null
    image: string | null
  }
}

interface CourseReviewsProps {
  reviews: Review[]
  averageRating: number
  totalReviews: number
}

export function CourseReviews({ reviews, averageRating, totalReviews }: CourseReviewsProps) {
  if (reviews.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <div className="space-y-3">
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Star className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold">No reviews yet</h3>
              <p className="text-sm text-muted-foreground">
                Be the first to review this course!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <div className="text-center space-y-2">
              <div className="text-5xl font-bold text-primary">{averageRating.toFixed(1)}</div>
              <div className="flex items-center justify-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>

            <div className="flex-1 space-y-3">
              <h4 className="font-semibold text-lg mb-4">Rating Breakdown</h4>
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviews.filter((r) => r.rating === rating).length
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0

                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex w-16 items-center justify-between">
                      <span className="text-sm font-medium">{rating}</span>
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="h-3 flex-1 rounded-full bg-muted border">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-16 text-right text-sm font-medium text-muted-foreground">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        <h4 className="font-semibold text-lg">Recent Reviews</h4>
        {reviews.map((review) => (
          <Card key={review.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                {review.user.image ? (
                  <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-muted">
                    <Image
                      src={review.user.image}
                      alt={review.user.name || "User"}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted border-2 border-background">
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}

                <div className="flex-1 space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-lg">{review.user.name || "Anonymous"}</p>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
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
                  </div>

                  {review.comment && (
                    <div className="bg-muted/50 p-4 rounded-lg border-l-4 border-l-primary/30">
                      <p className="text-sm leading-relaxed">{review.comment}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
