import 'dotenv/config';
import { GraphQLClient, gql } from 'graphql-request';
import * as schedule from 'node-schedule';
import { readFileSync } from 'fs';
import { join } from 'path';
import { toZonedTime } from 'date-fns-tz';
import { ScheduleConfig, ScheduleConfigSchema, VolumeRule } from './types';

const API_URL = process.env.SYB_API_URL || 'https://api.soundtrackyourbrand.com/v2';
const API_TOKEN = process.env.SYB_TOKEN;

if (!API_TOKEN) {
  console.error('ERROR: SYB_TOKEN not found in environment variables');
  process.exit(1);
}

const client = new GraphQLClient(API_URL, {
  headers: {
    Authorization: `Basic ${API_TOKEN}`,
  },
});

const SET_VOLUME_MUTATION = gql`
  mutation SetVolume($soundZone: ID!, $volume: Volume!) {
    setVolume(input: { soundZone: $soundZone, volume: $volume }) {
      volume
    }
  }
`;

// Note: The volume field might not be directly queryable
// We'll handle this gracefully and rely on tracking after setVolume calls
const GET_CURRENT_VOLUME_QUERY = gql`
  query GetCurrentVolume($soundZone: ID!) {
    soundZone(id: $soundZone) {
      id
      name
    }
  }
`;

let config: ScheduleConfig;
let currentVolume: number | null = null;

async function loadConfig(): Promise<ScheduleConfig> {
  try {
    const configPath = join(process.cwd(), 'schedule.json');
    const rawConfig = JSON.parse(readFileSync(configPath, 'utf-8'));
    const validatedConfig = ScheduleConfigSchema.parse(rawConfig);
    console.log(`✅ Loaded schedule config for zone: ${validatedConfig.soundZoneId}`);
    console.log(`📅 Time zone: ${validatedConfig.timeZone}`);
    console.log(`📊 Rules: ${validatedConfig.rules.length}`);
    return validatedConfig;
  } catch (error) {
    console.error('❌ Failed to load schedule.json:', error);
    throw error;
  }
}

async function getCurrentVolume(soundZoneId: string): Promise<number | null> {
  // Since volume might not be directly queryable, we'll return null
  // and rely on tracking volume after setVolume calls
  console.log('ℹ️  Note: Current volume query not available, will track after first volume change');
  return null;
}

async function setVolume(soundZoneId: string, volume: number): Promise<boolean> {
  try {
    console.log(`🔊 Setting volume to ${volume} for zone ${soundZoneId}`);
    
    const response = await client.request<{ setVolume: { volume: number } }>(
      SET_VOLUME_MUTATION,
      { soundZone: soundZoneId, volume }
    );
    
    currentVolume = response.setVolume.volume;
    console.log(`✅ Volume successfully set to ${response.setVolume.volume}`);
    return true;
  } catch (error: any) {
    console.error('❌ Failed to set volume:', error.message);
    
    if (error.response?.errors) {
      error.response.errors.forEach((err: any) => {
        console.error(`  - ${err.message}`);
      });
    }
    
    return false;
  }
}

function getActiveRule(rules: VolumeRule[], now: Date): VolumeRule | null {
  const timeString = now.toTimeString().slice(0, 5); // HH:MM format
  
  for (const rule of rules) {
    const [fromHour, fromMinute] = rule.from.split(':').map(Number);
    const [toHour, toMinute] = rule.to.split(':').map(Number);
    const [currentHour, currentMinute] = timeString.split(':').map(Number);
    
    const fromMinutes = fromHour * 60 + fromMinute;
    const toMinutes = toHour * 60 + toMinute;
    const currentMinutes = currentHour * 60 + currentMinute;
    
    // Handle rules that span midnight
    if (fromMinutes <= toMinutes) {
      // Normal rule (e.g., 12:00 - 14:00)
      if (currentMinutes >= fromMinutes && currentMinutes < toMinutes) {
        return rule;
      }
    } else {
      // Rule spans midnight (e.g., 22:00 - 02:00)
      if (currentMinutes >= fromMinutes || currentMinutes < toMinutes) {
        return rule;
      }
    }
  }
  
  return null;
}

async function checkAndUpdateVolume() {
  const now = new Date();
  const zonedNow = toZonedTime(now, config.timeZone);
  
  const activeRule = getActiveRule(config.rules, zonedNow);
  const targetVolume = activeRule ? activeRule.volume : (config.baselineVolume ?? 8);
  
  if (currentVolume === null) {
    currentVolume = await getCurrentVolume(config.soundZoneId);
  }
  
  if (currentVolume !== targetVolume) {
    const timeString = zonedNow.toTimeString().slice(0, 5);
    console.log(`\n⏰ ${timeString} - Volume change needed`);
    console.log(`  Current: ${currentVolume}, Target: ${targetVolume}`);
    
    if (activeRule) {
      console.log(`  Rule: ${activeRule.from} - ${activeRule.to}`);
    } else {
      console.log(`  No active rule, using baseline volume`);
    }
    
    await setVolume(config.soundZoneId, targetVolume);
  }
}

async function main() {
  console.log('🚀 Starting Soundtrack Volume Scheduler');
  console.log('📅 Current time:', new Date().toISOString());
  
  try {
    config = await loadConfig();
    
    // Get initial volume
    currentVolume = await getCurrentVolume(config.soundZoneId);
    if (currentVolume !== null) {
      console.log(`📊 Current volume: ${currentVolume}`);
    }
    
    // Check immediately on startup
    await checkAndUpdateVolume();
    
    // Schedule checks every minute
    const job = schedule.scheduleJob('* * * * *', async () => {
      await checkAndUpdateVolume();
    });
    
    console.log('✅ Scheduler is running. Checking volume every minute...');
    console.log('Press Ctrl+C to stop');
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n👋 Shutting down scheduler...');
      job.cancel();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

// Start the scheduler
main().catch(console.error);