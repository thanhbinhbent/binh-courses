import { cn } from "@/lib/utils"

interface ContainerProps {
  children: React.ReactNode
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
}

export function Container({ children, className, size }: ContainerProps) {
  const sizeClasses = {
    sm: "max-w-2xl",
    md: "max-w-4xl", 
    lg: "max-w-6xl",
    xl: "max-w-7xl"
  };

  return (
    <div className={cn(
      "container mx-auto px-4",
      size && sizeClasses[size],
      className
    )}>
      {children}
    </div>
  )
}