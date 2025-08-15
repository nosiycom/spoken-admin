# Spoken

A comprehensive admin portal for managing AI-powered French learning mobile app content, built with Next.js, Clerk authentication, MongoDB, Redis caching, and PostHog analytics.

## 🚀 Features

- **Authentication**: Clerk-powered authentication with email/password, Google, and Facebook login
- **Email Verification**: Built-in email verification and password reset functionality
- **Admin Dashboard**: Comprehensive dashboard with analytics and content management
- **Content Management**: Create and manage learning content (lessons, quizzes, vocabulary, etc.)
- **Analytics**: PostHog integration for user tracking and behavior analysis
- **Caching**: Redis caching via Supabase for improved performance
- **Logging**: Morgan logging with CloudWatch integration
- **AWS Deployment**: Production-ready ECS deployment with CodeDeploy CI/CD

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Authentication**: Clerk
- **Database**: MongoDB with Mongoose
- **Caching**: Redis (Supabase)
- **Analytics**: PostHog
- **Deployment**: AWS ECS + Fargate
- **CI/CD**: GitHub Actions + AWS CodeDeploy
- **Monitoring**: CloudWatch, Morgan logging

## 🏃‍♂️ Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd spoken
npm install
```

### 2. Environment Setup

Copy the environment example file:

```bash
cp .env.example .env.local
```

Fill in your environment variables in `.env.local`

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🐳 Docker Development

Build and run with Docker:

```bash
npm run docker:build
npm run docker:run
```

## 🚀 AWS Deployment

### Prerequisites
- AWS CLI configured
- Docker installed
- Appropriate IAM permissions

### 1. Create AWS Infrastructure

Deploy the ECS cluster and supporting infrastructure using the CloudFormation templates in `aws-ecs/` and `aws-codedeploy/` directories.

### 2. Deploy

Push to the `main` branch to trigger automatic deployment via GitHub Actions.

## 📊 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run typecheck` - Run TypeScript type checking
- `npm run docker:build` - Build Docker image
- `npm run docker:run` - Run Docker container

## 📁 Project Structure

```
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── api/            # API routes
│   │   ├── dashboard/      # Dashboard pages
│   │   ├── sign-in/        # Authentication pages
│   │   └── sign-up/
│   ├── components/         # React components
│   │   ├── dashboard/      # Dashboard-specific components
│   │   └── providers/      # Context providers
│   ├── lib/               # Utility functions
│   └── models/            # Database models
├── aws-ecs/               # AWS ECS configuration
├── aws-codedeploy/        # CodeDeploy configuration
├── .github/workflows/     # GitHub Actions
└── public/                # Static assets
```

## 🔧 API Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/stats` - Dashboard statistics
- `GET /api/content` - Content management
- `POST /api/content` - Create content
- `GET /api/analytics` - Analytics data
- `POST /api/analytics` - Track events
- `GET /api/cache` - Cache operations

## 🔒 Security Features

- Clerk authentication with multi-provider support
- HTTPS enforcement in production
- Environment variable encryption
- AWS IAM role-based permissions
- Input validation and sanitization

## 📈 Monitoring & Analytics

- PostHog for user behavior tracking
- CloudWatch for application logs and metrics
- Health check endpoints for service monitoring
- Deployment status notifications