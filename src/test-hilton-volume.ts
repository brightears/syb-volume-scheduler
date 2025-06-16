import 'dotenv/config';
import { GraphQLClient } from 'graphql-request';

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

const zones = {
  'drift': {
    name: 'Drift Bar',
    id: 'U291bmRab25lLCwxaDAyZ2k3bHY1cy9Mb2NhdGlvbiwsMW9wM3prbHBjZTgvQWNjb3VudCwsMXN4N242NTZyeTgv'
  },
  'edge': {
    name: 'Edge',
    id: 'U291bmRab25lLCwxOGZ5M2R2a2NuNC9Mb2NhdGlvbiwsMW9wM3prbHBjZTgvQWNjb3VudCwsMXN4N242NTZyeTgv'
  },
  'horizon': {
    name: 'Horizon',
    id: 'U291bmRab25lLCwxZTA5ZGpnMmU0Zy9Mb2NhdGlvbiwsMW9wM3prbHBjZTgvQWNjb3VudCwsMXN4N242NTZyeTgv'
  },
  'shore': {
    name: 'Shore',
    id: 'U291bmRab25lLCwxbmVidGE2c2dlOC9Mb2NhdGlvbiwsMW9wM3prbHBjZTgvQWNjb3VudCwsMXN4N242NTZyeTgv'
  }
};

async function testVolumeControl() {
  const zoneName = process.argv[2] || 'drift';
  const testVolume = parseInt(process.argv[3] || '10');
  
  const zone = zones[zoneName.toLowerCase()] || zones.drift;
  
  console.log('🏨 Testing volume control for Hilton Pattaya');
  console.log(`📍 Zone: ${zone.name}`);
  console.log(`🆔 Zone ID: ${zone.id}`);
  console.log(`🎚️  Target Volume: ${testVolume}`);
  
  if (testVolume < 0 || testVolume > 16) {
    console.error('❌ Volume must be between 0 and 16');
    process.exit(1);
  }
  
  try {
    const mutation = `
      mutation {
        setVolume(input: { soundZone: "${zone.id}", volume: ${testVolume} }) {
          volume
        }
      }
    `;
    
    const response = await client.request<{ setVolume: { volume: number } }>(mutation);
    
    console.log(`\n✅ Volume successfully set!`);
    console.log(`🎚️  New volume: ${response.setVolume.volume}`);
    
  } catch (error: any) {
    console.error('\n❌ Failed to set volume!');
    console.error('Error:', error.message);
    
    if (error.response?.errors) {
      console.error('\nAPI Errors:');
      error.response.errors.forEach((err: any) => {
        console.error(`  - ${err.message}`);
      });
    }
  }
}

// Run the test
console.log('\nUsage: npm run test-hilton [zone] [volume]');
console.log('Zones: drift, edge, horizon, shore');
console.log('Example: npm run test-hilton drift 10\n');

testVolumeControl().catch(console.error);