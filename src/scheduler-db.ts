import 'dotenv/config';
import { GraphQLClient, gql } from 'graphql-request';
import * as schedule from 'node-schedule';
import { utcToZonedTime } from 'date-fns-tz';
import { PrismaClient } from '@prisma/client';
import { VolumeRule } from './types';

const API_URL = process.env.SOUNDTRACK_API_URL || 'https://api.soundtrackyourbrand.com/v2';
const API_TOKEN = process.env.SOUNDTRACK_API_TOKEN || process.env.SYB_TOKEN;

if (!API_TOKEN) {
  console.error('ERROR: SOUNDTRACK_API_TOKEN not found in environment variables');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not found in environment variables');
  process.exit(1);
}

const prisma = new PrismaClient();
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

// Removed unused interface

// Track current volumes per zone
const currentVolumes = new Map<string, number>();

async function setVolume(soundZoneId: string, zoneName: string, volume: number): Promise<boolean> {
  try {
    console.log(`🔊 Setting volume to ${volume} for "${zoneName}" (${soundZoneId})`);
    
    const response = await client.request<{ setVolume: { volume: number } }>(
      SET_VOLUME_MUTATION,
      { soundZone: soundZoneId, volume }
    );
    
    currentVolumes.set(soundZoneId, response.setVolume.volume);
    console.log(`✅ Volume successfully set to ${response.setVolume.volume} for "${zoneName}"`);
    return true;
  } catch (error: any) {
    console.error(`❌ Failed to set volume for "${zoneName}":`, error.message);
    
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

async function checkAndUpdateVolumes() {
  try {
    // Get all active schedules from database
    const schedules = await prisma.schedule.findMany({
      where: { isActive: true }
    });

    if (schedules.length === 0) {
      console.log('📭 No active schedules found');
      return;
    }

    console.log(`\n⏰ Checking ${schedules.length} active schedules...`);

    for (const schedule of schedules) {
      const now = new Date();
      const zonedNow = utcToZonedTime(now, schedule.timeZone);
      
      // Parse rules from JSON
      const rules = schedule.rules as VolumeRule[];
      const activeRule = getActiveRule(rules, zonedNow);
      const targetVolume = activeRule ? activeRule.volume : schedule.baselineVolume;
      
      const currentVolume = currentVolumes.get(schedule.soundZoneId);
      
      if (currentVolume === undefined || currentVolume !== targetVolume) {
        const timeString = zonedNow.toTimeString().slice(0, 5);
        console.log(`\n📍 Zone: "${schedule.zoneName}"`);
        console.log(`  Time: ${timeString} (${schedule.timeZone})`);
        console.log(`  Current: ${currentVolume ?? 'unknown'}, Target: ${targetVolume}`);
        
        if (activeRule) {
          console.log(`  Rule: ${activeRule.from} - ${activeRule.to}`);
        } else {
          console.log(`  No active rule, using baseline volume`);
        }
        
        await setVolume(schedule.soundZoneId, schedule.zoneName, targetVolume);
      }
    }
  } catch (error) {
    console.error('❌ Error checking schedules:', error);
  }
}

async function main() {
  console.log('🚀 Starting Soundtrack Volume Scheduler (Database Mode)');
  console.log('📅 Current time:', new Date().toISOString());
  console.log('🗄️  Database URL:', process.env.DATABASE_URL?.split('@')[1]); // Hide credentials
  
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL database');
    
    // Check immediately on startup
    await checkAndUpdateVolumes();
    
    // Schedule checks every minute
    const job = schedule.scheduleJob('* * * * *', async () => {
      await checkAndUpdateVolumes();
    });
    
    console.log('✅ Scheduler is running. Checking volume every minute...');
    console.log('Press Ctrl+C to stop');
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n👋 Shutting down scheduler...');
      job.cancel();
      await prisma.$disconnect();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Start the scheduler
main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});