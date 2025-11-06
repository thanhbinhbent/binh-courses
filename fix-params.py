import os
import re

# Get all API route files
api_files = []
for root, dirs, files in os.walk('app/api'):
    for file in files:
        if file == 'route.ts':
            api_files.append(os.path.join(root, file))

print(f"Found {len(api_files)} API route files\n")

for filepath in api_files:
    with open(filepath, 'r') as f:
        content = f.read()
    
    original = content
    modified = False
    
    # Skip if already has await params
    if 'await params' in content:
        continue
    
    # Find params usage patterns
    has_course_id = 'params.courseId' in content
    has_chapter_id = 'params.chapterId' in content
    has_quiz_id = 'params.quizId' in content
    has_attempt_id = 'params.attemptId' in content
    has_question_id = 'params.questionId' in content
    has_review_id = 'params.reviewId' in content
    
    if not any([has_course_id, has_chapter_id, has_quiz_id, has_attempt_id, has_question_id, has_review_id]):
        continue
    
    # Build destructuring statement
    params = []
    if has_course_id:
        params.append('courseId')
    if has_chapter_id:
        params.append('chapterId')
    if has_quiz_id:
        params.append('quizId')
    if has_attempt_id:
        params.append('attemptId')
    if has_question_id:
        params.append('questionId')
    if has_review_id:
        params.append('reviewId')
    
    if params:
        destructure = f"const {{ {', '.join(params)} }} = await params"
        
        # Add after try {
        pattern = r'(export async function \w+\([^)]+\) \{\s*try \{)'
        replacement = f'\\1\n    {destructure}\n'
        content = re.sub(pattern, replacement, content)
        
        # Replace params.xxx with xxx
        content = content.replace('params.courseId', 'courseId')
        content = content.replace('params.chapterId', 'chapterId')
        content = content.replace('params.quizId', 'quizId')
        content = content.replace('params.attemptId', 'attemptId')
        content = content.replace('params.questionId', 'questionId')
        content = content.replace('params.reviewId', 'reviewId')
        
        if content != original:
            with open(filepath, 'w') as f:
                f.write(content)
            print(f"✅ Fixed: {filepath}")
            modified = True

print("\n✅ All API routes updated!")
