# Deployment Guide for Render

## Prerequisites

1. GitHub account with the code repository
2. Render account (free tier works for testing)
3. Soundtrack API credentials

## Step 1: Push Code to GitHub

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit - SYB Volume Scheduler"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/syb-volume-scheduler.git
git push -u origin main
```

## Step 2: Deploy Web Interface on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `syb-volume-scheduler`
   - **Root Directory**: `web`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add environment variables:
   - `SOUNDTRACK_API_TOKEN` = Your API token
   - `SOUNDTRACK_API_URL` = https://api.soundtrackyourbrand.com/v2
   - `MOCK_USERS` = hilton@example.com:QWNjb3VudCwsMXN4N242NTZyeTgv:Hilton Pattaya:user

6. Click "Create Web Service"

## Step 3: Deploy Scheduler Service (Background Worker)

For the actual volume scheduling to work, you need the scheduler running:

### Option A: Deploy as a separate service on Render
1. Create another Web Service
2. Root Directory: `/` (main folder)
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Add same environment variables

### Option B: Use a cron job service
- Use services like Cron-job.org or EasyCron
- Point to your Render URL: `https://your-app.onrender.com/api/scheduler/run`

## Step 4: Test Your Deployment

1. Visit your Render URL: `https://syb-volume-scheduler.onrender.com`
2. You should see the Volume Scheduler interface
3. Select a zone and create a schedule
4. Test volume changes

## Environment Variables Reference

```env
# Required
SOUNDTRACK_API_TOKEN=YVhId2UyTWJVWEhMRWly...
SOUNDTRACK_API_URL=https://api.soundtrackyourbrand.com/v2

# User mapping (for MVP)
MOCK_USERS=email:accountId:accountName:role

# Optional (for future database)
DATABASE_URL=postgresql://...
```

## Monitoring

- Check Render logs for any errors
- Monitor the scheduler service to ensure it's running
- Set up alerts for failures (Render supports this)

## Troubleshooting

### "Not found" errors on volume control
- Ensure the account has volume control permissions
- Test with a production account (not demo)

### Zones not loading
- Check API token is correct in environment variables
- Verify account ID in MOCK_USERS is valid

### Schedule not applying
- Ensure scheduler service is running
- Check timezone settings in schedule
- Verify volume values are 0-16

## Security Notes

- Never commit `.env` files
- Use Render's environment variables for secrets
- Rotate API tokens regularly
- Enable HTTPS (Render does this automatically)

## Next Steps

After successful deployment:
1. Add proper authentication
2. Set up a database for persistent storage
3. Implement user management
4. Add monitoring and alerts