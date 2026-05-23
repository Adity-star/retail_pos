# Authentication System Setup Guide

## Overview
This Retail POS system uses **Supabase Auth** for authentication with **Prisma** for user data management.

## Architecture
- **Supabase Auth**: Handles user authentication (login, session management, cookies)
- **Prisma Database**: Stores user profiles, roles, tenant information, and business data
- **Next.js Middleware**: Protects routes and manages session refresh
- **Server Components**: Fetch user data with tenant context

## Setup Instructions

### 1. Environment Variables
Ensure your `.env` file has these variables:
```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### 2. Database Setup
```bash
# Run migrations
npm run db:migrate

# Seed database with test data
npm run db:seed
```

### 3. Supabase Auth Setup

**Option A: Manual Setup (Recommended for Production)**
1. Go to your Supabase Dashboard → Authentication → Users
2. Click "Add User" → "Create new user"
3. Add users with the same emails as in your Prisma database:
   - `admin@jetkids.com` (Admin User)
   - `staff@jetkids.com` (Staff User)
4. Set passwords for each user
5. Enable email confirmation or disable it in Supabase Auth settings

**Option B: Sync Script (Development Only)**
```bash
# This creates users in Supabase Auth based on Prisma data
npm run auth:sync
```
⚠️ **Note**: After syncing, you'll need to reset passwords in Supabase Dashboard since Prisma stores bcrypt hashes that Supabase can't use directly.

### 4. Test Credentials
After setup, use these credentials to login:
- **Admin**: `admin@jetkids.com` / `admin123`
- **Staff**: `staff@jetkids.com` / `staff123`

## How It Works

### Login Flow
1. User enters email/password on `/login`
2. Frontend calls `/api/auth/login` endpoint
3. API authenticates with Supabase Auth
4. If successful, finds user in Prisma database
5. Validates user is active
6. Updates last login timestamp
7. Returns user data with tenant info
8. Supabase sets session cookies automatically
9. Middleware redirects to `/dashboard`

### Session Management
- **Middleware** (`src/middleware.ts`): 
  - Automatically refreshes Supabase session on every request
  - Redirects unauthenticated users to `/login`
  - Redirects authenticated users away from `/login` to `/dashboard`
  
- **Server Components**:
  - Use `createClient()` from `@/lib/supabase/server`
  - Call `supabase.auth.getUser()` to get current user
  - Query Prisma database for user details and tenant context

### Protected Routes
The following routes require authentication:
- `/dashboard` and all sub-routes

### User Data Structure
```typescript
User {
  id: string
  email: string
  name: string
  role: 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'STAFF'
  tenantId: string
  isActive: boolean
  lastLoginAt: DateTime?
  tenant: Tenant
}
```

## API Endpoints

### POST `/api/auth/login`
Login with email and password
```json
{
  "email": "admin@jetkids.com",
  "password": "admin123"
}
```

### POST `/api/auth/logout`
Sign out and clear session

### GET `/api/auth/session`
Get current user session

## File Structure
```
src/
├── app/
│   ├── api/auth/
│   │   ├── login/route.ts      # Login endpoint
│   │   ├── logout/route.ts     # Logout endpoint
│   │   └── session/route.ts    # Session endpoint
│   ├── login/page.tsx          # Login page
│   └── dashboard/
│       ├── layout.tsx          # Protected layout
│       └── page.tsx            # Dashboard
├── lib/
│   ├── supabase/
│   │   ├── server.ts           # Server-side Supabase client
│   │   ├── client.ts           # Browser-side Supabase client
│   │   └── admin.ts            # Admin client (service role)
│   ├── auth/
│   │   ├── get-user.ts         # Get current user helper
│   │   ├── require-user.ts     # Require authentication
│   │   └── require-role.ts     # Require specific role
│   └── db.ts                   # Prisma client
└── middleware.ts               # Route protection
```

## Security Features
✅ Server-side session validation  
✅ Automatic session refresh via middleware  
✅ Password hashing with bcrypt  
✅ Tenant isolation (users only see their tenant data)  
✅ Active user validation  
✅ Role-based access control ready  
✅ Secure cookie management via Supabase SSR  

## Troubleshooting

### "User not found in database"
- Ensure user exists in Prisma database
- Run `npm run db:seed` to create test users
- Check that email in Supabase Auth matches Prisma exactly

### Login fails without error
- Check Supabase credentials in `.env`
- Verify Supabase project is active
- Check browser console for errors

### Session not persisting
- Ensure middleware is running (check `src/middleware.ts`)
- Verify cookies are being set in browser dev tools
- Check that `NEXT_PUBLIC_SUPABASE_URL` is correct

### Database connection errors
- Verify `DATABASE_URL` and `DIRECT_URL` in `.env`
- Check Supabase database is running
- Ensure IP is whitelisted if using network restrictions

## Production Checklist
- [ ] Set strong passwords for all users
- [ ] Enable email confirmation in Supabase Auth
- [ ] Set up password reset flow
- [ ] Configure session timeout in Supabase
- [ ] Add rate limiting to login endpoint
- [ ] Enable Supabase Auth logs
- [ ] Set up monitoring and alerts
- [ ] Review and test role-based access control
