#!/bin/bash

# Add use import and destructuring to remaining files
echo "🔧 Adding use import and destructuring..."

# Files that need fixing
declare -A files_params=(
  ["app/(dashboard)/instructor/courses/[courseId]/chapters/[chapterId]/page.tsx"]="courseId chapterId"
  ["app/(quiz)/quizzes/[quizId]/page.tsx"]="quizId"
  ["app/(quiz)/quizzes/[quizId]/take/[attemptId]/page.tsx"]="quizId attemptId"
  ["app/(quiz)/quizzes/[quizId]/results/[attemptId]/page.tsx"]="quizId attemptId"
  ["app/(dashboard)/instructor/quizzes/[quizId]/page.tsx"]="quizId"
)

for file in "${!files_params[@]}"; do
  if [ -f "$file" ]; then
    params="${files_params[$file]}"
    echo "📝 Fixing $file with params: $params..."
    
    # Add use import if not present
    if ! grep -q "import.*use" "$file"; then
      sed -i '' 's/import { \([^}]*\) } from "react"/import { \1, use } from "react"/' "$file"
    fi
    
    # Add destructuring line after params declaration
    if [[ "$params" == *" "* ]]; then
      # Multiple params
      destructure="const { $(echo $params | tr ' ' ', ') } = use(params)"
    else
      # Single param
      destructure="const { $params } = use(params)"
    fi
    
    # Add destructuring after the closing brace of function params
    awk -v destructure="  $destructure" '
    /^}) {$/ { 
      print $0; 
      print destructure; 
      next 
    }
    { print }
    ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
    
    echo "✅ Fixed $file"
  fi
done

echo "🎉 All use imports and destructuring added!"