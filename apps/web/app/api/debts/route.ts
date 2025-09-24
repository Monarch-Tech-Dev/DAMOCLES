import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const creditorId = searchParams.get('creditorId')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = { userId: user.id }
    if (status) where.status = status
    if (creditorId) where.creditorId = creditorId

    const debts = await prisma.debt.findMany({
      where,
      include: {
        creditor: true
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' }
    })

    const formattedDebts = debts.map(debt => ({
      id: debt.id,
      userId: debt.userId,
      creditorId: debt.creditorId,
      creditor: debt.creditor,
      originalAmount: debt.originalAmount,
      currentAmount: debt.currentAmount,
      status: debt.status,
      dueDate: debt.dueDate?.toISOString(),
      accountNumber: debt.accountNumber,
      notes: debt.notes,
      createdAt: debt.createdAt.toISOString(),
      updatedAt: debt.updatedAt.toISOString()
    }))

    return NextResponse.json({ data: formattedDebts })
  } catch (error) {
    console.error('Debts fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const {
      creditorId,
      originalAmount,
      currentAmount,
      status = 'active',
      dueDate,
      accountNumber,
      notes
    } = body

    if (!creditorId || !originalAmount || !currentAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const debt = await prisma.debt.create({
      data: {
        userId: user.id,
        creditorId,
        originalAmount,
        currentAmount,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
        accountNumber,
        notes
      },
      include: {
        creditor: true
      }
    })

    const formattedDebt = {
      id: debt.id,
      userId: debt.userId,
      creditorId: debt.creditorId,
      creditor: debt.creditor,
      originalAmount: debt.originalAmount,
      currentAmount: debt.currentAmount,
      status: debt.status,
      dueDate: debt.dueDate?.toISOString(),
      accountNumber: debt.accountNumber,
      notes: debt.notes,
      createdAt: debt.createdAt.toISOString(),
      updatedAt: debt.updatedAt.toISOString()
    }

    return NextResponse.json({ data: formattedDebt }, { status: 201 })
  } catch (error) {
    console.error('Debt creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}