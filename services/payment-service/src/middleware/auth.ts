import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends FastifyRequest {
  user: {
    userId: string;
    email: string;
    role?: string;
  };
}

/**
 * Middleware to authenticate any user with a valid JWT token
 */
export async function authenticateUser(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authorization = request.headers.authorization;

    if (!authorization) {
      return reply.status(401).send({
        success: false,
        error: 'No authorization header'
      });
    }

    const token = authorization.replace('Bearer ', '');

    if (!token) {
      return reply.status(401).send({
        success: false,
        error: 'No token provided'
      });
    }

    const jwtSecret = process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET;

    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, jwtSecret) as any;

    // Add user info to request
    (request as any).user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role || 'user'
    };

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return reply.status(401).send({
        success: false,
        error: 'Invalid token'
      });
    }

    if (error instanceof jwt.TokenExpiredError) {
      return reply.status(401).send({
        success: false,
        error: 'Token expired'
      });
    }

    return reply.status(500).send({
      success: false,
      error: 'Authentication failed'
    });
  }
}

/**
 * Middleware to authenticate admin users only
 * Must be used after authenticateUser middleware
 */
export async function authenticateAdmin(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = (request as any).user;

  if (!user) {
    return reply.status(401).send({
      success: false,
      error: 'Authentication required'
    });
  }

  // Check if user has admin role
  if (user.role !== 'admin') {
    return reply.status(403).send({
      success: false,
      error: 'Admin access required'
    });
  }
}

/**
 * Helper to check if request has valid API key for internal service-to-service calls
 */
export async function authenticateServiceKey(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const apiKey = request.headers['x-api-key'] as string;
  const configuredKey = process.env.INTERNAL_API_KEY;

  if (!configuredKey) {
    return reply.status(500).send({
      success: false,
      error: 'Internal API key not configured'
    });
  }

  if (!apiKey || apiKey !== configuredKey) {
    return reply.status(401).send({
      success: false,
      error: 'Invalid API key'
    });
  }
}
