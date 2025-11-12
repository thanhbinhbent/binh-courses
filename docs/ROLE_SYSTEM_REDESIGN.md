# Role System Redesign Documentation

## Overview
The LMS has been redesigned with a flexible, hybrid role system inspired by Moodle's approach. This separates global platform roles from course-specific roles, allowing users to have different roles in different contexts.

## Architecture

### Global Roles (System-wide)
- **SYSTEM_ADMIN**: Full platform administration access
  - Can manage all users and courses
  - Can assign any course roles to any users
  - Can create courses and assign instructors
  
- **USER**: Regular platform user
  - Can create their own courses (becomes course owner)
  - Can enroll in courses as students
  - Can be assigned instructor/TA roles by course owners or admins

### Course-Specific Roles
Each user can have different roles in different courses:

#### INSTRUCTOR
- **Permissions**: MANAGE_COURSE, MANAGE_CONTENT, MANAGE_USERS, GRADE_ASSIGNMENTS, VIEW_ANALYTICS, MODERATE_COMMENTS
- **Can do**:
  - Edit course settings and content
  - Create/edit chapters, lessons, quizzes
  - Assign roles to other users (instructors, TAs, students)
  - Grade assignments and view analytics
  - Moderate course discussions

#### TEACHING_ASSISTANT
- **Permissions**: MANAGE_CONTENT, GRADE_ASSIGNMENTS, MODERATE_COMMENTS
- **Can do**:
  - Create/edit course content
  - Grade assignments
  - Moderate discussions
  - **Cannot**: Change course settings or manage user roles

#### STUDENT
- **Permissions**: None (implicit read permissions)
- **Can do**:
  - View course content (if enrolled)
  - Take quizzes and submit assignments
  - Participate in discussions

## Key Features

### 1. Flexible Role Assignment
- Users can be instructors in some courses and students in others
- System admins can create courses and assign instructors
- Course owners can delegate roles to other users

### 2. Permission-Based System
- Each role assignment includes specific permissions
- Permissions can be customized per assignment
- Default permission templates provided for consistency

### 3. Audit Trail
- All role assignments track who assigned them and when
- Roles can be temporarily disabled without deletion
- Optional expiration dates for temporary roles

## Database Schema

### New Models

#### RolePermissionTemplate
Defines default permissions for each role type:
```sql
CREATE TABLE "RolePermissionTemplate" (
    "id" TEXT NOT NULL,
    "roleType" "CourseRoleType" NOT NULL,
    "permission" "CoursePermission" NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolePermissionTemplate_pkey" PRIMARY KEY ("id")
);
```

#### CourseRole  
Manages user roles within specific courses:
```sql
CREATE TABLE "CourseRole" (
    "id" TEXT NOT NULL,
    "role" "CourseRoleType" NOT NULL,
    "permissions" "CoursePermission"[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "CourseRole_pkey" PRIMARY KEY ("id")
);
```

### Updated Models

#### User
- Changed `role` (UserRole) → `globalRole` (GlobalRole)
- Added `courseRoles` and `assignedRoles` relationships

#### Course  
- Changed `instructorId` → `ownerId` (course creator, not necessarily instructor)
- Added `courseRoles` relationship

#### Quiz
- Changed `instructorId` → `creatorId` (quiz creator)

## Use Cases Demonstrated in Seed Data

### 1. Course Creation by Different Types of Users
```typescript
// Regular user creates course and becomes instructor
const course = await db.course.create({
  data: { ownerId: regularUser.id, ... }
})

await db.courseRole.create({
  data: {
    userId: regularUser.id,
    courseId: course.id, 
    role: 'INSTRUCTOR',
    permissions: [...allInstructorPermissions]
  }
})
```

### 2. System Admin Assigns Roles
```typescript
// Admin creates course and assigns instructor
const course = await db.course.create({
  data: { ownerId: admin.id, ... }
})

await db.courseRole.create({
  data: {
    userId: designatedInstructor.id,
    courseId: course.id,
    role: 'INSTRUCTOR', 
    assignedBy: admin.id
  }
})
```

### 3. Cross-Course Learning
```typescript
// Instructor in one course becomes student in another
await db.courseRole.create({
  data: {
    userId: instructor1.id,    // AWS instructor
    courseId: istqbCourse.id,  // ISTQB course
    role: 'STUDENT',           // Learning role
    assignedBy: instructor2.id // ISTQB instructor assigns
  }
})
```

### 4. Teaching Assistant Assignment
```typescript
// System admin assigns TA to help with large course
await db.courseRole.create({
  data: {
    userId: experiencedUser.id,
    courseId: popularCourse.id,
    role: 'TEACHING_ASSISTANT',
    permissions: ['MANAGE_CONTENT', 'GRADE_ASSIGNMENTS', 'MODERATE_COMMENTS'],
    assignedBy: admin.id
  }
})
```

## Implementation Benefits

1. **Scalability**: Users can have multiple roles without complex logic
2. **Flexibility**: Easy to add new roles and permissions
3. **Audit**: Complete tracking of who has what permissions and why
4. **Security**: Granular permission control per course
5. **User Experience**: Natural workflow - users can be both learners and teachers

## Migration from Old System

The old system had global roles (ADMIN, INSTRUCTOR, STUDENT). The new system:
- `ADMIN` → `SYSTEM_ADMIN` (global)
- `INSTRUCTOR` → `USER` (global) + course-specific `INSTRUCTOR` roles  
- `STUDENT` → `USER` (global) + course-specific `STUDENT` roles

This allows former "instructors" to also enroll as students in other courses, and former "students" to create and teach their own courses.