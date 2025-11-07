/**
 * Client-side payment utilities that work with server APIs
 */

/**
 * Check if payment is required for enrollment (client-side)
 */
export async function checkPaymentRequired(coursePrice?: number | null): Promise<boolean> {
  try {
    // Get payment status from server
    const response = await fetch('/api/payment/status')
    if (!response.ok) {
      console.error('Failed to get payment status, defaulting to payment required')
      return true // Default to payment required on error
    }
    
    const { paymentEnabled } = await response.json()
    
    // If payment is disabled globally, no payment required
    if (!paymentEnabled) {
      return false
    }
    
    // If course has no price or price is 0, no payment required
    if (!coursePrice || coursePrice <= 0) {
      return false
    }
    
    // Otherwise, payment is required
    return true
  } catch (error) {
    console.error('Error checking payment requirement:', error)
    return true // Default to payment required on error
  }
}

/**
 * Get enrollment button text (client-side)
 */
export async function getEnrollmentButtonText(coursePrice?: number | null): Promise<string> {
  const requiresPayment = await checkPaymentRequired(coursePrice)
  
  if (!requiresPayment) {
    return 'Enroll for Free'
  }
  
  if (coursePrice && coursePrice > 0) {
    return `Enroll for $${coursePrice}`
  }
  
  return 'Enroll Now'
}