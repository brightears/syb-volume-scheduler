import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getAccountInfo } from '@/lib/soundtrack-api'

// GET all accounts (admin only)
export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await auth.getUserFromToken(token)

  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const accounts = await prisma.account.findMany({
      include: {
        _count: {
          select: {
            users: true,
            schedules: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ accounts })
  } catch (error) {
    console.error('Failed to fetch accounts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    )
  }
}

// POST - Add new account (admin only)
export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await auth.getUserFromToken(token)

  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const { accountId } = await request.json()

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      )
    }

    // Check if account already exists
    const existing = await prisma.account.findUnique({
      where: { id: accountId }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Account already exists' },
        { status: 400 }
      )
    }

    // Fetch account info from Soundtrack API
    console.log('Fetching account info for:', accountId)
    const accountInfo = await getAccountInfo(accountId)

    if (!accountInfo) {
      return NextResponse.json(
        { error: 'Invalid account ID or unable to fetch account information' },
        { status: 400 }
      )
    }

    // Create account in database
    const account = await prisma.account.create({
      data: {
        id: accountId,
        name: accountInfo.name || accountInfo.businessName || `Account ${accountId}`,
        isActive: true,
        subscriptionPlan: 'basic'
      }
    })

    return NextResponse.json({ 
      account,
      message: 'Account added successfully'
    })
  } catch (error) {
    console.error('Failed to add account:', error)
    return NextResponse.json(
      { error: 'Failed to add account' },
      { status: 500 }
    )
  }
}