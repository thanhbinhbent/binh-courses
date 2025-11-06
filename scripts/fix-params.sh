#!/bin/bash

# Fix Next.js 15 params Promise issue in all dynamic route files
echo "🔧 Fixing params Promise issues in dynamic route files..."

# List of files to fix
FILES=(
  "app/(dashboard)/instructor/courses/[courseId]/page.tsx"
  "app/(dashboard)/instructor/courses/[courseId]/chapters/[chapterId]/page.tsx" 
  "app/(quiz)/quizzes/[quizId]/page.tsx"
  "app/(quiz)/quizzes/[quizId]/take/[attemptId]/page.tsx"
  "app/(quiz)/quizzes/[quizId]/results/[attemptId]/page.tsx"
  "app/(dashboard)/instructor/quizzes/[quizId]/page.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "📝 Fixing $file..."
    
    # Add 'use' import if not present
    if ! grep -q "import.*use" "$file"; then
      sed -i '' '1s/import { /import { use, /' "$file"
    fi
    
    # Update params type to Promise
    sed -i '' 's/params: { \([^}]*\) }/params: Promise<{ \1 }>/' "$file"
    
    # Add use(params) destructuring after params declaration
    if grep -q "export default.*params" "$file"; then
      # Find the line after params declaration and add destructuring
      awk '/params: Promise<{.*}>/ { 
        print $0; 
        if (match($0, /courseId.*chapterId/)) {
          print "  const { courseId, chapterId } = use(params)"
        } else if (match($0, /courseId/)) {
          print "  const { courseId } = use(params)" 
        } else if (match($0, /quizId.*attemptId/)) {
          print "  const { quizId, attemptId } = use(params)"
        } else if (match($0, /quizId/)) {
          print "  const { quizId } = use(params)"
        }
        next 
      } 
      { print }' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
    fi
    
    # Replace all params.property with property
    sed -i '' 's/params\.courseId/courseId/g' "$file"
    sed -i '' 's/params\.chapterId/chapterId/g' "$file"
    sed -i '' 's/params\.quizId/quizId/g' "$file"
    sed -i '' 's/params\.attemptId/attemptId/g' "$file"
    
    echo "✅ Fixed $file"
  else
    echo "⚠️ File not found: $file"
  fi
done

echo "🎉 All params Promise issues fixed!"