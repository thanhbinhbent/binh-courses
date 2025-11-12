/**
 * Service Layer Usage Examples
 * This file demonstrates how to use the centralized service layer
 */

import { 
  courseService, 
  quizService, 
  instructorCourseService, 
  instructorQuizService,
  authService 
} from "@/lib/services"

// ========================================
// STUDENT-FACING SERVICE EXAMPLES
// ========================================

// 1. Course Enrollment
async function handleCourseEnrollment(courseId: string) {
  try {
    await courseService.enrollCourse(courseId)
    console.log("✅ Successfully enrolled in course")
  } catch (error) {
    const err = error as Error
    if (err.message === 'UNAUTHORIZED') {
      console.log("❌ Please sign in first")
    } else if (err.message === 'PURCHASE_REQUIRED') {
      console.log("💳 Please purchase this course first")
    } else if (err.message === 'ALREADY_ENROLLED') {
      console.log("ℹ️ Already enrolled in this course")
    }
  }
}

// 2. Chapter Progress
async function handleChapterComplete(chapterId: string) {
  try {
    await courseService.updateProgress(chapterId, true)
    console.log("✅ Chapter marked as complete")
  } catch (error) {
    const err = error as Error
    if (err.message === 'FORBIDDEN') {
      console.log("❌ You must be enrolled to complete chapters")
    }
  }
}

// 3. Course Reviews
async function handleAddReview(courseId: string, rating: number, comment: string) {
  try {
    await courseService.addReview(courseId, rating, comment)
    console.log("✅ Review added successfully")
  } catch (error) {
    console.log("❌ Failed to add review:", error)
  }
}

// 4. Quiz Operations
async function handleQuizFlow(quizId: string) {
  try {
    // Start quiz
    const attempt = await quizService.startQuizAttempt(quizId)
    console.log("🎯 Quiz started:", attempt.attemptId)
    
    // Save answers during quiz
    await quizService.saveQuizAnswers(quizId, attempt.attemptId, [
      { questionId: "q1", answer: "option1" },
      { questionId: "q2", answer: "option2" }
    ])
    console.log("💾 Answers saved")
    
    // Submit quiz
    const result = await quizService.submitQuizAttempt(quizId, attempt.attemptId)
    console.log("📊 Quiz submitted, score:", result.score)
    
  } catch (error) {
    const err = error as Error
    if (err.message === 'QUIZ_NOT_PUBLISHED') {
      console.log("❌ Quiz is not available")
    }
  }
}

// ========================================
// INSTRUCTOR SERVICE EXAMPLES
// ========================================

// 5. Course Management
async function handleInstructorCourseFlow() {
  try {
    // Create new course
    const course = await instructorCourseService.createCourse("My New Course")
    console.log("📚 Course created:", course.id)
    
    // Update course details
    await instructorCourseService.updateCourse(course.id, {
      title: "Updated Course Title",
      description: "Course description",
      price: 99.99,
      categoryId: "cat1"
    })
    console.log("✏️ Course updated")
    
    // Create chapter
    const chapter = await instructorCourseService.createChapter(course.id, "Chapter 1")
    console.log("📖 Chapter created:", chapter.id)
    
    // Update chapter
    await instructorCourseService.updateChapter(course.id, chapter.id, {
      title: "Updated Chapter Title",
      description: "Chapter description",
      videoUrl: "https://video.url",
      isFree: false
    })
    console.log("✏️ Chapter updated")
    
    // Publish course
    await instructorCourseService.toggleCoursePublish(course.id)
    console.log("🚀 Course published")
    
  } catch (error) {
    const err = error as Error
    if (err.message === 'UNAUTHORIZED') {
      console.log("❌ Not authorized to create courses")
    } else if (err.message === 'INVALID_COURSE_STATE') {
      console.log("❌ Course cannot be published (missing requirements)")
    }
  }
}

// 6. Quiz Management
async function handleInstructorQuizFlow() {
  try {
    // Create quiz
    const quiz = await instructorQuizService.createQuiz({
      title: "My Quiz",
      description: "Quiz description",
      passingScore: 70,
      timeLimit: 60,
      allowRetake: true,
      showCorrectAnswers: true
    })
    console.log("🧠 Quiz created:", quiz.id)
    
    // Add question
    const question = await instructorQuizService.createQuestion(quiz.id, {
      type: "MULTIPLE_CHOICE",
      text: "What is 2 + 2?",
      points: 10,
      options: [
        { text: "3", isCorrect: false },
        { text: "4", isCorrect: true },
        { text: "5", isCorrect: false }
      ]
    })
    console.log("❓ Question created:", question.id)
    
    // Publish quiz
    await instructorQuizService.publishQuiz(quiz.id)
    console.log("🚀 Quiz published")
    
  } catch (error) {
    const err = error as Error
    if (err.message === 'FORBIDDEN') {
      console.log("❌ Not authorized to create quizzes")
    }
  }
}

// 7. Authentication
async function handleUserRegistration() {
  try {
    await authService.register({
      name: "John Doe",
      email: "john@example.com", 
      password: "password123",
      role: "STUDENT"
    })
    console.log("✅ User registered successfully")
  } catch (error) {
    const err = error as Error
    if (err.message === 'USER_EXISTS') {
      console.log("❌ User already exists")
    } else if (err.message === 'INVALID_DATA') {
      console.log("❌ Invalid registration data")
    }
  }
}

// ========================================
// SERVICE LAYER BENEFITS
// ========================================

/*
✅ TYPE SAFETY
- All functions are fully typed
- IntelliSense support
- Compile-time error detection

✅ ERROR HANDLING  
- Consistent error patterns
- Specific error types (UNAUTHORIZED, FORBIDDEN, etc.)
- Easy to handle different error scenarios

✅ MAINTAINABILITY
- Single source of truth for API logic
- Easy to modify endpoints
- Consistent patterns across app

✅ TESTING
- Easy to mock services
- Unit test business logic separately
- Integration test API layer separately

✅ DEVELOPER EXPERIENCE
- No more writing fetch/axios boilerplate
- Consistent API across all components
- Self-documenting code
*/

export {
  handleCourseEnrollment,
  handleChapterComplete,
  handleAddReview,
  handleQuizFlow,
  handleInstructorCourseFlow,
  handleInstructorQuizFlow,
  handleUserRegistration
}