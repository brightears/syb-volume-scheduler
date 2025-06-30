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

const GET_SOUND_ZONES_QUERY = gql`
  query GetSoundZones($accountId: ID!) {
    account(id: $accountId) {
      id
      businessName
      locations(first: 10) {
        edges {
          node {
            id
            name
            soundZones(first: 20) {
              edges {
                node {
                  id
                  name
                  isPaired
                  device {
                    id
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const GET_ZONE_VOLUME_QUERY = gql`
  query GetZoneVolume($soundZone: ID!) {
    soundZone(id: $soundZone) {
      id
      volume
    }
  }
`;

async function testConnection(accountId: string = 'QWNjb3VudCwsMThjdHE4b2t4czAv') {
  console.log('🔌 Testing Soundtrack API connection...');
  console.log(`📡 API URL: ${API_URL}`);
  console.log(`🔑 Token: ${API_TOKEN!.substring(0, 20)}...`);
  console.log(`🏢 Account ID: ${accountId}`);
  
  try {
    const response = await client.request<any>(GET_SOUND_ZONES_QUERY, { accountId });
    
    if (!response.account) {
      console.error('❌ Account not found. Please check the account ID.');
      return;
    }
    
    const account = response.account;
    console.log(`\n✅ Connected successfully!`);
    console.log(`🏢 Account: ${account.businessName || account.id}`);
    
    if (account.locations?.edges?.length) {
      console.log(`\n📍 Locations found: ${account.locations.edges.length}`);
      
      for (const locEdge of account.locations.edges) {
        const location = locEdge.node;
        console.log(`\n📍 Location: ${location.name}`);
        console.log(`   ID: ${location.id}`);
        
        if (location.soundZones?.edges?.length) {
          console.log(`   🔊 Sound Zones in this location:`);
          for (const edge of location.soundZones.edges) {
            const zone = edge.node;
            console.log(`\n      Zone: ${zone.name}`);
            console.log(`      ID: ${zone.id}`);
            console.log(`      Paired: ${zone.isPaired ? 'Yes' : 'No'}`);
            
            // Try to get volume for this specific zone
            try {
              const volumeResponse = await client.request<any>(GET_ZONE_VOLUME_QUERY, { soundZone: zone.id });
              if (volumeResponse.soundZone?.volume !== undefined) {
                console.log(`      Current Volume: ${volumeResponse.soundZone.volume}`);
              }
            } catch (volumeError) {
              // Volume might not be available or queryable this way
            }
            
            if (zone.device) {
              console.log(`      Device ID: ${zone.device.id}`);
            }
          }
        } else {
          console.log('   ⚠️  No sound zones found in this location');
        }
      }
      
      console.log(`\n💡 Copy one of the zone IDs above to your schedule.json file`);
    } else {
      console.log('⚠️  No locations found in this account');
    }
    
  } catch (error: any) {
    console.error('\n❌ API Connection Failed!');
    console.error('Error:', error.message);
    
    if (error.response?.errors) {
      console.error('\nAPI Errors:');
      error.response.errors.forEach((err: any) => {
        console.error(`  - ${err.message}`);
      });
    }
    
    console.log('\n🔍 Troubleshooting tips:');
    console.log('  1. Check that your API token is correct in .env');
    console.log('  2. Ensure the token has the necessary permissions');
    console.log('  3. Verify you have access to at least one account');
  }
}

// Run the test - can pass a different account ID as command line argument
const accountId = process.argv[2] || 'QWNjb3VudCwsMThjdHE4b2t4czAv';
testConnection(accountId).catch(console.error);