"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div
      className={cn(
        "prose prose-slate max-w-none",
        "prose-headings:text-foreground",
        "prose-p:text-muted-foreground",
        "prose-a:text-primary hover:prose-a:text-primary/80",
        "prose-strong:text-foreground",
        "prose-ul:text-muted-foreground",
        "prose-ol:text-muted-foreground",
        className
      )}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}