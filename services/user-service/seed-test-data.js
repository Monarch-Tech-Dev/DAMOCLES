const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function seedTestData() {
  try {
    console.log('Finding or creating test creditor...')

    // Find or create test creditor
    let creditor = await prisma.creditor.findFirst({
      where: {
        organizationNumber: '123456789'
      }
    })

    if (!creditor) {
      creditor = await prisma.creditor.create({
        data: {
          name: 'Lindorff AS',
          organizationNumber: '123456789',
          type: 'inkasso',
          privacyEmail: 'gdpr@lindorff.no',
          violationScore: 35.5,
          totalViolations: 12,
          averageSettlementRate: 0.65,
          isActive: true
        }
      })
      console.log('Created creditor:', creditor.id, '-', creditor.name)
    } else {
      console.log('Found existing creditor:', creditor.id, '-', creditor.name)
    }

    // Get the test user we created earlier
    const user = await prisma.user.findFirst({
      where: {
        email: 'test@example.com'
      }
    })

    if (!user) {
      console.log('Test user not found, creating one...')
      const newUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          passwordHash: await bcrypt.hash('password123', 10), // Real hash
          phoneNumber: '+4712345678',
          shieldTier: 'Bronze Shield',
          onboardingStatus: 'COMPLETED',
          isActive: true
        }
      })
      console.log('Created user:', newUser.id, '-', newUser.name)

      // Create debt for the new user
      const debt = await prisma.debt.create({
        data: {
          userId: newUser.id,
          creditorId: creditor.id,
          originalAmount: 15000.0,
          currentAmount: 18500.0,
          status: 'active',
          accountNumber: 'AC12345678',
          description: 'Unpaid invoice from 2023'
        }
      })

      console.log('Created debt:', debt.id, 'Amount:', debt.currentAmount)

    } else {
      console.log('Found existing user:', user.id, '-', user.name)

      // Check if debt already exists
      const existingDebt = await prisma.debt.findFirst({
        where: {
          userId: user.id,
          creditorId: creditor.id,
          accountNumber: 'AC12345678'
        }
      })

      if (!existingDebt) {
        // Create debt for existing user
        const debt = await prisma.debt.create({
          data: {
            userId: user.id,
            creditorId: creditor.id,
            originalAmount: 15000.0,
            currentAmount: 18500.0,
            status: 'active',
            accountNumber: 'AC12345678',
            description: 'Unpaid invoice from 2023'
          }
        })

        console.log('Created debt:', debt.id, 'Amount:', debt.currentAmount)
      } else {
        console.log('Debt already exists:', existingDebt.id, 'Amount:', existingDebt.currentAmount)
      }
    }

    console.log('✅ Test data seeded successfully!')

  } catch (error) {
    console.error('Error seeding data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedTestData()