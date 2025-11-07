import { Badge } from "@/components/ui/badge"

export default function TestBadge() {
  return (
    <div className="p-8 space-y-4">
      <h1>Badge Test</h1>
      
      <div className="space-y-2">
        <div>
          <Badge variant="default">Default Badge</Badge>
        </div>
        
        <div>
          <Badge variant="secondary">Secondary Badge</Badge>
        </div>
        
        <div>
          <Badge variant="outline">Outline Badge</Badge>
        </div>
        
        <div>
          <Badge variant="destructive">Destructive Badge</Badge>
        </div>
      </div>

      <div className="mt-8">
        <h2>With explicit colors (for comparison):</h2>
        <Badge className="bg-gray-200 text-gray-800">Manual Gray Badge</Badge>
      </div>
    </div>
  )
}