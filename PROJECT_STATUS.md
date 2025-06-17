# SYB Volume Scheduler - Project Status & Continuation Guide

## Project Overview
A web-based volume scheduler for Soundtrack Your Brand (SYB) that automatically adjusts music volume levels based on time-based rules. Built for hotels to manage their sound zones with different volume levels throughout the day.

## Current Status (Last Updated: 2025-06-16)
✅ **DEPLOYED & WORKING**: Web interface is live on Render with PostgreSQL database
⏳ **PENDING**: Background scheduler service to execute volume changes

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
1. ✅ Web UI deployed and accessible on Render
2. ✅ PostgreSQL database connected ($7/month plan)
3. ✅ Zone selection - loads Hilton Pattaya zones via GraphQL
4. ✅ Schedule editor - create time-based volume rules (0-16)
5. ✅ Persistent storage - schedules save to database
6. ✅ Zone-specific schedules (each zone has independent rules)
7. ✅ Mock authentication (hardcoded to Hilton Pattaya)
8. ✅ Visual timeline showing volume changes throughout the day

## Recent Bug Fixes
- **Fixed**: Schedule rules weren't updating when switching zones
- **Solution**: Added `useEffect` in `schedule-editor.tsx` to sync state with props
- **Fixed**: TypeScript/Prisma JSON type conversion errors
- **Solution**: Used `JSON.parse(JSON.stringify())` for type safety

## TODO List (Priority Order)

### 1. Deploy Background Scheduler Service (HIGH PRIORITY)
The actual volume changing logic exists but isn't running. Need to:
- Create new Render background worker service
- Deploy `/src/scheduler.ts` 
- Set up to run continuously
- Connect to same PostgreSQL database
- Will read schedules and execute volume changes via GraphQL

### 2. Implement Real Authentication (HIGH)
Currently using mock auth. Need to:
- Add proper login system
- Link users to specific hotel accounts
- Implement session management
- Add user management to database schema

### 3. Create Admin Dashboard (MEDIUM)
For managing multiple hotels:
- View all accounts and their schedules
- Create new hotel accounts
- Assign zones to accounts
- Monitor scheduler status

### 4. Additional Features (LOW)
- Email notifications for schedule changes
- Schedule templates (breakfast, lunch, dinner presets)
- Volume change history/logs
- API for external integrations

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

## Next Session Starting Point
**IMMEDIATE TASK**: Deploy the background scheduler service
1. Create new Render background worker
2. Point to `/src/scheduler.ts`
3. Set same environment variables as web service
4. Verify it's reading schedules and changing volumes

This will complete the MVP - hotels can set schedules via web UI, and the scheduler will automatically adjust volumes!

## Contact & Resources
- SYB API Docs: [Internal documentation provided]
- Render Dashboard: [Check user's Render account]
- GraphQL Endpoint: https://api.soundtrackyourbrand.com/v2