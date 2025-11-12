"use client"

// Removed unused imports after AppHeader refactor
import { AppHeader } from "@/components/app-header";
// Removed useUserRole, no longer needed
import { Toaster } from "@/components/ui/sonner";

interface DashboardLayoutProps {
  children: React.ReactNode;
  showBrowseCoursesButton?: boolean;
}

export function DashboardLayout({ children, showBrowseCoursesButton = true }: DashboardLayoutProps) {
  // Removed isInstructor, no longer needed
  
  return (
    <div className="min-h-screen bg-background">
      <AppHeader showBrowseCoursesButton={showBrowseCoursesButton} />
      {/* Content */}
      {children}
      <Toaster />
    </div>
  );
}