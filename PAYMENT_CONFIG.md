# Payment Configuration

## Environment Variables

To control the payment feature, you need to set both server-side and client-side environment variables:

### In your `.env.local` file:

```bash
# Server-side (for API routes)
ENABLE_PAYMENT=false

# Client-side (for UI components)  
NEXT_PUBLIC_ENABLE_PAYMENT=false
```

### Values:
- `true` (default): Payment is required for course enrollment
- `false`: Bypass payment, allow free enrollment for all courses

### Development Mode:
When `NODE_ENV=development`, you'll see a payment status badge in the header:
- 💳 **ON**: Payment is enabled
- 💳 **OFF**: Payment is disabled (free enrollment)

### Important Notes:
1. **Both variables must be set** for the feature to work correctly
2. Server restarts required when changing environment variables
3. Client-side components need `NEXT_PUBLIC_` prefix to access env vars
4. Default behavior is payment enabled (production-safe)

## Troubleshooting

If the header still shows "ON" after setting `ENABLE_PAYMENT=false`:

1. Make sure you have **both** environment variables set:
   ```bash
   ENABLE_PAYMENT=false
   NEXT_PUBLIC_ENABLE_PAYMENT=false
   ```

2. Restart your development server:
   ```bash
   npm run dev
   ```

3. Check browser console for debug logs (in development mode)

4. Clear browser cache if needed