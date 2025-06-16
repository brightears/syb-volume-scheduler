# Soundtrack Volume Scheduler - Setup Guide

## Quick Start

1. **Test your API access**:
   ```bash
   # Test with default account
   npm run test-api
   
   # Test with specific account ID
   npm run test-api [ACCOUNT_ID]
   ```

2. **Test volume control** (for verified accounts):
   ```bash
   # Test Hilton zones
   npm run test-hilton drift 10
   npm run test-hilton edge 12
   npm run test-hilton horizon 11
   npm run test-hilton shore 9
   ```

3. **Configure your schedule**:
   - Copy `schedule-hilton.json` as a template
   - Update the `soundZoneId` with your zone ID
   - Modify the time rules as needed
   - Save as `schedule.json`

4. **Run the scheduler**:
   ```bash
   npm start
   ```

## Available Accounts

### ✅ Hilton Pattaya (Working)
- **Account ID**: QWNjb3VudCwsMXN4N242NTZyeTgv
- **Status**: Volume control working
- **Zones**:
  - Drift Bar: `U291bmRab25lLCwxaDAyZ2k3bHY1cy9Mb2NhdGlvbiwsMW9wM3prbHBjZTgvQWNjb3VudCwsMXN4N242NTZyeTgv`
  - Edge: `U291bmRab25lLCwxOGZ5M2R2a2NuNC9Mb2NhdGlvbiwsMW9wM3prbHBjZTgvQWNjb3VudCwsMXN4N242NTZyeTgv`
  - Horizon: `U291bmRab25lLCwxZTA5ZGpnMmU0Zy9Mb2NhdGlvbiwsMW9wM3prbHBjZTgvQWNjb3VudCwsMXN4N242NTZyeTgv`
  - Shore: `U291bmRab25lLCwxbmVidGE2c2dlOC9Mb2NhdGlvbiwsMW9wM3prbHBjZTgvQWNjb3VudCwsMXN4N242NTZyeTgv`

### ❌ BMAsia Unlimited DEMO (Not Working)
- **Account ID**: QWNjb3VudCwsMThjdHE4b2t4czAv
- **Status**: Read-only access (no volume control)
- **Issue**: Demo accounts don't support volume control

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

## Deployment Options

### Local Development
```bash
npm run dev  # Auto-restart on changes
```

### Production with PM2
```bash
npm install -g pm2
pm2 start npm --name "volume-scheduler" -- start
pm2 save
pm2 startup
```

### Docker (Optional)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
CMD ["npm", "start"]
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

## Security Notes

- Keep your `.env` file private
- Never commit API tokens to git
- Rotate tokens every 90 days
- Use environment variables in production