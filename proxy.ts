import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  const isPublicRoute = 
    pathname === '/' ||
    pathname.startsWith('/sign-in') ||
    pathname.startsWith('/sign-up') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/courses') ||  // Allow public access to courses API
    pathname.startsWith('/api/quizzes') ||  // Allow public access to quizzes API
    pathname.startsWith('/courses') ||
    pathname.startsWith('/quizzes') ||      // Allow public access to quizzes pages
    pathname.startsWith('/search')

  // If user is not authenticated and trying to access protected route
  if (!session && !isPublicRoute) {
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  // If user is authenticated and trying to access auth pages
  if (session && (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up'))) {
    // Redirect to appropriate dashboard based on role
    const redirectUrl = session.user?.role === 'INSTRUCTOR' || session.user?.role === 'ADMIN' 
      ? '/instructor' 
      : '/dashboard'
    return NextResponse.redirect(new URL(redirectUrl, req.url))
  }

  // Role-based access control for instructor routes
  if (pathname.startsWith('/instructor') && session) {
    if (session.user?.role !== 'INSTRUCTOR' && session.user?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  // Role-based access control for student-only routes
  if (pathname.startsWith('/my-courses') && session) {
    if (session.user?.role !== 'STUDENT') {
      return NextResponse.redirect(new URL('/instructor', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, but include all other routes
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}
