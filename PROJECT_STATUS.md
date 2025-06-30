# SYB Volume Scheduler - Project Status & Continuation Guide

## Project Overview
A multi-tenant SaaS platform for Soundtrack Your Brand (SYB) clients that automatically adjusts music volume levels based on time-based rules. Built as a commercial service where hotels and businesses can manage their sound zones with automated volume scheduling.

## Current Status (Last Updated: 2025-06-30)
✅ **FULLY DEPLOYED**: Complete multi-tenant SaaS platform with authentication
✅ **BACKGROUND SCHEDULER**: Running and executing volume changes
✅ **MULTI-TENANT**: Admin and client portals with role-based access

## Architecture
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Web UI        │────▶│  PostgreSQL DB   │◀────│ Scheduler       │
│  (Next.js)      │     │   (Render)       │     │ (Node.js)       │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         ✅                      ✅                      ❌
```

## Key Information

### Repository
- **GitHub**: https://github.com/brightears/syb-volume-scheduler.git
- **Structure**:
  ```
  /
  ├── src/               # Backend scheduler (NOT YET DEPLOYED)
  │   └── scheduler.ts   # Core scheduling logic
  ├── web/               # Next.js web app (DEPLOYED)
  │   ├── app/           # Next.js app router
  │   ├── components/    # React components
  │   ├── lib/           # Utilities & database
  │   └── prisma/        # Database schema
  ```

### Credentials & Environment
```bash
# SYB API (Production - Hilton Pattaya)
ANTHROPIC_API_KEY=Bearer 13:f80bb0b3-b27f-4ef3-b95d-4f6b99e1cc42:ZbvQa5u9MWnPLnOD1Z3GQZzgBi9HRFnpjxA7k6M7dRksgyiOdWYeJJh4H8krhNrwl6BRIlBOBd7MUmqUc5vlAg

# Test Account
Account: Hilton Pattaya
Account ID: QWNjb3VudCwsMXN4N242NTZyeTgv
Zone Example: U291bmRab25lLCwxdDBvZ21hNmFqNW8v (Restaurant)
```

### Database Schema (PostgreSQL on Render)
```prisma
model Schedule {
  id              String    @id @default(cuid())
  accountId       String    
  soundZoneId     String    @unique
  zoneName        String
  rules           Json      // VolumeRule[]
  timeZone        String
  baselineVolume  Int       @default(8)
  isActive        Boolean   @default(true)
}
```

## What's Working

### Core Features
1. ✅ Web UI deployed and accessible on Render
2. ✅ PostgreSQL database connected ($7/month plan)
3. ✅ Background scheduler running continuously
4. ✅ Zone selection - loads zones dynamically via GraphQL
5. ✅ Schedule editor - create time-based volume rules (0-16)
6. ✅ Persistent storage - schedules save to database
7. ✅ Zone-specific schedules (each zone has independent rules)
8. ✅ Visual timeline showing volume changes throughout the day
9. ✅ Automatic volume adjustments every minute

### Authentication & Multi-Tenancy
10. ✅ Full authentication system with sessions
11. ✅ Role-based access control (Admin vs Client)
12. ✅ Admin panel for managing multiple accounts
13. ✅ Client users restricted to their own account
14. ✅ Account switching for admins
15. ✅ User management system

### Admin Features
16. ✅ Add new client accounts by Soundtrack ID
17. ✅ Automatic account info import from SYB API
18. ✅ Create/manage users for each account
19. ✅ Password generation and management
20. ✅ View all accounts and their statistics

## Architecture Overview

### Services on Render
1. **Web Service** (`syb-volume-scheduler-web`)
   - Next.js 15 application
   - Handles UI, authentication, API
   - Connected to PostgreSQL

2. **Background Worker** (`syb-volume-scheduler-worker`)
   - Node.js scheduler service
   - Reads schedules from database
   - Executes volume changes via SYB API
   - Runs every minute

3. **PostgreSQL Database** (`syb-scheduler-db`)
   - Stores accounts, users, schedules
   - $7/month starter plan

## User Roles & Access

### Admin Users (Your Team)
- Email: admin@syb.com / Password: admin123
- Can access all client accounts
- Can create new accounts and users
- Can switch between accounts
- Full system visibility

### Client Users (Hotels/Businesses)
- Created by admins per account
- Can only see their assigned account
- Can manage schedules for their zones
- No access to other accounts
- Clean, focused interface

## How to Onboard New Clients

1. **Add Account** (Admin Panel)
   - Enter Soundtrack account ID
   - System fetches account info
   - Creates account in database

2. **Create Users** (Account → Users)
   - Enter client email
   - Generate secure password
   - System creates login credentials

3. **Share Access**
   - Login URL: https://syb-volume-scheduler.onrender.com/login
   - Email & password you created
   - Client can now manage their schedules

## Quick Development Guide

### Local Development
```bash
# Web UI
cd web
npm install
npm run dev  # Runs on http://localhost:3000

