import { cn } from "@/lib/utils";
import { theme, variants } from "@/lib/theme";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  className?: string;
}

export function PageHeader({ 
  title, 
  description, 
  action, 
  breadcrumb,
  className 
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {breadcrumb && (
        <nav className="text-sm text-muted-foreground">
          {breadcrumb}
        </nav>
      )}
      
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 flex-1">
          <h1 className={theme.typography.heading.h1}>
            {title}
          </h1>
          {description && (
            <p className={theme.typography.body.large}>
              {description}
            </p>
          )}
        </div>
        
        {action && (
          <div className="shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}