# Soundtrack Volume Scheduler

A TypeScript-based scheduler for automatically adjusting volume levels in Soundtrack Your Brand zones based on time-based rules.

## Important Note

The volume control functionality requires appropriate API permissions. If you encounter "Not found" errors when trying to set volume, please ensure your API token has the necessary permissions for volume control on the target sound zones.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure your API credentials in `.env`:
```
SYB_TOKEN=your_api_token_here
SYB_CLIENT_ID=your_client_id
SYB_CLIENT_SECRET=your_client_secret
```

3. Test your API connection and get zone IDs:
```bash
npm run test-api
```

4. Update `schedule.json` with your zone ID and desired schedule:
```json
{
  "soundZoneId": "your_zone_id_here",
  "rules": [
    {
      "from": "12:00",
      "to": "14:00",
      "volume": 11
    },
    {
      "from": "22:00",
      "to": "23:00",
      "volume": 6
    }
  ],
  "timeZone": "Asia/Bangkok",
  "baselineVolume": 8
}
```

## Usage

Start the scheduler:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Features

- ✅ Automatic volume adjustments based on time windows
- ✅ Timezone-aware scheduling
- ✅ GraphQL API integration with Soundtrack
- ✅ Error handling and retry logic
- ✅ Real-time logging of volume changes
- ✅ Configurable baseline volume

## Volume Range

Volume values must be integers between 0 and 16 (inclusive).

## Schedule Rules

- Rules are checked every minute
- If multiple rules overlap, the first matching rule is applied
- Outside of any rules, the baseline volume is used
- Rules can span midnight (e.g., "22:00" to "02:00")