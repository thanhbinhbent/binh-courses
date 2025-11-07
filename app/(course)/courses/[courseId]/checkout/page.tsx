import { redirect } from 'next/navigation'
import { isPaymentEnabled } from '@/lib/payment-config'

export default async function CheckoutPage({
  params
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params

  // If payment is disabled, redirect directly to enrollment
  if (!isPaymentEnabled()) {
    redirect(`/courses/${courseId}`)
  }

  // TODO: Implement Stripe checkout
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Payment Integration
          </h1>
          <p className="text-gray-600 mb-6">
            Stripe payment integration will be implemented here.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              <strong>Development Mode:</strong><br />
              Set <code>ENABLE_PAYMENT=false</code> in your <code>.env.local</code> to bypass payments during development.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}