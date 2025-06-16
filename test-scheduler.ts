import 'dotenv/config';
import { GraphQLClient, gql } from 'graphql-request';
import { readFileSync } from 'fs';
import { toZonedTime } from 'date-fns-tz';
import { ScheduleConfig, ScheduleConfigSchema } from './src/types';

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

async function testScheduler() {
  console.log('🧪 Testing scheduler with Hilton Pattaya configuration\n');
  
  // Load Hilton schedule
  const rawConfig = JSON.parse(readFileSync('./schedule-hilton.json', 'utf-8'));
  const config = ScheduleConfigSchema.parse(rawConfig);
  
  console.log(`📅 Loaded schedule for zone: ${config.soundZoneId}`);
  console.log(`🌏 Time zone: ${config.timeZone}`);
  console.log(`📊 Rules: ${config.rules.length}`);
  
  // Get current time in the zone's timezone
  const now = new Date();
  const zonedNow = toZonedTime(now, config.timeZone);
  const timeString = zonedNow.toTimeString().slice(0, 5);
  
  console.log(`\n⏰ Current time in ${config.timeZone}: ${timeString}`);
  
  // Find which rule should be active
  let targetVolume = config.baselineVolume || 8;
  let activeRule = null;
  
  for (const rule of config.rules) {
    const [fromHour, fromMinute] = rule.from.split(':').map(Number);
    const [toHour, toMinute] = rule.to.split(':').map(Number);
    const [currentHour, currentMinute] = timeString.split(':').map(Number);
    
    const fromMinutes = fromHour * 60 + fromMinute;
    const toMinutes = toHour * 60 + toMinute;
    const currentMinutes = currentHour * 60 + currentMinute;
    
    if (fromMinutes <= toMinutes) {
      if (currentMinutes >= fromMinutes && currentMinutes < toMinutes) {
        activeRule = rule;
        targetVolume = rule.volume;
        break;
      }
    } else {
      if (currentMinutes >= fromMinutes || currentMinutes < toMinutes) {
        activeRule = rule;
        targetVolume = rule.volume;
        break;
      }
    }
  }
  
  if (activeRule) {
    console.log(`\n📌 Active rule: ${activeRule.from} - ${activeRule.to}`);
    console.log(`🎚️  Target volume: ${targetVolume}`);
  } else {
    console.log(`\n📌 No active rule, using baseline volume: ${targetVolume}`);
  }
  
  // Test setting the volume
  console.log(`\n🔊 Setting volume to ${targetVolume}...`);
  
  try {
    const response = await client.request<{ setVolume: { volume: number } }>(
      SET_VOLUME_MUTATION,
      { soundZone: config.soundZoneId, volume: targetVolume }
    );
    
    console.log(`✅ Volume successfully set to ${response.setVolume.volume}`);
    console.log('\n🎉 Scheduler test successful! The scheduler would work correctly for this zone.');
    
  } catch (error: any) {
    console.error('❌ Failed to set volume:', error.message);
  }
}

testScheduler().catch(console.error);