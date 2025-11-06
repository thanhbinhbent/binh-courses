const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all API route files
const apiFiles = glob.sync('app/api/**/route.ts', { cwd: __dirname });

console.log(`Found ${apiFiles.length} API route files`);

apiFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if file has params
  if (!content.includes('{ params }')) {
    return;
  }
  
  let modified = false;
  
  // Pattern 1: Extract single param like courseId
  if (content.match(/params\.courseId/)) {
    if (!content.includes('const { courseId } = await params')) {
      // Find the function start and add destructuring
      content = content.replace(
        /(export async function \w+\([^)]+\) \{[\s\n]+try \{[\s\n]+)/,
        '$1    const { courseId } = await params\n'
      );
      modified = true;
    }
  }
  
  // Pattern 2: chapterId
  if (content.match(/params\.chapterId/)) {
    if (!content.includes('const { chapterId } = await params')) {
      content = content.replace(
        /(export async function \w+\([^)]+\) \{[\s\n]+try \{[\s\n]+)/,
        '$1    const { chapterId } = await params\n'
      );
      modified = true;
    }
  }
  
  // Pattern 3: quizId
  if (content.match(/params\.quizId/)) {
    if (!content.includes('const { quizId } = await params')) {
      content = content.replace(
        /(export async function \w+\([^)]+\) \{[\s\n]+try \{[\s\n]+)/,
        '$1    const { quizId } = await params\n'
      );
      modified = true;
    }
  }
  
  // Pattern 4: Multiple params (courseId + chapterId)
  if (content.match(/params\.courseId/) && content.match(/params\.chapterId/)) {
    if (!content.includes('const { courseId, chapterId } = await params')) {
      content = content.replace(
        /(export async function \w+\([^)]+\) \{[\s\n]+try \{[\s\n]+)/,
        '$1    const { courseId, chapterId } = await params\n'
      );
      modified = true;
    }
  }
  
  // Pattern 5: quizId + attemptId
  if (content.match(/params\.quizId/) && content.match(/params\.attemptId/)) {
    if (!content.includes('const { quizId, attemptId } = await params')) {
      content = content.replace(
        /(export async function \w+\([^)]+\) \{[\s\n]+try \{[\s\n]+)/,
        '$1    const { quizId, attemptId } = await params\n'
      );
      modified = true;
    }
  }
  
  // Replace params.xxx with just xxx
  content = content.replace(/params\.courseId/g, 'courseId');
  content = content.replace(/params\.chapterId/g, 'chapterId');
  content = content.replace(/params\.quizId/g, 'quizId');
  content = content.replace(/params\.attemptId/g, 'attemptId');
  content = content.replace(/params\.questionId/g, 'questionId');
  content = content.replace(/params\.reviewId/g, 'reviewId');
  
  if (modified || content !== fs.readFileSync(filePath, 'utf8')) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${file}`);
  }
});

console.log('\n✅ All API routes updated!');
