'use client'

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"

interface PaymentStatusBadgeProps {
  variant?: 'light' | 'dark'
}

export function PaymentStatusBadge({ variant = 'light' }: PaymentStatusBadgeProps) {
  const [paymentEnabled, setPaymentEnabled] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch payment status from server API
    const fetchPaymentStatus = async () => {
      try {
        const response = await fetch('/api/payment/status')
        if (response.ok) {
          const data = await response.json()
          setPaymentEnabled(data.paymentEnabled)
          
          // Log debug info in development
          if (process.env.NODE_ENV === 'development') {
            console.log('🏪 Payment Status from Server:', data)
          }
        } else {
          console.error('Failed to fetch payment status')
          setPaymentEnabled(true) // Default to enabled on error
        }
      } catch (error) {
        console.error('Error fetching payment status:', error)
        setPaymentEnabled(true) // Default to enabled on error
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentStatus()
  }, [])

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  // Show loading state
  if (loading || paymentEnabled === null) {
    return (
      <Badge variant="outline" className="ml-3 text-xs">
        💳 ...
      </Badge>
    )
  }

  if (variant === 'dark') {
    return (
      <Badge 
        variant={paymentEnabled ? "destructive" : "secondary"}
        className="ml-3 text-xs"
      >
        💳 {paymentEnabled ? 'ON' : 'OFF'}
      </Badge>
    )
  }

  return (
    <Badge 
      variant={paymentEnabled ? "destructive" : "secondary"}
      className="ml-3 text-xs"
    >
      💳 {paymentEnabled ? 'ON' : 'OFF'}
    </Badge>
  )
}