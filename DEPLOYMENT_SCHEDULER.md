# Deploying the Background Scheduler on Render

## Overview
This guide will help you deploy the background scheduler service that reads from PostgreSQL and executes volume changes on your Soundtrack zones.

## Prerequisites
- Existing Render account with the web service already deployed
- PostgreSQL database already running (syb-scheduler-db)
- GitHub repository connected to Render

## Step 1: Update Your Repository

1. **Commit the new files**:
   ```bash
   git add -A
   git commit -m "Add background scheduler service with PostgreSQL support"
   git push origin main
   ```

## Step 2: Create the Background Worker on Render

1. Go to your Render dashboard
2. Click "New +" → "Background Worker"
3. Connect to your GitHub repository
4. Configure the service:
   - **Name**: `syb-volume-scheduler-worker`
   - **Root Directory**: Leave blank (uses repository root)
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:db`

## Step 3: Configure Environment Variables

Add these environment variables to the background worker:

1. **DATABASE_URL**
   - Click "Add Environment Variable"
   - Choose "From Database"
   - Select `syb-scheduler-db`
   - Property: `Connection String`

2. **SOUNDTRACK_API_TOKEN**
   - Click "Add Environment Variable"
   - Key: `SOUNDTRACK_API_TOKEN`
   - Value: Your Soundtrack API token (the same one used in the web service)

3. **SOUNDTRACK_API_URL**
   - Key: `SOUNDTRACK_API_URL`
   - Value: `https://api.soundtrackyourbrand.com/v2`

4. **NODE_ENV**
   - Key: `NODE_ENV`
   - Value: `production`

## Step 4: Deploy

1. Click "Create Background Worker"
2. Render will automatically build and deploy your service
3. Monitor the logs to ensure it starts successfully

## Step 5: Verify Operation

Check the logs for messages like:
```
🚀 Starting Soundtrack Volume Scheduler (Database Mode)
✅ Connected to PostgreSQL database
✅ Scheduler is running. Checking volume every minute...
```

## Testing Locally

Before deploying, you can test the scheduler locally:

1. **Set up environment variables**:
   ```bash
   # Create .env file in root directory
   DATABASE_URL=your_database_url_from_render
   SOUNDTRACK_API_TOKEN=your_api_token
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Generate Prisma client**:
   ```bash
   npm run db:generate
   ```

4. **Run the scheduler**:
   ```bash
   npm run dev:db
   ```

## Troubleshooting

### "Cannot find module '@prisma/client'"
- Ensure `npm run build` includes `prisma generate`
- Check that prisma schema exists in the root directory

### "DATABASE_URL not found"
- Verify the environment variable is set in Render
- Check that it's properly linked to your database

### "No active schedules found"
- Use the web interface to create schedules first
- Verify schedules are saved to the database

### Connection timeouts
- Check if your database allows connections from Render
- Verify the DATABASE_URL is correct

## Architecture Notes

The scheduler:
1. Runs continuously, checking every minute
2. Reads all active schedules from PostgreSQL
3. Calculates the target volume based on time rules
4. Makes API calls to Soundtrack to adjust volumes
5. Tracks current volumes to avoid unnecessary API calls

## Next Steps

After deployment:
1. Create schedules using the web interface
2. Monitor the worker logs to see volume changes
3. Test different time rules to ensure proper operation
4. Consider setting up alerts for errors