# Volume Scheduler Web Platform - Architecture Proposal

## Overview
A multi-tenant web application for managing volume schedules across Soundtrack Your Brand accounts.

## User Types

### 1. **Client Users** (Hotel Staff)
- Access only their own account's zones
- Can create/edit schedules for their zones
- Simple, focused interface
- No technical knowledge required

### 2. **Admin Users** (Your Team)
- Access to all client accounts
- Can manage schedules on behalf of clients
- Account switching capability
- Bulk operations support

## Proposed Architecture

### Frontend (React/Next.js)
```
├── /auth
│   └── Login page (email/password or SSO)
├── /dashboard
│   ├── Zone selector
│   ├── Current schedule view
│   └── Quick volume test
├── /schedule
│   ├── Visual schedule editor
│   ├── Time rule builder
│   └── Preview/test mode
├── /admin (admin only)
│   ├── Account switcher
│   ├── Client management
│   └── Global schedule templates
```

### Backend Options

#### Option 1: Serverless (Recommended)
- **Next.js API Routes** or **AWS Lambda**
- **Database**: PostgreSQL/Supabase or DynamoDB
- **Auth**: Auth0 or Supabase Auth
- **Hosting**: Vercel/Netlify or AWS

**Pros**: Scalable, low maintenance, cost-effective
**Cons**: Cold starts, complexity with cron jobs

#### Option 2: Traditional Server
- **Node.js/Express** backend
- **Database**: PostgreSQL
- **Auth**: JWT with refresh tokens
- **Hosting**: Railway, Render, or AWS EC2

**Pros**: More control, easier cron implementation
**Cons**: Higher maintenance, scaling considerations

## Key Features

### 1. Authentication & Authorization
```typescript
// User roles
enum UserRole {
  ADMIN = 'admin',        // Your team
  ACCOUNT_ADMIN = 'account_admin',  // Hotel manager
  ACCOUNT_USER = 'account_user'     // Hotel staff
}

// User-Account relationship
interface UserAccount {
  userId: string;
  accountId: string;  // Soundtrack account ID
  role: UserRole;
  zones?: string[];   // Optional: limit to specific zones
}
```

### 2. Schedule Management
- Visual timeline editor (drag & drop)
- Template library (breakfast, lunch, dinner presets)
- Bulk copy schedules between zones
- Schedule validation and conflict detection

### 3. Real-time Preview
- "Test mode" to preview changes without applying
- Live volume indicator
- Timezone-aware preview

### 4. Audit & Monitoring
- Change history log
- Who changed what and when
- Volume change notifications
- Schedule effectiveness reports

## Database Schema

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  role VARCHAR(50),
  created_at TIMESTAMP
);

-- Account access
CREATE TABLE user_accounts (
  user_id UUID REFERENCES users(id),
  soundtrack_account_id VARCHAR(255),
  account_name VARCHAR(255),
  permissions JSONB,
  PRIMARY KEY (user_id, soundtrack_account_id)
);

-- Schedules
CREATE TABLE schedules (
  id UUID PRIMARY KEY,
  account_id VARCHAR(255),
  zone_id VARCHAR(255),
  zone_name VARCHAR(255),
  rules JSONB,
  timezone VARCHAR(50),
  baseline_volume INTEGER,
  is_active BOOLEAN,
  created_by UUID REFERENCES users(id),
  updated_at TIMESTAMP
);

-- Audit log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action VARCHAR(50),
  resource_type VARCHAR(50),
  resource_id VARCHAR(255),
  details JSONB,
  timestamp TIMESTAMP
);
```

## Implementation Approach

### Phase 1: MVP (2-3 weeks)
1. Basic auth with email/password
2. Single account view for clients
3. Simple schedule editor
4. Manual zone selection
5. Deploy scheduler as background service

### Phase 2: Enhanced (2-3 weeks)
1. Admin multi-account access
2. Visual timeline editor
3. Schedule templates
4. Change history
5. Email notifications

### Phase 3: Premium (3-4 weeks)
1. SSO integration
2. Advanced analytics
3. AI-suggested schedules
4. Mobile app
5. API for third-party integration

## Security Considerations

1. **API Token Management**
   - Store encrypted in database
   - Never expose to frontend
   - Refresh mechanism

2. **Row-Level Security**
   - Users can only see their assigned accounts
   - Validate zone ownership on every request

3. **Rate Limiting**
   - Prevent abuse of volume changes
   - Implement request throttling

## Tech Stack Recommendation

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **React Query** (data fetching)
- **Zustand** (state management)

### Backend
- **Next.js API Routes** (serverless)
- **Supabase** (Auth + Database + Realtime)
- **Zod** (validation)
- **tRPC** (type-safe API)

### Infrastructure
- **Vercel** (hosting)
- **Supabase** (backend services)
- **Resend** (email notifications)
- **Sentry** (error tracking)

### Scheduler Service
- **Railway** or **Render** (always-on Node.js service)
- Or **Vercel Cron** (if using Pro plan)

## Cost Estimate

### Development Costs
- MVP: 2-3 weeks
- Full Platform: 6-8 weeks

### Running Costs (Monthly)
- Hosting (Vercel): $20-100
- Database (Supabase): $25-100
- Scheduler (Railway): $5-20
- Total: ~$50-220/month

### Pricing Model Options
1. **Per Account**: $10-25/month per account
2. **Per Zone**: $5/month per zone
3. **Tiered**: Basic (5 zones), Pro (20 zones), Enterprise (unlimited)
4. **Usage-based**: Free up to X schedule changes/month

## Questions to Consider

1. **Authentication Method**?
   - Email/password
   - SSO with Soundtrack
   - Magic links
   - OAuth (Google/Microsoft)

2. **Deployment Preference**?
   - Fully serverless
   - Traditional server
   - Hybrid approach

3. **Feature Priority**?
   - What's most important for MVP?
   - Nice-to-haves vs must-haves

4. **Integration Plans**?
   - Direct Soundtrack dashboard integration?
   - Standalone app?
   - White-label option?

5. **Scale Expectations**?
   - How many accounts initially?
   - Growth projections?