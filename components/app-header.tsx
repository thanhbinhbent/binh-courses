"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { useSession } from "next-auth/react";

interface AppHeaderProps {
  showBrowseCoursesButton?: boolean;
  extraNav?: React.ReactNode;
  className?: string;
}

export function AppHeader({ showBrowseCoursesButton = true, extraNav, className = "" }: AppHeaderProps) {
  const { data: session } = useSession()
  
  return (
    <header className={`w-full border-b bg-card/50 backdrop-blur-sm ${className}`}>
      <Container className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">Binh Courses</span>
          </Link>
        </div>
        <nav className="flex items-center gap-4">
          {session?.user && (
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
          )}
          <Link href="/courses">
            <Button variant="ghost">Courses</Button>
          </Link>
          <Link href="/quizzes">
            <Button variant="ghost">Quizzes</Button>
          </Link>
          {session?.user && showBrowseCoursesButton && (
            <Link href="/my-courses">
              <Button variant="ghost">My Courses</Button>
            </Link>
          )}
          {extraNav}
          <ThemeToggle />
          <UserMenu />
        </nav>
      </Container>
    </header>
  );
}
