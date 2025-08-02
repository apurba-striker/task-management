

# 📋 **Task Management Application Documentation**


# 🚀 Task Management Application

A comprehensive full-stack task management system built with React.js frontend and Node.js backend, featuring authentication, file uploads, real-time updates, and comprehensive testing.

# Deployment

Live Link : https://task-management-chi-seven.vercel.app/
## 📑 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Development Setup](#development-setup)
- [Testing](#testing)
- [API Documentation](#api-documentation)
- [Design Decisions](#design-decisions)
- [License](#license)


## ✨ Features

### Core Functionality

- 🔐 **User Authentication** - JWT-based login/register with role-based access
- 📝 **Task Management** - Full CRUD operations with status tracking
- 👥 **User Management** - Admin panel for user administration
- 📎 **File Attachments** - PDF upload and download for tasks
- 🔍 **Advanced Filtering** - Search, filter, and sort tasks
- 📊 **Dashboard** - Task overview and statistics
- 📱 **Responsive Design** - Mobile-friendly interface


### Technical Features

- 🐳 **Docker Containerization** - Easy deployment and development
- 🧪 **Comprehensive Testing** - Unit, integration, and E2E tests
- 🔄 **Real-time Updates** - Socket.IO integration
- 🛡️ **Security** - Input validation, rate limiting, and CORS protection
- 📚 **API Documentation** - Swagger/OpenAPI integration
- ⚡ **Performance** - Optimized queries and caching


## 🛠️ Tech Stack

### Frontend

- **React.js 18** - Modern UI library with hooks
- **React Router** - Client-side routing
- **Zustand** - Lightweight state management
- **React Hook Form** - Form handling and validation
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Toast notifications
- **React Dropzone** - File upload interface


### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload middleware
- **Socket.IO** - Real-time communication
- **Helmet** - Security middleware


### DevOps \& Testing

- **Docker \& Docker Compose** - Containerization
- **Jest** - JavaScript testing framework
- **React Testing Library** - React component testing
- **Supertest** - HTTP assertion library
- **Cypress** - End-to-end testing
- **MongoDB Memory Server** - In-memory database for testing


## 📁 Project Structure

```
task-management-app/
├── 📁 backend/                    # Node.js backend application
│   ├── 📁 src/
│   │   ├── 📁 controllers/        # Request handlers
│   │   ├── 📁 models/             # MongoDB schemas
│   │   ├── 📁 routes/             # API route definitions
│   │   ├── 📁 middleware/         # Custom middleware
│   │   ├── 📁 utils/              # Utility functions
│   │   ├── 📁 uploads/            # File storage directory
│   │   ├── 📄 app.js              # Express app configuration
│   │   └── 📄 server.js           # Server entry point
│   ├── 📁 tests/                  # Test files
│   │   ├── 📁 unit/               # Unit tests
│   │   ├── 📁 integration/        # Integration tests
│   │   └── 📁 setup/              # Test configuration
│   ├── 📄 Dockerfile              # Backend container config
│   ├── 📄 jest.config.js          # Jest test configuration
│   |── 📄 package.json            # Backend dependencies
|   |__ 📄 .env                    # Environment variables 
│
├── 📁 frontend/                   # React.js frontend application
│   ├── 📁 public/                 # Static assets
│   ├── 📁 src/
│   │   ├── 📁 components/         # Reusable UI components
│   │   ├── 📁 pages/              # Page-level components
│   │   ├── 📁 store/              # Zustand state management
│   │   ├── 📁 services/           # API service layer
│   │   ├── 📁 utils/              # Utility functions
│   │   └── 📄 App.jsx             # Main app component
│   ├── 📄 Dockerfile              # Frontend container config
│   |── 📄 package.json
|   |__ 📄 .env                    # Environment variables 
│
├── 📄 docker-compose.yml          # Multi-container orchestration              
└── 📄 README.md                   # Project documentation
```


## 📋 Prerequisites

Before running this application, ensure you have:

- **Node.js** (v18 or higher)
- **Docker \& Docker Compose** (recommended)
- **MongoDB Atlas account** (for database)
- **Git** (for version control)


## 🚀 Quick Start

### Option 1: Docker (Recommended)

1. **Clone the repository**

```bash
git clone https://github.com/apurba-striker/task-management.git
cd task-management-app
```

2. **Set up environment variables**

Change `.env.example` to `.env`
Update `.env` with your configuration:

### Environment Configuration

**Backend (.env)**

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env)**

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

3. **Start the application**

```bash
docker-compose up --build
```

4. **Access the application**
    - Frontend: http://localhost:3000
    - Backend API: http://localhost:5000
    - API Documentation: http://localhost:5000/api-docs

### Option 2: Local Development

1. **Start Backend**

```bash
cd backend
npm install
npm start
```

2. **Start Frontend** (in new terminal)

```bash
cd frontend
npm install
npm start
```
## Admin Credentials:
**Email**: admin@taskmanager.com
**Password**: admin123456

##  Development Setup


### Docker Environment Variables

For Docker deployment, the `docker-compose.yml` automatically configures:

- Backend API URL for frontend
- Database connections
- Port mappings
- Volume mounts for development


## 🧪 Testing

### Backend Testing

```bash
cd backend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suites
npm run test:unit
npm run test:integration
```

## 📚 API Documentation

### Swagger Documentation

Access interactive API documentation at: http://localhost:5000/api-docs

### Main API Endpoints

**Authentication**

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

**Tasks**

- `GET /api/tasks` - List tasks with filtering
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

**Users**

- `GET /api/users` - List users (admin only)
- `POST /api/users` - Create user (admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

**Files**

- `POST /api/files/upload/:taskId` - Upload file attachment
- `GET /api/files/download/:taskId/:filename` - Download file
- `DELETE /api/files/delete/:taskId/:filename` - Delete file


## 🏗️ Design Decisions

### Architecture Choices

**1. Monorepo Structure**

- **Decision**: Single repository with separate frontend/backend folders
- **Rationale**: Simplifies development, deployment, and maintains code coherence
- **Trade-offs**: Larger repository size vs. easier coordination

**2. State Management (Zustand)**

- **Decision**: Zustand over Redux or Context API
- **Rationale**: Lightweight, minimal boilerplate, excellent TypeScript support
- **Trade-offs**: Less ecosystem vs. simplicity and performance

**3. Database Design (MongoDB)**

- **Decision**: NoSQL document database
- **Rationale**: Flexible schema, rapid prototyping, horizontal scaling
- **Trade-offs**: Less strict data consistency vs. development speed

**4. Authentication Strategy (JWT)**

- **Decision**: Stateless JWT tokens stored in localStorage
- **Rationale**: Scalable, works with multiple frontends, no server sessions
- **Trade-offs**: Token management complexity vs. scalability


### Security Considerations

**Backend Security**

- JWT authentication with secure secret rotation
- Input validation using express-validator
- Rate limiting to prevent abuse
- CORS configuration for cross-origin requests
- File upload restrictions (PDF only, size limits)
- Password hashing with bcrypt

**Frontend Security**

- XSS protection through React's built-in sanitization
- Secure token storage strategies
- Protected routes with authentication checks
- Input sanitization and validation


### Performance Optimizations

**Backend**

- Database indexing on frequently queried fields
- Pagination for large datasets
- File streaming for uploads/downloads
- Connection pooling for MongoDB

**Frontend**

- Code splitting with React.lazy()
- Memoization for expensive computations
- Optimistic updates for better UX
- Image and asset optimization


### Scalability Decisions

**Horizontal Scaling**

- Stateless backend design
- Database connection pooling
- Docker containerization for easy deployment
- Load balancer ready architecture

**Vertical Scaling**

- Efficient database queries
- Memory usage optimization
- CPU-intensive task optimization



### Monitoring \& Logging

- Application logs via Winston
- Error tracking and alerting
- Performance monitoring
- Database query optimization
- User activity tracking


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


