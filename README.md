# Rental Prima Super Admin Dashboard

A full-stack admin dashboard for the Rental Prima platform with modern UI and comprehensive management features.

## Deployment

### Deploying to Vercel

#### Frontend Deployment
1. Push your code to a GitHub repository
2. Log in to Vercel (https://vercel.com)
3. Click "New Project" and import your GitHub repository
4. Select the `frontend` directory as the root directory
5. Add the following environment variables:
   - `REACT_APP_API_URL`: URL of your deployed backend (e.g., https://rental-prima-backend.vercel.app)
   - `REACT_APP_SUPABASE_URL`: Your Supabase URL
   - `REACT_APP_SUPABASE_ANON_KEY`: Your Supabase anonymous key
6. Click "Deploy"

#### Backend Deployment
1. In the same GitHub repository, create a new project in Vercel
2. Select the `backend` directory as the root directory
3. Add the following environment variables:
   - `NODE_ENV`: Set to `production`
   - `SUPABASE_URL`: Your Supabase URL
   - `SUPABASE_ANON_KEY`: Your Supabase anonymous key
4. Click "Deploy"

## Project Structure

The project is divided into two main parts:
- `frontend`: React.js application with TailwindCSS
- `backend`: Node.js with Express RESTful API

## Features

- Modern, vibrant UI with neumorphic/glassmorphism elements
- JWT-based authentication
- Role-based access control (RBAC)
- Comprehensive dashboard with system stats
- User and admin management
- Categories and listings management
- Billing and payment plans
- System settings and notifications
- Help and support

## Getting Started

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

## API Documentation

The API is organized around REST with predictable resource-oriented URLs, accepts JSON-encoded request bodies, returns JSON-encoded responses, and uses standard HTTP response codes.

Base URL: `/api`

### Available Endpoints

- `/api/auth`: Authentication endpoints
- `/api/users`: User management
- `/api/admins`: Admin management
- `/api/categories`: Categories management
- `/api/listings`: Listings management
- `/api/payments`: Payment history
- `/api/plans`: Pricing plans
- `/api/settings`: System settings
- `/api/notifications`: Notification management
- `/api/support`: Help and support

## License

[MIT](LICENSE)
