import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const prisma = new PrismaClient();

const RegisterSchema = z.object({
  email: z.string().email(),
  phoneNumber: z.string().optional(),
  personalNumber: z.string().min(11).max(11), // Norwegian personal number
  bankIdToken: z.string() // BankID verification token
});

const LoginSchema = z.object({
  email: z.string().email(),
  bankIdToken: z.string()
});

export async function authRoutes(fastify: FastifyInstance) {
  // Register user with BankID verification
  fastify.post('/register', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = RegisterSchema.parse(request.body);
      
      // Verify BankID token (mock implementation)
      const bankIdVerification = await verifyBankID(body.bankIdToken);
      if (!bankIdVerification.valid) {
        return reply.status(401).send({ error: 'BankID verification failed' });
      }
      
      // Hash personal number for privacy
      const personalNumberHash = await bcrypt.hash(body.personalNumber, 12);
      
      // Calculate initial risk score (placeholder logic)
      const riskScore = await calculateRiskScore(body);
      
      const user = await prisma.user.create({
        data: {
          email: body.email,
          phoneNumber: body.phoneNumber,
          personalNumberHash,
          riskScore,
          onboardingStatus: 'PENDING'
        }
      });
      
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_ACCESS_SECRET!,
        { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
      );
      
      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
      );
      
      return reply.send({
        token,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          shieldTier: user.shieldTier,
          onboardingStatus: user.onboardingStatus
        }
      });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', details: error.errors });
      }
      throw error;
    }
  });
  
  // Login with BankID
  fastify.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = LoginSchema.parse(request.body);
      
      // Verify BankID token
      const bankIdVerification = await verifyBankID(body.bankIdToken);
      if (!bankIdVerification.valid) {
        return reply.status(401).send({ error: 'BankID verification failed' });
      }
      
      const user = await prisma.user.findUnique({
        where: { email: body.email }
      });
      
      if (!user || !user.isActive) {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }
      
      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });
      
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_ACCESS_SECRET!,
        { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
      );
      
      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
      );
      
      return reply.send({
        token,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          shieldTier: user.shieldTier,
          tokenBalance: user.tokenBalance,
          onboardingStatus: user.onboardingStatus
        }
      });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', details: error.errors });
      }
      throw error;
    }
  });
  
  // Refresh token
  fastify.post('/refresh', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { refreshToken } = request.body as { refreshToken: string };
      if (!refreshToken) {
        return reply.status(401).send({ error: 'No refresh token' });
      }
      
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as any;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });
      
      if (!user || !user.isActive) {
        return reply.status(401).send({ error: 'Invalid token' });
      }
      
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_ACCESS_SECRET!,
        { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
      );
      
      return reply.send({ token });
      
    } catch (error) {
      return reply.status(401).send({ error: 'Invalid refresh token' });
    }
  });
  
  // Logout
  fastify.post('/logout', async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({ message: 'Logged out successfully' });
  });
}

// Mock BankID verification - replace with actual BankID integration
async function verifyBankID(token: string): Promise<{ valid: boolean; personalNumber?: string }> {
  // In production, this would call the actual BankID API
  // For now, return valid for development
  if (process.env.NODE_ENV === 'development') {
    return { valid: true, personalNumber: '12345678901' };
  }
  
  // Production BankID verification would go here
  return { valid: false };
}

// Calculate user risk score based on available data
async function calculateRiskScore(userData: any): Promise<number> {
  // Placeholder risk calculation logic
  // In production, this would use ML models and external data
  let score = 0.5; // Base score
  
  // Factors that could influence risk score:
  // - Age derived from personal number
  // - Email domain
  // - Phone number patterns
  // - Historical data if user exists
  
  return Math.min(Math.max(score, 0), 1);
}