import { Resource } from '@prisma/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { FileIcon } from 'lucide-react'

interface LessonResourcesProps {
  resources: Resource[]
}

export const LessonResources = ({
  resources
}: LessonResourcesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          Resources
        </CardTitle>
      </CardHeader>
      <CardContent>
        {resources.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No resources available for this lesson.
          </p>
        )}
        <div className="space-y-2">
          {resources.map((resource) => (
            <a
              key={resource.id}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg p-2 hover:bg-secondary transition"
            >
              <FileIcon className="h-4 w-4" />
              <span className="text-sm">{resource.name}</span>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}