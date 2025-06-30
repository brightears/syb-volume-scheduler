import { GraphQLClient, gql } from 'graphql-request';

const SOUNDTRACK_API_URL = process.env.SOUNDTRACK_API_URL || 'https://api.soundtrackyourbrand.com/v2';
const SOUNDTRACK_API_TOKEN = process.env.SOUNDTRACK_API_TOKEN || '';

export const soundtrackClient = new GraphQLClient(SOUNDTRACK_API_URL, {
  headers: {
    Authorization: `Basic ${SOUNDTRACK_API_TOKEN}`,
  },
});

// Queries
export const GET_ZONES_QUERY = gql`
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

export const SET_VOLUME_MUTATION = gql`
  mutation SetVolume($soundZone: ID!, $volume: Volume!) {
    setVolume(input: { soundZone: $soundZone, volume: $volume }) {
      volume
    }
  }
`;

// API helper functions

// Get account information
export async function getAccountInfo(accountId: string) {
  try {
    const query = gql`
      query GetAccountInfo($accountId: ID!) {
        account(id: $accountId) {
          id
          businessName
        }
      }
    `
    
    const response = await soundtrackClient.request<any>(query, { accountId })
    return response.account ? {
      id: accountId,
      name: response.account.businessName,
      businessName: response.account.businessName
    } : null
  } catch (error) {
    console.error('Failed to fetch account info:', error)
    return null
  }
}

export async function getZonesForAccount(accountId: string) {
  try {
    const data = await soundtrackClient.request<{
      account: {
        locations: {
          edges: Array<{
            node: {
              name: string;
              soundZones: {
                edges: Array<{
                  node: {
                    id: string;
                    name: string;
                    isPaired: boolean;
                    device?: { id: string };
                  };
                }>;
              };
            };
          }>;
        };
      };
    }>(GET_ZONES_QUERY, { accountId });
    const zones = [];
    
    if (data.account?.locations?.edges) {
      for (const locEdge of data.account.locations.edges) {
        const location = locEdge.node;
        if (location.soundZones?.edges) {
          for (const zoneEdge of location.soundZones.edges) {
            const zone = zoneEdge.node;
            zones.push({
              id: zone.id,
              name: `${location.name} - ${zone.name}`,
              isPaired: zone.isPaired,
              deviceId: zone.device?.id
            });
          }
        }
      }
    }
    
    return zones;
  } catch (error) {
    console.error('Failed to fetch zones:', error);
    throw error;
  }
}

export async function setVolume(zoneId: string, volume: number) {
  try {
    const data = await soundtrackClient.request<{
      setVolume: { volume: number };
    }>(SET_VOLUME_MUTATION, {
      soundZone: zoneId,
      volume,
    });
    return data.setVolume;
  } catch (error) {
    console.error('Failed to set volume:', error);
    throw error;
  }
}