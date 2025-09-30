const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function clearTestUser() {
  try {
    // Delete test user with all related data
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    })

    if (user) {
      // Delete related debts first
      await prisma.debt.deleteMany({
        where: { userId: user.id }
      })

      // Delete the user
      await prisma.user.delete({
        where: { id: user.id }
      })

      console.log('✅ Test user and related data deleted')
    } else {
      console.log('ℹ️ No test user found')
    }
  } catch (error) {
    console.error('Error clearing test user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

clearTestUser()