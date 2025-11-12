"use client"

import { AppHeader } from "@/components/app-header";
import { Toaster } from "@/components/ui/sonner";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <>
      <div className="min-h-screen bg-background">
        <AppHeader />
        {/* Content */}
        {children}
      </div>
      <Toaster />
    </>
  );
}