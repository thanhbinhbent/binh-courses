import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

interface DashboardLayoutProps {
  children: React.ReactNode;
  showBrowseCoursesButton?: boolean;
}

export function DashboardLayout({ children, showBrowseCoursesButton = true }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="w-full border-b bg-white">
        <Container className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            <span className="text-xl font-bold">Modern LMS</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/instructor">
              <Button variant="ghost">Instructor</Button>
            </Link>
            {showBrowseCoursesButton && (
              <Link href="/courses">
                <Button>Browse Courses</Button>
              </Link>
            )}
          </nav>
        </Container>
      </header>
      
      {/* Content */}
      {children}
    </div>
  );
}