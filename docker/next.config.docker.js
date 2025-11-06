// Add to next.config.ts for Docker production build
const nextConfig = {
  // ... existing config
  
  // Enable standalone output for Docker
  output: 'standalone',
  
  // Optimize for production
  swcMinify: true,
  
  // Enable experimental features if needed
  experimental: {
    // Enable if using server components
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  
  // Image optimization for Docker
  images: {
    // Configure domains for external images
    domains: [
      'utfs.io', // UploadThing
      'res.cloudinary.com', // Cloudinary
      // Add other image domains
    ],
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig