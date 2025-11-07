/**
 * Payment feature configuration utilities
 */

/**
 * Check if payment feature is enabled
 * @returns {boolean} true if payment is enabled, false otherwise
 */
export function isPaymentEnabled(): boolean {
  // Only check server-side env var
  const enablePayment = process.env.ENABLE_PAYMENT
  
  // Default to true if env var is not set (production-safe)
  // Only disable payment if explicitly set to "false"
  return enablePayment !== 'false'
}

/**
 * Check if course enrollment requires payment
 * @param coursePrice - The price of the course
 * @returns {boolean} true if payment is required, false if free enrollment is allowed
 */
export function requiresPaymentForEnrollment(coursePrice?: number | null): boolean {
  // If payment is disabled globally, no payment required
  if (!isPaymentEnabled()) {
    return false
  }
  
  // If course has no price or price is 0, no payment required
  if (!coursePrice || coursePrice <= 0) {
    return false
  }
  
  // Otherwise, payment is required
  return true
}

/**
 * Get enrollment button text based on payment requirements
 * @param coursePrice - The price of the course
 * @returns {string} Button text for enrollment
 */
export function getEnrollmentButtonText(coursePrice?: number | null): string {
  if (!requiresPaymentForEnrollment(coursePrice)) {
    return 'Enroll for Free'
  }
  
  if (coursePrice && coursePrice > 0) {
    return `Enroll for $${coursePrice}`
  }
  
  return 'Enroll Now'
}

/**
 * Development mode helper - log payment status
 */
export function logPaymentStatus() {
  if (process.env.NODE_ENV === 'development') {
    console.log('🏪 Payment Feature Status:', {
      enabled: isPaymentEnabled(),
      env: process.env.ENABLE_PAYMENT || 'undefined (defaults to true)',
      mode: process.env.NODE_ENV
    })
  }
}