import 'dotenv/config';
import { GraphQLClient, gql } from 'graphql-request';

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

async function testVolumeControl() {
  const soundZoneId = 'U291bmRab25lLCwxYzN3NGR0cXkyby9Mb2NhdGlvbiwsMWwzNHpkc3RibHMvQWNjb3VudCwsMThjdHE4b2t4czAv';
  const testVolume = parseInt(process.argv[2] || '8');
  
  console.log('🔊 Testing volume control...');
  console.log(`📍 Sound Zone ID: ${soundZoneId}`);
  console.log(`🎚️  Target Volume: ${testVolume}`);
  
  if (testVolume < 0 || testVolume > 16) {
    console.error('❌ Volume must be between 0 and 16');
    process.exit(1);
  }
  
  try {
    const response = await client.request<{ setVolume: { volume: number } }>(
      SET_VOLUME_MUTATION,
      { soundZone: soundZoneId, volume: testVolume }
    );
    
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
testVolumeControl().catch(console.error);