# Backend Scheduler (local testing)
cd ..
npm install
npm run dev  # Will start scheduler locally
```

### Database Commands
```bash
# In Render Shell or locally with DATABASE_URL set
cd web
npm run db:push     # Push schema changes
npm run db:studio   # Visual database editor
npm run db:migrate  # Create migrations (for production)
```

### Deployment
```bash
# Any changes push to GitHub trigger Render deployment
git add -A
git commit -m "Your change description"
git push origin main
```

### Testing the Deployed App
1. Visit your Render URL
2. Select a zone (e.g., "Restaurant")
3. Add schedule rules (e.g., 6:00 volume 5, 11:00 volume 10)
4. Save schedule
5. Refresh page - rules should persist

## Common Issues & Solutions

### Issue: "Cannot find module" errors
**Solution**: Ensure you're in the correct directory (`web/` for frontend, root for backend)

### Issue: Database connection errors
**Solution**: Check DATABASE_URL is set in Render environment variables

### Issue: Schedules not changing zones
**Solution**: Already fixed - useEffect in schedule-editor.tsx syncs with prop changes

## Business Model & Pricing Considerations

### Current Capabilities
- Multi-tenant architecture ready for SaaS
- Account isolation and security
- User management per account
- Scalable to hundreds of accounts

### Suggested Pricing Models
1. **Per Location**: $10-25/month per location
2. **Per Zone**: $5/month per zone
3. **Tiered**: Basic (5 zones), Pro (20 zones), Enterprise (unlimited)
4. **Usage-based**: Free up to X schedule changes/month

### Next Commercial Features
1. Stripe integration for payments
2. Trial periods and account expiration
3. Usage analytics and reporting
4. White-label options
5. API access for enterprise clients

## Technical Details

### Environment Variables (Set in Render)
```
# Web Service & Worker
DATABASE_URL=<from Render PostgreSQL>
SOUNDTRACK_API_TOKEN=<your SYB API token>
SOUNDTRACK_API_URL=https://api.soundtrackyourbrand.com/v2
NODE_ENV=production
```

### Key Files
- `/web/app/page.tsx` - Main dashboard
- `/web/app/admin/page.tsx` - Admin panel
- `/web/app/login/page.tsx` - Login page
- `/web/lib/auth.ts` - Authentication logic
- `/src/scheduler-db.ts` - Background scheduler
- `/web/prisma/schema.prisma` - Database schema

### Database Schema
- **Account**: Client accounts (hotels)
- **User**: Login credentials
- **Schedule**: Volume schedules per zone
- **Session**: Active user sessions

## Contact & Resources
- SYB API Endpoint: https://api.soundtrackyourbrand.com/v2
- Render Dashboard: https://dashboard.render.com
- GitHub Repo: https://github.com/brightears/syb-volume-scheduler
- Live App: https://syb-volume-scheduler.onrender.com