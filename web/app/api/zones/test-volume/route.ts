import { NextRequest, NextResponse } from 'next/server'
import { setVolume } from '@/lib/soundtrack-api'

export async function POST(request: NextRequest) {
  try {
    const { zoneId, volume } = await request.json()
    
    if (!zoneId || volume === undefined) {
      return NextResponse.json(
        { error: 'Missing zoneId or volume' },
        { status: 400 }
      )
    }
    
    if (volume < 0 || volume > 16) {
      return NextResponse.json(
        { error: 'Volume must be between 0 and 16' },
        { status: 400 }
      )
    }
    
    const result = await setVolume(zoneId, volume)
    
    return NextResponse.json({ 
      success: true, 
      volume: result.volume 
    })
  } catch (error) {
    console.error('Test volume error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to set volume' },
      { status: 500 }
    )
  }
}