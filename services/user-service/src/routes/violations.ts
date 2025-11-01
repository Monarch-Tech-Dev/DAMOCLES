import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Violation Review Routes
 *
 * Enables human-in-the-loop feedback for improving violation detection algorithm
 */
export default async function violationRoutes(fastify: FastifyInstance) {

  // Submit a review for a detected violation
  fastify.post('/api/violations/:violationId/reviews', async (request, reply) => {
    const { violationId } = request.params as { violationId: string };
    const {
      reviewerEmail,
      reviewType,
      isCorrect,
      shouldBeDetected,
      correctType,
      correctSeverity,
      feedback,
      confidenceRating,
      improvementSuggestion,
      useForTraining,
      reviewDuration
    } = request.body as {
      reviewerEmail?: string;
      reviewType: 'human_validation' | 'user_feedback' | 'expert_audit';
      isCorrect: boolean;
      shouldBeDetected?: boolean;
      correctType?: string;
      correctSeverity?: string;
      feedback?: string;
      confidenceRating?: number;
      improvementSuggestion?: string;
      useForTraining?: boolean;
      reviewDuration?: number;
    };

    try {
      // Verify violation exists
      const violation = await prisma.violation.findUnique({
        where: { id: violationId }
      });

      if (!violation) {
        return reply.code(404).send({
          success: false,
          error: 'Violation not found'
        });
      }

      // Create review
      const review = await prisma.violationReview.create({
        data: {
          violationId,
          reviewerEmail,
          reviewType,
          isCorrect,
          shouldBeDetected: shouldBeDetected !== undefined ? shouldBeDetected : true,
          correctType,
          correctSeverity,
          feedback,
          confidenceRating,
          improvementSuggestion,
          useForTraining: useForTraining !== undefined ? useForTraining : true,
          reviewDuration
        }
      });

      // Update violation status based on review
      let newStatus = violation.status;
      if (reviewType === 'expert_audit') {
        newStatus = isCorrect ? 'VERIFIED' : 'DISPUTED';

        await prisma.violation.update({
          where: { id: violationId },
          data: { status: newStatus }
        });
      }

      return reply.code(201).send({
        success: true,
        review,
        violationStatusUpdated: newStatus !== violation.status,
        newStatus
      });

    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to submit review'
      });
    }
  });

  // Get all reviews for a violation
  fastify.get('/api/violations/:violationId/reviews', async (request, reply) => {
    const { violationId } = request.params as { violationId: string };

    try {
      const reviews = await prisma.violationReview.findMany({
        where: { violationId },
        orderBy: { reviewedAt: 'desc' }
      });

      return reply.send({
        success: true,
        count: reviews.length,
        reviews
      });

    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch reviews'
      });
    }
  });

  // Get validation metrics (for monitoring algorithm performance)
  fastify.get('/api/violations/validation-metrics', async (request, reply) => {
    const { dateFrom, dateTo, reviewType } = request.query as {
      dateFrom?: string;
      dateTo?: string;
      reviewType?: string;
    };

    try {
      const whereClause: any = {};

      if (dateFrom || dateTo) {
        whereClause.reviewedAt = {};
        if (dateFrom) whereClause.reviewedAt.gte = new Date(dateFrom);
        if (dateTo) whereClause.reviewedAt.lte = new Date(dateTo);
      }

      if (reviewType) {
        whereClause.reviewType = reviewType;
      }

      const reviews = await prisma.violationReview.findMany({
        where: whereClause,
        include: {
          violation: {
            select: {
              type: true,
              severity: true,
              confidence: true
            }
          }
        }
      });

      // Calculate metrics
      const truePositives = reviews.filter(r => r.isCorrect).length;
      const falsePositives = reviews.filter(r => !r.isCorrect).length;
      const totalReviewed = reviews.length;

      const precision = totalReviewed > 0 ? truePositives / totalReviewed : 0;

      // Per-violation-type breakdown
      const byType: Record<string, any> = {};
      reviews.forEach(review => {
        const type = review.violation.type;
        if (!byType[type]) {
          byType[type] = { truePositives: 0, falsePositives: 0, total: 0 };
        }
        byType[type].total++;
        if (review.isCorrect) {
          byType[type].truePositives++;
        } else {
          byType[type].falsePositives++;
        }
      });

      Object.keys(byType).forEach(type => {
        const data = byType[type];
        data.precision = data.total > 0 ? data.truePositives / data.total : 0;
      });

      // Confidence calibration
      const confidenceBins = {
        '0.0-0.5': { correct: 0, total: 0 },
        '0.5-0.7': { correct: 0, total: 0 },
        '0.7-0.85': { correct: 0, total: 0 },
        '0.85-1.0': { correct: 0, total: 0 }
      };

      reviews.forEach(review => {
        const conf = review.violation.confidence;
        let bin: keyof typeof confidenceBins;
        if (conf < 0.5) bin = '0.0-0.5';
        else if (conf < 0.7) bin = '0.5-0.7';
        else if (conf < 0.85) bin = '0.7-0.85';
        else bin = '0.85-1.0';

        confidenceBins[bin].total++;
        if (review.isCorrect) {
          confidenceBins[bin].correct++;
        }
      });

      Object.keys(confidenceBins).forEach((bin) => {
        const data = confidenceBins[bin as keyof typeof confidenceBins];
        (data as any).accuracy = data.total > 0 ? data.correct / data.total : 0;
      });

      return reply.send({
        success: true,
        metrics: {
          overall: {
            totalReviewed,
            truePositives,
            falsePositives,
            precision,
            accuracyRate: precision // For reviewed detections
          },
          byViolationType: byType,
          confidenceCalibration: confidenceBins,
          timeRange: {
            from: dateFrom,
            to: dateTo
          }
        }
      });

    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to calculate validation metrics'
      });
    }
  });

  // Get violations pending review (for review queue)
  fastify.get('/api/violations/pending-review', async (request, reply) => {
    const { limit = '50', confidence, type } = request.query as {
      limit?: string;
      confidence?: string; // 'low' (<0.7), 'medium' (0.7-0.85), 'high' (>0.85)
      type?: string;
    };

    try {
      const whereClause: any = {
        status: 'PENDING'
      };

      // Filter by violation type
      if (type) {
        whereClause.type = type;
      }

      // Filter by confidence level
      if (confidence) {
        if (confidence === 'low') {
          whereClause.confidence = { lt: 0.7 };
        } else if (confidence === 'medium') {
          whereClause.confidence = { gte: 0.7, lt: 0.85 };
        } else if (confidence === 'high') {
          whereClause.confidence = { gte: 0.85 };
        }
      }

      const violations = await prisma.violation.findMany({
        where: whereClause,
        take: parseInt(limit),
        orderBy: [
          { confidence: 'asc' }, // Review low-confidence first
          { createdAt: 'desc' }
        ],
        include: {
          gdprRequest: {
            select: {
              id: true,
              status: true,
              responseText: true
            }
          },
          creditor: {
            select: {
              id: true,
              name: true,
              type: true
            }
          },
          reviews: {
            select: {
              id: true,
              reviewType: true,
              isCorrect: true,
              reviewedAt: true
            }
          }
        }
      });

      // Filter out violations that already have reviews
      const needsReview = violations.filter(v => v.reviews.length === 0);

      return reply.send({
        success: true,
        count: needsReview.length,
        violations: needsReview
      });

    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch pending violations'
      });
    }
  });

  // Export training data for ML model improvement
  fastify.get('/api/violations/export-training-data', async (request, reply) => {
    const { format = 'json' } = request.query as { format?: 'json' | 'csv' };

    try {
      const reviews = await prisma.violationReview.findMany({
        where: {
          useForTraining: true
        },
        include: {
          violation: {
            include: {
              gdprRequest: {
                select: {
                  responseText: true,
                  requestText: true
                }
              },
              creditor: {
                select: {
                  name: true,
                  type: true
                }
              }
            }
          }
        }
      });

      const trainingData = reviews.map(review => ({
        // Input features
        response_content: review.violation.gdprRequest?.responseText || '',
        creditor_type: review.violation.creditor.type,
        detected_type: review.violation.type,
        detected_severity: review.violation.severity,
        detected_confidence: review.violation.confidence,
        evidence: review.violation.evidence,

        // Ground truth labels
        is_correct: review.isCorrect,
        should_be_detected: review.shouldBeDetected,
        correct_type: review.correctType || review.violation.type,
        correct_severity: review.correctSeverity || review.violation.severity,

        // Metadata
        reviewer_confidence: review.confidenceRating,
        review_type: review.reviewType,
        feedback: review.feedback,
        improvement_suggestion: review.improvementSuggestion
      }));

      if (format === 'csv') {
        // Convert to CSV
        const headers = Object.keys(trainingData[0] || {});
        const csvRows = [headers.join(',')];

        trainingData.forEach(row => {
          const values = headers.map(header => {
            const value = row[header as keyof typeof row];
            return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
          });
          csvRows.push(values.join(','));
        });

        const csv = csvRows.join('\n');

        reply.header('Content-Type', 'text/csv');
        reply.header('Content-Disposition', 'attachment; filename=training_data.csv');
        return reply.send(csv);
      }

      // Default: JSON format
      return reply.send({
        success: true,
        count: trainingData.length,
        trainingData
      });

    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to export training data'
      });
    }
  });
}
