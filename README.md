# Authentication App

A full-stack authentication application built with Next.js, TypeScript, PostgreSQL, and deployed on Vercel.

## 🚀 Features

- User registration and login
- JWT-based authentication with HTTP-only cookies
- Protected routes and dashboard
- PostgreSQL database with connection pooling
- Responsive design with Tailwind CSS
- TypeScript for type safety

## 🛠️ Tech Stack

- **Frontend**: React 19, Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL with pg (node-postgres)
- **Authentication**: bcryptjs, jsonwebtoken
- **Deployment**: Vercel

## 📦 Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd auth-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your values:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/your_db_name
   JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
   NODE_ENV=development
   ```

4. **Set up the database**
   ```bash
   npm run db:setup
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Deployment to Vercel

### Prerequisites
- Vercel account
- PostgreSQL database (Vercel Postgres, Supabase, or other provider)

### Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables in Vercel dashboard

3. **Environment Variables (Required)**
   Set these in your Vercel project settings:
   ```
   DATABASE_URL=your-production-database-url
   JWT_SECRET=your-production-jwt-secret
   NODE_ENV=production
   ```

4. **Database Setup**
   The database tables will be automatically created during the build process.

## 🗄️ Database Schema

The application uses two main tables:

- `app_users`: User accounts with email and hashed passwords
- `app_sessions`: JWT token sessions with expiration

## 🔐 Security Features

- Password hashing with bcrypt
- JWT tokens stored in HTTP-only cookies
- Session validation on protected routes
- CSRF protection via Next.js Server Actions

## 📝 API Routes

- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/signout` - User logout

## 🧪 Testing

Run the authentication flow test:
```bash
npm run test:auth
```

## 📄 License

MIT License
