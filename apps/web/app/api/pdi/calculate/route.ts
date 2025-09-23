import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

function calculatePDI(data: {
  monthlyIncome: number
  totalDebt: number
  monthlyPayments: number
  overdueDebts: number
  creditorCount: number
}) {
  const { monthlyIncome, totalDebt, monthlyPayments, overdueDebts, creditorCount } = data

  // Debt-to-Income Ratio (0-40 points)
  const debtToIncomeRatio = totalDebt / (monthlyIncome * 12)
  const debtToIncomeScore = Math.min(debtToIncomeRatio * 100, 40)

  // Payment-to-Income Ratio (0-20 points)
  const paymentToIncomeRatio = monthlyPayments / monthlyIncome
  const paymentToIncomeScore = Math.min(paymentToIncomeRatio * 100, 20)

  // Overdue Debt Factor (0-20 points)
  const overdueScore = Math.min((overdueDebts / totalDebt) * 100, 20)

  // Creditor Count Factor (0-10 points)
  const creditorScore = Math.min(creditorCount * 2, 10)

  // Collection Activity (0-10 points) - simplified for now
  const collectionScore = overdueScore > 10 ? 10 : overdueScore / 2

  const totalScore = debtToIncomeScore + paymentToIncomeScore + overdueScore + creditorScore + collectionScore

  let riskLevel: 'low' | 'medium' | 'high' | 'critical'
  if (totalScore <= 25) riskLevel = 'low'
  else if (totalScore <= 50) riskLevel = 'medium'
  else if (totalScore <= 75) riskLevel = 'high'
  else riskLevel = 'critical'

  const recommendations: string[] = []
  if (debtToIncomeRatio > 0.4) recommendations.push('Consider debt consolidation')
  if (paymentToIncomeRatio > 0.3) recommendations.push('Negotiate payment plans with creditors')
  if (overdueScore > 15) recommendations.push('Prioritize overdue payments')
  if (creditorCount > 5) recommendations.push('Focus on reducing number of creditors')

  return {
    score: Math.round(totalScore),
    riskLevel,
    factors: {
      debtToIncome: Math.round(debtToIncomeRatio * 100) / 100,
      totalDebtAmount: totalDebt,
      numberOfCreditors: creditorCount,
      overduePercentage: Math.round((overdueDebts / totalDebt) * 100),
      collectionActivity: Math.round(collectionScore)
    },
    recommendations
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { monthlyIncome, totalDebt, monthlyPayments, overdueDebts, creditorCount } = body

    if (!monthlyIncome || !totalDebt || !monthlyPayments || overdueDebts === undefined || !creditorCount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const calculation = calculatePDI({
      monthlyIncome,
      totalDebt,
      monthlyPayments,
      overdueDebts,
      creditorCount
    })

    const pdiRecord = await prisma.pDICalculation.create({
      data: {
        userId: user.id,
        score: calculation.score,
        riskLevel: calculation.riskLevel,
        factors: calculation.factors,
        recommendations: calculation.recommendations
      }
    })

    return NextResponse.json({
      data: {
        id: pdiRecord.id,
        userId: pdiRecord.userId,
        score: pdiRecord.score,
        riskLevel: pdiRecord.riskLevel,
        factors: pdiRecord.factors,
        recommendations: pdiRecord.recommendations,
        calculatedAt: pdiRecord.createdAt.toISOString()
      }
    })
  } catch (error) {
    console.error('PDI calculation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}