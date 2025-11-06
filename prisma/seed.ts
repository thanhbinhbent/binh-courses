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

    // Create admin user
    const admin = await db.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        name: 'System Admin',
        password: hashedPassword,
        role: 'ADMIN',
        bio: 'Platform administrator with full access to all features.',
      },
    })

    // Create instructors
    const instructor1 = await db.user.upsert({
      where: { email: 'john.instructor@example.com' },
      update: {},
      create: {
        email: 'john.instructor@example.com',
        name: 'John Smith',
        password: hashedPassword,
        role: 'INSTRUCTOR',
        bio: 'Senior Cloud Architect with 10+ years of experience in AWS and Azure. Certified Solutions Architect Professional.',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      },
    })

    const instructor2 = await db.user.upsert({
      where: { email: 'sarah.instructor@example.com' },
      update: {},
      create: {
        email: 'sarah.instructor@example.com',
        name: 'Sarah Johnson',
        password: hashedPassword,
        role: 'INSTRUCTOR',
        bio: 'Software Testing Expert and ISTQB Advanced Level trainer. Specialized in test automation and quality assurance.',
        image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
      },
    })

    const instructor3 = await db.user.upsert({
      where: { email: 'mike.instructor@example.com' },
      update: {},
      create: {
        email: 'mike.instructor@example.com',
        name: 'Michael Chen',
        password: hashedPassword,
        role: 'INSTRUCTOR',
        bio: 'DevOps Engineer and Kubernetes expert. Passionate about containerization and CI/CD pipelines.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      },
    })

    // Create students
    const student1 = await db.user.upsert({
      where: { email: 'jane.student@example.com' },
      update: {},
      create: {
        email: 'jane.student@example.com',
        name: 'Jane Doe',
        password: hashedPassword,
        role: 'STUDENT',
        bio: 'Aspiring cloud developer looking to get AWS certified.',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
      },
    })

    const student2 = await db.user.upsert({
      where: { email: 'alex.student@example.com' },
      update: {},
      create: {
        email: 'alex.student@example.com',
        name: 'Alex Rodriguez',
        password: hashedPassword,
        role: 'STUDENT',
        bio: 'Software developer transitioning to cloud technologies.',
      },
    })

    const student3 = await db.user.upsert({
      where: { email: 'emma.student@example.com' },
      update: {},
      create: {
        email: 'emma.student@example.com',
        name: 'Emma Wilson',
        password: hashedPassword,
        role: 'STUDENT',
        bio: 'QA Engineer studying for ISTQB Foundation certification.',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
      },
    })

    const student4 = await db.user.upsert({
      where: { email: 'david.student@example.com' },
      update: {},
      create: {
        email: 'david.student@example.com',
        name: 'David Kim',
        password: hashedPassword,
        role: 'STUDENT',
        bio: 'System administrator learning DevOps practices.',
      },
    })

    console.log('✅ Created test users (1 admin, 3 instructors, 4 students)')

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
        level: 'INTERMEDIATE',
        categoryId: awsCategoryId,
        instructorId: instructor1.id,
      },
    })

    // Create AWS course chapters
    const awsChapter1 = await db.chapter.create({
      data: {
        title: 'Introduction to AWS',
        description: 'Learn the basics of Amazon Web Services and cloud computing',
        position: 0,
        isFree: true,
        isPublished: true,
        courseId: awsCourse.id,
      },
    })

    const awsChapter2 = await db.chapter.create({
      data: {
        title: 'EC2 Fundamentals',
        description: 'Deep dive into Elastic Compute Cloud',
        position: 1,
        isFree: false,
        isPublished: true,
        courseId: awsCourse.id,
      },
    })

    const awsChapter3 = await db.chapter.create({
      data: {
        title: 'S3 Storage Services',
        description: 'Learn about Simple Storage Service and object storage',
        position: 2,
        isFree: false,
        isPublished: true,
        courseId: awsCourse.id,
      },
    })

    // Create lessons for AWS chapters
    await db.lesson.createMany({
      data: [
        // AWS Chapter 1 lessons
        {
          title: 'What is Cloud Computing?',
          description: 'Introduction to cloud computing concepts and benefits',
          type: 'VIDEO',
          videoUrl: 'https://example.com/video1',
          position: 0,
          duration: 900, // 15 minutes
          isPublished: true,
          isFree: true,
          chapterId: awsChapter1.id,
        },
        {
          title: 'AWS Global Infrastructure',
          description: 'Learn about AWS regions, availability zones, and edge locations',
          type: 'ARTICLE',
          content: `# AWS Global Infrastructure

AWS operates in multiple geographic regions around the world. Each region consists of multiple, isolated locations known as Availability Zones.

## Key Concepts:
- **Regions**: Geographic areas with multiple data centers
- **Availability Zones**: Isolated data center locations within a region
- **Edge Locations**: Points of presence for content delivery

This infrastructure design provides high availability, fault tolerance, and low latency for AWS services.`,
          position: 1,
          duration: 600, // 10 minutes
          isPublished: true,
          isFree: true,
          chapterId: awsChapter1.id,
        },
        {
          title: 'AWS Free Tier Overview',
          description: 'Understanding AWS Free Tier offerings and limitations',
          type: 'VIDEO',
          videoUrl: 'https://example.com/video2',
          position: 2,
          duration: 720, // 12 minutes
          isPublished: true,
          isFree: true,
          chapterId: awsChapter1.id,
        },

        // AWS Chapter 2 lessons
        {
          title: 'EC2 Instance Types',
          description: 'Deep dive into different EC2 instance families and use cases',
          type: 'VIDEO',
          videoUrl: 'https://example.com/video3',
          position: 0,
          duration: 1200, // 20 minutes
          isPublished: true,
          isFree: false,
          chapterId: awsChapter2.id,
        },
        {
          title: 'Launching Your First EC2 Instance',
          description: 'Step-by-step guide to launching and configuring EC2 instances',
          type: 'VIDEO',
          videoUrl: 'https://example.com/video4',
          position: 1,
          duration: 1800, // 30 minutes
          isPublished: true,
          isFree: false,
          chapterId: awsChapter2.id,
        },
        {
          title: 'EC2 Security Groups',
          description: 'Configure security groups for EC2 instances',
          type: 'ARTICLE',
          content: `# EC2 Security Groups

Security groups act as virtual firewalls for your EC2 instances. They control inbound and outbound traffic at the instance level.

## Key Features:
- **Stateful**: Return traffic is automatically allowed
- **Default Deny**: All traffic is denied unless explicitly allowed
- **Multiple Groups**: An instance can belong to multiple security groups

## Best Practices:
1. Use descriptive names and descriptions
2. Follow the principle of least privilege
3. Regularly review and audit rules`,
          position: 2,
          duration: 900, // 15 minutes
          isPublished: true,
          isFree: false,
          chapterId: awsChapter2.id,
        },

        // AWS Chapter 3 lessons
        {
          title: 'S3 Basics and Storage Classes',
          description: 'Introduction to S3 and different storage classes',
          type: 'VIDEO',
          videoUrl: 'https://example.com/video5',
          position: 0,
          duration: 1500, // 25 minutes
          isPublished: true,
          isFree: false,
          chapterId: awsChapter3.id,
        },
        {
          title: 'S3 Bucket Policies and Permissions',
          description: 'Managing access to S3 buckets and objects',
          type: 'ARTICLE',
          content: `# S3 Security and Access Control

Amazon S3 provides several mechanisms to control access to your buckets and objects:

## Access Control Methods:
- **IAM Policies**: Control access at the user/role level
- **Bucket Policies**: Resource-based policies attached to buckets
- **Access Control Lists (ACLs)**: Legacy method for basic permissions

## Security Best Practices:
1. Enable versioning for important data
2. Use lifecycle policies to manage costs
3. Enable server-side encryption
4. Monitor access with CloudTrail`,
          position: 1,
          duration: 1200, // 20 minutes
          isPublished: true,
          isFree: false,
          chapterId: awsChapter3.id,
        },
      ],
    })

    // Create resources for AWS chapters
    await db.resource.createMany({
      data: [
        {
          name: 'AWS Free Tier Guide',
          url: 'https://aws.amazon.com/free/',
          type: 'LINK',
          chapterId: awsChapter1.id,
        },
        {
          name: 'AWS Well-Architected Framework',
          url: 'https://aws.amazon.com/architecture/well-architected/',
          type: 'PDF',
          chapterId: awsChapter1.id,
        },
        {
          name: 'EC2 Instance Types Comparison',
          url: 'https://aws.amazon.com/ec2/instance-types/',
          type: 'LINK',
          chapterId: awsChapter2.id,
        },
        {
          name: 'EC2 User Guide',
          url: 'https://docs.aws.amazon.com/ec2/',
          type: 'DOCUMENT',
          chapterId: awsChapter2.id,
        },
      ],
    })

    const azureCourse = await db.course.create({
      data: {
        title: 'Azure Fundamentals AZ-900 Certification Prep',
        description:
          'Prepare for the Microsoft Azure Fundamentals certification exam. Learn cloud concepts, Azure services, and more!',
        imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
        price: null,
        isPublished: true,
        level: 'BEGINNER',
        categoryId: azureCategoryId,
        instructorId: instructor1.id,
        chapters: {
          create: [
            {
              title: 'Azure Cloud Concepts',
              description: 'Understanding cloud computing with Azure',
              position: 0,
              isFree: true,
              isPublished: true,
            },
            {
              title: 'Azure Services Overview',
              description: 'Explore core Azure services',
              position: 1,
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
        level: 'INTERMEDIATE',
        categoryId: istqbCategoryId,
        instructorId: instructor2.id,
        chapters: {
          create: [
            {
              title: 'Software Testing Fundamentals',
              description: 'Introduction to software testing concepts',
              position: 0,
              isFree: true,
              isPublished: true,
            },
          ],
        },
      },
    })

    // Create lessons for Azure course
    const azureChapters = await db.chapter.findMany({
      where: { courseId: azureCourse.id },
      orderBy: { position: 'asc' }
    })

    if (azureChapters.length > 0) {
      await db.lesson.createMany({
        data: [
          // Azure Chapter 1 lessons
          {
            title: 'What is Cloud Computing?',
            description: 'Understand the fundamentals of cloud computing',
            type: 'VIDEO',
            videoUrl: 'https://example.com/azure-video1',
            position: 0,
            duration: 900,
            isPublished: true,
            isFree: true,
            chapterId: azureChapters[0].id,
          },
          {
            title: 'Benefits of Cloud Computing',
            description: 'Learn about the key benefits of moving to the cloud',
            type: 'ARTICLE',
            content: `# Benefits of Cloud Computing

Cloud computing offers numerous advantages over traditional on-premises infrastructure:

## Key Benefits:
- **Cost Effectiveness**: Pay only for what you use
- **Scalability**: Quickly scale up or down based on demand
- **Global Reach**: Deploy applications worldwide in minutes
- **Reliability**: Built-in redundancy and backup capabilities
- **Security**: Enterprise-grade security and compliance`,
            position: 1,
            duration: 600,
            isPublished: true,
            isFree: true,
            chapterId: azureChapters[0].id,
          },
          {
            title: 'Azure Service Categories',
            description: 'Overview of different Azure service categories',
            type: 'VIDEO',
            videoUrl: 'https://example.com/azure-video2',
            position: 0,
            duration: 1200,
            isPublished: true,
            isFree: true,
            chapterId: azureChapters[1]?.id || azureChapters[0].id,
          },
        ],
      })
    }

    // Create lessons for ISTQB course
    const istqbChapters = await db.chapter.findMany({
      where: { courseId: istqbCourse.id },
      orderBy: { position: 'asc' }
    })

    if (istqbChapters.length > 0) {
      await db.lesson.createMany({
        data: [
          {
            title: 'Introduction to Software Testing',
            description: 'Fundamentals of software testing and quality assurance',
            type: 'VIDEO',
            videoUrl: 'https://example.com/istqb-video1',
            position: 0,
            duration: 1500,
            isPublished: true,
            isFree: true,
            chapterId: istqbChapters[0].id,
          },
          {
            title: 'Seven Principles of Testing',
            description: 'Learn the fundamental principles that guide software testing',
            type: 'ARTICLE',
            content: `# Seven Principles of Testing

The ISTQB Foundation Level defines seven key principles that form the foundation of software testing:

## The Seven Principles:

1. **Testing shows the presence of defects**: Testing can prove defects exist but cannot prove they don't exist
2. **Exhaustive testing is impossible**: Testing everything is not feasible due to time and resource constraints
3. **Early testing saves time and money**: Start testing activities as early as possible in the development lifecycle
4. **Defects cluster together**: A small number of modules usually contain most of the defects
5. **Beware of the pesticide paradox**: Repeated tests become less effective at finding new defects
6. **Testing is context dependent**: Different applications require different testing approaches
7. **Absence-of-errors is a fallacy**: Finding and fixing defects doesn't guarantee system success`,
            position: 1,
            duration: 900,
            isPublished: true,
            isFree: true,
            chapterId: istqbChapters[0].id,
          },
          {
            title: 'Testing Process and Activities',
            description: 'Understanding the test process and key activities',
            type: 'VIDEO',
            videoUrl: 'https://example.com/istqb-video2',
            position: 2,
            duration: 1800,
            isPublished: true,
            isFree: false,
            chapterId: istqbChapters[0].id,
          },
        ],
      })
    }

    console.log('✅ Created sample courses with lessons')

    // Create enrollments for students
    await db.enrollment.createMany({
      data: [
        { userId: student1.id, courseId: azureCourse.id },
        { userId: student2.id, courseId: awsCourse.id },
        { userId: student3.id, courseId: istqbCourse.id },
        { userId: student4.id, courseId: awsCourse.id },
      ],
    })

    console.log('✅ Created enrollments and progress data')

    // Create additional courses for variety
    const devOpsCategoryId = createdCategories.find((c) => c.slug === 'devops')?.id
    const k8sCategoryId = createdCategories.find((c) => c.slug === 'kubernetes')?.id
    const cyberCategoryId = createdCategories.find((c) => c.slug === 'cybersecurity')?.id

    if (devOpsCategoryId) {
      await db.course.create({
        data: {
          title: 'Complete DevOps Bootcamp',
          description: 'Learn Docker, Kubernetes, CI/CD, and modern DevOps practices from scratch to advanced level.',
          imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800',
          price: 79.99,
          isPublished: true,
          level: 'ADVANCED',
          categoryId: devOpsCategoryId,
          instructorId: instructor3.id,
          chapters: {
            create: [
              {
                title: 'Introduction to DevOps',
                description: 'Understanding DevOps culture and principles',
                position: 0,
                isFree: true,
                isPublished: true,
              },
              {
                title: 'Docker Fundamentals',
                description: 'Containerization with Docker',
                position: 1,
                isFree: false,
                isPublished: true,
              },
              {
                title: 'Kubernetes Orchestration',
                description: 'Container orchestration with Kubernetes',
                position: 2,
                isFree: false,
                isPublished: true,
              },
            ],
          },
        },
      })

      // Add lessons to DevOps course
      const devOpsChapters = await db.chapter.findMany({
        where: { courseId: (await db.course.findFirst({ where: { title: 'Complete DevOps Bootcamp' } }))?.id },
        orderBy: { position: 'asc' }
      })

      if (devOpsChapters.length > 0) {
        await db.lesson.createMany({
          data: [
            {
              title: 'What is DevOps?',
              description: 'Introduction to DevOps culture and methodology',
              type: 'VIDEO',
              videoUrl: 'https://example.com/devops-video1',
              position: 0,
              duration: 1200,
              isPublished: true,
              isFree: true,
              chapterId: devOpsChapters[0].id,
            },
            {
              title: 'DevOps Lifecycle',
              description: 'Understanding the DevOps development lifecycle',
              type: 'ARTICLE',
              content: `# DevOps Lifecycle

DevOps is a collaborative approach that bridges the gap between development and operations teams.

## Key Phases:
1. **Plan**: Define requirements and plan the development process
2. **Code**: Write and version control the application code
3. **Build**: Compile and package the application
4. **Test**: Automated testing at multiple levels
5. **Release**: Prepare for deployment
6. **Deploy**: Deploy to production environments
7. **Operate**: Monitor and maintain the application
8. **Monitor**: Gather feedback and metrics for improvement`,
              position: 1,
              duration: 900,
              isPublished: true,
              isFree: true,
              chapterId: devOpsChapters[0].id,
            },
            {
              title: 'Docker Basics',
              description: 'Introduction to containerization with Docker',
              type: 'VIDEO',
              videoUrl: 'https://example.com/docker-video1',
              position: 0,
              duration: 1800,
              isPublished: true,
              isFree: false,
              chapterId: devOpsChapters[1]?.id || devOpsChapters[0].id,
            },
            {
              title: 'Kubernetes Fundamentals',
              description: 'Container orchestration with Kubernetes',
              type: 'VIDEO',
              videoUrl: 'https://example.com/k8s-video1',
              position: 0,
              duration: 2400,
              isPublished: true,
              isFree: false,
              chapterId: devOpsChapters[2]?.id || devOpsChapters[0].id,
            },
          ],
        })
      }
    }

    if (k8sCategoryId) {
      await db.course.create({
        data: {
          title: 'Kubernetes Administration (CKA Prep)',
          description: 'Prepare for Certified Kubernetes Administrator exam with hands-on labs.',
          imageUrl: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800',
          price: 89.99,
          isPublished: true,
          level: 'EXPERT',
          categoryId: k8sCategoryId,
          instructorId: instructor3.id,
          chapters: {
            create: [
              {
                title: 'Kubernetes Architecture',
                description: 'Deep dive into K8s components',
                position: 0,
                isFree: true,
                isPublished: true,
              },
            ],
          },
        },
      })
    }

    if (cyberCategoryId) {
      await db.course.create({
        data: {
          title: 'Cybersecurity Fundamentals',
          description: 'Essential cybersecurity concepts for IT professionals.',
          imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800',
          price: 59.99,
          isPublished: false, // Draft course
          level: 'BEGINNER',
          categoryId: cyberCategoryId,
          instructorId: instructor2.id,
          chapters: {
            create: [
              {
                title: 'Security Fundamentals',
                description: 'Basic security concepts and principles',
                position: 0,
                isFree: true,
                isPublished: false,
              },
            ],
          },
        },
      })
    }

    // Create some purchases
    await db.purchase.createMany({
      data: [
        { userId: student2.id, courseId: awsCourse.id, amount: 49.99 },
        { userId: student4.id, courseId: awsCourse.id, amount: 49.99 },
        { userId: student3.id, courseId: istqbCourse.id, amount: 39.99 },
      ],
    })

    // Create some reviews
    await db.review.createMany({
      data: [
        {
          userId: student1.id,
          courseId: azureCourse.id,
          rating: 5,
          comment: 'Excellent course! Very well structured and easy to follow. The instructor explains concepts clearly.',
        },
        {
          userId: student2.id,
          courseId: awsCourse.id,
          rating: 4,
          comment: 'Great content and practical examples. Would recommend for AWS beginners.',
        },
        {
          userId: student3.id,
          courseId: istqbCourse.id,
          rating: 5,
          comment: 'Perfect preparation for ISTQB exam. Comprehensive coverage of all topics.',
        },
        {
          userId: student4.id,
          courseId: awsCourse.id,
          rating: 4,
          comment: 'Good course overall, but could use more hands-on exercises.',
        },
      ],
    })

    // Create sample quizzes
    await db.quiz.create({
      data: {
        title: 'AWS Solutions Architect Practice Quiz',
        description: 'Test your knowledge of AWS core services and architecture best practices',
        categoryId: awsCategoryId,
        instructorId: instructor1.id,
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

    await db.quiz.create({
      data: {
        title: 'Azure Fundamentals AZ-900 Practice',
        description: 'Practice quiz for Azure Fundamentals certification exam',
        categoryId: azureCategoryId,
        instructorId: instructor1.id,
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

    await db.quiz.create({
      data: {
        title: 'ISTQB Foundation Level Practice Test',
        description: 'Comprehensive practice test for ISTQB Foundation Level certification',
        categoryId: istqbCategoryId,
        instructorId: instructor2.id,
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
    console.log('\n� Data Summary:')
    console.log('   - 10 Categories')
    console.log('   - 8 Users (1 admin, 3 instructors, 4 students)')
    console.log('   - 6 Courses (with various levels and pricing)')
    console.log('   - Multiple Chapters with rich content')
    console.log('   - 4 Enrollments')
    console.log('   - 3 Purchases') 
    console.log('   - 4 Course Reviews')
    console.log('   - 3 Practice Quizzes')
    console.log('\n�📝 Login Credentials:')
    console.log('   🔧 Admin: admin@example.com / password123')
    console.log('   👨‍🏫 Instructors:')
    console.log('      - john.instructor@example.com / password123 (AWS/Azure)')
    console.log('      - sarah.instructor@example.com / password123 (ISTQB/Security)')
    console.log('      - mike.instructor@example.com / password123 (DevOps/K8s)')
    console.log('   👩‍🎓 Students:')
    console.log('      - jane.student@example.com / password123 (Enrolled in Azure)')
    console.log('      - alex.student@example.com / password123 (Purchased AWS)')
    console.log('      - emma.student@example.com / password123 (Purchased ISTQB)')
    console.log('      - david.student@example.com / password123 (Purchased AWS)')
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
