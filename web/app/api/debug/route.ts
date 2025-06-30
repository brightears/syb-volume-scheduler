import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Check if we can connect to database
    const userCount = await prisma.user.count()
    const accountCount = await prisma.account.count()
    const sessionCount = await prisma.session.count()
    
    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      counts: {
        users: userCount,
        accounts: accountCount,
        sessions: sessionCount
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      database: 'failed'
    }, { status: 500 })
  }
}