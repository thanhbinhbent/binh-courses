#!/bin/bash

# Script to fix Next.js 15+ params Promise issue in all API routes

echo "🔧 Fixing API route params to use Promise..."

# Fix chapters progress route
sed -i '' 's/{ params }: { params: { chapterId: string } }/{ params }: { params: Promise<{ chapterId: string }> }/g' \
  app/api/chapters/[chapterId]/progress/route.ts

# Fix course routes
find app/api/courses -name "*.ts" -type f -exec sed -i '' \
  's/{ params }: { params: { courseId: string } }/{ params }: { params: Promise<{ courseId: string }> }/g' {} \;

# Fix course + chapter routes  
find app/api/courses -name "*.ts" -type f -exec sed -i '' \
  's/{ params }: { params: { courseId: string; chapterId: string } }/{ params }: { params: Promise<{ courseId: string; chapterId: string }> }/g' {} \;

# Fix course + review routes
find app/api/courses -name "*.ts" -type f -exec sed -i '' \
  's/{ params }: { params: { courseId: string; reviewId: string } }/{ params }: { params: Promise<{ courseId: string; reviewId: string }> }/g' {} \;

# Fix quiz routes
find app/api/quizzes -name "*.ts" -type f -exec sed -i '' \
  's/{ params }: { params: { quizId: string } }/{ params }: { params: Promise<{ quizId: string }> }/g' {} \;

# Fix quiz + attempt routes
find app/api/quizzes -name "*.ts" -type f -exec sed -i '' \
  's/{ params }: { params: { quizId: string; attemptId: string } }/{ params }: { params: Promise<{ quizId: string; attemptId: string }> }/g' {} \;

# Fix quiz + question routes
find app/api/quizzes -name "*.ts" -type f -exec sed -i '' \
  's/{ params }: { params: { quizId: string; questionId: string } }/{ params }: { params: Promise<{ quizId: string; questionId: string }> }/g' {} \;

echo "✅ Params signatures updated"
echo "🔧 Now adding await statements..."

# Now we need to add await for params usage
# This is more complex, will do manually for key files

echo "⚠️  Manual step needed: Add 'const { paramName } = await params' at start of each handler"
echo "Example:"
echo "  const { courseId } = await params"
