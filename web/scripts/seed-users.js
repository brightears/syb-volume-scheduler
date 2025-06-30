// Run this script to create initial admin and demo users
// Usage: cd web && node scripts/seed-users.js

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function seedUsers() {
  console.log('🌱 Seeding users...')

  try {
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10)
    const admin = await prisma.user.upsert({
      where: { email: 'admin@syb.com' },
      update: {},
      create: {
        email: 'admin@syb.com',
        password: adminPassword,
        name: 'SYB Admin',
        role: 'admin',
        isActive: true
      }
    })
    console.log('✅ Admin user created:', admin.email)

    // Create/update Hilton account
    const hiltonAccount = await prisma.account.upsert({
      where: { id: 'QWNjb3VudCwsMXN4N242NTZyeTgv' },
      update: {
        name: 'Hilton Pattaya',
        isActive: true
      },
      create: {
        id: 'QWNjb3VudCwsMXN4N242NTZyeTgv',
        name: 'Hilton Pattaya',
        isActive: true,
        subscriptionPlan: 'pro'
      }
    })
    console.log('✅ Hilton account created/updated')

    // Create Hilton user
    const hiltonPassword = await bcrypt.hash('hilton123', 10)
    const hiltonUser = await prisma.user.upsert({
      where: { email: 'hilton@example.com' },
      update: {},
      create: {
        email: 'hilton@example.com',
        password: hiltonPassword,
        name: 'Hilton Manager',
        role: 'client',
        accountId: hiltonAccount.id,
        isActive: true
      }
    })
    console.log('✅ Hilton client user created:', hiltonUser.email)

    // Create a few more demo accounts for admin to manage
    const demoAccounts = [
      { id: 'demo-marriott-001', name: 'Marriott Bangkok' },
      { id: 'demo-novotel-001', name: 'Novotel Sukhumvit' },
      { id: 'demo-intercontinental-001', name: 'InterContinental Bangkok' }
    ]

    for (const account of demoAccounts) {
      await prisma.account.upsert({
        where: { id: account.id },
        update: { name: account.name },
        create: {
          id: account.id,
          name: account.name,
          isActive: true,
          subscriptionPlan: 'basic'
        }
      })
      console.log(`✅ Demo account created: ${account.name}`)
    }

    console.log('\n🎉 Seeding completed!')
    console.log('\nLogin credentials:')
    console.log('Admin: admin@syb.com / admin123')
    console.log('Client: hilton@example.com / hilton123')

  } catch (error) {
    console.error('❌ Error seeding users:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedUsers().catch(console.error)