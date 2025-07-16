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
   git clone https://github.com/shubhamambastha/idurar-erp-crm.git
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

## API Documentation & Example Requests

### Authentication

All Backend Express API endpoints (except login/register) require authentication token in headers:

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

### 1. Backend Express API Examples

#### Login

```bash
# Login to get JWT token
curl -X POST http://localhost:8888/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

#### Client Management

```bash
# Create a new client
curl -X POST http://localhost:8888/api/client/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company": "Acme Corp",
    "name": "John Doe",
    "email": "john@acme.com",
    "phone": "+1234567890",
    "address": "123 Main St",
    "country": "USA"
  }'

# Get client by ID
curl -X GET http://localhost:8888/api/client/read/CLIENT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# List all clients with pagination
curl -X GET "http://localhost:8888/api/client/list?page=1&items=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Search clients
curl -X GET "http://localhost:8888/api/client/search?q=acme" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Invoice Management

```bash
# Create invoice
curl -X POST http://localhost:8888/api/invoice/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "client": "CLIENT_ID",
    "number": "INV-001",
    "date": "2024-01-15",
    "expiredDate": "2024-02-15",
    "items": [
      {
        "itemName": "Web Development",
        "description": "Frontend development services",
        "quantity": 1,
        "price": 5000,
        "amount": 5000
      }
    ],
    "taxRate": 10,
    "discount": 0,
    "total": 5500,
    "currency": "USD",
    "status": "draft"
  }'

# Send invoice by email
curl -X POST http://localhost:8888/api/invoice/mail \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "INVOICE_ID",
    "recipient": "client@example.com"
  }'

# Generate invoice summary
curl -X POST http://localhost:8888/api/invoice/generate-summary \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  }'
```

#### Quote Management

```bash
# Create quote
curl -X POST http://localhost:8888/api/quote/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "client": "CLIENT_ID",
    "number": "QTE-001",
    "date": "2024-01-15",
    "expiredDate": "2024-01-30",
    "items": [
      {
        "itemName": "Consulting Services",
        "description": "Business analysis and consulting",
        "quantity": 10,
        "price": 150,
        "amount": 1500
      }
    ],
    "taxRate": 10,
    "discount": 100,
    "total": 1550,
    "currency": "USD",
    "status": "draft"
  }'

# Convert quote to invoice
curl -X GET http://localhost:8888/api/quote/convert/QUOTE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Payment Management

```bash
# Record payment
curl -X POST http://localhost:8888/api/payment/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "invoice": "INVOICE_ID",
    "client": "CLIENT_ID",
    "amount": 1000,
    "date": "2024-01-20",
    "paymentMode": "PAYMENT_MODE_ID",
    "notes": "Partial payment received"
  }'
```

#### Settings Management

```bash
# Update settings by key
curl -X PATCH http://localhost:8888/api/setting/updateBySettingKey/general_settings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "My Company Ltd",
    "company_email": "info@mycompany.com",
    "company_phone": "+1234567890"
  }'

# Upload company logo
curl -X PATCH http://localhost:8888/api/setting/upload/company_logo \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/logo.png"
```

### 2. Nest.js Integration API Examples

#### Reports and Analytics

```bash
# Get comprehensive summary
curl -X GET http://localhost:3001/integration/reports/summary

# Get customer analytics
curl -X GET http://localhost:3001/integration/customers/analytics

# Get invoice metrics
curl -X GET http://localhost:3001/integration/invoices/metrics
```

#### Raw Data Access

```bash
# Get all customers
curl -X GET http://localhost:3001/integration/data/customers

# Get all invoices
curl -X GET http://localhost:3001/integration/data/invoices

# Get all payments
curl -X GET http://localhost:3001/integration/data/payments
```

#### Data Processing

```bash
# Transform data (export example)
curl -X POST http://localhost:3001/integration/data/transform \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "export",
    "format": "csv",
    "entities": ["customers", "invoices"]
  }'

# Webhook endpoint
curl -X POST http://localhost:3001/integration/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "invoice.created",
    "data": {
      "invoice_id": "INV-001",
      "amount": 5500
    }
  }'
```

### 3. Next.js API Examples

#### Project Management

```bash
# Create a new project
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Website Redesign",
    "description": "Complete redesign of company website",
    "status": "active",
    "dueDate": "2024-06-30"
  }'

# Get all projects with pagination
curl -X GET "http://localhost:3000/api/projects?page=1&limit=10"

# Get single project
curl -X GET http://localhost:3000/api/projects/PROJECT_ID

# Update project
curl -X PUT http://localhost:3000/api/projects/PROJECT_ID \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Project Name",
    "status": "completed"
  }'

# Delete project
curl -X DELETE http://localhost:3000/api/projects/PROJECT_ID
```

### Postman Collection

For easier testing, import these endpoints into Postman:

1. Create a new collection named "IDURAR ERP-CRM"
2. Add environment variables:

   - `BASE_URL_BACKEND`: `http://localhost:8888`
   - `BASE_URL_NESTJS`: `http://localhost:3001`
   - `BASE_URL_NEXTJS`: `http://localhost:3000`
   - `JWT_TOKEN`: (set after login)

3. Organize requests into folders:
   - Authentication
   - Clients
   - Invoices
   - Quotes
   - Payments
   - Settings
   - Integration API
   - Projects API

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

- Documentation: [https://github.com/shubhamambastha/idurar-erp-crm](https://github.com/shubhamambastha/idurar-erp-crm)
- Issues: [https://github.com/shubhamambastha/idurar-erp-crm/issues](https://github.com/shubhamambastha/idurar-erp-crm/issues)
- Email: hello@idurarapp.com

## License

This project is licensed under the GNU Affero General Public License v3.0 - see the LICENSE file for details.
