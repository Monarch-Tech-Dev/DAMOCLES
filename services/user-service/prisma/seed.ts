import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Seed Norwegian creditors
  const creditors = [
    {
      name: 'DNB Bank',
      organizationNumber: '984851006',
      type: 'bank',
      privacyEmail: 'personvern@dnb.no',
      violationScore: 15,
      totalViolations: 3,
      averageSettlementRate: 0.65
    },
    {
      name: 'Nordea Bank',
      organizationNumber: '920058817',
      type: 'bank',
      privacyEmail: 'personvern@nordea.com',
      violationScore: 22,
      totalViolations: 5,
      averageSettlementRate: 0.58
    },
    {
      name: 'Sparebank 1',
      organizationNumber: '937895321',
      type: 'bank',
      privacyEmail: 'personvern@sparebank1.no',
      violationScore: 8,
      totalViolations: 1,
      averageSettlementRate: 0.72
    },
    {
      name: 'Lindorff',
      organizationNumber: '982463718',
      type: 'inkasso',
      privacyEmail: 'personvern@lindorff.no',
      violationScore: 45,
      totalViolations: 12,
      averageSettlementRate: 0.35
    },
    {
      name: 'B2 Holding',
      organizationNumber: '996537809',
      type: 'inkasso',
      privacyEmail: 'personvern@b2holding.no',
      violationScore: 52,
      totalViolations: 18,
      averageSettlementRate: 0.28
    },
    {
      name: 'Kredinor',
      organizationNumber: '929831529',
      type: 'inkasso',
      privacyEmail: 'personvern@kredinor.no',
      violationScore: 38,
      totalViolations: 9,
      averageSettlementRate: 0.42
    },
    {
      name: 'Intrum',
      organizationNumber: '982542315',
      type: 'inkasso',
      privacyEmail: 'personvern@intrum.no',
      violationScore: 41,
      totalViolations: 11,
      averageSettlementRate: 0.38
    },
    {
      name: 'Bank Norwegian',
      organizationNumber: '991455848',
      type: 'bank',
      privacyEmail: 'personvern@banknorwegian.no',
      violationScore: 19,
      totalViolations: 4,
      averageSettlementRate: 0.61
    },
    {
      name: 'Santander Consumer Bank',
      organizationNumber: '956882953',
      type: 'bank',
      privacyEmail: 'personvern@santander.no',
      violationScore: 26,
      totalViolations: 6,
      averageSettlementRate: 0.54
    },
    {
      name: 'Compello',
      organizationNumber: '982543827',
      type: 'inkasso',
      privacyEmail: 'personvern@compello.com',
      violationScore: 33,
      totalViolations: 8,
      averageSettlementRate: 0.46
    }
  ]

  for (const creditorData of creditors) {
    const existingCreditor = await prisma.creditor.findFirst({
      where: { organizationNumber: creditorData.organizationNumber }
    })

    if (!existingCreditor) {
      await prisma.creditor.create({
        data: creditorData
      })
      console.log(`Created creditor: ${creditorData.name}`)
    } else {
      console.log(`Creditor ${creditorData.name} already exists`)
    }
  }

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })