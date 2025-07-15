# IDURAR ERP/CRM System

A comprehensive open-source ERP/CRM system built with modern technologies including Express.js, React, Next.js, and Nest.js, all containerized with Docker for easy deployment.

## Project Overview

This multi-module ERP/CRM system consists of the following components:

### 1. **Original Express/MongoDB Application**

This is the core ERP/CRM system with both backend API and frontend UI:

#### Backend API (`/backend`)

- **Technology**: Node.js v20.9.0, Express.js, MongoDB with Mongoose
- **Features**:
  - RESTful API for all ERP/CRM operations
  - JWT authentication
  - AI integration (Gemini/OpenAI)
  - PDF generation for invoices/quotes
  - Email notifications via Resend
  - Multi-language support
- **Port**: 8888
- **Key Endpoints**: `/api/client`, `/api/invoice`, `/api/payment`, `/api/quote`

#### Frontend UI (`/frontend`)

- **Technology**: React 18, Redux Toolkit, Ant Design, Vite
- **Features**:
  - Complete ERP/CRM interface
  - Dashboard with analytics
  - Customer, Invoice, Quote, and Payment management
  - Company and finance settings
  - Multi-language localization
- **Port**: 3002
- **Build**: Static files served via Nginx in production

### 2. **Nest.js Integration API**

- **Location**: `/nest_module`
- **Technology**: NestJS v11, TypeScript, MongoDB
- **Features**:
  - Extended API services
  - Integration endpoints
  - Database schema management
- **Port**: 3001

### 3. **Next.js CRUD Application**

- **Location**: `/next_module`
- **Technology**: Next.js 15.4.1, React 19, TypeScript, Tailwind CSS
- **Features**:
  - Project management CRUD operations
  - Server-side rendering
  - Modern UI with Tailwind CSS
- **Port**: 3000

## Prerequisites

- **Node.js**: v20.9.0 or higher
- **Docker**: v20.10+ and Docker Compose v2.0+
- **MongoDB**:
  - Local installation (v5.0+) OR
  - MongoDB Atlas account (for cloud deployment)
- **Git**: For cloning the repository

## Environment Variables

### Backend Service (`/backend/.env`)

```env
# MongoDB Connection
DATABASE=mongodb://localhost:27017/idurar_erp_crm
# For Docker Compose use: mongodb://admin:admin123@mongodb:27017/idurar_erp_crm?authSource=admin

# API Keys
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here  # Optional
RESEND_API=your_resend_api_key_here      # Optional for email service

# Authentication
JWT_SECRET=your_private_jwt_secret_key

# Server Configuration
NODE_ENV=production
PORT=8888
PUBLIC_SERVER_FILE=http://localhost:8888/
```

### Frontend Service (`/frontend/.env`)

```env
# API URLs
VITE_BACKEND_SERVER=http://localhost:8888/
VITE_FILE_BASE_URL=http://localhost:8888/
PROD=false
```

### Next.js Module (`/next_module/.env.local`)

```env
MONGODB_URI=mongodb://mongodb:27017/idurar-erp-crm
```

### Nest.js Module (`/nest_module/.env`)

```env
DATABASE_URL=mongodb://mongodb:27017/idurar-erp-crm
PORT=3000
```

## Service Setup

### Option 1: Run All Services with Docker Compose (Recommended)

1. **Clone the repository:**

   ```bash
   git clone https://github.com/idurar/idurar-erp-crm.git
   cd idurar-erp-crm
   ```

2. **Create environment files:**
   Copy the environment variable examples above and create `.env` files in their respective directories.

3. **Set Docker Compose environment variables (optional):**
   Create a `.env` file in the root directory for Docker Compose:

   ```env
   MONGO_USERNAME=admin
   MONGO_PASSWORD=admin123
   JWT_SECRET=your_private_jwt_secret_key
   GEMINI_API_KEY=your_gemini_api_key_here
   NODE_ENV=production
   ```

4. **Build and run all services:**

   ```bash
   docker-compose up --build
   ```

   This will start:

   - MongoDB on port 27017 (with authentication)
   - Backend API on http://localhost:8888
   - Frontend UI on http://localhost:3002
   - Next.js app on http://localhost:3000
   - Nest.js API on http://localhost:3001

### Option 2: Run Individual Services

#### Backend Express API

```bash
cd backend
docker build -t idurar-backend .
docker run -p 8888:8888 --env-file .env idurar-backend
```

#### Frontend React Application

```bash
cd frontend
docker build -t idurar-frontend .
docker run -p 3002:80 idurar-frontend
```

#### Next.js CRUD Application

```bash
cd next_module
docker build -t idurar-nextjs .
docker run -p 3000:3000 --env-file .env.local idurar-nextjs
```

#### Nest.js Integration API

```bash
cd nest_module
docker build -t idurar-nestjs .
docker run -p 3001:3000 --env-file .env idurar-nestjs
```

### Option 3: Development Mode

For local development without Docker:

#### Backend

```bash
cd backend
npm install
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

#### Next.js

```bash
cd next_module
npm install
npm run dev
```

#### Nest.js

```bash
cd nest_module
npm install
npm run start:dev
```

## Deployment Instructions

### Docker Deployment

1. **Build production images:**

   ```bash
   docker-compose build --no-cache
   ```

2. **Tag images for registry:**

   ```bash
   docker tag idurar-erp-crm_backend:latest your-registry.com/idurar-backend:latest
   docker tag idurar-erp-crm_frontend:latest your-registry.com/idurar-frontend:latest
   docker tag idurar-erp-crm_nextjs:latest your-registry.com/idurar-nextjs:latest
   docker tag idurar-erp-crm_nestjs:latest your-registry.com/idurar-nestjs:latest
   ```

3. **Push to container registry:**
   ```bash
   docker push your-registry.com/idurar-backend:latest
   docker push your-registry.com/idurar-frontend:latest
   docker push your-registry.com/idurar-nextjs:latest
   docker push your-registry.com/idurar-nestjs:latest
   ```

### Cloud Provider Specific Instructions

#### AWS ECS

1. Create ECR repositories for each service
2. Push Docker images to ECR
3. Create ECS task definitions
4. Configure ECS services with ALB

#### Google Cloud Run

1. Push images to Google Container Registry
2. Deploy each service:
   ```bash
   gcloud run deploy idurar-backend --image gcr.io/your-project/idurar-backend
   ```

#### Azure Container Instances

1. Push images to Azure Container Registry
2. Create container groups for each service

## Initial Setup

After deployment, run the initial setup:

```bash
# If using Docker Compose
docker-compose exec backend npm run setup
```

This will create the initial admin user and necessary database collections.

## Health Checks

The system includes health check endpoints:

- Backend: `http://localhost:8888/api/health`
- Next.js: `http://localhost:3000/api/health`
- Nest.js: `http://localhost:3001/health`

## Troubleshooting

1. **MongoDB Connection Issues**: Ensure MongoDB is running and accessible at the configured URL
2. **Port Conflicts**: Change ports in docker-compose.yml if defaults are in use
3. **Environment Variables**: Verify all required environment variables are set
4. **Docker Build Failures**: Ensure Docker daemon is running and you have sufficient disk space

## Support

- Documentation: [https://github.com/idurar/idurar-erp-crm](https://github.com/idurar/idurar-erp-crm)
- Issues: [https://github.com/idurar/idurar-erp-crm/issues](https://github.com/idurar/idurar-erp-crm/issues)
- Email: hello@idurarapp.com

## License

This project is licensed under the GNU Affero General Public License v3.0 - see the LICENSE file for details.
