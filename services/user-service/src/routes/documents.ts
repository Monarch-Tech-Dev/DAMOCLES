import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authenticateUser } from '../middleware/auth';
import { promises as fs } from 'fs';
import path from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';

const pump = promisify(pipeline);
const prisma = new PrismaClient();

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'documents');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/heic',
  'image/heif'
];

// Ensure uploads directory exists
async function ensureUploadDir() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating upload directory:', error);
  }
}

export async function documentRoutes(fastify: FastifyInstance) {
  // Ensure upload directory exists on startup
  await ensureUploadDir();

  // Add authentication middleware
  fastify.addHook('preHandler', authenticateUser);

  // Upload document
  fastify.post('/upload', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const data = await request.file();

      if (!data) {
        return reply.status(400).send({ error: 'No file uploaded' });
      }

      // Validate file size
      const chunks: Buffer[] = [];
      for await (const chunk of data.file) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

      if (buffer.length > MAX_FILE_SIZE) {
        return reply.status(400).send({ error: 'File size exceeds 10MB limit' });
      }

      // Validate mime type
      if (!ALLOWED_MIME_TYPES.includes(data.mimetype)) {
        return reply.status(400).send({
          error: 'Invalid file type. Allowed types: PDF, PNG, JPG, JPEG, HEIC, HEIF'
        });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const ext = path.extname(data.filename);
      const fileName = `${userId}_${timestamp}_${randomString}${ext}`;
      const filePath = path.join(UPLOAD_DIR, fileName);

      // Save file
      await fs.writeFile(filePath, buffer);

      // Get metadata from query or body
      const fields = data.fields as any;
      const fileType = fields?.fileType?.value || 'other';
      const description = fields?.description?.value || '';
      const gdprRequestId = fields?.gdprRequestId?.value || null;
      const debtId = fields?.debtId?.value || null;

      // Save document record in database
      const document = await prisma.document.create({
        data: {
          userId,
          fileName: data.filename,
          fileType,
          mimeType: data.mimetype,
          fileSize: buffer.length,
          filePath: fileName, // Store relative path
          description,
          gdprRequestId,
          debtId
        }
      });

      return reply.send({
        document: {
          id: document.id,
          fileName: document.fileName,
          fileType: document.fileType,
          fileSize: document.fileSize,
          uploadedAt: document.uploadedAt
        }
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      return reply.status(500).send({ error: 'Failed to upload document' });
    }
  });

  // Get user's documents
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const query = request.query as any;

      const where: any = { userId };

      if (query.gdprRequestId) {
        where.gdprRequestId = query.gdprRequestId;
      }
      if (query.debtId) {
        where.debtId = query.debtId;
      }
      if (query.fileType) {
        where.fileType = query.fileType;
      }

      const documents = await prisma.document.findMany({
        where,
        orderBy: { uploadedAt: 'desc' },
        select: {
          id: true,
          fileName: true,
          fileType: true,
          mimeType: true,
          fileSize: true,
          description: true,
          uploadedAt: true,
          gdprRequestId: true,
          debtId: true
        }
      });

      return reply.send({ documents });
    } catch (error) {
      console.error('Error fetching documents:', error);
      return reply.status(500).send({ error: 'Failed to fetch documents' });
    }
  });

  // Download document
  fastify.get('/:id/download', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const { id } = request.params as { id: string };

      const document = await prisma.document.findUnique({
        where: { id }
      });

      if (!document || document.userId !== userId) {
        return reply.status(404).send({ error: 'Document not found' });
      }

      const filePath = path.join(UPLOAD_DIR, document.filePath);

      try {
        await fs.access(filePath);
      } catch {
        return reply.status(404).send({ error: 'File not found on disk' });
      }

      return reply
        .type(document.mimeType)
        .header('Content-Disposition', `attachment; filename="${document.fileName}"`)
        .send(await fs.readFile(filePath));
    } catch (error) {
      console.error('Error downloading document:', error);
      return reply.status(500).send({ error: 'Failed to download document' });
    }
  });

  // Delete document
  fastify.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const { id } = request.params as { id: string };

      const document = await prisma.document.findUnique({
        where: { id }
      });

      if (!document || document.userId !== userId) {
        return reply.status(404).send({ error: 'Document not found' });
      }

      // Delete file from disk
      const filePath = path.join(UPLOAD_DIR, document.filePath);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.warn('File not found on disk, continuing with database deletion');
      }

      // Delete from database
      await prisma.document.delete({
        where: { id }
      });

      return reply.send({ message: 'Document deleted successfully' });
    } catch (error) {
      console.error('Error deleting document:', error);
      return reply.status(500).send({ error: 'Failed to delete document' });
    }
  });
}
