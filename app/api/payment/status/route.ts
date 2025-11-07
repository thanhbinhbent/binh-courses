import { NextResponse } from "next/server"
import { isPaymentEnabled } from "@/lib/payment-config"

export async function GET() {
  try {
    const paymentEnabled = isPaymentEnabled()
    
    // Public endpoint for payment status (development only)
    return NextResponse.json({ 
      paymentEnabled,
      env: process.env.ENABLE_PAYMENT || 'undefined',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("[PAYMENT_STATUS_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to get payment status" },
      { status: 500 }
    )
  }
}