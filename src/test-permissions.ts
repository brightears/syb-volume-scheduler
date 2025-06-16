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

const CHECK_ME_QUERY = gql`
  query CheckMe {
    me {
      __typename
      ... on PublicAPIClient {
        id
      }
    }
  }
`;

const CHECK_ZONE_ACCESS = gql`
  query CheckZone($id: ID!) {
    soundZone(id: $id) {
      id
      name
      isPaired
    }
  }
`;

async function checkPermissions() {
  const soundZoneId = 'U291bmRab25lLCwxYzN3NGR0cXkyby9Mb2NhdGlvbiwsMWwzNHpkc3RibHMvQWNjb3VudCwsMThjdHE4b2t4czAv';
  
  console.log('🔐 Checking API permissions and access...\n');
  
  try {
    // Check current user/client info
    console.log('1️⃣ Checking API client info...');
    const meResponse = await client.request<any>(CHECK_ME_QUERY);
    console.log('Client type:', meResponse.me.__typename);
    if (meResponse.me.id) {
      console.log('Client ID:', meResponse.me.id);
    }
    console.log('');
    
    // Check if we can access the specific sound zone
    console.log('2️⃣ Checking sound zone access...');
    console.log(`Zone ID: ${soundZoneId}`);
    try {
      const zoneResponse = await client.request<any>(CHECK_ZONE_ACCESS, { id: soundZoneId });
      console.log('✅ Can access sound zone:');
      console.log('  Name:', zoneResponse.soundZone.name);
      console.log('  Is Paired:', zoneResponse.soundZone.isPaired);
    } catch (zoneError: any) {
      console.error('❌ Cannot access sound zone directly');
      if (zoneError.response?.errors) {
        zoneError.response.errors.forEach((err: any) => {
          console.error(`  - ${err.message}`);
        });
      }
    }
    
    // Try to understand the issue
    console.log('\n3️⃣ Possible issues:');
    console.log('- The API token might not have volume control permissions');
    console.log('- The sound zone might need to be in a specific state');
    console.log('- The zone ID format might need adjustment');
    console.log('- Volume control might require a different API endpoint or method');
    
  } catch (error: any) {
    console.error('❌ Error checking permissions:', error.message);
    if (error.response?.errors) {
      error.response.errors.forEach((err: any) => {
        console.error(`  - ${err.message}`);
      });
    }
  }
}

// Run the check
checkPermissions().catch(console.error);