import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@/lib/storage'
import { Schedule } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const zoneId = searchParams.get('zoneId')
    
    if (zoneId) {
      console.log('API: Fetching schedule for zone:', zoneId)
      const schedule = await storage.getSchedule(zoneId)
      console.log('API: Found schedule:', schedule)
      return NextResponse.json({ schedule })
    }
    
    const schedules = await storage.getAllSchedules()
    return NextResponse.json({ schedules })
  } catch (error) {
    console.error('Failed to fetch schedules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const schedule: Schedule = {
      soundZoneId: body.soundZoneId,
      rules: body.rules || [],
      timeZone: body.timeZone || 'Asia/Bangkok',
      baselineVolume: body.baselineVolume || 8
    }
    
    const saved = await storage.saveSchedule(schedule)
    return NextResponse.json({ success: true, schedule: saved })
  } catch (error) {
    console.error('Failed to save schedule:', error)
    return NextResponse.json(
      { error: 'Failed to save schedule' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const zoneId = searchParams.get('zoneId')
    
    if (!zoneId) {
      return NextResponse.json(
        { error: 'Missing zoneId parameter' },
        { status: 400 }
      )
    }
    
    const deleted = await storage.deleteSchedule(zoneId)
    return NextResponse.json({ success: deleted })
  } catch (error) {
    console.error('Failed to delete schedule:', error)
    return NextResponse.json(
      { error: 'Failed to delete schedule' },
      { status: 500 }
    )
  }
}