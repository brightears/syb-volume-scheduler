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

async function testVolumeControl() {
  const soundZoneId = 'U291bmRab25lLCwxYzN3NGR0cXkyby9Mb2NhdGlvbiwsMWwzNHpkc3RibHMvQWNjb3VudCwsMThjdHE4b2t4czAv';
  const testVolume = parseInt(process.argv[2] || '8');
  
  console.log('🔊 Testing volume control with direct mutation...');
  console.log(`📍 Sound Zone ID: ${soundZoneId}`);
  console.log(`🎚️  Target Volume: ${testVolume}`);
  
  if (testVolume < 0 || testVolume > 16) {
    console.error('❌ Volume must be between 0 and 16');
    process.exit(1);
  }
  
  try {
    // Try with direct mutation string (no variables)
    const mutation = `
      mutation {
        setVolume(input: { soundZone: "${soundZoneId}", volume: ${testVolume} }) {
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
    
    // Also try with raw fetch to see the exact response
    console.log('\n🔍 Trying raw API call for debugging...');
    try {
      const rawResponse = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `mutation { setVolume(input: { soundZone: "${soundZoneId}", volume: ${testVolume} }) { volume } }`
        }),
      });
      
      const rawData = await rawResponse.json();
      console.log('Raw response:', JSON.stringify(rawData, null, 2));
    } catch (rawError) {
      console.error('Raw API call error:', rawError);
    }
  }
}

// Run the test
testVolumeControl().catch(console.error);