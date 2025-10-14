import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
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
      where: { email: session.user.email },
      include: {
        subscription: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscription: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const userResponse = {
      ...user,
      subscription: user.subscription ? {
        tier: user.subscription.tier,
        status: user.subscription.status,
        expiresAt: user.subscription.expiresAt.toISOString()
      } : undefined,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    }

    return NextResponse.json({ data: userResponse })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name } = body

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { name },
      include: {
        subscription: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscription: true,
        createdAt: true,
        updatedAt: true
      }
    })

    const userResponse = {
      ...user,
      subscription: user.subscription ? {
        tier: user.subscription.tier,
        status: user.subscription.status,
        expiresAt: user.subscription.expiresAt.toISOString()
      } : undefined,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    }

    return NextResponse.json({ data: userResponse })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}