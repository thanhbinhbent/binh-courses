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
    <div className="min-h-screen flex items-center justify-center bg-muted/50">
      <div className="max-w-md w-full bg-card rounded-lg shadow-md p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Payment Integration
          </h1>
          <p className="text-muted-foreground mb-6">
            Stripe payment integration will be implemented here.
          </p>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <p className="text-primary text-sm">
              <strong>Development Mode:</strong><br />
              Set <code>ENABLE_PAYMENT=false</code> in your <code>.env.local</code> to bypass payments during development.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}