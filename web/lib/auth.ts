import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { addDays } from 'date-fns'

export interface AuthUser {
  id: string
  email: string
  name: string | null
  role: 'admin' | 'client'
  accountId: string | null
}

export const auth = {
  // Create a new user
  async createUser(data: {
    email: string
    password: string
    name?: string
    role?: 'admin' | 'client'
    accountId?: string
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 10)
    
    return prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        password: hashedPassword,
        name: data.name,
        role: data.role || 'client',
        accountId: data.accountId
      }
    })
  },

  // Authenticate user
  async login(email: string, password: string): Promise<{ user: AuthUser; token: string } | null> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { account: true }
    })

    if (!user || !user.isActive) {
      return null
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return null
    }

    // Create session
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = addDays(new Date(), 7) // 7 day expiry

    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt
      }
    })

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as 'admin' | 'client',
        accountId: user.accountId
      },
      token
    }
  },

  // Get user from session token
  async getUserFromToken(token: string): Promise<AuthUser | null> {
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: { include: { account: true } } }
    })

    if (!session || session.expiresAt < new Date()) {
      return null
    }

    const user = session.user
    if (!user.isActive) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'admin' | 'client',
      accountId: user.accountId
    }
  },

  // Logout
  async logout(token: string) {
    await prisma.session.delete({
      where: { token }
    }).catch(() => {}) // Ignore if session doesn't exist
  },

  // Get accessible accounts for a user
  async getAccessibleAccounts(user: AuthUser) {
    if (user.role === 'admin') {
      // Admins can access all accounts
      return prisma.account.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
      })
    } else {
      // Clients can only access their assigned account
      if (!user.accountId) return []
      
      return prisma.account.findMany({
        where: { 
          id: user.accountId,
          isActive: true 
        }
      })
    }
  },

  // Check if user can access a specific account
  async canAccessAccount(user: AuthUser, accountId: string): Promise<boolean> {
    if (user.role === 'admin') {
      return true
    }
    
    return user.accountId === accountId
  }
}