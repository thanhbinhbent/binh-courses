import { cn } from "@/lib/utils";

// Theme configuration với semantic colors
export const theme = {
  colors: {
    // Primary brand colors
    primary: {
      50: 'hsl(var(--primary) / 0.05)',
      100: 'hsl(var(--primary) / 0.1)',
      200: 'hsl(var(--primary) / 0.2)',
      500: 'hsl(var(--primary))',
      600: 'hsl(var(--primary) / 0.9)',
      700: 'hsl(var(--primary) / 0.8)',
      900: 'hsl(var(--primary) / 0.95)',
    },
    // Semantic status colors  
    success: {
      50: 'hsl(142 76% 36% / 0.05)',
      100: 'hsl(142 76% 36% / 0.1)',
      500: 'hsl(142 76% 36%)',
      600: 'hsl(142 76% 30%)',
    },
    warning: {
      50: 'hsl(38 92% 50% / 0.05)',
      100: 'hsl(38 92% 50% / 0.1)',
      500: 'hsl(38 92% 50%)',
      600: 'hsl(38 92% 45%)',
    },
    error: {
      50: 'hsl(var(--destructive) / 0.05)',
      100: 'hsl(var(--destructive) / 0.1)',
      500: 'hsl(var(--destructive))',
      600: 'hsl(var(--destructive) / 0.9)',
    },
    // Surface colors
    surface: {
      primary: 'hsl(var(--background))',
      secondary: 'hsl(var(--muted))',
      elevated: 'hsl(var(--card))',
    }
  },
  spacing: {
    section: {
      sm: 'py-8',
      md: 'py-12', 
      lg: 'py-16',
      xl: 'py-20',
    },
    container: {
      sm: 'px-3 sm:px-4',
      md: 'px-4 sm:px-6',
      lg: 'px-4 sm:px-6 lg:px-8',
    }
  },
  typography: {
    heading: {
      h1: 'text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight',
      h2: 'text-2xl sm:text-3xl font-bold tracking-tight',
      h3: 'text-xl sm:text-2xl font-semibold',
      h4: 'text-lg font-semibold',
    },
    body: {
      large: 'text-lg text-muted-foreground',
      default: 'text-base text-foreground',
      small: 'text-sm text-muted-foreground',
    }
  },
  shadows: {
    card: 'shadow-sm hover:shadow-md transition-shadow duration-200',
    elevated: 'shadow-lg',
  },
  animations: {
    fadeIn: 'animate-in fade-in duration-300',
    slideUp: 'animate-in slide-in-from-bottom-4 duration-300',
    scaleIn: 'animate-in zoom-in-95 duration-200',
  }
} as const;

// Component variants for consistency
export const variants = {
  page: {
    default: 'min-h-screen bg-background',
    dashboard: 'min-h-screen bg-muted/30',
  },
  section: {
    default: cn(theme.spacing.section.md),
    hero: cn(theme.spacing.section.xl, 'bg-gradient-to-b from-muted/50 to-background'),
    feature: cn(theme.spacing.section.lg),
  },
  card: {
    default: cn('bg-card text-card-foreground border', theme.shadows.card),
    elevated: cn('bg-card text-card-foreground border', theme.shadows.elevated),
    interactive: cn('bg-card text-card-foreground border cursor-pointer', theme.shadows.card, 'hover:bg-accent/50 transition-colors'),
  },
  stats: {
    card: cn('bg-card p-6 rounded-lg border', theme.shadows.card),
    value: 'text-2xl font-bold',
    label: 'text-sm font-medium text-muted-foreground',
    icon: 'h-4 w-4 text-muted-foreground',
  }
} as const;

// Utility functions for theme
export function getStatusColor(status: 'success' | 'warning' | 'error' | 'info') {
  switch (status) {
    case 'success':
      return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950 dark:border-emerald-800';
    case 'warning':
      return 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950 dark:border-amber-800';
    case 'error':
      return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-800';
    case 'info':
      return 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950 dark:border-blue-800';
    default:
      return 'text-foreground bg-muted border-border';
  }
}