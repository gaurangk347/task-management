# Task Management System

A comprehensive task management solution built with NX monorepo, featuring role-based access control, JWT authentication, and a modern tech stack.

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v16+)
- npm or yarn
- SQLite (included in most operating systems)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# JWT
JWT_SECRET=your_jwt_secret_key

# Database
DATABASE_URL=tasks.db

# Environment
NODE_ENV=development

# API
API_URL=http://localhost:3000
```

### Running the Applications

#### Quick Start

```bash
# Install dependencies, seed the database, and start both frontend and backend
npm install
npm run seed
npm start

# or with yarn
yarn install
yarn seed
yarn start
```

#### Backend

```bash
# Start the API server
nx serve api

# Run in development mode with watch
nx serve api --watch

# Run tests
nx test api
```

#### Frontend

```bash
# Start the development server
nx serve dashboard

# Build for production
nx build dashboard
```

## 🏗️ Architecture Overview

### NX Monorepo Structure

```
task-management/
├── apps/
│   ├── api/              # NestJS backend application
│   └── dashboard/        # Frontend application (Angular)
├── libs/
│   ├── auth/            # Authentication and authorization logic
│   └── data/            # Database models and repositories
└── tools/               # Development tools and scripts
```

### Shared Libraries

- **@task-management/auth**: Handles authentication, JWT generation/validation, and access control
- **@task-management/data**: Database models, repositories, and data access layer

## 🗃️ Data Model

### Core Entities

#### User

- id: UUID (primary key)
- email: string (unique)
- password: string (hashed, automatically hashed before insert)
- organizationId: UUID (foreign key to Organization)
- roleId: UUID (foreign key to Role)
- organization: Organization (relation)
- role: Role (relation)
- createdAt: DateTime (auto-generated)

#### Organization

- id: UUID (primary key)
- name: string
- parentId: UUID? (self-referential, for hierarchical organizations)
- createdAt: DateTime (auto-generated)

#### Role

- id: UUID (primary key)
- name: RoleType (enum: 'owner', 'admin', 'viewer')
- permissions: Permission[] (stored as JSON)

#### Task

- id: UUID (primary key)
- title: string
- description: string (text type)
- status: TaskStatus (enum: TODO, IN_PROGRESS, DONE)
- category: TaskCategory (enum)
- assigneeId: UUID (foreign key to User)
- organizationId: UUID (foreign key to Organization)
- createdBy: string (ID of the user who created the task)
- assignee: User (relation to the assigned user)
- organization: Organization (relation to the organization)
- creator: User (relation to the task creator)
- createdAt: DateTime (auto-generated)
- updatedAt: DateTime (auto-updated)

#### AuditLog

- id: UUID (primary key)
- userId: string (ID of the user who performed the action)
- action: string (the action performed, e.g., 'create', 'update', 'delete')
- resource: string (the type of resource that was affected, e.g., 'Task', 'User')
- resourceId: string (ID of the affected resource)
- details: JSON (stores additional context about the action, nullable)
- timestamp: DateTime (auto-generated when the log entry is created)
- user: User (relation to the user who performed the action)
- createdAt: DateTime
- updatedAt: DateTime

## 🔒 Access Control

### Role-Based Access Control (RBAC)

#### Role Hierarchy

Roles are ordered in a hierarchy where each role includes all permissions from the roles below it:

1. **VIEWER** (Lowest level)

   - Basic read access to tasks

2. **ADMIN**

   - All VIEWER permissions
   - Full task management (create, read, update, delete)
   - Read access to audit logs

3. **OWNER** (Highest level)
   - All ADMIN permissions
   - Full user management (create, read, update, delete users)

#### Permissions by Role

##### VIEWER

- **TASK**
  - `READ` - View tasks

##### ADMIN

- **TASK**
  - `CREATE` - Create new tasks
  - `READ` - View tasks
  - `UPDATE` - Modify existing tasks
  - `DELETE` - Remove tasks
- **AUDIT_LOG**
  - `READ` - View audit logs

##### OWNER

- All ADMIN permissions, plus:
- **USER**
  - `CREATE` - Add new users
  - `READ` - View user information
  - `UPDATE` - Modify user details
  - `DELETE` - Remove users

#### Organization Access

- Users can access resources within their own organization
- OWNER role can access resources in sub-organizations (hierarchical access)
- Organization access is checked in addition to role-based permissions

### Permission System

- Permissions are checked at both route and resource levels
- Organization-based isolation ensures users can only access resources within their organization
- Custom decorators and guards enforce access control

### JWT Integration

- JWT tokens contain user ID, role, and organization ID
- Tokens are verified on each request via an authentication guard
- Tokens expire after a configurable period (default: 1 day)

## 📚 API Documentation

### Authentication

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

Response:

```json
{
  "access_token": "jwt.token.here",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "organizationId": "org-uuid",
    "roleId": "role-uuid",
    "role": "owner|admin|viewer",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Tasks

#### Get All Tasks (Requires TASK:READ permission)

```http
GET /tasks
Authorization: Bearer <token>
```

#### Create Task (Requires TASK:CREATE permission)

```http
POST /tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "New Task",
  "description": "Task description",
  "category": "work|personal",
  "assigneeId": "user-uuid"
}
```

## 🚀 Future Considerations

### Role-Based Task Assignment (Dashboard Implementation)

#### Viewer Experience
- **Task Creation**:
  - Assignee field defaults to current user and is disabled
  - Can only set status for their own tasks
  - Limited to viewing tasks assigned to them
- **Task List**:
  - Filtered to show only tasks where user is assignee or creator
  - Read-only view for tasks assigned to others

#### Admin Experience
- **Task Assignment**:
  - Can assign tasks to themselves or any Viewer
  - User dropdown in task form filters to show only self and Viewers
  - Can update status for any task in their organization
- **Task Management**:
  - Can view, edit, and delete tasks within their organization
  - Advanced filtering by assignee, status, and category

#### Owner Experience
- **Full Control**:
  - Can assign tasks to any user in the organization
  - Complete CRUD operations on all tasks
  - Access to all organization metrics and reports
- **User Management**:
  - User assignment dropdown shows all organization members
  - Can override task assignments when necessary

#### UI/UX Considerations
- Dynamic form fields based on user role
- Clear visual indicators for task ownership and assignment capabilities
- Contextual help for role-based limitations
- Bulk actions for task management where appropriate

### User Management Interface
- **Admin Interface**: Allow admins to create and manage Viewer users
- **Owner Interface**: Enable owners to create and manage both Admin and Viewer users
- **User Onboarding**: Streamlined user registration and role assignment

### Testing
- **API Testing**: Comprehensive test coverage for all API endpoints
- **Frontend Testing**: Unit and integration tests for the dashboard
- **E2E Testing**: Full workflow testing from UI to database

### Advanced Features
- **Role Delegation**: Allow managers to temporarily delegate their permissions
- **Team Management**: Support for team-based task assignment and tracking
- **Audit Logs**: Comprehensive logging of all system actions

### Security Enhancements

- **Refresh Tokens**: Implement refresh token rotation for better security
- **CSRF Protection**: Add CSRF tokens for sensitive operations
- **Rate Limiting**: Protect against brute force attacks
- **RBAC Caching**: Cache permission checks for better performance

### Performance Optimizations

- **Pagination**: For large datasets
- **Selective Field Loading**: Only fetch required fields
- **Caching Layer**: Implement Redis for frequently accessed data
- **Background Jobs**: Offload long-running tasks to job queues

### Monitoring and Observability

- **Error Tracking**: Integrate with error monitoring services
- **Performance Metrics**: Track API response times and error rates
- **Usage Analytics**: Monitor feature usage and system health
