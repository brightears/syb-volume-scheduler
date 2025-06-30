# SYB Volume Scheduler - Multi-Tenant SaaS Platform

A commercial SaaS platform for automatically adjusting Soundtrack Your Brand volume levels based on time schedules. Built for hotels, restaurants, and retail businesses to optimize their music experience throughout the day.

## 🚀 Features

### For Businesses (Clients)
- 🎵 Automatic volume control based on schedules
- 🕐 Time-based rules with timezone support
- 🏢 Multi-zone management for all locations
- 📊 Visual schedule editor with timeline view
- 🔄 Real-time volume adjustments every minute
- 💾 Persistent schedule storage
- 🔐 Secure login portal

### For Service Providers (Admins)
- 👥 Multi-tenant architecture
- 🏨 Manage unlimited client accounts
- 🔑 User management per account
- 📈 Account statistics and monitoring
- 🔄 Account switching for support
- 🆕 Easy client onboarding

## 🏗️ Architecture

### Components
- **Web Application**: Next.js 15 with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Background Scheduler**: Node.js service running every minute
- **Authentication**: Session-based with role management
- **API Integration**: Soundtrack Your Brand GraphQL API

### Deployment
- **Platform**: Render.com
- **Services**: Web app + Background worker + PostgreSQL
- **Cost**: ~$14/month (Web + Worker + Database)
- **Live URL**: https://syb-volume-scheduler.onrender.com

## 💼 Business Model

This platform is designed as a commercial SaaS offering:

### Suggested Pricing
- **Basic**: $15/month - Up to 5 zones
- **Professional**: $35/month - Up to 20 zones
- **Enterprise**: $75/month - Unlimited zones + API access

### Target Customers
- Hotels with multiple venues
- Restaurant chains
- Retail stores
- Fitness centers
- Any business using Soundtrack Your Brand

## 🔧 Technical Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, GraphQL, Prisma ORM
- **Database**: PostgreSQL
- **Scheduler**: node-schedule with cron jobs
- **Authentication**: bcrypt + session tokens
- **API**: Soundtrack Your Brand GraphQL API v2
- **Deployment**: Render.com with auto-deploy from GitHub

## 📚 Documentation

- [Project Status](PROJECT_STATUS.md) - Current state and features
- [User Management Guide](USER_MANAGEMENT_GUIDE.md) - How to manage accounts and users
- [Setup Guide](SETUP_GUIDE.md) - Technical setup instructions
- [Architecture Proposal](ARCHITECTURE_PROPOSAL.md) - System design
- [Deployment Scheduler](DEPLOYMENT_SCHEDULER.md) - Background worker setup
- [Troubleshooting](TROUBLESHOOTING.md) - Common issues

## 🚦 Current Status

✅ **Production Ready** - Fully deployed and operational
- Multi-tenant authentication working
- Background scheduler running
- Admin and client portals active
- Database persistent storage
- Automatic volume adjustments

## 🔐 Security

- Bcrypt password hashing
- Session-based authentication
- Role-based access control
- Account isolation
- No cross-tenant data access
- API tokens stored securely

## 👤 Default Admin Access

- **URL**: https://syb-volume-scheduler.onrender.com/login
- **Email**: admin@syb.com
- **Password**: admin123

## 🛠️ Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   # Root directory (scheduler)
   npm install
   
   # Web directory
   cd web
   npm install
   ```

3. Set up environment variables:
   ```bash
   # .env in root
   DATABASE_URL=your_postgres_url
   SOUNDTRACK_API_TOKEN=your_api_token
   
   # web/.env.local
   DATABASE_URL=your_postgres_url
   SOUNDTRACK_API_TOKEN=your_api_token
   ```

4. Run locally:
   ```bash
   # Web app
   cd web
   npm run dev
   
   # Scheduler (separate terminal)
   npm run dev:db
   ```

## 📞 Support

For commercial inquiries about using this platform:
- Custom deployment options
- White-label solutions
- Enterprise features
- API access

---

**Note**: This is a commercial SaaS platform. The code is provided for reference and deployment by authorized partners.