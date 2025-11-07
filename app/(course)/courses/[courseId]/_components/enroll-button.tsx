'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { courseService } from "@/lib/services/course.service"
import { checkPaymentRequired, getEnrollmentButtonText } from "@/lib/client-payment-utils"
import { toast } from "sonner"

interface EnrollButtonProps {
  courseId: string
  coursePrice?: number | null
  isEnrolled: boolean
  disabled?: boolean
}

export function EnrollButton({ 
  courseId, 
  coursePrice, 
  isEnrolled, 
  disabled = false 
}: EnrollButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [buttonText, setButtonText] = useState('Enroll Now')
  const [justEnrolled, setJustEnrolled] = useState(false)

  useEffect(() => {
    // Update button text based on payment requirements
    const updateButtonText = async () => {
      const text = await getEnrollmentButtonText(coursePrice)
      setButtonText(text)
    }
    updateButtonText()
  }, [coursePrice])

  const handleEnroll = async () => {
    try {
      setIsLoading(true)
      
      // Check if payment is required
      const paymentRequired = await checkPaymentRequired(coursePrice)
      if (paymentRequired) {
        // Redirect to payment flow (Stripe checkout)
        console.log('🏪 Payment required, redirecting to checkout...')
        // TODO: Implement Stripe checkout redirect
        router.push(`/courses/${courseId}/checkout`)
        return
      }
      
      // Free enrollment (when payment is disabled or course is free)
      console.log('🎓 Free enrollment, enrolling directly...')
      await courseService.enrollCourse(courseId)
      
      // Show success state briefly then redirect to learning
      setJustEnrolled(true)
      
      // Show success toast
      toast.success("Successfully enrolled! Redirecting to course...")
      
      // Wait a moment to show success, then redirect to learning
      setTimeout(() => {
        router.push(`/courses/${courseId}/learn`)
      }, 1000)
      
    } catch (error) {
      console.error('Enrollment error:', error)
      
      if (error instanceof Error) {
        if (error.message === 'UNAUTHORIZED') {
          toast.error("Please sign in to enroll")
          router.push('/sign-in')
          return
        }
        
        if (error.message === 'ALREADY_ENROLLED') {
          toast.info("You're already enrolled in this course!")
          router.refresh()
          return
        }
        
        if (error.message === 'PURCHASE_REQUIRED') {
          toast.info("Payment required for this course")
          // Redirect to payment
          router.push(`/courses/${courseId}/checkout`)
          return
        }
      }
      
      // Show error message to user
      toast.error("Failed to enroll. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isEnrolled) {
    return (
      <Button 
        onClick={() => router.push(`/courses/${courseId}/learn`)}
        className="w-full bg-green-600 hover:bg-green-700 text-white"
      >
        Continue Learning
      </Button>
    )
  }

  return (
    <Button
      onClick={handleEnroll}
      disabled={disabled || isLoading || justEnrolled}
      className={`w-full text-white ${
        justEnrolled 
          ? 'bg-green-600 hover:bg-green-700' 
          : 'bg-blue-600 hover:bg-blue-700'
      }`}
    >
      {justEnrolled ? (
        <>
          ✅ Enrolled! Redirecting...
        </>
      ) : isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        buttonText
      )}
    </Button>
  )
}