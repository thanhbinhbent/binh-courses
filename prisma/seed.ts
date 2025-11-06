import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  try {
    console.log('🌱 Starting database seed...')

    // Create categories
    const categories = [
      { name: 'AWS Certification', slug: 'aws-certification' },
      { name: 'Azure Certification', slug: 'azure-certification' },
      { name: 'ISTQB Testing', slug: 'istqb-testing' },
      { name: 'DevOps', slug: 'devops' },
      { name: 'Cloud Architecture', slug: 'cloud-architecture' },
      { name: 'Software Development', slug: 'software-development' },
      { name: 'Data Science', slug: 'data-science' },
      { name: 'Machine Learning', slug: 'machine-learning' },
      { name: 'Cybersecurity', slug: 'cybersecurity' },
      { name: 'Kubernetes', slug: 'kubernetes' },
    ]

    const createdCategories: { id: string; name: string; slug: string }[] = []
    for (const category of categories) {
      const cat = await db.category.upsert({
        where: { slug: category.slug },
        update: {},
        create: category,
      })
      createdCategories.push(cat)
    }

    console.log(`✅ Created ${categories.length} categories`)

    // Create test users
    const hashedPassword = await bcrypt.hash('password123', 10)

    const instructor = await db.user.upsert({
      where: { email: 'instructor@example.com' },
      update: {},
      create: {
        email: 'instructor@example.com',
        name: 'John Instructor',
        password: hashedPassword,
        role: 'INSTRUCTOR',
      },
    })

    const student = await db.user.upsert({
      where: { email: 'student@example.com' },
      update: {},
      create: {
        email: 'student@example.com',
        name: 'Jane Student',
        password: hashedPassword,
        role: 'STUDENT',
      },
    })

    console.log('✅ Created test users')

    // Create sample courses
    const awsCategoryId = createdCategories.find((c) => c.slug === 'aws-certification')?.id
    const azureCategoryId = createdCategories.find((c) => c.slug === 'azure-certification')?.id
    const istqbCategoryId = createdCategories.find((c) => c.slug === 'istqb-testing')?.id

    if (!awsCategoryId || !azureCategoryId || !istqbCategoryId) {
      throw new Error('Required categories not found')
    }

    const awsCourse = await db.course.create({
      data: {
        title: 'AWS Solutions Architect Associate - Complete Course',
        description:
          'Master AWS and pass the Solutions Architect Associate exam. Learn EC2, S3, RDS, VPC, Lambda, and more!',
        imageUrl: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=800',
        price: 49.99,
        isPublished: true,
        categoryId: awsCategoryId,
        instructorId: instructor.id,
        chapters: {
          create: [
            {
              title: 'Introduction to AWS',
              description: 'Learn the basics of Amazon Web Services and cloud computing',
              position: 0,
              videoUrl:
                'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              duration: 596,
              isFree: true,
              isPublished: true,
            },
            {
              title: 'EC2 Fundamentals',
              description: 'Deep dive into Elastic Compute Cloud',
              position: 1,
              videoUrl:
                'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
              duration: 653,
              isFree: false,
              isPublished: true,
            },
            {
              title: 'S3 Storage Services',
              description: 'Learn about Simple Storage Service and object storage',
              position: 2,
              videoUrl:
                'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
              duration: 15,
              isFree: false,
              isPublished: true,
            },
          ],
        },
      },
    })

    const azureCourse = await db.course.create({
      data: {
        title: 'Azure Fundamentals AZ-900 Certification Prep',
        description:
          'Prepare for the Microsoft Azure Fundamentals certification exam. Learn cloud concepts, Azure services, and more!',
        imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
        price: null,
        isPublished: true,
        categoryId: azureCategoryId,
        instructorId: instructor.id,
        chapters: {
          create: [
            {
              title: 'Azure Cloud Concepts',
              description: 'Understanding cloud computing with Azure',
              position: 0,
              videoUrl:
                'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
              duration: 15,
              isFree: true,
              isPublished: true,
            },
            {
              title: 'Azure Services Overview',
              description: 'Explore core Azure services',
              position: 1,
              videoUrl:
                'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
              duration: 60,
              isFree: true,
              isPublished: true,
            },
          ],
        },
      },
    })

    const istqbCourse = await db.course.create({
      data: {
        title: 'ISTQB Foundation Level Certification Course',
        description:
          'Complete preparation for ISTQB Foundation Level certification. Learn software testing fundamentals, techniques, and best practices.',
        imageUrl: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800',
        price: 39.99,
        isPublished: true,
        categoryId: istqbCategoryId,
        instructorId: instructor.id,
        chapters: {
          create: [
            {
              title: 'Software Testing Fundamentals',
              description: 'Introduction to software testing concepts',
              position: 0,
              videoUrl:
                'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
              duration: 15,
              isFree: true,
              isPublished: true,
            },
          ],
        },
      },
    })

    console.log('✅ Created sample courses')

    // Enroll student in Azure course
    await db.enrollment.create({
      data: {
        userId: student.id,
        courseId: azureCourse.id,
      },
    })

    console.log('✅ Enrolled student in Azure Fundamentals course')

    // Create sample quizzes
    const awsQuiz = await db.quiz.create({
      data: {
        title: 'AWS Solutions Architect Practice Quiz',
        description: 'Test your knowledge of AWS core services and architecture best practices',
        categoryId: awsCategoryId,
        instructorId: instructor.id,
        timeLimit: 30,
        passingScore: 70,
        isPublished: true,
        questions: {
          create: [
            {
              type: 'MULTIPLE_CHOICE',
              question: 'Which AWS service provides object storage?',
              points: 10,
              order: 0,
              options: {
                create: [
                  { text: 'EC2', isCorrect: false, order: 0 },
                  { text: 'S3', isCorrect: true, order: 1 },
                  { text: 'RDS', isCorrect: false, order: 2 },
                  { text: 'Lambda', isCorrect: false, order: 3 },
                ]
              }
            },
            {
              type: 'TRUE_FALSE',
              question: 'AWS Lambda allows you to run code without provisioning servers.',
              points: 10,
              order: 1,
              options: {
                create: [
                  { text: 'True', isCorrect: true, order: 0 },
                  { text: 'False', isCorrect: false, order: 1 },
                ]
              }
            },
            {
              type: 'MULTIPLE_CHOICE',
              question: 'What does VPC stand for in AWS?',
              points: 10,
              order: 2,
              options: {
                create: [
                  { text: 'Virtual Private Cloud', isCorrect: true, order: 0 },
                  { text: 'Virtual Public Cloud', isCorrect: false, order: 1 },
                  { text: 'Virtual Processing Center', isCorrect: false, order: 2 },
                  { text: 'Virtual Protection Cloud', isCorrect: false, order: 3 },
                ]
              }
            },
          ]
        }
      }
    })

    const azureQuiz = await db.quiz.create({
      data: {
        title: 'Azure Fundamentals AZ-900 Practice',
        description: 'Practice quiz for Azure Fundamentals certification exam',
        categoryId: azureCategoryId,
        instructorId: instructor.id,
        timeLimit: 45,
        passingScore: 75,
        isPublished: true,
        questions: {
          create: [
            {
              type: 'MULTIPLE_CHOICE',
              question: 'Which Azure service is used for hosting web applications?',
              points: 10,
              order: 0,
              options: {
                create: [
                  { text: 'Azure Virtual Machines', isCorrect: false, order: 0 },
                  { text: 'Azure App Service', isCorrect: true, order: 1 },
                  { text: 'Azure Storage', isCorrect: false, order: 2 },
                  { text: 'Azure SQL Database', isCorrect: false, order: 3 },
                ]
              }
            },
            {
              type: 'TRUE_FALSE',
              question: 'Azure Active Directory is used for identity and access management.',
              points: 10,
              order: 1,
              options: {
                create: [
                  { text: 'True', isCorrect: true, order: 0 },
                  { text: 'False', isCorrect: false, order: 1 },
                ]
              }
            },
            {
              type: 'SHORT_ANSWER',
              question: 'What are the three main cloud service models?',
              points: 15,
              order: 2,
            },
          ]
        }
      }
    })

    const istqbQuiz = await db.quiz.create({
      data: {
        title: 'ISTQB Foundation Level Practice Test',
        description: 'Comprehensive practice test for ISTQB Foundation Level certification',
        categoryId: istqbCategoryId,
        instructorId: instructor.id,
        timeLimit: 60,
        passingScore: 65,
        isPublished: true,
        questions: {
          create: [
            {
              type: 'MULTIPLE_CHOICE',
              question: 'Which of the following is a black-box testing technique?',
              points: 10,
              order: 0,
              options: {
                create: [
                  { text: 'Statement coverage', isCorrect: false, order: 0 },
                  { text: 'Equivalence partitioning', isCorrect: true, order: 1 },
                  { text: 'Branch coverage', isCorrect: false, order: 2 },
                  { text: 'Path coverage', isCorrect: false, order: 3 },
                ]
              }
            },
            {
              type: 'TRUE_FALSE',
              question: 'Testing can prove that software is defect-free.',
              points: 10,
              order: 1,
              options: {
                create: [
                  { text: 'True', isCorrect: false, order: 0 },
                  { text: 'False', isCorrect: true, order: 1 },
                ]
              }
            },
            {
              type: 'ESSAY',
              question: 'Explain the difference between validation and verification in software testing.',
              points: 20,
              order: 2,
            },
          ]
        }
      }
    })

    console.log('✅ Created sample quizzes')

    console.log('\n🎉 Database seeded successfully!')
    console.log('\n📝 Login credentials:')
    console.log('   Instructor: instructor@example.com / password123')
    console.log('   Student: student@example.com / password123')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
