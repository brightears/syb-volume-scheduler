import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json(
      { error: 'No authorization token provided' },
      { status: 401 }
    )
  }

  const user = await auth.getUserFromToken(token)

  if (!user) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    )
  }

  // Get accessible accounts
  const accounts = await auth.getAccessibleAccounts(user)

  return NextResponse.json({
    user,
    accounts
  })
}