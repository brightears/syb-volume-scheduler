import { NextRequest, NextResponse } from 'next/server';
import { getZonesForAccount } from '@/lib/soundtrack-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    
    if (!accountId) {
      return NextResponse.json(
        { error: 'Missing accountId parameter' },
        { status: 400 }
      );
    }
    
    const zones = await getZonesForAccount(accountId);
    return NextResponse.json({ zones });
  } catch (error) {
    console.error('Failed to fetch zones:', error);
    return NextResponse.json(
      { error: 'Failed to fetch zones' },
      { status: 500 }
    );
  }
}