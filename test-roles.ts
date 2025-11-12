import { db } from './lib/db'

async function testMultipleRoles() {
  console.log('Testing multiple global roles...')
  
  // Find admin user
  const adminUser = await db.user.findFirst({
    where: { email: 'admin@example.com' }
  })
  
  console.log('\nAdmin user global roles:', adminUser?.globalRoles)
  
  // Test role checking functions
  const hasSystemAdmin = adminUser?.globalRoles.includes('SYSTEM_ADMIN')
  const hasUser = adminUser?.globalRoles.includes('USER')
  
  console.log('Has SYSTEM_ADMIN role:', hasSystemAdmin)
  console.log('Has USER role:', hasUser)
  
  // Test with instructor
  const instructor = await db.user.findFirst({
    where: { email: 'john.instructor@example.com' }
  })
  
  console.log('\nInstructor global roles:', instructor?.globalRoles)
  
  // Check course roles
  const courseRoles = await db.courseRole.findMany({
    where: { userId: instructor?.id },
    include: {
      course: { select: { title: true } },
      user: { select: { name: true, email: true } }
    }
  })
  
  console.log('\nCourse roles for instructor:')
  courseRoles.forEach(role => {
    console.log(`- ${role.user.name} is ${role.role} in "${role.course.title}"`)
  })
  
  await db.$disconnect()
}

testMultipleRoles().catch(console.error)