# Soundtrack Volume Scheduler - Setup Guide

## Overview
This guide covers the technical setup for the SYB Volume Scheduler platform. For user management and client onboarding, see [USER_MANAGEMENT_GUIDE.md](USER_MANAGEMENT_GUIDE.md).

## Production Access

### Admin Login
- **URL**: https://syb-volume-scheduler.onrender.com/login
- **Email**: admin@syb.com
- **Password**: admin123

### Features Available
- Add new client accounts
- Create users for each account
- Manage volume schedules
- Monitor all accounts

## Local Development Setup

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Soundtrack Your Brand API token

### 1. Clone and Install

```bash
# Clone repository
git clone https://github.com/brightears/syb-volume-scheduler.git
cd syb-volume-scheduler

# Install root dependencies (scheduler)
npm install

# Install web dependencies
cd web
npm install
```

### 2. Environment Configuration

#### Root Directory (.env)
```env
# For background scheduler
DATABASE_URL=postgresql://user:pass@host/dbname
SOUNDTRACK_API_TOKEN=your_api_token_here
SOUNDTRACK_API_URL=https://api.soundtrackyourbrand.com/v2
```

#### Web Directory (web/.env.local)
```env
# For web application
DATABASE_URL=postgresql://user:pass@host/dbname
SOUNDTRACK_API_TOKEN=your_api_token_here
SOUNDTRACK_API_URL=https://api.soundtrackyourbrand.com/v2
```

### 3. Database Setup

```bash
cd web

# Push schema to database
npm run db:push

# Seed initial admin user
node scripts/seed-users.js
```

### 4. Run Locally

```bash
# Terminal 1: Web application
cd web
npm run dev
# Opens at http://localhost:3000

# Terminal 2: Background scheduler
cd .. # root directory
npm run dev:db
# Runs scheduler checking every minute
```

## Adding New Client Accounts

### Via Admin Panel (Recommended)
1. Login as admin
2. Go to Admin Panel
3. Click "Add Account"
4. Enter Soundtrack account ID
5. System imports account details automatically

### Via Database (Advanced)
If you need to add accounts directly:

```sql
-- Add new account
INSERT INTO "Account" (id, name, "isActive", "subscriptionPlan")
VALUES ('soundtrack_account_id', 'Hotel Name', true, 'basic');

-- Create user for account
-- Use the seed script or admin panel instead
```

## Schedule Configuration

### Basic Structure
```json
{
  "soundZoneId": "YOUR_ZONE_ID",
  "rules": [
    {
      "from": "HH:MM",
      "to": "HH:MM",
      "volume": 0-16
    }
  ],
  "timeZone": "Asia/Bangkok",
  "baselineVolume": 8
}
```

### Example Schedule (Hilton Pattaya)
See `schedule-hilton.json` for a complete example with:
- Morning quiet hours (6-10am): Volume 8
- Lunch peak (12-2pm): Volume 12
- Evening dinner (6-10pm): Volume 11
- Night quiet (12-6am): Volume 6

## Volume Levels

- **0**: Muted
- **1-5**: Very quiet (background music)
- **6-8**: Quiet to moderate
- **9-11**: Normal listening level
- **12-14**: Louder (busy periods)
- **15-16**: Maximum volume

## Production Deployment (Render)

### Services Required

1. **Web Service**
   - Build: `cd web && npm install && npm run build`
   - Start: `cd web && npm start`
   - Auto-deploy from GitHub

2. **Background Worker**
   - Build: `npm install && npm run build`
   - Start: `npm run start:db`
   - Shares database with web service

3. **PostgreSQL Database**
   - Starter plan ($7/month)
   - Auto-backups included

### Environment Variables (Both Services)
```
DATABASE_URL=<from Render PostgreSQL>
SOUNDTRACK_API_TOKEN=<your token>
SOUNDTRACK_API_URL=https://api.soundtrackyourbrand.com/v2
NODE_ENV=production
```

## Troubleshooting

1. **"Not found" error on setVolume**:
   - Account doesn't have volume control permissions
   - Try with a production account

2. **Cannot find zone**:
   - Run `npm run test-api [ACCOUNT_ID]` to list zones
   - Verify the zone ID is correct

3. **Time zone issues**:
   - Ensure `timeZone` in schedule.json matches your location
   - Use standard timezone names (e.g., "Asia/Bangkok", "Europe/London")

## API Rate Limits

- Initial tokens: 3,600
- Refill rate: 50 tokens/second
- Volume change: ~20 tokens
- Maximum changes per minute: ~150 (more than enough)

## Security Best Practices

### API Tokens
- Store in environment variables only
- Never commit to git
- Rotate every 90 days
- Use separate tokens for dev/prod

### User Management
- Generate strong passwords
- Don't reuse passwords across accounts
- Regularly audit user access
- Remove inactive users

### Database
- Use SSL connections in production
- Regular backups (automatic on Render)
- Limit access to production database

## Monitoring

### Check Service Health
- Web app: Visit the URL
- Scheduler: Check Render logs
- Database: Render dashboard metrics

### Common Issues
1. **Scheduler not running**: Check worker logs
2. **Login failures**: Verify database connection
3. **Volume not changing**: Check API token permissions
4. **Zones not loading**: Verify account ID is correct