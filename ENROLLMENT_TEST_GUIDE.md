# Payment Bypass Test Guide

## Test Cases for `ENABLE_PAYMENT=false`

### Prerequisites:
1. Set `ENABLE_PAYMENT=false` in `.env`
2. Restart development server
3. Ensure you have a test course and user account

### Test Flow:

#### 1. **Payment Status Check**
```bash
curl http://localhost:3000/api/payment/status
# Expected: {"paymentEnabled":false,"env":"false","timestamp":"..."}
```

#### 2. **UI Payment Badge** 
- Header should show: `💳 OFF`
- Console should log: `🏪 Payment Status from Server: {paymentEnabled: false}`

#### 3. **Course Detail Page**
- Visit: `http://localhost:3000/courses/{courseId}`
- EnrollButton should show: `"Enroll for Free"` (not pricing)

#### 4. **Enrollment API Test**
```bash
# Test enrollment (requires authentication)
curl -X POST http://localhost:3000/api/courses/{courseId}/enroll \
  -H "Content-Type: application/json" \
  -b "cookies_if_needed"
# Expected: Success without purchase check
```

#### 5. **Course Access Test**
- Click "Enroll for Free" button
- Should enroll successfully 
- Redirect to learning interface: `/courses/{courseId}/learn`
- Should access course content without payment

#### 6. **Learning Interface Access**
- Visit: `http://localhost:3000/courses/{courseId}/learn`
- Should load successfully if enrolled
- Should redirect to login if not authenticated
- Should NOT redirect to payment/checkout

### Expected Behavior:
✅ **Payment Disabled (`ENABLE_PAYMENT=false`)**:
- Header shows "💳 OFF"
- Button shows "Enroll for Free"  
- Direct enrollment without payment
- Course access granted after enrollment
- No payment/purchase checks

❌ **Payment Enabled (`ENABLE_PAYMENT=true`)**:
- Header shows "💳 ON"
- Button shows "Enroll for $X"
- Redirect to checkout for payment
- Course access blocked without purchase

### Debug Commands:
```bash
# Check payment status
curl http://localhost:3000/api/payment/status

# Check enrollment status (if you have user session)
curl http://localhost:3000/api/courses/{courseId}/details

# Test enrollment directly
curl -X POST http://localhost:3000/api/courses/{courseId}/enroll
```